import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getSummary, refreshSummaryCache, reseedDemoData } from '../api';
import {
    Users, GraduationCap, CheckCircle,
    BookOpen, ShieldAlert, Zap, Trophy,
    TrendingUp, ArrowRight, BarChart3, Search,
    Network, ClipboardCheck, Award, Activity,
    RefreshCw, AlertTriangle, CheckCircle2, Loader2,
} from 'lucide-react';

const STAT_CONFIGS = [
    { key: 'total_faculty',    label: 'Total Faculty',    Icon: Users,       color: '#8b5cf6' },
    { key: 'total_students',   label: 'Total Students',   Icon: GraduationCap, color: '#3b82f6' },
    { key: 'active_students',  label: 'Active Students',  Icon: CheckCircle, color: '#22c55e' },
    { key: 'total_subjects',   label: 'Subjects',         Icon: BookOpen,    color: '#f59e0b' },
    { key: 'total_violations', label: 'Violations',       Icon: ShieldAlert, color: '#ef4444' },
];

const QUICK_ACTIONS = [
    { to: '/faculty-map',           label: 'Faculty Map',        Icon: Users,          desc: 'View full roster',      color: '#8b5cf6' },
    { to: '/student-map',           label: 'Student Map',        Icon: GraduationCap,  desc: 'Student profiles',      color: '#3b82f6' },
    { to: '/subjects',              label: 'Subjects',           Icon: BookOpen,       desc: 'All subjects & units',  color: '#f59e0b' },
    { to: '/affiliations',          label: 'Affiliations',       Icon: Network,        desc: 'Org memberships',       color: '#0891b2' },
    { to: '/violations',            label: 'Violations',         Icon: ShieldAlert,    desc: 'Disciplinary records',  color: '#ef4444' },
    { to: '/skills',                label: 'Skills',             Icon: Zap,            desc: 'Student competencies',  color: '#7c3aed' },
    { to: '/academic-records',      label: 'Academic Records',   Icon: Award,          desc: 'GPA & grades',          color: '#059669' },
    { to: '/non-academic-histories',label: 'Non-Academic',       Icon: Trophy,         desc: 'Awards & achievements', color: '#d97706' },
    { to: '/eligibility-criteria',  label: 'Eligibility Criteria',Icon: ClipboardCheck,desc: 'Define honor criteria', color: '#64748b' },
    { to: '/reports',               label: 'Filter',             Icon: BarChart3,      desc: 'Filter & export',       color: '#f97316' },
    { to: '/search',                label: 'Global Search',      Icon: Search,         desc: 'Search all records',    color: '#22c55e' },
];

// ── Skeleton card component ────────────────────────────────────────────────────
function SkeletonStatCard() {
    return (
        <div className="stat-card" style={{ gap: 14 }}>
            <div style={{
                width: 50, height: 50, borderRadius: 13, flexShrink: 0,
                background: 'linear-gradient(90deg,#f5f5f4 25%,#e7e5e4 50%,#f5f5f4 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.4s infinite',
            }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{
                    height: 11, width: '60%', borderRadius: 6,
                    background: 'linear-gradient(90deg,#f5f5f4 25%,#e7e5e4 50%,#f5f5f4 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.4s infinite',
                }} />
                <div style={{
                    height: 26, width: '40%', borderRadius: 7,
                    background: 'linear-gradient(90deg,#f5f5f4 25%,#e7e5e4 50%,#f5f5f4 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.4s infinite 0.2s',
                }} />
            </div>
        </div>
    );
}

function SkeletonGenderRow() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px' }}>
            <div style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                background: 'linear-gradient(90deg,#f5f5f4 25%,#e7e5e4 50%,#f5f5f4 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.4s infinite',
            }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                <div style={{
                    height: 10, width: '30%', borderRadius: 5,
                    background: 'linear-gradient(90deg,#f5f5f4 25%,#e7e5e4 50%,#f5f5f4 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.4s infinite',
                }} />
                <div style={{
                    height: 5, width: '100%', borderRadius: 3,
                    background: 'linear-gradient(90deg,#f5f5f4 25%,#e7e5e4 50%,#f5f5f4 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.4s infinite 0.15s',
                }} />
            </div>
        </div>
    );
}

// Inject shimmer keyframes once
if (!document.getElementById('shimmer-style')) {
    const s = document.createElement('style');
    s.id = 'shimmer-style';
    s.textContent = `
        @keyframes shimmer {
            0%   { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
    `;
    document.head.appendChild(s);
}

export default function DashboardAdmin() {
    const [summary, setSummary]         = useState(null);
    const [loading, setLoading]         = useState(true);
    const [refreshing, setRefreshing]   = useState(false);
    const [reseeding, setReseeding]     = useState(false);
    const [toast, setToast]             = useState(null); // { type: 'success'|'error', msg }

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const loadSummary = useCallback(() => {
        setLoading(true);
        getSummary()
            .then(r => setSummary(r.data))
            .catch(() => setSummary(null))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { loadSummary(); }, [loadSummary]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const r = await refreshSummaryCache();
            setSummary(r.data);
            showToast('success', 'Dashboard stats refreshed successfully!');
        } catch {
            showToast('error', 'Failed to refresh — please try again.');
        } finally {
            setRefreshing(false);
        }
    };

    const handleReseed = async () => {
        if (!window.confirm('This will run the DemoSeeder to restore missing faculty data. Continue?')) return;
        setReseeding(true);
        try {
            const r = await reseedDemoData();
            showToast('success', r.data.message + ` (${r.data.faculty_after} faculty restored)`);
            loadSummary(); // reload stats after reseed
        } catch (err) {
            const msg = err?.response?.data?.error || 'Reseed failed.';
            showToast('error', msg);
        } finally {
            setReseeding(false);
        }
    };

    const showDataMismatchWarning = summary && summary.total_faculty === 0 && summary.total_students < 100;

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div className="page-header-row">
                    <div className="page-header-left">
                        <div style={{
                            width: 46, height: 46, borderRadius: 13,
                            background: 'linear-gradient(135deg,#f97316,#c2410c)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 14px rgba(249,115,22,.35)', flexShrink: 0,
                        }}>
                            <BarChart3 size={22} color="#fff" strokeWidth={2} />
                        </div>
                        <div>
                            <h1 className="dashboard-title" style={{ fontSize: '1.7rem', fontWeight: 800, color: '#18120e', letterSpacing: '-.02em', margin: 0 }}>
                                Admin Dashboard
                            </h1>
                            <p style={{ color: '#78716c', fontSize: '.88rem', marginTop: 2 }}>
                                CCS Comprehensive Profiling System — Full Access
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        {/* Refresh Stats button */}
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing || loading}
                            title="Force-refresh dashboard stats from database"
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '7px 14px', borderRadius: 9,
                                border: '1.5px solid #fed7aa',
                                background: '#fff7ed', color: '#c2410c',
                                fontSize: 12, fontWeight: 700, cursor: refreshing ? 'wait' : 'pointer',
                                transition: 'all .18s', opacity: refreshing ? .7 : 1,
                            }}
                        >
                            {refreshing
                                ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                                : <RefreshCw size={13} />}
                            {refreshing ? 'Refreshing…' : 'Refresh Stats'}
                        </button>
                        <div className="page-date-badge" style={{ color: '#78716c', background: '#fff7ed', border: '1px solid #fed7aa' }}>
                            <TrendingUp size={13} color="#f97316" />
                            {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Data mismatch warning banner */}
            {showDataMismatchWarning && !loading && (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 12, padding: '12px 18px', borderRadius: 12, marginBottom: 16,
                    background: 'linear-gradient(135deg,#fef3c7,#fde68a)',
                    border: '1.5px solid #fcd34d',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <AlertTriangle size={18} color="#d97706" />
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: '#92400e' }}>
                                Data Mismatch Detected
                            </div>
                            <div style={{ fontSize: 12, color: '#78350f', marginTop: 2 }}>
                                Faculty count is 0 and only {summary?.total_students} students found. Demo data may not have been seeded correctly on production.
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleReseed}
                        disabled={reseeding}
                        style={{
                            flexShrink: 0,
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '8px 16px', borderRadius: 9,
                            border: 'none', background: '#d97706', color: '#fff',
                            fontSize: 12, fontWeight: 700, cursor: reseeding ? 'wait' : 'pointer',
                            opacity: reseeding ? .7 : 1, transition: 'opacity .18s',
                        }}
                    >
                        {reseeding
                            ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Restoring…</>
                            : <><Activity size={13} /> Restore Demo Data</>}
                    </button>
                </div>
            )}

            {/* Toast notification */}
            {toast && (
                <div style={{
                    position: 'fixed', top: 20, right: 20, zIndex: 9999,
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 18px', borderRadius: 12,
                    background: toast.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    border: `1.5px solid ${toast.type === 'success' ? '#86efac' : '#fca5a5'}`,
                    boxShadow: '0 8px 30px rgba(0,0,0,.12)',
                    animation: 'slideIn .25s ease',
                    maxWidth: 360,
                }}>
                    {toast.type === 'success'
                        ? <CheckCircle2 size={16} color="#16a34a" />
                        : <AlertTriangle size={16} color="#dc2626" />}
                    <span style={{ fontSize: 13, fontWeight: 600, color: toast.type === 'success' ? '#15803d' : '#b91c1c' }}>
                        {toast.msg}
                    </span>
                </div>
            )}

            {/* Stat Cards — show skeletons while loading */}
            <div className="stats-row">
                {loading
                    ? STAT_CONFIGS.map((_, i) => <SkeletonStatCard key={i} />)
                    : STAT_CONFIGS.map(({ key, label, Icon, color }) => (
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

            {/* Gender breakdown — skeletons while loading */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <h2><GraduationCap size={16} color="#f97316" /> Students by Gender</h2>
                    {!loading && (
                        <span style={{ fontSize: 12, color: '#a8a29e', fontWeight: 500 }}>
                            {summary?.total_students ?? 0} total
                        </span>
                    )}
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                    {loading ? (
                        <>
                            <SkeletonGenderRow />
                            <div style={{ borderTop: '1px solid #f5f5f4' }}><SkeletonGenderRow /></div>
                        </>
                    ) : summary?.by_gender && Object.keys(summary.by_gender).length > 0 ? (
                        Object.entries(summary.by_gender).map(([gender, count], i, arr) => {
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
                                            <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg,${clr},${clr}cc)`, borderRadius: 3, transition: 'width .6s ease' }} />
                                        </div>
                                    </div>
                                    <span style={{ fontSize: 11, color: '#a8a29e', fontWeight: 600, minWidth: 30, textAlign: 'right' }}>{pct}%</span>
                                </div>
                            );
                        })
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#a8a29e', fontSize: 13 }}>
                            No student data available.
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: 4 }}>
                <div className="section-divider"><h2>Quick Access</h2></div>
                <div className="quick-actions-grid">
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

            {/* Inject spin keyframe */}
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
