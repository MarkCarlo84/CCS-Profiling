import React, { useState, useEffect, useCallback } from 'react';
import { getSkills, deleteSkill, updateSkillLevel } from '../api';
import { useDebounce } from '../hooks/useDebounce';
import { SkeletonTable } from '../components/SkeletonLoader';
import { Zap, Search, Pencil, Trash2, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { ExportButtons, PrintHeader } from '../components/ExportControls';
import { useRef } from 'react';

function flattenSkill(s, i) {
    return {
        '#': i + 1,
        'Level Group': s._level || '',
        'Student ID': s.student?.student_id || s.student_id || '',
        'Name': s.student ? `${s.student.first_name} ${s.student.last_name}` : '',
        'Skill Name': s.skill_name || '',
        'Level': s.skill_level || '',
        'Certified': s.certification ? 'Yes' : 'No'
    };
}

const LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];
const LEVEL_COLORS = { expert: '#7c3aed', advanced: '#2563eb', intermediate: '#059669', beginner: '#d97706' };

function LevelModal({ skill, onClose, onSaved }) {
    const [level, setLevel] = useState(skill.skill_level);
    const [saving, setSaving] = useState(false);
    const save = async () => { setSaving(true); await updateSkillLevel(skill.id, level); onSaved(); onClose(); };
    return (
        <div style={overlay}>
            <div style={modalCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Update Skill Level</h2>
                    <button onClick={onClose} style={iconBtn}><X size={15} /></button>
                </div>
                <p style={{ fontSize: '.85rem', color: '#78716c', marginBottom: 14 }}><strong>{skill.skill_name}</strong></p>
                <label style={lStyle}>Level</label>
                <select style={{ ...iStyle, marginBottom: 16 }} value={level} onChange={e => setLevel(e.target.value)}>
                    {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                </select>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={save} disabled={saving}><Check size={14} /> {saving ? 'Saving...' : 'Save'}</button>
                </div>
            </div>
        </div>
    );
}

export default function SkillsMap() {
    const [grouped, setGrouped] = useState({});
    const [pages, setPages] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingLevel, setLoadingLevel] = useState(null);
    const [search, setSearch] = useState('');
    const [filterLevel, setFilterLevel] = useState('');
    const [editing, setEditing] = useState(null);

    const printRef = useRef(null);

    const debouncedSearch = useDebounce(search, 300);

    const buildPageParams = (pagesMap) =>
        Object.fromEntries(Object.entries(pagesMap).map(([lvl, pg]) => [`page_${lvl}`, pg]));

    const load = useCallback((pagesMap = pages) => {
        setLoading(true);
        getSkills({ search: debouncedSearch, skill_level: filterLevel, ...buildPageParams(pagesMap) })
            .then(r => {
                setGrouped(r.data);
                setPages(prev => {
                    const next = { ...prev };
                    Object.keys(r.data).forEach(lvl => { if (!(lvl in next)) next[lvl] = 1; });
                    return next;
                });
            })
            .finally(() => setLoading(false));
    }, [debouncedSearch, filterLevel]);

    useEffect(() => { setPages({}); load({}); }, [debouncedSearch, filterLevel]);

    const goToPage = (level, page) => {
        const next = { ...pages, [level]: page };
        setPages(next);
        setLoadingLevel(level);
        getSkills({ search, skill_level: filterLevel, ...buildPageParams(next) })
            .then(r => setGrouped(r.data))
            .finally(() => setLoadingLevel(null));
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this skill record?')) return;
        await deleteSkill(id);
        load();
    };

    const totalCount = Object.values(grouped).reduce((sum, cat) => sum + (cat.total ?? 0), 0);

    const loadedData = Object.entries(grouped).flatMap(([lvl, cat]) => 
        (cat.data || []).map(s => ({ ...s, _level: lvl }))
    );

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <div style={iconWrap}><Zap size={22} color="#f97316" /></div>
                    <h1 style={h1}>Skills</h1>
                </div>
                <p style={sub}>Student skills, proficiency levels and certifications — {totalCount} total</p>
            </div>

            <div className="filter-bar no-print">
                <div style={{ position: 'relative' }}>
                    <Search size={15} color="#f97316" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" placeholder="Search skill name..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
                </div>
                <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
                    <option value="">All Levels</option>
                    {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                </select>
                <div style={{ flex: 1 }} />
                <ExportButtons 
                    printRef={printRef} 
                    data={loadedData} 
                    flattenFn={flattenSkill} 
                    filenamePrefix="Skills_Map" 
                />
            </div>

            <div ref={printRef} style={{ background: '#fff' }}>
                <PrintHeader 
                    title="Skills Map" 
                    subtitle="Student skills, proficiency levels and certifications" 
                    count={totalCount} 
                    filters={{ search, level: filterLevel }} 
                />

                {loading ? (
                <div className="loading"><div className="loading-spinner" /><p>Loading...</p></div>
            ) : Object.keys(grouped).length === 0 ? (
                <div className="empty"><Zap size={40} color="#fed7aa" /><p style={{ marginTop: 10 }}>No skills found.</p></div>
            ) : (
                LEVELS.filter(lvl => grouped[lvl]).map(lvl => {
                    const cat = grouped[lvl];
                    const items = cat.data ?? [];
                    const currentPage = cat.current_page ?? 1;
                    const lastPage = cat.last_page ?? 1;
                    const color = LEVEL_COLORS[lvl];

                    return (
                        <div key={lvl} className="card" style={{ marginBottom: 20 }}>
                            <div className="card-header" style={{ background: `linear-gradient(135deg,${color},${color}cc)`, color: '#fff' }}>
                                <h2 style={{ color: '#fff', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Zap size={16} /> {lvl}
                                </h2>
                                <span className="badge" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>{cat.total}</span>
                            </div>

                            <div className="card-body" style={{ padding: 0, opacity: loadingLevel === lvl ? 0.5 : 1, transition: 'opacity .2s' }}>
                                <div className="subjects-table-wrap" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                                    <table style={{ minWidth: 460 }}>
                                        <thead>
                                            <tr><th>#</th><th>Student ID</th><th>Name</th><th>Skill Name</th><th>Level</th><th>Certified</th><th>Actions</th></tr>
                                        </thead>
                                        <tbody>
                                            {items.map((s, i) => (
                                                <tr key={s.id}>
                                                    <td>{(currentPage - 1) * 5 + i + 1}</td>
                                                    <td><strong>{s.student?.student_id ?? s.student_id}</strong></td>
                                                    <td>{s.student ? `${s.student.first_name} ${s.student.last_name}` : '—'}</td>
                                                    <td>{s.skill_name}</td>
                                                    <td><span className={`badge badge-${s.skill_level}`} style={{ textTransform: 'capitalize' }}>{s.skill_level}</span></td>
                                                    <td>{s.certification ? <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '.8rem' }}>Yes</span> : <span style={{ color: '#a8a29e', fontSize: '.8rem' }}>No</span>}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: 6 }}>
                                                            <button style={iconBtn} onClick={() => setEditing(s)}><Pencil size={13} /></button>
                                                            <button style={{ ...iconBtn, color: '#dc2626' }} onClick={() => remove(s.id)}><Trash2 size={13} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {items.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#a8a29e', padding: 32 }}>No skills found.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="subjects-card-list">
                                    {items.map((s, i) => (
                                        <div key={s.id} style={{ padding: '11px 14px', borderTop: i > 0 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                                                    <strong style={{ color: '#f97316', fontSize: '.82rem', fontFamily: 'monospace' }}>{s.student?.student_id ?? s.student_id}</strong>
                                                    {s.student && <span style={{ fontSize: '.82rem', color: '#44403c' }}>{s.student.first_name} {s.student.last_name}</span>}
                                                    <span className={`badge badge-${s.skill_level}`} style={{ textTransform: 'capitalize' }}>{s.skill_level}</span>
                                                    {s.certification && <span style={{ fontSize: '.7rem', color: '#16a34a', fontWeight: 700 }}>Certified</span>}
                                                </div>
                                                <div style={{ fontWeight: 600, fontSize: '.875rem', color: '#1c1917' }}>{s.skill_name}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                                <button style={iconBtn} onClick={() => setEditing(s)}><Pencil size={13} /></button>
                                                <button style={{ ...iconBtn, color: '#dc2626' }} onClick={() => remove(s.id)}><Trash2 size={13} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {lastPage > 1 && (
                                    <div style={paginationWrap}>
                                        <button style={pageBtn} disabled={currentPage === 1} onClick={() => goToPage(lvl, currentPage - 1)}>
                                            <ChevronLeft size={14} />
                                        </button>
                                        <span style={{ fontSize: '.82rem', color: '#78716c' }}>Page {currentPage} of {lastPage}</span>
                                        <button style={pageBtn} disabled={currentPage === lastPage} onClick={() => goToPage(lvl, currentPage + 1)}>
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
            </div>

            {editing && <LevelModal skill={editing} onClose={() => setEditing(null)} onSaved={() => load()} />}
        </div>
    );
}

const h1 = { fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 };
const sub = { color: '#78716c', margin: 0 };
const iconWrap = { width: 44, height: 44, borderRadius: 12, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fed7aa' };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 };
const modalCard = { background: '#fff', borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,.2)' };
const iconBtn = { background: 'rgba(0,0,0,.04)', border: '1px solid rgba(0,0,0,.08)', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#78716c' };
const paginationWrap = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '10px 14px', borderTop: '1px solid var(--border)' };
const pageBtn = { background: 'rgba(0,0,0,.04)', border: '1px solid rgba(0,0,0,.08)', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const lStyle = { display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#44403c', marginBottom: 5, letterSpacing: .3 };
const iStyle = { width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid #e7e5e4', fontSize: '.875rem', fontFamily: "'Inter',sans-serif", color: '#1c1917', boxSizing: 'border-box' };
