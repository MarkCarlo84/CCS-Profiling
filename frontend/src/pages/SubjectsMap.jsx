import React, { useState } from 'react';
import { createSubject, updateSubject, deleteSubject } from '../api';
import { STATIC_SUBJECTS } from '../data/subjects';
import { BookOpen, Plus, Pencil, Trash2, X, Check, Search } from 'lucide-react';

function Modal({ title, onClose, children }) {
    return (
        <div style={overlay}>
            <div style={modalCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{title}</h2>
                    <button onClick={onClose} style={iconBtn}><X size={18} /></button>
                </div>
                {children}
            </div>
        </div>
    );
}

const empty = { subject_code: '', subject_name: '', units: '', description: '', pre_requisite: '', year_level: '', semester: '', program: '' };

const PROGRAMS = [
    { label: 'Information Technology', short: 'BSIT', value: 'Information Technology' },
    { label: 'Computer Science', short: 'BSCS', value: 'Computer Science' },
];

const yearMap = {
    '1st Year': 'First Year',
    '2nd Year': 'Second Year',
    '3rd Year': 'Third Year',
    '4th Year': 'Fourth Year',
    'Unassigned': 'Unassigned'
};

export default function SubjectsMap() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(empty);
    const [saving, setSaving] = useState(false);
    const [activeProgram, setActiveProgram] = useState('Information Technology');
    const [searchTerm, setSearchTerm] = useState('');

    const load = (program) => {
        setSubjects(STATIC_SUBJECTS.filter(s => s.program === program));
    };
    useState(() => load(activeProgram));

    const handleProgramChange = (program) => {
        setActiveProgram(program);
        load(program);
    };

    const openAdd = () => { setForm({ ...empty, program: activeProgram }); setModal('add'); };
    const openEdit = (s) => { setForm({ subject_code: s.subject_code || '', subject_name: s.subject_name || '', units: s.units || '', description: s.description || '', pre_requisite: s.pre_requisite || '', year_level: s.year_level || '', semester: s.semester || '', program: s.program || '' }); setModal({ edit: s }); };

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (modal === 'add') await createSubject(form);
            else await updateSubject(modal.edit.id, form);
            setModal(null);
            load(activeProgram);
        } finally { setSaving(false); }
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this subject?')) return;
        await deleteSubject(id);
        load(activeProgram);
    };

    const filteredSubjects = subjects.filter(s => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (s.subject_code?.toLowerCase().includes(q) || s.subject_name?.toLowerCase().includes(q));
    });

    const grouped = filteredSubjects.reduce((acc, s) => {
        const y = s.year_level || 'Unassigned';
        const sem = s.semester || 'Unassigned';
        if (!acc[y]) acc[y] = {};
        if (!acc[y][sem]) acc[y][sem] = [];
        acc[y][sem].push(s);
        return acc;
    }, {});

    const renderTable = (label, items) => {
        if (!items || items.length === 0) return null;
        const totalUnits = items.reduce((sum, s) => sum + (parseInt(s.units) || 0), 0);
        return (
            <div key={label} style={{ marginBottom: 28, borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#fff' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#2563eb',
                    padding: '12px 18px',
                    flexWrap: 'wrap', gap: 8,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <BookOpen size={18} color="#fff" />
                        <span style={{ fontWeight: 600, fontSize: '1rem', color: '#fff' }}>{label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <span style={{ fontSize: '.78rem', fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,.2)', padding: '4px 12px', borderRadius: 20 }}>
                            {items.length} subjects
                        </span>
                        <span style={{ fontSize: '.78rem', fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,.2)', padding: '4px 12px', borderRadius: 20 }}>
                            {totalUnits} units total
                        </span>
                    </div>
                </div>
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.875rem', minWidth: 600 }}>
                        <thead>
                            <tr style={{ background: '#0f172a' }}>
                                <th style={{ ...th, width: 44, textAlign: 'center' }}>#</th>
                                <th style={{ ...th, width: '15%' }}>COURSE CODE</th>
                                <th style={{ ...th }}>COURSE DESCRIPTION</th>
                                <th style={{ ...th, width: 80, textAlign: 'center' }}>UNITS</th>
                                <th style={{ ...th, width: '20%' }}>PRE-REQUISITE</th>
                                <th style={{ ...th, width: 100, textAlign: 'center' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((s, idx) => (
                                <tr key={s.id} style={{ borderTop: idx > 0 ? '1px solid #e2e8f0' : 'none', background: '#fff' }}>
                                    <td style={{ ...td, color: '#64748b', fontSize: '.8rem', textAlign: 'center' }}>{idx + 1}</td>
                                    <td style={{ ...td }}>
                                        <strong style={{ color: '#0f172a', fontSize: '.875rem' }}>{s.subject_code}</strong>
                                    </td>
                                    <td style={{ ...td, color: '#334155' }}>{s.subject_name}</td>
                                    <td style={{ ...td, textAlign: 'center' }}>
                                        <strong style={{ fontSize: '.95rem', color: '#2563eb' }}>{s.units}</strong>
                                    </td>
                                    <td style={{ ...td, color: s.pre_requisite ? '#334155' : '#94a3b8', fontStyle: s.pre_requisite ? 'normal' : 'italic' }}>
                                        {s.pre_requisite || 'none'}
                                    </td>
                                    <td style={{ ...td, textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                            <button style={actionBtn} onClick={() => openEdit(s)} title="Edit"><Pencil size={14} /></button>
                                            <button style={{ ...actionBtn, color: '#ef4444' }} onClick={() => remove(s.id)} title="Delete"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const activeProgObj = PROGRAMS.find(p => p.value === activeProgram);

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                        <div style={iconWrap}><BookOpen size={22} color="#f97316" /></div>
                        <h1 style={h1}>Subjects</h1>
                    </div>
                    <p style={sub}>BS {activeProgObj?.label} curriculum — {filteredSubjects.length} subjects</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd} style={{ background: '#f97316', border: 'none', padding: '10px 18px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontWeight: 600, fontSize: '.9rem', cursor: 'pointer' }}>
                    <Plus size={16} /> Add Subject
                </button>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', marginTop: 24 }}>
                {PROGRAMS.map(p => {
                    const isActive = activeProgram === p.value;
                    return (
                        <button
                            key={p.value}
                            onClick={() => handleProgramChange(p.value)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '10px 20px',
                                borderRadius: 8,
                                border: '1px solid',
                                borderColor: isActive ? '#3b82f6' : '#cbd5e1',
                                background: isActive ? '#eff6ff' : '#fff',
                                color: isActive ? '#2563eb' : '#64748b',
                                fontWeight: 600,
                                fontSize: '.9rem',
                                cursor: 'pointer',
                                transition: 'all .15s',
                            }}
                        >
                            <BookOpen size={16} color={isActive ? '#3b82f6' : '#64748b'} />
                            <span><strong style={{ color: isActive ? '#1d4ed8' : '#334155' }}>{p.short}</strong> {p.label}</span>
                        </button>
                    );
                })}
            </div>

            <div style={{ position: 'relative', marginBottom: 32 }}>
                <Search size={18} color="#f97316" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                    type="text" 
                    placeholder="Search code or subject nam"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '14px 14px 14px 44px',
                        borderRadius: 10,
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        fontSize: '.95rem',
                        color: '#0f172a',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                />
            </div>

            {loading ? <div className="loading"><div className="loading-spinner" /><p>Loading…</p></div> : (
                <div>
                    {filteredSubjects.length === 0 && <div style={{ textAlign: 'center', color: '#64748b', padding: 40, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>No subjects found.</div>}
                    {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Unassigned'].map(y => {
                        if (!grouped[y]) return null;
                        const yearSubs = Object.values(grouped[y]).flat();
                        return (
                            <div key={y} style={{ marginBottom: 40 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, height: 1, background: '#2563eb' }} />
                                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#2563eb', whiteSpace: 'nowrap' }}>{yearMap[y] || y}</span>
                                    <span style={{ fontSize: '.8rem', fontWeight: 600, color: '#2563eb', whiteSpace: 'nowrap' }}>{yearSubs.length} subjects</span>
                                    <div style={{ flex: 1, height: 1, background: '#2563eb' }} />
                                </div>
                                {['1st Semester', '2nd Semester', 'Summer', 'Unassigned'].map(sem =>
                                    renderTable(sem !== 'Unassigned' ? sem : (y === 'Unassigned' ? 'Uncategorized Subjects' : 'Other'), grouped[y][sem])
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {modal && (
                <Modal title={modal === 'add' ? 'Add Subject' : 'Edit Subject'} onClose={() => setModal(null)}>
                    <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: 16 }}>
                            <div>
                                <label style={lStyle}>Course Code <span style={{color: '#ef4444'}}>*</span></label>
                                <input style={iStyle} placeholder="e.g. CCS101-IT" value={form.subject_code} onChange={e => setForm(f => ({...f, subject_code: e.target.value}))} required />
                            </div>
                            <div>
                                <label style={lStyle}>Course Description <span style={{color: '#ef4444'}}>*</span></label>
                                <input style={iStyle} placeholder="e.g. Introduction to Computing" value={form.subject_name} onChange={e => setForm(f => ({...f, subject_name: e.target.value}))} required />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                            <div>
                                <label style={lStyle}>Program</label>
                                <select style={iStyle} value={form.program} onChange={e => setForm(f => ({ ...f, program: e.target.value }))}>
                                    <option value="Information Technology">BSIT</option>
                                    <option value="Computer Science">BSCS</option>
                                </select>
                            </div>
                            <div>
                                <label style={lStyle}>Year Level</label>
                                <select style={iStyle} value={form.year_level} onChange={e => setForm(f => ({ ...f, year_level: e.target.value }))}>
                                    <option value="">— Select —</option>
                                    <option value="1st Year">1st Year</option>
                                    <option value="2nd Year">2nd Year</option>
                                    <option value="3rd Year">3rd Year</option>
                                    <option value="4th Year">4th Year</option>
                                </select>
                            </div>
                            <div>
                                <label style={lStyle}>Semester</label>
                                <select style={iStyle} value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}>
                                    <option value="">— Select —</option>
                                    <option value="1st Semester">1st Semester</option>
                                    <option value="2nd Semester">2nd Semester</option>
                                    <option value="Summer">Summer</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: 16 }}>
                            <div>
                                <label style={lStyle}>Units <span style={{color: '#ef4444'}}>*</span></label>
                                <input style={iStyle} type="number" min="0" value={form.units} onChange={e => setForm(f => ({...f, units: e.target.value}))} required />
                            </div>
                            <div>
                                <label style={lStyle}>Pre-requisite</label>
                                <input style={iStyle} placeholder="e.g. CCS101 or none" value={form.pre_requisite} onChange={e => setForm(f => ({...f, pre_requisite: e.target.value}))} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                            <button type="button" style={{ ...modalBtn, background: '#fff', border: '1px solid #cbd5e1', color: '#1e293b' }} onClick={() => setModal(null)}>Cancel</button>
                            <button type="submit" style={{ ...modalBtn, background: '#f97316', color: '#fff', border: 'none' }} disabled={saving}>
                                <Check size={16} color="#fff" /> {saving ? 'Saving…' : 'Save'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

const h1 = { fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 };
const sub = { color: '#64748b', margin: 0 };
const iconWrap = { width: 44, height: 44, borderRadius: 12, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fed7aa' };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20, backdropFilter: 'blur(3px)' };
const modalCard = { background: '#fff', borderRadius: 16, padding: '28px 32px', width: '100%', maxWidth: 640, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' };
const iconBtn = { background: 'transparent', border: 'none', borderRadius: 6, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'background 0.2s' };
const lStyle = { display: 'block', fontSize: '.8rem', fontWeight: 600, color: '#0f172a', marginBottom: 6 };
const iStyle = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '.875rem', fontFamily: "'Inter',sans-serif", color: '#1e293b', background: '#f8fafc', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' };
const modalBtn = { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, fontSize: '.875rem', fontWeight: 600, cursor: 'pointer', boxShadow: 'none', transition: 'opacity 0.2s' };
const actionBtn = { background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' };
const th = { padding: '12px 16px', textAlign: 'left', fontSize: '.75rem', fontWeight: 600, color: '#f8fafc', letterSpacing: '.05em' };
const td = { padding: '14px 16px', verticalAlign: 'middle' };
