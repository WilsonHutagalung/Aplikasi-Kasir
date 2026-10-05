<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashierShift;
use App\Models\Sale;
use Illuminate\Http\Request;

class ShiftController extends Controller
{
    public function current(Request $request)
    {
        $shift = CashierShift::where('user_id', $request->user()->id)
            ->where('status', 'OPEN')
            ->first();

        if (!$shift) {
            return response()->json(['active' => false, 'shift' => null]);
        }

        // Calculate expected cash
        $cashSales = Sale::where('shift_id', $shift->id)
            ->where('status', 'COMPLETED')
            ->sum('paid_amount');

        $expectedCash = $shift->opening_cash + $cashSales;

        return response()->json([
            'active' => true,
            'shift' => $shift,
            'cash_sales' => $cashSales,
            'expected_cash' => $expectedCash,
        ]);
    }

    public function open(Request $request)
    {
        $existing = CashierShift::where('user_id', $request->user()->id)
            ->where('status', 'OPEN')
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Anda sudah memiliki shift yang aktif.'], 422);
        }

        $validated = $request->validate([
            'opening_cash' => 'required|numeric|min:0',
        ]);

        $shift = CashierShift::create([
            'user_id' => $request->user()->id,
            'opening_cash' => $validated['opening_cash'],
            'opening_date' => now(),
            'status' => 'OPEN',
        ]);

        return response()->json(['message' => 'Shift kasir dibuka', 'shift' => $shift], 201);
    }

    public function close(Request $request)
    {
        $shift = CashierShift::where('user_id', $request->user()->id)
            ->where('status', 'OPEN')
            ->first();

        if (!$shift) {
            return response()->json(['message' => 'Tidak ada shift aktif yang perlu ditutup.'], 422);
        }

        $validated = $request->validate([
            'actual_cash' => 'required|numeric|min:0',
        ]);

        $cashSales = Sale::where('shift_id', $shift->id)
            ->where('status', 'COMPLETED')
            ->sum('paid_amount');

        $expectedCash = $shift->opening_cash + $cashSales;
        $actualCash = floatval($validated['actual_cash']);
        $difference = $actualCash - $expectedCash;

        $shift->update([
            'closing_cash' => $actualCash,
            'closing_date' => now(),
            'expected_cash' => $expectedCash,
            'actual_cash' => $actualCash,
            'difference' => $difference,
            'status' => 'CLOSED',
        ]);

        return response()->json(['message' => 'Shift kasir ditutup', 'shift' => $shift]);
    }

    public function index(Request $request)
    {
        $shifts = CashierShift::with('user')->latest()->paginate(20);
        return response()->json($shifts);
    }
}
