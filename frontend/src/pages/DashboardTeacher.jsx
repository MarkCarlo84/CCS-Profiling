import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import {
    GraduationCap, ShieldAlert, Zap, Trophy,
    Network, ClipboardCheck, Award, BarChart3,
    ArrowRight, Users, TrendingUp, CheckCircle,
    UserCircle, PartyPopper, CalendarRange, MapPin,
} from 'lucide-react';

const fmtDate = d => d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const statusCfg = {
    upcoming:  { bg: '#fff7ed', fg: '#c2410c', border: '#fed7aa' },
    ongoing:   { bg: '#f0fdf4', fg: '#15803d', border: '#bbf7d0' },
    completed: { bg: '#f5f5f4', fg: '#78716c', border: '#e7e5e4' },
    cancelled: { bg: '#fef2f2', fg: '#b91c1c', border: '#fecaca' },
};

const QUICK_ACTIONS = [
    { to: '/student-map', label: 'Student Profiles', Icon: GraduationCap, desc: 'View & update students', color: '#3b82f6' },
    { to: '/violations', label: 'Record Violation', Icon: ShieldAlert, desc: 'Disciplinary records', color: '#ef4444' },
    { to: '/academic-records', label: 'Academic Records', Icon: Award, desc: 'GPA & grades', color: '#059669' },
    { to: '/affiliations', label: 'Affiliations', Icon: Network, desc: 'Org memberships', color: '#0891b2' },
    { to: '/skills', label: 'Skills', Icon: Zap, desc: 'Student competencies', color: '#7c3aed' },
    { to: '/non-academic-histories', label: 'Non-Academic', Icon: Trophy, desc: 'Awards & achievements', color: '#d97706' },
    { to: '/eligibility-criteria', label: 'Eligibility Criteria', Icon: ClipboardCheck, desc: 'Evaluate students', color: '#64748b' },
    { to: '/reports', label: 'Reports', Icon: BarChart3, desc: 'Filter & export', color: '#f97316' },
];

export default function DashboardTeacher() {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);

    const profile = user?.profile;

    useEffect(() => {
        api.get('/students', { params: { status: 'active' } })
            .then(r => setStudents(r.data))
            .finally(() => setLoading(false));
        api.get('/teacher/events', { params: { status: 'upcoming' } })
            .then(r => setEvents(r.data.slice(0, 4)))
            .catch(() => {});
    }, []);

    const totalActive   = students.filter(s => s.status === 'active').length;
    const totalViolations = students.reduce((sum, s) => sum + (s.violations?.length ?? 0), 0);
    const totalSkills   = students.reduce((sum, s) => sum + (s.skills?.length ?? 0), 0);

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 46, height: 46, borderRadius: 13,
                            background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 14px rgba(139,92,246,.35)',
                        }}>
                            <Users size={22} color="#fff" strokeWidth={2} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#18120e', letterSpacing: '-.02em', margin: 0 }}>
                                Teacher Dashboard
                            </h1>
                            <p style={{ color: '#78716c', fontSize: '.88rem', marginTop: 2 }}>
                                Welcome back, {profile?.first_name ?? user?.name}
                            </p>
                        </div>
                    </div>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
                        color: '#78716c', background: '#f5f3ff', padding: '6px 12px',
                        borderRadius: 999, border: '1px solid #ddd6fe', fontWeight: 500,
                    }}>
                        <TrendingUp size={13} color="#8b5cf6" />
                        {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* Faculty profile card */}
            {profile && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <div className="card-body" style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: '50%',
                                background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <UserCircle size={28} color="#fff" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#18120e' }}>
                                    {profile.first_name} {profile.last_name}
                                </div>
                                <div style={{ fontSize: '.82rem', color: '#78716c', marginTop: 2 }}>
                                    {profile.position} — {profile.department}
                                </div>
                                <div style={{ fontSize: '.78rem', color: '#a8a29e', marginTop: 1 }}>
                                    {profile.email} · {profile.contact_number}
                                </div>
                            </div>
                            <div style={{
                                padding: '4px 14px', borderRadius: 999,
                                background: '#f5f3ff', border: '1px solid #ddd6fe',
                                fontSize: '.75rem', fontWeight: 700, color: '#8b5cf6',
                                textTransform: 'uppercase', letterSpacing: '.05em',
                            }}>
                                Faculty ID: {profile.faculty_id}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats */}
            {loading ? (
                <div className="loading"><div className="loading-spinner" /><span>Loading…</span></div>
            ) : (
                <>
                    <div className="stats-row">
                        {[
                            { label: 'Active Students', value: totalActive,     Icon: CheckCircle, color: '#22c55e' },
                            { label: 'Total Violations', value: totalViolations, Icon: ShieldAlert,  color: '#ef4444' },
                            { label: 'Skills Recorded',  value: totalSkills,     Icon: Zap,          color: '#7c3aed' },
                        ].map(({ label, value, Icon, color }) => (
                            <div key={label} className="stat-card" style={{ '--stat-color': color }}>
                                <div style={{
                                    width: 50, height: 50, borderRadius: 13, flexShrink: 0,
                                    background: `${color}18`, border: `1px solid ${color}30`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Icon size={22} color={color} strokeWidth={1.8} />
                                </div>
                                <div>
                                    <div className="stat-label">{label}</div>
                                    <div className="stat-value" style={{ color }}>{value}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div style={{ marginBottom: 4 }}>
                        <div className="section-divider"><h2>Quick Access</h2></div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 12 }}>
                            {QUICK_ACTIONS.map(({ to, label, Icon, desc, color }) => (
                                <Link key={to} to={to} className="action-card">
                                    <div className="action-icon" style={{ background: `linear-gradient(135deg,${color},${color}cc)` }}>
                                        <Icon size={17} color="#fff" strokeWidth={2} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: 13, color: '#18120e', lineHeight: 1.2 }}>{label}</div>
                                        <div style={{ fontSize: 11, color: '#a8a29e', marginTop: 2 }}>{desc}</div>
                                    </div>
                                    <ArrowRight size={14} color="#d6d3d1" style={{ flexShrink: 0 }} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Events widget */}
                    <div className="card" style={{ marginTop: 20 }}>
                        <div className="card-header">
                            <h2><PartyPopper size={16} color="#f97316" /> Upcoming Events</h2>
                            <Link to="/events" style={{ fontSize: 12, color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
                        </div>
                        <div className="card-body" style={{ padding: 0 }}>
                            {events.length === 0 ? (
                                <div style={{ padding: '20px 20px', color: '#a8a29e', fontSize: 13, textAlign: 'center' }}>No upcoming events.</div>
                            ) : events.map((ev, i) => {
                                const sc = statusCfg[ev.status] ?? statusCfg.upcoming;
                                return (
                                    <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', borderBottom: i < events.length - 1 ? '1px solid #f5f5f4' : 'none' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 11, background: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <PartyPopper size={18} color="#f97316" strokeWidth={1.8} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 700, fontSize: 13, color: '#18120e', marginBottom: 3 }}>{ev.title}</div>
                                            <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#78716c', flexWrap: 'wrap' }}>
                                                <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}><CalendarRange size={11} color="#f97316" />{fmtDate(ev.date_start)}</span>
                                                {ev.venue && <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}><MapPin size={11} color="#a8a29e" />{ev.venue}</span>}
                                            </div>
                                        </div>
                                        <span style={{ background: sc.bg, color: sc.fg, border: `1px solid ${sc.border}`, borderRadius: 999, padding: '2px 9px', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{ev.status}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent students table */}
                    <div className="card" style={{ marginTop: 20 }}>
                        <div className="card-header">
                            <h2><GraduationCap size={16} color="#8b5cf6" /> Recent Active Students</h2>
                            <Link to="/student-map" style={{ fontSize: 12, color: '#8b5cf6', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
                        </div>
                        <div className="card-body" style={{ padding: 0 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <thead>
                                    <tr style={{ background: '#fafaf9' }}>
                                        {['Student ID', 'Name', 'Status', 'Violations', 'Skills'].map(h => (
                                            <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#78716c', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #f5f5f4' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.slice(0, 8).map((s, i) => (
                                        <tr key={s.id} style={{ borderBottom: i < 7 ? '1px solid #f5f5f4' : 'none' }}>
                                            <td style={{ padding: '10px 16px', color: '#a8a29e', fontFamily: 'monospace', fontSize: 12 }}>{s.student_id}</td>
                                            <td style={{ padding: '10px 16px', fontWeight: 600, color: '#18120e' }}>{s.first_name} {s.last_name}</td>
                                            <td style={{ padding: '10px 16px' }}>
                                                <span style={{ padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#dcfce7', color: '#16a34a' }}>
                                                    {s.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '10px 16px', color: s.violations?.length ? '#ef4444' : '#a8a29e', fontWeight: 600 }}>{s.violations?.length ?? 0}</td>
                                            <td style={{ padding: '10px 16px', color: '#7c3aed', fontWeight: 600 }}>{s.skills?.length ?? 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
