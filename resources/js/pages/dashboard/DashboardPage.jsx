import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../services/api';
import { DollarSign, ShoppingBag, Package, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
    const [summary, setSummary] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sumRes, topRes] = await Promise.all([
                    api.get('/reports/summary'),
                    api.get('/reports/top-products'),
                ]);
                setSummary(sumRes.data);
                setTopProducts(topRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatCurrency = (val) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-sm text-slate-500">Ringkasan performa penjualan dan stok hari ini</p>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-400">Memuat data dashboard...</div>
                ) : (
                    <>
                        {/* KPI Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Penjualan</p>
                                    <h3 className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(summary?.total_sales)}</h3>
                                </div>
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                    <DollarSign size={24} />
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jumlah Transaksi</p>
                                    <h3 className="text-xl font-bold text-slate-900 mt-1">{summary?.total_transactions || 0} Struk</h3>
                                </div>
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <ShoppingBag size={24} />
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Laba Kotor (Gross Profit)</p>
                                    <h3 className="text-xl font-bold text-emerald-600 mt-1">{formatCurrency(summary?.gross_profit)}</h3>
                                </div>
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <TrendingUp size={24} />
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stok Menipis</p>
                                    <h3 className="text-xl font-bold text-amber-600 mt-1">{summary?.low_stock_count || 0} Produk</h3>
                                </div>
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                                    <AlertTriangle size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Top Products & Quick Actions */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-bold text-slate-900 text-lg">Produk Terlaris</h2>
                                    <Link to="/reports" className="text-xs font-semibold text-blue-600 hover:underline flex items-center">
                                        Lihat Semua <ArrowRight size={14} className="ml-1" />
                                    </Link>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-slate-600">
                                        <thead className="bg-slate-50 text-slate-400 text-xs font-semibold uppercase">
                                            <tr>
                                                <th className="px-4 py-3">Produk</th>
                                                <th className="px-4 py-3 text-center">Terjual</th>
                                                <th className="px-4 py-3 text-right">Total Pendapatan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {topProducts.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-6 text-center text-slate-400">Belum ada transaksi</td>
                                                </tr>
                                            ) : (
                                                topProducts.map((p, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50">
                                                        <td className="px-4 py-3.5 font-medium text-slate-900">{p.item_name}</td>
                                                        <td className="px-4 py-3.5 text-center font-semibold text-blue-600">{p.total_qty}</td>
                                                        <td className="px-4 py-3.5 text-right font-medium">{formatCurrency(p.total_revenue)}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Quick POS Navigation Card */}
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4">
                                        <ShoppingBag size={28} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Buka Kasir Sekarang</h3>
                                    <p className="text-blue-100 text-sm leading-relaxed">
                                        Mulai transaksi penjualan cepat dengan pencarian barcode, hold order, dan cetak struk thermal.
                                    </p>
                                </div>
                                <Link
                                    to="/pos"
                                    className="mt-6 w-full py-3 bg-white text-blue-600 font-bold rounded-xl text-center shadow-md hover:bg-blue-50 transition-all text-sm block"
                                >
                                    Masuk Halaman POS →
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DashboardPage;
