import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff, Mail, Lock, ShieldCheck } from 'lucide-react';
import ccsLogo from '../CCS Logo.png';
import universityBg from '../BCH.jpg';
import acssLogo from '../ACSS.jpg';
import sitesLogo from '../SITES.jpg';

export default function Login() {
    const { login, confirmLoginOtp } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [focused, setFocused] = useState({ email: false, password: false });

    // OTP verification state
    const [otpStep, setOtpStep] = useState(false);
    const [otpEmail, setOtpEmail] = useState('');
    const [otpValue, setOtpValue] = useState('');
    const [otpFocused, setOtpFocused] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await login(form.email, form.password);
            if (result?.must_verify) {
                // First login — show OTP modal
                setOtpEmail(result.email);
                setOtpStep(true);
                setOtpValue('');
            } else {
                setSuccess(true);
            }
        } catch (err) {
            const detail = err.response?.data?.errors?.email?.[0]
                || err.response?.data?.message
                || 'Invalid email or password. Please try again.';
            setError(`${err.response?.status ?? ''} ${detail}`);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await confirmLoginOtp(otpEmail, otpValue);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.bgWrapper}>
                <img src={universityBg} alt="Background" style={styles.bgImage} />
                <div style={styles.bgOverlay} />
                <div style={styles.bgNoise} />
            </div>

            <div style={styles.contentWrapper}>
                <div style={styles.glassCard} className="fade-in-up">

                    {/* --- HEADER --- */}
                    <div style={styles.header}>
                        <div style={styles.logoRow}>
                            <img src={acssLogo}  alt="ACSS"  style={styles.miniLogo} />
                            <div style={styles.mainLogoWrap}>
                                <img src={ccsLogo} alt="CCS Logo" style={styles.mainLogo} />
                            </div>
                            <img src={sitesLogo} alt="SITES" style={styles.miniLogo} />
                        </div>
                        <h1 style={styles.title}>CCS Profiling System</h1>
                        <p style={styles.subtitle}>College of Computer Studies<br />University of Cabuyao</p>
                        <div style={styles.divider} />
                    </div>

                    {/* --- ERROR (login form errors only) --- */}
                    {error && !otpStep && (
                        <div style={styles.errorBox} className="shake-error" key={error}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* --- LOGIN FORM (always visible) --- */}
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.fieldWrap}>
                            <label style={styles.label} htmlFor="login-email">Email Address</label>
                            <div style={{ ...styles.inputWrap, ...(focused.email ? styles.inputWrapFocused : {}) }}>
                                <Mail size={18} color={focused.email ? '#ffffff' : 'rgba(255,255,255,0.5)'} style={styles.fieldIcon} />
                                <input
                                    id="login-email"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    onFocus={() => setFocused(f => ({ ...f, email: true }))}
                                    onBlur={() => setFocused(f => ({ ...f, email: false }))}
                                    required
                                    style={styles.input}
                                    autoFocus
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div style={styles.fieldWrap}>
                            <div style={styles.labelRow}>
                                <label style={styles.label} htmlFor="login-password">Password</label>
                                <a href="#forgot" style={styles.forgotLink} tabIndex={-1}>Forgot password?</a>
                            </div>
                            <div style={{ ...styles.inputWrap, ...(focused.password ? styles.inputWrapFocused : {}) }}>
                                <Lock size={18} color={focused.password ? '#ffffff' : 'rgba(255,255,255,0.5)'} style={styles.fieldIcon} />
                                <input
                                    id="login-password"
                                    type={showPw ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    onFocus={() => setFocused(f => ({ ...f, password: true }))}
                                    onBlur={() => setFocused(f => ({ ...f, password: false }))}
                                    required
                                    style={styles.input}
                                    autoComplete="current-password"
                                />
                                <button type="button" onClick={() => setShowPw(v => !v)} style={styles.eyeBtn} tabIndex={-1} aria-label="Toggle password visibility">
                                    {showPw ? <EyeOff size={18} color="rgba(255,255,255,0.6)" /> : <Eye size={18} color="rgba(255,255,255,0.6)" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || success}
                            style={{ ...styles.submitBtn, ...(success ? styles.submitBtnSuccess : {}) }}
                            className="submit-btn"
                        >
                            {success ? (
                                <><CheckCircle size={18} /> Logged in!</>
                            ) : loading ? (
                                <><Loader2 size={18} className="spin-icon" /> Signing in...</>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <p style={styles.footer}>
                        CCS Profiling &copy; {new Date().getFullYear()} · University of Cabuyao
                    </p>
                </div>
            </div>

            {/* --- OTP MODAL OVERLAY --- */}
            {otpStep && (
                <div style={styles.otpOverlay} className="otp-overlay-in">
                    <div style={styles.otpModal} className="otp-modal-in">
                        {/* Close / back button */}
                        <button
                            type="button"
                            onClick={() => { setOtpStep(false); setError(''); setOtpValue(''); }}
                            style={styles.otpCloseBtn}
                            aria-label="Close OTP modal"
                        >
                            ✕
                        </button>

                        {/* Icon */}
                        <div style={styles.otpIconWrap}>
                            <ShieldCheck size={32} color="#f97316" />
                        </div>

                        <h2 style={styles.otpTitle}>Verify Your Identity</h2>
                        <p style={styles.otpDesc}>
                            A 6-digit OTP was sent to<br />
                            <strong style={{ color: '#f97316' }}>{otpEmail}</strong>
                        </p>
                        <p style={styles.otpHint}>Enter it below to complete sign in. Expires in 10 minutes.</p>

                        {/* OTP error */}
                        {error && otpStep && (
                            <div style={{ ...styles.errorBox, marginBottom: 4 }} className="shake-error" key={error}>
                                <AlertCircle size={15} />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleOtpSubmit} style={{ width: '100%' }}>
                            <div style={styles.otpInputWrap}>
                                <ShieldCheck size={18} color={otpFocused ? '#f97316' : '#aaa'} style={{ flexShrink: 0 }} />
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder="0  0  0  0  0  0"
                                    value={otpValue}
                                    onChange={e => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    onFocus={() => setOtpFocused(true)}
                                    onBlur={() => setOtpFocused(false)}
                                    required
                                    autoFocus
                                    style={styles.otpInput}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || success || otpValue.length !== 6}
                                style={{ ...styles.submitBtn, marginTop: 20, ...(success ? styles.submitBtnSuccess : {}) }}
                                className="submit-btn"
                            >
                                {success ? (
                                    <><CheckCircle size={18} /> Verified!</>
                                ) : loading ? (
                                    <><Loader2 size={18} className="spin-icon" /> Verifying...</>
                                ) : (
                                    'Verify & Sign In'
                                )}
                            </button>
                        </form>

                        <button
                            type="button"
                            onClick={() => { setOtpStep(false); setError(''); setOtpValue(''); }}
                            style={styles.otpBackBtn}
                        >
                            ← Back to login
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
                *, *::before, *::after { box-sizing: border-box; }
                body { margin: 0; overflow: hidden; }

                @keyframes spin        { to   { transform: rotate(360deg); } }
                @keyframes fadeInUp    { from { opacity: 0; transform: translateY(36px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes shakeError  { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
                @keyframes overlayIn   { from { opacity: 0; } to { opacity: 1; } }
                @keyframes modalIn     { from { opacity: 0; transform: translateY(24px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }

                .fade-in-up      { animation: fadeInUp   0.75s cubic-bezier(0.16,1,0.3,1) forwards; }
                .shake-error     { animation: shakeError 0.45s ease-in-out; }
                .spin-icon       { animation: spin 1s linear infinite; }
                .otp-overlay-in  { animation: overlayIn 0.25s ease forwards; }
                .otp-modal-in    { animation: modalIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }

                /* Input inside the wrapper – no inline outline/ring conflict */
                #login-email, #login-password {
                    background: transparent;
                    border: none;
                    outline: none;
                    flex: 1;
                    color: #fff;
                    font-family: 'Outfit', sans-serif;
                    font-size: 1rem;
                    min-width: 0;
                }
                #login-email::placeholder, #login-password::placeholder { color: rgba(255,255,255,0.4); }

                /* submit hover */
                .submit-btn { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); position: relative; overflow: hidden; }
                .submit-btn::after {
                    content: '';
                    position: absolute; inset: 0;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent);
                    transform: translateX(-100%);
                    transition: transform 0.55s ease;
                }
                .submit-btn:hover:not(:disabled)::after { transform: translateX(100%); }
                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-3px);
                    box-shadow: 0 16px 36px rgba(249,115,22,0.55) !important;
                    filter: brightness(1.08);
                }
                .submit-btn:active:not(:disabled) { transform: translateY(0); }
                .submit-btn:disabled { opacity: 0.75; cursor: not-allowed; }

                /* Forgot link hover */
                a[href="#forgot"] { transition: opacity 0.2s; }
                a[href="#forgot"]:hover { opacity: 0.75; text-decoration: underline; }

                /* Eye button hover */
                button[aria-label] { transition: opacity 0.2s; }
                button[aria-label]:hover { opacity: 0.75; }
            `}</style>
        </div>
    );
}

/* ─────────────────────── Styles ─────────────────────── */
const styles = {
    container: {
        position: 'relative',
        width: '100vw',
        height: '100vh',
        fontFamily: "'Outfit', sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0f28', // Deep navy fallback
    },

    /* Background */
    bgWrapper: { position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' },
    bgImage: { width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.06)', transformOrigin: 'center', filter: 'brightness(0.55) saturate(1.2)' },
    bgOverlay: {
        position: 'absolute', inset: 0,
        background: 'linear-gradient(160deg, rgba(10,15,40,0.82) 0%, rgba(24,30,60,0.75) 45%, rgba(154,52,18,0.70) 100%)',
    },
    bgNoise: {
        position: 'absolute', inset: 0,
        // Radial vignette – darkens edges, draws eyes to center card
        background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(5,8,25,0.65) 100%)',
    },

    /* Floating logos in background */
    floatingLogosContainer: { position: 'absolute', inset: 0, zIndex: 1, overflow: 'hidden', pointerEvents: 'none' },

    /* Card / Content */
    contentWrapper: {
        position: 'relative', zIndex: 10,
        width: '100%',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        padding: '1.25rem',
        minHeight: '100vh',
    },
    glassCard: {
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(12, 18, 50, 0.65)', // Dark navy glass
        backdropFilter: 'blur(32px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(32px) saturate(1.6)',
        borderRadius: '28px',
        border: '1px solid rgba(255,255,255,0.12)',
        padding: '2.75rem 2.5rem 2rem',
        boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 0 1px rgba(249,115,22,0.15)',
        display: 'flex', flexDirection: 'column', gap: '1.75rem',
        opacity: 0, // filled by fadeInUp
    },

    /* Header */
    header: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' },
    logoRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', marginBottom: '0.25rem' },
    miniLogo: {
        width: '52px', height: '52px', objectFit: 'contain', borderRadius: '50%',
        background: 'rgba(255,255,255,0.95)',
        boxShadow: '0 4px 18px rgba(249,115,22,0.35)', // Orange glow
        padding: '5px',
    },
    mainLogoWrap: {
        background: '#ffffff',
        borderRadius: '50%',
        boxShadow: '0 0 0 4px rgba(249,115,22,0.4), 0 10px 28px rgba(249,115,22,0.3)', // Vivid orange ring
        padding: '6px',
    },
    mainLogo: { width: '72px', height: '72px', objectFit: 'contain', display: 'block' },
    title: {
        margin: 0,
        fontSize: '1.5rem', fontWeight: 800,
        color: '#ffffff',
        letterSpacing: '-0.01em',
        textAlign: 'center',
        textShadow: '0 2px 12px rgba(249,115,22,0.4)', // Orange text glow
    },
    subtitle: {
        margin: 0,
        fontSize: '0.82rem', fontWeight: 400,
        color: 'rgba(255,255,255,0.55)',
        letterSpacing: '0.05em',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    divider: {
        width: '48px', height: '3px',
        background: 'linear-gradient(90deg, transparent, #f97316, transparent)', // Orange glowing divider
        borderRadius: '99px',
        marginTop: '0.4rem',
    },

    /* Error */
    errorBox: {
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        background: 'rgba(185,28,28,0.75)',
        border: '1px solid rgba(248,113,113,0.5)',
        padding: '0.8rem 1rem',
        borderRadius: '14px',
        color: '#ffffff',
        fontSize: '0.9rem', fontWeight: 500,
        backdropFilter: 'blur(8px)',
        lineHeight: 1.4,
    },

    /* Form */
    form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
    fieldWrap: { display: 'flex', flexDirection: 'column', gap: '0.45rem' },
    labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    label: { fontSize: '0.88rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.02em' },
    forgotLink: {
        fontSize: '0.8rem', color: '#fb923c', fontWeight: 500, // Vivid orange link
        textDecoration: 'none',
    },

    /* Input wrapper – the bordered box */
    inputWrap: {
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        background: 'rgba(255,255,255,0.05)',
        borderWidth: '1.5px',
        borderStyle: 'solid',
        borderColor: 'rgba(255,255,255,0.12)',
        borderRadius: '14px',
        padding: '0 1rem',
        height: '52px',
        transition: 'border-color 0.25s, background 0.25s, box-shadow 0.25s',
    },
    inputWrapFocused: {
        background: 'rgba(249,115,22,0.08)',
        borderColor: '#f97316',
        boxShadow: '0 0 0 3px rgba(249,115,22,0.18)',
    },
    fieldIcon: { flexShrink: 0, transition: 'color 0.25s' },
    input: { flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontFamily: "'Outfit', sans-serif", fontSize: '1rem', minWidth: 0 },
    eyeBtn: {
        background: 'none', border: 'none', cursor: 'pointer', padding: '0 0.1rem',
        display: 'flex', alignItems: 'center', flexShrink: 0,
    },

    /* Submit */
    submitBtn: {
        marginTop: '0.25rem',
        width: '100%', height: '52px',
        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', // Bold orange gradient
        color: '#ffffff',
        border: 'none', borderRadius: '14px',
        fontSize: '1.05rem', fontWeight: 700,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        boxShadow: '0 8px 24px rgba(249,115,22,0.45)', // Strong orange glow under button
        letterSpacing: '0.02em',
    },
    submitBtnSuccess: { background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 8px 24px rgba(34,197,94,0.4)' },

    /* Footer */
    footer: {
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'rgba(255,255,255,0.3)',
        marginTop: '-0.5rem',
        letterSpacing: '0.02em',
    },

    /* OTP Modal */
    otpOverlay: {
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.25rem',
    },
    otpModal: {
        position: 'relative',
        width: '100%', maxWidth: '400px',
        background: '#ffffff',
        borderRadius: '24px',
        padding: '2.5rem 2rem 2rem',
        boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem',
    },
    otpCloseBtn: {
        position: 'absolute', top: 14, right: 16,
        background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: '50%',
        width: 32, height: 32, cursor: 'pointer',
        fontSize: '0.85rem', color: '#555',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    otpIconWrap: {
        width: 68, height: 68, borderRadius: '50%',
        background: '#fff7ed',
        border: '2px solid #fed7aa',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '0.4rem',
    },
    otpTitle: {
        margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1c1917', textAlign: 'center',
    },
    otpDesc: {
        margin: 0, fontSize: '0.9rem', color: '#57534e', textAlign: 'center', lineHeight: 1.6,
    },
    otpHint: {
        margin: 0, fontSize: '0.78rem', color: '#a8a29e', textAlign: 'center',
    },
    otpInputWrap: {
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        borderWidth: '2px', borderStyle: 'solid', borderColor: '#e7e5e4',
        borderRadius: '14px', padding: '0 1rem', height: '58px',
        marginTop: '0.75rem', width: '100%', boxSizing: 'border-box',
        transition: 'border-color 0.2s',
    },
    otpInput: {
        flex: 1, border: 'none', outline: 'none',
        textAlign: 'center', fontSize: '1.8rem', fontWeight: 800,
        letterSpacing: '10px', color: '#1c1917',
        fontFamily: "'Outfit', sans-serif",
        background: 'transparent',
    },
    otpBackBtn: {
        background: 'none', border: 'none',
        color: '#a8a29e', fontSize: '0.82rem',
        cursor: 'pointer', marginTop: '0.25rem',
    },
};
