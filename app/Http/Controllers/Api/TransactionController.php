<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Refund;
use App\Models\RefundItem;
use App\Models\Sale;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class TransactionController extends Controller
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    public function index(Request $request)
    {
        $query = Sale::with(['user', 'customer', 'payments.paymentMethod']);

        if ($request->filled('search')) {
            $query->where('transaction_number', 'like', "%{$request->search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('transaction_date', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59'
            ]);
        }

        return response()->json($query->latest()->paginate($request->get('per_page', 20)));
    }

    public function show(Sale $sale)
    {
        return response()->json($sale->load(['user', 'customer', 'items.item', 'payments.paymentMethod', 'refunds.items']));
    }

    public function cancel(Request $request, Sale $sale)
    {
        if ($sale->status === 'CANCELLED') {
            return response()->json(['message' => 'Transaksi sudah dibatalkan sebelumnya.'], 422);
        }

        return DB::transaction(function () use ($sale, $request) {
            // Restore stock if it was completed
            if ($sale->status === 'COMPLETED') {
                foreach ($sale->items as $saleItem) {
                    if ($saleItem->item && $saleItem->item->track_stock) {
                        $this->inventoryService->recordMovement(
                            $saleItem->item,
                            'RETURN',
                            $saleItem->quantity,
                            Sale::class,
                            $sale->id,
                            "Pembatalan Transaksi #{$sale->transaction_number}"
                        );
                    }
                }
            }

            $sale->update(['status' => 'CANCELLED', 'notes' => $request->get('reason', 'Pembatalan transaksi')]);

            return response()->json(['message' => 'Transaksi berhasil dibatalkan', 'sale' => $sale]);
        });
    }

    public function refund(Request $request, Sale $sale)
    {
        $validated = $request->validate([
            'reason' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.sale_item_id' => 'required|exists:sale_items,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
        ]);

        return DB::transaction(function () use ($sale, $validated, $request) {
            $prefix = 'RFD';
            $refundNumber = $prefix . '-' . now()->format('YmdHis');
            $totalRefundAmount = 0;

            $refund = Refund::create([
                'refund_number' => $refundNumber,
                'sale_id' => $sale->id,
                'user_id' => $request->user()->id,
                'amount' => 0,
                'reason' => $validated['reason'],
            ]);

            foreach ($validated['items'] as $itemData) {
                $saleItem = $sale->items()->where('id', $itemData['sale_item_id'])->firstOrFail();
                $qty = floatval($itemData['quantity']);
                $itemAmount = $qty * $saleItem->unit_price;

                RefundItem::create([
                    'refund_id' => $refund->id,
                    'sale_item_id' => $saleItem->id,
                    'quantity' => $qty,
                    'amount' => $itemAmount,
                ]);

                $totalRefundAmount += $itemAmount;

                // Return stock
                if ($saleItem->item && $saleItem->item->track_stock) {
                    $this->inventoryService->recordMovement(
                        $saleItem->item,
                        'RETURN',
                        $qty,
                        Refund::class,
                        $refund->id,
                        "Refund #{$refundNumber}"
                    );
                }
            }

            $refund->update(['amount' => $totalRefundAmount]);
            $sale->update(['status' => 'REFUNDED']);

            return response()->json(['message' => 'Refund berhasil diproses', 'refund' => $refund]);
        });
    }
}
