<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryMovement;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ItemController extends Controller
{
    public function index(Request $request)
    {
        $query = Item::with(['category', 'unit']);

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

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        return response()->json($query->latest()->paginate($request->get('per_page', 50)));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => ['required', Rule::in(['PRODUCT', 'SERVICE'])],
            'sku' => 'nullable|string|unique:items,sku',
            'barcode' => 'nullable|string|unique:items,barcode',
            'category_id' => 'nullable|exists:categories,id',
            'unit_id' => 'nullable|exists:units,id',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'minimum_stock' => 'integer|min:0',
            'track_stock' => 'boolean',
            'stock' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'is_active' => 'boolean',
        ]);

        $initialStock = floatval($request->get('stock', 0));
        $validated['track_stock'] = $validated['type'] === 'PRODUCT' ? ($request->get('track_stock', true)) : false;

        $item = new Item($validated);
        if (blank($item->sku)) {
            $item->sku = Item::generateSku($item);
        }
        if (blank($item->barcode)) {
            $item->barcode = Item::generateBarcode($item);
        }

        if ($request->hasFile('image')) {
            $item->image = $request->file('image')->store('items', 'public');
        }

        $item->save();

        if ($item->track_stock && $initialStock > 0) {
            InventoryMovement::create([
                'item_id' => $item->id,
                'type' => 'OPENING',
                'quantity' => $initialStock,
                'notes' => 'Stok awal produk',
            ]);
        }

        return response()->json($item->load(['category', 'unit']), 201);
    }

    public function show(Item $item)
    {
        return response()->json($item->load(['category', 'unit', 'movements' => fn($q) => $q->latest()->limit(20)]));
    }

    public function update(Request $request, Item $item)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'type' => ['sometimes', 'required', Rule::in(['PRODUCT', 'SERVICE'])],
            'sku' => ['nullable', 'string', Rule::unique('items', 'sku')->ignore($item->id)],
            'barcode' => ['nullable', 'string', Rule::unique('items', 'barcode')->ignore($item->id)],
            'category_id' => 'nullable|exists:categories,id',
            'unit_id' => 'nullable|exists:units,id',
            'purchase_price' => 'sometimes|required|numeric|min:0',
            'selling_price' => 'sometimes|required|numeric|min:0',
            'minimum_stock' => 'integer|min:0',
            'track_stock' => 'boolean',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'is_active' => 'boolean',
        ]);

        $item->fill($validated);

        if (blank($item->sku)) {
            $item->sku = Item::generateSku($item);
        }

        if (blank($item->barcode)) {
            $item->barcode = Item::generateBarcode($item);
        }

        if ($request->hasFile('image')) {
            if ($item->image) {
                Storage::disk('public')->delete($item->image);
            }
            $item->image = $request->file('image')->store('items', 'public');
        }

        $item->save();
        return response()->json($item->load(['category', 'unit']));
    }

    public function destroy(Item $item)
    {
        if ($item->image) {
            Storage::disk('public')->delete($item->image);
        }

        $item->delete();
        return response()->json(['message' => 'Item berhasil dihapus']);
    }
}
