import React, { useState, useEffect } from 'react';
import { getAffiliations, deleteAffiliation } from '../api';
import { Network, Search, Trash2 } from 'lucide-react';

function Badge({ value }) {
    return value ? <span className={`badge badge-${value.toLowerCase().replace(/\s/g, '_')}`}>{value}</span> : null;
}

export default function AffiliationsMap() {
    const [affiliations, setAffiliations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const load = () => { setLoading(true); getAffiliations({ search }).then(r => setAffiliations(r.data)).finally(() => setLoading(false)); };
    useEffect(load, [search]);

    const remove = async (id) => { if (!window.confirm('Delete this affiliation?')) return; await deleteAffiliation(id); load(); };

    // Group by type
    const grouped = affiliations.reduce((acc, a) => {
        const key = a.type || 'Other';
        if (!acc[key]) acc[key] = [];
        acc[key].push(a);
        return acc;
    }, {});

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <div style={iconWrap}><Network size={22} color="#f97316" /></div>
                    <h1 style={h1}>Affiliations</h1>
                </div>
                <p style={sub}>All student organizational affiliations — {affiliations.length} total</p>
            </div>

            <div className="filter-bar">
                <div style={{ position: 'relative' }}>
                    <Search size={15} color="#f97316" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" placeholder="Search organization name…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
                </div>
            </div>

            {loading ? <div className="loading"><div className="loading-spinner" /><p>Loading…</p></div> : (
                Object.keys(grouped).length === 0
                    ? <div className="empty"><Network size={40} color="#fed7aa" /><p style={{ marginTop: 10 }}>No affiliations found.</p></div>
                    : Object.entries(grouped).map(([type, items]) => (
                        <div key={type} className="card" style={{ marginBottom: 20 }}>
                            <div className="card-header" style={{ background: 'linear-gradient(135deg,#ea580c,#f97316)', color: '#fff' }}>
                                <h2 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Network size={16} /> {type}
                                </h2>
                                <span className="badge" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>{items.length}</span>
                            </div>
                            <div className="card-body" style={{ padding: 0 }}>
                                <div className="table-wrap">
                                    <table>
                                        <thead><tr><th>#</th><th>Student ID</th><th>Organization Name</th><th>Role</th><th>Date Joined</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {items.map((a, i) => (
                                                <tr key={a.id}>
                                                    <td>{i + 1}</td>
                                                    <td><strong>{a.student_id}</strong></td>
                                                    <td>{a.name}</td>
                                                    <td>{a.role || '—'}</td>
                                                    <td>{a.date_joined ? new Date(a.date_joined).toLocaleDateString('en-PH') : '—'}</td>
                                                    <td><button style={{ ...iconBtn, color: '#dc2626' }} onClick={() => remove(a.id)}><Trash2 size={13} /></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ))
            )}
        </div>
    );
}

const h1 = { fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 };
const sub = { color: '#78716c', margin: 0 };
const iconWrap = { width: 44, height: 44, borderRadius: 12, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fed7aa' };
const iconBtn = { background: 'rgba(0,0,0,.04)', border: '1px solid rgba(0,0,0,.08)', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
