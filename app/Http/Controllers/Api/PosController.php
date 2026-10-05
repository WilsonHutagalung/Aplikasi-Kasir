<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\Sale;
use App\Services\TransactionService;
use Illuminate\Http\Request;

class PosController extends Controller
{
    protected TransactionService $transactionService;

    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }

    public function items(Request $request)
    {
        $query = Item::with(['category', 'unit'])->where('is_active', true);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        return response()->json($query->orderBy('name', 'asc')->get());
    }

    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'discount' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'paid_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:items,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'nullable|numeric|min:0',
            'items.*.discount' => 'nullable|numeric|min:0',
            'items.*.tax' => 'nullable|numeric|min:0',
            'payments' => 'nullable|array',
            'payments.*.payment_method_id' => 'required|exists:payment_methods,id',
            'payments.*.amount' => 'required|numeric|min:0',
            'payments.*.reference' => 'nullable|string',
        ]);

        $validated['status'] = 'COMPLETED';
        $sale = $this->transactionService->checkout($validated, $request->user()->id);

        return response()->json([
            'message' => 'Transaksi berhasil',
            'sale' => $sale,
        ], 201);
    }

    public function hold(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'discount' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'paid_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:items,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'nullable|numeric|min:0',
        ]);

        $validated['status'] = 'HELD';
        $validated['paid_amount'] = 0;
        $sale = $this->transactionService->checkout($validated, $request->user()->id);

        return response()->json([
            'message' => 'Transaksi berhasil di-hold',
            'sale' => $sale,
        ], 201);
    }

    public function getHeld()
    {
        $held = Sale::with(['items.item', 'customer'])
            ->where('status', 'HELD')
            ->latest()
            ->get();

        return response()->json($held);
    }

    public function deleteHeld(Sale $sale)
    {
        if ($sale->status !== 'HELD') {
            return response()->json(['message' => 'Hanya transaksi HELD yang dapat dihapus.'], 422);
        }

        $sale->delete();
        return response()->json(['message' => 'Hold transaksi berhasil dihapus']);
    }
}
