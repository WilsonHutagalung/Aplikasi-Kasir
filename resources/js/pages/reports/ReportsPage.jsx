import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../services/api';
import { BarChart3, TrendingUp, DollarSign, Calendar, Filter, FileText } from 'lucide-react';

const ReportsPage = () => {
    const [summary, setSummary] = useState(null);
    const [salesChart, setSalesChart] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReports();
    }, [startDate, endDate]);

    const loadReports = async () => {
        setLoading(true);
        try {
            const [sRes, cRes, tRes] = await Promise.all([
                api.get(`/reports/summary?start_date=${startDate}&end_date=${endDate}`),
                api.get(`/reports/sales-chart?start_date=${startDate}&end_date=${endDate}`),
                api.get(`/reports/top-products?start_date=${startDate}&end_date=${endDate}`),
            ]);
            setSummary(sRes.data);
            setSalesChart(cRes.data);
            setTopProducts(tRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Laporan Penjualan & Laba</h1>
                        <p className="text-sm text-slate-500">Analisis laba kotor, ringkasan transaksi, dan produk terlaris</p>
                    </div>

                    {/* Date Filter */}
                    <div className="flex items-center space-x-2 bg-white p-2 border border-slate-200 rounded-xl shadow-2xs">
                        <Calendar size={16} className="text-slate-400 ml-1" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="text-xs border-0 focus:ring-0 p-0 text-slate-700 font-medium"
                        />
                        <span className="text-slate-300 text-xs">s/d</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="text-xs border-0 focus:ring-0 p-0 text-slate-700 font-medium"
                        />
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                        <p className="text-xs font-semibold text-slate-400 uppercase">Omzet Penjualan</p>
                        <h3 className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(summary?.total_sales)}</h3>
                        <p className="text-xs text-slate-500 mt-1">{summary?.total_transactions || 0} Transaksi</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                        <p className="text-xs font-semibold text-slate-400 uppercase">Modal (HPP / COGS)</p>
                        <h3 className="text-xl font-bold text-slate-700 mt-1">{formatCurrency(summary?.cogs)}</h3>
                        <p className="text-xs text-slate-500 mt-1">Total harga beli barang</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                        <p className="text-xs font-semibold text-slate-400 uppercase">Laba Kotor (Gross Profit)</p>
                        <h3 className="text-xl font-bold text-emerald-600 mt-1">{formatCurrency(summary?.gross_profit)}</h3>
                        <p className="text-xs text-emerald-600 font-medium mt-1">Omzet - Modal HPP</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                        <p className="text-xs font-semibold text-slate-400 uppercase">Total Terjual</p>
                        <h3 className="text-xl font-bold text-blue-600 mt-1">{summary?.total_items_sold || 0} Qty</h3>
                        <p className="text-xs text-slate-500 mt-1">Produk & jasa diproses</p>
                    </div>
                </div>

                {/* Sales Chart / Breakdown Table */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <h3 className="font-bold text-slate-900 text-lg">Rincian Penjualan Harian</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-400 text-xs font-semibold uppercase">
                                <tr>
                                    <th className="px-4 py-3">Tanggal</th>
                                    <th className="px-4 py-3 text-center">Jumlah Struk</th>
                                    <th className="px-4 py-3 text-right">Total Omzet Harian</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {salesChart.length === 0 ? (
                                    <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400">Belum ada grafik penjualan di rentang tanggal ini</td></tr>
                                ) : (
                                    salesChart.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50">
                                            <td className="px-4 py-3.5 font-medium text-slate-900">{row.date}</td>
                                            <td className="px-4 py-3.5 text-center font-semibold text-blue-600">{row.count}</td>
                                            <td className="px-4 py-3.5 text-right font-bold text-slate-900">{formatCurrency(row.total)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ReportsPage;
