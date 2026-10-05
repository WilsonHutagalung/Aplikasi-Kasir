<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BusinessSetting;
use App\Models\PaymentMethod;
use App\Models\Tax;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        $settings = BusinessSetting::all()->pluck('value', 'key');
        $taxes = Tax::all();
        $paymentMethods = PaymentMethod::all();

        return response()->json([
            'settings' => $settings,
            'taxes' => $taxes,
            'payment_methods' => $paymentMethods,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($validated['settings'] as $key => $value) {
            BusinessSetting::setKey($key, $value);
        }

        return response()->json(['message' => 'Pengaturan berhasil diperbarui']);
    }
}
