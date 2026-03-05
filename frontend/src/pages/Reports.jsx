import React, { useState, useEffect } from 'react';
import { getReportStudents, getReportFaculties, getDepartments } from '../api';
import {
    BarChart3, Zap, Settings2, Play, Loader2,
    Search, Dumbbell, Code2, BookOpenCheck, AlertTriangle, Trophy, Users,
} from 'lucide-react';

function Badge({ value }) {
    return value ? <span className={`badge badge-${value.toLowerCase().replace(/\s/g, '_')}`}>{value.replace(/_/g, ' ')}</span> : null;
}

const PRESET_REPORTS = [
    { label: 'Basketball Try-out Qualifiers', Icon: Dumbbell, params: { skill: 'Basketball', status: 'active' }, type: 'students' },
    { label: 'Programming Contest Qualifiers', Icon: Code2, params: { skill_category: 'Programming', status: 'active' }, type: 'students' },
    { label: "Dean's Lister Candidates (≤1.75)", Icon: BookOpenCheck, params: { max_gpa: 1.75, status: 'active' }, type: 'students' },
    { label: 'Students with Major Violations', Icon: AlertTriangle, params: { violation_severity: 'major', status: 'active' }, type: 'students' },
    { label: 'National Award Winners', Icon: Trophy, params: { award_level: 'national', status: 'active' }, type: 'students' },
    { label: 'Active Faculty (Full-time)', Icon: Users, params: { status: 'active', employment_type: 'full_time' }, type: 'faculties' },
];

const formField = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #fed7aa', fontSize: '.875rem', fontFamily: 'Inter,sans-serif', background: '#fff', color: '#1c1917', outline: 'none' };
const label = { fontSize: '.78rem', fontWeight: 700, display: 'block', marginBottom: 5, color: '#44403c', letterSpacing: .3 };

export default function Reports() {
    const [departments, setDepartments] = useState([]);
    const [results, setResults] = useState(null);
    const [resultType, setResultType] = useState('students');
    const [loading, setLoading] = useState(false);
    const [activePreset, setActivePreset] = useState(null);

    const [filters, setFilters] = useState({
        type: 'students',
        department_id: '', year_level: '', gender: '', status: 'active',
        min_gpa: '', max_gpa: '',
        skill: '', skill_category: '',
        affiliation: '',
        has_violation: '', violation_severity: '',
        activity_category: '', award_level: '',
        employment_type: '', search: '',
    });

    useEffect(() => { getDepartments().then(r => setDepartments(r.data)).catch(() => { }); }, []);

    const runQuery = async (overrideParams = null, type = null) => {
        setLoading(true);
        const t = type || filters.type;
        const params = overrideParams || filters;
        try {
            const fn = t === 'faculties' ? getReportFaculties : getReportStudents;
            const res = await fn(params);
            setResults(res.data);
            setResultType(t);
        } finally { setLoading(false); }
    };

    const runPreset = (preset) => { setActivePreset(preset.label); runQuery(preset.params, preset.type); };

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <div style={iconWrap}><BarChart3 size={22} color="#f97316" /></div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>Reports & Queries</h1>
                </div>
                <p style={{ color: '#78716c' }}>Filter students or faculty by any combination of criteria to generate targeted reports</p>
            </div>

            {/* Preset Reports */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Zap size={16} color="#f97316" />Preset Reports</h2>
                </div>
                <div className="card-body" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {PRESET_REPORTS.map(p => {
                        const IconComp = p.Icon;
                        const active = activePreset === p.label;
                        return (
                            <button key={p.label}
                                className={`btn ${active ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => runPreset(p)}
                            >
                                <IconComp size={14} />{p.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Custom Filter */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Settings2 size={16} color="#f97316" />Custom Filter</h2>
                </div>
                <div className="card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 20 }}>
                        <div>
                            <label style={label}>Report Type</label>
                            <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))} style={formField}>
                                <option value="students">Students</option>
                                <option value="faculties">Faculty</option>
                            </select>
                        </div>
                        <div>
                            <label style={label}>Department</label>
                            <select value={filters.department_id} onChange={e => setFilters(f => ({ ...f, department_id: e.target.value }))} style={formField}>
                                <option value="">All Departments</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.code} - {d.name}</option>)}
                            </select>
                        </div>
                        {filters.type === 'students' && <>
                            <div>
                                <label style={label}>Year Level</label>
                                <select value={filters.year_level} onChange={e => setFilters(f => ({ ...f, year_level: e.target.value }))} style={formField}>
                                    <option value="">Any</option>
                                    {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={label}>Min GPA</label>
                                <input type="number" step="0.01" min="1" max="5" placeholder="e.g. 1.00" value={filters.min_gpa} onChange={e => setFilters(f => ({ ...f, min_gpa: e.target.value }))} style={formField} />
                            </div>
                            <div>
                                <label style={label}>Max GPA</label>
                                <input type="number" step="0.01" min="1" max="5" placeholder="e.g. 2.00" value={filters.max_gpa} onChange={e => setFilters(f => ({ ...f, max_gpa: e.target.value }))} style={formField} />
                            </div>
                            <div>
                                <label style={label}>Skill (e.g. Basketball)</label>
                                <input type="text" placeholder="Skill keyword" value={filters.skill} onChange={e => setFilters(f => ({ ...f, skill: e.target.value }))} style={formField} />
                            </div>
                            <div>
                                <label style={label}>Skill Category</label>
                                <input type="text" placeholder="e.g. Programming, Sports" value={filters.skill_category} onChange={e => setFilters(f => ({ ...f, skill_category: e.target.value }))} style={formField} />
                            </div>
                            <div>
                                <label style={label}>Violation Severity</label>
                                <select value={filters.violation_severity} onChange={e => setFilters(f => ({ ...f, violation_severity: e.target.value }))} style={formField}>
                                    <option value="">Any</option>
                                    <option value="minor">Minor</option>
                                    <option value="major">Major</option>
                                    <option value="grave">Grave</option>
                                </select>
                            </div>
                            <div>
                                <label style={label}>Activity Category</label>
                                <input type="text" placeholder="e.g. Sports, Academic" value={filters.activity_category} onChange={e => setFilters(f => ({ ...f, activity_category: e.target.value }))} style={formField} />
                            </div>
                            <div>
                                <label style={label}>Award Level</label>
                                <select value={filters.award_level} onChange={e => setFilters(f => ({ ...f, award_level: e.target.value }))} style={formField}>
                                    <option value="">Any</option>
                                    <option value="school">School</option>
                                    <option value="regional">Regional</option>
                                    <option value="national">National</option>
                                    <option value="international">International</option>
                                </select>
                            </div>
                        </>}
                        {filters.type === 'faculties' && (
                            <div>
                                <label style={label}>Employment Type</label>
                                <select value={filters.employment_type} onChange={e => setFilters(f => ({ ...f, employment_type: e.target.value }))} style={formField}>
                                    <option value="">Any</option>
                                    <option value="full_time">Full Time</option>
                                    <option value="part_time">Part Time</option>
                                    <option value="contractual">Contractual</option>
                                </select>
                            </div>
                        )}
                        <div>
                            <label style={label}>Status</label>
                            <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} style={formField}>
                                <option value="">Any</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={() => { setActivePreset(null); runQuery(); }}>
                        {loading ? <Loader2 size={15} style={{ animation: 'spin .7s linear infinite' }} /> : <Play size={15} />}
                        {loading ? 'Running…' : 'Run Report'}
                    </button>
                </div>
            </div>

            {/* Results */}
            {results && (
                <div className="card">
                    <div className="card-header">
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Search size={16} color="#f97316" />
                            Results — <span style={{ color: '#f97316' }}>{results.count}</span>&nbsp;record(s) found
                        </h2>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        <div className="table-wrap">
                            {resultType === 'students' ? (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>#</th><th>Student No.</th><th>Name</th><th>Department</th>
                                            <th>Year / Section</th><th>GPA</th><th>Skills</th><th>Affiliations</th><th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.students?.map((s, i) => (
                                            <tr key={s.id}>
                                                <td>{i + 1}</td>
                                                <td><strong>{s.student_number}</strong></td>
                                                <td>{s.last_name}, {s.first_name}</td>
                                                <td>{s.department?.code}</td>
                                                <td>{s.year_level} {s.section ? `- ${s.section}` : ''}</td>
                                                <td><strong style={{ color: s.gpa <= 1.75 ? '#16a34a' : 'inherit' }}>{s.gpa ? parseFloat(s.gpa).toFixed(2) : '—'}</strong></td>
                                                <td>
                                                    <div className="tags">
                                                        {s.skills?.map(sk => <span key={sk.id} className={`badge badge-${sk.proficiency}`}>{sk.skill}</span>)}
                                                    </div>
                                                </td>
                                                <td>{s.affiliations?.map(a => <div key={a.id} style={{ fontSize: '.75rem' }}>{a.organization}</div>)}</td>
                                                <td><Badge value={s.status} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <table>
                                    <thead>
                                        <tr><th>#</th><th>Employee No.</th><th>Name</th><th>Department</th><th>Position</th><th>Type</th><th>Status</th></tr>
                                    </thead>
                                    <tbody>
                                        {results.faculties?.map((f, i) => (
                                            <tr key={f.id}>
                                                <td>{i + 1}</td>
                                                <td><strong>{f.employee_number}</strong></td>
                                                <td>{f.last_name}, {f.first_name}</td>
                                                <td>{f.department?.code}</td>
                                                <td>{f.position}</td>
                                                <td><Badge value={f.employment_type} /></td>
                                                <td><Badge value={f.status} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const iconWrap = { width: 44, height: 44, borderRadius: 12, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fed7aa' };
