import React, { useState, useEffect, useCallback } from 'react';
import { getNonAcademicHistories, deleteNonAcademicHistory } from '../api';
import { Trophy, Search, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const CAT_COLORS = { Academic: '#2563eb', Sports: '#16a34a', Leadership: '#7c3aed', Cultural: '#d97706', Community: '#0891b2' };

export default function NonAcademicHistoriesMap() {
    const [grouped, setGrouped] = useState({});
    const [pages, setPages] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingCat, setLoadingCat] = useState(null);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');

    const buildPageParams = (pagesMap) =>
        Object.fromEntries(
            Object.entries(pagesMap).map(([cat, pg]) => [
                'page_' + cat.replace(/\s/g, '_').toLowerCase(), pg
            ])
        );

    const load = useCallback((pagesMap = pages) => {
        setLoading(true);
        getNonAcademicHistories({ search, category, ...buildPageParams(pagesMap) })
            .then(r => {
                setGrouped(r.data);
                setPages(prev => {
                    const next = { ...prev };
                    Object.keys(r.data).forEach(cat => { if (!(cat in next)) next[cat] = 1; });
                    return next;
                });
            })
            .finally(() => setLoading(false));
    }, [search, category]);

    useEffect(() => { setPages({}); load({}); }, [search, category]);

    const goToPage = (cat, page) => {
        const next = { ...pages, [cat]: page };
        setPages(next);
        setLoadingCat(cat);
        getNonAcademicHistories({ search, category, ...buildPageParams(next) })
            .then(r => setGrouped(r.data))
            .finally(() => setLoadingCat(null));
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this record?')) return;
        await deleteNonAcademicHistory(id);
        load();
    };

    const totalCount = Object.values(grouped).reduce((sum, cat) => sum + (cat.total ?? 0), 0);

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <div style={iconWrap}><Trophy size={22} color="#f97316" /></div>
                    <h1 style={h1}>Non-Academic Histories</h1>
                </div>
                <p style={sub}>Competitions, sports, leadership and cultural activities — {totalCount} total</p>
            </div>

            <div className="filter-bar">
                <div style={{ position: 'relative' }}>
                    <Search size={15} color="#f97316" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" placeholder="Search activity title…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
                </div>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="">All Categories</option>
                    {['Academic', 'Sports', 'Leadership', 'Cultural', 'Community'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {loading ? (
                <div className="loading"><div className="loading-spinner" /></div>
            ) : Object.keys(grouped).length === 0 ? (
                <div className="empty"><Trophy size={40} color="#fed7aa" /><p style={{ marginTop: 10 }}>No records found.</p></div>
            ) : (
                Object.entries(grouped).map(([cat, catData]) => {
                    const items = catData.data ?? [];
                    const currentPage = catData.current_page ?? 1;
                    const lastPage = catData.last_page ?? 1;
                    const clr = CAT_COLORS[cat] || '#f97316';

                    return (
                        <div key={cat} className="card" style={{ marginBottom: 20 }}>
                            <div className="card-header" style={{ background: `linear-gradient(135deg,${clr},${clr}cc)`, color: '#fff' }}>
                                <h2 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Trophy size={16} /> {cat}
                                </h2>
                                <span className="badge" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>{catData.total}</span>
                            </div>

                            <div className="card-body" style={{ padding: 0, opacity: loadingCat === cat ? 0.5 : 1, transition: 'opacity .2s' }}>
                                <div className="subjects-table-wrap" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                                    <table style={{ minWidth: 580 }}>
                                        <thead>
                                            <tr><th>#</th><th>Student ID</th><th>Name</th><th>Activity Title</th><th>Role</th><th>Date</th><th>Organizer</th><th>Result</th><th>Actions</th></tr>
                                        </thead>
                                        <tbody>
                                            {items.map((h, i) => (
                                                <tr key={h.id}>
                                                    <td>{(currentPage - 1) * 5 + i + 1}</td>
                                                    <td><strong>{h.student?.student_id ?? h.student_id}</strong></td>
                                                    <td>{h.student ? `${h.student.first_name} ${h.student.last_name}` : '—'}</td>
                                                    <td>{h.activity_title}</td>
                                                    <td>{h.role || '—'}</td>
                                                    <td style={{ fontSize: '.8rem' }}>
                                                        {h.date_started ? new Date(h.date_started).toLocaleDateString('en-PH') : '—'}
                                                        {h.date_ended && h.date_ended !== h.date_started ? ` – ${new Date(h.date_ended).toLocaleDateString('en-PH')}` : ''}
                                                    </td>
                                                    <td style={{ fontSize: '.8rem' }}>{h.organizer || '—'}</td>
                                                    <td>{h.game_result ? <span style={{ fontWeight: 700, color: clr, fontSize: '.85rem' }}>{h.game_result}</span> : '—'}</td>
                                                    <td><button style={{ ...iconBtn, color: '#dc2626' }} onClick={() => remove(h.id)}><Trash2 size={13} /></button></td>
                                                </tr>
                                            ))}
                                            {items.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', color: '#a8a29e', padding: 32 }}>No records found.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="subjects-card-list">
                                    {items.map((h, i) => (
                                        <div key={h.id} style={{ padding: '12px 14px', borderTop: i > 0 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                                                    <strong style={{ color: '#f97316', fontSize: '.82rem', fontFamily: 'monospace' }}>{h.student?.student_id ?? h.student_id}</strong>
                                                    {h.student && <span style={{ fontSize: '.82rem', color: '#44403c' }}>{h.student.first_name} {h.student.last_name}</span>}
                                                    {h.game_result && <span style={{ fontSize: '.72rem', fontWeight: 700, color: clr, background: `${clr}18`, border: `1px solid ${clr}30`, borderRadius: 5, padding: '1px 7px' }}>{h.game_result}</span>}
                                                </div>
                                                <div style={{ fontWeight: 700, fontSize: '.875rem', color: '#1c1917', marginBottom: 2 }}>{h.activity_title}</div>
                                                <div style={{ fontSize: '.75rem', color: '#78716c' }}>
                                                    {h.role && <span>{h.role}</span>}
                                                    {h.organizer && <span> · {h.organizer}</span>}
                                                    {h.date_started && <span> · {new Date(h.date_started).toLocaleDateString('en-PH')}</span>}
                                                </div>
                                            </div>
                                            <button style={{ ...iconBtn, color: '#dc2626', flexShrink: 0 }} onClick={() => remove(h.id)}><Trash2 size={13} /></button>
                                        </div>
                                    ))}
                                </div>

                                {lastPage > 1 && (
                                    <div style={paginationWrap}>
                                        <button style={pageBtn} disabled={currentPage === 1} onClick={() => goToPage(cat, currentPage - 1)}>
                                            <ChevronLeft size={14} />
                                        </button>
                                        <span style={{ fontSize: '.82rem', color: '#78716c' }}>Page {currentPage} of {lastPage}</span>
                                        <button style={pageBtn} disabled={currentPage === lastPage} onClick={() => goToPage(cat, currentPage + 1)}>
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
    );
}

const h1 = { fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 };
const sub = { color: '#78716c', margin: 0 };
const iconWrap = { width: 44, height: 44, borderRadius: 12, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fed7aa' };
const iconBtn = { background: 'rgba(0,0,0,.04)', border: '1px solid rgba(0,0,0,.08)', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const paginationWrap = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '10px 14px', borderTop: '1px solid var(--border)' };
const pageBtn = { background: 'rgba(0,0,0,.04)', border: '1px solid rgba(0,0,0,.08)', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
