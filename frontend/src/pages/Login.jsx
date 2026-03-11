import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { LogIn, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import ccsLogo from '../CCS Logo.png';

export default function Login() {
    const { login } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(form.email, form.password);
            setSuccess(true);
            // Delay redirect slightly to show success state
            setTimeout(() => {
                // The actual redirect happens via AuthContext update
            }, 800);
        } catch (err) {
            setError(err.response?.data?.errors?.email?.[0] || err.response?.data?.message || 'Login failed.');
            setLoading(false);
        }
    };

    return (
        <div style={{ ...styles.bg, animation: 'fadeIn .8s ease-out' }}>
            {/* Decorative blobs */}
            <div style={{ ...styles.blob, top: '-120px', left: '-120px', background: 'radial-gradient(circle,#f9731640,transparent 70%)', animation: 'blobFloat 15s infinite alternate' }} />
            <div style={{ ...styles.blob, bottom: '-100px', right: '-100px', background: 'radial-gradient(circle,#c2410c30,transparent 70%)', animation: 'blobFloat 12s infinite alternate-reverse' }} />

            <div style={{
                ...styles.card,
                animation: success ? 'exitOut .6s forwards cubic-bezier(0.4, 0, 0.2, 1)' : 'slideIn .6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                opacity: success ? 0 : 1,
                transform: success ? 'scale(0.9) translateY(-20px)' : 'none',
                transition: 'all .6s'
            }}>
                {/* Logo */}
                <div style={styles.logoWrap}>
                    <div style={styles.logoIcon}>
                        <img src={ccsLogo} alt="CCS Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div>
                        <div style={styles.brandTitle}>CCS Profiling</div>
                        <div style={styles.brandSub}>Comprehensive Profiling System</div>
                    </div>
                </div>

                <h1 style={styles.heading}>Welcome back</h1>
                <p style={styles.sub}>Sign in to access the admin dashboard</p>

                {error && (
                    <div style={styles.errorBox}>
                        <AlertCircle size={15} color="#dc2626" style={{ flexShrink: 0 }} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={styles.label}>Email Address</label>
                        <input
                            type="email"
                            placeholder="admin@ccs.edu.ph"
                            value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            required
                            style={styles.input}
                            autoFocus
                        />
                    </div>
                    <div>
                        <label style={styles.label}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPw ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={form.password}
                                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                required
                                style={{ ...styles.input, paddingRight: 44 }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(v => !v)}
                                style={styles.eyeBtn}
                                tabIndex={-1}
                            >
                                {showPw ? <EyeOff size={16} color="#a8a29e" /> : <Eye size={16} color="#a8a29e" />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading || success} style={{
                        ...styles.submitBtn,
                        background: success ? '#16a34a' : styles.submitBtn.background,
                        boxShadow: success ? '0 4px 16px rgba(22,163,74,.3)' : styles.submitBtn.boxShadow
                    }}>
                        {success ? (
                            <><CheckCircle size={16} /> Authenticated</>
                        ) : loading ? (
                            <><Loader2 size={16} style={{ animation: 'spin .7s linear infinite' }} /> Signing in…</>
                        ) : (
                            <><LogIn size={16} /> Sign In</>
                        )}
                    </button>
                </form>

                <div style={styles.hint}>
                    <span style={{ color: '#a8a29e', fontSize: 12 }}>Default credentials: </span>
                    <code style={{ fontSize: 12, color: '#f97316', background: '#fff7ed', padding: '1px 6px', borderRadius: 4 }}>
                        admin@ccs.edu.ph / admin1234
                    </code>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideIn { 
                    from { opacity: 0; transform: translateY(30px) scale(0.95); } 
                    to { opacity: 1; transform: translateY(0) scale(1); } 
                }
                @keyframes exitOut {
                    0% { opacity: 1; transform: scale(1) translateY(0); }
                    100% { opacity: 0; transform: scale(0.9) translateY(-30px); filter: blur(4px); }
                }
                @keyframes blobFloat {
                    from { transform: translate(0, 0); }
                    to { transform: translate(40px, 40px); }
                }
            `}</style>
        </div>
    );
}

const styles = {
    bg: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, position: 'relative', overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
    },
    blob: {
        position: 'absolute', width: 500, height: 500, borderRadius: '50%', pointerEvents: 'none',
    },
    card: {
        background: '#fff',
        borderRadius: 24, padding: '40px 44px',
        width: '100%', maxWidth: 440,
        boxShadow: '0 20px 60px rgba(0,0,0,.10), 0 4px 16px rgba(0,0,0,.06)',
        position: 'relative', zIndex: 1,
    },
    logoWrap: {
        display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28,
    },
    logoIcon: {
        width: 52, height: 52, borderRadius: 12,
        background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(0,0,0,.08)',
        overflow: 'hidden',
    },
    brandTitle: { fontSize: '1.2rem', fontWeight: 800, color: '#1c1917', lineHeight: 1.2 },
    brandSub: { fontSize: '.72rem', color: '#a8a29e', fontWeight: 500 },
    heading: { fontSize: '1.5rem', fontWeight: 800, color: '#1c1917', margin: '0 0 4px' },
    sub: { fontSize: '.875rem', color: '#78716c', marginBottom: 24 },
    label: { display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#44403c', marginBottom: 6, letterSpacing: .3 },
    input: {
        width: '100%', padding: '11px 14px', borderRadius: 10,
        border: '1.5px solid #e7e5e4', fontSize: '.875rem',
        fontFamily: "'Inter', sans-serif", color: '#1c1917', outline: 'none',
        boxSizing: 'border-box', transition: 'border-color .15s',
    },
    eyeBtn: {
        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', cursor: 'pointer', padding: 4,
        display: 'flex', alignItems: 'center',
    },
    submitBtn: {
        width: '100%', padding: '13px 20px',
        background: 'linear-gradient(135deg,#f97316,#c2410c)',
        color: '#fff', border: 'none', borderRadius: 12,
        fontSize: '.9rem', fontWeight: 700, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontFamily: "'Inter', sans-serif",
        boxShadow: '0 4px 16px rgba(249,115,22,.35)',
        transition: 'transform .1s, box-shadow .1s',
    },
    errorBox: {
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#fef2f2', border: '1px solid #fecaca',
        borderRadius: 10, padding: '10px 14px',
        fontSize: '.85rem', color: '#dc2626', marginBottom: 4,
    },
    hint: {
        marginTop: 20, textAlign: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap',
    },
};
