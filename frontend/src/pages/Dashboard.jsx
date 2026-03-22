import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSummary } from '../api';
import {
    Users, GraduationCap, CheckCircle,
    BookOpen, ShieldAlert, Zap, Trophy,
    TrendingUp, ArrowRight, BarChart3, Search,
    Network, ClipboardCheck, Award, Activity,
} from 'lucide-react';

const STAT_CONFIGS = [
    { key: 'total_faculty', label: 'Total Faculty', Icon: Users, color: '#8b5cf6' },
    { key: 'total_students', label: 'Total Students', Icon: GraduationCap, color: '#3b82f6' },
    { key: 'active_students', label: 'Active Students', Icon: CheckCircle, color: '#22c55e' },
    { key: 'total_subjects', label: 'Subjects', Icon: BookOpen, color: '#f59e0b' },
    { key: 'total_violations', label: 'Violations', Icon: ShieldAlert, color: '#ef4444' },
];

const QUICK_ACTIONS = [
    { to: '/faculty-map', label: 'Faculty Map', Icon: Users, desc: 'View full roster', color: '#8b5cf6' },
    { to: '/student-map', label: 'Student Map', Icon: GraduationCap, desc: 'Student profiles', color: '#3b82f6' },
    { to: '/subjects', label: 'Subjects', Icon: BookOpen, desc: 'All subjects & units', color: '#f59e0b' },
    { to: '/affiliations', label: 'Affiliations', Icon: Network, desc: 'Org memberships', color: '#0891b2' },
    { to: '/violations', label: 'Violations', Icon: ShieldAlert, desc: 'Disciplinary records', color: '#ef4444' },
    { to: '/skills', label: 'Skills', Icon: Zap, desc: 'Student competencies', color: '#7c3aed' },
    { to: '/academic-records', label: 'Academic Records', Icon: Award, desc: 'GPA & grades', color: '#059669' },
    { to: '/non-academic-histories', label: 'Non-Academic', Icon: Trophy, desc: 'Awards & achievements', color: '#d97706' },
    { to: '/eligibility-criteria', label: 'Eligibility Criteria', Icon: ClipboardCheck, desc: 'Define honor criteria', color: '#64748b' },
    { to: '/reports', label: 'Run Reports', Icon: BarChart3, desc: 'Filter & export', color: '#f97316' },
    { to: '/search', label: 'Global Search', Icon: Search, desc: 'Search all records', color: '#22c55e' },
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

                    {/* Gender breakdown */}
                    {summary?.by_gender && (
                        <div className="card" style={{ marginBottom: 20 }}>
                            <div className="card-header">
                                <h2><GraduationCap size={16} color="#f97316" /> Students by Gender</h2>
                                <span style={{ fontSize: 12, color: '#a8a29e', fontWeight: 500 }}>{summary.total_students} total</span>
                            </div>
                            <div className="card-body" style={{ padding: 0 }}>
                                {Object.entries(summary.by_gender).map(([gender, count], i, arr) => {
                                    const pct = summary.total_students ? Math.round((count / summary.total_students) * 100) : 0;
                                    const colors = ['#3b82f6', '#ec4899', '#8b5cf6'];
                                    const clr = colors[i] ?? '#f97316';
                                    return (
                                        <div key={gender} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: i < arr.length - 1 ? '1px solid #f5f5f4' : 'none' }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 9, background: `${clr}18`, border: `1px solid ${clr}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: clr, flexShrink: 0 }}>{gender?.[0]}</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#18120e' }}>{gender}</span>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: clr }}>{count}</span>
                                                </div>
                                                <div style={{ height: 5, background: '#f5f5f4', borderRadius: 3, overflow: 'hidden' }}>
                                                    <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg,${clr},${clr}cc)`, borderRadius: 3 }} />
                                                </div>
                                            </div>
                                            <span style={{ fontSize: 11, color: '#a8a29e', fontWeight: 600, minWidth: 30, textAlign: 'right' }}>{pct}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

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
                </>
            )}
        </div>
    );
}
