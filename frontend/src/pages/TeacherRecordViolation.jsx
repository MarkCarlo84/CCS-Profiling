import React, { useState, useEffect } from 'react';
import { getStudents, facultyRecordViolation } from '../api';
import { useAuth } from '../AuthContext';
import { ShieldAlert, Search, Plus, Check, X, AlertCircle, UserCircle } from 'lucide-react';

const empty = {
    violation_type: '',
    description: '',
    date_committed: new Date().toISOString().split('T')[0],
    severity_level: 'minor',
    action_taken: '',
};

export default function TeacherRecordViolation() {
    const { user } = useAuth();
    const facultyId = user?.profile?.id;

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [form, setForm] = useState(empty);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        getStudents({ status: 'active' })
            .then(r => setStudents(r.data))
            .finally(() => setLoading(false));
    }, []);

    const filtered = students.filter(s => {
        const q = search.toLowerCase();
        return !q ||
            s.first_name?.toLowerCase().includes(q) ||
            s.last_name?.toLowerCase().includes(q) ||
            s.student_id?.toLowerCase().includes(q);
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!facultyId) {
            setError('No faculty profile linked.');
            return;
        }
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await facultyRecordViolation(facultyId, selectedStudent.id, form);
            setSuccess(`Violation recorded for ${selectedStudent.first_name} ${selectedStudent.last_name}`);
            setForm(empty);
            setSelectedStudent(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to record violation.');
        } finally {
            setSaving(false);
        }
    };

    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={s.iconWrap}><ShieldAlert size={22} color="#f97316" /></div>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>Record Violation</h1>
                        <p style={{ color: '#78716c', margin: 0, fontSize: '.875rem' }}>Document student violations and disciplinary actions</p>
                    </div>
                </div>
            </div>

            {success && (
                <div style={s.successBox}>
                    <Check size={16} />
                    <span>{success}</span>
                    <button onClick={() => setSuccess('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={14} />
                    </button>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: selectedStudent ? '1fr 1.5fr' : '1fr', gap: 16 }}>
                {/* Student List */}
                <div className="card">
                    <div className="card-header">
                        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Select Student</h2>
                    </div>
                    <div className="card-body" style={{ padding: '12px 16px' }}>
                        <div style={{ position: 'relative', marginBottom: 12 }}>
                            <Search size={15} color="#f97316" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                placeholder="Search students..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ ...s.input, paddingLeft: 36 }}
                            />
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: 20, color: '#78716c' }}>Loading students...</div>
                        ) : (
                            <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                                {filtered.map(student => (
                                    <div
                                        key={student.id}
                                        onClick={() => { setSelectedStudent(student); setError(''); setSuccess(''); }}
                                        style={{
                                            padding: '10px 12px',
                                            borderRadius: 8,
                                            cursor: 'pointer',
                                            marginBottom: 6,
                                            background: selectedStudent?.id === student.id ? '#fff7ed' : '#fafaf9',
                                            border: `1px solid ${selectedStudent?.id === student.id ? '#fed7aa' : '#e7e5e4'}`,
                                            transition: 'all .2s ease',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 8,
                                                background: selectedStudent?.id === student.id ? '#f97316' : '#e7e5e4',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <UserCircle size={18} color={selectedStudent?.id === student.id ? '#fff' : '#78716c'} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: '.875rem', color: '#1c1917' }}>
                                                    {student.first_name} {student.last_name}
                                                </div>
                                                <div style={{ fontSize: '.75rem', color: '#78716c' }}>{student.student_id}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filtered.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: 20, color: '#a8a29e', fontSize: '.875rem' }}>
                                        No students found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Violation Form */}
                {selectedStudent && (
                    <div className="card">
                        <div className="card-header">
                            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                                Record Violation for {selectedStudent.first_name} {selectedStudent.last_name}
                            </h2>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <label style={s.label}>Violation Type <span style={{ color: '#dc2626' }}>*</span></label>
                                    <input
                                        required
                                        value={form.violation_type}
                                        onChange={set('violation_type')}
                                        placeholder="e.g. Tardiness, Cheating, Disruptive Behavior"
                                        style={s.input}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    <div>
                                        <label style={s.label}>Date Committed</label>
                                        <input
                                            type="date"
                                            value={form.date_committed}
                                            onChange={set('date_committed')}
                                            style={s.input}
                                        />
                                    </div>
                                    <div>
                                        <label style={s.label}>Severity Level <span style={{ color: '#dc2626' }}>*</span></label>
                                        <select required value={form.severity_level} onChange={set('severity_level')} style={s.input}>
                                            <option value="minor">Minor</option>
                                            <option value="major">Major</option>
                                            <option value="grave">Grave</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label style={s.label}>Description</label>
                                    <textarea
                                        value={form.description}
                                        onChange={set('description')}
                                        placeholder="Provide details about the violation..."
                                        rows={4}
                                        style={{ ...s.input, resize: 'vertical', lineHeight: 1.6 }}
                                    />
                                </div>

                                <div>
                                    <label style={s.label}>Action Taken</label>
                                    <textarea
                                        value={form.action_taken}
                                        onChange={set('action_taken')}
                                        placeholder="Describe the disciplinary action or resolution..."
                                        rows={3}
                                        style={{ ...s.input, resize: 'vertical', lineHeight: 1.6 }}
                                    />
                                </div>

                                {error && (
                                    <div style={s.errorBox}>
                                        <AlertCircle size={14} />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={() => { setSelectedStudent(null); setForm(empty); setError(''); }}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        <ShieldAlert size={14} /> {saving ? 'Recording...' : 'Record Violation'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const s = {
    iconWrap: { width: 44, height: 44, borderRadius: 12, background: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    label: { display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#44403c', marginBottom: 5 },
    input: { width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid #e7e5e4', fontSize: '.875rem', color: '#1c1917', boxSizing: 'border-box', fontFamily: "'Inter',sans-serif" },
    successBox: { display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', color: '#16a34a', fontSize: '.875rem', marginBottom: 16 },
    errorBox: { display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', color: '#dc2626', fontSize: '.82rem' },
};
