import React, { useState, useEffect } from 'react';
import api from '../api';
import { Network, Plus, X, Check, AlertCircle, Building } from 'lucide-react';

function AddModal({ onClose, onAdded }) {
    const [form, setForm] = useState({ name: '', type: '', role: '', date_joined: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const res = await api.post('/student/affiliations', form);
            onAdded(res.data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add affiliation.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={s.overlay}>
            <div style={s.modal}>
                <div style={s.modalHeader}>
                    <h2 style={s.modalTitle}>Add Affiliation</h2>
                    <button onClick={onClose} style={s.closeBtn}><X size={15} /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label style={s.label}>Organization / Club Name <span style={{ color: '#dc2626' }}>*</span></label>
                        <input required value={form.name} onChange={set('name')} placeholder="e.g. ACSS, SITES" style={s.input} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={s.label}>Type</label>
                            <input value={form.type} onChange={set('type')} placeholder="e.g. Academic, Sports" style={s.input} />
                        </div>
                        <div>
                            <label style={s.label}>Role</label>
                            <input value={form.role} onChange={set('role')} placeholder="e.g. Member, President" style={s.input} />
                        </div>
                    </div>
                    <div>
                        <label style={s.label}>Date Joined</label>
                        <input type="date" value={form.date_joined} onChange={set('date_joined')} style={s.input} />
                    </div>
                    {error && <div style={s.errorBox}><AlertCircle size={14} /><span>{error}</span></div>}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            <Check size={14} /> {saving ? 'Adding...' : 'Add Affiliation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function StudentAffiliations() {
    const [affiliations, setAffiliations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        api.get('/student/profile')
            .then(r => setAffiliations(r.data.affiliations ?? []))
            .finally(() => setLoading(false));
    }, []);

    const handleAdded = (item) => setAffiliations(prev => [...prev, item]);

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this affiliation?')) return;
        try {
            await api.delete(`/student/affiliations/${id}`);
            setAffiliations(prev => prev.filter(a => a.id !== id));
        } catch {
            alert('Failed to remove affiliation.');
        }
    };

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={s.iconWrap}><Network size={22} color="#f97316" /></div>
                        <div>
                            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>My Affiliations</h1>
                            <p style={{ color: '#78716c', margin: 0, fontSize: '.875rem' }}>
                                {affiliations.length} affiliation{affiliations.length !== 1 ? 's' : ''} on record
                            </p>
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={15} /> Add Affiliation
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading"><div className="loading-spinner" /><p>Loading…</p></div>
            ) : affiliations.length === 0 ? (
                <div className="empty">
                    <Network size={40} color="#fed7aa" />
                    <p style={{ marginTop: 10 }}>No affiliations yet. Add your first one!</p>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ marginTop: 8 }}>
                        <Plus size={14} /> Add Affiliation
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {affiliations.map(a => (
                        <div key={a.id} className="card">
                            <div className="card-body">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Building size={18} color="#2563eb" />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '.95rem', color: '#1c1917' }}>{a.name}</div>
                                            {a.type && <div style={{ fontSize: '.78rem', color: '#78716c' }}>{a.type}</div>}
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a8a29e', padding: 4 }}>
                                        <X size={14} />
                                    </button>
                                </div>
                                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {a.role && <div style={{ fontSize: '.82rem', color: '#44403c' }}><span style={{ color: '#78716c' }}>Role: </span>{a.role}</div>}
                                    {a.date_joined && <div style={{ fontSize: '.82rem', color: '#44403c' }}><span style={{ color: '#78716c' }}>Joined: </span>{a.date_joined}</div>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && <AddModal onClose={() => setShowModal(false)} onAdded={handleAdded} />}
        </div>
    );
}

const s = {
    iconWrap: { width: 44, height: 44, borderRadius: 12, background: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
    modal: { background: '#fff', borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,.2)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1c1917' },
    closeBtn: { background: 'rgba(0,0,0,.05)', border: '1px solid rgba(0,0,0,.08)', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
    label: { display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#44403c', marginBottom: 5 },
    input: { width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid #e7e5e4', fontSize: '.875rem', color: '#1c1917', boxSizing: 'border-box', fontFamily: "'Inter',sans-serif" },
    errorBox: { display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', color: '#dc2626', fontSize: '.82rem' },
};
