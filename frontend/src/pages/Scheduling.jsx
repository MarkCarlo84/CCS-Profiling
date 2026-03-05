import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CalendarDays, List, LayoutGrid, SlidersHorizontal, Clock, MapPin, User } from 'lucide-react';

const API = 'http://localhost:8000/api';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const dayColors = {
    Monday: { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c', dot: '#f97316' },
    Tuesday: { bg: '#fef9c3', border: '#fde68a', text: '#a16207', dot: '#eab308' },
    Wednesday: { bg: '#fce7f3', border: '#fbcfe8', text: '#be185d', dot: '#ec4899' },
    Thursday: { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', dot: '#3b82f6' },
    Friday: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', dot: '#22c55e' },
    Saturday: { bg: '#f5f3ff', border: '#ddd6fe', text: '#6d28d9', dot: '#8b5cf6' },
};

const fmtTime = (t) => {
    if (!t) return '—';
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};

export default function Scheduling() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDay, setFilterDay] = useState('');
    const [filterSemester, setFilterSemester] = useState('2nd');
    const [filterSchoolYear, setFilterSchoolYear] = useState('2025-2026');
    const [viewMode, setViewMode] = useState('grid');

    const fetchSchedules = async () => {
        setLoading(true);
        const params = {};
        if (filterDay) params.day_of_week = filterDay;
        if (filterSemester) params.semester = filterSemester;
        if (filterSchoolYear) params.school_year = filterSchoolYear;
        try { const res = await axios.get(`${API}/schedules`, { params }); setSchedules(res.data); }
        catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { fetchSchedules(); }, []);

    const byDay = DAYS.reduce((acc, d) => {
        acc[d] = schedules.filter(s => s.day_of_week === d);
        return acc;
    }, {});

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <div className="page-icon"><CalendarDays size={22} color="#f97316" strokeWidth={1.8} /></div>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', color: '#18120e', fontWeight: 800, letterSpacing: '-.02em', margin: 0 }}>Class Schedule</h1>
                        <p style={{ color: '#78716c', fontSize: '.86rem', marginTop: 2 }}>Master timetable for sections and faculty</p>
                    </div>
                </div>
            </div>

            <div className="filter-bar">
                <SlidersHorizontal size={15} color="#a8a29e" style={{ flexShrink: 0 }} />
                <select value={filterSemester} onChange={e => setFilterSemester(e.target.value)}>
                    <option value="1st">1st Semester</option>
                    <option value="2nd">2nd Semester</option>
                    <option value="summer">Summer</option>
                </select>
                <select value={filterSchoolYear} onChange={e => setFilterSchoolYear(e.target.value)}>
                    <option value="2025-2026">2025–2026</option>
                    <option value="2024-2025">2024–2025</option>
                </select>
                <select value={filterDay} onChange={e => setFilterDay(e.target.value)}>
                    <option value="">All Days</option>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <button onClick={fetchSchedules} className="btn btn-primary btn-sm">Filter</button>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                    <button onClick={() => setViewMode('grid')} className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline'}`}>
                        <LayoutGrid size={14} />Grid
                    </button>
                    <button onClick={() => setViewMode('list')} className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline'}`}>
                        <List size={14} />List
                    </button>
                </div>
            </div>

            {loading ? <div className="loading"><div className="loading-spinner" /><span>Loading schedules…</span></div>
                : schedules.length === 0 ? <div className="empty"><CalendarDays size={40} color="#fed7aa" /><span>No schedules found for this period.</span></div>
                    : viewMode === 'grid' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 16 }}>
                            {DAYS.filter(d => !filterDay || d === filterDay).map(day => {
                                const c = dayColors[day];
                                return byDay[day].length > 0 ? (
                                    <div key={day} className="card" style={{ overflow: 'visible' }}>
                                        <div style={{ background: c.bg, padding: '11px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${c.border}` }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                                <div style={{ width: 9, height: 9, borderRadius: '50%', background: c.dot }} />
                                                <span style={{ fontWeight: 700, fontSize: 13, color: c.text }}>{day}</span>
                                            </div>
                                            <span style={{ fontSize: 11, color: c.text, background: `${c.dot}20`, padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>{byDay[day].length}</span>
                                        </div>
                                        {byDay[day].map((s, i) => (
                                            <div key={s.id} style={{ padding: '12px 16px', borderBottom: i < byDay[day].length - 1 ? '1px solid #f5f5f4' : 'none' }}>
                                                <div style={{ fontWeight: 700, fontSize: 13, color: '#18120e', marginBottom: 6 }}>
                                                    {s.section?.course?.code} — {s.section?.name}
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 12, color: '#78716c' }}>
                                                    <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                                                        <Clock size={11} color="#f97316" />{fmtTime(s.time_start)} – {fmtTime(s.time_end)}
                                                    </span>
                                                    <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                                                        <User size={11} color="#a8a29e" />{s.faculty ? `${s.faculty.first_name} ${s.faculty.last_name}` : 'TBA'}
                                                    </span>
                                                    <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                                                        <MapPin size={11} color="#a8a29e" />{s.room?.name ?? (s.room ? `${s.room.building} ${s.room.room_number}` : 'TBA')}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : null;
                            })}
                        </div>
                    ) : (
                        <div className="card">
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>{['Day', 'Section', 'Course', 'Time', 'Faculty', 'Room'].map(h => <th key={h}>{h}</th>)}</tr>
                                    </thead>
                                    <tbody>
                                        {schedules.map(s => {
                                            const c = dayColors[s.day_of_week] ?? dayColors.Monday;
                                            return (
                                                <tr key={s.id}>
                                                    <td>
                                                        <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: 7, padding: '3px 9px', fontSize: 11, fontWeight: 700 }}>
                                                            {s.day_of_week}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontWeight: 700 }}>{s.section?.name}</td>
                                                    <td style={{ fontSize: 13 }}>{s.section?.course?.code}<span style={{ color: '#a8a29e' }}> — {s.section?.course?.name}</span></td>
                                                    <td>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
                                                            <Clock size={13} color="#f97316" />{fmtTime(s.time_start)} – {fmtTime(s.time_end)}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontSize: 13 }}>{s.faculty ? `${s.faculty.first_name} ${s.faculty.last_name}` : <span style={{ color: '#a8a29e' }}>TBA</span>}</td>
                                                    <td style={{ fontSize: 13, color: '#78716c' }}>{s.room?.name ?? (s.room ? `${s.room.building} ${s.room.room_number}` : '—')}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
        </div>
    );
}
