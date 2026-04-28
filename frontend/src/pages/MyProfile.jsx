import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import { UserCircle, Phone, Mail, MapPin, ShieldAlert, Zap, Network, Trophy, BookOpen, Pencil, X, Check } from 'lucide-react';

const fmt = d => d ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

function InfoRow({ label, value }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 12, padding: '9px 0', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ color: '#94a3b8', fontWeight: 600, fontSize: '.78rem' }}>{label}</span>
            <span style={{ color: '#1e293b', fontWeight: 500, fontSize: '.875rem', wordBreak: 'break-word' }}>{value || '—'}</span>
        </div>
    );
}

function Section({ label, color = '#f97316', children }) {
    return (
        <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: '.68rem', fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ height: 2, width: 18, background: color, borderRadius: 2 }} />
                {label}
                <div style={{ height: 2, flex: 1, background: `${color}22`, borderRadius: 2 }} />
            </div>
            {children}
        </div>
    );
}

function EditModal({ profile, onClose, onSave }) {
    const [form, setForm] = useState({
        contact_number: profile.contact_number || '',
        email: profile.email || '',
        address: profile.address || '',
        guardian_name: profile.guardian_name || '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const res = await api.patch('/student/profile', form);
            onSave(res.data);
            onClose();
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to save changes.');
        } finally {
            setSaving(false);
        }
    };

    const field = (label, key, type = 'text') => (
        <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#64748b', marginBottom: 5 }}>{label}</label>
            <input
                type={type}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '.875rem', outline: 'none', fontFamily: 'Inter,sans-serif', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#f97316'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
        </div>
    );

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 440, boxShadow: '0 24px 64px rgba(0,0,0,.18)', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: '#f5f5f4', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <X size={16} color="#78716c" />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Pencil size={18} color="#f97316" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1c1917' }}>Edit Contact Info</div>
                        <div style={{ fontSize: '.75rem', color: '#78716c' }}>Update your personal contact details</div>
                    </div>
                </div>
                <form onSubmit={handleSubmit}>
                    {field('Email Address', 'email', 'email')}
                    {field('Contact Number', 'contact_number')}
                    {field('Address', 'address')}
                    {field('Guardian Name', 'guardian_name')}
                    {error && <p style={{ color: '#dc2626', fontSize: '.8rem', marginBottom: 12 }}>{error}</p>}
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                        <button type="button" onClick={onClose} className="btn btn-outline" disabled={saving}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Check size={14} /> {saving ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function MyProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        api.get('/student/profile')
            .then(r => setProfile(r.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading profile…</div>;
    if (!profile) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Profile not found.</div>;

    const initials = `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`;
    const fullName = [profile.first_name, profile.middle_name, profile.last_name].filter(Boolean).join(' ');
    const deptLabel = { IT: 'Information Technology', CS: 'Computer Science' };
    const yearLabel = n => n ? `${['1st','2nd','3rd','4th'][n-1] ?? n+'th'} Year` : null;
    const currentYear = profile.academic_records?.length
        ? Math.max(...profile.academic_records.map(r => r.year_level ?? 0)) || null
        : null;
    const statusColor = { active: '#16a34a', inactive: '#78716c', graduated: '#2563eb', dropped: '#dc2626', loa: '#e97316' };

    return (
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 16px' }}>

            {editing && (
                <EditModal
                    profile={profile}
                    onClose={() => setEditing(false)}
                    onSave={updated => setProfile(prev => ({ ...prev, ...updated }))}
                />
            )}

            {/* Header card */}
            <div style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', borderRadius: 20, padding: '28px 28px 24px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,.07)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,.25)', border: '3px solid rgba(255,255,255,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.4rem' }}>{initials}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: '1.4rem', color: '#fff' }}>{fullName}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.85)', fontFamily: 'monospace', fontWeight: 600 }}>{profile.student_id}</span>
                            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,.5)' }} />
                            <span style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.85)' }}>{deptLabel[profile.department] || profile.department}</span>
                            {currentYear && <>
                                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,.5)' }} />
                                <span style={{ fontSize: '.75rem', fontWeight: 700, padding: '2px 10px', borderRadius: 999, background: 'rgba(255,255,255,.2)', color: '#fff' }}>{yearLabel(currentYear)}</span>
                            </>}
                            <span style={{ fontSize: '.75rem', fontWeight: 700, padding: '2px 10px', borderRadius: 999, background: 'rgba(255,255,255,.2)', color: '#fff', textTransform: 'capitalize' }}>{profile.status === 'graduated' ? 'Alumni' : profile.status}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setEditing(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,.2)', border: '1.5px solid rgba(255,255,255,.4)', color: '#fff', fontWeight: 700, fontSize: '.8rem', cursor: 'pointer', flexShrink: 0, fontFamily: 'Inter,sans-serif' }}
                    >
                        <Pencil size={13} /> Edit Profile
                    </button>
                </div>

                {/* Quick stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 20 }}>
                    {[
                        { label: 'Violations', value: profile.violations?.filter(v => !v.is_resolved).length ?? 0, warn: true },
                        { label: 'Skills',       value: profile.skills?.length ?? 0 },
                        { label: 'Affiliations', value: profile.affiliations?.length ?? 0 },
                        { label: 'Activities',   value: profile.non_academic_histories?.length ?? 0 },
                    ].map(({ label, value, warn }) => (
                        <div key={label} style={{ background: 'rgba(255,255,255,.15)', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: warn && value > 0 ? '#fde68a' : '#fff' }}>{value}</div>
                            <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.75)', fontWeight: 600, marginTop: 2 }}>{label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Body */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,.06)', border: '1px solid #f1f5f9' }}>

                <Section label="Personal Information">
                    <InfoRow label="Student ID"    value={profile.student_id} />
                    <InfoRow label="Full Name"      value={fullName} />
                    <InfoRow label="Date of Birth"  value={fmt(profile.date_of_birth)} />
                    <InfoRow label="Age"            value={profile.age} />
                    <InfoRow label="Gender"         value={profile.gender} />
                    <InfoRow label="Department"     value={deptLabel[profile.department] || profile.department} />
                    <InfoRow label="Section"        value={profile.section ? `${currentYear ?? ''}${profile.department}-${profile.section}` : null} />
                    <InfoRow label="Year Level"     value={yearLabel(currentYear)} />
                    <InfoRow label="Enrolled"       value={fmt(profile.enrollment_date)} />
                    <InfoRow label="Email"          value={profile.email} />
                    <InfoRow label="Contact"        value={profile.contact_number} />
                    <InfoRow label="Address"        value={profile.address} />
                    <InfoRow label="Guardian"       value={profile.guardian_name} />
                    <InfoRow label="Emergency Contact" value={profile.emergency_contact_name} />
                    <InfoRow label="Emergency No."  value={profile.emergency_contact_number} />
                </Section>

                {profile.skills?.length > 0 && (
                    <Section label="Skills" color="#7c3aed">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {profile.skills.map(sk => (
                                <div key={sk.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, background: '#f5f3ff', border: '1px solid #ddd6fe', fontSize: '.8rem', fontWeight: 600, color: '#7c3aed' }}>
                                    {sk.skill_name}
                                    <span style={{ fontSize: '.7rem', color: '#a78bfa' }}>· {sk.skill_level}</span>
                                    {sk.certification === 1 && <span style={{ fontSize: '.68rem', background: '#7c3aed', color: '#fff', borderRadius: 4, padding: '1px 5px' }}>cert</span>}
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {profile.affiliations?.length > 0 && (
                    <Section label="Affiliations" color="#0891b2">
                        {profile.affiliations.map(a => (
                            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', borderRadius: 8, background: '#f0f9ff', border: '1px solid #bae6fd', marginBottom: 6 }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '.875rem', color: '#0c4a6e' }}>{a.name}</div>
                                    <div style={{ fontSize: '.75rem', color: '#0369a1', marginTop: 2 }}>{a.role} · {a.type}</div>
                                </div>
                                {a.date_joined && <span style={{ fontSize: '.75rem', color: '#7dd3fc', alignSelf: 'center' }}>{fmt(a.date_joined)}</span>}
                            </div>
                        ))}
                    </Section>
                )}

                {profile.non_academic_histories?.length > 0 && (
                    <Section label="Non-Academic Activities" color="#d97706">
                        {profile.non_academic_histories.map(h => (
                            <div key={h.id} style={{ padding: '9px 14px', borderRadius: 8, background: '#fffbeb', border: '1px solid #fde68a', marginBottom: 6 }}>
                                <div style={{ fontWeight: 700, fontSize: '.875rem', color: '#92400e' }}>{h.activity_title}</div>
                                <div style={{ fontSize: '.75rem', color: '#b45309', marginTop: 2 }}>{h.category} · {h.role} · {h.organizer}</div>
                                {h.game_result && <div style={{ fontSize: '.75rem', color: '#d97706', fontWeight: 600, marginTop: 2 }}>Result: {h.game_result}</div>}
                            </div>
                        ))}
                    </Section>
                )}

                {profile.violations?.length > 0 && (
                    <Section label="Violations" color="#dc2626">
                        {profile.violations.map(v => (
                            <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 8, background: v.is_resolved ? '#f0fdf4' : '#fef2f2', border: `1px solid ${v.is_resolved ? '#bbf7d0' : '#fecaca'}`, marginBottom: 6 }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '.875rem' }}>{v.violation_type}</div>
                                    {v.description && <div style={{ fontSize: '.75rem', color: '#78716c', marginTop: 2 }}>{v.description}</div>}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, marginLeft: 12 }}>
                                    <span style={{ fontSize: '.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: v.severity_level === 'major' ? '#fee2e2' : '#fef9c3', color: v.severity_level === 'major' ? '#dc2626' : '#ca8a04' }}>{v.severity_level}</span>
                                    {v.is_resolved && <span style={{ fontSize: '.68rem', fontWeight: 700, color: '#16a34a' }}>✓ Resolved</span>}
                                </div>
                            </div>
                        ))}
                    </Section>
                )}

            </div>
        </div>
    );
}
