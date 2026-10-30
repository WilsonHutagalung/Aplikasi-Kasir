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
        $this->seedPaymentMethods();
        $this->seedTaxesAndDiscounts();

        $units = $this->seedUnits();
        $categories = $this->seedCategories();

        $this->seedCustomers();
        $this->seedSuppliers();
        $this->seedItems($units, $categories);
    }

    private function seedPaymentMethods(): void
    {
        $paymentMethods = [
            ['code' => 'CASH', 'name' => 'Tunai', 'is_active' => true],
            ['code' => 'QRIS', 'name' => 'QRIS', 'is_active' => true],
            ['code' => 'DEBIT', 'name' => 'Kartu Debit / Kredit (EDC)', 'is_active' => true],
            ['code' => 'TRANSFER', 'name' => 'Transfer Bank', 'is_active' => true],
        ];

        foreach ($paymentMethods as $paymentMethod) {
            PaymentMethod::firstOrCreate(
                ['code' => $paymentMethod['code']],
                $paymentMethod
            );
        }
    }

    private function seedTaxesAndDiscounts(): void
    {
        Tax::firstOrCreate(
            ['name' => 'PPN 11%'],
            [
                'rate' => 11.00,
                'type' => 'PERCENTAGE',
                'is_inclusive' => false,
                'is_active' => true,
            ]
        );

        Discount::firstOrCreate(
            ['name' => 'Diskon Pembelian Proyek 5%'],
            [
                'type' => 'PERCENTAGE',
                'value' => 5.00,
                'is_active' => true,
            ]
        );
    }

    /**
     * @return array<string, Unit>
     */
    private function seedUnits(): array
    {
        $unitData = [
            'pcs' => ['name' => 'Pieces', 'symbol' => 'pcs'],
            'sak' => ['name' => 'Sak', 'symbol' => 'sak'],
            'batang' => ['name' => 'Batang', 'symbol' => 'btg'],
            'meter' => ['name' => 'Meter', 'symbol' => 'm'],
            'lembar' => ['name' => 'Lembar', 'symbol' => 'lbr'],
            'kaleng' => ['name' => 'Kaleng', 'symbol' => 'klg'],
            'kubik' => ['name' => 'Meter Kubik', 'symbol' => 'm³'],
        ];

        $units = [];

        foreach ($unitData as $key => $data) {
            $units[$key] = Unit::firstOrCreate(['symbol' => $data['symbol']], $data);
        }

        return $units;
    }

    /**
     * @return array<string, Category>
     */
    private function seedCategories(): array
    {
        $categoryData = [
            'material' => 'Material Bangunan',
            'besi' => 'Besi dan Baja',
            'semen' => 'Semen dan Mortar',
            'cat' => 'Cat dan Pelapis',
            'pipa' => 'Pipa dan Sanitasi',
            'perkakas' => 'Perkakas',
        ];

        $categories = [];

        foreach ($categoryData as $key => $name) {
            $categories[$key] = Category::firstOrCreate(['name' => $name]);
        }

        return $categories;
    }

    private function seedCustomers(): void
    {
        $customers = [
            [
                'name' => 'Pelanggan Umum',
                'phone' => '0800000000',
                'address' => 'Pembelian langsung di toko',
            ],
            [
                'name' => 'CV Bangun Jaya',
                'phone' => '081234567890',
                'email' => 'procurement@bangunjaya.test',
                'address' => 'Jl. Konstruksi No. 12, Jakarta',
            ],
            [
                'name' => 'Bapak Andi - Proyek Rumah',
                'phone' => '081298765432',
                'address' => 'Bekasi, Jawa Barat',
            ],
        ];

        foreach ($customers as $customer) {
            Customer::firstOrCreate(['name' => $customer['name']], $customer);
        }
    }

    private function seedSuppliers(): void
    {
        $suppliers = [
            [
                'name' => 'PT Semen Nusantara',
                'phone' => '0215551001',
                'email' => 'order@semennusantara.test',
                'address' => 'Jakarta',
            ],
            [
                'name' => 'CV Baja Makmur',
                'phone' => '0215551002',
                'email' => 'sales@bajamakmur.test',
                'address' => 'Bekasi, Jawa Barat',
            ],
            [
                'name' => 'PT Mitra Bangunan Indonesia',
                'phone' => '0215551003',
                'email' => 'sales@mitrabangunan.test',
                'address' => 'Tangerang, Banten',
            ],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::firstOrCreate(['name' => $supplier['name']], $supplier);
        }
    }

    /**
     * @param  array<string, Unit>  $units
     * @param  array<string, Category>  $categories
     */
    private function seedItems(array $units, array $categories): void
    {
        $items = [
            [
                'name' => 'Semen Portland Komposit 40kg',
                'sku' => 'BBG-SEM-001',
                'barcode' => '899700100001',
                'category_id' => $categories['semen']->id,
                'unit_id' => $units['sak']->id,
                'purchase_price' => 52000,
                'selling_price' => 65000,
                'minimum_stock' => 20,
                'stock' => 120,
            ],
            [
                'name' => 'Mortar Instan Perekat Bata Ringan 40kg',
                'sku' => 'BBG-SEM-002',
                'barcode' => '899700100002',
                'category_id' => $categories['semen']->id,
                'unit_id' => $units['sak']->id,
                'purchase_price' => 48000,
                'selling_price' => 60000,
                'minimum_stock' => 15,
                'stock' => 75,
            ],
            [
                'name' => 'Besi Beton Polos 10mm x 12m',
                'sku' => 'BBG-BES-001',
                'barcode' => '899700100003',
                'category_id' => $categories['besi']->id,
                'unit_id' => $units['batang']->id,
                'purchase_price' => 68000,
                'selling_price' => 82000,
                'minimum_stock' => 30,
                'stock' => 150,
            ],
            [
                'name' => 'Besi Beton Ulir 12mm x 12m',
                'sku' => 'BBG-BES-002',
                'barcode' => '899700100004',
                'category_id' => $categories['besi']->id,
                'unit_id' => $units['batang']->id,
                'purchase_price' => 98000,
                'selling_price' => 118000,
                'minimum_stock' => 20,
                'stock' => 90,
            ],
            [
                'name' => 'Cat Tembok Interior 5kg Putih',
                'sku' => 'BBG-CAT-001',
                'barcode' => '899700100005',
                'category_id' => $categories['cat']->id,
                'unit_id' => $units['kaleng']->id,
                'purchase_price' => 145000,
                'selling_price' => 185000,
                'minimum_stock' => 10,
                'stock' => 45,
            ],
            [
                'name' => 'Cat Dasar Alkali 1kg',
                'sku' => 'BBG-CAT-002',
                'barcode' => '899700100006',
                'category_id' => $categories['cat']->id,
                'unit_id' => $units['kaleng']->id,
                'purchase_price' => 38000,
                'selling_price' => 52000,
                'minimum_stock' => 10,
                'stock' => 35,
            ],
            [
                'name' => 'Pipa PVC AW 1/2 Inch x 4m',
                'sku' => 'BBG-PIP-001',
                'barcode' => '899700100007',
                'category_id' => $categories['pipa']->id,
                'unit_id' => $units['batang']->id,
                'purchase_price' => 18000,
                'selling_price' => 26000,
                'minimum_stock' => 20,
                'stock' => 100,
            ],
            [
                'name' => 'Kran Air PVC 1/2 Inch',
                'sku' => 'BBG-PIP-002',
                'barcode' => '899700100008',
                'category_id' => $categories['pipa']->id,
                'unit_id' => $units['pcs']->id,
                'purchase_price' => 15000,
                'selling_price' => 24000,
                'minimum_stock' => 15,
                'stock' => 60,
            ],
            [
                'name' => 'Palu Tukang 16 Oz',
                'sku' => 'BBG-PRK-001',
                'barcode' => '899700100009',
                'category_id' => $categories['perkakas']->id,
                'unit_id' => $units['pcs']->id,
                'purchase_price' => 55000,
                'selling_price' => 75000,
                'minimum_stock' => 5,
                'stock' => 25,
            ],
            [
                'name' => 'Meteran 5 Meter',
                'sku' => 'BBG-PRK-002',
                'barcode' => '899700100010',
                'category_id' => $categories['perkakas']->id,
                'unit_id' => $units['pcs']->id,
                'purchase_price' => 35000,
                'selling_price' => 50000,
                'minimum_stock' => 5,
                'stock' => 20,
            ],
            [
                'name' => 'Pasir Beton',
                'sku' => 'BBG-MAT-001',
                'barcode' => '899700100011',
                'category_id' => $categories['material']->id,
                'unit_id' => $units['kubik']->id,
                'purchase_price' => 240000,
                'selling_price' => 300000,
                'minimum_stock' => 5,
                'stock' => 25,
            ],
            [
                'name' => 'Triplek 9mm 122x244cm',
                'sku' => 'BBG-MAT-002',
                'barcode' => '899700100012',
                'category_id' => $categories['material']->id,
                'unit_id' => $units['lembar']->id,
                'purchase_price' => 95000,
                'selling_price' => 125000,
                'minimum_stock' => 10,
                'stock' => 40,
            ],
        ];

        foreach ($items as $itemData) {
            $item = Item::firstOrCreate(
                ['sku' => $itemData['sku']],
                [
                    ...$itemData,
                    'type' => 'PRODUCT',
                    'track_stock' => true,
                ]
            );

            InventoryMovement::firstOrCreate(
                [
                    'item_id' => $item->id,
                    'type' => 'OPENING',
                ],
                [
                    'quantity' => $item->stock,
                    'notes' => 'Stok awal toko bahan bangunan',
                ]
            );
        }
    }
}
