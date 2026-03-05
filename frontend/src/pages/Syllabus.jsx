import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';

const API = 'http://localhost:8000/api';

const statusColors = { draft: '#eab308', approved: '#22c55e', archived: '#a8a29e' };
const StatusBadge = ({ val }) => {
    const c = statusColors[val] ?? '#a8a29e';
    return <span style={{ background: `${c}20`, color: c, border: `1px solid ${c}50`, borderRadius: 999, padding: '2px 9px', fontSize: 11, fontWeight: 700 }}>{val}</span>;
};

export default function Syllabus() {
    const [syllabi, setSyllabi] = useState([]);
    const [curricula, setCurricula] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCurriculum, setFilterCurriculum] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterSemester, setFilterSemester] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [lessons, setLessons] = useState({});
    const [loadingLessons, setLoadingLessons] = useState({});

    const fetchSyllabi = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterCurriculum) params.curriculum_id = filterCurriculum;
            if (filterStatus) params.status = filterStatus;
            if (filterSemester) params.semester = filterSemester;
            const res = await axios.get(`${API}/syllabi`, { params });
            setSyllabi(res.data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => {
        axios.get(`${API}/curricula`).then(r => setCurricula(r.data));
        fetchSyllabi();
    }, []);

    const toggleExpand = async (id) => {
        if (expanded === id) { setExpanded(null); return; }
        setExpanded(id);
        if (!lessons[id]) {
            setLoadingLessons(p => ({ ...p, [id]: true }));
            try {
                const res = await axios.get(`${API}/lessons`, { params: { syllabus_id: id } });
                setLessons(p => ({ ...p, [id]: res.data }));
            } catch (e) { console.error(e); }
            setLoadingLessons(p => ({ ...p, [id]: false }));
        }
    };

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <div className="page-icon"><FileText size={22} color="#f97316" strokeWidth={1.8} /></div>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', color: '#18120e', fontWeight: 800, letterSpacing: '-.02em', margin: 0 }}>Syllabi</h1>
                        <p style={{ color: '#78716c', fontSize: '.86rem', marginTop: 2 }}>Course syllabi and weekly lesson plans</p>
                    </div>
                </div>
            </div>

            <div className="filter-bar">
                <SlidersHorizontal size={15} color="#a8a29e" style={{ flexShrink: 0 }} />
                <select value={filterCurriculum} onChange={e => setFilterCurriculum(e.target.value)}>
                    <option value="">All Curricula</option>
                    {curricula.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                </select>
                <select value={filterSemester} onChange={e => setFilterSemester(e.target.value)}>
                    <option value="">All Semesters</option>
                    <option value="1st">1st Semester</option>
                    <option value="2nd">2nd Semester</option>
                    <option value="summer">Summer</option>
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="approved">Approved</option>
                    <option value="archived">Archived</option>
                </select>
                <button onClick={fetchSyllabi} className="btn btn-primary btn-sm">Filter</button>
            </div>

            {loading ? <div className="loading"><div className="loading-spinner" /><span>Loading…</span></div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {syllabi.length === 0 && <div className="empty"><FileText size={36} color="#fed7aa" /><span>No syllabi found.</span></div>}
                    {syllabi.map(s => {
                        const isOpen = expanded === s.id;
                        return (
                            <div key={s.id} className="card" style={{ border: isOpen ? '1.5px solid #f97316' : undefined }}>
                                <div style={{ padding: '15px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
                                    onClick={() => toggleExpand(s.id)}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                                            <span style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 800 }}>
                                                {s.course?.code}
                                            </span>
                                            <StatusBadge val={s.status} />
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: '#18120e' }}>{s.course?.name}</div>
                                        <div style={{ fontSize: 12, color: '#a8a29e', marginTop: 3 }}>
                                            {s.semester} Sem · {s.school_year}
                                            {s.faculty && <> · <span style={{ color: '#78716c' }}>{s.faculty.first_name} {s.faculty.last_name}</span></>}
                                            {s.curriculum && <> · <span style={{ color: '#a8a29e' }}>Curr: {s.curriculum.code}</span></>}
                                        </div>
                                    </div>
                                    {isOpen ? <ChevronUp size={16} color="#a8a29e" /> : <ChevronDown size={16} color="#a8a29e" />}
                                </div>

                                {isOpen && (
                                    <div style={{ borderTop: '1px solid #f5f5f4', background: '#fafaf9' }}>
                                        {(s.course_description || s.objectives) && (
                                            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f5f5f4' }}>
                                                {s.course_description && <p style={{ fontSize: 13, color: '#44403c', lineHeight: 1.7, marginBottom: s.objectives ? 10 : 0 }}>{s.course_description}</p>}
                                                {s.objectives && <p style={{ fontSize: 13, color: '#78716c', lineHeight: 1.7, fontStyle: 'italic' }}>{s.objectives}</p>}
                                            </div>
                                        )}
                                        <div style={{ padding: '0 0 4px' }}>
                                            <div style={{ padding: '12px 18px 6px', fontSize: 10, fontWeight: 800, color: '#a8a29e', letterSpacing: 1.2 }}>LESSON PLAN</div>
                                            {loadingLessons[s.id] ? <div style={{ padding: '12px 18px', color: '#a8a29e', fontSize: 13 }}>Loading lessons…</div> : (
                                                <div className="table-wrap">
                                                    <table>
                                                        <thead>
                                                            <tr>{['Week', 'Topic', 'Activities', 'Assessment'].map(h => <th key={h}>{h}</th>)}</tr>
                                                        </thead>
                                                        <tbody>
                                                            {(lessons[s.id] ?? []).map(l => (
                                                                <tr key={l.id}>
                                                                    <td style={{ fontWeight: 700, color: '#f97316', width: 56 }}>{l.week_number}</td>
                                                                    <td style={{ fontWeight: 600 }}>{l.topic}</td>
                                                                    <td style={{ color: '#78716c' }}>{l.activities ?? '—'}</td>
                                                                    <td style={{ color: '#78716c' }}>{l.assessment ?? '—'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
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
