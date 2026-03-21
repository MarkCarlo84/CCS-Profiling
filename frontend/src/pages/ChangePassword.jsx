import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { changePassword } from '../api';

// Defined outside the parent component so it's never recreated on re-render
function PasswordField({ label, value, onChange, showPassword, onToggleShow }) {
    return (
        <div style={s.fieldWrap}>
            <label style={s.label}>{label}</label>
            <div style={s.inputWrap}>
                <input
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    required
                    style={s.input}
                    placeholder="••••••••"
                />
                <button type="button" onClick={onToggleShow} style={s.eyeBtn} tabIndex={-1}>
                    {showPassword ? <EyeOff size={16} color="#78716c" /> : <Eye size={16} color="#78716c" />}
                </button>
            </div>
        </div>
    );
}

export default function ChangePassword() {
    const [form, setForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
    const [show, setShow] = useState({ current: false, new: false, confirm: false });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

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
            setError(err.response?.data?.message || 'Failed to change password. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={s.iconWrap}><KeyRound size={22} color="#f97316" /></div>
                    <div>
                        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>Change Password</h1>
                        <p style={{ color: '#78716c', margin: 0, fontSize: '.875rem' }}>Update your account password</p>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 460 }}>
                <div className="card">
                    <div className="card-body">
                        {success && (
                            <div style={s.successBox}>
                                <CheckCircle size={16} />
                                <span>{success}</span>
                            </div>
                        )}
                        {error && (
                            <div style={s.errorBox}>
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <PasswordField
                                label="Current Password"
                                value={form.current_password}
                                onChange={e => setForm(f => ({ ...f, current_password: e.target.value }))}
                                showPassword={show.current}
                                onToggleShow={() => setShow(v => ({ ...v, current: !v.current }))}
                            />
                            <PasswordField
                                label="New Password"
                                value={form.new_password}
                                onChange={e => setForm(f => ({ ...f, new_password: e.target.value }))}
                                showPassword={show.new}
                                onToggleShow={() => setShow(v => ({ ...v, new: !v.new }))}
                            />
                            <PasswordField
                                label="Confirm New Password"
                                value={form.new_password_confirmation}
                                onChange={e => setForm(f => ({ ...f, new_password_confirmation: e.target.value }))}
                                showPassword={show.confirm}
                                onToggleShow={() => setShow(v => ({ ...v, confirm: !v.confirm }))}
                            />

                            <p style={{ fontSize: '.78rem', color: '#a8a29e', margin: 0 }}>
                                Password must be at least 8 characters.
                            </p>

                            <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
                                {loading ? 'Saving...' : 'Change Password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

const s = {
    iconWrap: { width: 44, height: 44, borderRadius: 12, background: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    fieldWrap: { display: 'flex', flexDirection: 'column', gap: 6 },
    label: { fontSize: '.8rem', fontWeight: 700, color: '#44403c' },
    inputWrap: { display: 'flex', alignItems: 'center', border: '1.5px solid #e7e5e4', borderRadius: 10, overflow: 'hidden', background: '#fafaf9' },
    input: { flex: 1, border: 'none', outline: 'none', padding: '10px 12px', fontSize: '.875rem', background: 'transparent', color: '#1c1917', fontFamily: "'Inter',sans-serif" },
    eyeBtn: { background: 'none', border: 'none', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
    successBox: { display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', color: '#16a34a', fontSize: '.875rem', marginBottom: 4 },
    errorBox: { display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', color: '#dc2626', fontSize: '.875rem', marginBottom: 4 },
};
