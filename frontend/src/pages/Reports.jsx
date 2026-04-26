import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getReportStudents, getReportFaculties, getReportPresets, getDepartments } from '../api';
import {
    BarChart3, Zap, Settings2, Play, Loader2,
    Search, Dumbbell, Code2, BookOpenCheck, AlertTriangle, Trophy, Users, Activity,
    FileDown, FileSpreadsheet, X, FileText,
} from 'lucide-react';
import { ExportButtons, PrintHeader } from '../components/ExportControls';

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
const labelStyle = { fontSize: '.78rem', fontWeight: 700, display: 'block', marginBottom: 5, color: '#44403c', letterSpacing: .3 };

const SHORTCUT_LIMIT = 4;

// Build a human-readable filter summary for the print header
function buildFilterSummary(filters, resultType) {
    const parts = [`Type: ${resultType === 'faculties' ? 'Faculty' : 'Students'}`];
    if (filters.department) parts.push(`Department: ${filters.department}`);
    if (filters.gender) parts.push(`Gender: ${filters.gender}`);
    if (filters.status) parts.push(`Status: ${filters.status}`);
    if (filters.skill) parts.push(`Skill: ${filters.skill}${filters.skill_level ? ` (${filters.skill_level})` : ''}`);
    if (filters.affiliation) parts.push(`Affiliation: ${filters.affiliation}`);
    if (filters.violation_severity) parts.push(`Violation Severity: ${filters.violation_severity}`);
    if (filters.activity_category) parts.push(`Activity: ${filters.activity_category}`);
    if (filters.search) parts.push(`Search: "${filters.search}"`);
    return parts.join('  •  ');
}

// Flatten a student row into plain columns for Excel export
function flattenStudent(s, i) {
    return {
        '#': i + 1,
        'Student ID': s.student_id || `STU-${s.id}`,
        'Last Name': s.last_name || '',
        'First Name': s.first_name || '',
        'Gender': s.gender || '',
        'Age': s.age || '',
        'Department': s.department || '',
        'Status': s.status || '',
        'Skills': s.skills?.map(sk => sk.skill_name).join(', ') || '',
        'Affiliations': s.affiliations?.map(a => a.name).join(', ') || '',
        'Email': s.email || '',
        'Contact': s.contact_number || '',
    };
}

function flattenFaculty(f, i) {
    return {
        '#': i + 1,
        'Faculty ID': f.faculty_id || `FAC-${f.id}`,
        'Last Name': f.last_name || '',
        'First Name': f.first_name || '',
        'Department': f.department || '',
        'Position': f.position || '',
        'Email': f.email || '',
        'Contact': f.contact_number || '',
    };
}

export default function Reports() {
    const [results, setResults] = useState(null);
    const [resultType, setResultType] = useState('students');
    const [lastRunFilters, setLastRunFilters] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activePreset, setActivePreset] = useState(null);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;
    const [presets, setPresets] = useState({ skills: [], affiliations: [] });
    const [presetsLoading, setPresetsLoading] = useState(true);
    const [departments, setDepartments] = useState([
        { id: 1, code: 'CS', name: 'Computer Science' },
        { id: 2, code: 'IT', name: 'Information Technology' },
    ]);
    const [showAllGeneral, setShowAllGeneral] = useState(false);
    const [showAllSkills, setShowAllSkills] = useState(false);
    const [showAllAffiliations, setShowAllAffiliations] = useState(false);
    const printRef = useRef();

    useEffect(() => {
        getReportPresets()
            .then(r => setPresets(r.data))
            .catch(() => setPresets({ skills: [], affiliations: [] }))
            .finally(() => setPresetsLoading(false));
        getDepartments()
            .then(r => { if (r.data?.length) setDepartments(r.data); })
            .catch(e => console.error('Departments load failed:', e));
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
        const { type: _omit, ...cleanFilters } = filters;
        const params = overrideParams || cleanFilters;
        try {
            const fn = t === 'faculties' ? getReportFaculties : getReportStudents;
            const res = await fn(params);
            setResults(res.data);
            setResultType(t);
            setLastRunFilters({ ...params, type: t });
            setPage(1);
        } finally { setLoading(false); }
    };

    return (
        <>
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
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                                {[
                                    { label: 'Students with Major Violations', Icon: AlertTriangle, params: { violation_severity: 'major', status: 'active' }, type: 'students' },
                                    { label: 'Students with Grave Violations', Icon: AlertTriangle, params: { violation_severity: 'grave', status: 'active' }, type: 'students' },
                                    { label: 'Certified Skill Holders', Icon: BookOpenCheck, params: { certification: '1', status: 'active' }, type: 'students' },
                                    { label: 'All Faculty', Icon: Users, params: {}, type: 'faculties' },
                                ].slice(0, showAllGeneral ? undefined : SHORTCUT_LIMIT).map(p => {
                                    const IconComp = p.Icon;
                                    const active = activePreset === p.label;
                                    return (
                                        <button key={p.label} className={`btn ${active ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setActivePreset(p.label); runQuery(p.params, p.type); }}>
                                            <IconComp size={14} />{p.label}
                                        </button>
                                    );
                                })}
                            </div>
                            {[1,2,3,4].length > SHORTCUT_LIMIT && (
                                <button className="btn btn-ghost" style={{ fontSize: '.78rem', marginBottom: 16 }} onClick={() => setShowAllGeneral(v => !v)}>
                                    {showAllGeneral ? 'See less' : `See more`}
                                </button>
                            )}
                            <div style={{ marginBottom: 8 }} />

                            {/* Skills-based presets */}
                            {presets.skills.length > 0 && (
                                <>
                                    <div style={{ fontSize: '.72rem', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>By Skill</div>
                                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                                        {presets.skills.slice(0, showAllSkills ? undefined : SHORTCUT_LIMIT).map(skill => {
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
                                    {presets.skills.length > SHORTCUT_LIMIT && (
                                        <button className="btn btn-ghost" style={{ fontSize: '.78rem', marginBottom: 16 }} onClick={() => setShowAllSkills(v => !v)}>
                                            {showAllSkills ? 'See less' : `See more (${presets.skills.length - SHORTCUT_LIMIT} more)`}
                                        </button>
                                    )}
                                    <div style={{ marginBottom: 8 }} />
                                </>
                            )}

                            {/* Affiliation presets */}
                            {presets.affiliations?.length > 0 && (
                                <>
                                    <div style={{ fontSize: '.72rem', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>By Affiliations</div>
                                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                                        {presets.affiliations.slice(0, showAllAffiliations ? undefined : SHORTCUT_LIMIT).map(aff => {
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
                                    {presets.affiliations.length > SHORTCUT_LIMIT && (
                                        <button className="btn btn-ghost" style={{ fontSize: '.78rem' }} onClick={() => setShowAllAffiliations(v => !v)}>
                                            {showAllAffiliations ? 'See less' : `See more (${presets.affiliations.length - SHORTCUT_LIMIT} more)`}
                                        </button>
                                    )}
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
                            <label style={labelStyle}>Report Type</label>
                            <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))} style={formField}>
                                <option value="students">Students</option>
                                <option value="faculties">Faculty</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Department</label>
                            <select value={filters.department} onChange={e => setFilters(f => ({ ...f, department: e.target.value }))} style={formField}>
                                <option value="">All Departments</option>
                                {departments.map(d => (
                                    <option key={d.id} value={d.code}>{d.code} — {d.name}</option>
                                ))}
                            </select>
                        </div>
                        {filters.type === 'students' && <>
                            <div>
                                <label style={labelStyle}>Gender</label>
                                <select value={filters.gender} onChange={e => setFilters(f => ({ ...f, gender: e.target.value }))} style={formField}>
                                    <option value="">Any</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Skill (e.g. Basketball)</label>
                                <input type="text" placeholder="Skill keyword" value={filters.skill} onChange={e => setFilters(f => ({ ...f, skill: e.target.value }))} style={formField} />
                            </div>
                            <div>
                                <label style={labelStyle}>Skill Level</label>
                                <select value={filters.skill_level} onChange={e => setFilters(f => ({ ...f, skill_level: e.target.value }))} style={formField}>
                                    <option value="">Any</option>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                    <option value="expert">Expert</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Affiliation Name</label>
                                <input type="text" placeholder="e.g. Chess Club" value={filters.affiliation} onChange={e => setFilters(f => ({ ...f, affiliation: e.target.value }))} style={formField} />
                            </div>
                            <div>
                                <label style={labelStyle}>Affiliation Type</label>
                                <input type="text" placeholder="e.g. Academic, Sports" value={filters.affiliation_type} onChange={e => setFilters(f => ({ ...f, affiliation_type: e.target.value }))} style={formField} />
                            </div>
                            <div>
                                <label style={labelStyle}>Violation Severity</label>
                                <select value={filters.violation_severity} onChange={e => setFilters(f => ({ ...f, violation_severity: e.target.value }))} style={formField}>
                                    <option value="">Any</option>
                                    <option value="minor">Minor</option>
                                    <option value="major">Major</option>
                                    <option value="grave">Grave</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Activity Category</label>
                                <input type="text" placeholder="e.g. Sports, Academic" value={filters.activity_category} onChange={e => setFilters(f => ({ ...f, activity_category: e.target.value }))} style={formField} />
                            </div>
                            <div>
                                <label style={labelStyle}>Status</label>
                                <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} style={formField}>
                                    <option value="">Any</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="graduated">Alumni</option>
                                    <option value="loa">LOA</option>
                                </select>
                            </div>
                        </>}
                        <div>
                            <label style={labelStyle}>Search</label>
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
            {results && (() => {
                const rows = resultType === 'students' ? (results.students || []) : (results.faculties || []);
                const totalPages = Math.ceil(rows.length / PAGE_SIZE);
                const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
                return (
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                            <Search size={16} color="#f97316" />
                            Results — <span style={{ color: '#f97316' }}>{results.count}</span>&nbsp;record(s) found
                        </h2>
                        {/* Export Buttons */}
                        {/* Export Buttons provided via shared component */}
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                            <ExportButtons 
                                printRef={printRef} 
                                data={resultType === 'students' ? results.students : results.faculties} 
                                flattenFn={resultType === 'students' ? flattenStudent : flattenFaculty}
                                filenamePrefix={`Report_${resultType}`}
                            />
                        </div>
                    </div>

                    {/* Printable area — captured by html2pdf */}
                    <div ref={printRef}>
                        {/* Using standard shared Print Header */}
                        <PrintHeader 
                            title="Filter &amp; Query Report"
                            subtitle={resultType === 'faculties' ? 'Faculty' : 'Students'}
                            count={results.count}
                            filters={lastRunFilters}
                        />

                        <div className="card-body" style={{ padding: 0 }}>
                            <div className="table-wrap">
                                {resultType === 'students' ? (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>#</th><th>Student ID</th><th>Name</th><th>Gender</th>
                                                <th>Age</th><th>Department</th><th>Skills</th><th>Affiliations</th><th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paged.map((s, i) => (
                                                <tr key={s.id}>
                                                    <td>{(page - 1) * PAGE_SIZE + i + 1}</td>
                                                    <td><strong>{s.student_id || `STU-${s.id}`}</strong></td>
                                                    <td>{s.last_name}, {s.first_name}</td>
                                                    <td>{s.gender || '—'}</td>
                                                    <td>{s.age || '—'}</td>
                                                    <td>{s.department || '—'}</td>
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
                                            {paged.map((f, i) => (
                                                <tr key={f.id}>
                                                    <td>{(page - 1) * PAGE_SIZE + i + 1}</td>
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
                            {totalPages > 1 && (
                                <div className="pdf-hide" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid #f1f5f9' }}>
                                    <span style={{ fontSize: '.8rem', color: '#78716c' }}>
                                        Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, rows.length)} of {rows.length}
                                    </span>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '.8rem' }} disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                            <button key={p} className={`btn ${p === page ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '5px 10px', fontSize: '.8rem', minWidth: 34 }} onClick={() => setPage(p)}>{p}</button>
                                        ))}
                                        <button className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '.8rem' }} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                );
            })()}
        </>
    );
}

const iconWrap = { width: 44, height: 44, borderRadius: 12, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fed7aa' };
