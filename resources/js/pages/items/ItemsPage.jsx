import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../services/api';
import { Package, Plus, Search, Edit2, Trash2, Tag, Layers, CheckCircle, AlertTriangle, X } from 'lucide-react';

const generateSkuCode = (name, type, categoryName) => {
    const prefix = type === 'SERVICE' ? 'SRV' : 'PRD';
    const nameCode = (name || 'ITEM')
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '')
        .slice(0, 6) || 'ITEM';
    const categoryCode = (categoryName || 'GEN')
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '')
        .slice(0, 3) || 'GEN';
    const uniqueSuffix = Date.now().toString().slice(-4);

    return `${prefix}-${categoryCode}-${nameCode}-${uniqueSuffix}`;
};

const generateBarcodeCode = () => {
    const timestampPart = Date.now().toString();
    const randomPart = Math.floor(Math.random() * 90 + 10).toString();

    return `${timestampPart}${randomPart}`.slice(-13);
};

const ItemsPage = () => {
    const [activeTab, setActiveTab] = useState('items'); // items, categories, units
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    // Modal forms
    const [itemModalOpen, setItemModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [skuTouched, setSkuTouched] = useState(false);
    const [barcodeTouched, setBarcodeTouched] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        type: 'PRODUCT',
        sku: '',
        barcode: '',
        category_id: '',
        unit_id: '',
        purchase_price: '0',
        selling_price: '0',
        minimum_stock: '0',
        stock: '0',
        description: '',
        track_stock: true,
    });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [itemsRes, catRes, unitRes] = await Promise.all([
                api.get('/items'),
                api.get('/categories'),
                api.get('/units'),
            ]);
            setItems(itemsRes.data.data || itemsRes.data);
            setCategories(catRes.data);
            setUnits(unitRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveItem = async (e) => {
        e.preventDefault();
        try {
            const payload = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    payload.append(key, value);
                }
            });

            if (imageFile) {
                payload.append('image', imageFile);
            }

            if (editingItem) {
                payload.append('_method', 'PUT');
                await api.post(`/items/${editingItem.id}`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await api.post('/items', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            setItemModalOpen(false);
            resetForm();
            fetchAllData();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menyimpan item.');
        }
    };

    const handleDeleteItem = async (id) => {
        if (!confirm('Yakin menghapus produk/jasa ini?')) return;
        try {
            await api.delete(`/items/${id}`);
            fetchAllData();
        } catch (err) {
            alert('Gagal menghapus item.');
        }
    };

    const resetForm = () => {
        setEditingItem(null);
        setSkuTouched(false);
        setBarcodeTouched(false);
        setImageFile(null);
        setImagePreview('');
        setFormData({
            name: '',
            type: 'PRODUCT',
            sku: generateSkuCode('', 'PRODUCT', ''),
            barcode: generateBarcodeCode(),
            category_id: '',
            unit_id: '',
            purchase_price: '0',
            selling_price: '0',
            minimum_stock: '0',
            stock: '0',
            description: '',
            track_stock: true,
        });
    };

    const openEditItem = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            type: item.type,
            sku: item.sku || '',
            barcode: item.barcode || '',
            category_id: item.category_id || '',
            unit_id: item.unit_id || '',
            purchase_price: item.purchase_price,
            selling_price: item.selling_price,
            minimum_stock: item.minimum_stock,
            stock: item.stock,
            description: item.description || '',
            track_stock: item.track_stock,
        });
        setSkuTouched(true);
        setBarcodeTouched(true);
        setImageFile(null);
        setImagePreview(item.image_url || item.image || '');
        setItemModalOpen(true);
    };

    useEffect(() => {
        if (!itemModalOpen || editingItem) {
            return;
        }

        const categoryName = categories.find((category) => String(category.id) === String(formData.category_id))?.name || '';

        setFormData((current) => ({
            ...current,
            sku: skuTouched ? current.sku : generateSkuCode(current.name, current.type, categoryName),
            barcode: barcodeTouched ? current.barcode : current.barcode || generateBarcodeCode(),
        }));
    }, [formData.name, formData.type, formData.category_id, categories, editingItem, itemModalOpen, skuTouched, barcodeTouched]);

    useEffect(() => {
        if (!imageFile) {
            return;
        }

        const nextPreview = URL.createObjectURL(imageFile);
        setImagePreview(nextPreview);

        return () => URL.revokeObjectURL(nextPreview);
    }, [imageFile]);

    const formatCurrency = (val) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Produk & Jasa</h1>
                        <p className="text-sm text-slate-500">Kelola katalog barang fisik, layanan jasa, kategori, dan satuan</p>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setItemModalOpen(true);
                        }}
                        className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Plus size={18} /> Tambah Item Baru
                    </button>
                </div>

                {/* Sub Navigation Tabs */}
                <div className="flex space-x-2 border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('items')}
                        className={`py-2.5 px-4 font-semibold text-sm border-b-2 transition-colors ${
                            activeTab === 'items'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Daftar Produk & Jasa ({items.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`py-2.5 px-4 font-semibold text-sm border-b-2 transition-colors ${
                            activeTab === 'categories'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Kategori ({categories.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('units')}
                        className={`py-2.5 px-4 font-semibold text-sm border-b-2 transition-colors ${
                            activeTab === 'units'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Satuan Unit ({units.length})
                    </button>
                </div>

                {/* Items Table View */}
                {activeTab === 'items' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
                            <div className="relative w-72">
                                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari produk / barcode / SKU..."
                                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-[13px] text-slate-700 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-[13px] text-slate-600">
                                <thead className="bg-slate-50 text-slate-400 text-[11px] font-bold uppercase tracking-[0.08em]">
                                    <tr>
                                        <th className="px-4 py-3">Gambar</th>
                                        <th className="px-4 py-3">Nama Item</th>
                                        <th className="px-4 py-3">Tipe</th>
                                        <th className="px-4 py-3">SKU / Barcode</th>
                                        <th className="px-4 py-3">Kategori</th>
                                        <th className="px-4 py-3 text-right">Harga Beli</th>
                                        <th className="px-4 py-3 text-right">Harga Jual</th>
                                        <th className="px-4 py-3 text-center">Stok</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {items.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="px-4 py-8 text-center text-slate-400 text-[13px]">Belum ada item</td>
                                        </tr>
                                    ) : (
                                        items
                                            .filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
                                            .map((item) => (
                                                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors align-middle">
                                                    <td className="px-4 py-3.5">
                                                        {item.image_url ? (
                                                            <img
                                                                src={item.image_url}
                                                                alt={item.name}
                                                                className="h-14 w-14 rounded-2xl object-cover border border-slate-200 bg-slate-50 shadow-sm"
                                                            />
                                                        ) : (
                                                            <div className="h-14 w-14 rounded-2xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-300 shadow-sm">
                                                                <Package size={19} />
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3.5 font-semibold text-slate-900 leading-snug">{item.name}</td>
                                                    <td className="px-4 py-3.5">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${
                                                            item.type === 'SERVICE' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                            {item.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-slate-500 font-mono text-[12px]">{item.barcode || item.sku || '-'}</td>
                                                    <td className="px-4 py-3.5 text-slate-600 text-[13px] leading-snug">{item.category?.name || '-'}</td>
                                                    <td className="px-4 py-3.5 text-right font-mono text-[12px] text-slate-700">{formatCurrency(item.purchase_price)}</td>
                                                    <td className="px-4 py-3.5 text-right font-medium text-slate-900 text-[13px]">{formatCurrency(item.selling_price)}</td>
                                                    <td className="px-4 py-3.5 text-center text-[13px] text-slate-800">
                                                        {item.type === 'SERVICE' ? '-' : (
                                                            <span className={item.stock <= item.minimum_stock ? 'text-red-600 font-medium' : 'text-slate-800 font-medium'}>
                                                                {item.stock} {item.unit?.symbol || ''}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center">
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <button onClick={() => openEditItem(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                                <Edit2 size={15} />
                                                            </button>
                                                            <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>
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

            {/* CREATE / EDIT ITEM MODAL */}
            {itemModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-bold text-slate-900 text-lg">{editingItem ? 'Edit Item' : 'Tambah Produk / Jasa Baru'}</h3>
                            <button onClick={() => setItemModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveItem} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Gambar Item</label>
                                    <div className="flex items-start gap-4">
                                        <div className="h-24 w-24 rounded-2xl border border-dashed border-slate-300 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview item" className="h-full w-full object-cover" />
                                            ) : (
                                                <Package className="text-slate-300" size={28} />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
                                            />
                                            <p className="text-[11px] text-slate-400">Format: JPG, PNG, WEBP. Maksimal 2 MB.</p>
                                            {imagePreview && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setImageFile(null);
                                                        setImagePreview('');
                                                        if (editingItem) {
                                                            setFormData((current) => ({ ...current }));
                                                        }
                                                    }}
                                                    className="text-xs font-semibold text-red-600 hover:text-red-700"
                                                >
                                                    Hapus preview
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nama Item</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full py-2 px-3 border border-slate-300 rounded-xl text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tipe</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full py-2 px-3 border border-slate-300 rounded-xl text-sm"
                                    >
                                        <option value="PRODUCT">PRODUCT (Fisik / Barang)</option>
                                        <option value="SERVICE">SERVICE (Jasa / Layanan)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Kategori</label>
                                    <select
                                        value={formData.category_id}
                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                        className="w-full py-2 px-3 border border-slate-300 rounded-xl text-sm"
                                    >
                                        <option value="">Pilih Kategori</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">SKU Kode</label>
                                    <input
                                        type="text"
                                        value={formData.sku}
                                        onChange={(e) => {
                                            setSkuTouched(true);
                                            setFormData({ ...formData, sku: e.target.value });
                                        }}
                                        className="w-full py-2 px-3 border border-slate-300 rounded-xl text-sm font-mono"
                                    />
                                    <p className="mt-1 text-[11px] text-slate-400">Otomatis dibuat saat item baru ditambahkan, tapi tetap bisa diedit manual.</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Barcode Scanner</label>
                                    <input
                                        type="text"
                                        value={formData.barcode}
                                        onChange={(e) => {
                                            setBarcodeTouched(true);
                                            setFormData({ ...formData, barcode: e.target.value });
                                        }}
                                        className="w-full py-2 px-3 border border-slate-300 rounded-xl text-sm font-mono"
                                    />
                                    <p className="mt-1 text-[11px] text-slate-400">Barcode dibuat otomatis untuk mempermudah input dan scanning.</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Harga Beli (Modal)</label>
                                    <input
                                        type="number"
                                        value={formData.purchase_price}
                                        onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                                        className="w-full py-2 px-3 border border-slate-300 rounded-xl text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Harga Jual</label>
                                    <input
                                        type="number"
                                        value={formData.selling_price}
                                        onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                                        className="w-full py-2 px-3 border border-slate-300 rounded-xl text-sm font-bold text-slate-900"
                                        required
                                    />
                                </div>
                                {formData.type === 'PRODUCT' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Stok Awal</label>
                                            <input
                                                type="number"
                                                value={formData.stock}
                                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                                className="w-full py-2 px-3 border border-slate-300 rounded-xl text-sm"
                                                disabled={!!editingItem}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Minimum Stok Warning</label>
                                            <input
                                                type="number"
                                                value={formData.minimum_stock}
                                                onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
                                                className="w-full py-2 px-3 border border-slate-300 rounded-xl text-sm"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm mt-4 shadow-md shadow-blue-600/20 cursor-pointer"
                            >
                                Simpan Item
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default ItemsPage;
