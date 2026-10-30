<?php

namespace Database\Seeders;

use App\Models\BusinessSetting;
use Illuminate\Database\Seeder;

class BusinessSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            'business_name' => 'Toko Bangunan Jaya',
            'business_address' => 'Jl. Raya Konstruksi No. 100, Jakarta',
            'business_phone' => '0812-3456-7890',
            'business_email' => 'info@tokobangunanjaya.test',
            'currency' => 'Rp',
            'timezone' => 'Asia/Jakarta',
            'receipt_header' => 'TOKO BANGUNAN JAYA',
            'receipt_footer' => 'Terima Kasih Atas Kunjungan Anda!\nLayanan Pelanggan: 0812-3456-7890',
            'invoice_prefix' => 'INV',
            'enable_negative_stock' => '0',
        ];

        foreach ($settings as $key => $value) {
            BusinessSetting::setKey($key, $value);
        }
    }
}
