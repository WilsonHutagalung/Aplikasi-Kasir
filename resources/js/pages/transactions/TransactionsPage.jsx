import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../services/api';
import { ReceiptText, Eye, Ban, RotateCcw, Printer, X, Search, Calendar } from 'lucide-react';

const TransactionsPage = () => {
    const [sales, setSales] = useState([]);
    const [selectedSale, setSelectedSale] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSales();
    }, []);

    const loadSales = async () => {
        setLoading(true);
        try {
            const res = await api.get('/transactions');
            setSales(res.data.data || res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = async (id) => {
        try {
            const res = await api.get(`/transactions/${id}`);
            setSelectedSale(res.data);
            setDetailModalOpen(true);
        } catch (err) {
            alert('Gagal memuat detail transaksi.');
        }
    };

    const handleCancelSale = async (id) => {
        if (!confirm('Yakin batalkan transaksi ini? Stok barang akan dikembalikan.')) return;
        try {
            await api.post(`/transactions/${id}/cancel`, { reason: 'Pembatalan kasir' });
            alert('Transaksi berhasil dibatalkan.');
            setDetailModalOpen(false);
            loadSales();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal membatalkan transaksi.');
        }
    };

    const formatCurrency = (val) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Riwayat & Struk Transaksi</h1>
                    <p className="text-sm text-slate-500">Daftar seluruh transaksi penjualan, cetak ulang struk, dan refund</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="relative w-72">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nomor transaksi..."
                                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-400 text-xs font-semibold uppercase">
                                <tr>
                                    <th className="px-4 py-3">No. Transaksi</th>
                                    <th className="px-4 py-3">Waktu</th>
                                    <th className="px-4 py-3">Kasir</th>
                                    <th className="px-4 py-3">Pelanggan</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sales.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-slate-400">Belum ada transaksi</td>
                                    </tr>
                                ) : (
                                    sales
                                        .filter((s) => s.transaction_number.toLowerCase().includes(search.toLowerCase()))
                                        .map((sale) => (
                                            <tr key={sale.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3.5 font-bold text-slate-900 font-mono text-xs">{sale.transaction_number}</td>
                                                <td className="px-4 py-3.5 text-xs text-slate-500">{new Date(sale.transaction_date).toLocaleString('id-ID')}</td>
                                                <td className="px-4 py-3.5 text-xs">{sale.user?.name}</td>
                                                <td className="px-4 py-3.5 text-xs">{sale.customer?.name || 'Walk-in Customer'}</td>
                                                <td className="px-4 py-3.5 text-right font-bold text-slate-900">{formatCurrency(sale.total)}</td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                                                        sale.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                                                        sale.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {sale.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <button
                                                        onClick={() => handleViewDetail(sale.id)}
                                                        className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1 mx-auto cursor-pointer"
                                                    >
                                                        <Eye size={14} /> Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* DETAIL MODAL */}
                {detailModalOpen && selectedSale && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
                            <div className="flex items-center justify-between border-b pb-3">
                                <h3 className="font-bold text-slate-900 text-lg font-mono">Detail #{selectedSale.transaction_number}</h3>
                                <button onClick={() => setDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 text-sm">
                                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl">
                                    <div><span className="text-slate-400">Kasir:</span> <span className="font-semibold text-slate-800">{selectedSale.user?.name}</span></div>
                                    <div><span className="text-slate-400">Pelanggan:</span> <span className="font-semibold text-slate-800">{selectedSale.customer?.name}</span></div>
                                    <div><span className="text-slate-400">Waktu:</span> <span className="font-semibold text-slate-800">{new Date(selectedSale.transaction_date).toLocaleString('id-ID')}</span></div>
                                    <div><span className="text-slate-400">Status:</span> <span className="font-bold text-emerald-600">{selectedSale.status}</span></div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-400 uppercase">Item Terbeli</p>
                                    {selectedSale.items?.map((item) => (
                                        <div key={item.id} className="flex justify-between p-2 bg-slate-50 rounded-lg text-xs">
                                            <span>{item.item_name} x{item.quantity}</span>
                                            <span className="font-semibold">{formatCurrency(item.total)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-2 border-t space-y-1 text-xs text-slate-700">
                                    <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(selectedSale.subtotal)}</span></div>
                                    <div className="flex justify-between"><span>Diskon:</span><span>{formatCurrency(selectedSale.discount)}</span></div>
                                    <div className="flex justify-between"><span>Pajak:</span><span>{formatCurrency(selectedSale.tax)}</span></div>
                                    <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t"><span>TOTAL:</span><span>{formatCurrency(selectedSale.total)}</span></div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t">
                                {selectedSale.status === 'COMPLETED' && (
                                    <button
                                        onClick={() => handleCancelSale(selectedSale.id)}
                                        className="py-2 px-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                    >
                                        <Ban size={14} /> Batalkan Transaksi
                                    </button>
                                )}
                                <button
                                    onClick={() => setDetailModalOpen(false)}
                                    className="py-2 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default TransactionsPage;
