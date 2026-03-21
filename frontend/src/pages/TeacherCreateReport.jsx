import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useAuth } from '../AuthContext';
import { getTeacherReports, createTeacherReport, updateTeacherReport, deleteTeacherReport } from '../api';
import { FileText, Plus, Printer, Pencil, Trash2, X, Check, AlertCircle, ChevronLeft } from 'lucide-react';

const REPORT_TYPES = ['Incident Report', 'Academic Report', 'Behavioral Report', 'Progress Report', 'General Report'];
const empty = { title: '', report_type: '', subject_student: '', content: '', status: 'draft', report_date: new Date().toISOString().split('T')[0] };

function ReportForm({ initial, onSave, onCancel, saving, error }) {
    const [form, setForm] = useState(initial);
    const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                    <label style={s.label}>Report Title <span style={{ color: '#dc2626' }}>*</span></label>
                    <input required value={form.title} onChange={set('title')} placeholder="e.g. Mid-term Academic Progress Report" style={s.input} />
                </div>
                <div>
                    <label style={s.label}>Report Type</label>
                    <select value={form.report_type} onChange={set('report_type')} style={s.input}>
                        <option value="">— Select type —</option>
                        {REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label style={s.label}>Subject / Student Name</label>
                    <input value={form.subject_student} onChange={set('subject_student')} placeholder="e.g. Juan Dela Cruz or BSIT 3-A" style={s.input} />
                </div>
                <div>
                    <label style={s.label}>Report Date</label>
                    <input type="date" value={form.report_date} onChange={set('report_date')} style={s.input} />
                </div>
                <div>
                    <label style={s.label}>Status</label>
                    <select value={form.status} onChange={set('status')} style={s.input}>
                        <option value="draft">Draft</option>
                        <option value="submitted">Submitted</option>
                    </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                    <label style={s.label}>Report Content <span style={{ color: '#dc2626' }}>*</span></label>
                    <textarea
                        required
                        value={form.content}
                        onChange={set('content')}
                        placeholder="Write your report here..."
                        rows={12}
                        style={{ ...s.input, resize: 'vertical', lineHeight: 1.7 }}
                    />
                </div>
            </div>
            {error && (
                <div style={s.errorBox}><AlertCircle size={14} /><span>{error}</span></div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                    <Check size={14} /> {saving ? 'Saving…' : 'Save Report'}
                </button>
            </div>
        </form>
    );
}

function PrintView({ report, faculty }) {
    return (
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '0 8px' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: 1 }}>CCS Comprehensive Profiling System</h2>
                <h3 style={{ margin: '4px 0 0', fontSize: '1rem' }}>{report.title}</h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: '.85rem' }}>
                <tbody>
                    <tr>
                        <td style={ps.cell}><strong>Report Type</strong></td>
                        <td style={ps.cell}>{report.report_type || '—'}</td>
                        <td style={ps.cell}><strong>Date</strong></td>
                        <td style={ps.cell}>{report.report_date || '—'}</td>
                    </tr>
                    <tr>
                        <td style={ps.cell}><strong>Prepared By</strong></td>
                        <td style={ps.cell}>{faculty}</td>
                        <td style={ps.cell}><strong>Subject / Student</strong></td>
                        <td style={ps.cell}>{report.subject_student || '—'}</td>
                    </tr>
                </tbody>
            </table>
            <div style={{ border: '1px solid #ccc', borderRadius: 4, padding: '16px 20px', minHeight: 300, fontSize: '.9rem', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {report.content}
            </div>
            <div style={{ marginTop: 48, display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ textAlign: 'center', borderTop: '1px solid #333', paddingTop: 6, minWidth: 200, fontSize: '.82rem' }}>
                    Signature over Printed Name
                </div>
            </div>
        </div>
    );
}

const ps = {
    cell: { border: '1px solid #ccc', padding: '6px 10px' },
};

export default function TeacherCreateReport() {
    const { user } = useAuth();
    const facultyName = user?.profile ? `${user.profile.first_name} ${user.profile.last_name}` : user?.name;

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list' | 'new' | { edit: report } | { print: report }
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const printRef = useRef();

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: view?.print?.title || 'Report',
        pageStyle: `@page { size: A4; margin: 20mm 15mm; } body { font-family: Arial, sans-serif; }`,
    });

    const load = () => {
        setLoading(true);
        getTeacherReports().then(r => setReports(r.data)).finally(() => setLoading(false));
    };

    useEffect(load, []);

    const handleSave = async (form) => {
        setSaving(true);
        setError('');
        try {
            if (view === 'new') {
                await createTeacherReport(form);
            } else {
                await updateTeacherReport(view.edit.id, form);
            }
            setView('list');
            load();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save report.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this report?')) return;
        await deleteTeacherReport(id);
        load();
    };

    const STATUS_STYLE = {
        draft:     { bg: '#fef9c3', color: '#854d0e' },
        submitted: { bg: '#dcfce7', color: '#166534' },
    };

    // ── Print view ──
    if (view?.print) {
        return (
            <div>
                <div className="page-header no-print">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button className="btn btn-outline" onClick={() => setView('list')}><ChevronLeft size={15} /> Back</button>
                        <button className="btn btn-primary" onClick={handlePrint}><Printer size={14} /> Print</button>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" ref={printRef}>
                        <PrintView report={view.print} faculty={facultyName} />
                    </div>
                </div>
            </div>
        );
    }

    // ── Form view (new / edit) ──
    if (view === 'new' || view?.edit) {
        return (
            <div>
                <div className="page-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={s.iconWrap}><FileText size={22} color="#f97316" /></div>
                        <div>
                            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>
                                {view === 'new' ? 'New Report' : 'Edit Report'}
                            </h1>
                            <p style={{ color: '#78716c', margin: 0, fontSize: '.875rem' }}>Prepared by: {facultyName}</p>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body">
                        <ReportForm
                            initial={view === 'new' ? empty : { ...view.edit }}
                            onSave={handleSave}
                            onCancel={() => setView('list')}
                            saving={saving}
                            error={error}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // ── List view ──
    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={s.iconWrap}><FileText size={22} color="#f97316" /></div>
                        <div>
                            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>My Reports</h1>
                            <p style={{ color: '#78716c', margin: 0, fontSize: '.875rem' }}>{reports.length} report{reports.length !== 1 ? 's' : ''} on record</p>
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={() => { setError(''); setView('new'); }}>
                        <Plus size={15} /> New Report
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading"><div className="loading-spinner" /><p>Loading…</p></div>
            ) : reports.length === 0 ? (
                <div className="empty">
                    <FileText size={40} color="#fed7aa" />
                    <p style={{ marginTop: 10 }}>No reports yet. Create your first one.</p>
                    <button className="btn btn-primary" onClick={() => setView('new')} style={{ marginTop: 8 }}>
                        <Plus size={14} /> New Report
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {reports.map(r => {
                        const st = STATUS_STYLE[r.status] ?? STATUS_STYLE.draft;
                        return (
                            <div key={r.id} className="card">
                                <div className="card-body">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                                                <span style={{ fontWeight: 800, fontSize: '.95rem', color: '#1c1917' }}>{r.title}</span>
                                                <span style={{ fontSize: '.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: st.bg, color: st.color }}>
                                                    {r.status}
                                                </span>
                                                {r.report_type && (
                                                    <span style={{ fontSize: '.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: '#f1f5f9', color: '#475569' }}>
                                                        {r.report_type}
                                                    </span>
                                                )}
                                            </div>
                                            {r.subject_student && <div style={{ fontSize: '.82rem', color: '#78716c' }}>Subject: {r.subject_student}</div>}
                                            <div style={{ fontSize: '.78rem', color: '#a8a29e', marginTop: 2 }}>{r.report_date}</div>
                                            <p style={{ fontSize: '.85rem', color: '#44403c', marginTop: 8, lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                {r.content}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                            <button style={{ ...s.iconBtn, color: '#2563eb' }} onClick={() => setView({ print: r })} title="Print"><Printer size={13} /></button>
                                            <button style={s.iconBtn} onClick={() => { setError(''); setView({ edit: r }); }} title="Edit"><Pencil size={13} /></button>
                                            <button style={{ ...s.iconBtn, color: '#dc2626' }} onClick={() => handleDelete(r.id)} title="Delete"><Trash2 size={13} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

const s = {
    iconWrap: { width: 44, height: 44, borderRadius: 12, background: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    label: { display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#44403c', marginBottom: 5 },
    input: { width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid #e7e5e4', fontSize: '.875rem', color: '#1c1917', boxSizing: 'border-box', fontFamily: "'Inter',sans-serif" },
    errorBox: { display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', color: '#dc2626', fontSize: '.82rem' },
    iconBtn: { background: 'rgba(0,0,0,.04)', border: '1px solid rgba(0,0,0,.08)', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#78716c' },
};
