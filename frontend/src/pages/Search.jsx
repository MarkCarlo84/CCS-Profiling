import React, { useState, useCallback, useRef } from 'react';
import { searchAll } from '../api';
import { Search, GraduationCap, Users, BookMarked, CalendarRange, X, Loader2 } from 'lucide-react';
import { ExportButtons, PrintHeader } from '../components/ExportControls';

const TABS = [
    { key: 'all', label: 'All', Icon: Search },
    { key: 'students', label: 'Students', Icon: GraduationCap },
    { key: 'faculty', label: 'Faculty', Icon: Users },
    { key: 'courses', label: 'Courses', Icon: BookMarked },
    { key: 'events', label: 'Events', Icon: CalendarRange },
];

const tabColor = { all: '#f97316', students: '#3b82f6', faculty: '#8b5cf6', courses: '#f59e0b', events: '#ec4899' };
const StatusPill = ({ val }) => <span style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', borderRadius: 999, padding: '2px 9px', fontSize: 11, fontWeight: 700 }}>{val}</span>;

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 };

const yearLabel = n => n ? `${['1st','2nd','3rd','4th','5th','6th'][n-1] ?? n+'th'} Year` : null;

function StudentQuickModal({ s, onClose }) {
    const fmt = d => d ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
    const deptLabel = { IT: 'Information Technology', CS: 'Computer Science' };
    const currentYear = s.academic_records?.length
        ? Math.max(...s.academic_records.map(r => r.year_level ?? 0)) || null
        : null;

    const Section = ({ label, color = '#f97316' }) => (
        <div style={{ fontSize: '.68rem', fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '.1em', margin: '20px 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ height: 2, width: 18, background: color, borderRadius: 2 }} />
            {label}
            <div style={{ height: 2, flex: 1, background: `${color}22`, borderRadius: 2 }} />
        </div>
    );

    return (
        <div style={overlay}>
            <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 680, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.2)', padding: 0 }}>

                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', padding: '24px 28px', borderRadius: '20px 20px 0 0', position: 'relative' }}>
                    <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                        <X size={16} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,.25)', border: '3px solid rgba(255,255,255,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>{s.first_name?.[0]}{s.last_name?.[0]}</span>
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#fff' }}>{s.first_name} {s.middle_name ? s.middle_name + ' ' : ''}{s.last_name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.85)', fontFamily: 'monospace', fontWeight: 600 }}>{s.student_id}</span>
                                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,.5)' }} />
                                <span style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.85)' }}>{deptLabel[s.department] || s.department}</span>
                                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,.5)' }} />
                                {currentYear && <>
                                    <span style={{ fontSize: '.75rem', fontWeight: 700, padding: '2px 10px', borderRadius: 999, background: 'rgba(255,255,255,.2)', color: '#fff' }}>{yearLabel(currentYear)}</span>
                                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,.5)' }} />
                                </>}
                                <span style={{ fontSize: '.75rem', fontWeight: 700, padding: '2px 10px', borderRadius: 999, background: 'rgba(255,255,255,.2)', color: '#fff', textTransform: 'capitalize' }}>{s.status}</span>
                            </div>
                        </div>
                    </div>
                    {/* Quick stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
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
                <div style={{ padding: '4px 28px 24px' }}>
                    <Section label="Personal Information" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                        {[
                            ['Student ID', s.student_id],
                            ['Date of Birth', fmt(s.date_of_birth)],
                            ['Full Name', `${s.first_name || ''} ${s.middle_name || ''} ${s.last_name || ''}`.trim()],
                            ['Age', s.age],
                            ['Gender', s.gender],
                            ['Contact', s.contact_number],
                            ['Email', s.email],
                            ['Guardian', s.guardian_name],
                            ['Department', deptLabel[s.department] || s.department],
                            ['Year Level', yearLabel(currentYear)],
                            ['Enrolled', fmt(s.enrollment_date)],
                        ].map(([label, value]) => (
                            <div key={label} style={{ display: 'flex', alignItems: 'baseline', padding: '8px 0', borderBottom: '1px solid #f5f5f4' }}>
                                <span style={{ width: 110, flexShrink: 0, color: '#a8a29e', fontWeight: 600, fontSize: '.8rem' }}>{label}</span>
                                <span style={{ color: '#1c1917', fontWeight: 500, fontSize: '.875rem', wordBreak: 'break-word', flex: 1 }}>{value || '—'}</span>
                            </div>
                        ))}
                        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'baseline', padding: '8px 0', borderBottom: '1px solid #f5f5f4' }}>
                            <span style={{ width: 110, flexShrink: 0, color: '#a8a29e', fontWeight: 600, fontSize: '.8rem' }}>Address</span>
                            <span style={{ color: '#1c1917', fontWeight: 500, fontSize: '.875rem', flex: 1 }}>{s.address || '—'}</span>
                        </div>
                    </div>

                    {/* Academic Records */}
                    {s.academic_records?.length > 0 && <>
                        <Section label="Academic Records" color="#2563eb" />
                        {s.academic_records.map(rec => (
                            <div key={rec.id} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', marginBottom: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <span style={{ fontWeight: 700, fontSize: '.875rem', color: '#1e40af' }}>{rec.school_year} — {rec.semester}</span>
                                    <span style={{ padding: '2px 10px', borderRadius: 999, background: '#dcfce7', color: '#16a34a', fontSize: '.75rem', fontWeight: 700 }}>GPA: {rec.gpa ?? '—'}</span>
                                </div>
                                {rec.grades?.map(g => (
                                    <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.78rem', color: '#64748b', padding: '3px 0', borderTop: '1px solid #dbeafe' }}>
                                        <span>{g.subject?.name ?? g.subject_name ?? '—'}</span>
                                        <span style={{ fontWeight: 600, color: '#1e40af' }}>{g.score} — {g.remarks}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </>}

                    {/* Violations */}
                    {s.violations?.length > 0 && <>
                        <Section label="Violations" color="#dc2626" />
                        {s.violations.map(v => (
                            <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 14px', borderRadius: 8, background: v.is_resolved ? '#f0fdf4' : '#fef2f2', border: `1px solid ${v.is_resolved ? '#bbf7d0' : '#fecaca'}`, marginBottom: 6 }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '.875rem', color: '#1c1917' }}>{v.violation_type}</div>
                                    {v.description && <div style={{ fontSize: '.75rem', color: '#78716c', marginTop: 2 }}>{v.description}</div>}
                                    {v.action_taken && <div style={{ fontSize: '.75rem', color: '#78716c', marginTop: 1 }}>Action: {v.action_taken}</div>}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0, marginLeft: 12 }}>
                                    <span style={{ fontSize: '.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: 999, background: v.severity_level === 'grave' ? '#fee2e2' : v.severity_level === 'major' ? '#fef3c7' : '#fff7ed', color: v.severity_level === 'grave' ? '#dc2626' : v.severity_level === 'major' ? '#d97706' : '#f97316', border: `1px solid ${v.severity_level === 'grave' ? '#fecaca' : v.severity_level === 'major' ? '#fde68a' : '#fed7aa'}` }}>{v.severity_level}</span>
                                    <span style={{ fontSize: '.72rem', color: '#a8a29e' }}>{fmt(v.date_committed)}</span>
                                </div>
                            </div>
                        ))}
                    </>}

                    {/* Skills */}
                    {s.skills?.length > 0 && <>
                        <Section label="Skills" color="#7c3aed" />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {s.skills.map(sk => (
                                <div key={sk.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, background: '#f5f3ff', border: '1px solid #ddd6fe', fontSize: '.8rem', fontWeight: 600, color: '#7c3aed' }}>
                                    {sk.skill_name} <span style={{ fontSize: '.7rem', color: '#a78bfa' }}>· {sk.skill_level}</span>
                                    {sk.certification && <span style={{ fontSize: '.68rem', background: '#7c3aed', color: '#fff', borderRadius: 4, padding: '1px 5px' }}>cert</span>}
                                </div>
                            ))}
                        </div>
                    </>}

                    {/* Affiliations */}
                    {s.affiliations?.length > 0 && <>
                        <Section label="Affiliations" color="#0891b2" />
                        {s.affiliations.map(a => (
                            <div key={a.id} style={{ padding: '9px 14px', borderRadius: 8, background: '#f0f9ff', border: '1px solid #bae6fd', marginBottom: 6 }}>
                                <div style={{ fontWeight: 700, fontSize: '.875rem', color: '#0c4a6e' }}>{a.name}</div>
                                <div style={{ fontSize: '.75rem', color: '#0369a1', marginTop: 2 }}>{a.role} · {a.type}</div>
                            </div>
                        ))}
                    </>}

                    {/* Non-Academic */}
                    {s.non_academic_histories?.length > 0 && <>
                        <Section label="Non-Academic Activities" color="#d97706" />
                        {s.non_academic_histories.map(h => (
                            <div key={h.id} style={{ padding: '9px 14px', borderRadius: 8, background: '#fffbeb', border: '1px solid #fde68a', marginBottom: 6 }}>
                                <div style={{ fontWeight: 700, fontSize: '.875rem', color: '#92400e' }}>{h.activity_title}</div>
                                <div style={{ fontSize: '.75rem', color: '#b45309', marginTop: 2 }}>{h.category} · {h.role}</div>
                            </div>
                        ))}
                    </>}
                </div>
            </div>
        </div>
    );
}

function FacultyQuickModal({ f, onClose }) {
    const deptLabel = { IT: 'Information Technology', CS: 'Computer Science' };
    const Row = ({ label, value }) => (
        <div style={{ display: 'flex', alignItems: 'baseline', padding: '9px 0', borderBottom: '1px solid #f5f5f4' }}>
            <span style={{ width: 130, flexShrink: 0, color: '#a8a29e', fontWeight: 700, fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '.03em' }}>{label}</span>
            <span style={{ color: '#1c1917', fontWeight: 500, fontSize: '.875rem', wordBreak: 'break-word', flex: 1 }}>{value || '—'}</span>
        </div>
    );
    return (
        <div style={overlay}>
            <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.2)', padding: 0 }}>
                <div style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', padding: '22px 26px', borderRadius: '20px 20px 0 0', position: 'relative' }}>
                    <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><X size={15} /></button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,.25)', border: '3px solid rgba(255,255,255,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>{f.first_name?.[0]}{f.last_name?.[0]}</span>
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>{f.first_name} {f.last_name}</div>
                            <div style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.85)', marginTop: 3 }}>{f.faculty_id} · {deptLabel[f.department] || f.department} · {f.position}</div>
                        </div>
                    </div>
                </div>
                <div style={{ padding: '20px 26px' }}>
                    <Row label="Faculty ID"  value={f.faculty_id} />
                    <Row label="Full Name"   value={`${f.first_name || ''} ${f.middle_name || ''} ${f.last_name || ''}`.trim()} />
                    <Row label="Department"  value={deptLabel[f.department] || f.department} />
                    <Row label="Position"    value={f.position} />
                    <Row label="Email"       value={f.email} />
                    <Row label="Contact"     value={f.contact_number} />
                </div>
            </div>
        </div>
    );
}

const flattenSearchResult = (item) => ({
    '#': item._idx,
    'Type': item._type,
    'ID': item._id || '—',
    'Name': item._name || '—',
    'Department': item.department || item.department?.code || '—',
    'Email': item.email || '—',
    'Contact': item.contact_number || '—',
    'Status / Position': item.status || item.position || '—',
    'Extra': item._extra || '—',
});

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [timer, setTimer] = useState(null);
    const [viewingStudent, setViewingStudent] = useState(null);
    const [viewingFaculty, setViewingFaculty] = useState(null);
    const printRef = useRef(null);

    const runSearch = async (q) => {
        if (!q.trim()) { setResults(null); return; }
        setLoading(true);
        try { const r = await searchAll(q); setResults(r.data); }
        catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleInput = useCallback((e) => {
        const q = e.target.value;
        setQuery(q);
        clearTimeout(timer);
        if (q.length >= 2) {
            setTimer(setTimeout(() => runSearch(q), 400));
        } else { setResults(null); }
    }, [timer]);

    const clearSearch = () => { setQuery(''); setResults(null); };

    const counts = results ? {
        students: results.students?.length ?? 0,
        faculty: results.faculties?.length ?? 0,
        courses: results.courses?.length ?? 0,
        events: results.events?.length ?? 0,
    } : {};
    const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

    const getExportData = () => {
        if (!results) return [];
        const rows = [];
        let idx = 1;
        (results.students || []).forEach(s => rows.push({ _idx: idx++, _type: 'Student', _id: s.student_id, _name: `${s.last_name}, ${s.first_name}`, department: s.department, email: s.email, contact_number: s.contact_number, status: s.status, _extra: s.gender }));
        (results.faculties || []).forEach(f => rows.push({ _idx: idx++, _type: 'Faculty', _id: f.faculty_id, _name: `${f.last_name}, ${f.first_name}`, department: f.department, email: f.email, contact_number: f.contact_number, position: f.position, _extra: '' }));
        (results.courses || []).forEach(c => rows.push({ _idx: idx++, _type: 'Course', _id: c.code, _name: c.name, department: c.department?.code ?? '—', email: '', contact_number: '', status: c.type, _extra: `${c.units} units` }));
        (results.events || []).forEach(e => rows.push({ _idx: idx++, _type: 'Event', _id: '', _name: e.title, department: '', email: '', contact_number: '', status: e.status, _extra: e.venue ?? '—' }));
        return rows;
    };

    const visible = (key) => {
        if (!results) return null;
        const map = { students: results.students, faculty: results.faculty, courses: results.courses, events: results.events };
        return activeTab === 'all' ? results : { [activeTab]: map[activeTab] };
    };

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <div className="page-icon"><Search size={22} color="#f97316" strokeWidth={1.8} /></div>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', color: '#18120e', fontWeight: 800, letterSpacing: '-.02em', margin: 0 }}>Global Search</h1>
                        <p style={{ color: '#78716c', fontSize: '.86rem', marginTop: 2 }}>Search students, faculty, courses and events in one place</p>
                    </div>
                </div>
            </div>

            {/* Search Box */}
            <div style={{ position: 'relative', marginBottom: 20, maxWidth: 640 }}>
                <Search size={18} color="#a8a29e" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                    type="text"
                    value={query}
                    onChange={handleInput}
                    placeholder="Type to search across all modules…"
                    style={{
                        width: '100%', padding: '14px 16px 14px 46px',
                        border: query ? '2px solid #f97316' : '2px solid #e7e5e4',
                        borderRadius: 12, fontSize: '1rem',
                        background: '#fff', color: '#18120e', outline: 'none',
                        boxShadow: query ? '0 0 0 3px rgba(249,115,22,.15), 0 4px 20px rgba(249,115,22,.1)' : '0 2px 8px rgba(0,0,0,.06)',
                        transition: 'all .2s ease',
                        fontFamily: 'Inter, sans-serif',
                        paddingRight: (loading || query) ? 48 : 16,
                    }}
                    onFocus={e => { e.target.style.borderColor = '#f97316'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,.15), 0 4px 20px rgba(249,115,22,.1)'; }}
                />
                {loading && <Loader2 size={17} color="#f97316" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', animation: 'spin .7s linear infinite' }} />}
                {!loading && query && <button onClick={clearSearch} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: '#f5f5f4', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={13} color="#78716c" /></button>}
            </div>

            {/* Tabs */}
            {results && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {TABS.map(({ key, label, Icon }) => {
                        const cnt = key === 'all' ? totalCount : (counts[key] ?? 0);
                        const color = tabColor[key];
                        const isActive = activeTab === key;
                        return (
                            <button key={key} onClick={() => setActiveTab(key)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 7,
                                    padding: '8px 16px', borderRadius: 10,
                                    border: isActive ? `1.5px solid ${color}` : '1.5px solid #e7e5e4',
                                    background: isActive ? `${color}12` : '#fff',
                                    color: isActive ? color : '#78716c',
                                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                                    transition: 'all .15s', fontFamily: 'Inter,sans-serif',
                                }}>
                                <Icon size={14} />
                                {label}
                                <span style={{ background: isActive ? color : '#f5f5f4', color: isActive ? '#fff' : '#a8a29e', borderRadius: 999, padding: '1px 7px', fontSize: 11, fontWeight: 800 }}>{cnt}</span>
                            </button>
                        );
                    })}
                    </div>
                    {totalCount > 0 && (
                        <ExportButtons
                            printRef={printRef}
                            data={getExportData}
                            flattenFn={flattenSearchResult}
                            filenamePrefix={`Global_Search_${query.replace(/\s+/g, '_')}`}
                        />
                    )}
                </div>
            )}

            {/* Empty state */}
            {!query && (
                <div style={{ textAlign: 'center', padding: '70px 20px', color: '#a8a29e' }}>
                    <div style={{ width: 72, height: 72, borderRadius: 20, background: '#fff7ed', border: '2px dashed #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Search size={30} color="#f97316" opacity={.5} />
                    </div>
                    <p style={{ fontWeight: 600, color: '#78716c', marginBottom: 6 }}>Search across all modules</p>
                    <p style={{ fontSize: 13 }}>Type at least 2 characters to search students, faculty, courses, and events</p>
                </div>
            )}

            {/* Results */}
            {results && (
                <div ref={printRef} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <PrintHeader
                        title="Global Search"
                        subtitle={`Query: "${query}"`}
                        count={totalCount}
                        filters={{ search: query }}
                    />
                    {/* Students */}
                    {(activeTab === 'all' || activeTab === 'students') && results.students?.length > 0 && (
                        <div className="card">
                            <div className="card-header">
                                <h2><GraduationCap size={15} color="#3b82f6" />Students</h2>
                                <span style={{ fontSize: 12, color: '#a8a29e', fontWeight: 500 }}>{results.students.length} result(s)</span>
                            </div>
                            <div className="table-wrap">
                                <table style={{ tableLayout: 'fixed', width: '100%' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '14%' }}>Student ID</th>
                                            <th style={{ width: '22%' }}>Name</th>
                                            <th style={{ width: '12%' }}>Department</th>
                                            <th style={{ width: '10%' }}>Gender</th>
                                            <th style={{ width: '10%' }}>Status</th>
                                            <th style={{ width: '18%' }}>Contact</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.students.map(s => (
                                            <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => setViewingStudent(s)}>
                                                <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><strong style={{ color: '#3b82f6' }}>{s.student_id || '—'}</strong></td>
                                                <td style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#3b82f6', textDecoration: 'underline', textUnderlineOffset: 3 }}>{s.last_name}, {s.first_name}</td>
                                                <td style={{ color: '#78716c', fontSize: 13 }}>{s.department || '—'}</td>
                                                <td style={{ fontSize: 13 }}>{s.gender || '—'}</td>
                                                <td><StatusPill val={s.status} /></td>
                                                <td style={{ fontSize: 13, color: '#78716c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.contact_number || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Faculty */}
                    {(activeTab === 'all' || activeTab === 'faculty') && results.faculties?.length > 0 && (
                        <div className="card">
                            <div className="card-header">
                                <h2><Users size={15} color="#8b5cf6" />Faculty</h2>
                                <span style={{ fontSize: 12, color: '#a8a29e', fontWeight: 500 }}>{results.faculties.length} result(s)</span>
                            </div>
                            <div className="table-wrap">
                                <table style={{ tableLayout: 'fixed', width: '100%' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '16%' }}>Faculty ID</th>
                                            <th style={{ width: '22%' }}>Name</th>
                                            <th style={{ width: '12%' }}>Department</th>
                                            <th style={{ width: '14%' }}>Position</th>
                                            <th style={{ width: '24%' }}>Email</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.faculties.map(f => (
                                            <tr key={f.id}>
                                                <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><strong style={{ color: '#8b5cf6', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }} onClick={() => setViewingFaculty(f)}>{f.faculty_id || '—'}</strong></td>
                                                <td style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.last_name}, {f.first_name}</td>
                                                <td style={{ color: '#78716c', fontSize: 13 }}>{f.department || '—'}</td>
                                                <td style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.position || '—'}</td>
                                                <td style={{ fontSize: 13, color: '#78716c' }}>{f.email || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Courses */}
                    {(activeTab === 'all' || activeTab === 'courses') && results.courses?.length > 0 && (
                        <div className="card">
                            <div className="card-header">
                                <h2><BookMarked size={15} color="#f59e0b" />Courses</h2>
                                <span style={{ fontSize: 12, color: '#a8a29e', fontWeight: 500 }}>{results.courses.length} result(s)</span>
                            </div>
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>{['Code', 'Name', 'Units', 'Type', 'Department'].map(h => <th key={h}>{h}</th>)}</tr>
                                    </thead>
                                    <tbody>
                                        {results.courses.map(c => (
                                            <tr key={c.id}>
                                                <td><span style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 800 }}>{c.code}</span></td>
                                                <td style={{ fontWeight: 600 }}>{c.name}</td>
                                                <td style={{ textAlign: 'center' }}>{c.units}</td>
                                                <td style={{ fontSize: 12, color: '#a8a29e' }}>{c.type}</td>
                                                <td style={{ fontSize: 13, color: '#78716c' }}>{c.department?.code ?? '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Events */}
                    {(activeTab === 'all' || activeTab === 'events') && results.events?.length > 0 && (
                        <div className="card">
                            <div className="card-header">
                                <h2><CalendarRange size={15} color="#ec4899" />Events</h2>
                                <span style={{ fontSize: 12, color: '#a8a29e', fontWeight: 500 }}>{results.events.length} result(s)</span>
                            </div>
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>{['Title', 'Type', 'Status', 'Date Start', 'Venue'].map(h => <th key={h}>{h}</th>)}</tr>
                                    </thead>
                                    <tbody>
                                        {results.events.map(e => (
                                            <tr key={e.id}>
                                                <td style={{ fontWeight: 600 }}>{e.title}</td>
                                                <td style={{ fontSize: 12, color: '#a8a29e' }}>{e.type}</td>
                                                <td><StatusPill val={e.status} /></td>
                                                <td style={{ fontSize: 13, color: '#78716c' }}>{e.date_start ? new Date(e.date_start).toLocaleDateString('en-PH') : '—'}</td>
                                                <td style={{ fontSize: 13, color: '#78716c' }}>{e.venue ?? '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* No results */}
                    {totalCount === 0 && query && (
                        <div className="empty">
                            <Search size={36} color="#fed7aa" />
                            <span style={{ fontWeight: 600, color: '#78716c' }}>No results found for "{query}"</span>
                            <span style={{ fontSize: 13 }}>Try different keywords or browse modules directly</span>
                        </div>
                    )}
                </div>
            )}
            {viewingStudent && <StudentQuickModal s={viewingStudent} onClose={() => setViewingStudent(null)} />}
            {viewingFaculty && <FacultyQuickModal f={viewingFaculty} onClose={() => setViewingFaculty(null)} />}
        </div>
    );
}
