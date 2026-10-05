import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../services/api';
import { Boxes, ArrowUpRight, ArrowDownRight, RefreshCw, AlertTriangle, Plus } from 'lucide-react';

const InventoryPage = () => {
    const [items, setItems] = useState([]);
    const [movements, setMovements] = useState([]);
    const [tab, setTab] = useState('stock'); // stock or movements
    const [loading, setLoading] = useState(true);

    // Adjustment form modal
    const [adjModalOpen, setAdjModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState('');
    const [adjType, setAdjType] = useState('ADJUSTMENT_IN');
    const [adjQty, setAdjQty] = useState('1');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [iRes, mRes] = await Promise.all([
                api.get('/inventory'),
                api.get('/inventory/movements'),
            ]);
            setItems(iRes.data.data || iRes.data);
            setMovements(mRes.data.data || mRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdjustment = async (e) => {
        e.preventDefault();
        try {
            await api.post('/inventory/adjustment', {
                item_id: selectedItem,
                type: adjType,
                quantity: parseFloat(adjQty),
                notes,
            });
            alert('Penyesuaian stok berhasil disimpan.');
            setAdjModalOpen(false);
            loadData();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menyimpan stok.');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Inventory & Stok</h1>
                        <p className="text-sm text-slate-500">Kontrol stok fisik barang, opname, dan riwayat pergerakan stok</p>
                    </div>
                    <button
                        onClick={() => setAdjModalOpen(true)}
                        className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <RefreshCw size={18} /> Penyesuaian Stok (Opname)
                    </button>
                </div>

                <div className="flex space-x-2 border-b border-slate-200">
                    <button
                        onClick={() => setTab('stock')}
                        className={`py-2.5 px-4 font-semibold text-sm border-b-2 transition-colors ${
                            tab === 'stock' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'
                        }`}
                    >
                        Stok Produk Saat Ini
                    </button>
                    <button
                        onClick={() => setTab('movements')}
                        className={`py-2.5 px-4 font-semibold text-sm border-b-2 transition-colors ${
                            tab === 'movements' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'
                        }`}
                    >
                        Riwayat Pergerakan Stok
                    </button>
                </div>

                {tab === 'stock' ? (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-slate-400 text-xs font-semibold uppercase">
                                    <tr>
                                        <th className="px-4 py-3">Produk</th>
                                        <th className="px-4 py-3">SKU</th>
                                        <th className="px-4 py-3 text-center">Minimum Stok</th>
                                        <th className="px-4 py-3 text-center">Stok Fisik</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {items.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3.5 font-medium text-slate-900">{item.name}</td>
                                            <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{item.sku || '-'}</td>
                                            <td className="px-4 py-3.5 text-center text-xs">{item.minimum_stock}</td>
                                            <td className="px-4 py-3.5 text-center font-bold text-slate-900">{item.stock} {item.unit?.symbol}</td>
                                            <td className="px-4 py-3.5 text-center">
                                                {item.stock <= item.minimum_stock ? (
                                                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold inline-flex items-center gap-1">
                                                        <AlertTriangle size={12} /> Menipis
                                                    </span>
                                                ) : (
                                                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">
                                                        Aman
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-slate-400 text-xs font-semibold uppercase">
                                    <tr>
                                        <th className="px-4 py-3">Waktu</th>
                                        <th className="px-4 py-3">Produk</th>
                                        <th className="px-4 py-3">Tipe Pergerakan</th>
                                        <th className="px-4 py-3 text-center">Perubahan</th>
                                        <th className="px-4 py-3">Catatan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {movements.map((m) => (
                                        <tr key={m.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3.5 text-xs text-slate-500">{new Date(m.created_at).toLocaleString('id-ID')}</td>
                                            <td className="px-4 py-3.5 font-medium text-slate-900">{m.item?.name}</td>
                                            <td className="px-4 py-3.5">
                                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">
                                                    {m.type}
                                                </span>
                                            </td>
                                            <td className={`px-4 py-3.5 text-center font-bold ${m.quantity > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                                            </td>
                                            <td className="px-4 py-3.5 text-xs text-slate-500">{m.notes || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Adjustment Modal */}
                {adjModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
                            <h3 className="font-bold text-slate-900 text-lg">Penyesuaian Stok (Opname)</h3>
                            <form onSubmit={handleAdjustment} className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Pilih Produk</label>
                                    <select
                                        value={selectedItem}
                                        onChange={(e) => setSelectedItem(e.target.value)}
                                        className="w-full py-2 px-3 border border-slate-300 rounded-xl text-sm"
                                        required
                                    >
                                        <option value="">Pilih Produk...</option>
                                        {items.map((i) => (
                                            <option key={i.id} value={i.id}>{i.name} (Stok: {i.stock})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Jenis Penyesuaian</label>
                                    <select
                                        value={adjType}
                                        onChange={(e) => setAdjType(e.target.value)}
                                        className="w-full py-2 px-3 border border-slate-300 rounded-xl text-sm"
                                    >
                                        <option value="ADJUSTMENT_IN">Stok Masuk (+) / Tambah</option>
                                        <option value="ADJUSTMENT_OUT">Stok Keluar (-) / Kurang</option>
                                        <option value="DAMAGE">Barang Rusak / Rusak (-)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Jumlah</label>
                                    <input
                                        type="number"
                                        value={adjQty}
                                        onChange={(e) => setAdjQty(e.target.value)}
                                        className="w-full py-2 px-3 border border-slate-300 rounded-xl text-sm"
                                        required
                                        min="0.01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Catatan</label>
                                    <input
                                        type="text"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Alasan opname stok..."
                                        className="w-full py-2 px-3 border border-slate-300 rounded-xl text-sm"
                                    />
                                </div>
                                <div className="flex justify-end space-x-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setAdjModalOpen(false)}
                                        className="py-2 px-4 bg-slate-100 rounded-xl text-sm font-semibold text-slate-600"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md"
                                    >
                                        Simpan Opname
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default InventoryPage;
