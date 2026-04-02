import React, { useState, useEffect } from 'react';
import api from '../api';
import {
    PartyPopper, CalendarRange, MapPin, User, Users, SlidersHorizontal,
    Trophy, BookOpenCheck, Activity, Mic2, Wrench, Globe, Bus, Leaf,
    Star, Briefcase, ClipboardList, Plus, Pencil, Trash2, X, ChevronDown, ChevronUp,
} from 'lucide-react';

const API_PREFIX = '/admin';

const statusCfg = {
    upcoming:  { bg: '#fff7ed', fg: '#c2410c', border: '#fed7aa' },
    ongoing:   { bg: '#f0fdf4', fg: '#15803d', border: '#bbf7d0' },
    completed: { bg: '#f5f5f4', fg: '#78716c', border: '#e7e5e4' },
    cancelled: { bg: '#fef2f2', fg: '#b91c1c', border: '#fecaca' },
};
const typeCfg = {
    curricular:       { bg: '#fff7ed', fg: '#c2410c', border: '#fed7aa' },
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

const EMPTY_FORM = {
    title: '', type: 'curricular', category: '', organizer: '', venue: '',
    date_start: '', date_end: '', description: '', status: 'upcoming',
    department_id: '', max_participants: '',
};

export default function AdminEvents() {
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

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchEvents = async () => {
        setLoading(true);
        const params = {};
        if (search) params.search = search;
        if (filterType) params.type = filterType;
        if (filterStatus) params.status = filterStatus;
        if (filterDept) params.department_id = filterDept;
        try {
            const res = await api.get(`${API_PREFIX}/events`, { params });
            setEvents(res.data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => {
        api.get('/departments').then(r => setDepartments(r.data)).catch(() => {});
        fetchEvents();
    }, []);

    const openDetail = async event => {
        if (expanded === event.id) { setExpanded(null); setDetail(null); return; }
        setExpanded(event.id);
        setLoadingDetail(true);
        try {
            const res = await api.get(`${API_PREFIX}/events/${event.id}`);
            setDetail(res.data);
        } catch (e) { console.error(e); }
        setLoadingDetail(false);
    };

    const openCreate = () => {
        setEditingEvent(null);
        setForm(EMPTY_FORM);
        setError('');
        setShowModal(true);
    };

    const openEdit = (e, event) => {
        e.stopPropagation();
        setEditingEvent(event);
        setForm({
            title: event.title ?? '',
            type: event.type ?? 'curricular',
            category: event.category ?? '',
            organizer: event.organizer ?? '',
            venue: event.venue ?? '',
            date_start: event.date_start ? event.date_start.slice(0, 10) : '',
            date_end: event.date_end ? event.date_end.slice(0, 10) : '',
            description: event.description ?? '',
            status: event.status ?? 'upcoming',
            department_id: event.department_id ?? '',
            max_participants: event.max_participants ?? '',
        });
        setError('');
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const payload = {
                ...form,
                department_id: form.department_id || null,
                date_end: form.date_end || null,
                max_participants: form.max_participants ? parseInt(form.max_participants) : null,
            };
            if (editingEvent) {
                await api.put(`${API_PREFIX}/events/${editingEvent.id}`, payload);
            } else {
                await api.post(`${API_PREFIX}/events`, payload);
            }
            setShowModal(false);
            fetchEvents();
        } catch (e) {
            const msg = e.response?.data?.message ?? Object.values(e.response?.data?.errors ?? {}).flat().join(' ') ?? 'Save failed.';
            setError(msg);
        }
        setSaving(false);
    };

    const handleDelete = async (e, event) => {
        e.stopPropagation();
        if (!window.confirm(`Delete "${event.title}"?`)) return;
        try {
            await api.delete(`${API_PREFIX}/events/${event.id}`);
            fetchEvents();
            if (expanded === event.id) { setExpanded(null); setDetail(null); }
        } catch (err) { alert('Delete failed.'); }
    };

    const statCounts = {
        total: events.length,
        upcoming: events.filter(e => e.status === 'upcoming').length,
        ongoing: events.filter(e => e.status === 'ongoing').length,
        completed: events.filter(e => e.status === 'completed').length,
    };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="page-icon"><PartyPopper size={22} color="#f97316" strokeWidth={1.8} /></div>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', color: '#18120e', fontWeight: 800, letterSpacing: '-.02em', margin: 0 }}>Events</h1>
                        <p style={{ color: '#78716c', fontSize: '.86rem', marginTop: 2 }}>Manage curricular and extra-curricular activities</p>
                    </div>
                </div>
                <button onClick={openCreate} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <Plus size={15} /> Add Event
                </button>
            </div>

            {/* Stats */}
            <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 20 }}>
                {[
                    { label: 'Total Events', value: statCounts.total, color: '#f97316', Icon: PartyPopper },
                    { label: 'Upcoming', value: statCounts.upcoming, color: '#ea580c', Icon: CalendarRange },
                    { label: 'Ongoing', value: statCounts.ongoing, color: '#22c55e', Icon: Activity },
                    { label: 'Completed', value: statCounts.completed, color: '#a8a29e', Icon: Trophy },
                ].map(s => (
                    <div key={s.label} className="stat-card" style={{ boxShadow: '0 2px 8px rgba(0,0,0,.06)', borderRadius: 14, padding: '16px 18px' }}>
                        <div style={{ width: 46, height: 46, borderRadius: 13, background: `${s.color}15`, border: `1.5px solid ${s.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <s.Icon size={21} color={s.color} strokeWidth={1.8} />
                        </div>
                        <div>
                            <div className="stat-label" style={{ fontSize: 11, fontWeight: 700, color: '#a8a29e', letterSpacing: '.04em', textTransform: 'uppercase' }}>{s.label}</div>
                            <div className="stat-value" style={{ color: s.color, fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.1, marginTop: 2 }}>{s.value}</div>
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
                    <option value="">Everyone</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.code}</option>)}
                </select>
                <button onClick={fetchEvents} className="btn btn-primary btn-sm">Search</button>
            </div>

            {/* List */}
            {loading ? <div className="loading"><div className="loading-spinner" /><span>Loading events…</span></div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {events.length === 0 && <div className="empty"><PartyPopper size={36} color="#fed7aa" /><span>No events found.</span></div>}
                    {events.map(event => {
                        const CatIcon = categoryIcons[event.category] ?? CalendarRange;
                        const isOpen = expanded === event.id;
                        const sc = statusCfg[event.status] ?? statusCfg.upcoming;
                        const tc = typeCfg[event.type] ?? typeCfg.curricular;
                        return (
                            <div key={event.id} className="card" style={{ border: isOpen ? '1.5px solid #f97316' : '1px solid #f0ede9', borderRadius: 14, boxShadow: isOpen ? '0 4px 16px rgba(249,115,22,.1)' : '0 1px 4px rgba(0,0,0,.05)', transition: 'box-shadow .15s, border-color .15s' }}>
                                <div onClick={() => openDetail(event)} style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'center' }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 13, background: tc.bg, border: `1.5px solid ${tc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <CatIcon size={22} color={tc.fg} strokeWidth={1.7} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                                            <span style={{ fontWeight: 700, fontSize: 14.5, color: '#18120e' }}>{event.title}</span>
                                            <Chip label={event.status} {...sc} />
                                            <Chip label={event.type === 'curricular' ? 'Curricular' : 'Extra-Curricular'} {...tc} />
                                        </div>
                                        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#78716c', flexWrap: 'wrap' }}>
                                            <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                                <CalendarRange size={12} color="#f97316" />
                                                {fmtDate(event.date_start)}{event.date_end && event.date_end !== event.date_start ? ` – ${fmtDate(event.date_end)}` : ''}
                                            </span>
                                            {event.venue && <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}><MapPin size={12} color="#a8a29e" />{event.venue}</span>}
                                            {event.organizer && <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}><User size={12} color="#a8a29e" />{event.organizer}</span>}
                                            {event.max_participants
                                                ? <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}><Users size={12} color="#a8a29e" />Max: {event.max_participants}</span>
                                                : null}
                                            <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                                                <Users size={12} color="#a8a29e" />
                                                {event.department?.name ?? 'Everyone'}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                        <button
                                            onClick={e => openEdit(e, event)}
                                            title="Edit"
                                            style={{ width: 32, height: 32, borderRadius: 8, background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background .15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#ffedd5'}
                                            onMouseLeave={e => e.currentTarget.style.background = '#fff7ed'}
                                        >
                                            <Pencil size={13} />
                                        </button>
                                        <button
                                            onClick={e => handleDelete(e, event)}
                                            title="Delete"
                                            style={{ width: 32, height: 32, borderRadius: 8, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background .15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                                            onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                        <div style={{ width: 28, height: 28, borderRadius: 7, background: '#f5f5f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {isOpen ? <ChevronUp size={15} color="#a8a29e" /> : <ChevronDown size={15} color="#a8a29e" />}
                                        </div>
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
                                                            <div key={p.id} style={{ background: '#fff', borderRadius: 8, padding: '6px 12px', fontSize: 13, color: '#44403c', border: '1px solid #f5f5f4', display: 'flex', gap: 6, alignItems: 'center' }}>
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

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,.22)' }}>
                        {/* Modal header */}
                        <div style={{ padding: '18px 24px', background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', borderBottom: '1px solid #fed7aa', borderRadius: '18px 18px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <PartyPopper size={18} color="#fff" strokeWidth={1.8} />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#18120e' }}>
                                        {editingEvent ? 'Edit Event' : 'New Event'}
                                    </h2>
                                    <p style={{ margin: 0, fontSize: 11, color: '#c2410c' }}>{editingEvent ? 'Update event details' : 'Fill in the event information'}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', border: '1px solid #fed7aa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a8a29e' }}><X size={16} /></button>
                        </div>

                        <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {error && <div style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>{error}</div>}

                            <div>
                                <div style={{ fontSize: 10, fontWeight: 800, color: '#a8a29e', letterSpacing: 1.2, marginBottom: 10 }}>BASIC INFO</div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: '#44403c', display: 'block', marginBottom: 10 }}>Title *
                                    <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Event title" style={{ display: 'block', width: '100%', marginTop: 5, borderRadius: 9, border: '1.5px solid #e7e5e4', padding: '8px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#44403c' }}>Type *
                                        <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ display: 'block', width: '100%', marginTop: 5, borderRadius: 9, border: '1.5px solid #e7e5e4', padding: '8px 12px', fontSize: 13, background: '#fff' }}>
                                            <option value="curricular">Curricular</option>
                                            <option value="extra_curricular">Extra-Curricular</option>
                                        </select>
                                    </label>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#44403c' }}>Category *
                                        <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. competition" style={{ display: 'block', width: '100%', marginTop: 5, borderRadius: 9, border: '1.5px solid #e7e5e4', padding: '8px 12px', fontSize: 13, boxSizing: 'border-box' }} />
                                    </label>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #f5f5f4', paddingTop: 16 }}>
                                <div style={{ fontSize: 10, fontWeight: 800, color: '#a8a29e', letterSpacing: 1.2, marginBottom: 10 }}>SCHEDULE & LOCATION</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#44403c' }}>Start Date *
                                        <input type="date" value={form.date_start} onChange={e => setForm(f => ({ ...f, date_start: e.target.value }))} style={{ display: 'block', width: '100%', marginTop: 5, borderRadius: 9, border: '1.5px solid #e7e5e4', padding: '8px 12px', fontSize: 13, boxSizing: 'border-box' }} />
                                    </label>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#44403c' }}>End Date
                                        <input type="date" value={form.date_end} onChange={e => setForm(f => ({ ...f, date_end: e.target.value }))} style={{ display: 'block', width: '100%', marginTop: 5, borderRadius: 9, border: '1.5px solid #e7e5e4', padding: '8px 12px', fontSize: 13, boxSizing: 'border-box' }} />
                                    </label>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#44403c' }}>Organizer
                                        <input value={form.organizer} onChange={e => setForm(f => ({ ...f, organizer: e.target.value }))} placeholder="Organizing body" style={{ display: 'block', width: '100%', marginTop: 5, borderRadius: 9, border: '1.5px solid #e7e5e4', padding: '8px 12px', fontSize: 13, boxSizing: 'border-box' }} />
                                    </label>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#44403c' }}>Venue
                                        <input value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} placeholder="Location" style={{ display: 'block', width: '100%', marginTop: 5, borderRadius: 9, border: '1.5px solid #e7e5e4', padding: '8px 12px', fontSize: 13, boxSizing: 'border-box' }} />
                                    </label>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #f5f5f4', paddingTop: 16 }}>
                                <div style={{ fontSize: 10, fontWeight: 800, color: '#a8a29e', letterSpacing: 1.2, marginBottom: 10 }}>STATUS & DEPARTMENT</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#44403c' }}>Status
                                        <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ display: 'block', width: '100%', marginTop: 5, borderRadius: 9, border: '1.5px solid #e7e5e4', padding: '8px 12px', fontSize: 13, background: '#fff' }}>
                                            <option value="upcoming">Upcoming</option>
                                            <option value="ongoing">Ongoing</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </label>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#44403c' }}>Department
                                        <select value={form.department_id} onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))} style={{ display: 'block', width: '100%', marginTop: 5, borderRadius: 9, border: '1.5px solid #e7e5e4', padding: '8px 12px', fontSize: 13, background: '#fff' }}>
                                            <option value="">Everyone</option>
                                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                        </select>
                                    </label>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#44403c' }}>Max Participants
                                        <input
                                            type="number" min="1"
                                            value={form.max_participants}
                                            onChange={e => setForm(f => ({ ...f, max_participants: e.target.value }))}
                                            placeholder="Leave blank for unlimited"
                                            style={{ display: 'block', width: '100%', marginTop: 5, borderRadius: 9, border: '1.5px solid #e7e5e4', padding: '8px 12px', fontSize: 13, boxSizing: 'border-box' }}
                                        />
                                    </label>
                                </div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: '#44403c' }}>Description
                                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Brief description of the event…" style={{ display: 'block', width: '100%', marginTop: 5, borderRadius: 9, border: '1.5px solid #e7e5e4', padding: '8px 12px', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4, borderTop: '1px solid #f5f5f4' }}>
                                <button onClick={() => setShowModal(false)} style={{ padding: '8px 18px', borderRadius: 9, background: '#f5f5f4', color: '#78716c', border: '1px solid #e7e5e4', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', borderRadius: 9, background: saving ? '#fed7aa' : '#f97316', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
                                    {saving ? 'Saving…' : editingEvent ? 'Save Changes' : 'Create Event'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
