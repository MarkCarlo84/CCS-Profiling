import React, { useEffect, useState } from 'react';
import api from '../api';
import { CalendarClock, ArrowRight, CheckCircle2 } from 'lucide-react';

const card = {
    background: '#fff', borderRadius: 14, border: '1px solid #fde8d0',
    padding: '28px 32px', marginBottom: 24, boxShadow: '0 2px 8px rgba(249,115,22,.06)',
};
const label = { fontSize: '.8rem', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6, display: 'block' };
const input = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: '1px solid #fde8d0', fontSize: '.9rem', fontFamily: "'Inter',sans-serif",
    outline: 'none', boxSizing: 'border-box', color: '#1c1917',
};
const btn = (color = '#f97316') => ({
    padding: '9px 22px', borderRadius: 8, border: 'none', cursor: 'pointer',
    background: color, color: '#fff', fontWeight: 700, fontSize: '.85rem',
    fontFamily: "'Inter',sans-serif", display: 'flex', alignItems: 'center', gap: 7,
});

const SEMESTERS = ['1st', '2nd'];

function semLabel(s) {
    return s === '1st' ? '1st Semester' : '2nd Semester';
}

export default function AcademicPeriodSettings() {
    const [active, setActive] = useState(null);
    const [history, setHistory] = useState([]);
    const [form, setForm] = useState({ school_year: '', semester: '1st' });
    const [saving, setSaving] = useState(false);
    const [advancing, setAdvancing] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const load = async () => {
        try {
            const [activeRes, allRes] = await Promise.all([
                api.get('/academic-period/active').catch(() => ({ data: null })),
                api.get('/admin/academic-period'),
            ]);
            setActive(activeRes.data);
            setHistory(allRes.data);
            if (activeRes.data) {
                setForm({ school_year: activeRes.data.school_year, semester: activeRes.data.semester });
            }
        } catch (e) { console.error(e); }
    };

    useEffect(() => { load(); }, []);

    const flash = (msg, isError = false) => {
        if (isError) setError(msg); else setSuccess(msg);
        setTimeout(() => { setSuccess(''); setError(''); }, 3500);
    };

    const handleSet = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.post('/admin/academic-period', form);
            setActive(res.data);
            flash(`Active period set to ${res.data.school_year} — ${semLabel(res.data.semester)}`);
            load();
        } catch (err) {
            flash(err.response?.data?.message || 'Failed to set period.', true);
        }
        setSaving(false);
    };

    const handleAdvance = async () => {
        if (!window.confirm(`Advance from ${active?.school_year} ${semLabel(active?.semester)} to the next semester?`)) return;
        setAdvancing(true);
        try {
            const res = await api.post('/admin/academic-period/advance');
            setActive(res.data.current);
            flash(`Advanced to ${res.data.current.school_year} — ${semLabel(res.data.current.semester)}`);
            load();
        } catch (err) {
            flash(err.response?.data?.message || 'Failed to advance.', true);
        }
        setAdvancing(false);
    };

    const nextPreview = () => {
        if (!active) return null;
        if (active.semester === '1st') return `${active.school_year} — 2nd Semester`;
        const [s, en] = active.school_year.split('-').map(Number);
        return `${s + 1}-${en + 1} — 1st Semester`;
    };

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <div className="page-icon"><CalendarClock size={22} color="#f97316" strokeWidth={1.8} /></div>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', color: '#18120e', fontWeight: 800, letterSpacing: '-.02em', margin: 0 }}>Academic Period</h1>
                        <p style={{ color: '#78716c', fontSize: '.86rem', marginTop: 2 }}>Set the active school year and semester system-wide</p>
                    </div>
                </div>
            </div>

            {success && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 18px', marginBottom: 18, color: '#16a34a', fontSize: '.88rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle2 size={16} /> {success}
                </div>
            )}
            {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 18px', marginBottom: 18, color: '#dc2626', fontSize: '.88rem' }}>
                    {error}
                </div>
            )}

            {/* Current active period */}
            <div style={card}>
                <div style={{ fontSize: '.78rem', fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Currently Active</div>
                {active ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c1917' }}>
                            {active.school_year}
                        </div>
                        <div style={{ padding: '4px 16px', borderRadius: 999, background: '#fff7ed', border: '1px solid #fed7aa', color: '#f97316', fontWeight: 700, fontSize: '.9rem' }}>
                            {semLabel(active.semester)}
                        </div>
                        <button onClick={handleAdvance} disabled={advancing} style={{ ...btn('#1c1917'), marginLeft: 'auto', flexShrink: 0 }}>
                            <ArrowRight size={15} />
                            {advancing ? 'Advancing…' : `Advance to ${nextPreview()}`}
                        </button>
                    </div>
                ) : (
                    <div style={{ color: '#a8a29e', fontSize: '.9rem' }}>No active period set.</div>
                )}
            </div>

            {/* Manual set form */}
            <div style={card}>
                <div style={{ fontSize: '.78rem', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 16 }}>Set Active Period Manually</div>
                <form onSubmit={handleSet} className="period-form">
                    <div>
                        <label style={label}>School Year</label>
                        <input
                            style={input}
                            value={form.school_year}
                            onChange={e => setForm(p => ({ ...p, school_year: e.target.value }))}
                            placeholder="e.g. 2025-2026"
                            pattern="\d{4}-\d{4}"
                            required
                        />
                    </div>
                    <div>
                        <label style={label}>Semester</label>
                        <select style={input} value={form.semester} onChange={e => setForm(p => ({ ...p, semester: e.target.value }))}>
                            {SEMESTERS.map(s => <option key={s} value={s}>{semLabel(s)}</option>)}
                        </select>
                    </div>
                    <button type="submit" disabled={saving} style={btn()}>
                        {saving ? 'Saving…' : 'Set Active'}
                    </button>
                </form>
            </div>

            {/* History */}
            {history.length > 0 && (
                <div style={card}>
                    <div style={{ fontSize: '.78rem', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>Period History</div>

                    {/* Tablet+: table */}
                    <div className="subjects-table-wrap" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.875rem', minWidth: 360 }}>
                            <thead>
                                <tr style={{ background: '#fff7ed' }}>
                                    {['School Year', 'Semester', 'Status'].map(h => (
                                        <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: '.75rem', fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(p => (
                                    <tr key={p.id} style={{ borderTop: '1px solid #fde8d0' }}>
                                        <td style={{ padding: '9px 14px', fontWeight: 700, color: '#1c1917' }}>{p.school_year}</td>
                                        <td style={{ padding: '9px 14px', color: '#44403c' }}>{semLabel(p.semester)}</td>
                                        <td style={{ padding: '9px 14px' }}>
                                            {p.is_active
                                                ? <span style={{ padding: '2px 12px', borderRadius: 999, background: '#f0fdf4', color: '#16a34a', fontWeight: 700, fontSize: '.78rem', border: '1px solid #bbf7d0' }}>Active</span>
                                                : <span style={{ padding: '2px 12px', borderRadius: 999, background: '#f8fafc', color: '#94a3b8', fontWeight: 600, fontSize: '.78rem', border: '1px solid #e2e8f0' }}>Past</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile: card list */}
                    <div className="subjects-card-list">
                        {history.map((p, idx) => (
                            <div key={p.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '11px 4px',
                                borderTop: idx > 0 ? '1px solid #fde8d0' : 'none',
                                gap: 12,
                            }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '.9rem', color: '#1c1917' }}>{p.school_year}</div>
                                    <div style={{ fontSize: '.8rem', color: '#78716c', marginTop: 2 }}>{semLabel(p.semester)}</div>
                                </div>
                                {p.is_active
                                    ? <span style={{ padding: '2px 12px', borderRadius: 999, background: '#f0fdf4', color: '#16a34a', fontWeight: 700, fontSize: '.78rem', border: '1px solid #bbf7d0', flexShrink: 0 }}>Active</span>
                                    : <span style={{ padding: '2px 12px', borderRadius: 999, background: '#f8fafc', color: '#94a3b8', fontWeight: 600, fontSize: '.78rem', border: '1px solid #e2e8f0', flexShrink: 0 }}>Past</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
