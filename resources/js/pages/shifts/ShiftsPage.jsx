import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../services/api';
import { Clock, Play, Square, CheckCircle, DollarSign, AlertCircle } from 'lucide-react';

const ShiftsPage = () => {
    const [currentShift, setCurrentShift] = useState(null);
    const [shiftHistory, setShiftHistory] = useState([]);
    const [openingCash, setOpeningCash] = useState('500000');
    const [actualCash, setActualCash] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadShiftData();
    }, []);

    const loadShiftData = async () => {
        setLoading(true);
        try {
            const [curRes, histRes] = await Promise.all([
                api.get('/shifts/current'),
                api.get('/shifts'),
            ]);
            if (curRes.data.active) {
                setCurrentShift(curRes.data);
            } else {
                setCurrentShift(null);
            }
            setShiftHistory(histRes.data.data || histRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenShift = async (e) => {
        e.preventDefault();
        try {
            await api.post('/shifts/open', { opening_cash: parseFloat(openingCash) });
            alert('Shift kasir berhasil dibuka!');
            loadShiftData();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal membuka shift.');
        }
    };

    const handleCloseShift = async (e) => {
        e.preventDefault();
        try {
            await api.post('/shifts/close', { actual_cash: parseFloat(actualCash) });
            alert('Shift kasir berhasil ditutup!');
            setActualCash('');
            loadShiftData();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menutup shift.');
        }
    };

    const formatCurrency = (val) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Shift Kasir</h1>
                    <p className="text-sm text-slate-500">Buka dan tutup shift kasir, catat modal kas, dan periksa selisih uang tunai</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Active Shift Card / Form */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                        {currentShift ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-3">
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> Shift Aktif
                                    </h3>
                                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-semibold">
                                        OPEN
                                    </span>
                                </div>

                                <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl">
                                    <div className="flex justify-between"><span>Waktu Buka:</span><span className="font-semibold text-slate-900">{new Date(currentShift.shift.opening_date).toLocaleString('id-ID')}</span></div>
                                    <div className="flex justify-between"><span>Kas Awal Modal:</span><span className="font-semibold text-slate-900">{formatCurrency(currentShift.shift.opening_cash)}</span></div>
                                    <div className="flex justify-between"><span>Penjualan Tunai:</span><span className="font-semibold text-emerald-600">{formatCurrency(currentShift.cash_sales)}</span></div>
                                    <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t"><span>Ekspektasi Kas:</span><span>{formatCurrency(currentShift.expected_cash)}</span></div>
                                </div>

                                <form onSubmit={handleCloseShift} className="space-y-3 pt-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Fisik Uang Di Kasir (Actual Cash)</label>
                                        <input
                                            type="number"
                                            value={actualCash}
                                            onChange={(e) => setActualCash(e.target.value)}
                                            placeholder="Hitung total fisik uang tunai..."
                                            className="w-full py-2.5 px-3 border border-slate-300 rounded-xl text-sm font-bold"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm shadow-md cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        <Square size={16} /> Tutup Shift Kasir
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <form onSubmit={handleOpenShift} className="space-y-4">
                                <div className="border-b pb-3">
                                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                        <Clock size={20} className="text-blue-600" /> Buka Shift Kasir
                                    </h3>
                                    <p className="text-xs text-slate-500">Masukkan modal kas awal di laci kasir</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Modal Kas Awal (Rp)</label>
                                    <input
                                        type="number"
                                        value={openingCash}
                                        onChange={(e) => setOpeningCash(e.target.value)}
                                        className="w-full py-2.5 px-3 border border-slate-300 rounded-xl text-sm font-bold text-slate-900"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <Play size={16} /> Buka Shift Sekarang
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Shift History Table */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        <div className="p-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900 text-base">Riwayat Shift Kasir</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-slate-400 text-xs font-semibold uppercase">
                                    <tr>
                                        <th className="px-4 py-3">Kasir</th>
                                        <th className="px-4 py-3">Waktu Buka / Tutup</th>
                                        <th className="px-4 py-3 text-right">Modal Awal</th>
                                        <th className="px-4 py-3 text-right">Ekspektasi Kas</th>
                                        <th className="px-4 py-3 text-right">Fisik Kas</th>
                                        <th className="px-4 py-3 text-right">Selisih</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {shiftHistory.map((s) => (
                                        <tr key={s.id} className="hover:bg-slate-50 text-xs">
                                            <td className="px-4 py-3.5 font-medium text-slate-900">{s.user?.name}</td>
                                            <td className="px-4 py-3.5 text-slate-500">
                                                <div>Buka: {new Date(s.opening_date).toLocaleString('id-ID')}</div>
                                                {s.closing_date && <div>Tutup: {new Date(s.closing_date).toLocaleString('id-ID')}</div>}
                                            </td>
                                            <td className="px-4 py-3.5 text-right">{formatCurrency(s.opening_cash)}</td>
                                            <td className="px-4 py-3.5 text-right font-semibold">{formatCurrency(s.expected_cash)}</td>
                                            <td className="px-4 py-3.5 text-right font-bold text-slate-900">{formatCurrency(s.actual_cash)}</td>
                                            <td className={`px-4 py-3.5 text-right font-bold ${s.difference < 0 ? 'text-red-600' : s.difference > 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                                                {formatCurrency(s.difference)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ShiftsPage;
