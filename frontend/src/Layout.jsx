import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, BarChart3, Search,
    GraduationCap, Users,
    BookOpen, FileText,
    BookMarked, Building2, CalendarDays,
    PartyPopper, School,
    ChevronLeft, ChevronRight,
} from 'lucide-react';
import './Layout.css';

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
        label: 'Instruction',
        items: [
            { to: '/curriculum', label: 'Curriculum', Icon: BookOpen },
            { to: '/syllabus', label: 'Syllabi', Icon: FileText },
        ],
    },
    {
        label: 'Scheduling',
        items: [
            { to: '/courses', label: 'Courses', Icon: BookMarked },
            { to: '/rooms', label: 'Rooms & Labs', Icon: Building2 },
            { to: '/scheduling', label: 'Class Schedule', Icon: CalendarDays },
        ],
    },
    {
        label: 'Events',
        items: [
            { to: '/events', label: 'Events', Icon: PartyPopper },
        ],
    },
];

export default function Layout({ children }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="layout">
            <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
                {/* Brand */}
                <div className="sidebar-brand">
                    <div style={{
                        width: 36, height: 36, borderRadius: 11,
                        background: 'linear-gradient(135deg,#f97316,#c2410c)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, boxShadow: '0 3px 12px rgba(249,115,22,.45)',
                    }}>
                        <School size={20} color="#fff" strokeWidth={2.2} />
                    </div>
                    {!collapsed && (
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <div className="brand-title">CCS Profiling</div>
                            <div className="brand-sub">Comprehensive System</div>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(c => !c)}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        style={{
                            background: 'rgba(255,255,255,.06)',
                            border: '1px solid rgba(255,255,255,.08)',
                            color: '#78716c', cursor: 'pointer',
                            width: 26, height: 26, borderRadius: 7,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, transition: 'all .15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,.15)'; e.currentTarget.style.color = '#fb923c'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.color = '#78716c'; }}
                    >
                        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
                    </button>
                </div>

                {/* Nav */}
                <nav className="sidebar-nav">
                    {navGroups.map(group => (
                        <div key={group.label} style={{ marginBottom: 2 }}>
                            {!collapsed && (
                                <div className="nav-group-label">{group.label}</div>
                            )}
                            {collapsed && <div style={{ height: 8 }} />}
                            {group.items.map(({ to, label, Icon }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    end={to === '/'}
                                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                    title={collapsed ? label : undefined}
                                >
                                    <Icon size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
                                    {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    {collapsed ? '© ' : (
                        <div>
                            <div style={{ color: '#57534e', fontWeight: 600 }}>CCS © 2026</div>
                            <div style={{ marginTop: 1 }}>Profiling System v2.0</div>
                        </div>
                    )}
                </div>
            </aside>

            <main className="main-content">{children}</main>
        </div>
    );
}
