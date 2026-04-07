import React, { useState, useEffect } from 'react';
import { getReportStudents, getReportFaculties, getReportPresets } from '../api';
import {
    BarChart3, Zap, Settings2, Play, Loader2,
    Search, Dumbbell, Code2, BookOpenCheck, AlertTriangle, Trophy, Users, Activity,
} from 'lucide-react';

function Badge({ value }) {
    return value ? <span className={`badge badge-${value.toLowerCase().replace(/\s/g, '_')}`}>{value.replace(/_/g, ' ')}</span> : null;
}

// Icon picker based on skill/category name
function presetIcon(name) {
    const n = name.toLowerCase();
    if (n.includes('basketball') || n.includes('volleyball') || n.includes('sport')) return Dumbbell;
    if (n.includes('program') || n.includes('coding') || n.includes('dev') || n.includes('tech')) return Code2;
    if (n.includes('academic') || n.includes('research') || n.includes('scholar')) return BookOpenCheck;
    if (n.includes('art') || n.includes('music') || n.includes('dance') || n.includes('theater')) return Trophy;
    return Activity;
}

const formField = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #fed7aa', fontSize: '.875rem', fontFamily: 'Inter,sans-serif', background: '#fff', color: '#1c1917', outline: 'none' };
const label = { fontSize: '.78rem', fontWeight: 700, display: 'block', marginBottom: 5, color: '#44403c', letterSpacing: .3 };

export default function Reports() {
    const [results, setResults] = useState(null);
    const [resultType, setResultType] = useState('students');
    const [loading, setLoading] = useState(false);
    const [activePreset, setActivePreset] = useState(null);
    const [presets, setPresets] = useState({ skills: [], categories: [] });
    const [presetsLoading, setPresetsLoading] = useState(true);

    useEffect(() => {
        getReportPresets()
            .then(r => setPresets(r.data))
            .finally(() => setPresetsLoading(false));
    }, []);

    const [filters, setFilters] = useState({
        type: 'students',
        gender: '', status: 'active',
        skill: '', skill_level: '',
        affiliation: '', affiliation_type: '',
        has_violation: '', violation_severity: '',
        activity_category: '',
        department: '', search: '',
    });

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

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <div style={iconWrap}><BarChart3 size={22} color="#f97316" /></div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>Filter &amp; Queries</h1>
                </div>
                <p style={{ color: '#78716c' }}>Filter students or faculty by any combination of criteria to generate targeted reports</p>
            </div>

            {/* Preset Reports */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Zap size={16} color="#f97316" />Filter</h2>
                </div>
                <div className="card-body">
                    {presetsLoading ? (
                        <div style={{ color: '#a8a29e', fontSize: '.85rem' }}>Loading presets…</div>
                    ) : (
                        <>
                            {/* Always-on presets */}
                            <div style={{ fontSize: '.72rem', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>General</div>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                                {[
                                    { label: 'Students with Major Violations', Icon: AlertTriangle, params: { violation_severity: 'major', status: 'active' }, type: 'students' },
                                    { label: 'Students with Grave Violations', Icon: AlertTriangle, params: { violation_severity: 'grave', status: 'active' }, type: 'students' },
                                    { label: 'Certified Skill Holders', Icon: BookOpenCheck, params: { certification: '1', status: 'active' }, type: 'students' },
                                    { label: 'All Faculty', Icon: Users, params: {}, type: 'faculties' },
                                ].map(p => {
                                    const IconComp = p.Icon;
                                    const active = activePreset === p.label;
                                    return (
                                        <button key={p.label} className={`btn ${active ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setActivePreset(p.label); runQuery(p.params, p.type); }}>
                                            <IconComp size={14} />{p.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Skills-based presets */}
                            {presets.skills.length > 0 && (
                                <>
                                    <div style={{ fontSize: '.72rem', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>By Skill</div>
                                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                                        {presets.skills.map(skill => {
                                            const IconComp = presetIcon(skill);
                                            const label = `${skill} Students`;
                                            const active = activePreset === label;
                                            return (
                                                <button key={skill} className={`btn ${active ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setActivePreset(label); runQuery({ skill, status: 'active' }, 'students'); }}>
                                                    <IconComp size={14} />{label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}

                            {/* Affiliation presets */}
                            {presets.affiliations?.length > 0 && (
                                <>
                                    <div style={{ fontSize: '.72rem', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>By Affiliations</div>
                                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                        {presets.affiliations.map(aff => {
                                            const IconComp = presetIcon(aff);
                                            const lbl = `${aff}`;
                                            const active = activePreset === lbl;
                                            return (
                                                <button key={aff} className={`btn ${active ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setActivePreset(lbl); runQuery({ affiliation: aff, status: 'active' }, 'students'); }}>
                                                    <IconComp size={14} />{lbl}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}

                            {presets.skills.length === 0 && !presets.affiliations?.length && (
                                <p style={{ color: '#a8a29e', fontSize: '.85rem', margin: '8px 0 0' }}>No skill or affiliation data yet. Add student skills and affiliations to generate dynamic presets.</p>
                            )}
                        </>
                    )}
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
                            <input type="text" placeholder="e.g. CS, IT" value={filters.department} onChange={e => setFilters(f => ({ ...f, department: e.target.value }))} style={formField} />
                        </div>
                        {filters.type === 'students' && <>
                            <div>
                                <label style={label}>Gender</label>
                                <select value={filters.gender} onChange={e => setFilters(f => ({ ...f, gender: e.target.value }))} style={formField}>
                                    <option value="">Any</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label style={label}>Skill (e.g. Basketball)</label>
                                <input type="text" placeholder="Skill keyword" value={filters.skill} onChange={e => setFilters(f => ({ ...f, skill: e.target.value }))} style={formField} />
                            </div>
                            <div>
                                <label style={label}>Skill Level</label>
                                <select value={filters.skill_level} onChange={e => setFilters(f => ({ ...f, skill_level: e.target.value }))} style={formField}>
                                    <option value="">Any</option>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                    <option value="expert">Expert</option>
                                </select>
                            </div>
                            <div>
                                <label style={label}>Affiliation Type</label>
                                <input type="text" placeholder="e.g. Academic, Sports" value={filters.affiliation_type} onChange={e => setFilters(f => ({ ...f, affiliation_type: e.target.value }))} style={formField} />
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
                        </>}
                        <div>
                            <label style={label}>Status</label>
                            <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} style={formField}>
                                <option value="">Any</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="graduated">Graduated</option>
                                <option value="dropped">Dropped</option>
                            </select>
                        </div>
                        <div>
                            <label style={label}>Search</label>
                            <input type="text" placeholder="Name or ID…" value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} style={formField} />
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
                                            <th>#</th><th>Student ID</th><th>Name</th><th>Gender</th>
                                            <th>Age</th><th>Skills</th><th>Affiliations</th><th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.students?.map((s, i) => (
                                            <tr key={s.id}>
                                                <td>{i + 1}</td>
                                                <td><strong>{s.student_id || `STU-${s.id}`}</strong></td>
                                                <td>{s.last_name}, {s.first_name}</td>
                                                <td>{s.gender || '—'}</td>
                                                <td>{s.age || '—'}</td>
                                                <td>
                                                    <div className="tags">
                                                        {s.skills?.map(sk => <span key={sk.id} className={`badge badge-${sk.skill_level}`}>{sk.skill_name}</span>)}
                                                    </div>
                                                </td>
                                                <td>{s.affiliations?.map(a => <div key={a.id} style={{ fontSize: '.75rem' }}>{a.name} ({a.type})</div>)}</td>
                                                <td><Badge value={s.status} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <table>
                                    <thead>
                                        <tr><th>#</th><th>Faculty ID</th><th>Name</th><th>Department</th><th>Position</th><th>Contact</th></tr>
                                    </thead>
                                    <tbody>
                                        {results.faculties?.map((f, i) => (
                                            <tr key={f.id}>
                                                <td>{i + 1}</td>
                                                <td><strong>{f.faculty_id || `FAC-${f.id}`}</strong></td>
                                                <td>{f.last_name}, {f.first_name}</td>
                                                <td>{f.department || '—'}</td>
                                                <td>{f.position}</td>
                                                <td style={{ fontSize: '.75rem' }}>{f.contact_number || f.email || '—'}</td>
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
