<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Discount;
use App\Models\InventoryMovement;
use App\Models\Item;
use App\Models\PaymentMethod;
use App\Models\Supplier;
use App\Models\Tax;
use App\Models\Unit;
use Illuminate\Database\Seeder;

class MasterDataSeeder extends Seeder
{
    public function run(): void
    {
        // Payment methods
        PaymentMethod::firstOrCreate(['code' => 'CASH'], ['name' => 'Tunai / Cash', 'is_active' => true]);
        PaymentMethod::firstOrCreate(['code' => 'QRIS'], ['name' => 'QRIS (GoPay, OVO, ShopeePay, Dana)', 'is_active' => true]);
        PaymentMethod::firstOrCreate(['code' => 'DEBIT'], ['name' => 'Kartu Debit / Kredit (EDC)', 'is_active' => true]);
        PaymentMethod::firstOrCreate(['code' => 'TRANSFER'], ['name' => 'Transfer Bank (BCA / Mandiri / BNI)', 'is_active' => true]);

        // Taxes and discounts
        Tax::firstOrCreate(
            ['name' => 'PPN 11%'],
            ['rate' => 11.00, 'type' => 'PERCENTAGE', 'is_inclusive' => false, 'is_active' => true]
        );
        Tax::firstOrCreate(
            ['name' => 'Pajak Resto / PB1 10%'],
            ['rate' => 10.00, 'type' => 'PERCENTAGE', 'is_inclusive' => false, 'is_active' => true]
        );

        Discount::firstOrCreate(
            ['name' => 'Diskon Member 5%'],
            ['type' => 'PERCENTAGE', 'value' => 5.00, 'is_active' => true]
        );
        Discount::firstOrCreate(
            ['name' => 'Voucher Promo Rp 10.000'],
            ['type' => 'FIXED', 'value' => 10000.00, 'is_active' => true]
        );

        // Units
        $pcs = Unit::firstOrCreate(['name' => 'Pcs (Pieces)', 'symbol' => 'pcs']);
        $pack = Unit::firstOrCreate(['name' => 'Pack / Bungkus', 'symbol' => 'pck']);
        $botol = Unit::firstOrCreate(['name' => 'Botol / Can', 'symbol' => 'btl']);
        $kg = Unit::firstOrCreate(['name' => 'Kilogram', 'symbol' => 'kg']);
        $porsi = Unit::firstOrCreate(['name' => 'Porsi', 'symbol' => 'prs']);
        $cup = Unit::firstOrCreate(['name' => 'Cup', 'symbol' => 'cup']);

        // Categories
        $fnb = Category::firstOrCreate(['name' => '☕ Makanan & Minuman (F&B)']);
        $grocery = Category::firstOrCreate(['name' => '🛒 Sembako & Minimarket']);
        $fashion = Category::firstOrCreate(['name' => '👕 Pakaian & Fashion']);
        $elec = Category::firstOrCreate(['name' => '🔌 Elektronik & Gadget']);
        $service = Category::firstOrCreate(['name' => '🧼 Jasa & Layanan']);
        $health = Category::firstOrCreate(['name' => '💊 Kesehatan & Beauty']);

        // Customers and suppliers
        Customer::firstOrCreate(['name' => 'Pelanggan Umum (Walk-in Customer)']);
        Customer::firstOrCreate([
            'name' => 'Budi Santoso (Member Gold)',
            'phone' => '0811-9988-7766',
            'email' => 'budi.santoso@gmail.com',
            'address' => 'Jakarta Selatan'
        ]);
        Customer::firstOrCreate([
            'name' => 'Siti Rahmawati (Member Silver)',
            'phone' => '0857-1122-3344',
            'email' => 'siti.rahma@yahoo.com',
            'address' => 'Bandung'
        ]);
        Customer::firstOrCreate(['name' => 'Meja 01 (Dine-in)', 'phone' => 'Meja-01']);
        Customer::firstOrCreate(['name' => 'Meja 02 (Dine-in)', 'phone' => 'Meja-02']);

        Supplier::firstOrCreate([
            'name' => 'PT Distribusi Sembako Nasional',
            'phone' => '021-5551234',
            'email' => 'sales@distribusisembako.co.id',
            'address' => 'Jakarta'
        ]);
        Supplier::firstOrCreate([
            'name' => 'CV Gadget & Aksesoris Import',
            'phone' => '021-88997766',
            'email' => 'order@gadgetimport.id',
            'address' => 'Surabaya'
        ]);

        // Products and services
        $items = [
            // F&B / Cafe
            [
                'name' => 'Kopi Susu Gula Aren 250ml',
                'type' => 'PRODUCT',
                'sku' => 'FNB-001',
                'barcode' => '8992001001',
                'category_id' => $fnb->id,
                'unit_id' => $cup->id,
                'purchase_price' => 8000,
                'selling_price' => 22000,
                'minimum_stock' => 10,
                'track_stock' => true,
                'stock' => 85,
            ],
            [
                'name' => 'Croissant French Butter Crisp',
                'type' => 'PRODUCT',
                'sku' => 'FNB-002',
                'barcode' => '8992001002',
                'category_id' => $fnb->id,
                'unit_id' => $pcs->id,
                'purchase_price' => 9000,
                'selling_price' => 20000,
                'minimum_stock' => 5,
                'track_stock' => true,
                'stock' => 40,
            ],
            [
                'name' => 'Nasi Goreng Special Telur',
                'type' => 'PRODUCT',
                'sku' => 'FNB-003',
                'barcode' => '8992001003',
                'category_id' => $fnb->id,
                'unit_id' => $porsi->id,
                'purchase_price' => 14000,
                'selling_price' => 28000,
                'minimum_stock' => 5,
                'track_stock' => true,
                'stock' => 50,
            ],

            // 🛒 Minimarket & Sembako
            [
                'name' => 'Minyak Goreng Bimoli 2 Liter',
                'type' => 'PRODUCT',
                'sku' => 'GRC-001',
                'barcode' => '8991001101',
                'category_id' => $grocery->id,
                'unit_id' => $botol->id,
                'purchase_price' => 32000,
                'selling_price' => 38000,
                'minimum_stock' => 15,
                'track_stock' => true,
                'stock' => 120,
            ],
            [
                'name' => 'Beras Premium Ramos 5kg',
                'type' => 'PRODUCT',
                'sku' => 'GRC-002',
                'barcode' => '8991001102',
                'category_id' => $grocery->id,
                'unit_id' => $pack->id,
                'purchase_price' => 68000,
                'selling_price' => 75000,
                'minimum_stock' => 10,
                'track_stock' => true,
                'stock' => 60,
            ],
            [
                'name' => 'Indomie Goreng Spesial 85g',
                'type' => 'PRODUCT',
                'sku' => 'GRC-003',
                'barcode' => '8991001103',
                'category_id' => $grocery->id,
                'unit_id' => $pcs->id,
                'purchase_price' => 2900,
                'selling_price' => 3500,
                'minimum_stock' => 30,
                'track_stock' => true,
                'stock' => 200,
            ],

            // 👕 Pakaian & Fashion
            [
                'name' => 'Kaos Polos Cotton Combed 30s',
                'type' => 'PRODUCT',
                'sku' => 'FSH-001',
                'barcode' => '8993001001',
                'category_id' => $fashion->id,
                'unit_id' => $pcs->id,
                'purchase_price' => 35000,
                'selling_price' => 65000,
                'minimum_stock' => 5,
                'track_stock' => true,
                'stock' => 45,
            ],
            [
                'name' => 'Celana Chino Slim Fit Pria',
                'type' => 'PRODUCT',
                'sku' => 'FSH-002',
                'barcode' => '8993001002',
                'category_id' => $fashion->id,
                'unit_id' => $pcs->id,
                'purchase_price' => 85000,
                'selling_price' => 149000,
                'minimum_stock' => 5,
                'track_stock' => true,
                'stock' => 30,
            ],

            // 🔌 Elektronik & Gadget
            [
                'name' => 'Headset Bluetooth TWS Wireless',
                'type' => 'PRODUCT',
                'sku' => 'ELC-001',
                'barcode' => '8994001001',
                'category_id' => $elec->id,
                'unit_id' => $pcs->id,
                'purchase_price' => 95000,
                'selling_price' => 155000,
                'minimum_stock' => 3,
                'track_stock' => true,
                'stock' => 25,
            ],
            [
                'name' => 'Kabel Data Fast Charging Type-C',
                'type' => 'PRODUCT',
                'sku' => 'ELC-002',
                'barcode' => '8994001002',
                'category_id' => $elec->id,
                'unit_id' => $pcs->id,
                'purchase_price' => 15000,
                'selling_price' => 35000,
                'minimum_stock' => 10,
                'track_stock' => true,
                'stock' => 80,
            ],
            [
                'name' => 'Mouse Optical USB Logitech',
                'type' => 'PRODUCT',
                'sku' => 'ELC-003',
                'barcode' => '8994001003',
                'category_id' => $elec->id,
                'unit_id' => $pcs->id,
                'purchase_price' => 45000,
                'selling_price' => 75000,
                'minimum_stock' => 3,
                'track_stock' => true,
                'stock' => 15,
            ],

            // Jasa & Layanan (Services)
            [
                'name' => 'Jasa Cuci Express Laundry (Per Kg)',
                'type' => 'SERVICE',
                'sku' => 'SRV-001',
                'barcode' => '8996001001',
                'category_id' => $service->id,
                'unit_id' => $kg->id,
                'purchase_price' => 3000,
                'selling_price' => 10000,
                'minimum_stock' => 0,
                'track_stock' => false,
                'stock' => 0,
            ],
            [
                'name' => 'Jasa Potong Rambut Pria / Cukur',
                'type' => 'SERVICE',
                'sku' => 'SRV-002',
                'barcode' => '8996001002',
                'category_id' => $service->id,
                'unit_id' => $pcs->id,
                'purchase_price' => 0,
                'selling_price' => 35000,
                'minimum_stock' => 0,
                'track_stock' => false,
                'stock' => 0,
            ],
            [
                'name' => 'Jasa Service / Ganti Oli Motor',
                'type' => 'SERVICE',
                'sku' => 'SRV-003',
                'barcode' => '8996001003',
                'category_id' => $service->id,
                'unit_id' => $pcs->id,
                'purchase_price' => 0,
                'selling_price' => 45000,
                'minimum_stock' => 0,
                'track_stock' => false,
                'stock' => 0,
            ],

            // 💊 Kesehatan & Beauty
            [
                'name' => 'Vitamin C 1000mg Strip 10s',
                'type' => 'PRODUCT',
                'sku' => 'HLT-001',
                'barcode' => '8995001001',
                'category_id' => $health->id,
                'unit_id' => $pack->id,
                'purchase_price' => 12000,
                'selling_price' => 20000,
                'minimum_stock' => 10,
                'track_stock' => true,
                'stock' => 90,
            ],
            [
                'name' => 'Sunscreen Hydrating SPF 50 PA+++',
                'type' => 'PRODUCT',
                'sku' => 'HLT-002',
                'barcode' => '8995001002',
                'category_id' => $health->id,
                'unit_id' => $botol->id,
                'purchase_price' => 42000,
                'selling_price' => 68000,
                'minimum_stock' => 5,
                'track_stock' => true,
                'stock' => 35,
            ],
        ];

        foreach ($items as $itemData) {
            $item = Item::firstOrCreate(['sku' => $itemData['sku']], $itemData);

            if ($item->track_stock && $item->stock > 0) {
                InventoryMovement::firstOrCreate([
                    'item_id' => $item->id,
                    'type' => 'OPENING',
                ], [
                    'quantity' => $item->stock,
                    'notes' => 'Stok awal sistem kasir pro',
                ]);
            }
        }
    }
}
