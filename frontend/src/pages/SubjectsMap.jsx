import React, { useState, useEffect } from 'react';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../api';
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

const empty = { subject_code: '', subject_name: '', units: '', description: '', pre_requisite: '' };

export default function SubjectsMap() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // null | 'add' | {edit: subject}
    const [form, setForm] = useState(empty);
    const [saving, setSaving] = useState(false);

    const load = () => { setLoading(true); getSubjects().then(r => setSubjects(r.data)).finally(() => setLoading(false)); };
    useEffect(load, []);

    const openAdd = () => { setForm(empty); setModal('add'); };
    const openEdit = (s) => { setForm({ subject_code: s.subject_code || '', subject_name: s.subject_name || '', units: s.units || '', description: s.description || '', pre_requisite: s.pre_requisite || '' }); setModal({ edit: s }); };

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (modal === 'add') await createSubject(form);
            else await updateSubject(modal.edit.id, form);
            setModal(null); load();
        } finally { setSaving(false); }
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this subject?')) return;
        await deleteSubject(id); load();
    };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                        <div style={iconWrap}><BookOpen size={22} color="#f97316" /></div>
                        <h1 style={h1}>Subjects</h1>
                    </div>
                    <p style={sub}>All subjects in the system — {subjects.length} total</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Subject</button>
            </div>

            {loading ? <div className="loading"><div className="loading-spinner" /><p>Loading…</p></div> : (
                <div className="card">
                    <div className="card-body" style={{ padding: 0 }}>
                        <div className="table-wrap">
                            <table>
                                <thead><tr><th>#</th><th>Code</th><th>Subject Name</th><th>Units</th><th>Pre-requisite</th><th>Description</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {subjects.map((s, i) => (
                                        <tr key={s.id}>
                                            <td>{i + 1}</td>
                                            <td><strong>{s.subject_code}</strong></td>
                                            <td>{s.subject_name}</td>
                                            <td>{s.units ?? '—'}</td>
                                            <td>{s.pre_requisite || '—'}</td>
                                            <td style={{ maxWidth: 200, fontSize: '.8rem', color: '#78716c' }}>{s.description || '—'}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button style={iconBtn} onClick={() => openEdit(s)}><Pencil size={13} /></button>
                                                    <button style={{ ...iconBtn, color: '#dc2626' }} onClick={() => remove(s.id)}><Trash2 size={13} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {subjects.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#a8a29e', padding: 32 }}>No subjects yet.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {modal && (
                <Modal title={modal === 'add' ? 'Add Subject' : 'Edit Subject'} onClose={() => setModal(null)}>
                    <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[['subject_code', 'Subject Code'], ['subject_name', 'Subject Name'], ['units', 'Units'], ['pre_requisite', 'Pre-Requisite']].map(([k, lbl]) => (
                            <div key={k}>
                                <label style={lStyle}>{lbl}</label>
                                <input style={iStyle} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} required={k === 'subject_name'} />
                            </div>
                        ))}
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
