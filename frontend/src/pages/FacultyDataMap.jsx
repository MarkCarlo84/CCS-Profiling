import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import { getFaculties, createFaculty, updateFaculty, deleteFaculty } from '../api';
import { useQuery, clearCache } from '../hooks/useQuery';
import { useDebounce } from '../hooks/useDebounce';
import { SkeletonTable } from '../components/SkeletonLoader';
import { Users, Search, Building, Plus, Pencil, Trash2, X, Check, AlertCircle, BookOpen } from 'lucide-react';
import { ExportButtons, PrintHeader } from '../components/ExportControls';

function flattenFaculty(f, i) {
    return {
        '#': i + 1,
        'Faculty ID': f.faculty_id || `FAC-${f.id}`,
        'Last Name': f.last_name || '',
        'First Name': f.first_name || '',
        'Middle Name': f.middle_name || '',
        'Department': f.department || '',
        'Position': f.position || '',
        'Email': f.email || '',
        'Contact Number': f.contact_number || '09',
    };
}

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
    const [filters, setFilters] = useState({ department: '', search: '' });
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(emptyFaculty);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [viewingFaculty, setViewingFaculty] = useState(null);
    const [deptPages, setDeptPages] = useState({});
    const PAGE_SIZE = 5;

    const debouncedSearch = useDebounce(filters.search, 250);

    const printRef = useRef(null);

    const { data: allFaculties = [], loading, refetch } = useQuery('faculties', getFaculties);

    const loadData = () => {
        clearCache('faculties');
        refetch(true);
    };

    useEffect(() => setDeptPages({}), [filters]);

    // Client-side filtering with debounced search
    const faculties = useMemo(() => (allFaculties ?? []).filter(f => {
        const matchDept = !filters.department || f.department === filters.department;
        const q = debouncedSearch.toLowerCase();
        const matchSearch = !q ||
            (f.first_name || '').toLowerCase().includes(q) ||
            (f.last_name || '').toLowerCase().includes(q) ||
            (f.faculty_id || '').toLowerCase().includes(q);
        return matchDept && matchSearch;
    }), [allFaculties, filters.department, debouncedSearch]);

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
                <div className="table-page-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                            <div style={iconWrap}><Users size={22} color="#f97316" /></div>
                            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>Faculty Data Map</h1>
                        </div>
                        <p style={{ color: '#78716c', marginBottom: 10 }}>Complete faculty roster grouped by department — Manage and Print</p>
                        <div className="dept-filter-row" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
                            {[['', 'All Faculty', Users, 'All Faculty'], ['IT', 'Information Technology', BookOpen, 'BSIT'], ['CS', 'Computer Science', BookOpen, 'BSCS']].map(([val, label, Icon, short]) => {
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
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Faculty</button>
                    </div>
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
                <ExportButtons 
                    printRef={printRef} 
                    data={faculties} 
                    flattenFn={flattenFaculty} 
                    filenamePrefix={filters.department ? `Faculty_${filters.department}` : 'Faculty_All'} 
                    groupByKey="department"
                />
            </div>

            <div ref={printRef} style={{ background: '#fff' }}>
                <PrintHeader 
                    title="Faculty Data Map" 
                    subtitle={filters.department || 'All Departments'} 
                    count={faculties.length} 
                    filters={filters} 
                />

                {loading ? (
                    <SkeletonTable rows={5} cols={7} />
                ) : faculties.length === 0 ? (
                    <div className="empty"><Users size={40} color="#fed7aa" /><p style={{ marginTop: 10 }}>No faculty records found.</p></div>
                ) : (
                    Object.keys(grouped).sort().map((deptKey) => {
                        const members = grouped[deptKey];
                        const label = deptKey === 'CS' ? 'Computer Science' : deptKey === 'IT' ? 'Information Technology' : deptKey;
                        const page = getDeptPage(deptKey);
                        const totalPages = Math.ceil(members.length / PAGE_SIZE);
                        const paginated = members.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
                        return (
                        <div key={deptKey} className="card" style={{ marginBottom: 24, breakInside: 'auto' }}>
                            {/* ======================= SCREEN VIEW (PAGINATED) ======================= */}
                            <div>
                                <div className="card-header" style={{ background: 'linear-gradient(135deg,#ea580c,#f97316)', color: '#fff' }}>
                                    <h2 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Building size={17} strokeWidth={2} />{label}
                                    </h2>
                                    <span className="badge" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>{members.length} faculty</span>
                                </div>
                                <div className="card-body" style={{ padding: 0 }}>

                                    {/* Tablet+: scrollable table */}
                                    <div className="subjects-table-wrap" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                                        <table style={{ minWidth: 560 }}>
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
                                                                <button style={iconBtnStyle} onClick={() => openEdit(fac)} title="Edit"><Pencil size={13} /></button>
                                                                <button style={{ ...iconBtnStyle, color: '#dc2626' }} onClick={() => handleDelete(fac.id)} title="Delete"><Trash2 size={13} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile: card list */}
                                    <div className="subjects-card-list">
                                        {paginated.map((fac, idx) => (
                                            <div key={fac.id} style={{
                                                padding: '12px 14px',
                                                borderTop: idx > 0 ? '1px solid var(--border)' : 'none',
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                                                            <strong
                                                                style={{ color: '#8b5cf6', fontSize: '.82rem', fontFamily: 'monospace', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
                                                                onClick={() => setViewingFaculty(fac)}
                                                            >
                                                                {fac.faculty_id || `FAC-${fac.id}`}
                                                            </strong>
                                                        </div>
                                                        <div style={{ fontWeight: 700, fontSize: '.875rem', color: '#1c1917', marginBottom: 2 }}>
                                                            {fac.last_name}, {fac.first_name}{fac.middle_name ? ` ${fac.middle_name[0]}.` : ''}
                                                        </div>
                                                        <div style={{ fontSize: '.78rem', color: '#78716c', marginBottom: 1 }}>{fac.position}</div>
                                                        {fac.email && <div style={{ fontSize: '.75rem', color: '#a8a29e' }}>{fac.email}</div>}
                                                        {fac.contact_number && <div style={{ fontSize: '.75rem', color: '#a8a29e' }}>{fac.contact_number}</div>}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                                        <button style={iconBtnStyle} onClick={() => openEdit(fac)} title="Edit"><Pencil size={13} /></button>
                                                        <button style={{ ...iconBtnStyle, color: '#dc2626' }} onClick={() => handleDelete(fac.id)} title="Delete"><Trash2 size={13} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
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
                        </div>
                        );
                    })
                )}
            </div>

            {/* Add / Edit Faculty Modal */}
            {modal && (
                <Modal title={modal === 'add' ? 'Add New Faculty' : 'Edit Faculty'} onClose={() => setModal(null)}>
                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div className="modal-grid-2col">
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
                        <div>
                            <label style={lStyle}>Position</label>
                            <input style={iStyle} value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} required placeholder="e.g. Associate Professor" />
                        </div>
                        <div className="modal-grid-2col">
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
