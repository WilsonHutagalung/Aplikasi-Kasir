<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryMovement;
use App\Models\Item;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class InventoryController extends Controller
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    public function index(Request $request)
    {
        $query = Item::with(['category', 'unit'])->where('type', 'PRODUCT');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        if ($request->boolean('low_stock')) {
            $query->whereColumn('stock', '<=', 'minimum_stock');
        }

        return response()->json($query->latest()->paginate($request->get('per_page', 20)));
    }

    public function movements(Request $request)
    {
        $query = InventoryMovement::with(['item']);

        if ($request->filled('item_id')) {
            $query->where('item_id', $request->item_id);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        return response()->json($query->latest()->paginate($request->get('per_page', 30)));
    }

    public function adjustment(Request $request)
    {
        $validated = $request->validate([
            'item_id' => 'required|exists:items,id',
            'type' => ['required', Rule::in(['ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'DAMAGE'])],
            'quantity' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string',
        ]);

        $item = Item::findOrFail($validated['item_id']);
        $movement = $this->inventoryService->recordMovement(
            $item,
            $validated['type'],
            $validated['quantity'],
            null,
            null,
            $validated['notes'] ?? 'Stock Adjustment'
        );

        return response()->json(['message' => 'Penyesuaian stok berhasil', 'movement' => $movement]);
    }
}
