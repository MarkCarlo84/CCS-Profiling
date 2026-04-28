import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { getAllFacultyReports, confirmFacultyReport } from '../api';
import { FileText, Search, Printer, ChevronLeft, Users, CheckCircle, Clock } from 'lucide-react';
import { ExportButtons, PrintHeader } from '../components/ExportControls';

const STATUS_STYLE = {
    submitted:  { bg: '#dcfce7', color: '#166534' },
    confirmed:  { bg: '#dbeafe', color: '#1e40af' },
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
    const [tab, setTab] = useState('submitted'); // 'submitted' | 'confirmed'
    const [viewing, setViewing] = useState(null);
    const [confirming, setConfirming] = useState(false);
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

    const handleConfirm = async () => {
        if (!viewing) return;
        setConfirming(true);
        try {
            await confirmFacultyReport(viewing.id);
            const updated = { ...viewing, status: 'confirmed' };
            setReports(prev => prev.map(r => r.id === viewing.id ? updated : r));
            setViewing(updated);
            setTab('confirmed');
        } finally {
            setConfirming(false);
        }
    };

    const filtered = reports.filter(r => {
        if (r.status !== tab) return false;
        const q = search.toLowerCase();
        return !q ||
            r.title?.toLowerCase().includes(q) ||
            r.faculty?.last_name?.toLowerCase().includes(q) ||
            r.faculty?.first_name?.toLowerCase().includes(q) ||
            r.subject_student?.toLowerCase().includes(q) ||
            r.report_type?.toLowerCase().includes(q);
    });

    const submittedCount = reports.filter(r => r.status === 'submitted').length;
    const confirmedCount = reports.filter(r => r.status === 'confirmed').length;

    // ── Detail view ──
    if (viewing) {
        return (
            <div>
                <div className="page-header no-print">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button className="btn btn-outline" onClick={() => setViewing(null)}>
                            <ChevronLeft size={15} /> Back to Reports
                        </button>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {viewing.status === 'submitted' && (
                                <button
                                    className="btn btn-primary"
                                    style={{ background: '#2563eb', borderColor: '#2563eb', display: 'flex', alignItems: 'center', gap: 6 }}
                                    onClick={handleConfirm}
                                    disabled={confirming}
                                >
                                    <CheckCircle size={14} />
                                    {confirming ? 'Confirming…' : 'Confirm Report'}
                                </button>
                            )}
                            {viewing.status === 'confirmed' && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.85rem', fontWeight: 700, color: '#1e40af', background: '#dbeafe', border: '1px solid #bfdbfe', borderRadius: 8, padding: '6px 14px' }}>
                                    <CheckCircle size={14} /> Confirmed
                                </span>
                            )}
                            <button className="btn btn-primary" onClick={handlePrint}>
                                <Printer size={14} /> Print
                            </button>
                        </div>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={s.iconWrap}><FileText size={22} color="#f97316" /></div>
                        <div>
                            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>Faculty Reports</h1>
                            <p style={{ color: '#78716c', margin: 0, fontSize: '.875rem' }}>
                                {reports.length} report{reports.length !== 1 ? 's' : ''} submitted by faculty
                            </p>
                        </div>
                    </div>
                    <ExportButtons
                        printRef={printRef}
                        data={filtered}
                        flattenFn={(report) => ({
                            'Report Title': report.title,
                            'Report Type': report.report_type || '—',
                            'Faculty Name': report.faculty ? `${report.faculty.first_name} ${report.faculty.last_name}` : '—',
                            'Department': report.faculty?.department || '—',
                            'Subject/Student': report.subject_student || '—',
                            'Status': report.status,
                            'Report Date': report.report_date || '—',
                            'Content': report.content,
                            'Created': new Date(report.created_at).toLocaleDateString(),
                        })}
                        filenamePrefix="Faculty_Reports"
                        groupByKey="status"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid #f1f5f9', paddingBottom: 0 }}>
                <button onClick={() => setTab('submitted')} style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer',
                    fontWeight: 700, fontSize: '.875rem', fontFamily: 'Inter,sans-serif',
                    color: tab === 'submitted' ? '#f97316' : '#78716c',
                    borderBottom: tab === 'submitted' ? '2px solid #f97316' : '2px solid transparent',
                    marginBottom: -2,
                }}>
                    <Clock size={15} />
                    Submitted Reports
                    <span style={{ background: tab === 'submitted' ? '#fff7ed' : '#f5f5f4', color: tab === 'submitted' ? '#f97316' : '#a8a29e', borderRadius: 999, padding: '1px 8px', fontSize: 11, fontWeight: 800 }}>{submittedCount}</span>
                </button>
                <button onClick={() => setTab('confirmed')} style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer',
                    fontWeight: 700, fontSize: '.875rem', fontFamily: 'Inter,sans-serif',
                    color: tab === 'confirmed' ? '#2563eb' : '#78716c',
                    borderBottom: tab === 'confirmed' ? '2px solid #2563eb' : '2px solid transparent',
                    marginBottom: -2,
                }}>
                    <CheckCircle size={15} />
                    Confirmed Reports
                    <span style={{ background: tab === 'confirmed' ? '#dbeafe' : '#f5f5f4', color: tab === 'confirmed' ? '#2563eb' : '#a8a29e', borderRadius: 999, padding: '1px 8px', fontSize: 11, fontWeight: 800 }}>{confirmedCount}</span>
                </button>
            </div>

            {/* Search */}
            <div className="filter-bar" style={{ marginBottom: 16 }}>
                <div style={{ position: 'relative' }}>
                    <Search size={15} color="#f97316" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        placeholder="Search title, faculty, subject…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: 36, border: '1px solid #fde8d0', borderRadius: 8, padding: '8px 12px 8px 36px', fontSize: '.875rem', outline: 'none', fontFamily: "'Inter',sans-serif", minWidth: 280 }}
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading"><div className="loading-spinner" /><p>Loading reports…</p></div>
            ) : filtered.length === 0 ? (
                <div className="empty">
                    <FileText size={40} color="#fed7aa" />
                    <p style={{ marginTop: 10 }}>
                        {tab === 'submitted' ? 'No submitted reports yet.' : 'No confirmed reports yet.'}
                    </p>
                </div>
            ) : (
                <div ref={printRef}>
                    <PrintHeader
                        title="Faculty Reports"
                        subtitle={tab === 'submitted' ? 'Submitted Reports' : 'Confirmed Reports'}
                        count={filtered.length}
                        filters={{ search, status: tab }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {filtered.map(r => {
                            const st = STATUS_STYLE[r.status] ?? STATUS_STYLE.submitted;
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
                </div>
            )}
        </div>
    );
}

const s = {
    iconWrap: { width: 44, height: 44, borderRadius: 12, background: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};
