import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../services/api';
import { Settings, Database, Save, Download, RefreshCcw, Check, Building } from 'lucide-react';

const SettingsPage = () => {
    const [tab, setTab] = useState('business'); // business or backups
    const [settings, setSettings] = useState({
        business_name: '',
        business_address: '',
        business_phone: '',
        currency: 'Rp',
        receipt_footer: '',
        invoice_prefix: 'INV',
        enable_negative_stock: '0',
    });
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savedMsg, setSavedMsg] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [sRes, bRes] = await Promise.all([api.get('/settings'), api.get('/backups')]);
            if (sRes.data.settings) {
                setSettings((prev) => ({ ...prev, ...sRes.data.settings }));
            }
            setBackups(bRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        try {
            await api.post('/settings', { settings });
            setSavedMsg('Pengaturan berhasil disimpan!');
            setTimeout(() => setSavedMsg(''), 3000);
        } catch (err) {
            alert('Gagal menyimpan pengaturan.');
        }
    };

    const handleCreateBackup = async () => {
        try {
            const res = await api.post('/backups');
            alert('Database backup berhasil dibuat: ' + res.data.backup.filename);
            loadData();
        } catch (err) {
            alert('Gagal membuat backup.');
        }
    };

    const handleRestoreBackup = async (filename) => {
        if (!confirm(`Peringatan! Yakin restore database dari file ${filename}? Sistem akan membuat backup otomatis terlebih dahulu.`)) return;
        try {
            await api.post('/backups/restore', { filename });
            alert('Restore database berhasil!');
            window.location.reload();
        } catch (err) {
            alert('Gagal restore database.');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pengaturan Sistem & Backup</h1>
                    <p className="text-sm text-slate-500">Konfigurasi nama toko, format struk, dan backup/restore database lokal</p>
                </div>

                <div className="flex space-x-2 border-b border-slate-200">
                    <button
                        onClick={() => setTab('business')}
                        className={`py-2.5 px-4 font-semibold text-sm border-b-2 transition-colors ${
                            tab === 'business' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'
                        }`}
                    >
                        Profil Bisnis & Struk
                    </button>
                    <button
                        onClick={() => setTab('backups')}
                        className={`py-2.5 px-4 font-semibold text-sm border-b-2 transition-colors ${
                            tab === 'backups' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'
                        }`}
                    >
                        Backup & Restore Database ({backups.length})
                    </button>
                </div>

                {tab === 'business' ? (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-2xl">
                        {savedMsg && (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-xl mb-4 font-semibold flex items-center gap-1.5">
                                <Check size={16} /> {savedMsg}
                            </div>
                        )}

                        <form onSubmit={handleSaveSettings} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nama Usaha / Toko</label>
                                <input
                                    type="text"
                                    value={settings.business_name}
                                    onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                                    className="w-full py-2 px-3 border border-slate-300 rounded-xl text-sm font-semibold"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Alamat Toko</label>
                                <textarea
                                    value={settings.business_address}
                                    onChange={(e) => setSettings({ ...settings, business_address: e.target.value })}
                                    className="w-full py-2 px-3 border border-slate-300 rounded-xl text-sm"
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nomor Telepon</label>
                                    <input
                                        type="text"
                                        value={settings.business_phone}
                                        onChange={(e) => setSettings({ ...settings, business_phone: e.target.value })}
                                        className="w-full py-2 px-3 border border-slate-300 rounded-xl text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Prefix Struk (Invoice Prefix)</label>
                                    <input
                                        type="text"
                                        value={settings.invoice_prefix}
                                        onChange={(e) => setSettings({ ...settings, invoice_prefix: e.target.value })}
                                        className="w-full py-2 px-3 border border-slate-300 rounded-xl text-sm font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Pesan Footer Struk (Thermal Receipt)</label>
                                <input
                                    type="text"
                                    value={settings.receipt_footer}
                                    onChange={(e) => setSettings({ ...settings, receipt_footer: e.target.value })}
                                    className="w-full py-2 px-3 border border-slate-300 rounded-xl text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Izinkan Stok Negatif (Negative Stock)</label>
                                <select
                                    value={settings.enable_negative_stock}
                                    onChange={(e) => setSettings({ ...settings, enable_negative_stock: e.target.value })}
                                    className="w-full py-2 px-3 border border-slate-300 rounded-xl text-sm"
                                >
                                    <option value="0">Tidak (Stok tidak boleh minus)</option>
                                    <option value="1">Ya (Izinkan checkout walaupun stok habis)</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
                            >
                                <Save size={16} /> Simpan Pengaturan
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">Backup Database Lokal</h3>
                                <p className="text-xs text-slate-500">Buat file dump SQL database secara instant</p>
                            </div>
                            <button
                                onClick={handleCreateBackup}
                                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md flex items-center gap-2 cursor-pointer"
                            >
                                <Database size={16} /> Buat Backup Sekarang
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-slate-400 text-xs font-semibold uppercase">
                                    <tr>
                                        <th className="px-4 py-3">File Backup</th>
                                        <th className="px-4 py-3">Ukuran</th>
                                        <th className="px-4 py-3">Waktu Pembuatan</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {backups.length === 0 ? (
                                        <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Belum ada file backup</td></tr>
                                    ) : (
                                        backups.map((b) => (
                                            <tr key={b.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-800">{b.filename}</td>
                                                <td className="px-4 py-3.5 text-xs">{(b.size / 1024).toFixed(1)} KB</td>
                                                <td className="px-4 py-3.5 text-xs text-slate-500">{new Date(b.created_at).toLocaleString('id-ID')}</td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <button
                                                        onClick={() => handleRestoreBackup(b.filename)}
                                                        className="px-3 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-semibold flex items-center gap-1 mx-auto cursor-pointer"
                                                    >
                                                        <RefreshCcw size={14} /> Restore
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default SettingsPage;
