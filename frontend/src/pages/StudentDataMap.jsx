import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { getStudents, getDepartments } from '../api';
import { GraduationCap, Search, Printer, Building, Trophy, CheckCircle } from 'lucide-react';

function Badge({ value }) {
    return <span className={`badge badge-${value?.toLowerCase().replace(/\s/g, '_')}`}>{value?.replace(/_/g, ' ')}</span>;
}

function SkillTag({ skill }) {
    return <span className={`badge badge-${skill.proficiency}`} style={{ margin: '2px' }}>{skill.skill}</span>;
}

export default function StudentDataMap() {
    const [students, setStudents] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ department_id: '', year_level: '', status: 'active', search: '' });
    const printRef = useRef();

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'CCS Student Data Map',
        pageStyle: `@page { size: A4 landscape; margin: 10mm 8mm; } body { font-family: Arial, sans-serif; font-size: 10px; } table { font-size: 9px; }`,
    });

    useEffect(() => { getDepartments().then(r => setDepartments(r.data)).catch(() => { }); }, []);
    useEffect(() => {
        setLoading(true);
        getStudents(filters).then(r => setStudents(r.data)).finally(() => setLoading(false));
    }, [filters]);

    const grouped = students.reduce((acc, s) => {
        const key = s.department?.name || 'Unknown';
        if (!acc[key]) acc[key] = [];
        acc[key].push(s);
        return acc;
    }, {});

    return (
        <div>
            <div className="page-header no-print">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <div style={iconWrap}><GraduationCap size={22} color="#f97316" /></div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>Student Data Map</h1>
                </div>
                <p style={{ color: '#78716c' }}>Comprehensive student profiles including affiliations, skills, violations, and academic records</p>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar no-print">
                <div style={{ position: 'relative' }}>
                    <Search size={15} color="#f97316" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text" placeholder="Search name or student no…"
                        value={filters.search}
                        onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                        style={{ paddingLeft: 36 }}
                    />
                </div>
                <select value={filters.department_id} onChange={e => setFilters(f => ({ ...f, department_id: e.target.value }))}>
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <select value={filters.year_level} onChange={e => setFilters(f => ({ ...f, year_level: e.target.value }))}>
                    <option value="">All Year Levels</option>
                    {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="graduated">Graduated</option>
                    <option value="dropped">Dropped</option>
                </select>
                <button className="btn btn-primary" onClick={handlePrint}>
                    <Printer size={15} /> Print / Export PDF
                </button>
            </div>

            {/* Printable Area */}
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
                    Object.entries(grouped).map(([deptName, deptStudents]) => (
                        <div key={deptName} className="card" style={{ marginBottom: 28 }}>
                            <div className="card-header" style={{ background: 'linear-gradient(135deg,#f97316,#fb923c)', color: '#fff' }}>
                                <h2 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Building size={17} strokeWidth={2} />{deptName}
                                </h2>
                                <span className="badge" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>
                                    {deptStudents.length} students
                                </span>
                            </div>
                            <div className="card-body" style={{ padding: 0 }}>
                                <div className="table-wrap">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>#</th><th>Student No.</th><th>Full Name</th>
                                                <th>Year / Section</th><th>Gender</th><th>GPA</th>
                                                <th>Affiliations</th><th>Skills</th><th>Achievements</th>
                                                <th>Violations</th><th>Contact</th><th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {deptStudents.map((stu, idx) => (
                                                <tr key={stu.id}>
                                                    <td>{idx + 1}</td>
                                                    <td><strong>{stu.student_number}</strong></td>
                                                    <td><div style={{ fontWeight: 600 }}>{stu.last_name}, {stu.first_name}{stu.middle_name ? ` ${stu.middle_name[0]}.` : ''}</div></td>
                                                    <td>{stu.year_level}<br /><small style={{ color: '#78716c' }}>{stu.section ? `Sec. ${stu.section}` : ''}</small></td>
                                                    <td>{stu.gender || '—'}</td>
                                                    <td>
                                                        {stu.gpa != null
                                                            ? <span style={{ fontWeight: 700, color: stu.gpa <= 1.5 ? '#16a34a' : stu.gpa <= 2.0 ? '#2563eb' : '#dc2626' }}>{parseFloat(stu.gpa).toFixed(2)}</span>
                                                            : '—'}
                                                    </td>
                                                    <td style={{ minWidth: 140 }}>
                                                        {stu.affiliations?.length > 0
                                                            ? stu.affiliations.map(a => (
                                                                <div key={a.id} style={{ fontSize: '.75rem', marginBottom: 2 }}>
                                                                    <strong>{a.role || 'Member'}</strong> — {a.organization}
                                                                    <br /><small style={{ color: '#78716c' }}>{a.school_year}</small>
                                                                </div>
                                                            ))
                                                            : '—'}
                                                    </td>
                                                    <td style={{ minWidth: 130 }}>
                                                        {stu.skills?.length > 0
                                                            ? <div className="tags">{stu.skills.map(sk => <SkillTag key={sk.id} skill={sk} />)}</div>
                                                            : '—'}
                                                    </td>
                                                    <td style={{ minWidth: 150 }}>
                                                        {stu.non_academic_records?.length > 0
                                                            ? stu.non_academic_records.map(r => (
                                                                <div key={r.id} style={{ fontSize: '.75rem', marginBottom: 2, display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                                                                    <Trophy size={11} color="#f97316" style={{ marginTop: 2, flexShrink: 0 }} />
                                                                    <span><strong>{r.award}</strong><br />{r.activity} ({r.level})</span>
                                                                </div>
                                                            ))
                                                            : '—'}
                                                    </td>
                                                    <td style={{ minWidth: 130 }}>
                                                        {stu.violations?.length > 0
                                                            ? stu.violations.map(v => (
                                                                <div key={v.id} style={{ fontSize: '.75rem', marginBottom: 2 }}>
                                                                    <Badge value={v.severity} /> {v.violation}
                                                                    <br /><small style={{ color: '#78716c' }}>{v.date_committed}</small>
                                                                </div>
                                                            ))
                                                            : <span style={{ color: '#16a34a', fontSize: '.75rem', display: 'flex', alignItems: 'center', gap: 3 }}>
                                                                <CheckCircle size={12} /> No violations
                                                            </span>}
                                                    </td>
                                                    <td>
                                                        {stu.email && <div style={{ fontSize: '.72rem' }}>{stu.email}</div>}
                                                        {stu.phone && <div style={{ fontSize: '.72rem', color: '#78716c' }}>{stu.phone}</div>}
                                                    </td>
                                                    <td><Badge value={stu.status} /></td>
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
