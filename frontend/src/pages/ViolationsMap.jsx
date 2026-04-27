import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getViolations, deleteViolation, updateViolationAction, createViolation, getStudents, resolveViolation } from '../api';
import { useAuth } from '../AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { SkeletonTable } from '../components/SkeletonLoader';
import { ShieldAlert, Search, Trash2, Pencil, X, Check, CheckCircle, Plus, History, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { ExportButtons, PrintHeader } from '../components/ExportControls';

function flattenViolation(v, i) {
    return {
        '#': i + 1,
        'Student ID': v.student?.student_id || '',
        'Student Name': `${v.student?.first_name || ''} ${v.student?.last_name || ''}`.trim(),
        'Violation Type': v.violation_type || '',
        'Severity': v.severity_level || '',
        'Date Committed': v.date_committed || '',
        'Action Taken': v.action_taken || '',
        'Description': v.description || '',
        'Status': v.is_resolved ? 'Resolved' : 'Active',
    };
}

function Badge({ value }) {
    return value ? <span className={`badge badge-${value.toLowerCase()}`}>{value.replace(/_/g, ' ')}</span> : null;
}

function RecordViolationModal({ onClose, onSaved }) {
    const [form, setForm] = useState({ student_id: '', violation_type: '', description: '', date_committed: '', severity_level: 'minor', action_taken: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [studentSearch, setStudentSearch] = useState('');
    const [studentDropdown, setStudentDropdown] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentResults, setStudentResults] = useState([]);
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const searchStudents = async (q) => {
        if (q.trim().length < 2) { setStudentResults([]); return; }
        try {
            const res = await getStudents({ search: q });
            setStudentResults((res.data?.data ?? res.data).slice(0, 8));
        } catch { setStudentResults([]); }
    };

    useEffect(() => {
        const t = setTimeout(() => searchStudents(studentSearch), 300);
        return () => clearTimeout(t);
    }, [studentSearch]);

    const selectStudent = (s) => {
        setSelectedStudent(s);
        setStudentSearch(`${s.last_name}, ${s.first_name} (${s.student_id})`);
        set('student_id', s.id);
        setStudentDropdown(false);
    };

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await createViolation(form);
            onSaved();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to record violation.');
        }
        setSaving(false);
    };

    return (
        <div style={overlay}>
            <div style={{ ...modalCard, maxWidth: 520 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1c1917' }}>Record Violation</h2>
                    <button onClick={onClose} style={iconBtn}><X size={15} /></button>
                </div>
                <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                    <div style={{ position: 'relative' }}>
                        <label style={lStyle}>Student <span style={{ color: '#dc2626' }}>*</span></label>
                        <div style={{ position: 'relative' }}>
                            <Search size={14} color="#a8a29e" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                            <input
                                style={{ ...iStyle, paddingLeft: 32 }}
                                placeholder="Search by name or student ID…"
                                value={studentSearch}
                                onChange={e => {
                                    setStudentSearch(e.target.value);
                                    setStudentDropdown(true);
                                    if (!e.target.value) { setSelectedStudent(null); set('student_id', ''); }
                                }}
                                onFocus={() => setStudentDropdown(true)}
                                autoComplete="off"
                                required={!form.student_id}
                            />
                            {/* Hidden input to enforce required */}
                            <input type="hidden" value={form.student_id} required />
                        </div>
                        {studentDropdown && studentResults.length > 0 && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #fde8d0', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,.12)', zIndex: 50, maxHeight: 220, overflowY: 'auto' }}>
                                {studentResults.map(s => (
                                    <div
                                        key={s.id}
                                        onMouseDown={() => selectStudent(s)}
                                        style={{ padding: '9px 14px', cursor: 'pointer', fontSize: '.85rem', borderBottom: '1px solid #fef3e2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#fff7ed'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                                    >
                                        <span style={{ fontWeight: 600, color: '#1c1917' }}>{s.last_name}, {s.first_name}</span>
                                        <span style={{ fontSize: '.75rem', color: '#a8a29e', fontFamily: 'monospace' }}>{s.student_id}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {studentDropdown && studentSearch.trim().length >= 2 && studentResults.length === 0 && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #fde8d0', borderRadius: 8, padding: '10px 14px', fontSize: '.82rem', color: '#a8a29e', zIndex: 50 }}>
                                No students found.
                            </div>
                        )}
                    </div>
                    {selectedStudent && (
                        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '8px 12px', fontSize: '.8rem', color: '#92400e', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Selected: <strong>{selectedStudent.first_name} {selectedStudent.last_name}</strong></span>
                            <span style={{ fontFamily: 'monospace' }}>{selectedStudent.student_id}</span>
                        </div>
                    )}
                    <div>
                        <label style={lStyle}>Violation Type <span style={{ color: '#dc2626' }}>*</span></label>
                        <input required style={iStyle} value={form.violation_type} onChange={e => set('violation_type', e.target.value)} placeholder="e.g. Cheating, Tardiness, Misconduct" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={lStyle}>Severity <span style={{ color: '#dc2626' }}>*</span></label>
                            <select required style={iStyle} value={form.severity_level} onChange={e => set('severity_level', e.target.value)}>
                                <option value="minor">Minor</option>
                                <option value="major">Major</option>
                                <option value="grave">Grave</option>
                            </select>
                        </div>
                        <div>
                            <label style={lStyle}>Date Committed</label>
                            <input type="date" style={iStyle} value={form.date_committed} onChange={e => set('date_committed', e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label style={lStyle}>Description</label>
                        <textarea style={{ ...iStyle, height: 72, resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description of the incident…" />
                    </div>
                    <div>
                        <label style={lStyle}>Action Taken</label>
                        <input style={iStyle} value={form.action_taken} onChange={e => set('action_taken', e.target.value)} placeholder="e.g. Verbal warning, Written reprimand…" />
                    </div>
                    {error && <div style={{ color: '#dc2626', fontSize: '.82rem' }}>{error}</div>}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving || !form.student_id}>{saving ? 'Saving…' : 'Record Violation'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
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

    const [tab, setTab] = useState('active');
    const [violations, setViolations] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [severity, setSeverity] = useState('');
    const [editing, setEditing] = useState(null);
    const [recording, setRecording] = useState(false);
    const [isPdfMode, setIsPdfMode] = useState(false);
    const [pdfData, setPdfData] = useState([]);

    const debouncedSearch = useDebounce(search, 250);
    const printRef = useRef(null);

    const load = useCallback((page = currentPage) => {
        setLoading(true);
        getViolations({ search: debouncedSearch, severity_level: severity, is_resolved: tab === 'history' ? true : false, page })
            .then(r => {
                setViolations(r.data.data);
                setCurrentPage(r.data.current_page);
                setLastPage(r.data.last_page);
                setTotal(r.data.total);
            })
            .finally(() => setLoading(false));
    }, [debouncedSearch, severity, tab]);

    useEffect(() => { setCurrentPage(1); load(1); }, [debouncedSearch, severity, tab]);

    const goToPage = (page) => { setCurrentPage(page); load(page); };

    const fetchFullData = async () => {
        const res = await getViolations({ search: debouncedSearch, severity_level: severity, is_resolved: tab === 'history' ? true : false, limit: 99999 });
        return res.data.data;
    };

    const handleBeforePdf = async () => {
        setIsPdfMode(true);
        const data = await fetchFullData();
        setPdfData(data);
    };

    const handleResolve = async (v) => {
        if (!window.confirm(`Mark "${v.violation_type}" as resolved?\n\nThis will move it to Violation History.`)) return;
        try {
            await resolveViolation(v.id);
            load();
        } catch { alert('Failed to resolve violation.'); }
    };

    const remove = async (id, violationType) => {
        if (!window.confirm(`Delete this violation record?\n\nViolation: ${violationType}\n\nThis action cannot be undone.`)) return;
        try { await deleteViolation(id); load(); }
        catch { alert('Failed to delete violation.'); }
    };

    const tabStyle = (t) => ({
        padding: '8px 20px', borderRadius: 8, fontWeight: 700, fontSize: '.85rem',
        cursor: 'pointer', border: 'none', fontFamily: "'Inter',sans-serif",
        background: tab === t ? (t === 'active' ? '#fef2f2' : '#f0fdf4') : 'transparent',
        color: tab === t ? (t === 'active' ? '#dc2626' : '#16a34a') : '#78716c',
        borderBottom: tab === t ? `2px solid ${t === 'active' ? '#dc2626' : '#16a34a'}` : '2px solid transparent',
    });

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={iconWrap}><ShieldAlert size={22} color="#f97316" /></div>
                        <h1 style={h1}>Violations</h1>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>

                        {isAdmin && (
                            <button className="btn btn-primary" onClick={() => setRecording(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Plus size={15} /> Record Violation
                            </button>
                        )}
                    </div>
                </div>
                <p style={sub}>Student violation records — {total} total</p>
            </div>

            <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid #fde8d0', paddingBottom: 0 }}>
                <button style={tabStyle('active')} onClick={() => setTab('active')}>
                    <AlertTriangle size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                    Active Violations
                </button>
                <button style={tabStyle('history')} onClick={() => setTab('history')}>
                    <History size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                    Violation History
                </button>
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
                <div style={{ flex: 1 }} />
                <ExportButtons 
                    printRef={printRef} 
                    data={fetchFullData} 
                    flattenFn={flattenViolation} 
                    filenamePrefix={`Violations_${tab === 'history' ? 'History' : 'Active'}`} 
                    onBeforePdf={handleBeforePdf}
                    onAfterPdf={() => setIsPdfMode(false)}
                />
            </div>

            <div ref={printRef} style={{ background: '#fff' }}>
                <PrintHeader 
                    title="Violations Map" 
                    subtitle={tab === 'history' ? 'Violation History' : 'Active Violations'} 
                    count={total} 
                    filters={{ severity, search }} 
                />

                {loading ? <SkeletonTable rows={6} cols={9} /> : (
                    <>
                        {/* Screen View */}
                        {!isPdfMode && (
                            <>
                                <div className="card pdf-hide">
                                    <div className="card-body" style={{ padding: 0 }}>
                                    <div className="subjects-table-wrap" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                                        <table style={{ minWidth: 700 }}>
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Student ID</th>
                                                    <th>Student Name</th>
                                                    <th>Violation Type</th>
                                                    <th>Severity</th>
                                                    <th>Date Committed</th>
                                                    <th>Action Taken</th>
                                                    <th>Description</th>
                                                    {tab === 'history' && <th>Resolved At</th>}
                                                    <th className="no-print">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {violations.map((v, i) => (
                                                    <tr key={v.id} style={{ opacity: tab === 'history' ? 0.85 : 1 }}>
                                                        <td>{(currentPage - 1) * 10 + i + 1}</td>
                                                        <td><strong>{v.student?.student_id || '—'}</strong></td>
                                                        <td>{v.student ? `${v.student.first_name} ${v.student.last_name}` : '—'}</td>
                                                        <td>{v.violation_type}</td>
                                                        <td><Badge value={v.severity_level} /></td>
                                                        <td>{v.date_committed ? new Date(v.date_committed).toLocaleDateString('en-PH') : '—'}</td>
                                                        <td style={{ maxWidth: 160, fontSize: '.8rem' }}>{v.action_taken || <span style={{ color: '#a8a29e' }}>Pending</span>}</td>
                                                        <td style={{ maxWidth: 180, fontSize: '.8rem', color: '#78716c' }}>{v.description || '—'}</td>
                                                        {tab === 'history' && (
                                                            <td style={{ fontSize: '.78rem', color: '#16a34a', fontWeight: 600 }}>
                                                                {v.resolved_at ? new Date(v.resolved_at).toLocaleDateString('en-PH') : '—'}
                                                            </td>
                                                        )}
                                                        <td className="no-print">
                                                            <div style={{ display: 'flex', gap: 6 }}>
                                                                {isAdmin && !v.is_resolved && (
                                                                    <>
                                                                        <button style={{ ...iconBtn, background: '#f8fafc', color: '#0ea5e9' }} onClick={() => setEditing(v)} title="Update Action Taken"><Pencil size={14} /></button>
                                                                        <button style={{ ...iconBtn, background: '#f0fdf4', color: '#16a34a' }} onClick={() => handleResolve(v)} title="Mark as Resolved"><CheckCircle size={14} /></button>
                                                                    </>
                                                                )}
                                                                {isAdmin && (
                                                                    <button style={{ ...iconBtn, color: '#dc2626', borderColor: '#fecaca', background: '#fef2f2' }} title="Delete permanently" onClick={() => remove(v.id, v.violation_type)}>
                                                                        <Trash2 size={13} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {violations.length === 0 && (
                                                    <tr><td colSpan={tab === 'history' ? 10 : 9} style={{ textAlign: 'center', color: '#a8a29e', padding: 32 }}>
                                                        {tab === 'active' ? 'No active violations.' : 'No violation history yet.'}
                                                    </td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile: card list */}
                                    <div className="subjects-card-list">
                                        {violations.length === 0 ? (
                                            <p style={{ padding: '24px 14px', textAlign: 'center', color: '#a8a29e', fontSize: '.875rem' }}>
                                                {tab === 'active' ? 'No active violations.' : 'No violation history yet.'}
                                            </p>
                                        ) : violations.map((v, i) => (
                                            <div key={v.id} style={{ padding: '12px 14px', borderTop: i > 0 ? '1px solid var(--border)' : 'none', opacity: tab === 'history' ? 0.85 : 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                                                            <strong style={{ color: '#f97316', fontSize: '.82rem', fontFamily: 'monospace' }}>{v.student?.student_id || '—'}</strong>
                                                            <Badge value={v.severity_level} />
                                                            {tab === 'history' && v.resolved_at && (
                                                                <span style={{ fontSize: '.7rem', color: '#16a34a', fontWeight: 700 }}>✓ Resolved</span>
                                                            )}
                                                        </div>
                                                        <div style={{ fontWeight: 700, fontSize: '.875rem', color: '#1c1917', marginBottom: 2 }}>
                                                            {v.student ? `${v.student.first_name} ${v.student.last_name}` : '—'}
                                                        </div>
                                                        <div style={{ fontSize: '.82rem', color: '#44403c', marginBottom: 2 }}>{v.violation_type}</div>
                                                        {v.date_committed && <div style={{ fontSize: '.75rem', color: '#78716c' }}>{new Date(v.date_committed).toLocaleDateString('en-PH')}</div>}
                                                        {v.action_taken && <div style={{ fontSize: '.75rem', color: '#78716c', marginTop: 2 }}>Action: {v.action_taken}</div>}
                                                        {v.description && <div style={{ fontSize: '.75rem', color: '#a8a29e', marginTop: 1 }}>{v.description}</div>}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                                                        {tab === 'active' && (
                                                            <>
                                                                <button style={iconBtn} title="Update action" onClick={() => setEditing(v)}><Pencil size={13} /></button>
                                                                {isAdmin && (
                                                                    <button style={{ ...iconBtn, color: '#16a34a', borderColor: '#bbf7d0', background: '#f0fdf4' }} title="Resolve" onClick={() => handleResolve(v)}>
                                                                        <CheckCircle size={13} />
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                        {isAdmin && (
                                                            <button style={{ ...iconBtn, color: '#dc2626', borderColor: '#fecaca', background: '#fef2f2' }} title="Delete" onClick={() => remove(v.id, v.violation_type)}>
                                                                <Trash2 size={13} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {lastPage > 1 && (
                                    <div className="pdf-hide" style={paginationWrap}>
                                        <button style={pageBtn} disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>
                                            <ChevronLeft size={14} />
                                        </button>
                                        <span style={{ fontSize: '.82rem', color: '#78716c' }}>
                                            Page {currentPage} of {lastPage} &nbsp;·&nbsp; {total} records
                                        </span>
                                        <button style={pageBtn} disabled={currentPage === lastPage} onClick={() => goToPage(currentPage + 1)}>
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                )}
                                </div>
                            </>
                        )}

                        {/* PDF View */}
                        {isPdfMode && (() => {
                            const PRINT_PAGE = 15;
                            const pageChunks = [];
                            for (let i = 0; i < pdfData.length; i += PRINT_PAGE) {
                                pageChunks.push(pdfData.slice(i, i + PRINT_PAGE));
                            }
                            if (pageChunks.length === 0) pageChunks.push([]); // Ensure at least 1 page

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
                                                <span>{tab === 'history' ? 'Violation History' : 'Active Violations'}</span>
                                                <span style={{ fontSize: '.82rem', opacity: .85 }}>
                                                    Page {pageIdx + 1} of {pageChunks.length} &nbsp;·&nbsp; {pdfData.length} records
                                                </span>
                                            </div>
                                            <table className="report-table" style={{ marginTop: 0 }}>
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Student ID</th>
                                                        <th>Student Name</th>
                                                        <th>Violation Type</th>
                                                        <th>Severity</th>
                                                        <th>Date Committed</th>
                                                        <th>Action Taken</th>
                                                        {tab === 'history' && <th>Resolved At</th>}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {chunk.map((v, i) => (
                                                        <tr key={v.id}>
                                                            <td>{pageIdx * PRINT_PAGE + i + 1}</td>
                                                            <td><strong>{v.student?.student_id || '—'}</strong></td>
                                                            <td>{v.student ? `${v.student.first_name} ${v.student.last_name}` : '—'}</td>
                                                            <td>{v.violation_type}</td>
                                                            <td>{v.severity_level ? v.severity_level.toUpperCase() : '—'}</td>
                                                            <td>{v.date_committed ? new Date(v.date_committed).toLocaleDateString('en-PH') : '—'}</td>
                                                            <td style={{ maxWidth: 160, fontSize: '.8rem' }}>{v.action_taken || <span style={{ color: '#a8a29e' }}>Pending</span>}</td>
                                                            {tab === 'history' && (
                                                                <td style={{ fontSize: '.78rem', color: '#16a34a', fontWeight: 600 }}>
                                                                    {v.resolved_at ? new Date(v.resolved_at).toLocaleDateString('en-PH') : '—'}
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                    {chunk.length === 0 && (
                                                        <tr><td colSpan={tab === 'history' ? 8 : 7} style={{ textAlign: 'center', color: '#a8a29e', padding: 32 }}>
                                                            No records found.
                                                        </td></tr>
                                                    )}
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
            {editing && <ActionModal violation={editing} onClose={() => setEditing(null)} onSaved={load} />}
            {recording && <RecordViolationModal onClose={() => setRecording(false)} onSaved={load} />}
        </div>
    );
}

const h1 = { fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 };
const sub = { color: '#78716c', margin: 0 };
const iconWrap = { width: 44, height: 44, borderRadius: 12, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fed7aa' };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 };
const modalCard = { background: '#fff', borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,.2)' };
const iconBtn = { background: 'rgba(0,0,0,.04)', border: '1px solid rgba(0,0,0,.08)', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#78716c' };
const paginationWrap = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '12px 14px', borderTop: '1px solid var(--border)' };
const pageBtn = { background: 'rgba(0,0,0,.04)', border: '1px solid rgba(0,0,0,.08)', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const lStyle = { display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#44403c', marginBottom: 5, letterSpacing: .3 };
const iStyle = { width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid #e7e5e4', fontSize: '.875rem', fontFamily: "'Inter',sans-serif", color: '#1c1917', boxSizing: 'border-box' };
