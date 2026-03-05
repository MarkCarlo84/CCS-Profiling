import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, SlidersHorizontal, FlaskConical, Monitor, Presentation, Users } from 'lucide-react';

const API = 'http://localhost:8000/api';

const typeConfig = {
    classroom: { label: 'Classroom', Icon: Monitor, bg: '#fff7ed', fg: '#c2410c', border: '#fed7aa' },
    lab: { label: 'Lab', Icon: FlaskConical, bg: '#fef9c3', fg: '#a16207', border: '#fde68a' },
    lecture_hall: { label: 'Lecture Hall', Icon: Presentation, bg: '#dcfce7', fg: '#15803d', border: '#bbf7d0' },
    seminar_room: { label: 'Seminar', Icon: Users, bg: '#f5f3ff', fg: '#6d28d9', border: '#ddd6fe' },
};

export default function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('');
    const [filterBuilding, setFilterBuilding] = useState('');
    const [search, setSearch] = useState('');

    const fetchRooms = async () => {
        setLoading(true);
        const params = {};
        if (filterType) params.type = filterType;
        if (filterBuilding) params.building = filterBuilding;
        if (search) params.search = search;
        try { const res = await axios.get(`${API}/rooms`, { params }); setRooms(res.data); }
        catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { fetchRooms(); }, []);

    const buildings = [...new Set(rooms.map(r => r.building))].filter(Boolean);
    const grouped = rooms.reduce((acc, r) => {
        const b = r.building;
        if (!acc[b]) acc[b] = [];
        acc[b].push(r);
        return acc;
    }, {});

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <div className="page-icon"><Building2 size={22} color="#f97316" strokeWidth={1.8} /></div>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', color: '#18120e', fontWeight: 800, letterSpacing: '-.02em', margin: 0 }}>Rooms & Labs</h1>
                        <p style={{ color: '#78716c', fontSize: '.86rem', marginTop: 2 }}>Classrooms, computer labs, and facilities</p>
                    </div>
                </div>
            </div>

            <div className="filter-bar">
                <SlidersHorizontal size={15} color="#a8a29e" style={{ flexShrink: 0 }} />
                <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchRooms()} placeholder="Search room name or number…" type="text" style={{ flex: 1, minWidth: 180 }} />
                <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                    <option value="">All Types</option>
                    <option value="classroom">Classroom</option>
                    <option value="lab">Lab</option>
                    <option value="lecture_hall">Lecture Hall</option>
                    <option value="seminar_room">Seminar Room</option>
                </select>
                <select value={filterBuilding} onChange={e => setFilterBuilding(e.target.value)}>
                    <option value="">All Buildings</option>
                    {buildings.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <button onClick={fetchRooms} className="btn btn-primary btn-sm">Filter</button>
            </div>

            {loading ? <div className="loading"><div className="loading-spinner" /><span>Loading…</span></div> : (
                <>
                    {!loading && rooms.length === 0 && <div className="empty"><Building2 size={36} color="#fed7aa" /><span>No rooms found.</span></div>}
                    {Object.entries(grouped).map(([building, bRooms]) => (
                        <div key={building} style={{ marginBottom: 28 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                <Building2 size={15} color="#a8a29e" />
                                <h2 style={{ fontSize: 13, fontWeight: 700, color: '#44403c', letterSpacing: .3 }}>{building}</h2>
                                <span style={{ fontSize: 11, color: '#a8a29e', fontWeight: 600, background: '#f5f5f4', padding: '2px 8px', borderRadius: 999 }}>{bRooms.length} room(s)</span>
                                <div style={{ flex: 1, height: '1px', background: '#f5f5f4' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 12 }}>
                                {bRooms.map(r => {
                                    const cfg = typeConfig[r.type] ?? typeConfig.classroom;
                                    const RoomIcon = cfg.Icon;
                                    return (
                                        <div key={r.id} className="card" style={{ opacity: r.is_available ? 1 : 0.65 }}>
                                            <div style={{ padding: '16px 18px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                                    <div style={{ width: 40, height: 40, borderRadius: 11, background: cfg.bg, border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <RoomIcon size={20} color={cfg.fg} strokeWidth={1.7} />
                                                    </div>
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: r.is_available ? '#15803d' : '#b91c1c' }}>
                                                        {r.is_available ? '● Available' : '● Occupied'}
                                                    </span>
                                                </div>
                                                <div style={{ fontWeight: 700, fontSize: 15, color: '#18120e', marginBottom: 2 }}>{r.name ?? `Room ${r.room_number}`}</div>
                                                <div style={{ fontSize: 11, color: '#a8a29e', marginBottom: 10 }}>#{r.room_number}</div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ background: cfg.bg, color: cfg.fg, border: `1px solid ${cfg.border}`, borderRadius: 7, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{cfg.label}</span>
                                                    <span style={{ fontSize: 12, color: '#78716c', display: 'flex', alignItems: 'center', gap: 3 }}>
                                                        <Users size={12} />{r.capacity}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}
