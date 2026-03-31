import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { getStudents, createStudent, updateStudent, deleteStudent, sendOtp, verifyOtp } from '../api';
import { GraduationCap, Search, Printer, Building, Plus, Pencil, Trash2, X, Check, ShieldCheck, Mail, AlertCircle } from 'lucide-react';

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
    student_id: '', department: '', first_name: '', middle_name: '', last_name: '',
    age: '', gender: 'Male', guardian_name: '', date_of_birth: '',
    address: '', contact_number: '09', email: '', enrollment_date: '', status: 'active'
};

export default function StudentDataMap() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: 'active', search: '', gender: '', department: '' });
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(emptyStudent);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [deptPages, setDeptPages] = useState({});
    const PAGE_SIZE = 5;

    // OTP flow state
    const [otpStep, setOtpStep] = useState(false);
    const [otpValue, setOtpValue] = useState('');
    const [otpSending, setOtpSending] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [pendingForm, setPendingForm] = useState(null);

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
        setSaveError('');
        // Edit mode — no OTP needed
        if (modal !== 'add') {
            setSaving(true);
            try {
                await updateStudent(modal.edit.id, form);
                setModal(null);
                loadData();
            } catch (err) {
                setSaveError(err.response?.data?.message || 'Failed to save. Try again.');
            } finally {
                setSaving(false);
            }
            return;
        }
        // Add mode — send OTP to student email first
        setOtpSending(true);
        setOtpError('');
        try {
            await sendOtp('add_student', form.email);
            setPendingForm(form);
            setOtpStep(true);
            setOtpValue('');
        } catch (err) {
            setSaveError(err.response?.data?.message || 'Failed to send OTP. Check the email address.');
        } finally {
            setOtpSending(false);
        }
    };

    // Step 2: verify OTP then actually create student
    const handleOtpConfirm = async (e) => {
        e.preventDefault();
        setSaving(true);
        setOtpError('');
        try {
            await verifyOtp(otpValue, 'add_student', pendingForm.email);
            await createStudent(pendingForm);
            setOtpStep(false);
            setModal(null);
            setPendingForm(null);
            loadData();
        } catch (err) {
            setOtpError(err.response?.data?.message || 'Invalid or expired OTP.');
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
                                {paginated.map((stu, idx) => (
                                    <tr key={stu.id}>
                                        <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                            <div style={iconWrap}><GraduationCap size={22} color="#f97316" /></div>
                            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>Student Data Map</h1>
                        </div>
                        <p style={{ color: '#78716c', marginBottom: 10 }}>Manage and Print comprehensive student profiles including academic records and history</p>
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            {[['', 'All Students'], ['IT', 'Information Technology (IT)'], ['CS', 'Computer Science (CS)']].map(([val, label]) => (
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

            {modal && (
                <Modal title={modal === 'add' ? 'Add New Student' : 'Edit Student'} onClose={() => { setModal(null); setOtpStep(false); setOtpError(''); }} width={640}>
                    {/* OTP verification step */}
                    {otpStep ? (
                        <form onSubmit={handleOtpConfirm} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ textAlign: 'center', padding: '10px 0 6px' }}>
                                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff7ed', border: '2px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                    <ShieldCheck size={26} color="#f97316" />
                                </div>
                                <p style={{ fontSize: '.9rem', fontWeight: 700, color: '#1c1917', margin: '0 0 4px' }}>Verify OTP</p>
                                <p style={{ fontSize: '.8rem', color: '#78716c', margin: 0 }}>
                                    A 6-digit OTP was sent to <strong style={{ color: '#f97316' }}>{pendingForm?.email}</strong>. Enter it below to confirm.
                                </p>
                            </div>
                            {otpError && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', color: '#dc2626', fontSize: '.82rem' }}>
                                    <AlertCircle size={14} />{otpError}
                                </div>
                            )}
                            <div style={{ position: 'relative' }}>
                                <ShieldCheck size={16} color="#f97316" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    style={{ ...iStyle, paddingLeft: 36, letterSpacing: 6, fontSize: '1.1rem', textAlign: 'center' }}
                                    placeholder="000000"
                                    value={otpValue}
                                    onChange={e => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                    autoFocus
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 4 }}>
                                <button type="button" className="btn btn-outline" onClick={() => { setOtpStep(false); setOtpError(''); setOtpValue(''); }}>← Back</button>
                                <button type="submit" className="btn btn-primary" disabled={saving || otpValue.length !== 6}>
                                    <Check size={14} /> {saving ? 'Verifying...' : 'Confirm & Add Student'}
                                </button>
                            </div>
                        </form>
                    ) : (
                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
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
                            <button type="submit" className="btn btn-primary" disabled={saving || otpSending}>
                                {modal === 'add'
                                    ? <><Mail size={14} /> {otpSending ? 'Sending OTP...' : 'Send OTP & Add'}</>
                                    : <><Check size={14} /> {saving ? 'Saving...' : 'Save Student'}</>
                                }
                            </button>
                        </div>
                    </form>
                    )}
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
