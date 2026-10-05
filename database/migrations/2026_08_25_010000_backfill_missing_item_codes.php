<?php

use App\Models\Item;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        Item::query()
            ->whereNull('sku')
            ->orWhere('sku', '')
            ->orderBy('id')
            ->chunkById(100, function ($items) {
                foreach ($items as $item) {
                    $item->sku = Item::generateSku($item);
                    if (blank($item->barcode)) {
                        $item->barcode = Item::generateBarcode($item);
                    }
                    $item->save();
                }
            });

        Item::query()
            ->whereNull('barcode')
            ->orWhere('barcode', '')
            ->orderBy('id')
            ->chunkById(100, function ($items) {
                foreach ($items as $item) {
                    if (blank($item->barcode)) {
                        $item->barcode = Item::generateBarcode($item);
                        $item->save();
                    }
                }
            });
    }

    public function down(): void
    {
        // No rollback for generated codes.
    }
};