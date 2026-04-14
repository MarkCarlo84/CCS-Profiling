import React, { useEffect, useState } from 'react';
import api from '../api';
import { useActivePeriod } from '../useActivePeriod';
import { UserCheck, Plus, Trash2, ChevronDown, ChevronUp, Search } from 'lucide-react';

const card = {
    background: '#fff', borderRadius: 14, border: '1px solid #fde8d0',
    overflow: 'hidden', marginBottom: 12, boxShadow: '0 2px 8px rgba(249,115,22,.05)',
};
const th = {
    padding: '9px 14px', textAlign: 'left', fontSize: '.72rem',
    fontWeight: 700, color: '#f97316', textTransform: 'uppercase',
    letterSpacing: '.06em', background: '#fff7ed',
};
const td = { padding: '10px 14px', fontSize: '.875rem', color: '#44403c', borderTop: '1px solid #fde8d0' };
const inputStyle = {
    padding: '8px 12px', borderRadius: 8, border: '1px solid #fde8d0',
    fontSize: '.875rem', fontFamily: "'Inter',sans-serif", color: '#1c1917',
    outline: 'none', width: '100%', boxSizing: 'border-box',
};
const btn = (bg = '#f97316') => ({
    padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
    background: bg, color: '#fff', fontWeight: 700, fontSize: '.82rem',
    fontFamily: "'Inter',sans-serif", display: 'flex', alignItems: 'center', gap: 6,
});

export default function FacultySubjectAssignment() {
    const { period } = useActivePeriod();

    const [faculties, setFaculties] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [assignments, setAssignments] = useState({}); // { faculty_id: [subjects] }
    const [expanded, setExpanded] = useState(null);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    // Modal state
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState({ faculty_id: '', subject_id: '', school_year: '', semester: '', section: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [subjectSearch, setSubjectSearch] = useState('');
    const [subjectDropdown, setSubjectDropdown] = useState(false);

    const uniqueSubjects = subjects.filter((s, i, arr) => arr.findIndex(x => x.id === s.id) === i);

    const filteredSubjects = subjectSearch.trim()
        ? uniqueSubjects.filter(s =>
            s.subject_code.toLowerCase().includes(subjectSearch.toLowerCase()) ||
            s.subject_name.toLowerCase().includes(subjectSearch.toLowerCase())
          )
        : uniqueSubjects;

    const selectedSubject = uniqueSubjects.find(s => String(s.id) === String(form.subject_id));
    const schoolYear = period?.school_year ?? '';
    const semester   = period?.semester ?? '';

    useEffect(() => {
        Promise.all([
            api.get('/faculties'),
            api.get('/subjects'),
        ]).then(([fRes, sRes]) => {
            setFaculties(fRes.data);
            setSubjects(sRes.data);
        }).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!schoolYear || !semester) return;
        // Load assignments for all faculties for the active period
        api.get('/admin/faculty-subjects', { params: { school_year: schoolYear, semester } })
            .then(res => {
                const map = {};
                res.data.forEach(f => { map[f.id] = f.subjects ?? []; });
                setAssignments(map);
            });
    }, [schoolYear, semester]);

    const openModal = (facultyId = '') => {
        setForm({ faculty_id: facultyId, subject_id: '', school_year: schoolYear, semester, section: '' });
        setSubjectSearch('');
        setSubjectDropdown(false);
        setError('');
        setModal(true);
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await api.post('/admin/faculty-subjects', form);
            setSuccess('Subject assigned successfully.');
            setTimeout(() => setSuccess(''), 3000);
            setModal(false);
            // Refresh assignments
            const res = await api.get('/admin/faculty-subjects', { params: { school_year: schoolYear, semester } });
            const map = {};
            res.data.forEach(f => { map[f.id] = f.subjects ?? []; });
            setAssignments(map);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign subject.');
        }
        setSaving(false);
    };

    const handleRemove = async (faculty, subject) => {
        if (!window.confirm(`Remove "${subject.subject_name}" from ${faculty.first_name} ${faculty.last_name}?`)) return;
        try {
            await api.delete(`/admin/faculty-subjects/${faculty.id}/${subject.id}`, {
                params: { school_year: schoolYear, semester },
            });
            setAssignments(prev => ({
                ...prev,
                [faculty.id]: (prev[faculty.id] ?? []).filter(s => s.id !== subject.id),
            }));
        } catch {
            alert('Failed to remove assignment.');
        }
    };

    const filtered = faculties.filter(f =>
        `${f.first_name} ${f.last_name} ${f.faculty_id}`.toLowerCase().includes(search.toLowerCase())
    );

    const PAGE_SIZE = 10;
    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // Reset to page 1 when search changes
    useEffect(() => { setPage(1); }, [search]);

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <div className="page-icon"><UserCheck size={22} color="#f97316" strokeWidth={1.8} /></div>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', color: '#18120e', fontWeight: 800, letterSpacing: '-.02em', margin: 0 }}>Faculty Subject Assignment</h1>
                        <p style={{ color: '#78716c', fontSize: '.86rem', marginTop: 2 }}>Assign subjects to faculty members per semester</p>
                    </div>
                </div>
            </div>

            {/* Active period badge */}
            {period && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 999, padding: '5px 14px', fontSize: '.82rem', color: '#92400e', fontWeight: 600, marginBottom: 18 }}>
                    {period.school_year} — {period.semester === '1st' ? '1st Semester' : '2nd Semester'}
                </div>
            )}

            {success && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 16px', marginBottom: 14, color: '#16a34a', fontSize: '.85rem' }}>
                    {success}
                </div>
            )}

            {/* Toolbar */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
                    <Search size={14} color="#a8a29e" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                    <input style={{ ...inputStyle, paddingLeft: 32 }} placeholder="Search faculty…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button style={btn()} onClick={() => openModal()}>
                    <Plus size={14} /> Assign Subject
                </button>
            </div>

            {loading ? (
                <div className="loading"><div className="loading-spinner" /><span>Loading…</span></div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#a8a29e', padding: 40 }}>No faculty found.</div>
            ) : (
                <>
                    {paginated.map(faculty => {
                const assigned = assignments[faculty.id] ?? [];
                const isOpen = expanded === faculty.id;
                return (
                    <div key={faculty.id} style={card}>
                        {/* Faculty row header */}
                        <div
                            onClick={() => setExpanded(isOpen ? null : faculty.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer', userSelect: 'none' }}
                        >
                            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#f97316,#ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ color: '#fff', fontWeight: 800, fontSize: '.85rem' }}>
                                    {faculty.first_name[0]}{faculty.last_name[0]}
                                </span>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '.95rem', color: '#1c1917' }}>
                                    {faculty.last_name}, {faculty.first_name}
                                </div>
                                <div style={{ fontSize: '.78rem', color: '#78716c' }}>
                                    {faculty.faculty_id} · {faculty.department} · {faculty.position}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ padding: '2px 12px', borderRadius: 999, background: assigned.length ? '#fff7ed' : '#f5f5f4', border: `1px solid ${assigned.length ? '#fed7aa' : '#e7e5e4'}`, fontSize: '.75rem', fontWeight: 700, color: assigned.length ? '#f97316' : '#a8a29e' }}>
                                    {assigned.length} subject{assigned.length !== 1 ? 's' : ''}
                                </span>
                                <button
                                    onClick={e => { e.stopPropagation(); openModal(faculty.id); }}
                                    style={{ ...btn('#f97316'), padding: '5px 12px', fontSize: '.75rem' }}
                                >
                                    <Plus size={12} /> Add
                                </button>
                                {isOpen ? <ChevronUp size={16} color="#a8a29e" /> : <ChevronDown size={16} color="#a8a29e" />}
                            </div>
                        </div>

                        {/* Assigned subjects table */}
                        {isOpen && (
                            <div style={{ borderTop: '1px solid #fde8d0' }}>
                                {assigned.length === 0 ? (
                                    <div style={{ padding: '16px 18px', color: '#a8a29e', fontSize: '.85rem', textAlign: 'center' }}>
                                        No subjects assigned for this period yet.
                                    </div>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                <th style={th}>Code</th>
                                                <th style={th}>Subject Name</th>
                                                <th style={th}>Units</th>
                                                <th style={th}>Year Level</th>
                                                <th style={th}>Program</th>
                                                <th style={th}>Section</th>
                                                <th style={{ ...th, textAlign: 'center' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {assigned.map(s => (
                                                <tr key={s.id}>
                                                    <td style={td}><strong>{s.subject_code}</strong></td>
                                                    <td style={td}>{s.subject_name}</td>
                                                    <td style={{ ...td, textAlign: 'center' }}>
                                                        <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 6, padding: '1px 10px', fontWeight: 700, fontSize: '.8rem' }}>{s.units}</span>
                                                    </td>
                                                    <td style={td}>{s.year_level ?? '—'}</td>
                                                    <td style={td}>{s.program ?? '—'}</td>
                                                    <td style={td}>
                                                        {s.pivot?.section
                                                            ? <span style={{ fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: '#fff7ed', color: '#f97316', border: '1px solid #fed7aa', fontSize: '.75rem' }}>{s.pivot.section}</span>
                                                            : <span style={{ color: '#a8a29e', fontSize: '.78rem' }}>—</span>}
                                                    </td>
                                                    <td style={{ ...td, textAlign: 'center' }}>
                                                        <button onClick={() => handleRemove(faculty, s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', gap: 4, margin: '0 auto', fontSize: '.78rem', fontWeight: 600 }}>
                                                            <Trash2 size={13} /> Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

                    {totalPages > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 8, marginBottom: 4 }}>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                style={{ padding: '6px 16px', borderRadius: 8, border: '1.5px solid #fde8d0', background: page === 1 ? '#fff7ed' : '#fff', color: page === 1 ? '#a8a29e' : '#f97316', fontWeight: 700, fontSize: 13, cursor: page === 1 ? 'default' : 'pointer' }}
                            >← Prev</button>
                            <span style={{ fontSize: 13, color: '#78716c', fontWeight: 600 }}>
                                Page {page} of {totalPages} · {filtered.length} faculty
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                style={{ padding: '6px 16px', borderRadius: 8, border: '1.5px solid #fde8d0', background: page === totalPages ? '#fff7ed' : '#fff', color: page === totalPages ? '#a8a29e' : '#f97316', fontWeight: 700, fontSize: 13, cursor: page === totalPages ? 'default' : 'pointer' }}
                            >Next →</button>
                        </div>
                    )}
                </>
            )}

            {/* Assign Modal */}
            {modal && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
                    onClick={() => setSubjectDropdown(false)}
                >
                    <div style={{ background: '#fff', borderRadius: 18, padding: '28px 32px', width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ margin: '0 0 20px', fontSize: '1.1rem', fontWeight: 800, color: '#1c1917' }}>Assign Subject to Faculty</h2>
                        <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#78716c', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.05em' }}>Faculty</label>
                                <select required style={inputStyle} value={form.faculty_id} onChange={e => setForm(p => ({ ...p, faculty_id: e.target.value }))}>
                                    <option value="">— Select Faculty —</option>
                                    {faculties.map(f => (
                                        <option key={f.id} value={f.id}>{f.last_name}, {f.first_name} ({f.department})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#78716c', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.05em' }}>Subject</label>
                                <div style={{ position: 'relative' }}>
                                    <div
                                        onClick={() => setSubjectDropdown(p => !p)}
                                        style={{ ...inputStyle, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}
                                    >
                                        <span style={{ color: selectedSubject ? '#1c1917' : '#a8a29e' }}>
                                            {selectedSubject ? `${selectedSubject.subject_code} — ${selectedSubject.subject_name}` : '— Select Subject —'}
                                        </span>
                                        <ChevronDown size={15} color="#a8a29e" />
                                    </div>
                                    {subjectDropdown && (
                                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: '#fff', border: '1px solid #fde8d0', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,.12)', marginTop: 4, overflow: 'hidden' }}>
                                            <div style={{ padding: '8px 10px', borderBottom: '1px solid #fde8d0' }}>
                                                <input
                                                    autoFocus
                                                    style={{ ...inputStyle, padding: '6px 10px', fontSize: '.82rem' }}
                                                    placeholder="Search subject…"
                                                    value={subjectSearch}
                                                    onChange={e => setSubjectSearch(e.target.value)}
                                                    onClick={e => e.stopPropagation()}
                                                />
                                            </div>
                                            <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                                                {filteredSubjects.length === 0 ? (
                                                    <div style={{ padding: '10px 14px', color: '#a8a29e', fontSize: '.82rem' }}>No subjects found.</div>
                                                ) : filteredSubjects.map(s => (
                                                    <div
                                                        key={s.id}
                                                        onClick={() => { setForm(p => ({ ...p, subject_id: s.id })); setSubjectDropdown(false); setSubjectSearch(''); }}
                                                        style={{
                                                            padding: '9px 14px', cursor: 'pointer', fontSize: '.85rem',
                                                            background: String(form.subject_id) === String(s.id) ? '#fff7ed' : '#fff',
                                                            color: String(form.subject_id) === String(s.id) ? '#f97316' : '#1c1917',
                                                            fontWeight: String(form.subject_id) === String(s.id) ? 700 : 400,
                                                            borderBottom: '1px solid #fafaf9',
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background = '#fff7ed'}
                                                        onMouseLeave={e => e.currentTarget.style.background = String(form.subject_id) === String(s.id) ? '#fff7ed' : '#fff'}
                                                    >
                                                        <span style={{ fontWeight: 700, marginRight: 6 }}>{s.subject_code}</span>
                                                        <span style={{ color: '#78716c' }}>{s.subject_name}</span>
                                                        {s.program && <span style={{ marginLeft: 6, fontSize: '.72rem', color: '#a8a29e' }}>({s.program})</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {/* hidden input for form validation */}
                                <input type="text" required style={{ opacity: 0, height: 0, position: 'absolute' }} value={form.subject_id} onChange={() => {}} tabIndex={-1} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#78716c', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.05em' }}>School Year</label>
                                    <input required style={inputStyle} value={form.school_year} onChange={e => setForm(p => ({ ...p, school_year: e.target.value }))} placeholder="e.g. 2025-2026" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#78716c', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.05em' }}>Semester</label>
                                    <select required style={inputStyle} value={form.semester} onChange={e => setForm(p => ({ ...p, semester: e.target.value }))}>
                                        <option value="">— Select —</option>
                                        <option value="1st">1st Semester</option>
                                        <option value="2nd">2nd Semester</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#78716c', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.05em' }}>Section <span style={{ color: '#a8a29e', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                                <select style={inputStyle} value={form.section} onChange={e => setForm(p => ({ ...p, section: e.target.value }))}>
                                    <option value="">— All Sections —</option>
                                    <option value="A">Section A</option>
                                    <option value="B">Section B</option>
                                    <option value="C">Section C</option>
                                    <option value="D">Section D</option>
                                </select>
                            </div>
                            {error && <div style={{ color: '#dc2626', fontSize: '.82rem' }}>{error}</div>}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                                <button type="button" onClick={() => setModal(false)} style={{ ...btn('#e7e5e4'), color: '#44403c' }}>Cancel</button>
                                <button type="submit" disabled={saving} style={btn()}>
                                    {saving ? 'Assigning…' : 'Assign Subject'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
