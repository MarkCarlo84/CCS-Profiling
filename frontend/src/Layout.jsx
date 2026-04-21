import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
    LayoutDashboard, BarChart3, Search,
    GraduationCap, Users, BookOpen,
    ShieldAlert, Network, Zap, Trophy,
    ClipboardCheck, Award, ChevronLeft,
    ChevronRight, LogOut, Activity, UserCircle, KeyRound, FileText, Star, PartyPopper, CalendarClock, UserCheck, Settings,
} from 'lucide-react';
import { useLoading } from './LoadingContext';
import './Layout.css';
import ccsLogo from './CCS Logo.png';

const NAV_BY_ROLE = {
    admin: [
        {
            label: 'Overview',
            items: [
                { to: '/', label: 'Dashboard', Icon: LayoutDashboard },
                { to: '/reports', label: 'Filter', Icon: BarChart3 },
                { to: '/search', label: 'Search', Icon: Search },
            ],
        },
        {
            label: 'People',
            items: [
                { to: '/faculty-map', label: 'Faculty', Icon: Users },
                { to: '/student-map', label: 'Students', Icon: GraduationCap },
                { to: '/sections',    label: 'Sections', Icon: BookOpen },
            ],
        },
        {
            label: 'Academic',
            items: [
                { to: '/subjects', label: 'Subjects', Icon: BookOpen },
                { to: '/academic-records', label: 'Academic Records', Icon: Award },
            ],
        },
        {
            label: 'Student Records',
            items: [
                { to: '/affiliations', label: 'Affiliations', Icon: Network },
                { to: '/violations', label: 'Violations', Icon: ShieldAlert },
                { to: '/skills', label: 'Skills', Icon: Zap },
                { to: '/non-academic-histories', label: 'Non-Academic', Icon: Trophy },
            ],
        },
        {
            label: 'Admin',
            items: [
                { to: '/eligibility-criteria', label: 'Eligibility Criteria', Icon: ClipboardCheck },
                { to: '/faculty-reports', label: 'Faculty Reports', Icon: FileText },
                { to: '/faculty-evaluations', label: 'Faculty Evaluations', Icon: Star },
                { to: '/events', label: 'Events', Icon: PartyPopper },
                { to: '/faculty-subject-assignment', label: 'Subject Assignment', Icon: UserCheck },
                { to: '/academic-period', label: 'Academic Period', Icon: CalendarClock },
            ],
        },
    ],

    teacher: [
        {
            label: 'Overview',
            items: [
                { to: '/', label: 'Dashboard', Icon: LayoutDashboard },
            ],
        },
        {
            label: 'Faculty',
            items: [
                { to: '/my-subjects', label: 'My Assigned Subjects', Icon: BookOpen },
                { to: '/eligibility-criteria', label: 'Eligibility Criteria', Icon: ClipboardCheck },
                { to: '/my-evaluations', label: 'My Evaluations', Icon: Star },
                { to: '/create-report', label: 'My Reports', Icon: FileText },
                { to: '/events', label: 'Events', Icon: PartyPopper },
                { to: '/settings/profile', label: 'Settings', Icon: Settings },
            ],
        },
    ],

    student: [
        {
            label: 'My Profile',
            items: [
                { to: '/', label: 'Dashboard', Icon: LayoutDashboard },
                { to: '/my-profile', label: 'My Profile', Icon: UserCircle },
                { to: '/my-academics', label: 'Academic Tracker', Icon: GraduationCap },
                { to: '/my-skills', label: 'Skills', Icon: Zap },
                { to: '/my-affiliations', label: 'Affiliations', Icon: Network },
                { to: '/my-activities', label: 'Activities', Icon: Trophy },
                { to: '/evaluate-faculty', label: 'Evaluate Faculty', Icon: Star },
                { to: '/events', label: 'Events', Icon: PartyPopper },
                { to: '/change-password', label: 'Change Password', Icon: KeyRound },
            ],
        },
    ],
};

export default function Layout({ children }) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, role, logout } = useAuth();
    const { showLoader } = useLoading();
    const navigate = useNavigate();

    const navGroups = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.admin;

    const ROLE_BADGE = {
        admin:   { label: 'Admin',   color: '#f97316' },
        teacher: { label: 'Teacher', color: '#8b5cf6' },
        student: { label: 'Student', color: '#3b82f6' },
    };
    const badge = ROLE_BADGE[role] ?? ROLE_BADGE.admin;

    const handleLogout = async () => {
        setMobileOpen(false);
        const portal = localStorage.getItem('ccs_portal') || '/student';
        showLoader(() => navigate(portal));
        await logout();
    };

    return (
        <div className="layout">
            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
            )}

            {/* Mobile top bar */}
            <header className="mobile-topbar">
                <button className="mobile-menu-btn" onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
                    <span /><span /><span />
                </button>
                <div className="mobile-brand">
                    <img src={ccsLogo} alt="CCS Logo" />
                    <span>CCS Profiling</span>
                </div>
            </header>

            <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
                {/* Brand */}
                <div className="sidebar-brand" style={{
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    padding: collapsed ? '20px 0' : '18px 14px',
                    gap: collapsed ? 0 : 11,
                    transition: 'all .3s ease'
                }}>
                    <button
                        onClick={() => setCollapsed(c => !c)}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        style={{
                            background: '#fff',
                            width: 44, height: 44, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,.15)',
                            overflow: 'hidden', border: 'none', cursor: 'pointer',
                            padding: 0, transition: 'all .3s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <img src={ccsLogo} alt="Logo" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                    </button>
                    <div className="brand-info" style={{
                        opacity: collapsed ? 0 : 1,
                        width: collapsed ? 0 : 'auto',
                        transform: collapsed ? 'translateX(-10px)' : 'translateX(0)',
                        transition: 'opacity .3s ease, transform .3s ease, width .3s ease',
                        pointerEvents: collapsed ? 'none' : 'auto',
                        overflow: 'hidden',
                        minWidth: 0,
                        flex: collapsed ? 0 : 1
                    }}>
                        <div className="brand-title">CCS Profiling</div>
                        <div className="brand-sub">Comprehensive System</div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="sidebar-nav">
                    {navGroups.map(group => (
                        <div key={group.label} style={{ marginBottom: 2 }}>
                            <div className="nav-group-label">{group.label}</div>
                            {group.items.map(({ to, label, Icon }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    end={to === '/'}
                                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                    title={collapsed ? label : undefined}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <Icon size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
                                    <span>{label}</span>
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* Footer: user info + logout */}
                <div className="sidebar-footer" style={{ padding: collapsed ? '12px 8px' : '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {!collapsed && user && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                <div style={{ fontSize: '.78rem', fontWeight: 700, color: '#f8fafc' }}>{user.name}</div>
                                <span style={{
                                    fontSize: '.65rem', fontWeight: 700, padding: '1px 7px',
                                    borderRadius: 999, background: `${badge.color}22`,
                                    color: badge.color, border: `1px solid ${badge.color}44`,
                                    textTransform: 'uppercase', letterSpacing: '.04em',
                                }}>{badge.label}</span>
                            </div>
                            <div style={{ fontSize: '.72rem', color: '#64748b' }}>{user.email}</div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        title="Logout"
                        style={{
                            width: collapsed ? 44 : '100%', display: 'flex', alignItems: 'center',
                            gap: 8, padding: '7px 10px', borderRadius: 8,
                            background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.15)',
                            color: '#ef4444', cursor: 'pointer', fontSize: '.8rem',
                            fontWeight: 600, fontFamily: "'Inter',sans-serif",
                            justifyContent: collapsed ? 'center' : 'flex-start',
                            height: collapsed ? 44 : 'auto',
                        }}
                    >
                        <LogOut size={16} />
                        {!collapsed && 'Logout'}
                    </button>
                </div>
            </aside>

            <main className="main-content">{children}</main>
        </div>
    );
}
