import React, { useEffect, useState } from 'react';
import api from '../api';
import { useActivePeriod } from '../useActivePeriod';
import { BookOpen } from 'lucide-react';

const card = {
    background: '#fff', borderRadius: 14, border: '1px solid #ddd6fe',
    overflow: 'hidden', boxShadow: '0 2px 8px rgba(139,92,246,.05)',
};
const th = {
    padding: '9px 16px', textAlign: 'left', fontSize: '.72rem',
    fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase',
    letterSpacing: '.06em', background: '#f5f3ff',
};
const td = { padding: '11px 16px', fontSize: '.875rem', color: '#44403c', borderTop: '1px solid #ede9fe' };

export default function TeacherMySubjects() {
    const { period, loading: periodLoading } = useActivePeriod();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (periodLoading) return;
        setLoading(true);
        const params = {};
        if (period?.school_year) params.school_year = period.school_year;
        if (period?.semester)    params.semester    = period.semester;

        api.get('/teacher/my-subjects', { params })
            .then(r => setSubjects(r.data))
            .catch(() => setSubjects([]))
            .finally(() => setLoading(false));
    }, [period, periodLoading]);

    const grouped = subjects.reduce((acc, s) => {
        const prog = s.program ?? 'Other';
        if (!acc[prog]) acc[prog] = [];
        acc[prog].push(s);
        return acc;
    }, {});

    const semLabel = s => s === '1st' ? '1st Semester' : s === '2nd' ? '2nd Semester' : s;

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <div className="page-icon"><BookOpen size={22} color="#8b5cf6" strokeWidth={1.8} /></div>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', color: '#18120e', fontWeight: 800, letterSpacing: '-.02em', margin: 0 }}>My Assigned Subjects</h1>
                        <p style={{ color: '#78716c', fontSize: '.86rem', marginTop: 2 }}>Subjects assigned to you for the current semester</p>
                    </div>
                </div>
            </div>

            {/* Active period badge */}
            {period && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 999, padding: '5px 14px', fontSize: '.82rem', color: '#5b21b6', fontWeight: 600, marginBottom: 20 }}>
                    {period.school_year} — {semLabel(period.semester)}
                </div>
            )}

            {loading ? (
                <div className="loading"><div className="loading-spinner" /><span>Loading subjects…</span></div>
            ) : subjects.length === 0 ? (
                <div style={{ ...card, padding: '40px 20px', textAlign: 'center', color: '#a8a29e', fontSize: '.9rem' }}>
                    No subjects assigned to you for this period yet.
                </div>
            ) : (
                Object.entries(grouped).map(([program, items]) => (
                    <div key={program} style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: '.75rem', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>
                            {program}
                        </div>
                        <div style={card}>
                            {/* Tablet: scrollable table */}
                            <div className="subjects-table-wrap" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
                                    <thead>
                                        <tr>
                                            <th style={{ ...th, width: 36 }}>#</th>
                                            <th style={{ ...th, width: '14%' }}>Code</th>
                                            <th style={th}>Subject Name</th>
                                            <th style={{ ...th, width: 70, textAlign: 'center' }}>Units</th>
                                            <th style={{ ...th, width: '14%' }}>Year Level</th>
                                            <th style={{ ...th, width: '18%' }}>Pre-Requisite</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((s, idx) => (
                                            <tr key={s.id} style={{ background: idx % 2 === 0 ? '#fff' : '#faf5ff' }}>
                                                <td style={{ ...td, color: '#a8a29e', fontSize: '.78rem', textAlign: 'center' }}>{idx + 1}</td>
                                                <td style={td}><strong style={{ color: '#1c1917' }}>{s.subject_code}</strong></td>
                                                <td style={{ ...td, fontWeight: 500, color: '#1c1917' }}>{s.subject_name}</td>
                                                <td style={{ ...td, textAlign: 'center' }}>
                                                    <span style={{ display: 'inline-block', fontWeight: 700, fontSize: '.8rem', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 6, padding: '2px 10px' }}>
                                                        {s.units}
                                                    </span>
                                                </td>
                                                <td style={td}>{s.year_level ?? '—'}</td>
                                                <td style={{ ...td, color: s.pre_requisite ? '#44403c' : '#a8a29e', fontStyle: s.pre_requisite ? 'normal' : 'italic', fontSize: '.82rem' }}>
                                                    {s.pre_requisite || 'none'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile: card list */}
                            <div className="subjects-card-list">
                                {items.map((s, idx) => (
                                    <div key={s.id} style={{
                                        padding: '12px 14px',
                                        borderTop: idx > 0 ? '1px solid #ede9fe' : 'none',
                                        background: idx % 2 === 0 ? '#fff' : '#faf5ff',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                                                    <strong style={{ color: '#8b5cf6', fontSize: '.82rem', fontFamily: 'monospace' }}>{s.subject_code}</strong>
                                                    <span style={{ fontWeight: 700, fontSize: '.75rem', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 6, padding: '1px 8px' }}>
                                                        {s.units} units
                                                    </span>
                                                    {s.year_level && (
                                                        <span style={{ fontSize: '.72rem', color: '#8b5cf6', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 6, padding: '1px 7px', fontWeight: 600 }}>
                                                            {s.year_level}
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ fontWeight: 600, fontSize: '.875rem', color: '#1c1917', marginBottom: 3 }}>{s.subject_name}</div>
                                                {s.pre_requisite && (
                                                    <div style={{ fontSize: '.75rem', color: '#78716c' }}>
                                                        Pre-req: <span style={{ color: '#44403c', fontWeight: 500 }}>{s.pre_requisite}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
