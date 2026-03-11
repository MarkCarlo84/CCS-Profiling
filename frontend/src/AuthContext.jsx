import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session on page load
    useEffect(() => {
        const token = localStorage.getItem('ccs_token');
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            api.get('/auth/me')
                .then(r => setUser(r.data))
                .catch(() => { localStorage.removeItem('ccs_token'); })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token, user: u } = res.data;
        localStorage.setItem('ccs_token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(u);
        return u;
    }, []);

    const logout = useCallback(async () => {
        await api.post('/auth/logout').catch(() => { });
        localStorage.removeItem('ccs_token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
