import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Settings, UserCircle, KeyRound,
    Eye, EyeOff, CheckCircle, AlertCircle,
    Pencil, X, Save, Mail, Phone, Building2, BadgeCheck,
} from 'lucide-react';
import { getTeacherProfile, updateTeacherProfile, changePassword } from '../api';

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────
function Alert({ type, msg }) {
    const ok = type === 'success';
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: ok ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${ok ? '#bbf7d0' : '#fecaca'}`,
            borderRadius: 10, padding: '10px 14px',
            color: ok ? '#16a34a' : '#dc2626',
            fontSize: '.85rem',
        }}>
            {ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            <span>{msg}</span>
        </div>
    );
}

function PasswordField({ label, value, onChange, show, onToggle }) {
    return (
        <div style={s.fieldWrap}>
            <label style={s.label}>{label}</label>
            <div style={s.inputWrap}>
                <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    required
                    style={s.input}
                    placeholder="••••••••"
                />
                <button type="button" onClick={onToggle} style={s.eyeBtn} tabIndex={-1}>
                    {show ? <EyeOff size={15} color="#a8a29e" /> : <Eye size={15} color="#a8a29e" />}
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile tab — view mode shows info cards, edit mode shows form
// ─────────────────────────────────────────────────────────────────────────────
function ProfileTab({ profile, setProfile }) {
    const [editing, setEditing] = useState(false);
    const [form, setForm]       = useState(null);
    const [saving, setSaving]   = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError]     = useState('');

    // Sync form when profile loads
    useEffect(() => {
        if (profile) setForm({ ...profile });
    }, [profile]);

    const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

    const handleEdit = () => {
        setForm({ ...profile });
        setSuccess('');
        setError('');
        setEditing(true);
    };

    const handleCancel = () => {
        setEditing(false);
        setSuccess('');
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        setSaving(true);
        try {
            const res = await updateTeacherProfile(form);
            setProfile(res.data);
            setSuccess('Profile updated successfully.');
            setEditing(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (!profile) return <div style={{ color: '#a8a29e', padding: 8 }}>Loading profile...</div>;

    // ── View mode ──────────────────────────────────────────────────────────
    if (!editing) {
        return (
            <div>
                {success && <div style={{ marginBottom: 16 }}><Alert type="success" msg={success} /></div>}

                {/* Avatar + name banner */}
                <div style={s.banner}>
                    <div style={s.avatar}>
                        {profile.first_name?.[0]}{profile.last_name?.[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1c1917' }}>
                            {profile.first_name} {profile.last_name}
                        </div>
                        <div style={{ fontSize: '.82rem', color: '#78716c', marginTop: 2 }}>
                            {profile.position} · {profile.department}
                        </div>
                        <div style={{ fontSize: '.75rem', color: '#a8a29e', marginTop: 2 }}>
                            Faculty ID: {profile.faculty_id}
                        </div>
                    </div>
                    <button onClick={handleEdit} style={s.editBtn}>
                        <Pencil size={14} />
                        Edit Profile
                    </button>
                </div>

                {/* Info grid */}
                <div style={s.infoGrid}>
                    <InfoCard Icon={Mail}      label="Email"          value={profile.email          || '—'} />
                    <InfoCard Icon={Phone}     label="Contact Number" value={profile.contact_number || '—'} />
                    <InfoCard Icon={Building2} label="Department"     value={profile.department     || '—'} />
                    <InfoCard Icon={BadgeCheck} label="Position"      value={profile.position       || '—'} />
                </div>
            </div>
        );
    }

    // ── Edit mode ──────────────────────────────────────────────────────────
    return (
        <form onSubmit={handleSubmit}>
            {error && <div style={{ marginBottom: 16 }}><Alert type="error" msg={error} /></div>}

            <div style={s.formHeader}>
                <span style={{ fontWeight: 700, fontSize: '.95rem', color: '#1c1917' }}>Edit Profile</span>
                <button type="button" onClick={handleCancel} style={s.cancelBtn}>
                    <X size={14} /> Cancel
                </button>
            </div>

            <div style={s.formGrid}>
                <div style={s.fieldWrap}>
                    <label style={s.label}>First Name</label>
                    <input style={s.input2} value={form.first_name || ''} onChange={set('first_name')} required />
                </div>
                <div style={s.fieldWrap}>
                    <label style={s.label}>Last Name</label>
                    <input style={s.input2} value={form.last_name || ''} onChange={set('last_name')} required />
                </div>
                <div style={s.fieldWrap}>
                    <label style={s.label}>Department</label>
                    <select style={s.input2} value={form.department || ''} onChange={set('department')}>
                        <option value="">— Select —</option>
                        <option value="IT">IT</option>
                        <option value="CS">CS</option>
                    </select>
                </div>
                <div style={s.fieldWrap}>
                    <label style={s.label}>Position</label>
                    <input style={s.input2} value={form.position || ''} onChange={set('position')} />
                </div>
                <div style={{ ...s.fieldWrap, gridColumn: '1 / -1' }}>
                    <label style={s.label}>Email</label>
                    <input style={s.input2} type="email" value={form.email || ''} onChange={set('email')} />
                </div>
                <div style={{ ...s.fieldWrap, gridColumn: '1 / -1' }}>
                    <label style={s.label}>Contact Number</label>
                    <input style={s.input2} value={form.contact_number || ''} onChange={set('contact_number')} placeholder="09XXXXXXXXX" />
                </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="submit" disabled={saving} style={s.saveBtn}>
                    <Save size={14} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={handleCancel} style={s.cancelBtn}>
                    <X size={14} /> Cancel
                </button>
            </div>
        </form>
    );
}

function InfoCard({ Icon, label, value }) {
    return (
        <div style={s.infoCard}>
            <div style={s.infoIcon}><Icon size={16} color="#8b5cf6" /></div>
            <div>
                <div style={{ fontSize: '.72rem', color: '#a8a29e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
                <div style={{ fontSize: '.9rem', color: '#1c1917', fontWeight: 600, marginTop: 2 }}>{value}</div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Password tab
// ─────────────────────────────────────────────────────────────────────────────
function PasswordTab() {
    const [form, setForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
    const [show, setShow] = useState({ current: false, new: false, confirm: false });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError]     = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (form.new_password !== form.new_password_confirmation) {
            setError('New passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            await changePassword(form.current_password, form.new_password, form.new_password_confirmation);
            setSuccess('Password changed successfully.');
            setForm({ current_password: '', new_password: '', new_password_confirmation: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={s.formHeader}>
                <span style={{ fontWeight: 700, fontSize: '.95rem', color: '#1c1917' }}>Change Password</span>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
                {success && <Alert type="success" msg={success} />}
                {error   && <Alert type="error"   msg={error} />}
                <PasswordField label="Current Password"     value={form.current_password}        onChange={e => setForm(f => ({ ...f, current_password: e.target.value }))}        show={show.current} onToggle={() => setShow(v => ({ ...v, current: !v.current }))} />
                <PasswordField label="New Password"         value={form.new_password}            onChange={e => setForm(f => ({ ...f, new_password: e.target.value }))}            show={show.new}     onToggle={() => setShow(v => ({ ...v, new: !v.new }))} />
                <PasswordField label="Confirm New Password" value={form.new_password_confirmation} onChange={e => setForm(f => ({ ...f, new_password_confirmation: e.target.value }))} show={show.confirm} onToggle={() => setShow(v => ({ ...v, confirm: !v.confirm }))} />
                <p style={{ fontSize: '.75rem', color: '#a8a29e', margin: 0 }}>Password must be at least 8 characters.</p>
                <button type="submit" disabled={loading} style={{ ...s.saveBtn, alignSelf: 'flex-start' }}>
                    {loading ? 'Saving...' : 'Update Password'}
                </button>
            </form>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page — fetches profile ONCE, tabs use URL so KeepAlive caches them
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
    { path: '/settings/profile',  label: 'Profile',         Icon: UserCircle },
    { path: '/settings/password', label: 'Change Password', Icon: KeyRound },
];

export default function TeacherSettings() {
    const location = useLocation();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loadErr, setLoadErr] = useState('');

    // Fetch once on mount
    useEffect(() => {
        getTeacherProfile()
            .then(r => setProfile(r.data))
            .catch(() => setLoadErr('Failed to load profile.'));
    }, []);

    // Redirect /settings → /settings/profile
    useEffect(() => {
        if (location.pathname === '/settings') navigate('/settings/profile', { replace: true });
    }, [location.pathname]);

    const activeTab = TABS.find(t => location.pathname.startsWith(t.path))?.path ?? TABS[0].path;

    return (
        <div>
            {/* Page header */}
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={s.iconWrap}><Settings size={20} color="#8b5cf6" /></div>
                    <div>
                        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>Settings</h1>
                        <p style={{ color: '#78716c', margin: 0, fontSize: '.82rem' }}>Manage your profile and account security</p>
                    </div>
                </div>
            </div>

            {/* Tab bar */}
            <div style={s.tabBar}>
                {TABS.map(({ path, label, Icon }) => {
                    const active = activeTab === path;
                    return (
                        <button key={path} onClick={() => navigate(path)} style={{ ...s.tabBtn, ...(active ? s.tabBtnActive : {}) }}>
                            <Icon size={14} />
                            {label}
                        </button>
                    );
                })}
            </div>

            {/* Content card */}
            <div style={{ maxWidth: 580 }}>
                <div className="card">
                    <div className="card-body" style={{ padding: '24px' }}>
                        {loadErr && <Alert type="error" msg={loadErr} />}
                        {activeTab === '/settings/profile'  && <ProfileTab profile={profile} setProfile={setProfile} />}
                        {activeTab === '/settings/password' && <PasswordTab />}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const s = {
    iconWrap:    { width: 40, height: 40, borderRadius: 10, background: '#f5f3ff', border: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    tabBar:      { display: 'flex', gap: 2, marginBottom: 20, borderBottom: '2px solid #f5f5f4', paddingBottom: 0 },
    tabBtn:      { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '.85rem', fontWeight: 500, color: '#78716c', borderBottom: '2px solid transparent', marginBottom: -2, borderRadius: '6px 6px 0 0', transition: 'color .15s' },
    tabBtnActive:{ fontWeight: 700, color: '#8b5cf6', borderBottom: '2px solid #8b5cf6', background: '#faf5ff' },

    banner:   { display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', borderRadius: 14, padding: '20px 22px', marginBottom: 20 },
    avatar:   { width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800, color: '#fff', flexShrink: 0, letterSpacing: '.02em' },
    editBtn:  { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1.5px solid #ddd6fe', background: '#fff', color: '#8b5cf6', fontSize: '.82rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' },

    infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
    infoCard: { display: 'flex', alignItems: 'flex-start', gap: 12, background: '#fafaf9', border: '1.5px solid #f5f5f4', borderRadius: 12, padding: '14px 16px' },
    infoIcon: { width: 34, height: 34, borderRadius: 8, background: '#f5f3ff', border: '1px solid #ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

    formHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    formGrid:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 16 },
    fieldWrap:  { display: 'flex', flexDirection: 'column', gap: 5 },
    label:      { fontSize: '.75rem', fontWeight: 700, color: '#57534e', textTransform: 'uppercase', letterSpacing: '.04em' },
    input2:     { border: '1.5px solid #e7e5e4', borderRadius: 9, padding: '9px 12px', fontSize: '.875rem', background: '#fafaf9', color: '#1c1917', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: "'Inter',sans-serif" },
    inputWrap:  { display: 'flex', alignItems: 'center', border: '1.5px solid #e7e5e4', borderRadius: 9, overflow: 'hidden', background: '#fafaf9' },
    input:      { flex: 1, border: 'none', outline: 'none', padding: '9px 12px', fontSize: '.875rem', background: 'transparent', color: '#1c1917', fontFamily: "'Inter',sans-serif" },
    eyeBtn:     { background: 'none', border: 'none', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' },

    saveBtn:   { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 9, border: 'none', background: '#8b5cf6', color: '#fff', fontSize: '.875rem', fontWeight: 700, cursor: 'pointer' },
    cancelBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 9, border: '1.5px solid #e7e5e4', background: '#fff', color: '#78716c', fontSize: '.875rem', fontWeight: 600, cursor: 'pointer' },
};
