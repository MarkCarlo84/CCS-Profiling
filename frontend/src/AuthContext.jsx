import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { verifyLoginOtp as apiVerifyLoginOtp } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('ccs_token');
        if (token) {
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
        if (res.data.must_verify) return res.data;

        const { token, user: u } = res.data;
        localStorage.setItem('ccs_token', token);
        setUser(u);
        return u;
    }, []);

    const confirmLoginOtp = useCallback(async (email, otp) => {
        const res = await apiVerifyLoginOtp(email, otp);
        const { token, user: u } = res.data;
        localStorage.setItem('ccs_token', token);
        setUser(u);
        return u;
    }, []);

    const logout = useCallback(async () => {
        await api.post('/auth/logout').catch(() => { });
        localStorage.removeItem('ccs_token');
        setUser(null);
    }, []);

    const role = user?.role ?? null;

    return (
        <AuthContext.Provider value={{ user, role, loading, login, confirmLoginOtp, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
