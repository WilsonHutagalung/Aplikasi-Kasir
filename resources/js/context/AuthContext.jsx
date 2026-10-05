import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('pos_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('pos_token');
        if (token) {
            api.get('/auth/me')
                .then((res) => {
                    setUser(res.data.user);
                    localStorage.setItem('pos_user', JSON.stringify(res.data.user));
                })
                .catch(() => {
                    setUser(null);
                    localStorage.removeItem('pos_token');
                    localStorage.removeItem('pos_user');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (credentials) => {
        const res = await api.post('/auth/login', credentials);
        const { token, user: userData } = res.data;
        localStorage.setItem('pos_token', token);
        localStorage.setItem('pos_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            // ignore
        } finally {
            localStorage.removeItem('pos_token');
            localStorage.removeItem('pos_user');
            setUser(null);
            window.location.href = '/login';
        }
    };

    const hasPermission = (permName) => {
        if (!user) return false;
        if (user.role === 'owner') return true;
        return user.permissions?.includes(permName);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
