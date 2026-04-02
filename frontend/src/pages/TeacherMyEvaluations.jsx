import React, { useState, useEffect } from 'react';
import { getMyEvaluations } from '../api';
import { Star, ShieldCheck } from 'lucide-react';

const CRITERIA = [
    { key: 'teaching_effectiveness', label: 'Teaching Effectiveness' },
    { key: 'communication',          label: 'Communication' },
    { key: 'professionalism',        label: 'Professionalism' },
    { key: 'subject_mastery',        label: 'Subject Mastery' },
    { key: 'student_engagement',     label: 'Student Engagement' },
];

const ratingColor = (r) => {
    if (!r) return '#a8a29e';
    if (r >= 4.5) return '#16a34a';
    if (r >= 3.5) return '#2563eb';
    if (r >= 2.5) return '#d97706';
    return '#dc2626';
};

const ratingLabel = (r) => {
    if (!r) return '—';
    if (r >= 4.5) return 'Excellent';
    if (r >= 3.5) return 'Very Good';
    if (r >= 2.5) return 'Good';
    if (r >= 1.5) return 'Fair';
    return 'Poor';
};

export default function TeacherMyEvaluations() {
    const [evals, setEvals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyEvaluations().then(r => setEvals(r.data)).finally(() => setLoading(false));
    }, []);

    // Compute overall averages across all evaluations
    const summary = CRITERIA.reduce((acc, c) => {
        const vals = evals.map(e => e[c.key]).filter(Boolean);
        acc[c.key] = vals.length ? (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(2) : null;
        return acc;
    }, {});
    const overallAvg = evals.length
        ? (evals.reduce((s, e) => s + e.average_rating, 0) / evals.length).toFixed(2)
        : null;

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={s.iconWrap}><Star size={22} color="#f97316" /></div>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>My Evaluations</h1>
                        <p style={{ color: '#78716c', margin: 0, fontSize: '.875rem' }}>
                            {evals.length} evaluation{evals.length !== 1 ? 's' : ''} received from students
                        </p>
                    </div>
                </div>
            </div>

            {/* Anonymity notice */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
                <ShieldCheck size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '.82rem', color: '#166534' }}>
                    All evaluations are <strong>fully anonymous</strong>. Student identities are never disclosed to protect confidentiality.
                </p>
            </div>

            {loading ? (
                <div className="loading"><div className="loading-spinner" /><p>Loading…</p></div>
            ) : evals.length === 0 ? (
                <div className="empty">
                    <Star size={40} color="#fed7aa" />
                    <p style={{ marginTop: 10 }}>No evaluations received yet.</p>
                </div>
            ) : (
                <>
                    {/* Overall summary card */}
                    <div className="card" style={{ marginBottom: 20 }}>
                        <div className="card-header" style={{ background: 'linear-gradient(135deg,#ea580c,#f97316)', color: '#fff' }}>
                            <h2 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Star size={16} /> Overall Summary
                            </h2>
                            <span style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.8)' }}>Based on {evals.length} response{evals.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}>
                                <div style={{ textAlign: 'center', minWidth: 80 }}>
                                    <div style={{ fontSize: '3rem', fontWeight: 900, color: ratingColor(overallAvg), lineHeight: 1 }}>{overallAvg}</div>
                                    <div style={{ fontSize: '.78rem', color: '#78716c', marginTop: 4 }}>Overall Average</div>
                                    <div style={{ fontSize: '.85rem', fontWeight: 700, color: ratingColor(overallAvg) }}>{ratingLabel(parseFloat(overallAvg))}</div>
                                </div>
                                <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {CRITERIA.map(c => (
                                        <div key={c.key}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.78rem', marginBottom: 3 }}>
                                                <span style={{ color: '#44403c', fontWeight: 600 }}>{c.label}</span>
                                                <span style={{ fontWeight: 800, color: ratingColor(summary[c.key]) }}>
                                                    {summary[c.key] ?? '—'} / 5
                                                </span>
                                            </div>
                                            <div style={{ height: 8, background: '#f5f5f4', borderRadius: 99 }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${((summary[c.key] ?? 0) / 5) * 100}%`,
                                                    background: `linear-gradient(90deg, #ea580c, #f97316)`,
                                                    borderRadius: 99,
                                                    transition: 'width .5s ease',
                                                }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Individual evaluations */}
                    <div className="section-divider"><h2>Individual Responses</h2></div>
                    <div className="dashboard-cards-grid" style={{ gap: 14 }}>
                        {evals.map((ev, i) => (
                            <div key={ev.id} className="card">
                                <div className="card-body">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <div style={{ fontSize: '.75rem', color: '#a8a29e', fontWeight: 600 }}>
                                            Response #{i + 1}
                                            {ev.school_year ? ` · ${ev.school_year}` : ''}
                                            {ev.semester ? ` · ${ev.semester}` : ''}
                                        </div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: ratingColor(ev.average_rating) }}>
                                            {ev.average_rating}
                                            <span style={{ fontSize: '.65rem', color: '#78716c', fontWeight: 400 }}> /5</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {CRITERIA.map(c => (
                                            <div key={c.key}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.72rem', color: '#78716c', marginBottom: 2 }}>
                                                    <span>{c.label}</span>
                                                    <span style={{ fontWeight: 700, color: '#44403c' }}>{ev[c.key]}/5</span>
                                                </div>
                                                <div style={{ height: 5, background: '#f5f5f4', borderRadius: 99 }}>
                                                    <div style={{ height: '100%', width: `${(ev[c.key] / 5) * 100}%`, background: '#f97316', borderRadius: 99 }} />
                                                </div>
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
                </>
            )}
        </div>
    );
}

const s = {
    iconWrap: { width: 44, height: 44, borderRadius: 12, background: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};
