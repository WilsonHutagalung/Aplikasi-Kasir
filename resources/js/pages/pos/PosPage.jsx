import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import {
    Search,
    Barcode,
    Plus,
    Minus,
    Trash2,
    PauseCircle,
    CheckCircle2,
    Printer,
    X,
    User,
    Percent,
    CreditCard,
    DollarSign,
    RotateCcw,
    Package
} from 'lucide-react';

const PosPage = () => {
    const {
        cart,
        customer,
        setCustomer,
        discount,
        setDiscount,
        taxRate,
        setTaxRate,
        notes,
        setNotes,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        loadHeldTransaction,
        subtotal,
        grandTotal,
    } = useCart();

    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // Modals & Held transactions
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [heldModalOpen, setHeldModalOpen] = useState(false);
    const [heldList, setHeldList] = useState([]);
    const [receiptSale, setReceiptSale] = useState(null);

    // Payment fields
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [paidAmount, setPaidAmount] = useState('');
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [checkoutError, setCheckoutError] = useState('');

    const searchInputRef = useRef(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    // Handle Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F2') {
                e.preventDefault();
                searchInputRef.current?.focus();
            } else if (e.key === 'F4') {
                e.preventDefault();
                handleHoldTransaction();
            } else if (e.key === 'F8') {
                e.preventDefault();
                if (cart.length > 0) setPaymentModalOpen(true);
            } else if (e.key === 'Escape') {
                setPaymentModalOpen(false);
                setHeldModalOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart, grandTotal]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [itemsRes, catRes, custRes, setRes] = await Promise.all([
                api.get('/pos/items'),
                api.get('/categories'),
                api.get('/customers'),
                api.get('/settings'),
            ]);

            setItems(itemsRes.data);
            setCategories(catRes.data);
            setCustomers(custRes.data);
            setPaymentMethods(setRes.data.payment_methods || []);

            if (setRes.data.payment_methods?.length > 0) {
                setSelectedPaymentMethod(setRes.data.payment_methods[0].id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Auto barcode search on Enter or scan
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        const exactMatch = items.find(
            (i) =>
                (i.barcode && i.barcode.toLowerCase() === searchQuery.trim().toLowerCase()) ||
                (i.sku && i.sku.toLowerCase() === searchQuery.trim().toLowerCase())
        );

        if (exactMatch) {
            addToCart(exactMatch, 1);
            setSearchQuery('');
        }
    };

    const filteredItems = items.filter((item) => {
        const matchesCategory = !selectedCategory || item.category_id === parseInt(selectedCategory);
        const matchesSearch =
            !searchQuery ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.barcode && item.barcode.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const handleHoldTransaction = async () => {
        if (cart.length === 0) return;
        try {
            await api.post('/pos/hold', {
                customer_id: customer?.id,
                discount,
                tax: (subtotal - discount) * (taxRate / 100),
                notes,
                items: cart,
            });
            clearCart();
            alert('Transaksi berhasil di-hold!');
        } catch (err) {
            alert('Gagal hold transaksi.');
        }
    };

    const fetchHeldTransactions = async () => {
        try {
            const res = await api.get('/pos/held');
            setHeldList(res.data);
            setHeldModalOpen(true);
        } catch (err) {
            alert('Gagal memuat hold transaksi.');
        }
    };

    const handleProcessCheckout = async (e) => {
        e.preventDefault();
        setCheckoutError('');
        setCheckoutLoading(true);

        const numericPaid = parseFloat(paidAmount) || 0;
        if (numericPaid < grandTotal) {
            setCheckoutError('Uang pembayaran kurang dari total belanja.');
            setCheckoutLoading(false);
            return;
        }

        try {
            const payload = {
                customer_id: customer?.id,
                discount,
                tax: (subtotal - discount) * (taxRate / 100),
                paid_amount: numericPaid,
                notes,
                items: cart,
                payments: [
                    {
                        payment_method_id: selectedPaymentMethod,
                        amount: grandTotal,
                    },
                ],
            };

            const res = await api.post('/pos/checkout', payload);
            setReceiptSale(res.data.sale);
            setPaymentModalOpen(false);
            clearCart();
            setPaidAmount('');
            fetchInitialData(); // refresh stock balances
        } catch (err) {
            setCheckoutError(err.response?.data?.message || 'Gagal menyelesaikan checkout.');
        } finally {
            setCheckoutLoading(false);
        }
    };

    const formatCurrency = (val) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

    const changeAmount = Math.max(0, (parseFloat(paidAmount) || 0) - grandTotal);

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-5rem)] flex flex-col lg:flex-row gap-4">
                {/* LEFT SIDE: Items Grid & Controls */}
                <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    {/* Search & Shortcuts Bar */}
                    <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between bg-slate-50/50">
                        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] relative">
                            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Scan Barcode / Cari Nama / SKU (F2)..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-2xs"
                            />
                        </form>

                        {/* Category Pills */}
                        <div className="flex items-center space-x-1.5 overflow-x-auto py-1 max-w-full">
                            <button
                                onClick={() => setSelectedCategory('')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                                    !selectedCategory ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Semua
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                                        selectedCategory === cat.id ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 content-start">
                        {loading ? (
                            <div className="col-span-full py-12 text-center text-slate-400 text-sm">Memuat produk...</div>
                        ) : filteredItems.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-slate-400 text-sm">Tidak ada produk ditemukan</div>
                        ) : (
                            filteredItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => addToCart(item, 1)}
                                    className="bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md p-3 rounded-xl text-left flex flex-col gap-3 transition-all group cursor-pointer relative overflow-hidden"
                                >
                                    <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-100 relative">
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className={`h-full w-full flex items-center justify-center ${item.type === 'SERVICE' ? 'bg-gradient-to-br from-purple-50 to-slate-100' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
                                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${item.type === 'SERVICE' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    <Package size={28} />
                                                </div>
                                            </div>
                                        )}
                                        <span className={`absolute top-2 left-2 inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase shadow-sm ${
                                            item.type === 'SERVICE' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {item.type === 'SERVICE' ? 'Jasa' : `Stok: ${item.stock}`}
                                        </span>
                                    </div>
                                    <div className="min-h-[3.5rem]">
                                        <h4 className="font-semibold text-slate-800 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                                            {item.name}
                                        </h4>
                                        <p className="mt-1 text-[11px] text-slate-400 font-medium line-clamp-1">
                                            {item.category?.name || 'Tanpa kategori'}
                                        </p>
                                    </div>
                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                        <span className="font-bold text-slate-900 text-sm">{formatCurrency(item.selling_price)}</span>
                                        <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                                            <Plus size={14} />
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE: Current Cart Order */}
                <div className="w-full lg:w-96 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
                    {/* Cart Header & Customer Selector */}
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-slate-900 flex items-center gap-2">
                                <Barcode size={18} className="text-blue-600" /> Current Order
                            </h2>
                            <button
                                onClick={fetchHeldTransactions}
                                className="text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1"
                            >
                                <PauseCircle size={14} /> Hold Orders
                            </button>
                        </div>

                        {/* Customer Dropdown */}
                        <div className="flex items-center space-x-2">
                            <User size={16} className="text-slate-400 shrink-0" />
                            <select
                                value={customer?.id || ''}
                                onChange={(e) => {
                                    const c = customers.find((cust) => cust.id === parseInt(e.target.value));
                                    setCustomer(c || null);
                                }}
                                className="w-full text-xs py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-slate-700"
                            >
                                <option value="">Walk-in Customer (Umum)</option>
                                {customers.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Cart Items List */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 text-center space-y-2">
                                <Barcode size={48} strokeWidth={1.5} />
                                <p className="text-xs text-slate-400 font-medium">Keranjang belanja kosong.<br/>Pilih item dari grid atau scan barcode.</p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item.item_id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-sm">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <h5 className="font-semibold text-slate-800 text-xs truncate">{item.name}</h5>
                                        <p className="text-xs text-slate-500 font-medium">{formatCurrency(item.unit_price)}</p>
                                    </div>

                                    {/* Qty Controls */}
                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={() => updateQuantity(item.item_id, item.quantity - 1)}
                                            className="w-6 h-6 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-600 hover:bg-slate-100"
                                        >
                                            <Minus size={12} />
                                        </button>
                                        <span className="w-8 text-center text-xs font-bold text-slate-800">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.item_id, item.quantity + 1)}
                                            className="w-6 h-6 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-600 hover:bg-slate-100"
                                        >
                                            <Plus size={12} />
                                        </button>
                                        <button
                                            onClick={() => removeFromCart(item.item_id)}
                                            className="p-1 text-slate-400 hover:text-red-600 ml-1"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Order Summary & Actions */}
                    <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-3">
                        <div className="space-y-1.5 text-xs text-slate-600">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-semibold">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Diskon Transaksi (Rp)</span>
                                <input
                                    type="number"
                                    value={discount || ''}
                                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-20 text-right px-2 py-0.5 text-xs border border-slate-200 rounded bg-white"
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Pajak PPN (%)</span>
                                <input
                                    type="number"
                                    value={taxRate || ''}
                                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-14 text-right px-2 py-0.5 text-xs border border-slate-200 rounded bg-white"
                                />
                            </div>
                            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                                <span>Total Tagihan</span>
                                <span className="text-blue-600">{formatCurrency(grandTotal)}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                                onClick={handleHoldTransaction}
                                disabled={cart.length === 0}
                                className="py-2.5 px-3 bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                <PauseCircle size={15} /> Hold (F4)
                            </button>
                            <button
                                onClick={() => setPaymentModalOpen(true)}
                                disabled={cart.length === 0}
                                className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-all disabled:opacity-50 cursor-pointer"
                            >
                                <CreditCard size={15} /> Bayar (F8)
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* PAYMENT MODAL */}
            {paymentModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                <DollarSign size={20} className="text-blue-600" /> Pembayaran Transaksi
                            </h3>
                            <button onClick={() => setPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl text-center space-y-1">
                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total Yang Harus Dibayar</p>
                            <p className="text-3xl font-extrabold text-blue-900">{formatCurrency(grandTotal)}</p>
                        </div>

                        {checkoutError && (
                            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200 font-medium">
                                {checkoutError}
                            </div>
                        )}

                        <form onSubmit={handleProcessCheckout} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Metode Pembayaran</label>
                                <select
                                    value={selectedPaymentMethod}
                                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium"
                                >
                                    {paymentMethods.map((pm) => (
                                        <option key={pm.id} value={pm.id}>{pm.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Uang Diterima (Rp)</label>
                                <input
                                    type="number"
                                    value={paidAmount}
                                    onChange={(e) => setPaidAmount(e.target.value)}
                                    placeholder="0"
                                    className="w-full py-2.5 px-3 border border-slate-300 rounded-xl text-lg font-bold text-slate-900 focus:ring-2 focus:ring-blue-600"
                                    required
                                />
                            </div>

                            {/* Quick Money Buttons */}
                            <div className="flex flex-wrap gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setPaidAmount(grandTotal.toString())}
                                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                                >
                                    Uang Pas
                                </button>
                                {[20000, 50000, 100000].map((amt) => (
                                    <button
                                        key={amt}
                                        type="button"
                                        onClick={() => setPaidAmount(amt.toString())}
                                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                                    >
                                        {formatCurrency(amt)}
                                    </button>
                                ))}
                            </div>

                            {/* Change Output */}
                            <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-sm font-bold">
                                <span className="text-slate-600">Kembalian</span>
                                <span className={changeAmount >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                    {formatCurrency(changeAmount)}
                                </span>
                            </div>

                            <button
                                type="submit"
                                disabled={checkoutLoading}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all text-sm cursor-pointer disabled:opacity-50"
                            >
                                {checkoutLoading ? 'Memproses Transaksi...' : 'Selesaikan Transaksi (Cetak Struk)'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* HELD TRANSACTIONS MODAL */}
            {heldModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                <PauseCircle size={20} className="text-amber-600" /> Transaksi Tertunda (Hold)
                            </h3>
                            <button onClick={() => setHeldModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2">
                            {heldList.length === 0 ? (
                                <p className="text-center text-slate-400 py-8 text-sm">Tidak ada transaksi held</p>
                            ) : (
                                heldList.map((sale) => (
                                    <div key={sale.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{sale.transaction_number}</p>
                                            <p className="text-xs text-slate-500">Total: {formatCurrency(sale.total)} • {sale.items?.length || 0} Item</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                loadHeldTransaction(sale);
                                                setHeldModalOpen(false);
                                            }}
                                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                                        >
                                            Ambil Order
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* THERMAL RECEIPT SUCCESS MODAL & PRINT VIEW */}
            {receiptSale && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
                        <div className="text-center space-y-1">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 size={28} />
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg">Transaksi Sukses!</h3>
                            <p className="text-xs text-slate-500">Struk siap dicetak untuk pelanggan</p>
                        </div>

                        {/* Thermal Printable Content */}
                        <div id="thermal-receipt" className="bg-slate-50 p-4 border border-dashed border-slate-300 rounded-xl text-xs font-mono space-y-2">
                            <div className="text-center border-b pb-2">
                                <p className="font-bold text-sm">TOKO MAJU JAYA</p>
                                <p>Samarinda, Kaltim</p>
                                <p className="mt-1">{receiptSale.transaction_number}</p>
                                <p>{new Date(receiptSale.transaction_date).toLocaleString('id-ID')}</p>
                            </div>

                            <div className="space-y-1 border-b pb-2">
                                {receiptSale.items?.map((it, idx) => (
                                    <div key={idx} className="flex justify-between">
                                        <span>{it.item_name} x{it.quantity}</span>
                                        <span>{formatCurrency(it.total)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-1 pt-1">
                                <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(receiptSale.subtotal)}</span></div>
                                <div className="flex justify-between"><span>Diskon:</span><span>{formatCurrency(receiptSale.discount)}</span></div>
                                <div className="flex justify-between font-bold text-sm pt-1 border-t"><span>TOTAL:</span><span>{formatCurrency(receiptSale.total)}</span></div>
                                <div className="flex justify-between"><span>Tunai:</span><span>{formatCurrency(receiptSale.paid_amount)}</span></div>
                                <div className="flex justify-between"><span>Kembali:</span><span>{formatCurrency(receiptSale.change_amount)}</span></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2">
                            <button
                                onClick={() => window.print()}
                                className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                            >
                                <Printer size={16} /> Cetak Struk
                            </button>
                            <button
                                onClick={() => setReceiptSale(null)}
                                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                            >
                                Selesai
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default PosPage;
