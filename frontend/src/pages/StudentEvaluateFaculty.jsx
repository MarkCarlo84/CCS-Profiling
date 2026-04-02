import React, { useState, useEffect } from 'react';
import { getStudentEvaluations, getEvaluableFaculties, submitFacultyEvaluation } from '../api';
import { Star, Users, Plus, X, Check, AlertCircle, ChevronLeft } from 'lucide-react';

const CRITERIA = [
    { key: 'teaching_effectiveness', label: 'Teaching Effectiveness',  desc: 'Clarity of instruction and lesson delivery' },
    { key: 'communication',          label: 'Communication',           desc: 'Ability to explain and listen to students' },
    { key: 'professionalism',        label: 'Professionalism',         desc: 'Punctuality, conduct, and attitude' },
    { key: 'subject_mastery',        label: 'Subject Mastery',         desc: 'Depth of knowledge in the subject' },
    { key: 'student_engagement',     label: 'Student Engagement',      desc: 'Encourages participation and interaction' },
];

const SEMESTERS = ['1st Semester', '2nd Semester', 'Summer'];

function StarRating({ value, onChange }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3, 4, 5].map(n => (
                <button
                    key={n}
                    type="button"
                    onClick={() => onChange(n)}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                >
                    <Star
                        size={26}
                        fill={(hovered || value) >= n ? '#f97316' : 'none'}
                        color={(hovered || value) >= n ? '#f97316' : '#d6d3d1'}
                        strokeWidth={1.5}
                    />
                </button>
            ))}
            {value > 0 && (
                <span style={{ fontSize: '.78rem', color: '#78716c', alignSelf: 'center', marginLeft: 4 }}>
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value]}
                </span>
            )}
        </div>
    );
}

const emptyForm = {
    faculty_id: '',
    teaching_effectiveness: 0,
    communication: 0,
    professionalism: 0,
    subject_mastery: 0,
    student_engagement: 0,
    comments: '',
    school_year: '',
    semester: '',
};

function EvalForm({ faculties, onSubmit, onCancel, saving, error }) {
    const [form, setForm] = useState(emptyForm);
    const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

    const allRated = CRITERIA.every(c => form[c.key] > 0);
    const avg = allRated
        ? (CRITERIA.reduce((s, c) => s + form[c.key], 0) / CRITERIA.length).toFixed(2)
        : null;

    return (
        <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Faculty + period */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                    <label style={s.label}>Faculty to Evaluate <span style={{ color: '#dc2626' }}>*</span></label>
                    <select required value={form.faculty_id} onChange={e => set('faculty_id', e.target.value)} style={s.input}>
                        <option value="">— Select Faculty —</option>
                        {faculties.map(f => (
                            <option key={f.id} value={f.id} disabled={f.already_evaluated}>
                                {f.last_name}, {f.first_name} — {f.department || 'No Dept'}
                                {f.already_evaluated ? ' (already evaluated)' : ''}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={s.label}>School Year</label>
                    <input value={form.school_year} onChange={e => set('school_year', e.target.value)} placeholder="e.g. 2024-2025" style={s.input} />
                </div>
                <div>
                    <label style={s.label}>Semester</label>
                    <select value={form.semester} onChange={e => set('semester', e.target.value)} style={s.input}>
                        <option value="">— Select —</option>
                        {SEMESTERS.map(sem => <option key={sem} value={sem}>{sem}</option>)}
                    </select>
                </div>
            </div>

            {/* Rating criteria */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontWeight: 700, fontSize: '.85rem', color: '#44403c' }}>Rate each category (1 = Poor, 5 = Excellent)</div>
                {CRITERIA.map(c => (
                    <div key={c.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#fafaf9', borderRadius: 10, border: '1px solid #e7e5e4' }}>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '.875rem', color: '#1c1917' }}>{c.label}</div>
                            <div style={{ fontSize: '.75rem', color: '#78716c' }}>{c.desc}</div>
                        </div>
                        <StarRating value={form[c.key]} onChange={v => set(c.key, v)} />
                    </div>
                ))}
            </div>

            {/* Average preview */}
            {avg && (
                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Star size={16} fill="#f97316" color="#f97316" />
                    <span style={{ fontSize: '.875rem', color: '#ea580c', fontWeight: 700 }}>Overall Average: {avg} / 5.00</span>
                </div>
            )}

            {/* Comments */}
            <div>
                <label style={s.label}>Additional Comments</label>
                <textarea
                    value={form.comments}
                    onChange={e => set('comments', e.target.value)}
                    placeholder="Optional — share any additional feedback..."
                    rows={4}
                    style={{ ...s.input, resize: 'vertical', lineHeight: 1.6 }}
                />
            </div>

            {error && <div style={s.errorBox}><AlertCircle size={14} /><span>{error}</span></div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving || !allRated || !form.faculty_id}>
                    <Check size={14} /> {saving ? 'Submitting…' : 'Submit Evaluation'}
                </button>
            </div>
        </form>
    );
}

export default function StudentEvaluateFaculty() {
    const [evaluations, setEvaluations] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list' | 'new'
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const load = () => {
        setLoading(true);
        Promise.all([getStudentEvaluations(), getEvaluableFaculties()])
            .then(([evRes, facRes]) => {
                setEvaluations(evRes.data);
                setFaculties(facRes.data);
            })
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const handleSubmit = async (form) => {
        setSaving(true);
        setError('');
        try {
            await submitFacultyEvaluation(form);
            setView('list');
            load();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit evaluation.');
        } finally {
            setSaving(false);
        }
    };

    const ratingColor = (r) => {
        if (r >= 4.5) return '#16a34a';
        if (r >= 3.5) return '#2563eb';
        if (r >= 2.5) return '#d97706';
        return '#dc2626';
    };

    if (view === 'new') {
        return (
            <div>
                <div className="page-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button className="btn btn-outline" onClick={() => setView('list')}><ChevronLeft size={15} /> Back</button>
                        <div>
                            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>Evaluate Faculty</h1>
                            <p style={{ color: '#78716c', margin: 0, fontSize: '.875rem' }}>Rate your faculty member honestly</p>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body">
                        <EvalForm
                            faculties={faculties}
                            onSubmit={handleSubmit}
                            onCancel={() => setView('list')}
                            saving={saving}
                            error={error}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <div className="table-page-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={s.iconWrap}><Star size={22} color="#f97316" /></div>
                        <div>
                            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>Faculty Evaluation</h1>
                            <p style={{ color: '#78716c', margin: 0, fontSize: '.875rem' }}>
                                {evaluations.length} evaluation{evaluations.length !== 1 ? 's' : ''} submitted
                            </p>
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={() => { setError(''); setView('new'); }}>
                        <Plus size={15} /> Evaluate Faculty
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading"><div className="loading-spinner" /><p>Loading…</p></div>
            ) : evaluations.length === 0 ? (
                <div className="empty">
                    <Star size={40} color="#fed7aa" />
                    <p style={{ marginTop: 10 }}>No evaluations yet. Rate your faculty!</p>
                    <button className="btn btn-primary" onClick={() => setView('new')} style={{ marginTop: 8 }}>
                        <Plus size={14} /> Evaluate Faculty
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                    {evaluations.map(ev => {
                        const f = ev.faculty;
                        const avg = ev.average_rating;
                        return (
                            <div key={ev.id} className="card">
                                <div className="card-body">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '.95rem', color: '#1c1917' }}>
                                                {f ? `${f.first_name} ${f.last_name}` : '—'}
                                            </div>
                                            <div style={{ fontSize: '.78rem', color: '#78716c' }}>{f?.department} — {f?.position}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: ratingColor(avg) }}>{avg}</div>
                                            <div style={{ fontSize: '.7rem', color: '#78716c' }}>/ 5.00</div>
                                        </div>
                                    </div>

                                    {/* Per-category bars */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {CRITERIA.map(c => (
                                            <div key={c.key}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.72rem', color: '#78716c', marginBottom: 2 }}>
                                                    <span>{c.label}</span>
                                                    <span style={{ fontWeight: 700, color: '#44403c' }}>{ev[c.key]}/5</span>
                                                </div>
                                                <div style={{ height: 5, background: '#f5f5f4', borderRadius: 99 }}>
                                                    <div style={{ height: '100%', width: `${(ev[c.key] / 5) * 100}%`, background: '#f97316', borderRadius: 99, transition: 'width .4s' }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {ev.comments && (
                                        <div style={{ marginTop: 10, fontSize: '.8rem', color: '#78716c', fontStyle: 'italic', borderTop: '1px solid #f5f5f4', paddingTop: 8 }}>
                                            "{ev.comments}"
                                        </div>
                                    )}
                                    <div style={{ marginTop: 8, fontSize: '.72rem', color: '#a8a29e' }}>
                                        {ev.school_year}{ev.semester ? ` · ${ev.semester}` : ''}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

const s = {
    iconWrap: { width: 44, height: 44, borderRadius: 12, background: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    label: { display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#44403c', marginBottom: 5 },
    input: { width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid #e7e5e4', fontSize: '.875rem', color: '#1c1917', boxSizing: 'border-box', fontFamily: "'Inter',sans-serif" },
    errorBox: { display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', color: '#dc2626', fontSize: '.82rem' },
};
