import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { getFaculties, createFaculty, updateFaculty, deleteFaculty, getEligibilityCriteria, facultyCreateReport } from '../api';
import { Users, Search, Printer, Building, Plus, Pencil, Trash2, X, Check, FileText, GraduationCap, AlertCircle } from 'lucide-react';

function Modal({ title, onClose, children }) {
    return (
        <div style={overlay}>
            <div style={modalCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1c1917' }}>{title}</h2>
                    <button onClick={onClose} style={iconBtnStyle}><X size={16} /></button>
                </div>
                {children}
            </div>
        </div>
    );
}

function ReportModal({ faculty, onClose }) {
    const [criteria, setCriteria] = useState([]);
    const [selectedCriteria, setSelectedCriteria] = useState('');
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const reportRef = useRef();

    const handlePrint = useReactToPrint({
        contentRef: reportRef,
        documentTitle: `Eligibility Report - ${faculty.first_name} ${faculty.last_name}`,
        pageStyle: `@page { size: A4; margin: 15mm 12mm; } body { font-family: Arial, sans-serif; }`,
    });

    useEffect(() => {
        getEligibilityCriteria()
            .then(r => setCriteria(r.data))
            .finally(() => setFetching(false));
    }, []);

    const handleGenerate = async () => {
        if (!selectedCriteria) return;
        setLoading(true);
        setError('');
        setReport(null);
        try {
            const res = await facultyCreateReport(faculty.id, selectedCriteria);
            setReport(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate report.');
        } finally {
            setLoading(false);
        }
    };

    const crit = criteria.find(c => c.id === parseInt(selectedCriteria));

    return (
        <div style={overlay}>
            <div style={{ ...modalCard, maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1c1917' }}>Create Eligibility Report</h2>
                        <p style={{ margin: '2px 0 0', fontSize: '.8rem', color: '#78716c' }}>
                            Faculty: {faculty.first_name} {faculty.last_name}
                        </p>
                    </div>
                    <button onClick={onClose} style={iconBtnStyle}><X size={16} /></button>
                </div>

                {/* Criteria selector */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                    <select
                        value={selectedCriteria}
                        onChange={e => { setSelectedCriteria(e.target.value); setReport(null); }}
                        style={{ ...iStyle, flex: 1 }}
                        disabled={fetching}
                    >
                        <option value="">{fetching ? 'Loading criteria…' : '— Select Eligibility Criteria —'}</option>
                        {criteria.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.criteria_id || `Criteria #${c.id}`} — GPA ≤ {c.minimum_gpa}
                                {c.required_skill ? `, Skill: ${c.required_skill}` : ''}
                                {c.max_allowed_violations !== undefined ? `, Max Violations: ${c.max_allowed_violations}` : ''}
                            </option>
                        ))}
                    </select>
                    <button
                        className="btn btn-primary"
                        onClick={handleGenerate}
                        disabled={!selectedCriteria || loading}
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        <FileText size={14} /> {loading ? 'Generating…' : 'Generate'}
                    </button>
                </div>

                {error && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', color: '#dc2626', fontSize: '.82rem', marginBottom: 14 }}>
                        <AlertCircle size={14} />{error}
                    </div>
                )}

                {/* Report output */}
                {report && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                            <button className="btn btn-outline" onClick={handlePrint}>
                                <Printer size={14} /> Print Report
                            </button>
                        </div>
                        <div ref={reportRef}>
                            {/* Print header */}
                            <div className="print-header">
                                <h1>CCS COMPREHENSIVE PROFILING SYSTEM</h1>
                                <p>Eligibility Report — Generated {new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <hr style={{ margin: '6px 0' }} />
                            </div>

                            {/* Summary card */}
                            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
                                <div style={{ fontWeight: 800, fontSize: '.95rem', color: '#ea580c', marginBottom: 8 }}>Report Summary</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8, fontSize: '.82rem', color: '#44403c' }}>
                                    <div><span style={{ color: '#78716c' }}>Faculty: </span><strong>{report.faculty}</strong></div>
                                    <div><span style={{ color: '#78716c' }}>Criteria: </span><strong>{report.criteria?.criteria_id || `#${report.criteria?.id}`}</strong></div>
                                    <div><span style={{ color: '#78716c' }}>Min GPA: </span><strong>{report.criteria?.minimum_gpa}</strong></div>
                                    {report.criteria?.required_skill && <div><span style={{ color: '#78716c' }}>Required Skill: </span><strong>{report.criteria.required_skill}</strong></div>}
                                    {report.criteria?.required_affiliation_type && <div><span style={{ color: '#78716c' }}>Affiliation: </span><strong>{report.criteria.required_affiliation_type}</strong></div>}
                                    <div><span style={{ color: '#78716c' }}>Max Violations: </span><strong>{report.criteria?.max_allowed_violations}</strong></div>
                                    <div><span style={{ color: '#78716c' }}>Eligible Students: </span><strong style={{ color: '#16a34a' }}>{report.eligible_students?.length ?? 0}</strong></div>
                                </div>
                            </div>

                            {/* Students table */}
                            {report.eligible_students?.length === 0 ? (
                                <div className="empty" style={{ padding: '30px 0' }}>
                                    <GraduationCap size={36} color="#fed7aa" />
                                    <p style={{ marginTop: 8, color: '#78716c' }}>No students meet this criteria.</p>
                                </div>
                            ) : (
                                <div className="card">
                                    <div className="card-header" style={{ background: 'linear-gradient(135deg,#ea580c,#f97316)', color: '#fff' }}>
                                        <h2 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <GraduationCap size={16} /> Eligible Students ({report.eligible_students?.length})
                                        </h2>
                                    </div>
                                    <div className="card-body" style={{ padding: 0 }}>
                                        <div className="table-wrap">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Student ID</th>
                                                        <th>Full Name</th>
                                                        <th>Status</th>
                                                        <th>Email</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {report.eligible_students.map((s, i) => (
                                                        <tr key={s.id}>
                                                            <td>{i + 1}</td>
                                                            <td><strong>{s.student_id || `STU-${s.id}`}</strong></td>
                                                            <td>{s.last_name}, {s.first_name}{s.middle_name ? ` ${s.middle_name[0]}.` : ''}</td>
                                                            <td>
                                                                <span style={{
                                                                    fontSize: '.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                                                                    background: s.status === 'active' ? '#dcfce7' : '#f1f5f9',
                                                                    color: s.status === 'active' ? '#16a34a' : '#64748b',
                                                                }}>
                                                                    {s.status || 'active'}
                                                                </span>
                                                            </td>
                                                            <td>{s.email || '—'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

const emptyFaculty = { faculty_id: '', first_name: '', middle_name: '', last_name: '', department: '', position: '', email: '', contact_number: '09' };

function FacultyDetailModal({ faculty: f, onClose }) {
    const deptLabel = { IT: 'Information Technology', CS: 'Computer Science' };
    const Row = ({ label, value }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, padding: '8px 0', borderBottom: '1px solid #f5f5f4' }}>
            <span style={{ color: '#a8a29e', fontWeight: 600, fontSize: '.78rem', paddingTop: 1 }}>{label}</span>
            <span style={{ color: '#1c1917', fontWeight: 500, fontSize: '.875rem', wordBreak: 'break-word' }}>{value || '—'}</span>
        </div>
    );
    return (
        <div style={overlay}>
            <div style={{ ...modalCard, maxWidth: 560, padding: 0, borderRadius: 20, maxHeight: '90vh', overflowY: 'auto' }}>
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', padding: '24px 28px', borderRadius: '20px 20px 0 0', position: 'relative' }}>
                    <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                        <X size={16} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,.25)', border: '3px solid rgba(255,255,255,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>{f.first_name?.[0]}{f.last_name?.[0]}</span>
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>
                                {f.first_name} {f.middle_name ? f.middle_name + ' ' : ''}{f.last_name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.85)', fontFamily: 'monospace', fontWeight: 600 }}>{f.faculty_id}</span>
                                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,.5)' }} />
                                <span style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.85)' }}>{deptLabel[f.department] || f.department}</span>
                                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,.5)' }} />
                                <span style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.85)' }}>{f.position}</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Body */}
                <div style={{ padding: '24px 28px' }}>
                    <div style={{ fontSize: '.68rem', fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ height: 2, width: 18, background: '#8b5cf6', borderRadius: 2 }} />
                        Faculty Information
                        <div style={{ height: 2, flex: 1, background: '#ddd6fe', borderRadius: 2 }} />
                    </div>
                    <Row label="Faculty ID"   value={f.faculty_id} />
                    <Row label="Full Name"    value={`${f.first_name || ''} ${f.middle_name || ''} ${f.last_name || ''}`.trim()} />
                    <Row label="Department"   value={deptLabel[f.department] || f.department} />
                    <Row label="Position"     value={f.position} />
                    <Row label="Email"        value={f.email} />
                    <Row label="Contact"      value={f.contact_number} />
                </div>
            </div>
        </div>
    );
}

export default function FacultyDataMap() {
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ department: '', search: '' });
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(emptyFaculty);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [reportFaculty, setReportFaculty] = useState(null);
    const [viewingFaculty, setViewingFaculty] = useState(null);
    const [deptPages, setDeptPages] = useState({});
    const PAGE_SIZE = 5;

    const printRef = useRef();

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'CCS Faculty Data Map',
        pageStyle: `@page { size: A4 landscape; margin: 15mm 12mm; } body { font-family: Arial, sans-serif; }`,
    });

    const loadData = () => {
        setLoading(true);
        getFaculties(filters).then(r => setFaculties(r.data)).finally(() => setLoading(false));
    };

    useEffect(loadData, [filters]);
    useEffect(() => setDeptPages({}), [filters]);

    const openAdd = () => { setForm(emptyFaculty); setModal('add'); };
    const openEdit = (f) => {
        setForm({
            faculty_id: f.faculty_id || '',
            first_name: f.first_name || '',
            middle_name: f.middle_name || '',
            last_name: f.last_name || '',
            department: f.department || '',
            position: f.position || '',
            email: f.email || '',
            contact_number: f.contact_number || '09'
        });
        setModal({ edit: f });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSaveError('');
        try {
            if (modal === 'add') {
                await createFaculty(form);
            } else {
                await updateFaculty(modal.edit.id, form);
            }
            setModal(null);
            loadData();
        } catch (err) {
            setSaveError(err.response?.data?.message || 'Failed to save. Try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this faculty member?')) return;
        await deleteFaculty(id);
        loadData();
    };

    const handleContactChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (!val.startsWith('09')) val = '09' + val.replace(/^0*9*/, '');
        if (val.length > 11) val = val.slice(0, 11);
        setForm(f => ({ ...f, contact_number: val }));
    };

    const grouped = faculties.reduce((acc, f) => {
        const key = f.department || 'Unknown';
        if (!acc[key]) acc[key] = [];
        acc[key].push(f);
        return acc;
    }, {});

    const getDeptPage = (dept) => deptPages[dept] || 1;
    const setDeptPage = (dept, p) => setDeptPages(prev => ({ ...prev, [dept]: p }));

    const deptOptions = [...new Set(faculties.map(f => f.department).filter(Boolean))].sort();

    return (
        <div>
            <div className="page-header no-print">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                            <div style={iconWrap}><Users size={22} color="#f97316" /></div>
                            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>Faculty Data Map</h1>
                        </div>
                        <p style={{ color: '#78716c', marginBottom: 10 }}>Complete faculty roster grouped by department — Manage and Print</p>
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            {[['', 'All Faculty'], ['IT', 'Information Technology (IT)'], ['CS', 'Computer Science (CS)']].map(([val, label]) => (
                                <button
                                    key={val}
                                    onClick={() => setFilters(f => ({ ...f, department: val }))}
                                    style={{
                                        padding: '8px 20px',
                                        borderRadius: 10,
                                        border: '1.5px solid',
                                        borderColor: filters.department === val ? '#f97316' : '#e7e5e4',
                                        background: filters.department === val ? '#f97316' : '#fff',
                                        color: filters.department === val ? '#fff' : '#78716c',
                                        fontWeight: filters.department === val ? 700 : 500,
                                        fontSize: '.875rem',
                                        cursor: 'pointer',
                                        transition: 'all .15s',
                                    }}
                                >{label}</button>
                            ))}
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Faculty</button>
                </div>
            </div>

            <div className="filter-bar no-print">
                <div style={{ position: 'relative' }}>
                    <Search size={15} color="#f97316" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text" placeholder="Search name or ID…"
                        value={filters.search}
                        onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                        style={{ paddingLeft: 36 }}
                    />
                </div>
                <div style={{ flex: 1 }} />
                <button className="btn btn-outline" onClick={handlePrint} style={{ whiteSpace: 'nowrap' }}>
                    <Printer size={15} /> Print Report
                </button>
            </div>

            <div ref={printRef}>
                <div className="print-header">
                    <h1>CCS COMPREHENSIVE PROFILING SYSTEM</h1>
                    <p>Faculty Data Map — Generated {new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p>Total Faculty: {faculties.length}</p>
                    <hr style={{ margin: '6px 0' }} />
                </div>

                {loading ? (
                    <div className="loading"><div className="loading-spinner" /><p>Loading faculty data…</p></div>
                ) : faculties.length === 0 ? (
                    <div className="empty"><Users size={40} color="#fed7aa" /><p style={{ marginTop: 10 }}>No faculty records found.</p></div>
                ) : (
                    ['CS', 'IT', 'Computer Science', 'Information Technology'].filter(k => grouped[k]).map((deptKey) => {
                        const members = grouped[deptKey];
                        const label = deptKey === 'CS' ? 'Computer Science' : deptKey === 'IT' ? 'Information Technology' : deptKey;
                        const page = getDeptPage(deptKey);
                        const totalPages = Math.ceil(members.length / PAGE_SIZE);
                        const paginated = members.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
                        return (
                        <div key={deptKey} className="card" style={{ marginBottom: 24 }}>
                            <div className="card-header" style={{ background: 'linear-gradient(135deg,#ea580c,#f97316)', color: '#fff' }}>
                                <h2 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Building size={17} strokeWidth={2} />{label}
                                </h2>
                                <span className="badge" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>{members.length} faculty</span>
                            </div>
                            <div className="card-body" style={{ padding: 0 }}>
                                <div className="table-wrap">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>#</th><th>Faculty ID</th><th>Full Name</th><th>Position</th>
                                                <th>Email</th><th>Contact No.</th>
                                                <th className="no-print">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginated.map((fac, idx) => (
                                                <tr key={fac.id}>
                                                    <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                                                    <td><strong style={{ color: '#8b5cf6', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }} onClick={() => setViewingFaculty(fac)}>{fac.faculty_id || `FAC-${fac.id}`}</strong></td>
                                                    <td>{fac.last_name}, {fac.first_name}{fac.middle_name ? ` ${fac.middle_name[0]}.` : ''}</td>
                                                    <td>{fac.position}</td>
                                                    <td>{fac.email || '—'}</td>
                                                    <td>{fac.contact_number || '—'}</td>
                                                    <td className="no-print">
                                                        <div style={{ display: 'flex', gap: 6 }}>
                                                            <button style={{ ...iconBtnStyle, color: '#2563eb' }} onClick={() => setReportFaculty(fac)} title="Create Report"><FileText size={13} /></button>
                                                            <button style={iconBtnStyle} onClick={() => openEdit(fac)} title="Edit"><Pencil size={13} /></button>
                                                            <button style={{ ...iconBtnStyle, color: '#dc2626' }} onClick={() => handleDelete(fac.id)} title="Delete"><Trash2 size={13} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {totalPages > 1 && (
                                <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 0' }}>
                                    <button onClick={() => setDeptPage(deptKey, Math.max(1, page - 1))} disabled={page === 1} style={{ ...pageBtn, opacity: page === 1 ? 0.4 : 1 }}>‹</button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                        <button key={p} onClick={() => setDeptPage(deptKey, p)}
                                            style={{ ...pageBtn, background: page === p ? '#f97316' : '#fff', color: page === p ? '#fff' : '#78716c', borderColor: page === p ? '#f97316' : '#e7e5e4', fontWeight: page === p ? 700 : 500 }}
                                        >{p}</button>
                                    ))}
                                    <button onClick={() => setDeptPage(deptKey, Math.min(totalPages, page + 1))} disabled={page === totalPages} style={{ ...pageBtn, opacity: page === totalPages ? 0.4 : 1 }}>›</button>
                                    <span style={{ fontSize: '.8rem', color: '#78716c', marginLeft: 8 }}>
                                        {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, members.length)} of {members.length}
                                    </span>
                                </div>
                            )}
                        </div>
                        );
                    })
                )}
            </div>

            {/* Add / Edit Faculty Modal */}
            {modal && (
                <Modal title={modal === 'add' ? 'Add New Faculty' : 'Edit Faculty'} onClose={() => setModal(null)}>
                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={lStyle}>Faculty ID</label>
                                <input style={iStyle} value={form.faculty_id} onChange={e => setForm({ ...form, faculty_id: e.target.value })} placeholder="e.g. FAC-2024-001" />
                            </div>
                            <div>
                                <label style={lStyle}>Department</label>
                                <select style={iStyle} value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                                    <option value="">— Select —</option>
                                    <option value="IT">Information Technology (IT)</option>
                                    <option value="CS">Computer Science (CS)</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={lStyle}>First Name</label>
                                <input style={iStyle} value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} required />
                            </div>
                            <div>
                                <label style={lStyle}>Middle Name</label>
                                <input style={iStyle} value={form.middle_name} onChange={e => setForm({ ...form, middle_name: e.target.value })} />
                            </div>
                            <div>
                                <label style={lStyle}>Last Name</label>
                                <input style={iStyle} value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} required />
                            </div>
                        </div>
                        <div>
                            <label style={lStyle}>Position</label>
                            <input style={iStyle} value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} required placeholder="e.g. Associate Professor" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={lStyle}>Email Address <span style={{ color: '#dc2626' }}>*</span></label>
                                <input style={iStyle} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                            </div>
                            <div>
                                <label style={lStyle}>Contact Number</label>
                                <input style={iStyle} value={form.contact_number} onChange={handleContactChange} placeholder="09XXXXXXXXX" maxLength={11} />
                            </div>
                        </div>
                        {saveError && <p style={{ color: '#dc2626', fontSize: '.82rem', margin: 0 }}>{saveError}</p>}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                            <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                <Check size={14} /> {saving ? 'Saving...' : modal === 'add' ? 'Add Faculty' : 'Save Faculty'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Create Report Modal */}
            {reportFaculty && (
                <ReportModal faculty={reportFaculty} onClose={() => setReportFaculty(null)} />
            )}
            {viewingFaculty && (
                <FacultyDetailModal faculty={viewingFaculty} onClose={() => setViewingFaculty(null)} />
            )}
        </div>
    );
}

const iconWrap = { width: 44, height: 44, borderRadius: 12, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fed7aa' };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 };
const modalCard = { background: '#fff', borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,.2)' };
const iconBtnStyle = { background: 'rgba(0,0,0,.04)', border: '1px solid rgba(0,0,0,.08)', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#78716c' };
const lStyle = { display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#44403c', marginBottom: 5, letterSpacing: .3 };
const iStyle = { width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid #e7e5e4', fontSize: '.875rem', fontFamily: "'Inter',sans-serif", color: '#1c1917', boxSizing: 'border-box' };
const pageBtn = { minWidth: 34, height: 34, borderRadius: 8, border: '1.5px solid #e7e5e4', background: '#fff', color: '#78716c', fontSize: '.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' };
