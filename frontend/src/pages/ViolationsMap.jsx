import React, { useState, useEffect } from 'react';
import { getViolations, deleteViolation, updateViolationAction } from '../api';
import { useAuth } from '../AuthContext';
import { ShieldAlert, Search, ChevronDown, Trash2, Pencil, X, Check, CheckCircle } from 'lucide-react';

function Badge({ value }) {
    return value ? <span className={`badge badge-${value.toLowerCase()}`}>{value.replace(/_/g, ' ')}</span> : null;
}

function ActionModal({ violation, onClose, onSaved }) {
    const [action, setAction] = useState(violation.action_taken || '');
    const [saving, setSaving] = useState(false);
    const save = async () => {
        setSaving(true);
        await updateViolationAction(violation.id, action);
        onSaved();
        onClose();
    };
    return (
        <div style={overlay}>
            <div style={modalCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Update Action Taken</h2>
                    <button onClick={onClose} style={iconBtn}><X size={15} /></button>
                </div>
                <p style={{ fontSize: '.85rem', color: '#78716c', marginBottom: 14 }}>
                    <strong>{violation.violation_type}</strong> — {violation.date_committed}
                </p>
                <label style={lStyle}>Action Taken</label>
                <textarea style={{ ...iStyle, height: 90, resize: 'vertical', marginBottom: 16 }} value={action} onChange={e => setAction(e.target.value)} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={save} disabled={saving}><Check size={14} /> {saving ? 'Saving…' : 'Save'}</button>
                </div>
            </div>
        </div>
    );
}

export default function ViolationsMap() {
    const { role } = useAuth();
    const isAdmin = role === 'admin';
    
    const [violations, setViolations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [severity, setSeverity] = useState('');
    const [editing, setEditing] = useState(null);

    const load = () => { setLoading(true); getViolations({ search, severity_level: severity }).then(r => setViolations(r.data)).finally(() => setLoading(false)); };
    useEffect(load, [search, severity]);

    const remove = async (id, violationType) => { 
        if (!window.confirm(`Clear this violation record?\n\nViolation: ${violationType}\n\nThis action cannot be undone.`)) return; 
        try {
            await deleteViolation(id); 
            load();
        } catch (err) {
            alert('Failed to remove violation. Please try again.');
        }
    };

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <div style={iconWrap}><ShieldAlert size={22} color="#f97316" /></div>
                    <h1 style={h1}>Violations</h1>
                </div>
                <p style={sub}>
                    All student violation records — {violations.length} shown
                    {isAdmin && <span style={{ marginLeft: 8, color: '#16a34a', fontWeight: 600 }}>• You can clear violations</span>}
                </p>
            </div>

            <div className="filter-bar no-print">
                <div style={{ position: 'relative' }}>
                    <Search size={15} color="#f97316" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" placeholder="Search violation type…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
                </div>
                <select value={severity} onChange={e => setSeverity(e.target.value)}>
                    <option value="">All Severities</option>
                    <option value="minor">Minor</option>
                    <option value="major">Major</option>
                    <option value="grave">Grave</option>
                </select>
            </div>

            {loading ? <div className="loading"><div className="loading-spinner" /><p>Loading…</p></div> : (
                <div className="card">
                    <div className="card-body" style={{ padding: 0 }}>
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr><th>#</th><th>Student ID</th><th>Student Name</th><th>Violation Type</th><th>Severity</th><th>Date Committed</th><th>Action Taken</th><th>Description</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {violations.map((v, i) => {
                                        console.log('Violation data:', v); // Debug log
                                        return (
                                        <tr key={v.id}>
                                            <td>{i + 1}</td>
                                            <td><strong>{v.student?.student_id || `ID: ${v.student_id}` || '—'}</strong></td>
                                            <td>{v.student ? `${v.student.first_name} ${v.student.last_name}` : '—'}</td>
                                            <td>{v.violation_type}</td>
                                            <td><Badge value={v.severity_level} /></td>
                                            <td>{v.date_committed ? new Date(v.date_committed).toLocaleDateString('en-PH') : '—'}</td>
                                            <td style={{ maxWidth: 160, fontSize: '.8rem' }}>{v.action_taken || <span style={{ color: '#a8a29e' }}>Pending</span>}</td>
                                            <td style={{ maxWidth: 180, fontSize: '.8rem', color: '#78716c' }}>{v.description || '—'}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button style={iconBtn} title="Update action" onClick={() => setEditing(v)}><Pencil size={13} /></button>
                                                    {isAdmin && (
                                                        <button 
                                                            style={{ ...iconBtn, color: '#16a34a', borderColor: '#bbf7d0', background: '#f0fdf4' }} 
                                                            title="Clear violation (Admin only)"
                                                            onClick={() => remove(v.id, v.violation_type)}
                                                        >
                                                            <CheckCircle size={13} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )})}
                                    {violations.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', color: '#a8a29e', padding: 32 }}>No violations recorded.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            {editing && <ActionModal violation={editing} onClose={() => setEditing(null)} onSaved={load} />}
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
