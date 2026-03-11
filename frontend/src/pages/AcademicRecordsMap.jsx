import React, { useState, useEffect } from 'react';
import { getAcademicRecords, deleteAcademicRecord } from '../api';
import { GraduationCap, Search, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function AcademicRecordsMap() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState({});

    const load = () => { setLoading(true); getAcademicRecords({ search }).then(r => setRecords(r.data)).finally(() => setLoading(false)); };
    useEffect(load, [search]);

    const remove = async (id) => { if (!window.confirm('Delete this academic record?')) return; await deleteAcademicRecord(id); load(); };
    const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <div style={iconWrap}><GraduationCap size={22} color="#f97316" /></div>
                    <h1 style={h1}>Academic Records</h1>
                </div>
                <p style={sub}>Student semester records with GPA and grades — {records.length} total</p>
            </div>
            <div className="filter-bar">
                <div style={{ position: 'relative' }}>
                    <Search size={15} color="#f97316" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" placeholder="Search by school year…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
                </div>
            </div>

            {loading ? <div className="loading"><div className="loading-spinner" /></div> : (
                <div className="card">
                    <div className="card-body" style={{ padding: 0 }}>
                        <div className="table-wrap">
                            <table>
                                <thead><tr><th>#</th><th>Student ID</th><th>School Year</th><th>Semester</th><th>GPA</th><th>Grades</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {records.map((r, i) => (
                                        <React.Fragment key={r.id}>
                                            <tr>
                                                <td>{i + 1}</td>
                                                <td><strong>{r.student_id}</strong></td>
                                                <td>{r.school_year}</td>
                                                <td>{r.semester || '—'}</td>
                                                <td>
                                                    {r.gpa != null
                                                        ? <span style={{ fontWeight: 700, color: r.gpa <= 1.5 ? '#16a34a' : r.gpa <= 2.5 ? '#2563eb' : '#dc2626' }}>{parseFloat(r.gpa).toFixed(2)}</span>
                                                        : '—'}
                                                </td>
                                                <td>
                                                    {r.grades?.length > 0 && (
                                                        <button style={iconBtn} onClick={() => toggle(r.id)} title="Toggle grades">
                                                            {expanded[r.id] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                                            <span style={{ fontSize: '.75rem', marginLeft: 4 }}>{r.grades.length} subjects</span>
                                                        </button>
                                                    )}
                                                </td>
                                                <td>
                                                    <button style={{ ...iconBtn, color: '#dc2626' }} onClick={() => remove(r.id)}><Trash2 size={13} /></button>
                                                </td>
                                            </tr>
                                            {expanded[r.id] && r.grades?.map(g => (
                                                <tr key={g.id} style={{ background: '#fffbf5' }}>
                                                    <td colSpan={2} style={{ paddingLeft: 32, fontSize: '.8rem', color: '#78716c' }}>→ Subject</td>
                                                    <td colSpan={2} style={{ fontSize: '.85rem', fontWeight: 600 }}>{g.subject_name || g.subject?.subject_name}</td>
                                                    <td style={{ fontWeight: 700, color: g.score <= 1.5 ? '#16a34a' : g.score <= 2.5 ? '#2563eb' : '#dc2626' }}>{g.score}</td>
                                                    <td colspan={2} style={{ fontSize: '.8rem', color: '#78716c' }}>{g.remarks}</td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                    {records.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#a8a29e', padding: 32 }}>No records found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const h1 = { fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 };
const sub = { color: '#78716c', margin: 0 };
const iconWrap = { width: 44, height: 44, borderRadius: 12, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fed7aa' };
const iconBtn = { background: 'rgba(0,0,0,.04)', border: '1px solid rgba(0,0,0,.08)', borderRadius: 7, padding: '4px 8px', display: 'inline-flex', alignItems: 'center', cursor: 'pointer', color: '#78716c', fontSize: '.75rem' };
