<?php

namespace Database\Seeders;

use App\Models\BusinessSetting;
use Illuminate\Database\Seeder;

class BusinessSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            'business_name' => 'Kasir Pro Universal POS',
            'business_address' => 'Jl. Jendral Sudirman No. 100, Jakarta Pusat',
            'business_phone' => '0812-3456-7890',
            'business_email' => 'info@kasirpro.id',
            'currency' => 'Rp',
            'timezone' => 'Asia/Jakarta',
            'receipt_header' => '🏪 KASIR PRO UNIVERSAL POS 🛒',
            'receipt_footer' => 'Terima Kasih Atas Kunjungan Anda!\nLayanan Pelanggan: 0812-3456-7890',
            'invoice_prefix' => 'INV',
            'enable_negative_stock' => '0',
        ];

        foreach ($settings as $key => $value) {
            BusinessSetting::setKey($key, $value);
        }
    }
}
