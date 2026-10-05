import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, Lock, User, AlertCircle } from 'lucide-react';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loginInput, setLoginInput] = useState('kasir');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login({ login: loginInput, password });
            navigate('/pos');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.errors?.login?.[0] || 'Login gagal.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-6">
                <div className="text-center space-y-2">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-600/30">
                        <ShoppingCart size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Offline Generic POS</h1>
                    <p className="text-sm text-slate-500">Masuk ke sistem kasir untuk memulai transaksi</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm">
                        <AlertCircle size={18} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            Username / Email
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                <User size={18} />
                            </span>
                            <input
                                type="text"
                                value={loginInput}
                                onChange={(e) => setLoginInput(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm transition-all"
                                placeholder="Masukkan username..."
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                <Lock size={18} />
                            </span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition-all text-sm flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? <span>Proses Login...</span> : <span>Masuk Kasir</span>}
                    </button>
                </form>

                <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-400 space-y-1">
                    <p>Demo Akun: <span className="font-semibold text-slate-600">owner</span> / <span className="font-semibold text-slate-600">admin</span> / <span className="font-semibold text-slate-600">kasir</span></p>
                    <p>Password: <span className="font-semibold text-slate-600">password</span></p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
