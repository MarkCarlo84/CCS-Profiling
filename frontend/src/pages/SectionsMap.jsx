import { useEffect, useState } from 'react';
import { getStudents } from '../api';
import { Users, GraduationCap, ChevronRight, ArrowLeft, Search } from 'lucide-react';

const YEAR_NUM = { '1st Year': 1, '2nd Year': 2, '3rd Year': 3, '4th Year': 4 };
const DEPT_LABEL = { IT: 'Information Technology', CS: 'Computer Science' };

function fmtSection(yearNum, dept, section) {
    return `${yearNum}${dept}-${section}`;
}

function getYearNum(student) {
    const records = student.academic_records ?? [];
    return records.length ? Math.max(...records.map(r => r.year_level ?? 0)) : null;
}

export default function SectionsMap() {
    const [allStudents, setAllStudents] = useState([]);
    const [loading, setLoading]         = useState(true);
    const [selected, setSelected]       = useState(null); // { yearNum, dept, section }
    const [search, setSearch]           = useState('');

    useEffect(() => {
        getStudents({}).then(r => setAllStudents(r.data)).finally(() => setLoading(false));
    }, []);

    // Build section groups: key = "1IT-A", value = [students]
    const sectionMap = {};
    allStudents.forEach(s => {
        if (!s.section) return;
        const yn = getYearNum(s);
        if (!yn) return;
        const key = fmtSection(yn, s.department, s.section);
        if (!sectionMap[key]) sectionMap[key] = { yearNum: yn, dept: s.department, section: s.section, students: [] };
        sectionMap[key].students.push(s);
    });

    // Sort keys: by year, then dept, then section
    const sortedKeys = Object.keys(sectionMap).sort((a, b) => {
        const ga = sectionMap[a], gb = sectionMap[b];
        if (ga.yearNum !== gb.yearNum) return ga.yearNum - gb.yearNum;
        if (ga.dept !== gb.dept) return ga.dept.localeCompare(gb.dept);
        return ga.section.localeCompare(gb.section);
    });

    // Group by year for display
    const byYear = sortedKeys.reduce((acc, key) => {
        const yn = sectionMap[key].yearNum;
        const label = ['', '1st Year', '2nd Year', '3rd Year', '4th Year'][yn] ?? `Year ${yn}`;
        if (!acc[label]) acc[label] = [];
        acc[label].push(key);
        return acc;
    }, {});

    // Selected section students (filtered by search)
    const selectedStudents = selected
        ? (sectionMap[selected]?.students ?? []).filter(s => {
            const q = search.toLowerCase();
            return !q
                || (s.first_name || '').toLowerCase().includes(q)
                || (s.last_name  || '').toLowerCase().includes(q)
                || (s.student_id || '').toLowerCase().includes(q);
          })
        : [];

    const iconWrap = { width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#f97316,#fb923c)', display: 'flex', alignItems: 'center', justifyContent: 'center' };

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading sections…</div>;

    // ── Section detail view ───────────────────────────────────────────────────
    if (selected) {
        const grp = sectionMap[selected];
        return (
            <div>
                <div className="page-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button onClick={() => { setSelected(null); setSearch(''); }}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: '#64748b', fontSize: '.82rem', fontWeight: 600 }}>
                            <ArrowLeft size={14} /> Back
                        </button>
                        <div style={iconWrap}><Users size={20} color="#fff" /></div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1c1917' }}>Section {selected}</h1>
                            <p style={{ margin: 0, color: '#78716c', fontSize: '.82rem' }}>
                                {DEPT_LABEL[grp.dept]} · {['','1st','2nd','3rd','4th'][grp.yearNum]} Year · {grp.students.length} students
                            </p>
                        </div>
                    </div>
                </div>

                <div className="filter-bar">
                    <div style={{ position: 'relative' }}>
                        <Search size={14} color="#f97316" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text" placeholder="Search name or student ID…"
                            value={search} onChange={e => setSearch(e.target.value)}
                            style={{ paddingLeft: 32 }}
                        />
                    </div>
                </div>

                <div className="card">
                    <div className="card-body" style={{ padding: 0 }}>
                        <div className="subjects-table-wrap" style={{ overflowX: 'auto' }}>
                            <table style={{ minWidth: 600 }}>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Student ID</th>
                                        <th>Full Name</th>
                                        <th>Gender</th>
                                        <th>Age</th>
                                        <th>Contact</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedStudents.length === 0 ? (
                                        <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>No students found.</td></tr>
                                    ) : selectedStudents.map((stu, idx) => (
                                        <tr key={stu.id}>
                                            <td style={{ color: '#94a3b8', fontSize: '.8rem' }}>{idx + 1}</td>
                                            <td><strong style={{ color: '#f97316', fontFamily: 'monospace' }}>{stu.student_id || `STU-${stu.id}`}</strong></td>
                                            <td style={{ fontWeight: 600 }}>{stu.last_name}, {stu.first_name}{stu.middle_name ? ` ${stu.middle_name[0]}.` : ''}</td>
                                            <td>{stu.gender || '—'}</td>
                                            <td>{stu.age || '—'}</td>
                                            <td style={{ fontSize: '.8rem' }}>{stu.contact_number || '—'}</td>
                                            <td>
                                                <span style={{
                                                    fontSize: '.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                                                    background: stu.status === 'active' ? '#dcfce7' : '#f1f5f9',
                                                    color: stu.status === 'active' ? '#16a34a' : '#64748b',
                                                    textTransform: 'capitalize'
                                                }}>{stu.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Section list view ─────────────────────────────────────────────────────
    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={iconWrap}><Users size={20} color="#fff" /></div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1c1917' }}>Sections</h1>
                        <p style={{ margin: 0, color: '#78716c', fontSize: '.82rem' }}>
                            {sortedKeys.length} sections · {allStudents.filter(s => s.section).length} students assigned
                        </p>
                    </div>
                </div>
            </div>

            {Object.keys(byYear).map(yearLabel => (
                <div key={yearLabel} style={{ marginBottom: 28 }}>
                    {/* Year group header */}
                    <div style={{ fontSize: '.7rem', fontWeight: 800, color: '#f97316', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ height: 2, width: 16, background: '#f97316', borderRadius: 2 }} />
                        {yearLabel}
                        <div style={{ height: 2, flex: 1, background: '#fed7aa', borderRadius: 2 }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                        {byYear[yearLabel].map(key => {
                            const grp = sectionMap[key];
                            const deptColor = grp.dept === 'IT' ? '#2563eb' : '#7c3aed';
                            const deptBg    = grp.dept === 'IT' ? '#eff6ff' : '#f5f3ff';
                            const deptBorder = grp.dept === 'IT' ? '#bfdbfe' : '#ddd6fe';
                            return (
                                <button key={key} onClick={() => setSelected(key)}
                                    style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 20px', cursor: 'pointer', textAlign: 'left', transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(249,115,22,.12)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    <div>
                                        <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1c1917', letterSpacing: '-.02em', marginBottom: 6 }}>{key}</div>
                                        <span style={{ fontSize: '.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: deptBg, color: deptColor, border: `1px solid ${deptBorder}` }}>
                                            {grp.dept === 'IT' ? 'Info Tech' : 'Comp Sci'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <GraduationCap size={14} color="#94a3b8" />
                                            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#1c1917' }}>{grp.students.length}</span>
                                        </div>
                                        <span style={{ fontSize: '.68rem', color: '#94a3b8' }}>students</span>
                                        <ChevronRight size={14} color="#cbd5e1" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
