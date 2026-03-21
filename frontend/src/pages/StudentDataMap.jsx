import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../api';
import { GraduationCap, Search, Printer, Building, Plus, Pencil, Trash2, X, Check } from 'lucide-react';

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

const emptyStudent = {
    student_id: '', first_name: '', middle_name: '', last_name: '',
    age: '', gender: 'Male', guardian_name: '', date_of_birth: '',
    address: '', contact_number: '', email: '', enrollment_date: '', status: 'active'
};

export default function StudentDataMap() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: 'active', search: '', gender: '' });
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(emptyStudent);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

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

    const openAdd = () => { setForm(emptyStudent); setModal('add'); };
    const openEdit = (s) => {
        setForm({
            student_id: s.student_id || '',
            first_name: s.first_name || '',
            middle_name: s.middle_name || '',
            last_name: s.last_name || '',
            age: s.age || '',
            gender: s.gender || 'Male',
            guardian_name: s.guardian_name || '',
            date_of_birth: s.date_of_birth || '',
            address: s.address || '',
            contact_number: s.contact_number || '',
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

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this student record?')) return;
        await deleteStudent(id);
        loadData();
    };

    const grouped = students.reduce((acc, s) => {
        const key = s.status ? s.status.charAt(0).toUpperCase() + s.status.slice(1) : 'Unknown';
        if (!acc[key]) acc[key] = [];
        acc[key].push(s);
        return acc;
    }, {});

    return (
        <div>
            <div className="page-header no-print">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                            <div style={iconWrap}><GraduationCap size={22} color="#f97316" /></div>
                            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>Student Data Map</h1>
                        </div>
                        <p style={{ color: '#78716c' }}>Manage and Print comprehensive student profiles including academic records and history</p>
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
                    <p>Total Students: {students.length}</p>
                    <hr style={{ margin: '6px 0' }} />
                </div>

                {loading ? (
                    <div className="loading"><div className="loading-spinner" /><p>Loading student data…</p></div>
                ) : students.length === 0 ? (
                    <div className="empty"><GraduationCap size={40} color="#fed7aa" /><p style={{ marginTop: 10 }}>No student records found.</p></div>
                ) : (
                    Object.entries(grouped).map(([groupName, groupStudents]) => (
                        <div key={groupName} className="card" style={{ marginBottom: 28 }}>
                            <div className="card-header" style={{ background: 'linear-gradient(135deg,#f97316,#fb923c)', color: '#fff' }}>
                                <h2 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Building size={17} strokeWidth={2} />{groupName}
                                </h2>
                                <span className="badge" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>{groupStudents.length} students</span>
                            </div>
                            <div className="card-body" style={{ padding: 0 }}>
                                <div className="table-wrap">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>#</th><th>Student ID</th><th>Full Name</th>
                                                <th>Age</th><th>Gender</th><th>Guardian</th>
                                                <th>Affiliations</th><th>Skills</th>
                                                <th>Violations</th><th className="no-print">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groupStudents.map((stu, idx) => (
                                                <tr key={stu.id}>
                                                    <td>{idx + 1}</td>
                                                    <td><strong>{stu.student_id || `STU-${stu.id}`}</strong></td>
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
                            </div>
                        </div>
                    ))
                )}
            </div>

            {modal && (
                <Modal title={modal === 'add' ? 'Add New Student' : 'Edit Student'} onClose={() => setModal(null)} width={640}>
                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={lStyle}>Student ID</label>
                                <input style={iStyle} value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })} placeholder="STU-2024-XXXX" />
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

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: 12 }}>
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

                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12 }}>
                            <div>
                                <label style={lStyle}>Email {modal === 'add' && <span style={{ color: '#dc2626' }}>*</span>}</label>
                                <input style={iStyle} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required={modal === 'add'} />
                            </div>
                            <div>
                                <label style={lStyle}>Contact No.</label>
                                <input style={iStyle} value={form.contact_number} onChange={e => setForm({ ...form, contact_number: e.target.value })} />
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
