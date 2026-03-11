import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { getFaculties, createFaculty, updateFaculty, deleteFaculty } from '../api';
import { Users, Search, Printer, Building, Plus, Pencil, Trash2, X, Check } from 'lucide-react';

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

const emptyFaculty = { faculty_id: '', first_name: '', middle_name: '', last_name: '', department: '', position: '', email: '', contact_number: '' };

export default function FacultyDataMap() {
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ department: '', search: '' });
    const [modal, setModal] = useState(null); // 'add' | { edit: faculty }
    const [form, setForm] = useState(emptyFaculty);
    const [saving, setSaving] = useState(false);
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
            contact_number: f.contact_number || ''
        });
        setModal({ edit: f });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (modal === 'add') await createFaculty(form);
            else await updateFaculty(modal.edit.id, form);
            setModal(null);
            loadData();
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this faculty member?')) return;
        await deleteFaculty(id);
        loadData();
    };

    const grouped = faculties.reduce((acc, f) => {
        const key = f.department || 'Unknown';
        if (!acc[key]) acc[key] = [];
        acc[key].push(f);
        return acc;
    }, {});

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
                        <p style={{ color: '#78716c' }}>Complete faculty roster grouped by department — Manage and Print</p>
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
                <select value={filters.department} onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}>
                    <option value="">All Departments</option>
                    {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
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
                    Object.entries(grouped).map(([deptName, members]) => (
                        <div key={deptName} className="card" style={{ marginBottom: 24 }}>
                            <div className="card-header" style={{ background: 'linear-gradient(135deg,#ea580c,#f97316)', color: '#fff' }}>
                                <h2 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Building size={17} strokeWidth={2} />{deptName}
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
                                            {members.map((fac, idx) => (
                                                <tr key={fac.id}>
                                                    <td>{idx + 1}</td>
                                                    <td><strong>{fac.faculty_id || `FAC-${fac.id}`}</strong></td>
                                                    <td>{fac.last_name}, {fac.first_name}{fac.middle_name ? ` ${fac.middle_name[0]}.` : ''}</td>
                                                    <td>{fac.position}</td>
                                                    <td>{fac.email || '—'}</td>
                                                    <td>{fac.contact_number || '—'}</td>
                                                    <td className="no-print">
                                                        <div style={{ display: 'flex', gap: 6 }}>
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
                        </div>
                    ))
                )}
            </div>

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
                                <input style={iStyle} value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="e.g. IT Department" />
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
                                <label style={lStyle}>Email Address</label>
                                <input style={iStyle} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div>
                                <label style={lStyle}>Contact Number</label>
                                <input style={iStyle} value={form.contact_number} onChange={e => setForm({ ...form, contact_number: e.target.value })} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                            <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={saving}><Check size={14} /> {saving ? 'Saving...' : 'Save Faculty'}</button>
                        </div>
                    </form>
                </Modal>
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
