import React, { useState } from 'react';
import { createSubject, updateSubject, deleteSubject } from '../api';
import { STATIC_SUBJECTS } from '../data/subjects';
import { BookOpen, Plus, Pencil, Trash2, X, Check } from 'lucide-react';

function Modal({ title, onClose, children }) {
    return (
        <div style={overlay}>
            <div style={modalCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1c1917' }}>{title}</h2>
                    <button onClick={onClose} style={iconBtn}><X size={16} /></button>
                </div>
                {children}
            </div>
        </div>
    );
}

const empty = { subject_code: '', subject_name: '', units: '', description: '', pre_requisite: '', year_level: '', semester: '', program: '' };

const PROGRAMS = [
    { label: 'Information Technology', value: 'Information Technology' },
    { label: 'Computer Science', value: 'Computer Science' },
];

export default function SubjectsMap() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(empty);
    const [saving, setSaving] = useState(false);
    const [activeProgram, setActiveProgram] = useState('Information Technology');

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

    const grouped = subjects.reduce((acc, s) => {
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
            <div key={label} style={{ marginBottom: 28 }}>
                {/* Semester header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'linear-gradient(135deg, #f97316, #fb923c)',
                    borderRadius: '10px 10px 0 0', padding: '10px 16px',
                    flexWrap: 'wrap', gap: 8,
                }}>
                    <span style={{ fontWeight: 700, fontSize: '.9rem', color: '#fff', letterSpacing: .3 }}>{label}</span>
                    <span style={{ fontSize: '.78rem', fontWeight: 600, color: 'rgba(255,255,255,.85)', background: 'rgba(255,255,255,.2)', padding: '2px 10px', borderRadius: 20 }}>
                        Total Units: {totalUnits}
                    </span>
                </div>
                <div style={{ border: '1px solid #fed7aa', borderTop: 'none', borderRadius: '0 0 10px 10px', overflow: 'hidden' }}>
                    {/* Desktop/Tablet table */}
                    <div className="subjects-table-wrap" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.875rem', minWidth: 520 }}>
                            <thead>
                                <tr style={{ background: '#fff7ed' }}>
                                    <th style={{ ...th, width: 36 }}>#</th>
                                    <th style={{ ...th, width: '15%' }}>Course Code</th>
                                    <th style={{ ...th }}>Course Description</th>
                                    <th style={{ ...th, width: 70, textAlign: 'center' }}>Units</th>
                                    <th style={{ ...th, width: '20%' }}>Pre-Requisite</th>
                                    <th style={{ ...th, width: 80, textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((s, idx) => (
                                    <tr key={s.id} style={{ background: idx % 2 === 0 ? '#fff' : '#fffbf7', borderTop: '1px solid #fde8d0' }}>
                                        <td style={{ ...td, color: '#a8a29e', fontSize: '.78rem', width: 36, textAlign: 'center' }}>{idx + 1}</td>
                                        <td style={{ ...td, width: '15%' }}>
                                            <strong style={{ color: '#1c1917', fontSize: '.875rem' }}>{s.subject_code}</strong>
                                        </td>
                                        <td style={{ ...td, fontWeight: 500, color: '#1c1917' }}>{s.subject_name}</td>
                                        <td style={{ ...td, textAlign: 'center', width: 70 }}>
                                            <span style={{
                                                display: 'inline-block', fontWeight: 700, fontSize: '.8rem',
                                                background: '#f0fdf4', color: '#16a34a',
                                                border: '1px solid #bbf7d0', borderRadius: 6,
                                                padding: '2px 10px',
                                            }}>{s.units}</span>
                                        </td>
                                        <td style={{ ...td, width: '20%', color: s.pre_requisite ? '#44403c' : '#a8a29e', fontSize: '.82rem', fontStyle: s.pre_requisite ? 'normal' : 'italic' }}>
                                            {s.pre_requisite || 'none'}
                                        </td>
                                        <td style={{ ...td, textAlign: 'center', width: 80 }}>
                                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                                <button style={iconBtn} onClick={() => openEdit(s)} title="Edit"><Pencil size={13} /></button>
                                                <button style={{ ...iconBtn, color: '#dc2626' }} onClick={() => remove(s.id)} title="Delete"><Trash2 size={13} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile card list — shown only on small screens */}
                    <div className="subjects-card-list">
                        {items.map((s, idx) => (
                            <div key={s.id} style={{
                                padding: '12px 14px',
                                borderTop: idx > 0 ? '1px solid #fde8d0' : 'none',
                                background: idx % 2 === 0 ? '#fff' : '#fffbf7',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                                            <strong style={{ color: '#f97316', fontSize: '.82rem', fontFamily: 'monospace' }}>{s.subject_code}</strong>
                                            <span style={{
                                                fontWeight: 700, fontSize: '.75rem',
                                                background: '#f0fdf4', color: '#16a34a',
                                                border: '1px solid #bbf7d0', borderRadius: 6,
                                                padding: '1px 8px',
                                            }}>{s.units} units</span>
                                        </div>
                                        <div style={{ fontWeight: 600, fontSize: '.875rem', color: '#1c1917', marginBottom: 4 }}>{s.subject_name}</div>
                                        {s.pre_requisite && (
                                            <div style={{ fontSize: '.75rem', color: '#78716c' }}>
                                                Pre-req: <span style={{ color: '#44403c', fontWeight: 500 }}>{s.pre_requisite}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                        <button style={iconBtn} onClick={() => openEdit(s)} title="Edit"><Pencil size={13} /></button>
                                        <button style={{ ...iconBtn, color: '#dc2626' }} onClick={() => remove(s.id)} title="Delete"><Trash2 size={13} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                        <div style={iconWrap}><BookOpen size={22} color="#f97316" /></div>
                        <h1 style={h1}>Subjects</h1>
                    </div>
                    <p style={sub}>All subjects in the system — {subjects.length} total</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Subject</button>
            </div>

            {/* Program Filter Tabs */}
            <div className="dept-filter-row" style={{ marginBottom: 20 }}>
                {PROGRAMS.map(p => (
                    <button
                        key={p.value}
                        onClick={() => handleProgramChange(p.value)}
                        style={{
                            padding: '8px 20px',
                            borderRadius: 10,
                            border: '1.5px solid',
                            borderColor: activeProgram === p.value ? '#f97316' : '#e7e5e4',
                            background: activeProgram === p.value ? '#fff7ed' : '#fff',
                            color: activeProgram === p.value ? '#ea580c' : '#78716c',
                            fontWeight: activeProgram === p.value ? 700 : 500,
                            fontSize: '.875rem',
                            cursor: 'pointer',
                            transition: 'all .15s',
                        }}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {loading ? <div className="loading"><div className="loading-spinner" /><p>Loading…</p></div> : (
                <div>
                    {subjects.length === 0 && <div style={{ textAlign: 'center', color: '#a8a29e', padding: 32, background: '#fff', borderRadius: 12, border: '1px solid #e7e5e4' }}>No subjects yet.</div>}
                    {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Unassigned'].map(y => {
                        if (!grouped[y]) return null;
                        const yearUnits = Object.values(grouped[y]).flat().reduce((sum, s) => sum + (parseInt(s.units) || 0), 0);
                        return (
                            <div key={y} style={{ marginBottom: 48 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg, #f97316, #fed7aa)' }} />
                                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1c1917', whiteSpace: 'nowrap' }}>{y}</span>
                                    <span style={{ fontSize: '.78rem', fontWeight: 600, color: '#ea580c', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 20, padding: '2px 10px' }}>
                                        {yearUnits} units total
                                    </span>
                                    <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg, #fed7aa, transparent)' }} />
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
                    <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[['subject_code', 'Subject Code'], ['subject_name', 'Subject Name'], ['units', 'Units'], ['pre_requisite', 'Pre-Requisite']].map(([k, lbl]) => (
                            <div key={k}>
                                <label style={lStyle}>{lbl}</label>
                                <input style={iStyle} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} required={k === 'subject_name' || k === 'subject_code' || k === 'units'} />
                            </div>
                        ))}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
                        <div>
                            <label style={lStyle}>Program</label>
                            <select style={iStyle} value={form.program} onChange={e => setForm(f => ({ ...f, program: e.target.value }))}>
                                <option value="">— Select —</option>
                                <option value="Information Technology">Information Technology</option>
                                <option value="Computer Science">Computer Science</option>
                            </select>
                        </div>
                        <div>
                            <label style={lStyle}>Description</label>
                            <textarea style={{ ...iStyle, height: 80, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                            <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={saving}><Check size={14} /> {saving ? 'Saving…' : 'Save'}</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

const h1 = { fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 };
const sub = { color: '#78716c', margin: 0 };
const iconWrap = { width: 44, height: 44, borderRadius: 12, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fed7aa' };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 };
const modalCard = { background: '#fff', borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,.2)' };
const iconBtn = { background: 'rgba(0,0,0,.04)', border: '1px solid rgba(0,0,0,.08)', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#78716c' };
const lStyle = { display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#44403c', marginBottom: 5, letterSpacing: .3 };
const iStyle = { width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid #e7e5e4', fontSize: '.875rem', fontFamily: "'Inter',sans-serif", color: '#1c1917', boxSizing: 'border-box' };
const th = { padding: '10px 14px', textAlign: 'left', fontSize: '.75rem', fontWeight: 700, color: '#92400e', letterSpacing: .4, textTransform: 'uppercase', borderBottom: '1px solid #fed7aa' };
const td = { padding: '10px 14px', color: '#44403c', verticalAlign: 'middle' };
