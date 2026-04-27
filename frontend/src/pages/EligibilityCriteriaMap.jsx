import React, { useState, useEffect } from 'react';
import { getEligibilityCriteria, createEligibilityCriteria, updateEligibilityCriteria, deleteEligibilityCriteria } from '../api';
import { ClipboardCheck, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { ExportButtons, PrintHeader } from '../components/ExportControls';
import { useRef } from 'react';

function flattenCriteria(c, i) {
    return {
        '#': i + 1,
        'Criteria ID': c.criteria_id || `EC-${c.id}`,
        'Min GPA': c.minimum_gpa != null ? parseFloat(c.minimum_gpa).toFixed(2) : '',
        'Required Skill': c.required_skill || '',
        'Affiliation Type': c.required_affiliation_type || '',
        'Max Violations': c.max_allowed_violations ?? ''
    };
}

const empty = { criteria_id: '', minimum_gpa: '', required_skill: '', required_affiliation_type: '', max_allowed_violations: '' };

function Modal({ title, onClose, form, setForm, onSave, saving }) {
    return (
        <div style={overlay}>
            <div style={modalCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>{title}</h2>
                    <button onClick={onClose} style={iconBtn}><X size={15} /></button>
                </div>
                <form onSubmit={onSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[['criteria_id', 'Criteria ID'], ['minimum_gpa', 'Minimum GPA'], ['required_skill', 'Required Skill'], ['required_affiliation_type', 'Required Affiliation Type'], ['max_allowed_violations', 'Max Allowed Violations']].map(([k, lbl]) => (
                        <div key={k}>
                            <label style={lStyle}>{lbl}</label>
                            <input style={iStyle} type={k.includes('gpa') || k.includes('violations') ? 'number' : 'text'} step={k.includes('gpa') ? '0.01' : undefined} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}><Check size={14} /> {saving ? 'Saving…' : 'Save'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function EligibilityCriteriaMap() {
    const [criteria, setCriteria] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(empty);
    const [saving, setSaving] = useState(false);
    const [isPdfMode, setIsPdfMode] = useState(false);
    const [pdfData, setPdfData] = useState([]);

    const printRef = useRef(null);

    const load = () => { 
        setLoading(true); 
        getEligibilityCriteria().then(r => {
            // Support both direct array and paginated response
            setCriteria(Array.isArray(r.data) ? r.data : r.data.data);
        }).finally(() => setLoading(false)); 
    };
    useEffect(load, []);

    const fetchFullData = async () => {
        const res = await getEligibilityCriteria({ limit: 99999 });
        return Array.isArray(res.data) ? res.data : res.data.data;
    };

    const handleBeforePdf = async () => {
        setIsPdfMode(true);
        const data = await fetchFullData();
        setPdfData(data);
    };

    const openAdd = () => { setForm(empty); setModal('add'); };
    const openEdit = (c) => { setForm({ criteria_id: c.criteria_id || '', minimum_gpa: c.minimum_gpa || '', required_skill: c.required_skill || '', required_affiliation_type: c.required_affiliation_type || '', max_allowed_violations: c.max_allowed_violations ?? '' }); setModal({ edit: c }); };

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (modal === 'add') await createEligibilityCriteria(form);
            else await updateEligibilityCriteria(modal.edit.id, form);
            setModal(null); load();
        } finally { setSaving(false); }
    };

    const remove = async (id) => { if (!window.confirm('Delete this eligibility criteria?')) return; await deleteEligibilityCriteria(id); load(); };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                        <div style={iconWrap}><ClipboardCheck size={22} color="#f97316" /></div>
                        <h1 style={h1}>Eligibility Criteria</h1>
                    </div>
                    <p style={sub}>Define criteria for awards, honors, or eligibility checks</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ExportButtons 
                        printRef={printRef} 
                        data={fetchFullData} 
                        flattenFn={flattenCriteria} 
                        filenamePrefix="Eligibility_Criteria" 
                        onBeforePdf={handleBeforePdf}
                        onAfterPdf={() => setIsPdfMode(false)}
                    />
                    <button className="btn btn-primary no-print" onClick={openAdd}><Plus size={15} /> Add Criteria</button>
                </div>
            </div>

            <div ref={printRef} style={{ background: '#fff' }}>
                <PrintHeader 
                    title="Eligibility Criteria" 
                    subtitle="Criteria for awards, honors, or eligibility checks" 
                    count={criteria.length} 
                />

                {loading ? <div className="loading"><div className="loading-spinner" /></div> : (
                    <>
                        {/* Screen View */}
                        {!isPdfMode && (
                            <div className="card pdf-hide">
                                <div className="card-body" style={{ padding: 0 }}>
                                    <div className="subjects-table-wrap" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                                        <table style={{ minWidth: 520 }}>
                                            <thead>
                                                <tr><th>#</th><th>Criteria ID</th><th>Min GPA</th><th>Required Skill</th><th>Affiliation Type</th><th>Max Violations</th><th className="no-print">Actions</th></tr>
                                            </thead>
                                            <tbody>
                                                {criteria.map((c, i) => (
                                                    <tr key={c.id}>
                                                        <td>{i + 1}</td>
                                                        <td><strong>{c.criteria_id || `EC-${c.id}`}</strong></td>
                                                        <td>{c.minimum_gpa != null ? <span style={{ fontWeight: 700, color: '#2563eb' }}>{parseFloat(c.minimum_gpa).toFixed(2)}</span> : '—'}</td>
                                                        <td>{c.required_skill || '—'}</td>
                                                        <td>{c.required_affiliation_type || '—'}</td>
                                                        <td>{c.max_allowed_violations ?? '—'}</td>
                                                        <td className="no-print">
                                                            <div style={{ display: 'flex', gap: 6 }}>
                                                                <button style={iconBtn} onClick={() => openEdit(c)}><Pencil size={13} /></button>
                                                                <button style={{ ...iconBtn, color: '#dc2626' }} onClick={() => remove(c.id)}><Trash2 size={13} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {criteria.length === 0 && (
                                                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#a8a29e' }}>
                                                        No eligibility criteria defined yet. Click "Add Criteria" to get started.
                                                    </td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile: card list */}
                                    <div className="subjects-card-list">
                                        {criteria.length === 0 ? (
                                            <p style={{ padding: '24px 14px', textAlign: 'center', color: '#a8a29e', fontSize: '.875rem' }}>No eligibility criteria defined yet.</p>
                                        ) : criteria.map((c, i) => (
                                            <div key={c.id} style={{ padding: '12px 14px', borderTop: i > 0 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: 700, fontSize: '.875rem', color: '#1c1917', marginBottom: 4 }}>
                                                        {c.criteria_id || `EC-${c.id}`}
                                                    </div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                        {c.minimum_gpa != null && (
                                                            <span style={{ fontSize: '.72rem', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 5, padding: '1px 7px', fontWeight: 700 }}>
                                                                GPA ≤ {parseFloat(c.minimum_gpa).toFixed(2)}
                                                            </span>
                                                        )}
                                                        {c.required_skill && (
                                                            <span style={{ fontSize: '.72rem', background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', borderRadius: 5, padding: '1px 7px', fontWeight: 600 }}>
                                                                Skill: {c.required_skill}
                                                            </span>
                                                        )}
                                                        {c.required_affiliation_type && (
                                                            <span style={{ fontSize: '.72rem', background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: 5, padding: '1px 7px', fontWeight: 600 }}>
                                                                {c.required_affiliation_type}
                                                            </span>
                                                        )}
                                                        {c.max_allowed_violations != null && (
                                                            <span style={{ fontSize: '.72rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 5, padding: '1px 7px', fontWeight: 600 }}>
                                                                Max {c.max_allowed_violations} violation{c.max_allowed_violations !== 1 ? 's' : ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                                    <button style={iconBtn} onClick={() => openEdit(c)}><Pencil size={13} /></button>
                                                    <button style={{ ...iconBtn, color: '#dc2626' }} onClick={() => remove(c.id)}><Trash2 size={13} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PDF View */}
                        {isPdfMode && (() => {
                            const PRINT_PAGE = 15;
                            const pageChunks = [];
                            for (let i = 0; i < pdfData.length; i += PRINT_PAGE) {
                                pageChunks.push(pdfData.slice(i, i + PRINT_PAGE));
                            }
                            if (pageChunks.length === 0) pageChunks.push([]);

                            return (
                                <div>
                                    {pageChunks.map((chunk, pageIdx) => (
                                        <div key={pageIdx} style={{ pageBreakAfter: pageIdx < pageChunks.length - 1 ? 'always' : 'auto', marginBottom: 32 }}>
                                            <div style={{
                                                background: 'linear-gradient(135deg,#ea580c,#f97316)',
                                                color: '#fff', padding: '10px 16px',
                                                fontWeight: 800, fontSize: '1rem',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            }}>
                                                <span>Eligibility Criteria List</span>
                                                <span style={{ fontSize: '.82rem', opacity: .85 }}>
                                                    Page {pageIdx + 1} of {pageChunks.length} &nbsp;·&nbsp; {pdfData.length} items
                                                </span>
                                            </div>
                                            <table className="report-table" style={{ marginTop: 0 }}>
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Criteria ID</th>
                                                        <th>Min GPA</th>
                                                        <th>Required Skill</th>
                                                        <th>Affiliation Type</th>
                                                        <th>Max Violations</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {chunk.map((c, i) => (
                                                        <tr key={c.id}>
                                                            <td>{pageIdx * PRINT_PAGE + i + 1}</td>
                                                            <td><strong>{c.criteria_id || `EC-${c.id}`}</strong></td>
                                                            <td>{c.minimum_gpa != null ? <span style={{ fontWeight: 700 }}>{parseFloat(c.minimum_gpa).toFixed(2)}</span> : '—'}</td>
                                                            <td>{c.required_skill || '—'}</td>
                                                            <td>{c.required_affiliation_type || '—'}</td>
                                                            <td>{c.max_allowed_violations ?? '—'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </>
                )}
            </div>

            {modal && <Modal title={modal === 'add' ? 'Add Criteria' : 'Edit Criteria'} onClose={() => setModal(null)} form={form} setForm={setForm} onSave={save} saving={saving} />}
        </div>
    );
}

const h1 = { fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 };
const sub = { color: '#78716c', margin: 0 };
const iconWrap = { width: 44, height: 44, borderRadius: 12, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fed7aa' };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 };
const modalCard = { background: '#fff', borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,.2)' };
const iconBtn = { background: 'rgba(0,0,0,.04)', border: '1px solid rgba(0,0,0,.08)', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#78716c' };
const lStyle = { display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#44403c', marginBottom: 5, letterSpacing: .3 };
const iStyle = { width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid #e7e5e4', fontSize: '.875rem', fontFamily: "'Inter',sans-serif", color: '#1c1917', boxSizing: 'border-box' };
