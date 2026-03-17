import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import ccsLogo from '../CCS Logo.png';
import universityBg from '../BCH.jpg';
import acssLogo from '../ACSS.jpg';
import sitesLogo from '../SITES.jpg';

export default function Login() {
    const { login } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [focused, setFocused] = useState({ email: false, password: false });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(form.email, form.password);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.errors?.email?.[0] || err.response?.data?.message || 'Invalid email or password. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            {/* Background Image & Overlay */}
            <div style={styles.bgWrapper}>
                <img src={universityBg} alt="Background" style={styles.bgImage} />
                <div style={styles.bgOverlay} />
                {/* Noise texture for depth */}
                <div style={styles.bgNoise} />
            </div>

            {/* CS-Themed 3D Floating Art */}
            <div style={styles.floatingLogosContainer}>

                {/* ── Isometric 3D Cube – top left ── */}
                <svg className="float-anim-1" style={{position:'absolute',top:'8%',left:'4%',opacity:0.22,filter:'drop-shadow(0 8px 24px rgba(249,115,22,0.5))'}} width="120" height="120" viewBox="0 0 120 120" fill="none">
                    <polygon points="60,8 108,34 108,86 60,112 12,86 12,34" fill="rgba(249,115,22,0.18)" stroke="rgba(249,115,22,0.7)" strokeWidth="1.5"/>
                    <polygon points="60,8 108,34 60,60 12,34" fill="rgba(249,115,22,0.28)" stroke="rgba(249,115,22,0.8)" strokeWidth="1.2"/>
                    <polygon points="60,60 108,34 108,86 60,112" fill="rgba(234,88,12,0.20)" stroke="rgba(234,88,12,0.6)" strokeWidth="1.2"/>
                    <polygon points="60,60 12,34 12,86 60,112" fill="rgba(253,186,116,0.12)" stroke="rgba(253,186,116,0.5)" strokeWidth="1.2"/>
                    <line x1="60" y1="8" x2="60" y2="60" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                    <line x1="12" y1="34" x2="60" y2="60" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                    <line x1="108" y1="34" x2="60" y2="60" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                </svg>

                {/* ── Circuit Board Node Cluster – top right ── */}
                <svg className="float-anim-2" style={{position:'absolute',top:'5%',right:'5%',opacity:0.25,filter:'drop-shadow(0 4px 16px rgba(249,115,22,0.4))'}} width="160" height="140" viewBox="0 0 160 140" fill="none">
                    <circle cx="80" cy="70" r="10" fill="rgba(249,115,22,0.5)" stroke="#f97316" strokeWidth="2"/>
                    <circle cx="30" cy="30" r="6" fill="rgba(249,115,22,0.3)" stroke="#f97316" strokeWidth="1.5"/>
                    <circle cx="130" cy="25" r="6" fill="rgba(249,115,22,0.3)" stroke="#f97316" strokeWidth="1.5"/>
                    <circle cx="140" cy="110" r="7" fill="rgba(249,115,22,0.3)" stroke="#f97316" strokeWidth="1.5"/>
                    <circle cx="20" cy="110" r="5" fill="rgba(249,115,22,0.3)" stroke="#f97316" strokeWidth="1.5"/>
                    <circle cx="80" cy="128" r="5" fill="rgba(249,115,22,0.3)" stroke="#f97316" strokeWidth="1.5"/>
                    {/* Traces */}
                    <line x1="80" y1="70" x2="30" y2="30" stroke="rgba(249,115,22,0.45)" strokeWidth="1.5" strokeDasharray="4 3"/>
                    <line x1="80" y1="70" x2="130" y2="25" stroke="rgba(249,115,22,0.45)" strokeWidth="1.5" strokeDasharray="4 3"/>
                    <line x1="80" y1="70" x2="140" y2="110" stroke="rgba(249,115,22,0.45)" strokeWidth="1.5" strokeDasharray="4 3"/>
                    <line x1="80" y1="70" x2="20" y2="110" stroke="rgba(249,115,22,0.45)" strokeWidth="1.5" strokeDasharray="4 3"/>
                    <line x1="80" y1="70" x2="80" y2="128" stroke="rgba(249,115,22,0.45)" strokeWidth="1.5" strokeDasharray="4 3"/>
                    {/* Right-angle trace corners */}
                    <polyline points="80,70 80,25 130,25" stroke="rgba(255,200,100,0.3)" strokeWidth="1" fill="none"/>
                    <polyline points="80,70 30,70 30,30" stroke="rgba(255,200,100,0.3)" strokeWidth="1" fill="none"/>
                    <rect x="74" y="64" width="12" height="12" rx="3" fill="none" stroke="rgba(249,115,22,0.6)" strokeWidth="1.5"/>
                </svg>

                {/* ── Code Angle Brackets – bottom left ── */}
                <svg className="float-anim-3" style={{position:'absolute',bottom:'10%',left:'3%',opacity:0.28,filter:'drop-shadow(0 4px 20px rgba(249,115,22,0.4))'}} width="140" height="80" viewBox="0 0 140 80" fill="none">
                    <text x="0" y="60" fontFamily="monospace" fontSize="72" fontWeight="bold" fill="rgba(249,115,22,0.55)" letterSpacing="-4">&lt;/&gt;</text>
                </svg>

                {/* ── Floating Curly Braces code symbol – right middle ── */}
                <svg className="float-anim-1" style={{position:'absolute',top:'38%',right:'3%',opacity:0.20,filter:'drop-shadow(0 4px 20px rgba(249,115,22,0.3))'}} width="90" height="110" viewBox="0 0 90 110" fill="none">
                    <text x="0" y="90" fontFamily="monospace" fontSize="100" fontWeight="bold" fill="rgba(253,186,116,0.55)">{`{}`}</text>
                </svg>

                {/* ── Wireframe Diamond / Octahedron – bottom right ── */}
                <svg className="float-anim-2" style={{position:'absolute',bottom:'6%',right:'4%',opacity:0.22,filter:'drop-shadow(0 6px 20px rgba(249,115,22,0.45))'}} width="110" height="130" viewBox="0 0 110 130" fill="none">
                    <polygon points="55,4 104,52 55,126 6,52" fill="rgba(249,115,22,0.10)" stroke="rgba(249,115,22,0.65)" strokeWidth="1.5"/>
                    <line x1="55" y1="4" x2="55" y2="126" stroke="rgba(249,115,22,0.35)" strokeWidth="1" strokeDasharray="5 4"/>
                    <line x1="6" y1="52" x2="104" y2="52" stroke="rgba(249,115,22,0.35)" strokeWidth="1" strokeDasharray="5 4"/>
                    <circle cx="55" cy="4"   r="3.5" fill="#f97316"/>
                    <circle cx="55" cy="126" r="3.5" fill="#f97316"/>
                    <circle cx="6"  cy="52"  r="3.5" fill="#f97316"/>
                    <circle cx="104" cy="52" r="3.5" fill="#f97316"/>
                </svg>

                {/* ── Binary stream – center-left ── */}
                <div className="float-anim-3" style={{position:'absolute',top:'28%',left:'2%',opacity:0.15,fontFamily:'monospace',fontSize:'13px',color:'#fb923c',lineHeight:'1.6',letterSpacing:'0.05em',filter:'blur(0.5px)',userSelect:'none',pointerEvents:'none',whiteSpace:'pre'}}>
                    {`01001100\n11010011\n00110101\n10101010\n01100110\n11001101\n00011011`}
                </div>

                {/* ── Hex values stream – bottom center ── */}
                <div className="float-anim-1" style={{position:'absolute',bottom:'5%',left:'38%',opacity:0.12,fontFamily:'monospace',fontSize:'11px',color:'#fdba74',lineHeight:'1.8',letterSpacing:'0.08em',userSelect:'none',pointerEvents:'none',whiteSpace:'pre'}}>
                    {`0xFF 0xA3\n0x2B 0xD1\n0x94 0x6E\n0x17 0xBC`}
                </div>

                {/* ── Small satellite cube – center top ── */}
                <svg className="float-anim-2" style={{position:'absolute',top:'3%',left:'42%',opacity:0.18,filter:'drop-shadow(0 4px 12px rgba(249,115,22,0.4))'}} width="60" height="60" viewBox="0 0 60 60" fill="none">
                    <polygon points="30,4 54,17 54,43 30,56 6,43 6,17" fill="rgba(249,115,22,0.15)" stroke="rgba(249,115,22,0.6)" strokeWidth="1.2"/>
                    <polygon points="30,4 54,17 30,30 6,17" fill="rgba(249,115,22,0.25)" stroke="rgba(249,115,22,0.7)" strokeWidth="1"/>
                    <polygon points="30,30 54,17 54,43 30,56" fill="rgba(234,88,12,0.18)" stroke="rgba(234,88,12,0.5)" strokeWidth="1"/>
                </svg>

            </div>

            {/* Glass Login Card */}
            <div style={styles.contentWrapper}>
                <div style={styles.glassCard} className="fade-in-up">

                    {/* --- HEADER --- */}
                    <div style={styles.header}>
                        {/* Three logos row */}
                        <div style={styles.logoRow}>
                            <img src={acssLogo}  alt="ACSS"  style={styles.miniLogo} />
                            <div style={styles.mainLogoWrap}>
                                <img src={ccsLogo} alt="CCS Logo" style={styles.mainLogo} />
                            </div>
                            <img src={sitesLogo} alt="SITES" style={styles.miniLogo} />
                        </div>
                        <h1 style={styles.title}>CCS Profiling System</h1>
                        <p style={styles.subtitle}>College of Computer Studies · Cabuyao City</p>
                        <div style={styles.divider} />
                    </div>

                    {/* --- ERROR --- */}
                    {error && (
                        <div style={styles.errorBox} className="shake-error" key={error}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* --- FORM --- */}
                    <form onSubmit={handleSubmit} style={styles.form}>

                        {/* Email Field */}
                        <div style={styles.fieldWrap}>
                            <label style={styles.label} htmlFor="login-email">Email Address</label>
                            <div style={{
                                ...styles.inputWrap,
                                ...(focused.email ? styles.inputWrapFocused : {})
                            }}>
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

                        {/* Password Field */}
                        <div style={styles.fieldWrap}>
                            <div style={styles.labelRow}>
                                <label style={styles.label} htmlFor="login-password">Password</label>
                                <a href="#forgot" style={styles.forgotLink} tabIndex={-1}>Forgot password?</a>
                            </div>
                            <div style={{
                                ...styles.inputWrap,
                                ...(focused.password ? styles.inputWrapFocused : {})
                            }}>
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

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || success}
                            style={{
                                ...styles.submitBtn,
                                ...(success ? styles.submitBtnSuccess : {}),
                            }}
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

                    {/* Footer */}
                    <p style={styles.footer}>
                        CCS Profiling &copy; {new Date().getFullYear()} · Cabuyao City College
                    </p>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
                *, *::before, *::after { box-sizing: border-box; }
                body { margin: 0; overflow: hidden; }

                @keyframes spin        { to   { transform: rotate(360deg); } }
                @keyframes fadeInUp    { from { opacity: 0; transform: translateY(36px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes shakeError  { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
                @keyframes float1      { 0%,100%{transform:translate(0,0) rotate(0deg)}   50%{transform:translate(-18px,26px) rotate(4deg)} }
                @keyframes float2      { 0%,100%{transform:translate(0,0) rotate(0deg)}   50%{transform:translate(22px,-18px) rotate(-4deg)} }
                @keyframes float3      { 0%,100%{transform:translate(0,0) rotate(0deg)}   50%{transform:translate(-14px,-22px) rotate(6deg)} }

                .fade-in-up    { animation: fadeInUp   0.75s cubic-bezier(0.16,1,0.3,1) forwards; }
                .float-anim-1  { animation: float1  9s  ease-in-out infinite; }
                .float-anim-2  { animation: float2  11s ease-in-out infinite; }
                .float-anim-3  { animation: float3  10s ease-in-out infinite; }
                .shake-error   { animation: shakeError 0.45s ease-in-out; }
                .spin-icon     { animation: spin 1s linear infinite; }

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
        border: '1.5px solid rgba(255,255,255,0.12)',
        borderRadius: '14px',
        padding: '0 1rem',
        height: '52px',
        transition: 'border-color 0.25s, background 0.25s, box-shadow 0.25s',
    },
    inputWrapFocused: {
        background: 'rgba(249,115,22,0.08)', // Orange tint on focus
        borderColor: '#f97316',              // Orange border on focus
        boxShadow: '0 0 0 3px rgba(249,115,22,0.18)', // Orange glow ring
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
};
