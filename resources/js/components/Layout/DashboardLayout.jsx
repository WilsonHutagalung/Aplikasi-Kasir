import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
    LayoutDashboard,
    ShoppingCart,
    ReceiptText,
    Package,
    Boxes,
    Users,
    Clock,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    UserCheck,
    AlertCircle
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
    const { user, logout, hasPermission } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeShift, setActiveShift] = useState(null);

    useEffect(() => {
        api.get('/shifts/current')
            .then((res) => {
                if (res.data.active) {
                    setActiveShift(res.data.shift);
                } else {
                    setActiveShift(null);
                }
            })
            .catch(() => setActiveShift(null));
    }, [location.pathname]);

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, perm: 'view_dashboard' },
        { name: 'POS Kasir', path: '/pos', icon: ShoppingCart, perm: 'create_transaction' },
        { name: 'Riwayat Transaksi', path: '/transactions', icon: ReceiptText, perm: 'view_transaction' },
        { name: 'Produk & Jasa', path: '/items', icon: Package, perm: 'manage_product' },
        { name: 'Inventory & Stok', path: '/inventory', icon: Boxes, perm: 'manage_inventory' },
        { name: 'Pelanggan & Supplier', path: '/customers', icon: Users, perm: 'manage_customer' },
        { name: 'Shift Kasir', path: '/shifts', icon: Clock, perm: 'manage_shift' },
        { name: 'Laporan', path: '/reports', icon: BarChart3, perm: 'view_report' },
        { name: 'Pengaturan & Backup', path: '/settings', icon: Settings, perm: 'manage_setting' },
    ];

    const filteredNav = navItems.filter((item) => hasPermission(item.perm));

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
            {/* Mobile Header */}
            <div className="md:hidden bg-slate-900 text-white flex items-center justify-between p-4 sticky top-0 z-40 shadow-md">
                <div className="flex items-center space-x-2">
                    <div className="bg-blue-600 p-1.5 rounded-lg text-white font-bold">POS</div>
                    <span className="font-bold tracking-wide">Generic POS</span>
                </div>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded text-slate-300 hover:text-white">
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transform transition-transform duration-200 ease-in-out ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}
            >
                {/* Brand */}
                <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
                    <div className="bg-blue-600 text-white p-2 rounded-xl font-bold shadow-lg shadow-blue-600/30">
                        <ShoppingCart size={22} />
                    </div>
                    <div>
                        <h1 className="font-bold text-white tracking-tight">Offline POS</h1>
                        <p className="text-xs text-slate-400">Generic Cashier System</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {filteredNav.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                <Icon size={18} className={`mr-3 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Shift Status Widget */}
                <div className="px-4 py-3 bg-slate-950/60 border-t border-b border-slate-800 text-xs">
                    {activeShift ? (
                        <div className="flex items-center justify-between text-emerald-400">
                            <div className="flex items-center space-x-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="font-medium">Shift Aktif</span>
                            </div>
                            <button onClick={() => navigate('/shifts')} className="underline hover:text-emerald-300">Detail</button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between text-amber-400">
                            <div className="flex items-center space-x-1.5">
                                <AlertCircle size={14} />
                                <span>Shift belum dibuka</span>
                            </div>
                            <button onClick={() => navigate('/shifts')} className="underline hover:text-amber-300 font-semibold">Buka</button>
                        </div>
                    )}
                </div>

                {/* User Info */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="truncate">
                            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-400 capitalize truncate">{user?.role_name || user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        title="Logout"
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                <div className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">{children}</div>
            </main>
        </div>
    );
};

export default DashboardLayout;
