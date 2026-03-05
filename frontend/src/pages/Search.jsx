import React, { useState, useCallback } from 'react';
import { searchAll } from '../api';
import { Search, GraduationCap, Users, BookMarked, CalendarRange, X, Loader2 } from 'lucide-react';

const TABS = [
    { key: 'all', label: 'All', Icon: Search },
    { key: 'students', label: 'Students', Icon: GraduationCap },
    { key: 'faculty', label: 'Faculty', Icon: Users },
    { key: 'courses', label: 'Courses', Icon: BookMarked },
    { key: 'events', label: 'Events', Icon: CalendarRange },
];

const tabColor = { all: '#f97316', students: '#3b82f6', faculty: '#8b5cf6', courses: '#f59e0b', events: '#ec4899' };
const StatusPill = ({ val }) => <span style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', borderRadius: 999, padding: '2px 9px', fontSize: 11, fontWeight: 700 }}>{val}</span>;

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [timer, setTimer] = useState(null);

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
        faculty: results.faculty?.length ?? 0,
        courses: results.courses?.length ?? 0,
        events: results.events?.length ?? 0,
    } : {};
    const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

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
                <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Students */}
                    {(activeTab === 'all' || activeTab === 'students') && results.students?.length > 0 && (
                        <div className="card">
                            <div className="card-header">
                                <h2><GraduationCap size={15} color="#3b82f6" />Students</h2>
                                <span style={{ fontSize: 12, color: '#a8a29e', fontWeight: 500 }}>{results.students.length} result(s)</span>
                            </div>
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>{['Student No.', 'Name', 'Department', 'Year', 'GPA', 'Status'].map(h => <th key={h}>{h}</th>)}</tr>
                                    </thead>
                                    <tbody>
                                        {results.students.map(s => (
                                            <tr key={s.id}>
                                                <td><strong style={{ color: '#3b82f6' }}>{s.student_number}</strong></td>
                                                <td style={{ fontWeight: 600 }}>{s.last_name}, {s.first_name}</td>
                                                <td style={{ color: '#78716c', fontSize: 13 }}>{s.department?.code ?? '—'}</td>
                                                <td>{s.year_level}</td>
                                                <td><strong style={{ color: s.gpa <= 1.75 ? '#15803d' : '#18120e' }}>{s.gpa ? parseFloat(s.gpa).toFixed(2) : '—'}</strong></td>
                                                <td><StatusPill val={s.status} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Faculty */}
                    {(activeTab === 'all' || activeTab === 'faculty') && results.faculty?.length > 0 && (
                        <div className="card">
                            <div className="card-header">
                                <h2><Users size={15} color="#8b5cf6" />Faculty</h2>
                                <span style={{ fontSize: 12, color: '#a8a29e', fontWeight: 500 }}>{results.faculty.length} result(s)</span>
                            </div>
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>{['Employee No.', 'Name', 'Department', 'Position', 'Type', 'Status'].map(h => <th key={h}>{h}</th>)}</tr>
                                    </thead>
                                    <tbody>
                                        {results.faculty.map(f => (
                                            <tr key={f.id}>
                                                <td><strong style={{ color: '#8b5cf6' }}>{f.employee_number}</strong></td>
                                                <td style={{ fontWeight: 600 }}>{f.last_name}, {f.first_name}</td>
                                                <td style={{ color: '#78716c', fontSize: 13 }}>{f.department?.code ?? '—'}</td>
                                                <td style={{ fontSize: 13 }}>{f.position}</td>
                                                <td><StatusPill val={f.employment_type} /></td>
                                                <td><StatusPill val={f.status} /></td>
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
        </div>
    );
}
