<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Item extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'sku',
        'barcode',
        'category_id',
        'unit_id',
        'purchase_price',
        'selling_price',
        'minimum_stock',
        'track_stock',
        'stock',
        'description',
        'image',
        'is_active',
    ];

    protected $casts = [
        'track_stock' => 'boolean',
        'is_active' => 'boolean',
        'purchase_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'stock' => 'decimal:2',
        'minimum_stock' => 'integer',
    ];

    protected $appends = [
        'image_url',
    ];

    protected static function booted(): void
    {
        static::saving(function (Item $item) {
            if (blank($item->sku)) {
                $item->sku = static::generateSku($item);
            }

            if (blank($item->barcode)) {
                $item->barcode = static::generateBarcode($item);
            }
        });
    }

    public static function generateSku(Item $item): string
    {
        $prefix = $item->type === 'SERVICE' ? 'SRV' : 'PRD';
        $namePart = Str::of($item->name ?: 'ITEM')
            ->upper()
            ->replaceMatches('/[^A-Z0-9]+/', '')
            ->substr(0, 8)
            ->value() ?: 'ITEM';
        $categoryPart = Str::of((string) ($item->category?->name ?: 'GEN'))
            ->upper()
            ->replaceMatches('/[^A-Z0-9]+/', '')
            ->substr(0, 3)
            ->value() ?: 'GEN';

        return sprintf('%s-%s-%s-%s', $prefix, $categoryPart, $namePart, now()->format('ymdHis'));
    }

    public static function generateBarcode(Item $item): string
    {
        return '899' . now()->format('ymdHis') . str_pad((string) random_int(0, 99), 2, '0', STR_PAD_LEFT);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function movements()
    {
        return $this->hasMany(InventoryMovement::class);
    }

    public function getImageUrlAttribute(): ?string
    {
        if (blank($this->image)) {
            return null;
        }

        return Storage::disk('public')->url($this->image);
    }
}
