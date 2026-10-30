<?php

namespace App\Services;

use App\Models\BusinessSetting;
use App\Models\CashierShift;
use App\Models\Customer;
use App\Models\Item;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TransactionService
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    /**
     * Process checkout in a strict database transaction.
     */
    public function checkout(array $data, int $userId): Sale
    {
        return DB::transaction(function () use ($data, $userId) {
            $activeShift = CashierShift::where('user_id', $userId)
                ->where('status', 'OPEN')
                ->lockForUpdate()
                ->first();

            if (! $activeShift) {
                throw ValidationException::withMessages([
                    'shift' => 'Buka shift kasir terlebih dahulu sebelum membuat transaksi.',
                ]);
            }

            // Generate unique transaction number
            $prefix = BusinessSetting::getByKey('invoice_prefix', 'INV');
            $dateStr = now()->format('Ymd');
            $count = Sale::whereDate('created_at', now())->count() + 1;
            $transactionNumber = sprintf('%s-%s-%04d', $prefix, $dateStr, $count);

            $itemsData = $data['items'] ?? [];
            if (empty($itemsData)) {
                throw ValidationException::withMessages([
                    'items' => 'Keranjang pesanan tidak boleh kosong.',
                ]);
            }

            // Calculate Totals
            $subtotal = 0;
            $preparedItems = [];

            foreach ($itemsData as $cartItem) {
                $item = Item::findOrFail($cartItem['item_id']);

                $quantity = floatval($cartItem['quantity']);
                $unitPrice = floatval($cartItem['unit_price'] ?? $item->selling_price);
                $itemDiscount = floatval($cartItem['discount'] ?? 0);
                $itemTax = floatval($cartItem['tax'] ?? 0);

                $itemSubtotal = ($quantity * $unitPrice) - $itemDiscount;
                $itemTotal = $itemSubtotal + $itemTax;

                $subtotal += $itemSubtotal;

                $preparedItems[] = [
                    'item' => $item,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'discount' => $itemDiscount,
                    'tax' => $itemTax,
                    'subtotal' => $itemSubtotal,
                    'total' => $itemTotal,
                ];
            }

            $discountTotal = floatval($data['discount'] ?? 0);
            $taxTotal = floatval($data['tax'] ?? 0);
            $grandTotal = max(0, ($subtotal - $discountTotal) + $taxTotal);

            $paidAmount = floatval($data['paid_amount'] ?? 0);
            if ($paidAmount < $grandTotal && ($data['status'] ?? 'COMPLETED') === 'COMPLETED') {
                throw ValidationException::withMessages([
                    'paid_amount' => 'Jumlah pembayaran kurang dari total transaksi.',
                ]);
            }

            $changeAmount = max(0, $paidAmount - $grandTotal);

            // Create Sale record
            $sale = Sale::create([
                'transaction_number' => $transactionNumber,
                'user_id' => $userId,
                'customer_id' => $data['customer_id'] ?? Customer::where('name', 'Walk-in Customer')->value('id'),
                'shift_id' => $activeShift->id,
                'subtotal' => $subtotal,
                'discount' => $discountTotal,
                'tax' => $taxTotal,
                'total' => $grandTotal,
                'paid_amount' => $paidAmount,
                'change_amount' => $changeAmount,
                'status' => $data['status'] ?? 'COMPLETED',
                'transaction_date' => now(),
                'notes' => $data['notes'] ?? null,
            ]);

            // Save Sale Items & Deduct Stock
            foreach ($preparedItems as $prep) {
                $item = $prep['item'];

                SaleItem::create([
                    'sale_id' => $sale->id,
                    'item_id' => $item->id,
                    'item_name' => $item->name, // Snapshot
                    'purchase_price' => $item->purchase_price, // Snapshot cost
                    'quantity' => $prep['quantity'],
                    'unit_price' => $prep['unit_price'],
                    'discount' => $prep['discount'],
                    'tax' => $prep['tax'],
                    'subtotal' => $prep['subtotal'],
                    'total' => $prep['total'],
                ]);

                // Deduct stock if completed & stock tracking enabled
                if ($sale->status === 'COMPLETED' && $item->track_stock) {
                    $this->inventoryService->recordMovement(
                        $item,
                        'SALE',
                        $prep['quantity'],
                        Sale::class,
                        $sale->id,
                        "Sale #{$sale->transaction_number}"
                    );
                }
            }

            // Save Payment Records
            if (! empty($data['payments'])) {
                $paymentTotal = collect($data['payments'])->sum(
                    fn (array $payment): float => (float) $payment['amount']
                );

                if (abs($paymentTotal - $grandTotal) > 0.01) {
                    throw ValidationException::withMessages([
                        'payments' => 'Total pembayaran harus sama dengan total transaksi.',
                    ]);
                }

                foreach ($data['payments'] as $pay) {
                    Payment::create([
                        'sale_id' => $sale->id,
                        'payment_method_id' => $pay['payment_method_id'],
                        'amount' => $pay['amount'],
                        'reference' => $pay['reference'] ?? null,
                    ]);
                }
            } elseif ($sale->status === 'COMPLETED') {
                // Default Cash payment if none specified
                $defaultMethod = PaymentMethod::where('code', 'CASH')->first();
                if ($defaultMethod) {
                    Payment::create([
                        'sale_id' => $sale->id,
                        'payment_method_id' => $defaultMethod->id,
                        'amount' => $grandTotal,
                        'reference' => null,
                    ]);
                }
            }

            return $sale->load(['items', 'payments', 'customer', 'user']);
        });
    }
}
