import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSummary } from '../api';
import {
    Building, Users, GraduationCap, CheckCircle,
    BookMarked, CalendarDays, TrendingUp, ArrowRight,
    BarChart3, Search, FileText, PartyPopper,
} from 'lucide-react';

const STAT_CONFIGS = [
    { key: 'departments', label: 'Departments', Icon: Building, color: '#f97316' },
    { key: 'total_faculty', label: 'Total Faculty', Icon: Users, color: '#8b5cf6' },
    { key: 'total_students', label: 'Total Students', Icon: GraduationCap, color: '#3b82f6' },
    { key: 'active_students', label: 'Active Students', Icon: CheckCircle, color: '#22c55e' },
    { key: 'total_courses', label: 'Total Courses', Icon: BookMarked, color: '#f59e0b' },
    { key: 'upcoming_events', label: 'Upcoming Events', Icon: CalendarDays, color: '#ec4899' },
];

const QUICK_ACTIONS = [
    { to: '/faculty-map', label: 'Faculty Map', Icon: Users, desc: 'View full roster', color: '#8b5cf6' },
    { to: '/student-map', label: 'Student Map', Icon: GraduationCap, desc: 'Student profiles', color: '#3b82f6' },
    { to: '/reports', label: 'Run Reports', Icon: BarChart3, desc: 'Filter & export', color: '#f97316' },
    { to: '/search', label: 'Global Search', Icon: Search, desc: 'All modules', color: '#22c55e' },
    { to: '/events', label: 'Events', Icon: PartyPopper, desc: 'Upcoming activities', color: '#ec4899' },
    { to: '/scheduling', label: 'Class Schedule', Icon: CalendarDays, desc: 'Master timetable', color: '#f59e0b' },
];

export default function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSummary().then(r => setSummary(r.data)).finally(() => setLoading(false));
    }, []);

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                            <div style={{
                                width: 46, height: 46, borderRadius: 13,
                                background: 'linear-gradient(135deg,#f97316,#c2410c)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 14px rgba(249,115,22,.35)',
                            }}>
                                <BarChart3 size={22} color="#fff" strokeWidth={2} />
                            </div>
                            <div>
                                <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#18120e', letterSpacing: '-.02em', margin: 0 }}>
                                    Dashboard
                                </h1>
                                <p style={{ color: '#78716c', fontSize: '.88rem', marginTop: 2 }}>
                                    CCS Comprehensive Profiling System — Overview
                                </p>
                            </div>
                        </div>
                    </div>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
                        color: '#78716c', background: '#fff7ed', padding: '6px 12px',
                        borderRadius: 999, border: '1px solid #fed7aa', fontWeight: 500,
                    }}>
                        <TrendingUp size={13} color="#f97316" />
                        {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading"><div className="loading-spinner" /><span>Loading dashboard…</span></div>
            ) : (
                <>
                    {/* Stat Cards */}
                    <div className="stats-row">
                        {STAT_CONFIGS.map(({ key, label, Icon, color }) => (
                            <div key={key} className="stat-card" style={{ '--stat-color': color }}>
                                <div style={{
                                    width: 50, height: 50, borderRadius: 13, flexShrink: 0,
                                    background: `${color}18`, border: `1px solid ${color}30`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Icon size={22} color={color} strokeWidth={1.8} />
                                </div>
                                <div>
                                    <div className="stat-label">{label}</div>
                                    <div className="stat-value" style={{ color }}>{summary?.[key] ?? 0}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Two-column layout */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                        {/* Students by Department */}
                        <div className="card">
                            <div className="card-header">
                                <h2><GraduationCap size={16} color="#f97316" />Students by Department</h2>
                                <span style={{ fontSize: 12, color: '#a8a29e', fontWeight: 500 }}>{summary?.total_students ?? 0} total</span>
                            </div>
                            <div className="card-body" style={{ padding: 0 }}>
                                {summary?.by_department?.map((d, i) => {
                                    const pct = summary.total_students ? Math.round((d.count / summary.total_students) * 100) : 0;
                                    return (
                                        <div key={d.code} style={{
                                            display: 'flex', alignItems: 'center', gap: 12,
                                            padding: '12px 20px',
                                            borderBottom: i < summary.by_department.length - 1 ? '1px solid #f5f5f4' : 'none',
                                        }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 9, background: '#fff7ed',
                                                border: '1px solid #fed7aa', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#c2410c',
                                                flexShrink: 0,
                                            }}>{d.code?.slice(0, 2)}</div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#18120e', truncate: true }}>{d.name}</span>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#f97316', marginLeft: 8 }}>{d.count}</span>
                                                </div>
                                                <div style={{ height: 5, background: '#f5f5f4', borderRadius: 3, overflow: 'hidden' }}>
                                                    <div style={{
                                                        width: `${pct}%`, height: '100%',
                                                        background: 'linear-gradient(90deg,#f97316,#fb923c)',
                                                        borderRadius: 3, transition: 'width .6s ease',
                                                    }} />
                                                </div>
                                            </div>
                                            <span style={{ fontSize: 11, color: '#a8a29e', fontWeight: 600, minWidth: 30, textAlign: 'right' }}>{pct}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Students by Year Level */}
                        <div className="card">
                            <div className="card-header">
                                <h2><FileText size={16} color="#f97316" />Students by Year Level</h2>
                            </div>
                            <div className="card-body" style={{ padding: 0 }}>
                                {summary?.by_year_level && Object.entries(summary.by_year_level).map(([yr, cnt], i, arr) => {
                                    const max = Math.max(...Object.values(summary.by_year_level));
                                    const pct = max ? Math.round((cnt / max) * 100) : 0;
                                    const colors = ['#f97316', '#ea580c', '#c2410c', '#9a3412'];
                                    return (
                                        <div key={yr} style={{
                                            display: 'flex', alignItems: 'center', gap: 14,
                                            padding: '14px 20px',
                                            borderBottom: i < arr.length - 1 ? '1px solid #f5f5f4' : 'none',
                                        }}>
                                            <div style={{
                                                width: 36, height: 36, borderRadius: 10,
                                                background: `${colors[i] ?? '#f97316'}18`,
                                                border: `1px solid ${colors[i] ?? '#f97316'}30`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 13, fontWeight: 800, color: colors[i] ?? '#f97316',
                                                flexShrink: 0,
                                            }}>{i + 1}</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#18120e' }}>{yr}</span>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: colors[i] ?? '#f97316' }}>{cnt}</span>
                                                </div>
                                                <div style={{ height: 6, background: '#f5f5f4', borderRadius: 3, overflow: 'hidden' }}>
                                                    <div style={{
                                                        width: `${pct}%`, height: '100%',
                                                        background: `linear-gradient(90deg,${colors[i] ?? '#f97316'},${colors[i] ?? '#fb923c'}cc)`,
                                                        borderRadius: 3, transition: 'width .6s ease',
                                                    }} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div style={{ marginBottom: 4 }}>
                        <div className="section-divider"><h2>Quick Actions</h2></div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
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
                </>
            )}
        </div>
    );
}
