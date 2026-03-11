import React, { useState, useEffect } from 'react';
import { getNonAcademicHistories, deleteNonAcademicHistory } from '../api';
import { Trophy, Search, Trash2 } from 'lucide-react';

export default function NonAcademicHistoriesMap() {
    const [histories, setHistories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');

    const load = () => {
        setLoading(true);
        getNonAcademicHistories({ search, category }).then(r => setHistories(r.data)).finally(() => setLoading(false));
    };
    useEffect(load, [search, category]);

    const remove = async (id) => { if (!window.confirm('Delete this record?')) return; await deleteNonAcademicHistory(id); load(); };

    // Group by category
    const grouped = histories.reduce((acc, h) => {
        const key = h.category || 'Uncategorized';
        if (!acc[key]) acc[key] = [];
        acc[key].push(h);
        return acc;
    }, {});

    const catColors = { Academic: '#2563eb', Sports: '#16a34a', Leadership: '#7c3aed', Cultural: '#d97706', Community: '#0891b2' };

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <div style={iconWrap}><Trophy size={22} color="#f97316" /></div>
                    <h1 style={h1}>Non-Academic Histories</h1>
                </div>
                <p style={sub}>Competitions, sports, leadership and cultural activities — {histories.length} total</p>
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

            {loading ? <div className="loading"><div className="loading-spinner" /></div> : (
                Object.keys(grouped).length === 0
                    ? <div className="empty"><Trophy size={40} color="#fed7aa" /><p style={{ marginTop: 10 }}>No records found.</p></div>
                    : Object.entries(grouped).map(([cat, items]) => {
                        const clr = catColors[cat] || '#f97316';
                        return (
                            <div key={cat} className="card" style={{ marginBottom: 20 }}>
                                <div className="card-header" style={{ background: `linear-gradient(135deg,${clr},${clr}cc)`, color: '#fff' }}>
                                    <h2 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Trophy size={16} /> {cat}
                                    </h2>
                                    <span className="badge" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>{items.length}</span>
                                </div>
                                <div className="card-body" style={{ padding: 0 }}>
                                    <div className="table-wrap">
                                        <table>
                                            <thead><tr><th>#</th><th>Student ID</th><th>Activity Title</th><th>Role</th><th>Date</th><th>Organizer</th><th>Result</th><th>Actions</th></tr></thead>
                                            <tbody>
                                                {items.map((h, i) => (
                                                    <tr key={h.id}>
                                                        <td>{i + 1}</td>
                                                        <td><strong>{h.student_id}</strong></td>
                                                        <td>{h.activity_title}</td>
                                                        <td>{h.role || '—'}</td>
                                                        <td style={{ fontSize: '.8rem' }}>
                                                            {h.date_started ? new Date(h.date_started).toLocaleDateString('en-PH') : '—'}
                                                            {h.date_ended && h.date_ended !== h.date_started ? ` – ${new Date(h.date_ended).toLocaleDateString('en-PH')}` : ''}
                                                        </td>
                                                        <td style={{ fontSize: '.8rem' }}>{h.organizer || '—'}</td>
                                                        <td>
                                                            {h.game_result
                                                                ? <span style={{ fontWeight: 700, color: clr, fontSize: '.85rem' }}>{h.game_result}</span>
                                                                : '—'}
                                                        </td>
                                                        <td><button style={{ ...iconBtn, color: '#dc2626' }} onClick={() => remove(h.id)}><Trash2 size={13} /></button></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
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
