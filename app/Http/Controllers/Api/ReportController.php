<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function summary(Request $request)
    {
        $startDate = $request->get('start_date', now()->format('Y-m-01'));
        $endDate = $request->get('end_date', now()->format('Y-m-d'));

        $salesQuery = Sale::where('status', 'COMPLETED')
            ->whereBetween('transaction_date', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);

        $totalSales = $salesQuery->sum('total');
        $totalTransactions = $salesQuery->count();
        $totalDiscount = $salesQuery->sum('discount');
        $totalTax = $salesQuery->sum('tax');

        $totalItemsSold = SaleItem::whereHas('sale', function ($q) use ($startDate, $endDate) {
            $q->where('status', 'COMPLETED')
              ->whereBetween('transaction_date', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        })->sum('quantity');

        // Gross Profit Calculation
        $cogs = SaleItem::whereHas('sale', function ($q) use ($startDate, $endDate) {
            $q->where('status', 'COMPLETED')
              ->whereBetween('transaction_date', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        })->select(DB::raw('SUM(purchase_price * quantity) as total_cogs'))->value('total_cogs') ?? 0;

        $grossProfit = $totalSales - $cogs;

        $lowStockCount = Item::where('track_stock', true)->whereColumn('stock', '<=', 'minimum_stock')->count();

        return response()->json([
            'total_sales' => floatval($totalSales),
            'total_transactions' => $totalTransactions,
            'total_items_sold' => floatval($totalItemsSold),
            'total_discount' => floatval($totalDiscount),
            'total_tax' => floatval($totalTax),
            'cogs' => floatval($cogs),
            'gross_profit' => floatval($grossProfit),
            'low_stock_count' => $lowStockCount,
        ]);
    }

    public function salesChart(Request $request)
    {
        $period = $request->get('period', '7days'); // 7days, month, year

        if ($period === 'month') {
            $startDate = now()->startOfMonth();
        } else if ($period === 'year') {
            $startDate = now()->startOfYear();
        } else {
            $startDate = now()->subDays(7);
        }

        $salesData = Sale::where('status', 'COMPLETED')
            ->where('transaction_date', '>=', $startDate)
            ->select(
                DB::raw('DATE(transaction_date) as date'),
                DB::raw('SUM(total) as total'),
                DB::raw('COUNT(id) as count')
            )
            ->groupBy(DB::raw('DATE(transaction_date)'))
            ->orderBy('date', 'asc')
            ->get();

        return response()->json($salesData);
    }

    public function topProducts(Request $request)
    {
        $top = SaleItem::whereHas('sale', fn($q) => $q->where('status', 'COMPLETED'))
            ->select('item_id', 'item_name', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(total) as total_revenue'))
            ->groupBy('item_id', 'item_name')
            ->orderBy('total_qty', 'desc')
            ->limit(10)
            ->get();

        return response()->json($top);
    }
}
