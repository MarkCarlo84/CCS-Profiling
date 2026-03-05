import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookMarked, SlidersHorizontal, FlaskConical, Presentation, Layers } from 'lucide-react';

const API = 'http://localhost:8000/api';

const typeConfig = {
    lecture: { label: 'Lecture', Icon: Presentation, bg: '#fff7ed', fg: '#c2410c', border: '#fed7aa' },
    lab: { label: 'Lab', Icon: FlaskConical, bg: '#fef9c3', fg: '#a16207', border: '#fde68a' },
    both: { label: 'Both', Icon: Layers, bg: '#dcfce7', fg: '#15803d', border: '#bbf7d0' },
};

const TypeBadge = ({ type }) => {
    const c = typeConfig[type] ?? { label: type, bg: '#f5f5f4', fg: '#78716c', border: '#e7e5e4', Icon: Layers };
    const { Icon } = c;
    return (
        <span style={{ background: c.bg, color: c.fg, border: `1px solid ${c.border}`, borderRadius: 7, padding: '3px 9px', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon size={11} />{c.label}
        </span>
    );
};

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterDept, setFilterDept] = useState('');
    const [filterType, setFilterType] = useState('');

    const fetchCourses = async () => {
        setLoading(true);
        const params = {};
        if (search) params.search = search;
        if (filterDept) params.department_id = filterDept;
        if (filterType) params.type = filterType;
        try {
            const res = await axios.get(`${API}/courses`, { params });
            setCourses(res.data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => {
        axios.get(`${API}/departments`).then(r => setDepartments(r.data));
        fetchCourses();
    }, []);

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <div className="page-icon"><BookMarked size={22} color="#f97316" strokeWidth={1.8} /></div>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', color: '#18120e', fontWeight: 800, letterSpacing: '-.02em', margin: 0 }}>Courses</h1>
                        <p style={{ color: '#78716c', fontSize: '.86rem', marginTop: 2 }}>All courses offered by the department</p>
                    </div>
                </div>
            </div>

            <div className="filter-bar">
                <SlidersHorizontal size={15} color="#a8a29e" style={{ flexShrink: 0 }} />
                <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchCourses()} placeholder="Search course name or code…" type="text" style={{ flex: 1, minWidth: 180 }} />
                <select value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                    <option value="">All Types</option>
                    <option value="lecture">Lecture</option>
                    <option value="lab">Lab</option>
                    <option value="both">Both</option>
                </select>
                <button onClick={fetchCourses} className="btn btn-primary btn-sm">Search</button>
            </div>

            {loading ? <div className="loading"><div className="loading-spinner" /><span>Loading…</span></div> : (
                <div className="card">
                    <div className="card-header">
                        <h2><BookMarked size={15} color="#f97316" />Course List</h2>
                        <span style={{ fontSize: 12, color: '#a8a29e', fontWeight: 500 }}>{courses.length} course(s)</span>
                    </div>
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>{['Code', 'Name', 'Units', 'Hrs/Wk', 'Type', 'Department', 'Status'].map(h => <th key={h}>{h}</th>)}</tr>
                            </thead>
                            <tbody>
                                {courses.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#a8a29e', padding: 32 }}>No courses found.</td></tr>}
                                {courses.map(c => (
                                    <tr key={c.id}>
                                        <td><span style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 800 }}>{c.code}</span></td>
                                        <td style={{ fontWeight: 600, color: '#18120e' }}>{c.name}</td>
                                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{c.units}</td>
                                        <td style={{ textAlign: 'center' }}>{c.hours_per_week}</td>
                                        <td><TypeBadge type={c.type} /></td>
                                        <td style={{ color: '#78716c', fontSize: 13 }}>{c.department?.code ?? '—'}</td>
                                        <td>
                                            <span style={{ color: c.is_active ? '#15803d' : '#a8a29e', fontSize: 12, fontWeight: 600 }}>
                                                {c.is_active ? '● Active' : '○ Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
