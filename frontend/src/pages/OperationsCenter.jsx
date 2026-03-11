import React, { useState, useEffect } from 'react';
import {
    getFaculties, getStudents, getEligibilityCriteria,
    facultyCreateReport, facultyEvaluateStudent, facultyRecordViolation, facultyUpdateStudentRecord,
    studentUpdateProfile, studentAddViolation, studentAddAffiliation, studentAddSkill, studentAddAcademicRecord
} from '../api';
import {
    Activity, Users, GraduationCap, ClipboardCheck,
    FileText, CheckCircle, AlertTriangle, ShieldAlert,
    Network, Zap, BookOpen, UserCircle, Save, Plus
} from 'lucide-react';

export default function OperationsCenter() {
    const [faculties, setFaculties] = useState([]);
    const [students, setStudents] = useState([]);
    const [criteria, setCriteria] = useState([]);

    const [selFaculty, setSelFaculty] = useState('');
    const [selStudent, setSelStudent] = useState('');
    const [selCriteria, setSelCriteria] = useState('');

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        getFaculties().then(r => setFaculties(r.data));
        getStudents().then(r => setStudents(r.data));
        getEligibilityCriteria().then(r => setCriteria(r.data));
    }, []);

    const runOp = async (label, fn) => {
        setLoading(true);
        setResult(null);
        setMsg(null);
        try {
            const res = await fn();
            setResult({ label, data: res.data });
        } catch (e) {
            setMsg({ type: 'error', text: e.response?.data?.message || 'Operation failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <div style={iconWrap}><Activity size={24} color="#f97316" /></div>
                    <div>
                        <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>Class Diagram Operations</h1>
                        <p style={{ color: '#78716c' }}>Demonstrating and triggering specific logic methods defined in the Class Diagram</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

                {/* Faculty Operations Card */}
                <div className="card">
                    <div className="card-header" style={{ background: 'linear-gradient(135deg, #1c1917, #44403c)', color: '#fff' }}>
                        <h2 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Users size={18} /> Faculty Operations
                        </h2>
                    </div>
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={lStyle}>Select Faculty Instance</label>
                            <select style={iStyle} value={selFaculty} onChange={e => setSelFaculty(e.target.value)}>
                                <option value="">— Select Faculty —</option>
                                {faculties.map(f => <option key={f.id} value={f.id}>{f.last_name}, {f.first_name} ({f.department})</option>)}
                            </select>
                        </div>

                        <div style={{ borderTop: '1px solid #f5f5f4', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <select style={{ ...iStyle, flex: 1 }} value={selCriteria} onChange={e => setSelCriteria(e.target.value)}>
                                    <option value="">— Select Criteria —</option>
                                    {criteria.map(c => <option key={c.id} value={c.id}>{c.criteria_id || `Criteria #${c.id}`}</option>)}
                                </select>
                                <button className="btn btn-primary" style={{ height: 40 }} disabled={!selFaculty || !selCriteria || loading}
                                    onClick={() => runOp('Create Report', () => facultyCreateReport(selFaculty, selCriteria))}>
                                    <FileText size={15} /> createReport()
                                </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <select style={{ ...iStyle, flex: 1 }} value={selStudent} onChange={e => setSelStudent(e.target.value)}>
                                    <option value="">— Select Student —</option>
                                    {students.map(s => <option key={s.id} value={s.id}>{s.last_name}, {s.first_name} ({s.student_id})</option>)}
                                </select>
                                <button className="btn btn-outline" style={{ height: 40 }} disabled={!selFaculty || !selStudent || loading}
                                    onClick={() => runOp('Evaluate Student', () => facultyEvaluateStudent(selFaculty, selStudent))}>
                                    <CheckCircle size={15} /> evaluateStudent()
                                </button>
                            </div>

                            <button className="btn btn-outline" disabled={!selFaculty || !selStudent || loading}
                                onClick={() => runOp('Record Violation (v. Faculty)', () => facultyRecordViolation(selFaculty, selStudent, {
                                    violation_type: 'Manual Trigger from Faculty Instance',
                                    severity_level: 'minor',
                                    date_committed: new Date().toISOString().split('T')[0]
                                }))}>
                                <ShieldAlert size={15} /> recordViolation()
                            </button>
                        </div>
                    </div>
                </div>

                {/* Student Operations Card */}
                <div className="card">
                    <div className="card-header" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff' }}>
                        <h2 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <GraduationCap size={18} /> Student Operations
                        </h2>
                    </div>
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={lStyle}>Select Student Instance</label>
                            <select style={iStyle} value={selStudent} onChange={e => setSelStudent(e.target.value)}>
                                <option value="">— Select Student —</option>
                                {students.map(s => <option key={s.id} value={s.id}>{s.last_name}, {s.first_name} ({s.student_id})</option>)}
                            </select>
                        </div>

                        <div style={{ borderTop: '1px solid #f5f5f4', paddingTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <button className="btn btn-outline" disabled={!selStudent || loading}
                                onClick={() => runOp('Update Profile', () => studentUpdateProfile(selStudent, { contact_number: 'Updated via updateProfile()' }))}>
                                <UserCircle size={15} /> updateProfile()
                            </button>
                            <button className="btn btn-outline" disabled={!selStudent || loading}
                                onClick={() => runOp('Add Skill', () => studentAddSkill(selStudent, { skill_name: 'Diagram Method Add', skill_level: 'intermediate' }))}>
                                <Zap size={15} /> addSkill()
                            </button>
                            <button className="btn btn-outline" disabled={!selStudent || loading}
                                onClick={() => runOp('Add Affiliation', () => studentAddAffiliation(selStudent, { name: 'Operation Org', type: 'Academic' }))}>
                                <Network size={15} /> addAffiliation()
                            </button>
                            <button className="btn btn-outline" disabled={!selStudent || loading}
                                onClick={() => runOp('Add Violation', () => studentAddViolation(selStudent, { violation_type: 'Direct addViolation method', severity_level: 'minor' }))}>
                                <ShieldAlert size={15} /> addViolation()
                            </button>
                            <button className="btn btn-primary" style={{ gridColumn: 'span 2' }} disabled={!selStudent || loading}
                                onClick={() => runOp('Add Academic Record', () => studentAddAcademicRecord(selStudent, { school_year: '2024-2025', semester: '1st Semester' }))}>
                                <BookOpen size={15} /> addAcademicRecord()
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Area */}
            <div style={{ marginTop: 24 }}>
                <div className="section-divider"><h2>Operation Result</h2></div>
                <div className="card" style={{ minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: result || loading || msg ? 'stretch' : 'center', justifyContent: result || loading || msg ? 'flex-start' : 'center' }}>
                    {loading && <div className="loading"><div className="loading-spinner" /><p>Running operation on backend instance...</p></div>}

                    {msg && (
                        <div style={{ padding: 20, textAlign: 'center' }}>
                            <AlertTriangle size={32} color={msg.type === 'error' ? '#ef4444' : '#f59e0b'} />
                            <p style={{ marginTop: 10, fontWeight: 600 }}>{msg.text}</p>
                        </div>
                    )}

                    {result && (
                        <div className="card-body">
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 12, color: '#1c1917', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <CheckCircle size={18} color="#22c55e" /> {result.label} Output
                            </h3>
                            <div style={{ background: '#1c1917', color: '#a3e635', padding: 16, borderRadius: 12, fontFamily: 'monospace', fontSize: '.85rem', overflow: 'auto', maxHeight: 400 }}>
                                <pre>{JSON.stringify(result.data, null, 2)}</pre>
                            </div>
                        </div>
                    )}

                    {!result && !loading && !msg && (
                        <div style={{ textAlign: 'center', color: '#a8a29e' }}>
                            <Activity size={40} style={{ opacity: .3 }} />
                            <p style={{ marginTop: 10 }}>Select instances and trigger a Diagrammatic Operation above to see the logic in action.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const iconWrap = { width: 50, height: 50, borderRadius: 14, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fed7aa' };
const lStyle = { display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#44403c', marginBottom: 5, letterSpacing: .3 };
const iStyle = { width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid #e7e5e4', fontSize: '.875rem', fontFamily: "'Inter',sans-serif", color: '#1c1917', boxSizing: 'border-box' };
