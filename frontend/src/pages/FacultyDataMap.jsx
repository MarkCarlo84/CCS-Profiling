import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { getFaculties, getDepartments } from '../api';
import { Users, Search, Printer, Building } from 'lucide-react';

function Badge({ value }) {
    return <span className={`badge badge-${value?.toLowerCase().replace(/\s/g, '_')}`}>{value?.replace(/_/g, ' ')}</span>;
}

export default function FacultyDataMap() {
    const [faculties, setFaculties] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ department_id: '', status: '', search: '' });
    const printRef = useRef();

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'CCS Faculty Data Map',
        pageStyle: `@page { size: A4 landscape; margin: 15mm 12mm; } body { font-family: Arial, sans-serif; }`,
    });

    useEffect(() => { getDepartments().then(r => setDepartments(r.data)).catch(() => { }); }, []);
    useEffect(() => {
        setLoading(true);
        getFaculties(filters).then(r => setFaculties(r.data)).finally(() => setLoading(false));
    }, [filters]);

    const grouped = faculties.reduce((acc, f) => {
        const key = f.department?.name || 'Unknown';
        if (!acc[key]) acc[key] = [];
        acc[key].push(f);
        return acc;
    }, {});

    return (
        <div>
            <div className="page-header no-print">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <div style={iconWrap}><Users size={22} color="#f97316" /></div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>Faculty Data Map</h1>
                </div>
                <p style={{ color: '#78716c' }}>Complete faculty roster grouped by department — printable report</p>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar no-print">
                <div style={{ position: 'relative' }}>
                    <Search size={15} color="#f97316" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text" placeholder="Search name or employee no…"
                        value={filters.search}
                        onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                        style={{ paddingLeft: 36 }}
                    />
                </div>
                <select value={filters.department_id} onChange={e => setFilters(f => ({ ...f, department_id: e.target.value }))}>
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on_leave">On Leave</option>
                </select>
                <button className="btn btn-primary" onClick={handlePrint}>
                    <Printer size={15} /> Print / Export PDF
                </button>
            </div>

            {/* Printable Area */}
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
                                <span className="badge" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>
                                    {members.length} faculty
                                </span>
                            </div>
                            <div className="card-body" style={{ padding: 0 }}>
                                <div className="table-wrap">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>#</th><th>Employee No.</th><th>Full Name</th><th>Position</th>
                                                <th>Employment Type</th><th>Specialization</th><th>Highest Education</th>
                                                <th>Contact</th><th>Date Hired</th><th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {members.map((fac, idx) => (
                                                <tr key={fac.id}>
                                                    <td>{idx + 1}</td>
                                                    <td><strong>{fac.employee_number}</strong></td>
                                                    <td>{fac.last_name}, {fac.first_name}{fac.middle_name ? ` ${fac.middle_name[0]}.` : ''}</td>
                                                    <td>{fac.position}</td>
                                                    <td><Badge value={fac.employment_type} /></td>
                                                    <td>{fac.specialization || '—'}</td>
                                                    <td>{fac.highest_education || '—'}</td>
                                                    <td>
                                                        {fac.email && <div style={{ fontSize: '.75rem' }}>{fac.email}</div>}
                                                        {fac.phone && <div style={{ fontSize: '.75rem', color: '#78716c' }}>{fac.phone}</div>}
                                                    </td>
                                                    <td>{fac.date_hired ? new Date(fac.date_hired).toLocaleDateString('en-PH') : '—'}</td>
                                                    <td><Badge value={fac.status} /></td>
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
        </div>
    );
}

const iconWrap = { width: 44, height: 44, borderRadius: 12, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fed7aa' };
