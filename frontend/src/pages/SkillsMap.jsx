import React, { useState, useEffect } from 'react';
import { getSkills, deleteSkill, updateSkillLevel } from '../api';
import { Zap, Search, Pencil, Trash2, X, Check } from 'lucide-react';

function Badge({ value }) {
    return value ? <span className={`badge badge-${value.toLowerCase()}`}>{value}</span> : null;
}

const LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];

function LevelModal({ skill, onClose, onSaved }) {
    const [level, setLevel] = useState(skill.skill_level);
    const [saving, setSaving] = useState(false);
    const save = async () => { setSaving(true); await updateSkillLevel(skill.id, level); onSaved(); onClose(); };
    return (
        <div style={overlay}>
            <div style={modalCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Update Skill Level</h2>
                    <button onClick={onClose} style={iconBtn}><X size={15} /></button>
                </div>
                <p style={{ fontSize: '.85rem', color: '#78716c', marginBottom: 14 }}><strong>{skill.skill_name}</strong></p>
                <label style={lStyle}>Level</label>
                <select style={{ ...iStyle, marginBottom: 16 }} value={level} onChange={e => setLevel(e.target.value)}>
                    {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                </select>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={save} disabled={saving}><Check size={14} /> {saving ? 'Saving…' : 'Save'}</button>
                </div>
            </div>
        </div>
    );
}

export default function SkillsMap() {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterLevel, setFilterLevel] = useState('');
    const [editing, setEditing] = useState(null);

    const load = () => { setLoading(true); getSkills({ search, skill_level: filterLevel }).then(r => setSkills(r.data)).finally(() => setLoading(false)); };
    useEffect(load, [search, filterLevel]);

    const remove = async (id) => { if (!window.confirm('Delete this skill record?')) return; await deleteSkill(id); load(); };

    // Group by level for visual clarity
    const byLevel = LEVELS.reduce((acc, lvl) => {
        const items = skills.filter(s => s.skill_level === lvl);
        if (items.length) acc[lvl] = items;
        return acc;
    }, {});

    const levelColors = { expert: '#7c3aed', advanced: '#2563eb', intermediate: '#059669', beginner: '#d97706' };

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <div style={iconWrap}><Zap size={22} color="#f97316" /></div>
                    <h1 style={h1}>Skills</h1>
                </div>
                <p style={sub}>Student skills, proficiency levels and certifications — {skills.length} total</p>
            </div>
            <div className="filter-bar">
                <div style={{ position: 'relative' }}>
                    <Search size={15} color="#f97316" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" placeholder="Search skill name…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
                </div>
                <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
                    <option value="">All Levels</option>
                    {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                </select>
            </div>

            {loading ? <div className="loading"><div className="loading-spinner" /><p>Loading…</p></div> : (
                filterLevel
                    ? <SimpleTable skills={skills} onEdit={setEditing} onDelete={remove} levelColors={levelColors} />
                    : Object.entries(byLevel).map(([lvl, items]) => (
                        <div key={lvl} className="card" style={{ marginBottom: 20 }}>
                            <div className="card-header" style={{ background: `linear-gradient(135deg,${levelColors[lvl]},${levelColors[lvl]}cc)`, color: '#fff' }}>
                                <h2 style={{ color: '#fff', textTransform: 'capitalize' }}>{lvl}</h2>
                                <span className="badge" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>{items.length}</span>
                            </div>
                            <div className="card-body" style={{ padding: 0 }}>
                                <SimpleTable skills={items} onEdit={setEditing} onDelete={remove} levelColors={levelColors} />
                            </div>
                        </div>
                    ))
            )}

            {editing && <LevelModal skill={editing} onClose={() => setEditing(null)} onSaved={load} />}
        </div>
    );
}

function SimpleTable({ skills, onEdit, onDelete, levelColors }) {
    return (
        <div>
            {/* Tablet+: scrollable table */}
            <div className="subjects-table-wrap" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ minWidth: 460 }}>
                    <thead><tr><th>#</th><th>Student ID</th><th>Skill Name</th><th>Level</th><th>Certified</th><th>Actions</th></tr></thead>
                    <tbody>
                        {skills.map((s, i) => (
                            <tr key={s.id}>
                                <td>{i + 1}</td>
                                <td><strong>{s.student_id}</strong></td>
                                <td>{s.skill_name}</td>
                                <td><span className={`badge badge-${s.skill_level}`} style={{ textTransform: 'capitalize' }}>{s.skill_level}</span></td>
                                <td>{s.certification ? <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '.8rem' }}>✓ Yes</span> : <span style={{ color: '#a8a29e', fontSize: '.8rem' }}>No</span>}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button style={iconBtn} onClick={() => onEdit(s)}><Pencil size={13} /></button>
                                        <button style={{ ...iconBtn, color: '#dc2626' }} onClick={() => onDelete(s.id)}><Trash2 size={13} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {skills.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#a8a29e', padding: 32 }}>No skills found.</td></tr>}
                    </tbody>
                </table>
            </div>
            {/* Mobile: card list */}
            <div className="subjects-card-list">
                {skills.length === 0 ? (
                    <p style={{ padding: '24px 14px', textAlign: 'center', color: '#a8a29e', fontSize: '.875rem' }}>No skills found.</p>
                ) : skills.map((s, i) => (
                    <div key={s.id} style={{ padding: '11px 14px', borderTop: i > 0 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                                <strong style={{ color: '#f97316', fontSize: '.82rem', fontFamily: 'monospace' }}>{s.student_id}</strong>
                                <span className={`badge badge-${s.skill_level}`} style={{ textTransform: 'capitalize' }}>{s.skill_level}</span>
                                {s.certification && <span style={{ fontSize: '.7rem', color: '#16a34a', fontWeight: 700 }}>✓ Certified</span>}
                            </div>
                            <div style={{ fontWeight: 600, fontSize: '.875rem', color: '#1c1917' }}>{s.skill_name}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            <button style={iconBtn} onClick={() => onEdit(s)}><Pencil size={13} /></button>
                            <button style={{ ...iconBtn, color: '#dc2626' }} onClick={() => onDelete(s.id)}><Trash2 size={13} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const h1 = { fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 };
const sub = { color: '#78716c', margin: 0 };
const iconWrap = { width: 44, height: 44, borderRadius: 12, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fed7aa' };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 };
const modalCard = { background: '#fff', borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,.2)' };
const iconBtn = { background: 'rgba(0,0,0,.04)', border: '1px solid rgba(0,0,0,.08)', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#78716c' };
const lStyle = { display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#44403c', marginBottom: 5, letterSpacing: .3 };
const iStyle = { width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid #e7e5e4', fontSize: '.875rem', fontFamily: "'Inter',sans-serif", color: '#1c1917', boxSizing: 'border-box' };
