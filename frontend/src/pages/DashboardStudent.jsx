import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import {
    GraduationCap, ShieldAlert, Zap, Trophy,
    Network, Award, TrendingUp, UserCircle,
    BookOpen, CheckCircle, Pencil, X, Plus, Trash2,
    PartyPopper, CalendarRange, MapPin,
} from 'lucide-react';

const fmtDate = d => d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const statusCfg = {
    upcoming:  { bg: '#fff7ed', fg: '#c2410c', border: '#fed7aa' },
    ongoing:   { bg: '#f0fdf4', fg: '#15803d', border: '#bbf7d0' },
    completed: { bg: '#f5f5f4', fg: '#78716c', border: '#e7e5e4' },
    cancelled: { bg: '#fef2f2', fg: '#b91c1c', border: '#fecaca' },
};

function InfoRow({ label, value }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f5f5f4' }}>
            <span style={{ fontSize: 13, color: '#78716c', fontWeight: 500 }}>{label}</span>
            <span style={{ fontSize: 13, color: '#18120e', fontWeight: 600 }}>{value ?? '—'}</span>
        </div>
    );
}function SectionCard({ title, Icon, color, action, children }) {
    return (
        <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                    <Icon size={16} color={color} /> {title}
                </h2>
                {action}
            </div>
            <div className="card-body">{children}</div>
        </div>
    );
}

export default function DashboardStudent() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    // Skills state
    const [skillModal, setSkillModal] = useState(false);
    const [skillForm, setSkillForm] = useState({ skill_name: '', skill_level: 'beginner', certification: false });
    const [skillSaving, setSkillSaving] = useState(false);
    const [skillError, setSkillError] = useState('');

    useEffect(() => {
        api.get('/student/profile')
            .then(r => setProfile(r.data))
            .finally(() => setLoading(false));
        api.get('/student/events', { params: { status: 'upcoming' } })
            .then(r => setEvents(r.data.slice(0, 4)))
            .catch(() => {});
    }, []);

    const openEdit = () => {
        setEditForm({
            guardian_name:  profile.guardian_name  ?? '',
            address:        profile.address         ?? '',
            contact_number: profile.contact_number  ?? '',
            email:          profile.email           ?? '',
        });
        setSaveError('');
        setEditing(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSaveError('');
        try {
            const res = await api.patch('/student/profile', editForm);
            setProfile(p => ({ ...p, ...res.data }));
            setEditing(false);
        } catch (err) {
            setSaveError(err.response?.data?.message || 'Failed to save. Try again.');
        } finally {
            setSaving(false);
        }
    };

    const openSkillModal = () => {
        setSkillForm({ skill_name: '', skill_level: 'beginner', certification: false });
        setSkillError('');
        setSkillModal(true);
    };

    const handleAddSkill = async (e) => {
        e.preventDefault();
        setSkillSaving(true);
        setSkillError('');
        try {
            const res = await api.post('/student/skills', skillForm);
            setProfile(p => ({ ...p, skills: [...(p.skills ?? []), res.data] }));
            setSkillModal(false);
        } catch (err) {
            setSkillError(err.response?.data?.message || 'Failed to add skill.');
        } finally {
            setSkillSaving(false);
        }
    };

    const handleDeleteSkill = async (skillId) => {
        if (!window.confirm('Remove this skill?')) return;
        try {
            await api.delete(`/student/skills/${skillId}`);
            setProfile(p => ({ ...p, skills: p.skills.filter(s => s.id !== skillId) }));
        } catch {
            alert('Failed to remove skill.');
        }
    };

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
            {/* Violation Warnings */}
            {totalViolations > 0 && (
                <div style={{
                    background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                    border: '2px solid #fecaca',
                    borderRadius: 16,
                    padding: '16px 20px',
                    marginBottom: 16,
                    boxShadow: '0 4px 12px rgba(239,68,68,.15)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 10,
                            background: '#dc2626',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <ShieldAlert size={20} color="#fff" strokeWidth={2.5} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#991b1b', marginBottom: 4 }}>
                                Violation Warning
                            </h3>
                            <p style={{ margin: 0, fontSize: '.875rem', color: '#7f1d1d', lineHeight: 1.6 }}>
                                You have <strong>{totalViolations} violation{totalViolations !== 1 ? 's' : ''}</strong> on record.
                                {profile.violations?.some(v => v.severity_level === 'grave') && (
                                    <span style={{ display: 'block', marginTop: 4, fontWeight: 700 }}>
                                        ⚠️ This includes grave violations that may affect your academic standing.
                                    </span>
                                )}
                                {profile.violations?.some(v => v.severity_level === 'major') && !profile.violations?.some(v => v.severity_level === 'grave') && (
                                    <span style={{ display: 'block', marginTop: 4, fontWeight: 600 }}>
                                        ⚠️ This includes major violations. Please review your conduct.
                                    </span>
                                )}
                            </p>
                            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {profile.violations?.slice(0, 3).map(v => (
                                    <span key={v.id} style={{
                                        fontSize: '.75rem',
                                        fontWeight: 700,
                                        padding: '3px 10px',
                                        borderRadius: 999,
                                        background: v.severity_level === 'grave' ? '#7f1d1d' : v.severity_level === 'major' ? '#dc2626' : '#f87171',
                                        color: '#fff',
                                    }}>
                                        {v.violation_type}
                                    </span>
                                ))}
                                {totalViolations > 3 && (
                                    <span style={{
                                        fontSize: '.75rem',
                                        fontWeight: 600,
                                        padding: '3px 10px',
                                        borderRadius: 999,
                                        background: '#fff',
                                        color: '#991b1b',
                                        border: '1px solid #fecaca',
                                    }}>
                                        +{totalViolations - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                <SectionCard title="Personal Information" Icon={UserCircle} color="#3b82f6"
                    action={
                        <button onClick={openEdit} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#3b82f6', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 7, padding: '4px 10px', cursor: 'pointer' }}>
                            <Pencil size={12} /> Edit
                        </button>
                    }
                >
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
                <SectionCard title="Skills" Icon={Zap} color="#7c3aed"
                    action={
                        <button onClick={openSkillModal} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#7c3aed', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 7, padding: '4px 10px', cursor: 'pointer' }}>
                            <Plus size={12} /> Add Skill
                        </button>
                    }
                >
                    {profile.skills?.length ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {profile.skills.map(s => (
                                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px 4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' }}>
                                    <span>{s.skill_name} · {s.skill_level}{s.certification ? ' ✓' : ''}</span>
                                    <button onClick={() => handleDeleteSkill(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: '#a78bfa' }}>
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : <p style={{ color: '#a8a29e', fontSize: 13 }}>No skills recorded yet. Add your first skill!</p>}
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

                {/* Upcoming Events */}
                <SectionCard title="Upcoming Events" Icon={PartyPopper} color="#f97316"
                    action={
                        <Link to="/events" style={{ fontSize: 12, fontWeight: 600, color: '#f97316', textDecoration: 'none' }}>View all →</Link>
                    }
                >
                    {events.length === 0 ? (
                        <p style={{ color: '#a8a29e', fontSize: 13 }}>No upcoming events.</p>
                    ) : events.map((ev, i) => {
                        const sc = statusCfg[ev.status] ?? statusCfg.upcoming;
                        return (
                            <div key={ev.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: i < events.length - 1 ? '1px solid #f5f5f4' : 'none' }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                                    <PartyPopper size={16} color="#f97316" strokeWidth={1.8} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: 13, color: '#18120e', marginBottom: 3 }}>{ev.title}</div>
                                    <div style={{ display: 'flex', gap: 8, fontSize: 11, color: '#78716c', flexWrap: 'wrap', alignItems: 'center' }}>
                                        <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}><CalendarRange size={11} color="#f97316" />{fmtDate(ev.date_start)}</span>
                                        {ev.venue && <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}><MapPin size={11} color="#a8a29e" />{ev.venue}</span>}
                                        <span style={{ background: sc.bg, color: sc.fg, border: `1px solid ${sc.border}`, borderRadius: 999, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>{ev.status}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </SectionCard>

            </div>

            {/* Add Skill Modal */}
            {skillModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                    <div style={{ background: '#fff', borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1c1917' }}>Add Skill</h2>
                            <button onClick={() => setSkillModal(false)} style={{ background: 'rgba(0,0,0,.05)', border: '1px solid rgba(0,0,0,.08)', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <X size={15} />
                            </button>
                        </div>
                        <form onSubmit={handleAddSkill} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label style={mLabel}>Skill Name</label>
                                <input
                                    required
                                    value={skillForm.skill_name}
                                    onChange={e => setSkillForm(f => ({ ...f, skill_name: e.target.value }))}
                                    placeholder="e.g. Python, Photoshop, Public Speaking"
                                    style={mInput}
                                />
                            </div>
                            <div>
                                <label style={mLabel}>Proficiency Level</label>
                                <select value={skillForm.skill_level} onChange={e => setSkillForm(f => ({ ...f, skill_level: e.target.value }))} style={mInput}>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                    <option value="expert">Expert</option>
                                </select>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.875rem', color: '#44403c', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={skillForm.certification}
                                    onChange={e => setSkillForm(f => ({ ...f, certification: e.target.checked }))}
                                />
                                Has certification / credential
                            </label>
                            {skillError && <p style={{ color: '#dc2626', fontSize: '.82rem', margin: 0 }}>{skillError}</p>}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                                <button type="button" className="btn btn-outline" onClick={() => setSkillModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={skillSaving}>
                                    {skillSaving ? 'Adding...' : 'Add Skill'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Profile Modal */}
            {editing && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                    <div style={{ background: '#fff', borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1c1917' }}>Edit My Profile</h2>
                            <button onClick={() => setEditing(false)} style={{ background: 'rgba(0,0,0,.05)', border: '1px solid rgba(0,0,0,.08)', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <X size={15} />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {[
                                { label: 'Email Address', field: 'email', type: 'email' },
                                { label: 'Contact Number', field: 'contact_number', type: 'text' },
                                { label: 'Guardian Name', field: 'guardian_name', type: 'text' },
                            ].map(({ label, field, type }) => (
                                <div key={field}>
                                    <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#44403c', marginBottom: 5 }}>{label}</label>
                                    <input
                                        type={type}
                                        value={editForm[field]}
                                        onChange={e => setEditForm(f => ({ ...f, [field]: e.target.value }))}
                                        style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid #e7e5e4', fontSize: '.875rem', color: '#1c1917', boxSizing: 'border-box' }}
                                    />
                                </div>
                            ))}
                            <div>
                                <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#44403c', marginBottom: 5 }}>Address</label>
                                <textarea
                                    value={editForm.address}
                                    onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
                                    rows={3}
                                    style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid #e7e5e4', fontSize: '.875rem', color: '#1c1917', boxSizing: 'border-box', resize: 'none' }}
                                />
                            </div>

                            {saveError && <p style={{ color: '#dc2626', fontSize: '.82rem', margin: 0 }}>{saveError}</p>}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                                <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const mLabel = { display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#44403c', marginBottom: 5 };
const mInput = { width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid #e7e5e4', fontSize: '.875rem', color: '#1c1917', boxSizing: 'border-box', fontFamily: "'Inter',sans-serif" };
