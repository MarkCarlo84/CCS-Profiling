import React, { useState, useEffect } from 'react';
import { getAcademicRecords, deleteAcademicRecord } from '../api';
import { GraduationCap, Search, Trash2, ChevronDown, ChevronUp, BookOpen, User, AlertTriangle, UserX } from 'lucide-react';

const PROGRAMS = [
    { label: 'Information Technology', short: 'BSIT', value: 'IT' },
    { label: 'Computer Science', short: 'BSCS', value: 'CS' },
];

export default function AcademicRecordsMap() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [localQuery, setLocalQuery] = useState('');
    const [activeProgram, setActiveProgram] = useState('IT');
    const [expanded, setExpanded] = useState({});
    
    // New filters
    const [statusFilter, setStatusFilter] = useState('All');
    const [syFilter, setSyFilter] = useState('All School Years');
    const [semFilter, setSemFilter] = useState('All Semesters');

    const load = () => { setLoading(true); getAcademicRecords().then(r => setRecords(r.data)).finally(() => setLoading(false)); };
    
    useEffect(() => { load(); }, []);

    const remove = async (id) => { if (!window.confirm('Delete this academic record?')) return; await deleteAcademicRecord(id); load(); };
    const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

    const getStatus = (s) => {
        const st = s?.status?.toLowerCase() || '';
        if (st === 'active' || st === 'regular') return 'Regular';
        if (st === 'inactive' || st === 'irregular') return 'Irregular';
        if (st === 'graduated') return 'Graduated';
        if (st === 'dropped') return 'Dropped';
        return 'Other';
    };

    const programRecords = records.filter(r => r.student?.department === activeProgram);

    // Compute unique students and their statuses
    const uniqueStudents = [];
    const seenIds = new Set();
    programRecords.forEach(r => {
        if (r.student && !seenIds.has(r.student.id)) {
            seenIds.add(r.student.id);
            uniqueStudents.push(r.student);
        }
    });

    const statusCounts = { Regular: 0, Irregular: 0, Graduated: 0, Dropped: 0 };
    uniqueStudents.forEach(stu => {
        const st = getStatus(stu);
        if (statusCounts[st] !== undefined) statusCounts[st]++;
    });

    // Handle filtering
    let filtered = programRecords;
    if (statusFilter !== 'All') {
        filtered = filtered.filter(r => getStatus(r.student) === statusFilter);
    }
    if (syFilter !== 'All School Years') {
        filtered = filtered.filter(r => r.school_year === syFilter);
    }
    if (semFilter !== 'All Semesters') {
        filtered = filtered.filter(r => r.semester === semFilter);
    }
    if (localQuery) {
        const q = localQuery.toLowerCase();
        filtered = filtered.filter(r => 
            r.student?.first_name?.toLowerCase().includes(q) ||
            r.student?.last_name?.toLowerCase().includes(q) ||
            r.student_id?.toLowerCase().includes(q) ||
            r.school_year?.toLowerCase().includes(q) ||
            r.grades?.some(g => g.subject_name?.toLowerCase().includes(q) || g.subject?.subject_name?.toLowerCase().includes(q) || g.subject?.subject_code?.toLowerCase().includes(q))
        );
    }

    const availableSYs = [...new Set(programRecords.map(r => r.school_year).filter(Boolean))].sort().reverse();
    const availableSems = ['1st Semester', '2nd Semester', 'Summer'];

    // Grouping logic: Year Level -> Semester
    const grouped = filtered.reduce((acc, r) => {
        const sy = r.school_year || 'Unassigned SY';
        const sem = r.semester || 'Unassigned Sem';
        if (!acc[sy]) acc[sy] = {};
        if (!acc[sy][sem]) acc[sy][sem] = [];
        acc[sy][sem].push(r);
        return acc;
    }, {});
    
    // Render the nested table for each semester
    const renderTable = (label, items) => {
        if (!items || items.length === 0) return null;
        return (
            <div key={label} style={{ marginBottom: 28, borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#fff' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#2563eb', padding: '12px 18px', flexWrap: 'wrap', gap: 8,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <GraduationCap size={18} color="#fff" />
                        <span style={{ fontWeight: 600, fontSize: '1rem', color: '#fff' }}>{label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <span style={{ fontSize: '.78rem', fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,.2)', padding: '4px 12px', borderRadius: 20 }}>
                            {items.length} records
                        </span>
                    </div>
                </div>
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.875rem', minWidth: 600 }}>
                        <thead>
                            <tr style={{ background: '#0f172a' }}>
                                <th style={{ ...th, width: 44, textAlign: 'center' }}>#</th>
                                <th style={{ ...th, width: '15%' }}>STUDENT ID</th>
                                <th style={{ ...th }}>STUDENT NAME</th>
                                <th style={{ ...th, width: 80, textAlign: 'center' }}>GPA</th>
                                <th style={{ ...th, width: 120, textAlign: 'center' }}>GRADES</th>
                                <th style={{ ...th, width: 80, textAlign: 'center' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((r, idx) => (
                                <React.Fragment key={r.id}>
                                    <tr style={{ borderTop: idx > 0 ? '1px solid #e2e8f0' : 'none', background: expanded[r.id] ? '#f8fafc' : '#fff' }}>
                                        <td style={{ ...td, color: '#64748b', fontSize: '.8rem', textAlign: 'center' }}>{idx + 1}</td>
                                        <td style={{ ...td }}>
                                            <strong style={{ color: '#0f172a', fontSize: '.875rem' }}>{r.student_id}</strong>
                                        </td>
                                        <td style={{ ...td, color: '#334155', fontWeight: 500 }}>
                                            {r.student ? `${r.student.first_name} ${r.student.last_name}` : 'Unknown Student'}
                                        </td>
                                        <td style={{ ...td, textAlign: 'center' }}>
                                            {r.gpa != null
                                                ? <strong style={{ fontSize: '.95rem', color: r.gpa <= 1.5 ? '#16a34a' : r.gpa <= 2.5 ? '#2563eb' : '#dc2626' }}>{parseFloat(r.gpa).toFixed(2)}</strong>
                                                : <span style={{ color: '#94a3b8' }}>—</span>}
                                        </td>
                                        <td style={{ ...td, textAlign: 'center' }}>
                                            {r.grades?.length > 0 && (
                                                <button style={toggleBtn} onClick={() => toggle(r.id)}>
                                                    {expanded[r.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                    <span style={{ fontSize: '.75rem', marginLeft: 4, fontWeight: 600 }}>{r.grades.length} subjs</span>
                                                </button>
                                            )}
                                        </td>
                                        <td style={{ ...td, textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                                <button style={{ ...actionBtn, color: '#ef4444' }} onClick={() => remove(r.id)} title="Delete Record"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expanded[r.id] && r.grades?.length > 0 && (
                                        <tr>
                                            <td colSpan={6} style={{ padding: 0 }}>
                                                <div style={{ background: '#f8fafc', padding: '12px 24px', borderBottom: '1px solid #e2e8f0' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
                                                        <tbody>
                                                            {r.grades.map(g => (
                                                                <tr key={g.id}>
                                                                    <td style={{ padding: '6px 0', color: '#64748b', width: 24 }}>→</td>
                                                                    <td style={{ padding: '6px 0', fontWeight: 600, color: '#334155', width: '50%' }}>
                                                                        {g.subject_name || g.subject?.subject_name}
                                                                    </td>
                                                                    <td style={{ padding: '6px 0', color: g.score <= 1.5 ? '#16a34a' : g.score <= 2.5 ? '#2563eb' : '#dc2626', fontWeight: 700 }}>
                                                                        {g.score}
                                                                    </td>
                                                                    <td style={{ padding: '6px 0', color: '#64748b', textAlign: 'right' }}>
                                                                        {g.remarks}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const activeProgObj = PROGRAMS.find(p => p.value === activeProgram);

    // Metric configurations
    const metricCards = [
        { label: 'REGULAR', key: 'Regular', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: User },
        { label: 'IRREGULAR', key: 'Irregular', color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: AlertTriangle },
        { label: 'GRADUATED', key: 'Graduated', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: GraduationCap },
        { label: 'DROPPED', key: 'Dropped', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: UserX },
    ];

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                        <div style={iconWrap}><GraduationCap size={22} color="#f97316" /></div>
                        <h1 style={h1}>Academic Records</h1>
                    </div>
                    <p style={sub}>BS {activeProgObj?.label} student records — {programRecords.length} records</p>
                </div>
            </div>

            {/* Program Tabs */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', marginTop: 24 }}>
                {PROGRAMS.map(p => {
                    const isActive = activeProgram === p.value;
                    return (
                        <button
                            key={p.value}
                            onClick={() => { setActiveProgram(p.value); setStatusFilter('All'); setSyFilter('All School Years'); setSemFilter('All Semesters'); setLocalQuery(''); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '10px 20px', borderRadius: 8, border: '1px solid',
                                borderColor: isActive ? '#3b82f6' : '#cbd5e1',
                                background: isActive ? '#eff6ff' : '#fff',
                                color: isActive ? '#2563eb' : '#64748b',
                                fontWeight: 600, fontSize: '.9rem', cursor: 'pointer', transition: 'all .15s',
                            }}
                        >
                            <BookOpen size={16} color={isActive ? '#3b82f6' : '#64748b'} />
                            <span><strong style={{ color: isActive ? '#1d4ed8' : '#334155' }}>{p.short}</strong> {p.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                {metricCards.map(m => {
                    const Icon = m.icon;
                    const isSelected = statusFilter === m.key;
                    return (
                        <div 
                            key={m.key} 
                            onClick={() => setStatusFilter(isSelected ? 'All' : m.key)}
                            style={{ 
                                background: m.bg, 
                                border: `2px solid ${isSelected ? m.color : m.border}`, 
                                borderRadius: 12, 
                                padding: 15, 
                                display: 'flex', 
                                flexDirection: 'column',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                opacity: statusFilter === 'All' || isSelected ? 1 : 0.6,
                                transform: isSelected ? 'translateY(-2px)' : 'none',
                                boxShadow: isSelected ? `0 6px 12px ${m.color}25` : 'none'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: m.color, fontWeight: 700, fontSize: '.8rem', letterSpacing: '.05em', margin: 0, marginBottom: 6 }}>
                                <Icon size={16} /> <span>{m.label}</span>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: m.color, lineHeight: 1, margin: 0 }}>{statusCounts[m.key]}</div>
                            <div style={{ color: m.color, opacity: 0.8, fontSize: '.75rem', fontWeight: 600, marginTop: 4 }}>students</div>
                        </div>
                    );
                })}
            </div>

            {/* Extended Search Bar / Filters */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px', marginBottom: 32 }}>
                <div style={{ position: 'relative', marginBottom: 16 }}>
                    <Search size={18} color="#f97316" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                        type="text" 
                        placeholder="Search by student name, student ID, subject, course code, or school year..."
                        value={localQuery}
                        onChange={e => setLocalQuery(e.target.value)}
                        style={{
                            width: '100%', padding: '12px 14px 12px 42px', borderRadius: 8,
                            border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '.9rem',
                            color: '#0f172a', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                        }}
                        onFocus={e => e.target.style.borderColor = '#3b82f6'}
                        onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    {/* Pills */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setStatusFilter('All')}
                            style={{ ...pillBtn, background: statusFilter === 'All' ? '#1e293b' : '#fff', color: statusFilter === 'All' ? '#fff' : '#64748b', borderColor: statusFilter === 'All' ? '#1e293b' : '#e2e8f0' }}
                        >
                            All <span style={{ ...pillCount, background: statusFilter === 'All' ? 'rgba(255,255,255,.2)' : '#e2e8f0', color: statusFilter === 'All' ? '#fff' : '#475569' }}>{uniqueStudents.length}</span>
                        </button>
                        {metricCards.map(m => (
                            <button
                                key={m.key}
                                onClick={() => setStatusFilter(m.key)}
                                style={{ ...pillBtn, background: statusFilter === m.key ? '#fff' : '#fff', color: statusFilter === m.key ? m.color : '#64748b', borderColor: statusFilter === m.key ? m.color : '#e2e8f0' }}
                            >
                                {m.key} <span style={{ ...pillCount, background: statusFilter === m.key ? m.bg : '#e2e8f0', color: statusFilter === m.key ? m.color : '#475569' }}>{statusCounts[m.key]}</span>
                            </button>
                        ))}
                    </div>

                    <div style={{ width: 1, height: 24, background: '#e2e8f0', margin: '0 4px' }} />

                    {/* Dropdowns */}
                    <select value={syFilter} onChange={e => setSyFilter(e.target.value)} style={selectStyle}>
                        <option value="All School Years">All School Years</option>
                        {availableSYs.map(sy => <option key={sy} value={sy}>{sy}</option>)}
                    </select>

                    <select value={semFilter} onChange={e => setSemFilter(e.target.value)} style={selectStyle}>
                        <option value="All Semesters">All Semesters</option>
                        {availableSems.map(sem => <option key={sem} value={sem}>{sem}</option>)}
                    </select>

                    <div style={{ flex: 1 }} />
                    <div style={{ fontSize: '.85rem', fontWeight: 600, color: '#64748b' }}>{filtered.length} results</div>
                </div>
            </div>

            {loading ? <div className="loading"><div className="loading-spinner" /><p>Loading…</p></div> : (
                <div>
                    {filtered.length === 0 && <div style={{ textAlign: 'center', color: '#64748b', padding: 40, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>No academic records match your filters.</div>}
                    
                    {/* Render Grouped by School Year -> Semester */}
                    {Object.keys(grouped).sort().reverse().map(sy => {
                        const syRecords = Object.values(grouped[sy]).flat();
                        return (
                            <div key={sy} style={{ marginBottom: 40 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, height: 1, background: '#2563eb' }} />
                                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#2563eb', whiteSpace: 'nowrap' }}>S.Y. {sy}</span>
                                    <span style={{ fontSize: '.8rem', fontWeight: 600, color: '#2563eb', whiteSpace: 'nowrap' }}>{syRecords.length} records</span>
                                    <div style={{ flex: 1, height: 1, background: '#2563eb' }} />
                                </div>
                                {['1st Semester', '2nd Semester', 'Summer', 'Unassigned Sem'].map(sem =>
                                    renderTable(sem !== 'Unassigned Sem' ? sem : (sy === 'Unassigned SY' ? 'Uncategorized Records' : 'Other'), grouped[sy][sem])
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

const h1 = { fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 };
const sub = { color: '#64748b', margin: 0 };
const iconWrap = { width: 44, height: 44, borderRadius: 12, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fed7aa' };
const actionBtn = { background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' };
const toggleBtn = { display: 'flex', alignItems: 'center', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', color: '#475569', cursor: 'pointer', transition: 'background 0.2s' };
const th = { padding: '12px 16px', textAlign: 'left', fontSize: '.75rem', fontWeight: 600, color: '#f8fafc', letterSpacing: '.05em' };
const td = { padding: '14px 16px', verticalAlign: 'middle' };
const pillBtn = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, fontSize: '.78rem', fontWeight: 600, border: '1px solid', cursor: 'pointer', transition: 'all 0.2s' };
const pillCount = { display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 16, height: 16, borderRadius: '50%', fontSize: '.65rem', padding: '0 4px', fontWeight: 700 };
const selectStyle = { padding: '6px 28px 6px 12px', fontSize: '.85rem', fontWeight: 600, color: '#475569', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', outline: 'none', cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23475569%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px top 50%', backgroundSize: '8px auto' };
