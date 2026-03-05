import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, SlidersHorizontal, ChevronDown, ChevronUp, Archive, CheckCircle, Tag } from 'lucide-react';

const API = 'http://localhost:8000/api';

const StatusBadge = ({ status }) => {
    const map = { active: { bg: '#dcfce7', fg: '#15803d' }, archived: { bg: '#f5f5f4', fg: '#78716c' } };
    const s = map[status] ?? { bg: '#f5f5f4', fg: '#78716c' };
    return (
        <span style={{ background: s.bg, color: s.fg, borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {status === 'active' ? <CheckCircle size={10} /> : <Archive size={10} />}{status}
        </span>
    );
};

export default function Curriculum() {
    const [curricula, setCurricula] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterDept, setFilterDept] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selected, setSelected] = useState(null);

    const fetchCurricula = async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (filterDept) params.department_id = filterDept;
            if (filterStatus) params.status = filterStatus;
            const res = await axios.get(`${API}/curricula`, { params });
            setCurricula(res.data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => {
        axios.get(`${API}/departments`).then(r => setDepartments(r.data));
        fetchCurricula();
    }, []);

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <div className="page-icon"><BookOpen size={22} color="#f97316" strokeWidth={1.8} /></div>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', color: '#18120e', fontWeight: 800, letterSpacing: '-.02em', margin: 0 }}>Curriculum</h1>
                        <p style={{ color: '#78716c', fontSize: '.86rem', marginTop: 2 }}>Manage academic curricula by department</p>
                    </div>
                </div>
            </div>

            {/* Filter bar */}
            <div className="filter-bar">
                <SlidersHorizontal size={15} color="#a8a29e" style={{ flexShrink: 0 }} />
                <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && fetchCurricula()}
                    placeholder="Search by name or code…" type="text"
                    style={{ flex: 1, minWidth: 180 }}
                />
                <select value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                </select>
                <button onClick={fetchCurricula} className="btn btn-primary btn-sm">Search</button>
            </div>

            {loading ? <div className="loading"><div className="loading-spinner" /><span>Loading…</span></div> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(330px,1fr))', gap: 14 }}>
                    {curricula.length === 0 && <p style={{ color: '#a8a29e', gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>No curricula found.</p>}
                    {curricula.map(c => {
                        const isOpen = selected?.id === c.id;
                        return (
                            <div key={c.id} className="card" style={{ cursor: 'pointer', border: isOpen ? '1.5px solid #f97316' : undefined }}
                                onClick={() => setSelected(isOpen ? null : c)}>
                                <div style={{ padding: '16px 18px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                                                <span style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 800, letterSpacing: .3 }}>{c.code}</span>
                                                <StatusBadge status={c.status} />
                                            </div>
                                            <div style={{ fontWeight: 700, fontSize: 15, color: '#18120e', lineHeight: 1.3 }}>{c.name}</div>
                                            <div style={{ fontSize: 12, color: '#a8a29e', marginTop: 4 }}>
                                                {c.department?.name ?? '—'} · {c.year_implemented}
                                            </div>
                                        </div>
                                        {isOpen ? <ChevronUp size={16} color="#a8a29e" /> : <ChevronDown size={16} color="#a8a29e" />}
                                    </div>
                                    {c.description && <p style={{ marginTop: 10, fontSize: 13, color: '#78716c', lineHeight: 1.6, borderTop: '1px solid #f5f5f4', paddingTop: 10 }}>{c.description}</p>}
                                </div>
                                {isOpen && c.syllabi && (
                                    <div style={{ borderTop: '1px solid #f5f5f4', padding: '12px 18px', background: '#fafaf9' }}>
                                        <div style={{ fontSize: 10, fontWeight: 800, color: '#a8a29e', letterSpacing: 1.2, marginBottom: 8 }}>SYLLABI IN THIS CURRICULUM</div>
                                        {c.syllabi.length === 0
                                            ? <p style={{ color: '#a8a29e', fontSize: 13 }}>No syllabi yet.</p>
                                            : c.syllabi.map(s => (
                                                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f5f5f4', fontSize: 13, color: '#44403c' }}>
                                                    <span><strong style={{ color: '#f97316' }}>{s.course?.code}</strong> — {s.semester} sem, {s.school_year}</span>
                                                    {s.faculty && <span style={{ color: '#a8a29e', fontSize: 12 }}>{s.faculty.first_name} {s.faculty.last_name}</span>}
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
