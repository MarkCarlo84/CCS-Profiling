import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../api';
import { GraduationCap, Search, Printer, Building, Plus, Pencil, Trash2, X, Check, Users, BookOpen } from 'lucide-react';

function Badge({ value }) {
    return <span className={`badge badge-${value?.toLowerCase().replace(/\s/g, '_')}`}>{value?.replace(/_/g, ' ')}</span>;
}

function SkillTag({ skill }) {
    return <span className={`badge badge-${skill.skill_level}`} style={{ margin: '2px' }}>{skill.skill_name}</span>;
}

function Modal({ title, onClose, width = 520, children }) {
    return (
        <div style={overlay}>
            <div style={{ ...modalCard, maxWidth: width }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1c1917' }}>{title}</h2>
                    <button onClick={onClose} style={iconBtnStyle}><X size={16} /></button>
                </div>
                {children}
            </div>
        </div>
    );
}

function StudentDetailModal({ student: s, onClose }) {
    const fmt = (d) => d ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

    const Section = ({ label, color = '#f97316', children }) => (
        <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '.68rem', fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ height: 2, width: 18, background: color, borderRadius: 2 }} />
                {label}
                <div style={{ height: 2, flex: 1, background: `${color}22`, borderRadius: 2 }} />
            </div>
            {children}
        </div>
    );

    const Row = ({ label, value }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, padding: '8px 0', borderBottom: '1px solid #f5f5f4' }}>
            <span style={{ color: '#a8a29e', fontWeight: 600, fontSize: '.78rem', paddingTop: 1 }}>{label}</span>
            <span style={{ color: '#1c1917', fontWeight: 500, fontSize: '.875rem', wordBreak: 'break-word' }}>{value || '—'}</span>
        </div>
    );

    const statusColor = { active: '#16a34a', inactive: '#78716c', graduated: '#2563eb', dropped: '#dc2626' };
    const deptLabel = { IT: 'Information Technology', CS: 'Computer Science' };

    return (
        <div style={overlay}>
            <div style={{ ...modalCard, maxWidth: 700, maxHeight: '92vh', overflowY: 'auto', padding: 0, borderRadius: 20 }}>

                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', padding: '24px 28px', borderRadius: '20px 20px 0 0', position: 'relative' }}>
                    <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                        <X size={16} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,.25)', border: '3px solid rgba(255,255,255,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>{s.first_name?.[0]}{s.last_name?.[0]}</span>
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#fff', letterSpacing: '-.01em' }}>
                                {s.first_name} {s.middle_name ? s.middle_name + ' ' : ''}{s.last_name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.85)', fontFamily: 'monospace', fontWeight: 600 }}>{s.student_id}</span>
                                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,.5)' }} />
                                <span style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.85)' }}>{deptLabel[s.department] || s.department}</span>
                                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,.5)' }} />
                                <span style={{ fontSize: '.75rem', fontWeight: 700, padding: '2px 10px', borderRadius: 999, background: 'rgba(255,255,255,.2)', color: '#fff', textTransform: 'capitalize' }}>
                                    {s.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick stats */}
                    <div className="student-quick-stats">
                        {[
                            { label: 'Violations', value: s.violations?.filter(v => !v.is_resolved).length ?? 0, warn: true },
                            { label: 'Skills', value: s.skills?.length ?? 0 },
                            { label: 'Affiliations', value: s.affiliations?.length ?? 0 },
                            { label: 'Activities', value: s.non_academic_histories?.length ?? 0 },
                        ].map(({ label, value, warn }) => (
                            <div key={label} style={{ background: 'rgba(255,255,255,.15)', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: warn && value > 0 ? '#fde68a' : '#fff' }}>{value}</div>
                                <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.75)', fontWeight: 600, marginTop: 2 }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: '24px 28px' }}>

                    <Section label="Personal Information">
                        <div className="modal-grid-2col">
                            <Row label="Student ID"    value={s.student_id} />
                            <Row label="Date of Birth" value={fmt(s.date_of_birth)} />
                            <Row label="Full Name"     value={`${s.first_name || ''} ${s.middle_name || ''} ${s.last_name || ''}`.trim()} />
                            <Row label="Age"           value={s.age} />
                            <Row label="Gender"        value={s.gender} />
                            <Row label="Contact"       value={s.contact_number} />
                            <Row label="Email"         value={s.email} />
                            <Row label="Guardian"      value={s.guardian_name} />
                            <Row label="Department"    value={deptLabel[s.department] || s.department} />
                            <Row label="Enrolled"      value={fmt(s.enrollment_date)} />
                            <div style={{ gridColumn: '1 / -1' }}>
                                <Row label="Address" value={s.address} />
                            </div>
                        </div>
                    </Section>

                    {/* Academic Records */}
                    {s.academic_records?.length > 0 && (
                        <Section label="Academic Records" color="#2563eb">
                            {s.academic_records.map(rec => (
                                <div key={rec.id} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', marginBottom: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <span style={{ fontWeight: 700, fontSize: '.875rem', color: '#1e40af' }}>{rec.school_year} — {rec.semester}</span>
                                        <span style={{ padding: '2px 10px', borderRadius: 999, background: '#dcfce7', color: '#16a34a', fontSize: '.75rem', fontWeight: 700 }}>GPA: {rec.gpa ?? '—'}</span>
                                    </div>
                                    {rec.grades?.map(g => (
                                        <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.78rem', color: '#64748b', padding: '3px 0', borderTop: '1px solid #dbeafe' }}>
                                            <span>{g.subject_name}</span>
                                            <span style={{ fontWeight: 600, color: '#1e40af' }}>{g.score} — {g.remarks}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </Section>
                    )}

                    {/* Violations */}
                    {s.violations?.length > 0 && (
                        <Section label="Violations" color="#dc2626">
                            {s.violations.map(v => (
                                <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 8, background: v.is_resolved ? '#f0fdf4' : '#fef2f2', border: `1px solid ${v.is_resolved ? '#bbf7d0' : '#fecaca'}`, marginBottom: 6 }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '.875rem', color: '#1c1917' }}>{v.violation_type}</div>
                                        {v.description && <div style={{ fontSize: '.75rem', color: '#78716c', marginTop: 2 }}>{v.description}</div>}
                                        {v.action_taken && <div style={{ fontSize: '.75rem', color: '#78716c', marginTop: 1 }}>Action: {v.action_taken}</div>}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0, marginLeft: 12 }}>
                                        <Badge value={v.severity_level} />
                                        <span style={{ fontSize: '.72rem', color: '#a8a29e' }}>{fmt(v.date_committed)}</span>
                                        {v.is_resolved && <span style={{ fontSize: '.68rem', fontWeight: 700, color: '#16a34a' }}>✓ Resolved</span>}
                                    </div>
                                </div>
                            ))}
                        </Section>
                    )}

                    {/* Skills */}
                    {s.skills?.length > 0 && (
                        <Section label="Skills" color="#7c3aed">
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {s.skills.map(sk => (
                                    <div key={sk.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, background: '#f5f3ff', border: '1px solid #ddd6fe', fontSize: '.8rem', fontWeight: 600, color: '#7c3aed' }}>
                                        {sk.skill_name}
                                        <span style={{ fontSize: '.7rem', color: '#a78bfa' }}>· {sk.skill_level}</span>
                                        {sk.certification && <span style={{ fontSize: '.68rem', background: '#7c3aed', color: '#fff', borderRadius: 4, padding: '1px 5px' }}>cert</span>}
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* Affiliations */}
                    {s.affiliations?.length > 0 && (
                        <Section label="Affiliations" color="#0891b2">
                            {s.affiliations.map(a => (
                                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', borderRadius: 8, background: '#f0f9ff', border: '1px solid #bae6fd', marginBottom: 6 }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '.875rem', color: '#0c4a6e' }}>{a.name}</div>
                                        <div style={{ fontSize: '.75rem', color: '#0369a1', marginTop: 2 }}>{a.role} · {a.type}</div>
                                    </div>
                                    {a.date_joined && <span style={{ fontSize: '.75rem', color: '#7dd3fc', alignSelf: 'center' }}>{fmt(a.date_joined)}</span>}
                                </div>
                            ))}
                        </Section>
                    )}

                    {/* Non-Academic */}
                    {s.non_academic_histories?.length > 0 && (
                        <Section label="Non-Academic Activities" color="#d97706">
                            {s.non_academic_histories.map(h => (
                                <div key={h.id} style={{ padding: '9px 14px', borderRadius: 8, background: '#fffbeb', border: '1px solid #fde68a', marginBottom: 6 }}>
                                    <div style={{ fontWeight: 700, fontSize: '.875rem', color: '#92400e' }}>{h.activity_title}</div>
                                    <div style={{ fontSize: '.75rem', color: '#b45309', marginTop: 2 }}>{h.category} · {h.role} · {h.organizer}</div>
                                    {h.game_result && <div style={{ fontSize: '.75rem', color: '#d97706', fontWeight: 600, marginTop: 2 }}>Result: {h.game_result}</div>}
                                </div>
                            ))}
                        </Section>
                    )}

                </div>
            </div>
        </div>
    );
}

const emptyStudent = {
    student_id: '', department: '', first_name: '', middle_name: '', last_name: '',
    age: '', gender: 'Male', guardian_name: '', date_of_birth: '',
    address: '', contact_number: '09', email: '', enrollment_date: '', status: 'active'
};

export default function StudentDataMap() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: 'active', search: '', gender: '', department: '' });
    const [modal, setModal] = useState(null);
    const [viewing, setViewing] = useState(null);
    const [form, setForm] = useState(emptyStudent);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [deptPages, setDeptPages] = useState({});
    const PAGE_SIZE = 5;

    const printRef = useRef();

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'CCS Student Data Map',
        pageStyle: `@page { size: A4 landscape; margin: 10mm 8mm; } body { font-family: Arial, sans-serif; font-size: 10px; } table { font-size: 9px; }`,
    });

    const loadData = () => {
        setLoading(true);
        getStudents(filters).then(r => setStudents(r.data)).finally(() => setLoading(false));
    };

    useEffect(loadData, [filters]);
    useEffect(() => setDeptPages({}), [filters]);

    const openAdd = () => { setForm(emptyStudent); setModal('add'); };
    const openEdit = (s) => {
        setForm({
            student_id: s.student_id || '',
            department: s.department || '',
            first_name: s.first_name || '',
            middle_name: s.middle_name || '',
            last_name: s.last_name || '',
            age: s.age || '',
            gender: s.gender || 'Male',
            guardian_name: s.guardian_name || '',
            date_of_birth: s.date_of_birth || '',
            address: s.address || '',
            contact_number: s.contact_number || '09',
            email: s.email || '',
            enrollment_date: s.enrollment_date || '',
            status: s.status || 'active'
        });
        setModal({ edit: s });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSaveError('');
        try {
            if (modal === 'add') {
                await createStudent(form);
            } else {
                await updateStudent(modal.edit.id, form);
            }
            setModal(null);
            loadData();
        } catch (err) {
            setSaveError(err.response?.data?.message || 'Failed to save. Try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleContactChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (!val.startsWith('09')) val = '09' + val.replace(/^0*9*/, '');
        if (val.length > 11) val = val.slice(0, 11);
        setForm(f => ({ ...f, contact_number: val }));
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this student record?')) return;
        await deleteStudent(id);
        loadData();
    };

    const visibleStudents = filters.department
        ? students.filter(s => s.department === filters.department)
        : students;

    // Group by department label
    const DEPT_LABELS = { IT: 'Information Technology', CS: 'Computer Science' };
    const grouped = visibleStudents.reduce((acc, s) => {
        const key = s.department || 'Unknown';
        if (!acc[key]) acc[key] = [];
        acc[key].push(s);
        return acc;
    }, {});

    const getDeptPage = (dept) => deptPages[dept] || 1;
    const setDeptPage = (dept, p) => setDeptPages(prev => ({ ...prev, [dept]: p }));

    const renderDeptTable = (dept, deptStudents) => {
        const label = DEPT_LABELS[dept] || dept;        const page = getDeptPage(dept);
        const totalPages = Math.ceil(deptStudents.length / PAGE_SIZE);
        const paginated = deptStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

        return (
            <div key={dept} className="card" style={{ marginBottom: 28 }}>
                <div className="card-header" style={{ background: 'linear-gradient(135deg,#f97316,#fb923c)', color: '#fff' }}>
                    <h2 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Building size={17} strokeWidth={2} />{label}
                    </h2>
                    <span className="badge" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>{deptStudents.length} students</span>
                </div>
                <div className="card-body" style={{ padding: 0 }}>

                    {/* Tablet+: scrollable table */}
                    <div className="subjects-table-wrap" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <table style={{ minWidth: 700 }}>
                            <thead>
                                <tr>
                                    <th>#</th><th>Student ID</th><th>Full Name</th>
                                    <th>Age</th><th>Gender</th><th>Guardian</th>
                                    <th>Affiliations</th><th>Skills</th>
                                    <th>Violations</th><th className="no-print">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((stu, idx) => (
                                    <tr key={stu.id}>
                                        <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                                        <td><strong style={{ color: '#f97316', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }} onClick={() => setViewing(stu)}>{stu.student_id || `STU-${stu.id}`}</strong></td>
                                        <td><div style={{ fontWeight: 600 }}>{stu.last_name}, {stu.first_name}{stu.middle_name ? ` ${stu.middle_name[0]}.` : ''}</div></td>
                                        <td>{stu.age || '—'}</td>
                                        <td>{stu.gender || '—'}</td>
                                        <td style={{ fontSize: '.75rem' }}>{stu.guardian_name || '—'}</td>
                                        <td style={{ minWidth: 140 }}>
                                            {stu.affiliations?.length > 0
                                                ? stu.affiliations.map(a => (
                                                    <div key={a.id} style={{ fontSize: '.75rem', marginBottom: 2 }}>
                                                        <strong>{a.role || 'Member'}</strong> — {a.name}
                                                    </div>
                                                ))
                                                : '—'}
                                        </td>
                                        <td style={{ minWidth: 110 }}>
                                            {stu.skills?.length > 0
                                                ? <div className="tags">{stu.skills.map(sk => <SkillTag key={sk.id} skill={sk} />)}</div>
                                                : '—'}
                                        </td>
                                        <td style={{ minWidth: 110 }}>
                                            {stu.violations?.length > 0
                                                ? stu.violations.map(v => (
                                                    <div key={v.id} style={{ fontSize: '.75rem', marginBottom: 2 }}>
                                                        <Badge value={v.severity_level} /> {v.violation_type}
                                                    </div>
                                                ))
                                                : <span style={{ color: '#16a34a', fontSize: '.75rem' }}>No violations</span>}
                                        </td>
                                        <td className="no-print">
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button style={iconBtnStyle} onClick={() => openEdit(stu)} title="Edit Student"><Pencil size={13} /></button>
                                                <button style={{ ...iconBtnStyle, color: '#dc2626' }} onClick={() => handleDelete(stu.id)} title="Delete Student"><Trash2 size={13} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile: card list */}
                    <div className="subjects-card-list">
                        {paginated.map((stu, idx) => (
                            <div key={stu.id} style={{
                                padding: '12px 14px',
                                borderTop: idx > 0 ? '1px solid var(--border)' : 'none',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        {/* ID + name row */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                                            <strong
                                                style={{ color: '#f97316', fontSize: '.82rem', fontFamily: 'monospace', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
                                                onClick={() => setViewing(stu)}
                                            >
                                                {stu.student_id || `STU-${stu.id}`}
                                            </strong>
                                            {stu.gender && <span style={{ fontSize: '.72rem', color: '#78716c' }}>{stu.gender}</span>}
                                            {stu.age && <span style={{ fontSize: '.72rem', color: '#78716c' }}>· {stu.age} yrs</span>}
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: '.875rem', color: '#1c1917', marginBottom: 2 }}>
                                            {stu.last_name}, {stu.first_name}{stu.middle_name ? ` ${stu.middle_name[0]}.` : ''}
                                        </div>
                                        {stu.guardian_name && (
                                            <div style={{ fontSize: '.75rem', color: '#78716c', marginBottom: 4 }}>
                                                Guardian: {stu.guardian_name}
                                            </div>
                                        )}
                                        {/* Tags row */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                                            {stu.affiliations?.length > 0 && (
                                                <span style={{ fontSize: '.7rem', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 5, padding: '1px 7px', fontWeight: 600 }}>
                                                    {stu.affiliations.length} affiliation{stu.affiliations.length > 1 ? 's' : ''}
                                                </span>
                                            )}
                                            {stu.skills?.length > 0 && (
                                                <span style={{ fontSize: '.7rem', background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', borderRadius: 5, padding: '1px 7px', fontWeight: 600 }}>
                                                    {stu.skills.length} skill{stu.skills.length > 1 ? 's' : ''}
                                                </span>
                                            )}
                                            {stu.violations?.length > 0 ? (
                                                <span style={{ fontSize: '.7rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 5, padding: '1px 7px', fontWeight: 600 }}>
                                                    {stu.violations.length} violation{stu.violations.length > 1 ? 's' : ''}
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: '.7rem', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 5, padding: '1px 7px', fontWeight: 600 }}>
                                                    No violations
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                        <button style={iconBtnStyle} onClick={() => openEdit(stu)} title="Edit"><Pencil size={13} /></button>
                                        <button style={{ ...iconBtnStyle, color: '#dc2626' }} onClick={() => handleDelete(stu.id)} title="Delete"><Trash2 size={13} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
                {totalPages > 1 && (
                    <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 0' }}>
                        <button onClick={() => setDeptPage(dept, Math.max(1, page - 1))} disabled={page === 1} style={{ ...pageBtn, opacity: page === 1 ? 0.4 : 1 }}>‹</button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button key={p} onClick={() => setDeptPage(dept, p)}
                                style={{ ...pageBtn, background: page === p ? '#f97316' : '#fff', color: page === p ? '#fff' : '#78716c', borderColor: page === p ? '#f97316' : '#e7e5e4', fontWeight: page === p ? 700 : 500 }}
                            >{p}</button>
                        ))}
                        <button onClick={() => setDeptPage(dept, Math.min(totalPages, page + 1))} disabled={page === totalPages} style={{ ...pageBtn, opacity: page === totalPages ? 0.4 : 1 }}>›</button>
                        <span style={{ fontSize: '.8rem', color: '#78716c', marginLeft: 8 }}>
                            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, deptStudents.length)} of {deptStudents.length}
                        </span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div>
            <div className="page-header no-print">
                <div className="table-page-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                            <div style={iconWrap}><GraduationCap size={22} color="#f97316" /></div>
                            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>Student Data Map</h1>
                        </div>
                        <p style={{ color: '#78716c', marginBottom: 10 }}>Manage and Print comprehensive student profiles including academic records and history</p>
                        <div className="dept-filter-row" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
                            {[['', 'All Students', Users, 'All Students'], ['IT', 'Information Technology', BookOpen, 'BSIT'], ['CS', 'Computer Science', BookOpen, 'BSCS']].map(([val, label, Icon, short]) => {
                                const isActive = filters.department === val;
                                return (
                                    <button
                                        key={val}
                                        onClick={() => setFilters(f => ({ ...f, department: val }))}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 8,
                                            padding: '10px 20px', borderRadius: 8, border: '1px solid',
                                            borderColor: isActive ? '#3b82f6' : '#cbd5e1',
                                            background: isActive ? '#eff6ff' : '#fff',
                                            color: isActive ? '#2563eb' : '#64748b',
                                            fontWeight: 600, fontSize: '.9rem', cursor: 'pointer', transition: 'all .15s',
                                        }}
                                    >
                                        <Icon size={16} color={isActive ? '#3b82f6' : '#64748b'} />
                                        <span>
                                            <strong style={{ color: isActive ? '#1d4ed8' : '#334155' }}>{short}</strong>
                                            {val ? ` ${label}` : ''}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Student</button>
                </div>
            </div>

            <div className="filter-bar no-print">
                <div style={{ position: 'relative' }}>
                    <Search size={15} color="#f97316" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text" placeholder="Search name or student ID…"
                        value={filters.search}
                        onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                        style={{ paddingLeft: 36 }}
                    />
                </div>
                <select value={filters.gender} onChange={e => setFilters(f => ({ ...f, gender: e.target.value }))}>
                    <option value="">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
                <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="graduated">Graduated</option>
                    <option value="dropped">Dropped</option>
                </select>

                <div style={{ flex: 1 }} />
                <button className="btn btn-outline" onClick={handlePrint}>
                    <Printer size={15} /> Print Map
                </button>
            </div>

            <div ref={printRef}>
                <div className="print-header">
                    <h1>CCS COMPREHENSIVE PROFILING SYSTEM</h1>
                    <p>Student Data Map — Generated {new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p>Total Students: {visibleStudents.length}{filters.department ? ` — ${filters.department === 'IT' ? 'Information Technology' : 'Computer Science'}` : ''}</p>
                    <hr style={{ margin: '6px 0' }} />
                </div>

                {loading ? (
                    <div className="loading"><div className="loading-spinner" /><p>Loading student data…</p></div>
                ) : students.length === 0 ? (
                    <div className="empty"><GraduationCap size={40} color="#fed7aa" /><p style={{ marginTop: 10 }}>No student records found.</p></div>
                ) : (
                    ['CS', 'IT', 'Unknown'].map(dept => grouped[dept] ? renderDeptTable(dept, grouped[dept]) : null)                )}
            </div>

            {viewing && <StudentDetailModal student={viewing} onClose={() => setViewing(null)} />}
            {modal && (                <Modal title={modal === 'add' ? 'Add New Student' : 'Edit Student'} onClose={() => setModal(null)} width={640}>
                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className="modal-grid-2col">
                            <div>
                                <label style={lStyle}>Student ID</label>
                                <input style={iStyle} value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })} placeholder="e.g. 2202184" />
                            </div>
                            <div>
                                <label style={lStyle}>Department</label>
                                <select style={iStyle} value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                                    <option value="">— Select —</option>
                                    <option value="IT">Information Technology (IT)</option>
                                    <option value="CS">Computer Science (CS)</option>
                                </select>
                            </div>
                            <div>
                                <label style={lStyle}>Status</label>
                                <select style={iStyle} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="graduated">Graduated</option>
                                    <option value="dropped">Dropped</option>
                                </select>
                            </div>
                            <div>
                                <label style={lStyle}>Enrollment Date</label>
                                <input style={iStyle} type="date" value={form.enrollment_date} onChange={e => setForm({ ...form, enrollment_date: e.target.value })} />
                            </div>
                        </div>

                        <div className="modal-grid-3col">
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

                        <div className="modal-grid-3col">
                            <div>
                                <label style={lStyle}>Age</label>
                                <input style={iStyle} type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
                            </div>
                            <div>
                                <label style={lStyle}>Gender</label>
                                <select style={iStyle} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label style={lStyle}>Birthday</label>
                                <input style={iStyle} type="date" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} />
                            </div>
                        </div>

                        <div>
                            <label style={lStyle}>Guardian Name</label>
                            <input style={iStyle} value={form.guardian_name} onChange={e => setForm({ ...form, guardian_name: e.target.value })} />
                        </div>

                        <div className="modal-grid-2col">
                            <div>
                                <label style={lStyle}>Email {modal === 'add' && <span style={{ color: '#dc2626' }}>*</span>}</label>
                                <input style={iStyle} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required={modal === 'add'} />
                            </div>
                            <div>
                                <label style={lStyle}>Contact No.</label>
                                <input style={iStyle} value={form.contact_number} onChange={handleContactChange} placeholder="09XXXXXXXXX" maxLength={11} />
                            </div>
                        </div>

                        <div>
                            <label style={lStyle}>Address</label>
                            <textarea style={{ ...iStyle, height: 60, resize: 'none' }} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                        </div>

                        {saveError && <p style={{ color: '#dc2626', fontSize: '.82rem', margin: 0 }}>{saveError}</p>}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                            <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                <Check size={14} /> {saving ? 'Saving...' : modal === 'add' ? 'Add Student' : 'Save Student'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

const iconWrap = { width: 44, height: 44, borderRadius: 12, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fed7aa' };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 };
const modalCard = { background: '#fff', borderRadius: 20, padding: '28px 32px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,.2)' };
const iconBtnStyle = { background: 'rgba(0,0,0,.04)', border: '1px solid rgba(0,0,0,.08)', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#78716c' };
const lStyle = { display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#44403c', marginBottom: 5, letterSpacing: .3 };
const iStyle = { width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid #e7e5e4', fontSize: '.875rem', fontFamily: "'Inter',sans-serif", color: '#1c1917', boxSizing: 'border-box' };
const pageBtn = { minWidth: 34, height: 34, borderRadius: 8, border: '1.5px solid #e7e5e4', background: '#fff', color: '#78716c', fontSize: '.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' };
