<?php

namespace App\Services;

use App\Models\InventoryMovement;
use App\Models\Item;
use Illuminate\Support\Facades\DB;
use Exception;

class InventoryService
{
    /**
     * Record a stock movement and update the item's current stock balance.
     */
    public function recordMovement(
        Item $item,
        string $type,
        float $quantity,
        ?string $referenceType = null,
        ?int $referenceId = null,
        ?string $notes = null
    ): InventoryMovement {
        if (!$item->track_stock) {
            throw new Exception("Product {$item->name} does not track stock.");
        }

        return DB::transaction(function () use ($item, $type, $quantity, $referenceType, $referenceId, $notes) {
            // Determine stock impact (Additions vs Reductions)
            $isAddition = in_array($type, ['OPENING', 'PURCHASE', 'RETURN', 'ADJUSTMENT_IN']);
            $stockDelta = $isAddition ? abs($quantity) : -abs($quantity);

            $newStock = $item->stock + $stockDelta;

            // Check negative stock rule
            $allowNegative = \App\Models\BusinessSetting::getByKey('enable_negative_stock', '0') === '1';
            if ($newStock < 0 && !$allowNegative) {
                throw new Exception("Insufficient stock for product {$item->name}. Available: {$item->stock}, requested: " . abs($quantity));
            }

            // Update item stock cache
            $item->update(['stock' => $newStock]);

            // Record movement history log
            return InventoryMovement::create([
                'item_id' => $item->id,
                'type' => $type,
                'quantity' => $stockDelta,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'notes' => $notes,
            ]);
        });
    }
}
