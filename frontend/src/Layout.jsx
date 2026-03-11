import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
    LayoutDashboard, BarChart3, Search,
    GraduationCap, Users, School,
    BookOpen, ShieldAlert, Network,
    Zap, Trophy, ClipboardCheck, Award,
    ChevronLeft, ChevronRight, LogOut,
    Activity,
} from 'lucide-react';
import './Layout.css';
import ccsLogo from './CCS Logo.png';

const navGroups = [
    {
        label: 'Overview',
        items: [
            { to: '/', label: 'Dashboard', Icon: LayoutDashboard },
            { to: '/reports', label: 'Reports', Icon: BarChart3 },
            { to: '/search', label: 'Search', Icon: Search },
        ],
    },
    {
        label: 'People',
        items: [
            { to: '/faculty-map', label: 'Faculty', Icon: Users },
            { to: '/student-map', label: 'Students', Icon: GraduationCap },
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
            { to: '/operations', label: 'Operations Center', Icon: Activity }, // Added Operations Center
        ],
    },
];

export default function Layout({ children }) {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="layout">
            <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
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
                            <div style={{ fontSize: '.78rem', fontWeight: 700, color: '#f8fafc', truncate: true }}>{user.name}</div>
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
            </aside >

            <main className="main-content">{children}</main>
        </div >
    );
}
