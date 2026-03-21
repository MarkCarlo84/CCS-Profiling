import React, { useState, useEffect } from 'react';
import api from '../api';
import { Zap, Plus, X, Check, AlertCircle } from 'lucide-react';

const LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];
const LEVEL_COLORS = {
    expert:       { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' },
    advanced:     { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
    intermediate: { bg: '#f0fdf4', text: '#059669', border: '#bbf7d0' },
    beginner:     { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
};

function AddSkillModal({ onClose, onAdded }) {
    const [form, setForm] = useState({ skill_name: '', skill_level: 'beginner', certification: false });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const res = await api.post('/student/skills', form);
            onAdded(res.data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add skill.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={s.overlay}>
            <div style={s.modal}>
                <div style={s.modalHeader}>
                    <h2 style={s.modalTitle}>Add Skill</h2>
                    <button onClick={onClose} style={s.closeBtn}><X size={15} /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label style={s.label}>Skill Name</label>
                        <input
                            required
                            value={form.skill_name}
                            onChange={e => setForm(f => ({ ...f, skill_name: e.target.value }))}
                            placeholder="e.g. Python, Photoshop, Public Speaking"
                            style={s.input}
                        />
                    </div>
                    <div>
                        <label style={s.label}>Proficiency Level</label>
                        <select value={form.skill_level} onChange={e => setForm(f => ({ ...f, skill_level: e.target.value }))} style={s.input}>
                            {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                        </select>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.875rem', color: '#44403c', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={form.certification}
                            onChange={e => setForm(f => ({ ...f, certification: e.target.checked }))}
                        />
                        Has certification / credential
                    </label>
                    {error && (
                        <div style={s.errorBox}>
                            <AlertCircle size={14} /><span>{error}</span>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            <Check size={14} /> {saving ? 'Adding...' : 'Add Skill'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function StudentSkills() {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filterLevel, setFilterLevel] = useState('');

    useEffect(() => {
        api.get('/student/profile')
            .then(r => setSkills(r.data.skills ?? []))
            .finally(() => setLoading(false));
    }, []);

    const handleAdded = (skill) => setSkills(prev => [...prev, skill]);

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this skill?')) return;
        try {
            await api.delete(`/student/skills/${id}`);
            setSkills(prev => prev.filter(s => s.id !== id));
        } catch {
            alert('Failed to remove skill.');
        }
    };

    const filtered = filterLevel ? skills.filter(s => s.skill_level === filterLevel) : skills;

    // Group by level
    const grouped = LEVELS.reduce((acc, lvl) => {
        const items = filtered.filter(s => s.skill_level === lvl);
        if (items.length) acc[lvl] = items;
        return acc;
    }, {});

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={s.iconWrap}><Zap size={22} color="#f97316" /></div>
                        <div>
                            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>My Skills</h1>
                            <p style={{ color: '#78716c', margin: 0, fontSize: '.875rem' }}>
                                {skills.length} skill{skills.length !== 1 ? 's' : ''} on record
                            </p>
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={15} /> Add Skill
                    </button>
                </div>
            </div>

            {/* Filter bar */}
            <div className="filter-bar">
                <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
                    <option value="">All Levels</option>
                    {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                </select>
            </div>

            {loading ? (
                <div className="loading"><div className="loading-spinner" /><p>Loading skills…</p></div>
            ) : skills.length === 0 ? (
                <div className="empty">
                    <Zap size={40} color="#fed7aa" />
                    <p style={{ marginTop: 10 }}>No skills yet. Add your first skill!</p>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ marginTop: 8 }}>
                        <Plus size={14} /> Add Skill
                    </button>
                </div>
            ) : filtered.length === 0 ? (
                <div className="empty"><p>No skills at this level.</p></div>
            ) : (
                Object.entries(grouped).map(([lvl, items]) => {
                    const c = LEVEL_COLORS[lvl];
                    return (
                        <div key={lvl} className="card" style={{ marginBottom: 20 }}>
                            <div className="card-header" style={{ background: `linear-gradient(135deg,${c.text},${c.text}cc)`, color: '#fff' }}>
                                <h2 style={{ color: '#fff', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Zap size={16} /> {lvl}
                                </h2>
                                <span className="badge" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>{items.length}</span>
                            </div>
                            <div className="card-body">
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                    {items.map(skill => (
                                        <div key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 12, background: c.bg, border: `1px solid ${c.border}` }}>
                                            <div>
                                                <div style={{ fontSize: '.875rem', fontWeight: 700, color: c.text }}>{skill.skill_name}</div>
                                                {skill.certification && (
                                                    <div style={{ fontSize: '.72rem', color: '#16a34a', fontWeight: 600 }}>✓ Certified</div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDelete(skill.id)}
                                                title="Remove skill"
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#a8a29e', display: 'flex', alignItems: 'center', marginLeft: 4 }}
                                            >
                                                <X size={13} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}

            {showModal && <AddSkillModal onClose={() => setShowModal(false)} onAdded={handleAdded} />}
        </div>
    );
}

const s = {
    iconWrap: { width: 44, height: 44, borderRadius: 12, background: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
    modal: { background: '#fff', borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,.2)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1c1917' },
    closeBtn: { background: 'rgba(0,0,0,.05)', border: '1px solid rgba(0,0,0,.08)', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
    label: { display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#44403c', marginBottom: 5 },
    input: { width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid #e7e5e4', fontSize: '.875rem', color: '#1c1917', boxSizing: 'border-box', fontFamily: "'Inter',sans-serif" },
    errorBox: { display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', color: '#dc2626', fontSize: '.82rem' },
};
