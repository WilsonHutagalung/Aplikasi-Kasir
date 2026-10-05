import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../services/api';
import { Users, Truck, Plus, Trash2, Edit2, Phone, Mail, MapPin } from 'lucide-react';

const CustomersPage = () => {
    const [tab, setTab] = useState('customers'); // customers or suppliers
    const [customers, setCustomers] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [cRes, sRes] = await Promise.all([api.get('/customers'), api.get('/suppliers')]);
            setCustomers(cRes.data);
            setSuppliers(sRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pelanggan & Supplier</h1>
                    <p className="text-sm text-slate-500">Kelola riwayat kontak pelanggan toko dan daftar supplier barang</p>
                </div>

                <div className="flex space-x-2 border-b border-slate-200">
                    <button
                        onClick={() => setTab('customers')}
                        className={`py-2.5 px-4 font-semibold text-sm border-b-2 transition-colors ${
                            tab === 'customers' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'
                        }`}
                    >
                        Pelanggan ({customers.length})
                    </button>
                    <button
                        onClick={() => setTab('suppliers')}
                        className={`py-2.5 px-4 font-semibold text-sm border-b-2 transition-colors ${
                            tab === 'suppliers' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'
                        }`}
                    >
                        Supplier ({suppliers.length})
                    </button>
                </div>

                {tab === 'customers' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {customers.map((c) => (
                            <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
                                    <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded">
                                        {c.sales_count || 0} Transaksi
                                    </span>
                                </div>
                                <div className="space-y-1 text-xs text-slate-500">
                                    <p className="flex items-center gap-1.5"><Phone size={14} /> {c.phone || '-'}</p>
                                    <p className="flex items-center gap-1.5"><Mail size={14} /> {c.email || '-'}</p>
                                    <p className="flex items-center gap-1.5"><MapPin size={14} /> {c.address || '-'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {suppliers.map((s) => (
                            <div key={s.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                                <h3 className="font-bold text-slate-900 text-base">{s.name}</h3>
                                <div className="space-y-1 text-xs text-slate-500">
                                    <p className="flex items-center gap-1.5"><Phone size={14} /> {s.phone || '-'}</p>
                                    <p className="flex items-center gap-1.5"><Mail size={14} /> {s.email || '-'}</p>
                                    <p className="flex items-center gap-1.5"><MapPin size={14} /> {s.address || '-'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CustomersPage;
