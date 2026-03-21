import React, { useState, useEffect } from 'react';
import api from '../api';
import { Trophy, Plus, X, Check, AlertCircle, Calendar } from 'lucide-react';

const CATEGORIES = ['Sports', 'Arts', 'Community Service', 'Leadership', 'Cultural', 'Other'];

function AddModal({ onClose, onAdded }) {
    const [form, setForm] = useState({
        activity_title: '', category: '', description: '',
        date_started: '', date_ended: '', role: '', organizer: '', game_result: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const res = await api.post('/student/non-academic-histories', form);
            onAdded(res.data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add activity.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={s.overlay}>
            <div style={s.modal}>
                <div style={s.modalHeader}>
                    <h2 style={s.modalTitle}>Add Activity</h2>
                    <button onClick={onClose} style={s.closeBtn}><X size={15} /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label style={s.label}>Activity Title <span style={{ color: '#dc2626' }}>*</span></label>
                        <input required value={form.activity_title} onChange={set('activity_title')} placeholder="e.g. Basketball Tournament" style={s.input} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={s.label}>Category</label>
                            <select value={form.category} onChange={set('category')} style={s.input}>
                                <option value="">Select category</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={s.label}>Role</label>
                            <input value={form.role} onChange={set('role')} placeholder="e.g. Player, Volunteer" style={s.input} />
                        </div>
                    </div>
                    <div>
                        <label style={s.label}>Organizer</label>
                        <input value={form.organizer} onChange={set('organizer')} placeholder="e.g. CCS Department" style={s.input} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={s.label}>Date Started</label>
                            <input type="date" value={form.date_started} onChange={set('date_started')} style={s.input} />
                        </div>
                        <div>
                            <label style={s.label}>Date Ended</label>
                            <input type="date" value={form.date_ended} onChange={set('date_ended')} style={s.input} />
                        </div>
                    </div>
                    <div>
                        <label style={s.label}>Game Result / Award</label>
                        <input value={form.game_result} onChange={set('game_result')} placeholder="e.g. 1st Place, Champion" style={s.input} />
                    </div>
                    <div>
                        <label style={s.label}>Description</label>
                        <textarea value={form.description} onChange={set('description')} placeholder="Brief description..." rows={3}
                            style={{ ...s.input, resize: 'vertical', fontFamily: "'Inter',sans-serif" }} />
                    </div>
                    {error && <div style={s.errorBox}><AlertCircle size={14} /><span>{error}</span></div>}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            <Check size={14} /> {saving ? 'Adding...' : 'Add Activity'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const CATEGORY_COLORS = {
    Sports: { bg: '#eff6ff', border: '#bfdbfe', icon: '#2563eb' },
    Arts: { bg: '#fdf4ff', border: '#e9d5ff', icon: '#9333ea' },
    'Community Service': { bg: '#f0fdf4', border: '#bbf7d0', icon: '#16a34a' },
    Leadership: { bg: '#fff7ed', border: '#fed7aa', icon: '#ea580c' },
    Cultural: { bg: '#fefce8', border: '#fde68a', icon: '#ca8a04' },
    Other: { bg: '#f8fafc', border: '#e2e8f0', icon: '#64748b' },
};

export default function StudentNonAcademicActivities() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        api.get('/student/profile')
            .then(r => setActivities(r.data.non_academic_histories ?? []))
            .finally(() => setLoading(false));
    }, []);

    const handleAdded = (item) => setActivities(prev => [...prev, item]);

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this activity?')) return;
        try {
            await api.delete(`/student/non-academic-histories/${id}`);
            setActivities(prev => prev.filter(a => a.id !== id));
        } catch {
            alert('Failed to remove activity.');
        }
    };

    const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : null;

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={s.iconWrap}><Trophy size={22} color="#f97316" /></div>
                        <div>
                            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>My Activities</h1>
                            <p style={{ color: '#78716c', margin: 0, fontSize: '.875rem' }}>
                                {activities.length} activit{activities.length !== 1 ? 'ies' : 'y'} on record
                            </p>
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={15} /> Add Activity
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading"><div className="loading-spinner" /><p>Loading…</p></div>
            ) : activities.length === 0 ? (
                <div className="empty">
                    <Trophy size={40} color="#fed7aa" />
                    <p style={{ marginTop: 10 }}>No activities yet. Add your first one!</p>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ marginTop: 8 }}>
                        <Plus size={14} /> Add Activity
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                    {activities.map(a => {
                        const colors = CATEGORY_COLORS[a.category] ?? CATEGORY_COLORS.Other;
                        return (
                            <div key={a.id} className="card">
                                <div className="card-body">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 10, background: colors.bg, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Trophy size={18} color={colors.icon} />
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: '.95rem', color: '#1c1917', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.activity_title}</div>
                                                {a.category && (
                                                    <span style={{ fontSize: '.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: colors.bg, color: colors.icon, border: `1px solid ${colors.border}` }}>
                                                        {a.category}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button onClick={() => handleDelete(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a8a29e', padding: 4, flexShrink: 0 }}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {a.role && <div style={{ fontSize: '.82rem', color: '#44403c' }}><span style={{ color: '#78716c' }}>Role: </span>{a.role}</div>}
                                        {a.organizer && <div style={{ fontSize: '.82rem', color: '#44403c' }}><span style={{ color: '#78716c' }}>Organizer: </span>{a.organizer}</div>}
                                        {a.game_result && (
                                            <div style={{ fontSize: '.82rem', fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                🏆 {a.game_result}
                                            </div>
                                        )}
                                        {(a.date_started || a.date_ended) && (
                                            <div style={{ fontSize: '.78rem', color: '#78716c', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                                <Calendar size={11} />
                                                {fmt(a.date_started)}{a.date_ended ? ` – ${fmt(a.date_ended)}` : ''}
                                            </div>
                                        )}
                                        {a.description && <div style={{ fontSize: '.8rem', color: '#78716c', marginTop: 4, lineHeight: 1.5 }}>{a.description}</div>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showModal && <AddModal onClose={() => setShowModal(false)} onAdded={handleAdded} />}
        </div>
    );
}

const s = {
    iconWrap: { width: 44, height: 44, borderRadius: 12, background: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
    modal: { background: '#fff', borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.2)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1c1917' },
    closeBtn: { background: 'rgba(0,0,0,.05)', border: '1px solid rgba(0,0,0,.08)', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
    label: { display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#44403c', marginBottom: 5 },
    input: { width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid #e7e5e4', fontSize: '.875rem', color: '#1c1917', boxSizing: 'border-box', fontFamily: "'Inter',sans-serif" },
    errorBox: { display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', color: '#dc2626', fontSize: '.82rem' },
};
