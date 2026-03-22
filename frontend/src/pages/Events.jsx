import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import {
    CalendarRange, MapPin, User, ChevronDown, ChevronUp, Users, SlidersHorizontal,
    Trophy, BookOpenCheck, Activity, Mic2, Wrench, Globe, Bus, Leaf, Star, Briefcase, ClipboardList, PartyPopper
} from 'lucide-react';

const API = 'http://localhost:8000/api';

const statusCfg = {
    upcoming: { bg: '#fff7ed', fg: '#c2410c', border: '#fed7aa', dot: '#f97316' },
    ongoing: { bg: '#f0fdf4', fg: '#15803d', border: '#bbf7d0', dot: '#22c55e' },
    completed: { bg: '#f5f5f4', fg: '#78716c', border: '#e7e5e4', dot: '#a8a29e' },
    cancelled: { bg: '#fef2f2', fg: '#b91c1c', border: '#fecaca', dot: '#ef4444' },
};
const typeCfg = {
    curricular: { bg: '#fff7ed', fg: '#c2410c', border: '#fed7aa' },
    extra_curricular: { bg: '#f5f3ff', fg: '#6d28d9', border: '#ddd6fe' },
};
const categoryIcons = {
    competition: Trophy, seminar: Mic2, sports: Activity, cultural: Star,
    workshop: Wrench, lecture: BookOpenCheck, field_trip: Bus, outreach: Leaf,
    social: PartyPopper, leadership: Star, industry: Briefcase, defense: ClipboardList,
    symposium: Globe,
};

const fmtDate = d => d ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const Chip = ({ label, bg, fg, border }) => (
    <span style={{ background: bg, color: fg, border: `1px solid ${border}`, borderRadius: 999, padding: '2px 9px', fontSize: 11, fontWeight: 700 }}>{label}</span>
);

export default function Events() {
    const { role } = useAuth();
    const prefix = role === 'teacher' ? '/teacher' : '/student';
    const [events, setEvents] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterDept, setFilterDept] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [detail, setDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const fetchEvents = async () => {
        setLoading(true);
        const params = {};
        if (search) params.search = search;
        if (filterType) params.type = filterType;
        if (filterStatus) params.status = filterStatus;
        if (filterDept) params.department_id = filterDept;
        try { const res = await api.get(`${prefix}/events`, { params }); setEvents(res.data); }
        catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { api.get('/departments').then(r => setDepartments(r.data)).catch(() => {}); fetchEvents(); }, []);

    const openDetail = async event => {
        if (expanded === event.id) { setExpanded(null); setDetail(null); return; }
        setExpanded(event.id);
        setLoadingDetail(true);
        try { const res = await api.get(`${prefix}/events/${event.id}`); setDetail(res.data); }
        catch (e) { console.error(e); }
        setLoadingDetail(false);
    };

    const statCounts = {
        total: events.length,
        upcoming: events.filter(e => e.status === 'upcoming').length,
        ongoing: events.filter(e => e.status === 'ongoing').length,
        completed: events.filter(e => e.status === 'completed').length,
    };

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <div className="page-icon"><PartyPopper size={22} color="#f97316" strokeWidth={1.8} /></div>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', color: '#18120e', fontWeight: 800, letterSpacing: '-.02em', margin: 0 }}>Events</h1>
                        <p style={{ color: '#78716c', fontSize: '.86rem', marginTop: 2 }}>Curricular and extra-curricular activities</p>
                    </div>
                </div>
            </div>

            {/* Stat strip */}
            <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
                {[
                    { label: 'Total Events', value: statCounts.total, color: '#f97316', Icon: PartyPopper },
                    { label: 'Upcoming', value: statCounts.upcoming, color: '#f97316', Icon: CalendarRange },
                    { label: 'Ongoing', value: statCounts.ongoing, color: '#22c55e', Icon: Activity },
                    { label: 'Completed', value: statCounts.completed, color: '#a8a29e', Icon: Trophy },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}18`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <s.Icon size={20} color={s.color} strokeWidth={1.8} />
                        </div>
                        <div>
                            <div className="stat-label">{s.label}</div>
                            <div className="stat-value" style={{ color: s.color, fontSize: '1.6rem' }}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <SlidersHorizontal size={15} color="#a8a29e" style={{ flexShrink: 0 }} />
                <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchEvents()} placeholder="Search events…" type="text" style={{ flex: 1, minWidth: 180 }} />
                <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                    <option value="">All Types</option>
                    <option value="curricular">Curricular</option>
                    <option value="extra_curricular">Extra-Curricular</option>
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <select value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                    <option value="">All Depts</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.code}</option>)}
                </select>
                <button onClick={fetchEvents} className="btn btn-primary btn-sm">Search</button>
            </div>

            {loading ? <div className="loading"><div className="loading-spinner" /><span>Loading events…</span></div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {events.length === 0 && <div className="empty"><PartyPopper size={36} color="#fed7aa" /><span>No events found.</span></div>}
                    {events.map(event => {
                        const CatIcon = categoryIcons[event.category] ?? CalendarRange;
                        const isOpen = expanded === event.id;
                        const sc = statusCfg[event.status] ?? statusCfg.upcoming;
                        const tc = typeCfg[event.type] ?? typeCfg.curricular;
                        return (
                            <div key={event.id} className="card" style={{ border: isOpen ? `1.5px solid #f97316` : undefined }}>
                                <div onClick={() => openDetail(event)} style={{ padding: '15px 18px', cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'center' }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: tc.bg, border: `1px solid ${tc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <CatIcon size={21} color={tc.fg} strokeWidth={1.7} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap', marginBottom: 5 }}>
                                            <span style={{ fontWeight: 700, fontSize: 14, color: '#18120e' }}>{event.title}</span>
                                            <Chip label={event.status} {...sc} />
                                            <Chip label={event.type === 'curricular' ? 'Curricular' : 'Extra-Curricular'} {...tc} />
                                        </div>
                                        <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#78716c', flexWrap: 'wrap' }}>
                                            <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                                <CalendarRange size={12} color="#f97316" />
                                                {fmtDate(event.date_start)}{event.date_end && event.date_end !== event.date_start ? ` – ${fmtDate(event.date_end)}` : ''}
                                            </span>
                                            {event.venue && <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}><MapPin size={12} color="#a8a29e" />{event.venue}</span>}
                                            {event.organizer && <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}><User size={12} color="#a8a29e" />{event.organizer}</span>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                        <span style={{ fontSize: 12, color: '#a8a29e', display: 'flex', gap: 3, alignItems: 'center' }}>
                                            <Users size={13} />{event.participants_count ?? 0}
                                        </span>
                                        {isOpen ? <ChevronUp size={16} color="#a8a29e" /> : <ChevronDown size={16} color="#a8a29e" />}
                                    </div>
                                </div>

                                {isOpen && (
                                    <div style={{ borderTop: '1px solid #f5f5f4', background: '#fafaf9', padding: '14px 18px' }}>
                                        {loadingDetail ? <span style={{ color: '#a8a29e', fontSize: 13 }}>Loading…</span> : detail && (
                                            <>
                                                {detail.description && <p style={{ fontSize: 13, color: '#44403c', lineHeight: 1.7, marginBottom: 14 }}>{detail.description}</p>}
                                                <div style={{ fontSize: 10, fontWeight: 800, color: '#a8a29e', letterSpacing: 1.2, marginBottom: 10 }}>
                                                    PARTICIPANTS ({detail.participants?.length ?? 0})
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                    {(detail.participants ?? []).length === 0
                                                        ? <p style={{ color: '#a8a29e', fontSize: 13 }}>No participants recorded.</p>
                                                        : detail.participants.map(p => (
                                                            <div key={p.id} style={{ background: '#fff', borderRadius: 8, padding: '6px 12px', fontSize: 13, color: '#44403c', border: '1px solid #f5f5f4', display: 'flex', gap: 6, alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
                                                                <Users size={12} color="#f97316" />
                                                                {p.participant_info ? `${p.participant_info.first_name} ${p.participant_info.last_name}` : `ID #${p.participable_id}`}
                                                                <span style={{ color: '#a8a29e', fontSize: 11 }}>({p.role})</span>
                                                                {p.award && <span style={{ color: '#f97316', fontWeight: 700, fontSize: 11 }}>· {p.award}</span>}
                                                            </div>
                                                        ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
