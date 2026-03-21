import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { getAllFacultyReports } from '../api';
import { FileText, Search, Printer, ChevronLeft, Users } from 'lucide-react';

const STATUS_STYLE = {
    draft:     { bg: '#fef9c3', color: '#854d0e' },
    submitted: { bg: '#dcfce7', color: '#166534' },
};

function PrintView({ report }) {
    const f = report.faculty;
    const facultyName = f ? `${f.first_name} ${f.last_name}` : '—';
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
                        <td style={ps.cell}>{facultyName}</td>
                        <td style={ps.cell}><strong>Subject / Student</strong></td>
                        <td style={ps.cell}>{report.subject_student || '—'}</td>
                    </tr>
                    <tr>
                        <td style={ps.cell}><strong>Department</strong></td>
                        <td style={ps.cell}>{f?.department || '—'}</td>
                        <td style={ps.cell}><strong>Status</strong></td>
                        <td style={ps.cell}>{report.status}</td>
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

const ps = { cell: { border: '1px solid #ccc', padding: '6px 10px' } };

export default function AdminFacultyReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [viewing, setViewing] = useState(null);
    const printRef = useRef();

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: viewing?.title || 'Faculty Report',
        pageStyle: `@page { size: A4; margin: 20mm 15mm; } body { font-family: Arial, sans-serif; }`,
    });

    useEffect(() => {
        getAllFacultyReports()
            .then(r => setReports(r.data))
            .finally(() => setLoading(false));
    }, []);

    const filtered = reports.filter(r => {
        const q = search.toLowerCase();
        const matchSearch = !q ||
            r.title?.toLowerCase().includes(q) ||
            r.faculty?.last_name?.toLowerCase().includes(q) ||
            r.faculty?.first_name?.toLowerCase().includes(q) ||
            r.subject_student?.toLowerCase().includes(q) ||
            r.report_type?.toLowerCase().includes(q);
        const matchStatus = !filterStatus || r.status === filterStatus;
        return matchSearch && matchStatus;
    });

    // ── Print/detail view ──
    if (viewing) {
        return (
            <div>
                <div className="page-header no-print">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button className="btn btn-outline" onClick={() => setViewing(null)}>
                            <ChevronLeft size={15} /> Back to Reports
                        </button>
                        <button className="btn btn-primary" onClick={handlePrint}>
                            <Printer size={14} /> Print
                        </button>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" ref={printRef}>
                        <PrintView report={viewing} />
                    </div>
                </div>
            </div>
        );
    }

    // ── List view ──
    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={s.iconWrap}><FileText size={22} color="#f97316" /></div>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>Faculty Reports</h1>
                        <p style={{ color: '#78716c', margin: 0, fontSize: '.875rem' }}>
                            {reports.length} report{reports.length !== 1 ? 's' : ''} submitted by faculty
                        </p>
                    </div>
                </div>
            </div>

            <div className="filter-bar">
                <div style={{ position: 'relative' }}>
                    <Search size={15} color="#f97316" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        placeholder="Search title, faculty, subject…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: 36 }}
                    />
                </div>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                </select>
            </div>

            {loading ? (
                <div className="loading"><div className="loading-spinner" /><p>Loading reports…</p></div>
            ) : filtered.length === 0 ? (
                <div className="empty">
                    <FileText size={40} color="#fed7aa" />
                    <p style={{ marginTop: 10 }}>{reports.length === 0 ? 'No faculty reports yet.' : 'No reports match your search.'}</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {filtered.map(r => {
                        const st = STATUS_STYLE[r.status] ?? STATUS_STYLE.draft;
                        const f = r.faculty;
                        return (
                            <div key={r.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setViewing(r)}>
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
                                            <div style={{ display: 'flex', gap: 16, fontSize: '.82rem', color: '#78716c', flexWrap: 'wrap' }}>
                                                {f && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <Users size={12} /> {f.first_name} {f.last_name}{f.department ? ` — ${f.department}` : ''}
                                                    </span>
                                                )}
                                                {r.subject_student && <span>Subject: {r.subject_student}</span>}
                                                <span>{r.report_date}</span>
                                            </div>
                                            <p style={{ fontSize: '.85rem', color: '#44403c', marginTop: 8, lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                {r.content}
                                            </p>
                                        </div>
                                        <button
                                            className="btn btn-outline"
                                            style={{ flexShrink: 0 }}
                                            onClick={e => { e.stopPropagation(); setViewing(r); }}
                                        >
                                            <Printer size={13} /> View
                                        </button>
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
};
