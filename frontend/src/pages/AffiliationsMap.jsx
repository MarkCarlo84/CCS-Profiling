import React, { useState, useEffect, useCallback } from 'react';
import { getAffiliations, deleteAffiliation } from '../api';
import { useDebounce } from '../hooks/useDebounce';
import { SkeletonTable } from '../components/SkeletonLoader';
import { Network, Search, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

import { ExportButtons, PrintHeader } from '../components/ExportControls';
import { useRef } from 'react';

function flattenAffiliation(a, i) {
    return {
        '#': i + 1,
        'Type': a._type || '',
        'Student ID': a.student?.student_id || a.student_id || '',
        'Name': a.student ? `${a.student.first_name} ${a.student.last_name}` : '',
        'Organization Name': a.name || '',
        'Role': a.role || '',
        'Date Joined': a.date_joined ? new Date(a.date_joined).toLocaleDateString('en-PH') : ''
    };
}

function Badge({ value }) {
    return value ? <span className={`badge badge-${value.toLowerCase().replace(/\s/g, '_')}`}>{value}</span> : null;
}

export default function AffiliationsMap() {
    const [grouped, setGrouped] = useState({});
    const [pages, setPages] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingCategory, setLoadingCategory] = useState(null);
    const [search, setSearch] = useState('');

    const printRef = useRef(null);

    const debouncedSearch = useDebounce(search, 300);

    const buildPageParams = (pagesMap) =>
        Object.fromEntries(
            Object.entries(pagesMap).map(([type, page]) => [
                'page_' + type.replace(/\s/g, '_').toLowerCase(),
                page,
            ])
        );

    const load = useCallback((pagesMap = pages) => {
        setLoading(true);
        getAffiliations({ search: debouncedSearch, ...buildPageParams(pagesMap) })
            .then(r => {
                const data = r.data;
                setGrouped(data);
                setPages(prev => {
                    const next = { ...prev };
                    Object.keys(data).forEach(type => {
                        if (!(type in next)) next[type] = 1;
                    });
                    return next;
                });
            })
            .finally(() => setLoading(false));
    }, [debouncedSearch]);

    useEffect(() => { setPages({}); load({}); }, [debouncedSearch]);

        const goToPage = (type, page) => {
        const next = { ...pages, [type]: page };
        setPages(next);
        setLoadingCategory(type);
        getAffiliations({ search: debouncedSearch, ...buildPageParams(next) })
            .then(r => setGrouped(r.data))
            .finally(() => setLoadingCategory(null));
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this affiliation?')) return;
        await deleteAffiliation(id);
        load();
    };

    const totalCount = Object.values(grouped).reduce((sum, cat) => sum + (cat.total ?? 0), 0);

    // Flatten currently loaded pages into a single array for Excel
    const loadedData = Object.entries(grouped).flatMap(([type, cat]) => 
        (cat.data || []).map(a => ({ ...a, _type: type }))
    );

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <div style={iconWrap}><Network size={22} color="#f97316" /></div>
                    <h1 style={h1}>Affiliations</h1>
                </div>
                <p style={sub}>All student organizational affiliations — {totalCount} total</p>
            </div>

            <div className="filter-bar no-print">
                <div style={{ position: 'relative' }}>
                    <Search size={15} color="#f97316" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" placeholder="Search organization name…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
                </div>
                <div style={{ flex: 1 }} />
                <ExportButtons 
                    printRef={printRef} 
                    data={loadedData} 
                    flattenFn={flattenAffiliation} 
                    filenamePrefix="Affiliations_Map" 
                />
            </div>

            <div ref={printRef} style={{ background: '#fff' }}>
                <PrintHeader 
                    title="Affiliations Map" 
                    subtitle="All student organizational affiliations" 
                    count={totalCount} 
                    filters={{ search }} 
                />

                {loading ? (
                <div className="loading"><div className="loading-spinner" /><p>Loading…</p></div>
            ) : Object.keys(grouped).length === 0 ? (
                <div className="empty"><Network size={40} color="#fed7aa" /><p style={{ marginTop: 10 }}>No affiliations found.</p></div>
            ) : (
                Object.entries(grouped).map(([type, cat]) => {
                    const items = cat.data ?? [];
                    const currentPage = cat.current_page ?? 1;
                    const lastPage = cat.last_page ?? 1;

                    return (
                        <div key={type} className="card" style={{ marginBottom: 20 }}>
                            <div className="card-header" style={{ background: 'linear-gradient(135deg,#ea580c,#f97316)', color: '#fff' }}>
                                <h2 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Network size={16} /> {type}
                                </h2>
                                <span className="badge" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>{cat.total}</span>
                            </div>

                            <div className="card-body" style={{ padding: 0, opacity: loadingCategory === type ? 0.5 : 1, transition: 'opacity .2s' }}>
                                <div className="subjects-table-wrap" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                                    <table style={{ minWidth: 480 }}>
                                        <thead><tr><th>#</th><th>Student ID</th><th>Name</th><th>Organization Name</th><th>Role</th><th>Date Joined</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {items.map((a, i) => (
                                                <tr key={a.id}>
                                                    <td>{(currentPage - 1) * 5 + i + 1}</td>
                                                    <td><strong>{a.student?.student_id ?? a.student_id}</strong></td>
                                                    <td>{a.student ? `${a.student.first_name} ${a.student.last_name}` : '—'}</td>
                                                    <td>{a.name}</td>
                                                    <td>{a.role || '—'}</td>
                                                    <td>{a.date_joined ? new Date(a.date_joined).toLocaleDateString('en-PH') : '—'}</td>
                                                    <td><button style={{ ...iconBtn, color: '#dc2626' }} onClick={() => remove(a.id)}><Trash2 size={13} /></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="subjects-card-list">
                                    {items.map((a, i) => (
                                        <div key={a.id} style={{ padding: '11px 14px', borderTop: i > 0 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: '.875rem', color: '#1c1917', marginBottom: 2 }}>{a.name}</div>
                                                <div style={{ fontSize: '.78rem', color: '#78716c' }}>
                                                    <strong style={{ color: '#f97316' }}>{a.student?.student_id ?? a.student_id}</strong>
                                                    {a.student && <span> · {a.student.first_name} {a.student.last_name}</span>}
                                                    {a.role && <span> · {a.role}</span>}
                                                    {a.date_joined && <span> · {new Date(a.date_joined).toLocaleDateString('en-PH')}</span>}
                                                </div>
                                            </div>
                                            <button style={{ ...iconBtn, color: '#dc2626', flexShrink: 0 }} onClick={() => remove(a.id)}><Trash2 size={13} /></button>
                                        </div>
                                    ))}
                                </div>

                                {lastPage > 1 && (
                                    <div style={paginationWrap}>
                                        <button style={pageBtn} disabled={currentPage === 1} onClick={() => goToPage(type, currentPage - 1)}>
                                            <ChevronLeft size={14} />
                                        </button>
                                        <span style={{ fontSize: '.82rem', color: '#78716c' }}>
                                            Page {currentPage} of {lastPage}
                                        </span>
                                        <button style={pageBtn} disabled={currentPage === lastPage} onClick={() => goToPage(type, currentPage + 1)}>
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
        </div>
    );
}

const h1 = { fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 };
const sub = { color: '#78716c', margin: 0 };
const iconWrap = { width: 44, height: 44, borderRadius: 12, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fed7aa' };
const iconBtn = { background: 'rgba(0,0,0,.04)', border: '1px solid rgba(0,0,0,.08)', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const paginationWrap = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '10px 14px', borderTop: '1px solid var(--border)' };
const pageBtn = { background: 'rgba(0,0,0,.04)', border: '1px solid rgba(0,0,0,.08)', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
