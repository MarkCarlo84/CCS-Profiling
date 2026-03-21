import React, { useState, useEffect } from 'react';
import { getAdminFacultyEvaluationSummary, getAdminFacultyEvaluations } from '../api';
import { Star, Users, ChevronLeft } from 'lucide-react';

const CRITERIA = [
    { key: 'teaching_effectiveness', label: 'Teaching' },
    { key: 'communication',          label: 'Communication' },
    { key: 'professionalism',        label: 'Professionalism' },
    { key: 'subject_mastery',        label: 'Subject Mastery' },
    { key: 'student_engagement',     label: 'Engagement' },
];

const ratingColor = (r) => {
    if (!r) return '#a8a29e';
    if (r >= 4.5) return '#16a34a';
    if (r >= 3.5) return '#2563eb';
    if (r >= 2.5) return '#d97706';
    return '#dc2626';
};

function DetailView({ faculty, evaluations, onBack }) {
    const evals = evaluations.filter(e => e.faculty_id === faculty.id);
    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button className="btn btn-outline" onClick={onBack}><ChevronLeft size={15} /> Back</button>
                    <div>
                        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>
                            {faculty.first_name} {faculty.last_name}
                        </h1>
                        <p style={{ color: '#78716c', margin: 0, fontSize: '.875rem' }}>
                            {faculty.department} — {evals.length} evaluation{evals.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {evals.length === 0 ? (
                    <div className="empty"><Star size={36} color="#fed7aa" /><p style={{ marginTop: 8 }}>No evaluations yet.</p></div>
                ) : evals.map(ev => (
                    <div key={ev.id} className="card">
                        <div className="card-body">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '.875rem', color: '#1c1917' }}>
                                        {ev.student ? `${ev.student.first_name} ${ev.student.last_name}` : 'Anonymous'}
                                        {ev.student?.student_id ? ` (${ev.student.student_id})` : ''}
                                    </div>
                                    <div style={{ fontSize: '.75rem', color: '#78716c' }}>
                                        {ev.school_year}{ev.semester ? ` · ${ev.semester}` : ''}
                                    </div>
                                </div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: ratingColor(ev.average_rating) }}>
                                    {ev.average_rating} <span style={{ fontSize: '.7rem', color: '#78716c', fontWeight: 400 }}>/ 5</span>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
                                {CRITERIA.map(c => (
                                    <div key={c.key} style={{ fontSize: '.78rem' }}>
                                        <div style={{ color: '#78716c', marginBottom: 2 }}>{c.label}</div>
                                        <div style={{ height: 5, background: '#f5f5f4', borderRadius: 99 }}>
                                            <div style={{ height: '100%', width: `${(ev[c.key] / 5) * 100}%`, background: '#f97316', borderRadius: 99 }} />
                                        </div>
                                        <div style={{ fontWeight: 700, color: '#44403c', marginTop: 2 }}>{ev[c.key]}/5</div>
                                    </div>
                                ))}
                            </div>
                            {ev.comments && (
                                <div style={{ marginTop: 10, fontSize: '.8rem', color: '#78716c', fontStyle: 'italic', borderTop: '1px solid #f5f5f4', paddingTop: 8 }}>
                                    "{ev.comments}"
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function AdminFacultyEvaluations() {
    const [summary, setSummary] = useState([]);
    const [allEvals, setAllEvals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        Promise.all([getAdminFacultyEvaluationSummary(), getAdminFacultyEvaluations()])
            .then(([sRes, eRes]) => { setSummary(sRes.data); setAllEvals(eRes.data); })
            .finally(() => setLoading(false));
    }, []);

    if (selected) {
        return <DetailView faculty={selected} evaluations={allEvals} onBack={() => setSelected(null)} />;
    }

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={s.iconWrap}><Star size={22} color="#f97316" /></div>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>Faculty Evaluations</h1>
                        <p style={{ color: '#78716c', margin: 0, fontSize: '.875rem' }}>Student ratings per faculty member</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading"><div className="loading-spinner" /><p>Loading…</p></div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {summary.map(f => (
                        <div key={f.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelected(f)}>
                            <div className="card-body">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '.95rem', color: '#1c1917' }}>
                                            {f.first_name} {f.last_name}
                                        </div>
                                        <div style={{ fontSize: '.78rem', color: '#78716c' }}>{f.department} — {f.position}</div>
                                        <div style={{ fontSize: '.72rem', color: '#a8a29e', marginTop: 2 }}>
                                            {f.evaluation_count} evaluation{f.evaluation_count !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        {f.average_rating ? (
                                            <>
                                                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: ratingColor(f.average_rating), lineHeight: 1 }}>
                                                    {f.average_rating}
                                                </div>
                                                <div style={{ fontSize: '.7rem', color: '#78716c' }}>/ 5.00</div>
                                            </>
                                        ) : (
                                            <div style={{ fontSize: '.78rem', color: '#a8a29e' }}>No ratings</div>
                                        )}
                                    </div>
                                </div>
                                {f.average_rating && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                        {CRITERIA.map(c => (
                                            <div key={c.key}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.7rem', color: '#78716c', marginBottom: 2 }}>
                                                    <span>{c.label}</span>
                                                    <span style={{ fontWeight: 700, color: '#44403c' }}>{f[c.key] ?? '—'}</span>
                                                </div>
                                                <div style={{ height: 4, background: '#f5f5f4', borderRadius: 99 }}>
                                                    <div style={{ height: '100%', width: `${((f[c.key] ?? 0) / 5) * 100}%`, background: '#f97316', borderRadius: 99 }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const s = {
    iconWrap: { width: 44, height: 44, borderRadius: 12, background: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};
