import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import {
    GraduationCap, ShieldAlert, Zap, Trophy,
    Network, Award, TrendingUp, UserCircle,
    BookOpen, CheckCircle,
} from 'lucide-react';

function InfoRow({ label, value }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f5f5f4' }}>
            <span style={{ fontSize: 13, color: '#78716c', fontWeight: 500 }}>{label}</span>
            <span style={{ fontSize: 13, color: '#18120e', fontWeight: 600 }}>{value ?? '—'}</span>
        </div>
    );
}

function SectionCard({ title, Icon, color, children }) {
    return (
        <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon size={16} color={color} /> {title}
                </h2>
            </div>
            <div className="card-body">{children}</div>
        </div>
    );
}

export default function DashboardStudent() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(user?.profile ?? null);
    const [loading, setLoading] = useState(!user?.profile);

    useEffect(() => {
        if (!profile) {
            api.get('/student/profile')
                .then(r => setProfile(r.data))
                .finally(() => setLoading(false));
        }
    }, []);

    if (loading) return <div className="loading"><div className="loading-spinner" /><span>Loading your profile…</span></div>;

    if (!profile) return (
        <div style={{ padding: 40, textAlign: 'center', color: '#78716c' }}>
            No student profile linked to your account. Please contact the admin.
        </div>
    );

    const latestRecord = profile.academic_records?.slice(-1)[0];
    const totalViolations = profile.violations?.length ?? 0;
    const totalSkills = profile.skills?.length ?? 0;
    const totalAffiliations = profile.affiliations?.length ?? 0;
    const totalActivities = profile.non_academic_histories?.length ?? 0;

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 46, height: 46, borderRadius: 13,
                            background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 14px rgba(59,130,246,.35)',
                        }}>
                            <GraduationCap size={22} color="#fff" strokeWidth={2} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#18120e', letterSpacing: '-.02em', margin: 0 }}>
                                My Dashboard
                            </h1>
                            <p style={{ color: '#78716c', fontSize: '.88rem', marginTop: 2 }}>
                                Welcome, {profile.first_name} {profile.last_name}
                            </p>
                        </div>
                    </div>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
                        color: '#78716c', background: '#eff6ff', padding: '6px 12px',
                        borderRadius: 999, border: '1px solid #bfdbfe', fontWeight: 500,
                    }}>
                        <TrendingUp size={13} color="#3b82f6" />
                        {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* Stats row */}
            <div className="stats-row">
                {[
                    { label: 'Latest GPA',      value: latestRecord?.gpa ?? '—',  Icon: Award,      color: '#059669' },
                    { label: 'Violations',       value: totalViolations,            Icon: ShieldAlert, color: '#ef4444' },
                    { label: 'Skills',           value: totalSkills,                Icon: Zap,         color: '#7c3aed' },
                    { label: 'Affiliations',     value: totalAffiliations,          Icon: Network,     color: '#0891b2' },
                    { label: 'Activities',       value: totalActivities,            Icon: Trophy,      color: '#d97706' },
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16, marginTop: 4 }}>

                {/* Personal Info */}
                <SectionCard title="Personal Information" Icon={UserCircle} color="#3b82f6">
                    <InfoRow label="Student ID"    value={profile.student_id} />
                    <InfoRow label="Full Name"     value={`${profile.first_name} ${profile.middle_name ? profile.middle_name + ' ' : ''}${profile.last_name}`} />
                    <InfoRow label="Date of Birth" value={profile.date_of_birth} />
                    <InfoRow label="Gender"        value={profile.gender} />
                    <InfoRow label="Address"       value={profile.address} />
                    <InfoRow label="Contact"       value={profile.contact_number} />
                    <InfoRow label="Email"         value={profile.email} />
                    <InfoRow label="Guardian"      value={profile.guardian_name} />
                    <InfoRow label="Status"        value={profile.status} />
                    <InfoRow label="Enrolled"      value={profile.enrollment_date} />
                </SectionCard>

                {/* Academic Records */}
                <SectionCard title="Academic Records" Icon={Award} color="#059669">
                    {profile.academic_records?.length ? profile.academic_records.map(rec => (
                        <div key={rec.id} style={{ marginBottom: 14 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: '#18120e', marginBottom: 6 }}>
                                {rec.school_year} — {rec.semester}
                                <span style={{ marginLeft: 8, padding: '1px 8px', borderRadius: 999, background: '#dcfce7', color: '#16a34a', fontSize: 11, fontWeight: 700 }}>
                                    GPA: {rec.gpa ?? '—'}
                                </span>
                            </div>
                            {rec.grades?.map(g => (
                                <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#78716c', padding: '3px 0', borderBottom: '1px solid #f5f5f4' }}>
                                    <span>{g.subject_name}</span>
                                    <span style={{ fontWeight: 600, color: '#18120e' }}>{g.score} — {g.remarks}</span>
                                </div>
                            ))}
                        </div>
                    )) : <p style={{ color: '#a8a29e', fontSize: 13 }}>No academic records yet.</p>}
                </SectionCard>

                {/* Skills */}
                <SectionCard title="Skills" Icon={Zap} color="#7c3aed">
                    {profile.skills?.length ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {profile.skills.map(s => (
                                <span key={s.id} style={{
                                    padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                                    background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe',
                                }}>
                                    {s.skill_name} · {s.skill_level}
                                    {s.certification && ' ✓'}
                                </span>
                            ))}
                        </div>
                    ) : <p style={{ color: '#a8a29e', fontSize: 13 }}>No skills recorded yet.</p>}
                </SectionCard>

                {/* Affiliations */}
                <SectionCard title="Affiliations" Icon={Network} color="#0891b2">
                    {profile.affiliations?.length ? profile.affiliations.map((a, i) => (
                        <div key={a.id} style={{ padding: '8px 0', borderBottom: i < profile.affiliations.length - 1 ? '1px solid #f5f5f4' : 'none' }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: '#18120e' }}>{a.name}</div>
                            <div style={{ fontSize: 12, color: '#78716c' }}>{a.role} · {a.type} · Joined {a.date_joined}</div>
                        </div>
                    )) : <p style={{ color: '#a8a29e', fontSize: 13 }}>No affiliations recorded yet.</p>}
                </SectionCard>

                {/* Non-Academic Histories */}
                <SectionCard title="Non-Academic Activities" Icon={Trophy} color="#d97706">
                    {profile.non_academic_histories?.length ? profile.non_academic_histories.map((h, i) => (
                        <div key={h.id} style={{ padding: '8px 0', borderBottom: i < profile.non_academic_histories.length - 1 ? '1px solid #f5f5f4' : 'none' }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: '#18120e' }}>{h.activity_title}</div>
                            <div style={{ fontSize: 12, color: '#78716c' }}>{h.category} · {h.role} · {h.organizer}</div>
                            {h.game_result && <div style={{ fontSize: 12, color: '#d97706', fontWeight: 600 }}>Result: {h.game_result}</div>}
                        </div>
                    )) : <p style={{ color: '#a8a29e', fontSize: 13 }}>No activities recorded yet.</p>}
                </SectionCard>

                {/* Violations */}
                <SectionCard title="Violations" Icon={ShieldAlert} color="#ef4444">
                    {profile.violations?.length ? profile.violations.map((v, i) => (
                        <div key={v.id} style={{ padding: '8px 0', borderBottom: i < profile.violations.length - 1 ? '1px solid #f5f5f4' : 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, fontSize: 13, color: '#18120e' }}>{v.violation_type}</span>
                                <span style={{
                                    padding: '1px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                                    background: v.severity_level === 'grave' ? '#fee2e2' : v.severity_level === 'major' ? '#fef3c7' : '#f0fdf4',
                                    color: v.severity_level === 'grave' ? '#dc2626' : v.severity_level === 'major' ? '#d97706' : '#16a34a',
                                }}>
                                    {v.severity_level}
                                </span>
                            </div>
                            <div style={{ fontSize: 12, color: '#78716c', marginTop: 2 }}>{v.description}</div>
                            {v.action_taken && <div style={{ fontSize: 12, color: '#a8a29e' }}>Action: {v.action_taken}</div>}
                        </div>
                    )) : <p style={{ color: '#a8a29e', fontSize: 13 }}>No violations on record.</p>}
                </SectionCard>

            </div>
        </div>
    );
}
