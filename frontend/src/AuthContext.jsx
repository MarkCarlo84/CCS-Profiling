import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api, { verifyLoginOtp as apiVerifyLoginOtp, studentLogin as apiStudentLogin, staffLogin as apiStaffLogin, getStudents, getFaculties, getViolations, getTeacherProfile, getStudentEvaluations } from './api';
import { useLoading } from './LoadingContext';
import { warmCache } from './hooks/useQuery';

// Fire-and-forget prefetch to warm the cache right after login
async function prefetchForRole(role, userId) {
    try {
        if (role === 'admin') {
            const [students, faculties, violations] = await Promise.allSettled([
                getStudents(),
                getFaculties(),
                getViolations(),
            ]);
            if (students.status === 'fulfilled') warmCache('students', students.value?.data ?? students.value);
            if (faculties.status === 'fulfilled') warmCache('faculties', faculties.value?.data ?? faculties.value);
            if (violations.status === 'fulfilled') warmCache('violations', violations.value?.data ?? violations.value);
        } else if (role === 'teacher') {
            const [profile] = await Promise.allSettled([
                getTeacherProfile(),
            ]);
            if (profile.status === 'fulfilled') warmCache('teacher-profile', profile.value?.data ?? profile.value);
        } else if (role === 'student') {
            const [evals] = await Promise.allSettled([
                getStudentEvaluations(),
            ]);
            if (evals.status === 'fulfilled') warmCache('student-evaluations', evals.value?.data ?? evals.value);
        }
    } catch (_) {
        // Prefetch is best-effort — never block or error on failure
    }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showLoader } = useLoading();

    useEffect(() => {
        const token = sessionStorage.getItem('ccs_token');
        if (token) {
            api.get('/auth/me')
                .then(r => setUser(r.data))
                .catch(() => { sessionStorage.removeItem('ccs_token'); })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        if (res.data.must_verify) return res.data;

        const { token, user: u } = res.data;
        sessionStorage.setItem('ccs_token', token);
        showLoader();
        setUser(u);
        prefetchForRole(u?.role, u?.id); // fire-and-forget
        return u;
    }, [showLoader]);

    const loginStudent = useCallback(async (student_id, password) => {
        const res = await apiStudentLogin(student_id, password);
        if (res.data.must_verify) return res.data;

        const { token, user: u } = res.data;
        sessionStorage.setItem('ccs_token', token);
        localStorage.setItem('ccs_portal', '/student');
        showLoader();
        setUser(u);
        prefetchForRole('student', u?.id); // fire-and-forget
        return u;
    }, [showLoader]);

    const loginStaff = useCallback(async (identifier, password) => {
        const res = await apiStaffLogin(identifier, password);
        if (res.data.must_verify) return res.data;

        const { token, user: u } = res.data;
        sessionStorage.setItem('ccs_token', token);
        localStorage.setItem('ccs_portal', '/facultyadmin');
        showLoader();
        setUser(u);
        prefetchForRole(u?.role, u?.id); // fire-and-forget
        return u;
    }, [showLoader]);

    const confirmLoginOtp = useCallback(async (email, otp) => {
        const res = await apiVerifyLoginOtp(email, otp);
        const { token, user: u } = res.data;
        sessionStorage.setItem('ccs_token', token);
        showLoader();
        setUser(u);
        prefetchForRole(u?.role, u?.id); // fire-and-forget
        return u;
    }, [showLoader]);

    const logout = useCallback(async () => {
        await api.post('/auth/logout').catch(() => { });
        sessionStorage.removeItem('ccs_token');
        setUser(null);
    }, []);

    const role = user?.role ?? null;

    const value = useMemo(
        () => ({ user, role, loading, login, loginStudent, loginStaff, confirmLoginOtp, logout }),
        [user, role, loading, login, loginStudent, loginStaff, confirmLoginOtp, logout]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
