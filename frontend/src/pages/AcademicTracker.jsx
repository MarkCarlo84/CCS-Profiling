import { useEffect, useState } from 'react';
import api from '../api';
import { BookOpen, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';

const YEAR_LABELS = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };
const SEM_ORDER   = { '1st': 1, '2nd': 2, 'Summer': 3 };

function gpaColor(gpa) {
    if (!gpa) return '#94a3b8';
    if (gpa <= 1.5)  return '#16a34a';
    if (gpa <= 2.0)  return '#2563eb';
    if (gpa <= 2.75) return '#d97706';
    return '#dc2626';
}

function gpaLabel(gpa) {
    if (!gpa) return '—';
    if (gpa <= 1.25) return 'Excellent';
    if (gpa <= 1.75) return 'Very Good';
    if (gpa <= 2.25) return 'Good';
    if (gpa <= 2.75) return 'Satisfactory';
    if (gpa <= 3.00) return 'Passing';
    return 'Failed';
}

function StatCard({ label, value, color = '#f97316', sub }) {
    return (
        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 14, padding: '16px 20px', flex: 1, minWidth: 120 }}>
            <div style={{ fontSize: '.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color }}>{value}</div>
            {sub && <div style={{ fontSize: '.72rem', color: '#94a3b8', marginTop: 3 }}>{sub}</div>}
        </div>
    );
}

export default function AcademicTracker() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openSem, setOpenSem] = useState(null); // key = `${year_level}-${semester}`

    useEffect(() => {
        api.get('/student/academic-records')
            .then(r => {
                const sorted = [...r.data].sort((a, b) => {
                    if (a.year_level !== b.year_level) return a.year_level - b.year_level;
                    return (SEM_ORDER[a.semester] ?? 9) - (SEM_ORDER[b.semester] ?? 9);
                });
                setRecords(sorted);
                // Auto-open the latest semester
                if (sorted.length) {
                    const last = sorted[sorted.length - 1];
                    setOpenSem(`${last.year_level}-${last.semester}`);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading academic records…</div>;
    if (!records.length) return (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
            <BookOpen size={40} style={{ marginBottom: 12, opacity: .4 }} />
            <p>No academic records found.</p>
        </div>
    );

    // Overall stats
    const allGrades = records.flatMap(r => r.grades ?? []);
    const gradedGrades = allGrades.filter(g => g.score != null);
    const overallGpa = gradedGrades.length
        ? (gradedGrades.reduce((s, g) => s + parseFloat(g.score), 0) / gradedGrades.length).toFixed(2)
        : null;
    const passed  = gradedGrades.filter(g => parseFloat(g.score) <= 3.00).length;
    const failed  = gradedGrades.filter(g => parseFloat(g.score) > 3.00).length;
    const totalUnits = gradedGrades.length; // 1 subject = 1 unit count here

    // Group by year level
    const byYear = records.reduce((acc, r) => {
        const y = r.year_level ?? 0;
        if (!acc[y]) acc[y] = [];
        acc[y].push(r);
        return acc;
    }, {});

    return (
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '24px 16px' }}>

            {/* Page title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#2563eb,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp size={22} color="#fff" />
                </div>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>Academic Tracker</h1>
                    <p style={{ margin: 0, fontSize: '.8rem', color: '#94a3b8' }}>Your semester-by-semester academic performance</p>
                </div>
            </div>

            {/* Summary stats */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
                <StatCard label="Overall GPA"    value={overallGpa ?? '—'} color={gpaColor(parseFloat(overallGpa))} sub={gpaLabel(parseFloat(overallGpa))} />
                <StatCard label="Subjects Taken" value={totalUnits}         color="#1e293b" />
                <StatCard label="Passed"         value={passed}             color="#16a34a" />
                <StatCard label="Failed"         value={failed}             color={failed > 0 ? '#dc2626' : '#94a3b8'} />
                <StatCard label="Semesters"      value={records.length}     color="#7c3aed" />
            </div>

            {/* GPA trend bar */}
            {records.some(r => r.gpa) && (
                <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 14, padding: '16px 20px', marginBottom: 24 }}>
                    <div style={{ fontSize: '.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 14 }}>GPA Trend</div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
                        {records.filter(r => r.gpa).map(r => {
                            const gpa = parseFloat(r.gpa);
                            // GPA scale 1.0–5.0, invert so 1.0 = tallest bar
                            const pct = Math.max(0, Math.min(100, ((5 - gpa) / 4) * 100));
                            return (
                                <div key={`${r.year_level}-${r.semester}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                    <span style={{ fontSize: '.65rem', fontWeight: 700, color: gpaColor(gpa) }}>{gpa}</span>
                                    <div style={{ width: '100%', height: `${pct}%`, minHeight: 8, background: gpaColor(gpa), borderRadius: '4px 4px 0 0', transition: 'height .4s ease' }} />
                                    <span style={{ fontSize: '.6rem', color: '#94a3b8', textAlign: 'center', lineHeight: 1.2 }}>
                                        {YEAR_LABELS[r.year_level]?.replace(' Year','')}<br/>{r.semester}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Records by year */}
            {Object.keys(byYear).sort().map(year => (
                <div key={year} style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: '.72rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ height: 2, width: 18, background: '#2563eb', borderRadius: 2 }} />
                        {YEAR_LABELS[year] ?? `Year ${year}`}
                        <div style={{ height: 2, flex: 1, background: '#dbeafe', borderRadius: 2 }} />
                    </div>

                    {byYear[year].map(rec => {
                        const key = `${rec.year_level}-${rec.semester}`;
                        const isOpen = openSem === key;
                        const semGrades = rec.grades ?? [];
                        const semPassed = semGrades.filter(g => g.score != null && parseFloat(g.score) <= 3.00).length;
                        const semFailed = semGrades.filter(g => g.score != null && parseFloat(g.score) > 3.00).length;

                        return (
                            <div key={rec.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, marginBottom: 10, overflow: 'hidden' }}>
                                {/* Semester header — clickable */}
                                <button
                                    onClick={() => setOpenSem(isOpen ? null : key)}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <BookOpen size={16} color="#2563eb" />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '.9rem', color: '#1e293b' }}>
                                                {rec.school_year} — {rec.semester} Semester
                                            </div>
                                            <div style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: 2 }}>
                                                {semGrades.length} subject{semGrades.length !== 1 ? 's' : ''}
                                                {semPassed > 0 && <span style={{ color: '#16a34a', marginLeft: 8 }}>· {semPassed} passed</span>}
                                                {semFailed > 0 && <span style={{ color: '#dc2626', marginLeft: 8 }}>· {semFailed} failed</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                                        {rec.gpa && (
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: gpaColor(parseFloat(rec.gpa)) }}>{rec.gpa}</div>
                                                <div style={{ fontSize: '.65rem', color: '#94a3b8' }}>GPA</div>
                                            </div>
                                        )}
                                        <span style={{ fontSize: '.8rem', color: '#94a3b8', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s', display: 'inline-block' }}>▾</span>
                                    </div>
                                </button>

                                {/* Grades table */}
                                {isOpen && (
                                    <div style={{ borderTop: '1px solid #f1f5f9', padding: '0 18px 14px' }}>
                                        {semGrades.length === 0 ? (
                                            <p style={{ color: '#94a3b8', fontSize: '.8rem', padding: '12px 0' }}>No grades recorded yet.</p>
                                        ) : (
                                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                                        <th style={{ textAlign: 'left', padding: '6px 8px', fontSize: '.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em' }}>Subject</th>
                                                        <th style={{ textAlign: 'center', padding: '6px 8px', fontSize: '.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em' }}>Grade</th>
                                                        <th style={{ textAlign: 'center', padding: '6px 8px', fontSize: '.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em' }}>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {semGrades.map(g => {
                                                        const score = g.score != null ? parseFloat(g.score) : null;
                                                        const passed = score != null && score <= 3.00;
                                                        return (
                                                            <tr key={g.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                                <td style={{ padding: '9px 8px', fontSize: '.83rem', color: '#1e293b', fontWeight: 500 }}>
                                                                    {g.subject?.subject_name || g.subject_name || '—'}
                                                                    {g.subject?.subject_code && <span style={{ fontSize: '.7rem', color: '#94a3b8', marginLeft: 6 }}>{g.subject.subject_code}</span>}
                                                                </td>
                                                                <td style={{ padding: '9px 8px', textAlign: 'center' }}>
                                                                    {score != null
                                                                        ? <span style={{ fontWeight: 800, fontSize: '.9rem', color: gpaColor(score) }}>{score.toFixed(2)}</span>
                                                                        : <span style={{ color: '#94a3b8', fontSize: '.8rem' }}>—</span>
                                                                    }
                                                                </td>
                                                                <td style={{ padding: '9px 8px', textAlign: 'center' }}>
                                                                    {score == null
                                                                        ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '.72rem', color: '#94a3b8' }}><Clock size={12} /> Pending</span>
                                                                        : passed
                                                                            ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '.72rem', color: '#16a34a', fontWeight: 700 }}><CheckCircle size={12} /> Passed</span>
                                                                            : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '.72rem', color: '#dc2626', fontWeight: 700 }}><XCircle size={12} /> Failed</span>
                                                                    }
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
