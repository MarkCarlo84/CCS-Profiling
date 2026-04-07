import React, { useState, useEffect } from 'react';
import {
    getAcademicRecords, createAcademicRecord, deleteAcademicRecord,
    addGradeToRecord, adminUpdateGrade, adminDeleteGrade,
    adminPromoteStudent, getSubjects,
} from '../api';
import {
    GraduationCap, Search, Trash2, ChevronDown, ChevronUp,
    BookOpen, User, AlertTriangle, UserX, Plus, Pencil,
    ArrowRight, ArrowLeft, ChevronRight,
} from 'lucide-react';

const PROGRAMS = [
    { label: 'Information Technology', short: 'BSIT', value: 'IT' },
    { label: 'Computer Science', short: 'BSCS', value: 'CS' },
];
const SEMESTERS = ['1st', '2nd', 'Summer'];
const YEAR_LEVELS = [4, 3, 2, 1];
const YEAR_LABELS = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };
const VALID_SCORES = ['1.00', '1.25', '1.50', '2.00', '2.25', '2.50', '3.00', '5.00'];
const SPECIAL_REMARKS = ['INC', 'IP', 'OD', 'UD'];

function Modal({ title, onClose, children }) {
    return (
        <div style={S.overlay}>
            <div style={S.modal}>
                <div style={S.modalHeader}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{title}</span>
                    <button onClick={onClose} style={S.closeBtn}>✕</button>
                </div>
                <div style={{ padding: '20px 24px' }}>{children}</div>
            </div>
        </div>
    );
}

const scoreColor = (s) => {
    const v = parseFloat(s);
    if (v <= 1.5) return '#16a34a';
    if (v <= 2.5) return '#2563eb';
    if (v === 3.0) return '#d97706';
    return '#dc2626';
};

const getStatus = (s) => {
    const st = s?.status?.toLowerCase() || '';
    if (st === 'active' || st === 'regular') return 'Regular';
    if (st === 'inactive' || st === 'irregular') return 'Irregular';
    if (st === 'graduated') return 'Graduated';
    if (st === 'dropped') return 'Dropped';
    return 'Other';
};

export default function AcademicRecordsMap() {
    const [records, setRecords] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeProgram, setActiveProgram] = useState('IT');
    const [localQuery, setLocalQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    // null = list view, student object = detail view
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [expandedRecord, setExpandedRecord] = useState({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Modals
    const [showAddRecord, setShowAddRecord] = useState(false);
    const [showAddGrade, setShowAddGrade] = useState(null);
    const [showEditGrade, setShowEditGrade] = useState(null);
    const [showPromote, setShowPromote] = useState(null);

    const load = () => {
        setLoading(true);
        Promise.all([getAcademicRecords(), getSubjects()])
            .then(([r, s]) => { setRecords(r.data); setSubjects(s.data); })
            .finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    // ── Derived data ──────────────────────────────────────────────────────────
    const programRecords = records.filter(r => r.student?.department === activeProgram);

    // Unique students in this program
    const studentMap = {};
    programRecords.forEach(r => {
        if (r.student) studentMap[r.student.id] = r.student;
    });
    const allStudents = Object.values(studentMap);

    // Status counts (unique students)
    const statusCounts = { Regular: 0, Irregular: 0, Graduated: 0, Dropped: 0 };
    allStudents.forEach(s => { const st = getStatus(s); if (statusCounts[st] !== undefined) statusCounts[st]++; });

    // Group students by year level (derived from their highest year_level record)
    const studentYearLevel = {};
    programRecords.forEach(r => {
        const sid = r.student?.id;
        if (!sid) return;
        const cur = studentYearLevel[sid] || 0;
        if ((r.year_level || 0) > cur) studentYearLevel[sid] = r.year_level || 0;
    });

    // Filter students
    let filteredStudents = allStudents;
    if (statusFilter !== 'All') filteredStudents = filteredStudents.filter(s => getStatus(s) === statusFilter);
    if (localQuery) {
        const q = localQuery.toLowerCase();
        filteredStudents = filteredStudents.filter(s =>
            s.first_name?.toLowerCase().includes(q) ||
            s.last_name?.toLowerCase().includes(q) ||
            s.student_id?.toLowerCase().includes(q)
        );
    }

    // Group filtered students by year level
    const byYearLevel = {};
    filteredStudents.forEach(s => {
        const yl = studentYearLevel[s.id] || 0;
        if (!byYearLevel[yl]) byYearLevel[yl] = [];
        byYearLevel[yl].push(s);
    });

    // Records for selected student, grouped by year_level → semester
    const studentRecords = selectedStudent
        ? programRecords.filter(r => r.student?.id === selectedStudent.id)
        : [];

    const recordsByYearSem = {};
    studentRecords.forEach(r => {
        const yl = r.year_level || 0;
        const sem = r.semester || 'Other';
        if (!recordsByYearSem[yl]) recordsByYearSem[yl] = {};
        if (!recordsByYearSem[yl][sem]) recordsByYearSem[yl][sem] = r;
        else recordsByYearSem[yl][sem] = r; // keep latest
    });

    const activeProgObj = PROGRAMS.find(p => p.value === activeProgram);
    const metricCards = [
        { label: 'REGULAR',   key: 'Regular',   color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: User },
        { label: 'IRREGULAR', key: 'Irregular', color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: AlertTriangle },
        { label: 'GRADUATED', key: 'Graduated', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: GraduationCap },
        { label: 'DROPPED',   key: 'Dropped',   color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: UserX },
    ];

    const removeRecord = async (id) => {
        if (!window.confirm('Delete this academic record and all its grades?')) return;
        await deleteAcademicRecord(id); load();
    };
    const removeGrade = async (id) => {
        if (!window.confirm('Remove this grade?')) return;
        await adminDeleteGrade(id); load();
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div>
            {/* Header */}
            <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {selectedStudent && (
                        <button onClick={() => setSelectedStudent(null)} style={{ ...S.iconBtn, marginRight: 4 }}>
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    <div style={S.iconWrap}><GraduationCap size={22} color="#f97316" /></div>
                    <div>
                        <h1 style={S.h1}>
                            {selectedStudent
                                ? `${selectedStudent.first_name} ${selectedStudent.last_name}`
                                : 'Academic Records'}
                        </h1>
                        <p style={S.sub}>
                            {selectedStudent
                                ? `${selectedStudent.student_id} · ${activeProgObj?.short} · ${getStatus(selectedStudent)}`
                                : `BS ${activeProgObj?.label} — ${allStudents.length} students`}
                        </p>
                    </div>
                </div>
                <button onClick={() => setShowAddRecord(true)} style={S.primaryBtn}>
                    <Plus size={16} /> Add Academic Record
                </button>
            </div>

            {/* Program Tabs & Metric Cards — list view only */}
            {!selectedStudent && (
                <>
                    <div style={{ display: 'flex', gap: 12, marginTop: 24, marginBottom: 24, flexWrap: 'wrap' }}>
                        {PROGRAMS.map(p => {
                            const isActive = activeProgram === p.value;
                            return (
                                <button key={p.value}
                                    onClick={() => { setActiveProgram(p.value); setStatusFilter('All'); setLocalQuery(''); setSelectedStudent(null); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, border: '1px solid', borderColor: isActive ? '#3b82f6' : '#cbd5e1', background: isActive ? '#eff6ff' : '#fff', color: isActive ? '#2563eb' : '#64748b', fontWeight: 600, fontSize: '.9rem', cursor: 'pointer' }}>
                                    <BookOpen size={16} color={isActive ? '#3b82f6' : '#64748b'} />
                                    <span><strong style={{ color: isActive ? '#1d4ed8' : '#334155' }}>{p.short}</strong> {p.label}</span>
                                </button>
                            );
                        })}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
                        {metricCards.map(m => {
                            const Icon = m.icon;
                            const isSel = statusFilter === m.key;
                            return (
                                <div key={m.key} onClick={() => setStatusFilter(isSel ? 'All' : m.key)}
                                    style={{ background: m.bg, border: `2px solid ${isSel ? m.color : m.border}`, borderRadius: 12, padding: 15, cursor: 'pointer', transition: 'all .2s', opacity: statusFilter === 'All' || isSel ? 1 : 0.6, transform: isSel ? 'translateY(-2px)' : 'none' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: m.color, fontWeight: 700, fontSize: '.8rem', marginBottom: 6 }}>
                                        <Icon size={16} />{m.label}
                                    </div>
                                    <div style={{ fontSize: '2rem', fontWeight: 800, color: m.color, lineHeight: 1 }}>{statusCounts[m.key]}</div>
                                    <div style={{ color: m.color, opacity: .8, fontSize: '.75rem', fontWeight: 600, marginTop: 4 }}>students</div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {loading ? <div className="loading"><div className="loading-spinner" /><p>Loading…</p></div> : (

            selectedStudent ? (
                /* ── STUDENT DETAIL VIEW ── */
                <StudentDetail
                    student={selectedStudent}
                    recordsByYearSem={recordsByYearSem}
                    subjects={subjects}
                    expandedRecord={expandedRecord}
                    setExpandedRecord={setExpandedRecord}
                    onAddGrade={setShowAddGrade}
                    onEditGrade={setShowEditGrade}
                    onDeleteGrade={removeGrade}
                    onDeleteRecord={removeRecord}
                    onPromote={setShowPromote}
                />
            ) : (
                /* ── STUDENT LIST VIEW grouped by Year Level ── */
                <div>
                    {/* Search */}
                    <div style={{ position: 'relative', marginBottom: 24 }}>
                        <Search size={18} color="#f97316" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                        <input type="text" placeholder="Search by student name or ID..." value={localQuery}
                            onChange={e => setLocalQuery(e.target.value)}
                            style={{ width: '100%', padding: '12px 14px 12px 44px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#fff', fontSize: '.9rem', outline: 'none', boxSizing: 'border-box' }} />
                    </div>

                    {filteredStudents.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#64748b', padding: 40, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                            No students found.
                        </div>
                    )}

                    {YEAR_LEVELS.map(yl => {
                        const students = byYearLevel[yl];
                        if (!students || students.length === 0) return null;
                        const ylColors = { 4: '#7c3aed', 3: '#2563eb', 2: '#0891b2', 1: '#16a34a' };
                        const color = ylColors[yl] || '#475569';
                        return (
                            <div key={yl} style={{ marginBottom: 32 }}>
                                {/* Year Level Header */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                                    <div style={{ width: 4, height: 32, borderRadius: 4, background: color }} />
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>{YEAR_LABELS[yl]}</div>
                                        <div style={{ fontSize: '.78rem', color: '#64748b', fontWeight: 500 }}>{students.length} student{students.length !== 1 ? 's' : ''}</div>
                                    </div>
                                </div>

                                {/* Student Cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                                    {students.map(s => {
                                        const recCount = programRecords.filter(r => r.student?.id === s.id).length;
                                        const status = getStatus(s);
                                        const statusColors = { Regular: '#16a34a', Irregular: '#d97706', Graduated: '#2563eb', Dropped: '#dc2626', Other: '#64748b' };
                                        const sc = statusColors[status] || '#64748b';
                                        return (
                                            <div key={s.id} onClick={() => setSelectedStudent(s)}
                                                style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 18px', cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 4px 12px ${color}20`; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '.95rem', color, flexShrink: 0 }}>
                                                        {s.first_name?.[0]}{s.last_name?.[0]}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '.9rem', color: '#0f172a' }}>{s.first_name} {s.last_name}</div>
                                                        <div style={{ fontSize: '.78rem', color: '#64748b' }}>{s.student_id}</div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                                                            <span style={{ fontSize: '.7rem', fontWeight: 700, color: sc, background: `${sc}15`, padding: '2px 8px', borderRadius: 99 }}>{status}</span>
                                                            <span style={{ fontSize: '.7rem', color: '#94a3b8' }}>{recCount} record{recCount !== 1 ? 's' : ''}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <ChevronRight size={18} color="#cbd5e1" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {/* Students with no year level assigned */}
                    {(byYearLevel[0] || []).length > 0 && (
                        <div style={{ marginBottom: 32 }}>
                            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#64748b', marginBottom: 12 }}>Unassigned Year Level</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                                {byYearLevel[0].map(s => (
                                    <div key={s.id} onClick={() => setSelectedStudent(s)}
                                        style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{s.first_name} {s.last_name}</div>
                                            <div style={{ fontSize: '.78rem', color: '#64748b' }}>{s.student_id}</div>
                                        </div>
                                        <ChevronRight size={18} color="#cbd5e1" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {/* ── Modals ── */}
            {showAddRecord && (
                <AddRecordModal
                    onClose={() => { setShowAddRecord(false); setError(''); }}
                    onSave={async (data) => {
                        setSaving(true); setError('');
                        try { await createAcademicRecord(data); load(); setShowAddRecord(false); }
                        catch (e) { setError(e.response?.data?.message || 'Failed to create record.'); }
                        finally { setSaving(false); }
                    }}
                    saving={saving} error={error}
                />
            )}
            {showAddGrade && (
                <AddGradeModal record={showAddGrade} subjects={subjects}
                    onClose={() => { setShowAddGrade(null); setError(''); }}
                    onSave={async (data) => {
                        setSaving(true); setError('');
                        try { await addGradeToRecord(showAddGrade.id, data); load(); setShowAddGrade(null); }
                        catch (e) { setError(e.response?.data?.message || 'Failed to add grade.'); }
                        finally { setSaving(false); }
                    }}
                    saving={saving} error={error}
                />
            )}
            {showEditGrade && (
                <EditGradeModal grade={showEditGrade}
                    onClose={() => { setShowEditGrade(null); setError(''); }}
                    onSave={async (data) => {
                        setSaving(true); setError('');
                        try { await adminUpdateGrade(showEditGrade.id, data); load(); setShowEditGrade(null); }
                        catch (e) { setError(e.response?.data?.message || 'Failed to update grade.'); }
                        finally { setSaving(false); }
                    }}
                    saving={saving} error={error}
                />
            )}
            {showPromote && (
                <PromoteModal student={showPromote.student} record={showPromote.record}
                    onClose={() => { setShowPromote(null); setError(''); }}
                    onSave={async (data) => {
                        setSaving(true); setError('');
                        try { await adminPromoteStudent(showPromote.student.id, data); load(); setShowPromote(null); }
                        catch (e) { setError(e.response?.data?.message || 'Failed to promote student.'); }
                        finally { setSaving(false); }
                    }}
                    saving={saving} error={error}
                />
            )}
        </div>
    );
}

// ── Student Detail View ───────────────────────────────────────────────────────
function StudentDetail({ student, recordsByYearSem, subjects, expandedRecord, setExpandedRecord, onAddGrade, onEditGrade, onDeleteGrade, onDeleteRecord, onPromote }) {
    const semOrder = ['1st', '2nd', 'Summer'];
    const yearLevels = Object.keys(recordsByYearSem).map(Number).sort((a, b) => b - a);

    if (yearLevels.length === 0) {
        return (
            <div style={{ textAlign: 'center', color: '#64748b', padding: 48, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                No academic records found for this student.
            </div>
        );
    }

    return (
        <div>
            {yearLevels.map(yl => {
                const ylColors = { 4: '#7c3aed', 3: '#2563eb', 2: '#0891b2', 1: '#16a34a' };
                const color = ylColors[yl] || '#475569';
                const semRecords = recordsByYearSem[yl];
                return (
                    <div key={yl} style={{ marginBottom: 36 }}>
                        {/* Year Level Banner */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                            <div style={{ width: 4, height: 36, borderRadius: 4, background: color }} />
                            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
                                {YEAR_LABELS[yl] || `Year ${yl}`}
                            </div>
                        </div>

                        {/* Semester Panels */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {semOrder.map(sem => {
                                const rec = semRecords[sem];
                                if (!rec) return null;
                                const isOpen = expandedRecord[rec.id];
                                return (
                                    <div key={sem} style={{ border: `1px solid ${isOpen ? color : '#e2e8f0'}`, borderRadius: 12, overflow: 'hidden', background: '#fff', transition: 'border-color .2s' }}>
                                        {/* Semester Header */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: isOpen ? `${color}08` : '#fff', cursor: 'pointer' }}
                                            onClick={() => setExpandedRecord(e => ({ ...e, [rec.id]: !e[rec.id] }))}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                                                <span style={{ fontWeight: 700, fontSize: '.95rem', color: '#0f172a' }}>{sem} Semester</span>
                                                <span style={{ fontSize: '.78rem', color: '#64748b' }}>S.Y. {rec.school_year}</span>
                                                <span style={{ fontSize: '.75rem', fontWeight: 600, color: '#fff', background: color, padding: '2px 10px', borderRadius: 99 }}>
                                                    {rec.grades?.length || 0} subjects
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                {rec.gpa != null && (
                                                    <span style={{ fontWeight: 800, fontSize: '.9rem', color: scoreColor(rec.gpa) }}>
                                                        GPA: {parseFloat(rec.gpa).toFixed(2)}
                                                    </span>
                                                )}
                                                <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                                                    <button title="Add Grade" onClick={() => onAddGrade(rec)} style={S.actionBtn}><Plus size={13} /></button>
                                                    <button title="Promote" onClick={() => onPromote({ student, record: rec })} style={{ ...S.actionBtn, color: '#2563eb' }}><ArrowRight size={13} /></button>
                                                    <button title="Delete Record" onClick={() => onDeleteRecord(rec.id)} style={{ ...S.actionBtn, color: '#dc2626' }}><Trash2 size={13} /></button>
                                                </div>
                                                {isOpen ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
                                            </div>
                                        </div>

                                        {/* Grades Table */}
                                        {isOpen && (
                                            <div style={{ borderTop: `1px solid ${color}30`, padding: '0 20px 16px' }}>
                                                {rec.grades?.length > 0 ? (
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem', marginTop: 12 }}>
                                                        <thead>
                                                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                                                <th style={{ padding: '10px 12px', textAlign: 'left', color: '#475569', fontWeight: 700, fontSize: '.75rem', letterSpacing: '.04em' }}>SUBJECT</th>
                                                                <th style={{ padding: '10px 12px', textAlign: 'center', color: '#475569', fontWeight: 700, fontSize: '.75rem', letterSpacing: '.04em', width: 70 }}>UNITS</th>
                                                                <th style={{ padding: '10px 12px', textAlign: 'center', color: '#475569', fontWeight: 700, fontSize: '.75rem', letterSpacing: '.04em', width: 80 }}>GRADE</th>
                                                                <th style={{ padding: '10px 12px', textAlign: 'center', color: '#475569', fontWeight: 700, fontSize: '.75rem', letterSpacing: '.04em', width: 110 }}>REMARKS</th>
                                                                <th style={{ padding: '10px 12px', textAlign: 'right', color: '#475569', fontWeight: 700, fontSize: '.75rem', letterSpacing: '.04em', width: 90 }}>ACTIONS</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {rec.grades.map(g => (
                                                                <tr key={g.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                                    <td style={{ padding: '9px 12px', color: '#334155', fontWeight: 500 }}>
                                                                        {g.subject?.subject_code && <span style={{ fontSize: '.72rem', color: '#94a3b8', marginRight: 6 }}>{g.subject.subject_code}</span>}
                                                                        {g.subject_name || g.subject?.subject_name || '—'}
                                                                    </td>
                                                                    <td style={{ padding: '9px 12px', textAlign: 'center', color: '#64748b' }}>{g.subject?.units || '—'}</td>
                                                                    <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 800, color: g.score ? scoreColor(g.score) : '#94a3b8' }}>
                                                                        {g.score || '—'}
                                                                    </td>
                                                                    <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                                                                        <span style={{ fontSize: '.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                                                                            background: g.remarks === 'IP' ? '#fef9c3' : g.remarks === 'Passed' ? '#f0fdf4' : g.score && parseFloat(g.score) <= 3 ? '#f0fdf4' : '#fef2f2',
                                                                            color: g.remarks === 'IP' ? '#a16207' : g.remarks === 'Passed' ? '#16a34a' : g.score && parseFloat(g.score) <= 3 ? '#16a34a' : '#dc2626' }}>
                                                                            {g.remarks || '—'}
                                                                        </span>
                                                                    </td>
                                                                    <td style={{ padding: '9px 12px', textAlign: 'right' }}>
                                                                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                                                            <button onClick={() => onEditGrade(g)} style={S.actionBtn}><Pencil size={12} /></button>
                                                                            <button onClick={() => onDeleteGrade(g.id)} style={{ ...S.actionBtn, color: '#dc2626' }}><Trash2 size={12} /></button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <p style={{ color: '#94a3b8', fontSize: '.85rem', marginTop: 12 }}>No grades yet.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ── Modals ────────────────────────────────────────────────────────────────────
function AddRecordModal({ onClose, onSave, saving, error }) {
    const [form, setForm] = useState({ student_id_number: '', school_year: '', semester: '1st', year_level: 1 });
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const showNote = form.year_level > 1 || (form.year_level === 1 && form.semester === '2nd');
    return (
        <Modal title="Add Academic Record" onClose={onClose}>
            {error && <p style={S.err}>{error}</p>}
            <div style={S.grid}>
                <label style={S.lbl}>Student ID Number</label>
                <input style={S.inp} type="text" value={form.student_id_number} onChange={e => set('student_id_number', e.target.value)} placeholder="e.g. 2xxxxxx" />
                <label style={S.lbl}>School Year</label>
                <input style={S.inp} value={form.school_year} onChange={e => set('school_year', e.target.value)} placeholder="e.g. 2025-2026" />
                <label style={S.lbl}>Semester</label>
                <select style={S.inp} value={form.semester} onChange={e => set('semester', e.target.value)}>
                    {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <label style={S.lbl}>Year Level</label>
                <select style={S.inp} value={form.year_level} onChange={e => set('year_level', Number(e.target.value))}>
                    {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
            </div>
            {showNote && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 14px', marginTop: 14, fontSize: '.82rem', color: '#1d4ed8' }}>
                    <strong>Regular student:</strong> all previous year/semester records will be auto-created with their subjects (IP status).
                </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button onClick={onClose} style={S.cancelBtn}>Cancel</button>
                <button onClick={() => onSave(form)} disabled={saving} style={S.primaryBtn}>{saving ? 'Saving…' : 'Create Record'}</button>
            </div>
        </Modal>
    );
}

function AddGradeModal({ record, subjects, onClose, onSave, saving, error }) {
    const [form, setForm] = useState({ subject_id: '', subject_name: '', score: '', remarks: 'IP' });
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    return (
        <Modal title={`Add Grade — ${record.school_year} ${record.semester} Sem`} onClose={onClose}>
            {error && <p style={S.err}>{error}</p>}
            <div style={S.grid}>
                <label style={S.lbl}>Subject</label>
                <select style={S.inp} value={form.subject_id} onChange={e => set('subject_id', e.target.value)}>
                    <option value="">— Select subject —</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_code} — {s.subject_name}</option>)}
                </select>
                <label style={S.lbl}>Or type subject name</label>
                <input style={S.inp} value={form.subject_name} onChange={e => set('subject_name', e.target.value)} placeholder="Manual subject name" />
                <label style={S.lbl}>Grade</label>
                <select style={S.inp} value={form.score} onChange={e => set('score', e.target.value)}>
                    <option value="">— No grade yet —</option>
                    {VALID_SCORES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <label style={S.lbl}>Special Remarks</label>
                <select style={S.inp} value={form.remarks} onChange={e => set('remarks', e.target.value)}>
                    <option value="IP">IP — In Progress</option>
                    <option value="INC">INC — Incomplete</option>
                    <option value="OD">OD — Officially Dropped</option>
                    <option value="UD">UD — Unofficially Dropped</option>
                </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button onClick={onClose} style={S.cancelBtn}>Cancel</button>
                <button onClick={() => onSave(form)} disabled={saving} style={S.primaryBtn}>{saving ? 'Saving…' : 'Add Grade'}</button>
            </div>
        </Modal>
    );
}

function EditGradeModal({ grade, onClose, onSave, saving, error }) {
    const [form, setForm] = useState({ score: grade.score || '', remarks: grade.remarks || 'IP' });
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    return (
        <Modal title={`Edit Grade — ${grade.subject_name || grade.subject?.subject_name || 'Subject'}`} onClose={onClose}>
            {error && <p style={S.err}>{error}</p>}
            <div style={S.grid}>
                <label style={S.lbl}>Grade</label>
                <select style={S.inp} value={form.score} onChange={e => set('score', e.target.value)}>
                    <option value="">— No grade yet —</option>
                    {VALID_SCORES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <label style={S.lbl}>Special Remarks</label>
                <select style={S.inp} value={form.remarks} onChange={e => set('remarks', e.target.value)}>
                    <option value="">— None —</option>
                    <option value="IP">IP — In Progress</option>
                    <option value="INC">INC — Incomplete</option>
                    <option value="OD">OD — Officially Dropped</option>
                    <option value="UD">UD — Unofficially Dropped</option>
                </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button onClick={onClose} style={S.cancelBtn}>Cancel</button>
                <button onClick={() => onSave(form)} disabled={saving} style={S.primaryBtn}>{saving ? 'Saving…' : 'Save Changes'}</button>
            </div>
        </Modal>
    );
}

function PromoteModal({ student, record, onClose, onSave, saving, error }) {
    const cy = new Date().getFullYear();
    const [form, setForm] = useState({
        from_school_year: record.school_year || '',
        from_semester: record.semester || '1st',
        from_year_level: record.year_level || 1,
        to_school_year: `${cy}-${cy + 1}`,
    });
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    return (
        <Modal title={`Promote — ${student?.first_name} ${student?.last_name}`} onClose={onClose}>
            {error && <p style={S.err}>{error}</p>}
            <p style={{ color: '#64748b', fontSize: '.85rem', marginBottom: 16 }}>All grades must be passed (≤ 3.00) before promotion.</p>
            <div style={S.grid}>
                <label style={S.lbl}>From School Year</label>
                <input style={S.inp} value={form.from_school_year} onChange={e => set('from_school_year', e.target.value)} />
                <label style={S.lbl}>From Semester</label>
                <select style={S.inp} value={form.from_semester} onChange={e => set('from_semester', e.target.value)}>
                    {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <label style={S.lbl}>From Year Level</label>
                <select style={S.inp} value={form.from_year_level} onChange={e => set('from_year_level', Number(e.target.value))}>
                    {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
                <label style={S.lbl}>To School Year</label>
                <input style={S.inp} value={form.to_school_year} onChange={e => set('to_school_year', e.target.value)} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button onClick={onClose} style={S.cancelBtn}>Cancel</button>
                <button onClick={() => onSave(form)} disabled={saving} style={{ ...S.primaryBtn, background: '#2563eb' }}>
                    {saving ? 'Promoting…' : 'Promote Student'}
                </button>
            </div>
        </Modal>
    );
}

// ── Shared Styles ─────────────────────────────────────────────────────────────
const S = {
    overlay:     { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 },
    modal:       { background: '#fff', borderRadius: 14, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.2)' },
    modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #e2e8f0' },
    closeBtn:    { background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#64748b', padding: 4 },
    h1:          { fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 },
    sub:         { color: '#64748b', margin: 0, fontSize: '.875rem' },
    iconWrap:    { width: 44, height: 44, borderRadius: 12, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fed7aa', flexShrink: 0 },
    iconBtn:     { background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' },
    actionBtn:   { background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' },
    primaryBtn:  { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8, background: '#f97316', color: '#fff', fontWeight: 600, fontSize: '.875rem', border: 'none', cursor: 'pointer' },
    cancelBtn:   { padding: '10px 18px', borderRadius: 8, background: '#f1f5f9', color: '#475569', fontWeight: 600, fontSize: '.875rem', border: '1px solid #e2e8f0', cursor: 'pointer' },
    grid:        { display: 'grid', gridTemplateColumns: '1fr', gap: 10 },
    lbl:         { fontSize: '.8rem', fontWeight: 600, color: '#475569' },
    inp:         { padding: '9px 12px', borderRadius: 7, border: '1px solid #cbd5e1', fontSize: '.875rem', color: '#0f172a', outline: 'none', width: '100%', boxSizing: 'border-box' },
    err:         { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 7, padding: '10px 14px', fontSize: '.85rem', marginBottom: 12 },
};
