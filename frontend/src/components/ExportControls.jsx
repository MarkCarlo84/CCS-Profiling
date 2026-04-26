import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { FileDown, FileSpreadsheet, X, FileText, Loader2, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

/**
 * Standardized PDF/Print Header that is hidden on screen and revealed during export.
 */
export function PrintHeader({ title, subtitle, count, filters }) {
    return (
        <div className="pdf-only no-print" style={{ display: 'none', padding: '16px 20px 12px', borderBottom: '3px solid #f97316', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: '#1c1917' }}>CCS Comprehensive Profiling System</div>
                    <div style={{ fontSize: 11, color: '#78716c', marginTop: 2 }}>
                        {title} &nbsp;·&nbsp; {subtitle} &nbsp;·&nbsp; {count} record(s)
                    </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 10, color: '#a8a29e', lineHeight: 1.6 }}>
                    <div>Generated</div>
                    <div style={{ fontWeight: 700, color: '#78716c' }}>
                        {new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>
            {filters && (() => {
                const chips = [];
                Object.entries(filters).forEach(([key, val]) => {
                    if (val && key !== 'type' && key !== 'search') {
                        chips.push({ label: key.replace(/_/g, ' '), value: val });
                    } else if (key === 'search' && val) {
                        chips.push({ label: 'Search', value: `"${val}"` });
                    }
                });
                if (chips.length === 0) chips.push({ label: 'Filter', value: 'All Records' });
                return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {chips.map((c, idx) => (
                            <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 6, padding: '3px 9px', fontSize: 10 }}>
                                <span style={{ color: '#9a3412', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>{c.label}</span>
                                <span style={{ color: '#1c1917' }}>&nbsp;{c.value}</span>
                            </div>
                        ))}
                    </div>
                );
            })()}
        </div>
    );
}

/**
 * Reusable Export Buttons + Modal.
 * Props:
 * - printRef: Ref wrapper of the area to capture for PDF/Print.
 * - data: Raw array of rows to export.
 * - flattenFn: Function mapper to convert raw data to Excel columns.
 * - filenamePrefix: e.g. 'Student_Data_Map'
 */
export function ExportButtons({ printRef, data, flattenFn, filenamePrefix = 'Export' }) {
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [pdfGenerating, setPdfGenerating] = useState(false);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `CCS_${filenamePrefix}`,
        onBeforeGetContent: () => {
            if (!printRef.current) return;
            const toHide = printRef.current.querySelectorAll('.pdf-hide');
            const toShow = printRef.current.querySelectorAll('.pdf-only');
            toHide.forEach(el => { el.style.display = 'none'; });
            toShow.forEach(el => { el.style.display = 'block'; });
        },
        onAfterPrint: () => {
            if (!printRef.current) return;
            const toHide = printRef.current.querySelectorAll('.pdf-hide');
            const toShow = printRef.current.querySelectorAll('.pdf-only');
            toHide.forEach(el => { el.style.display = ''; });
            toShow.forEach(el => { el.style.display = 'none'; });
        }
    });

    // Modern html2pdf block for direct PDF download
    const handlePdfDownload = useCallback(async () => {
        if (!printRef.current) return;
        setPdfGenerating(true);
        // Reveal pdf-only block (header) and hide pdf-hide blocks (pagination)
        const toHide = printRef.current.querySelectorAll('.pdf-hide');
        const toShow = printRef.current.querySelectorAll('.pdf-only');
        toHide.forEach(el => { el.style.display = 'none'; });
        toShow.forEach(el => { el.style.display = 'block'; });
        try {
            const html2pdf = (await import('html2pdf.js')).default;
            const filename = `CCS_${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.pdf`;
            await html2pdf()
                .set({
                    margin: [8, 6, 8, 6],
                    filename,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, logging: false },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
                    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
                })
                .from(printRef.current)
                .save();
        } finally {
            toHide.forEach(el => { el.style.display = ''; });
            toShow.forEach(el => { el.style.display = 'none'; });
            setPdfGenerating(false);
        }
    }, [printRef, filenamePrefix]);

    const handleExcelExport = useCallback(() => {
        if (!data || data.length === 0) return;
        const rows = data.map(flattenFn);
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Report');

        // Auto-width columns
        const colWidths = Object.keys(rows[0] || {}).map(key => ({
            wch: Math.max(key.length, ...rows.map(r => String(r[key] || '').length)) + 2
        }));
        ws['!cols'] = colWidths;

        const filename = `CCS_${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, filename);
    }, [data, flattenFn, filenamePrefix]);

    return (
        <>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                    className="btn btn-outline"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.82rem', padding: '7px 14px' }}
                    onClick={handlePrint}
                    disabled={pdfGenerating}
                    title="Print Document"
                >
                    <Printer size={14} />
                    Print
                </button>
                <button
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.82rem', padding: '7px 14px' }}
                    onClick={() => setShowSaveModal(true)}
                    title="Save as PDF or Excel"
                >
                    <FileDown size={14} />
                    Save as Document
                </button>
            </div>

            {/* Save as Document Modal */}
            {showSaveModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, padding: 20,
                }}>
                    <div style={{
                        background: '#fff', borderRadius: 20, padding: '32px 36px',
                        width: '100%', maxWidth: 420,
                        boxShadow: '0 24px 64px rgba(0,0,0,.22)',
                        position: 'relative',
                    }}>
                        {/* Close */}
                        <button
                            onClick={() => setShowSaveModal(false)}
                            style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,.05)', border: '1px solid rgba(0,0,0,.08)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#78716c' }}
                        >
                            <X size={16} />
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FileDown size={22} color="#f97316" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1c1917' }}>Save as Document</div>
                                <div style={{ fontSize: '.78rem', color: '#78716c', marginTop: 2 }}>Choose your preferred format</div>
                            </div>
                        </div>

                        <div style={{ height: 1, background: '#f1f5f9', margin: '20px 0' }} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {/* PDF Option */}
                            <button
                                onClick={() => { setShowSaveModal(false); handlePdfDownload(); }}
                                disabled={pdfGenerating}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 16,
                                    padding: '16px 20px', borderRadius: 12,
                                    border: '1.5px solid #fecaca', background: '#fef2f2',
                                    cursor: pdfGenerating ? 'not-allowed' : 'pointer',
                                    textAlign: 'left', width: '100%',
                                    transition: 'all .15s', opacity: pdfGenerating ? 0.6 : 1,
                                }}
                                onMouseEnter={e => { if (!pdfGenerating) { e.currentTarget.style.borderColor = '#dc2626'; e.currentTarget.style.background = '#fee2e2'; } }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#fecaca'; e.currentTarget.style.background = '#fef2f2'; }}
                            >
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {pdfGenerating
                                        ? <Loader2 size={20} color="#fff" style={{ animation: 'spin .7s linear infinite' }} />
                                        : <FileText size={20} color="#fff" />}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '.9rem', color: '#991b1b' }}>PDF Document</div>
                                    <div style={{ fontSize: '.75rem', color: '#b91c1c', marginTop: 2 }}>
                                        {pdfGenerating ? 'Generating PDF, please wait…' : 'Downloads directly as a .pdf file'}
                                    </div>
                                </div>
                            </button>

                            {/* Excel Option */}
                            <button
                                onClick={() => { setShowSaveModal(false); handleExcelExport(); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 16,
                                    padding: '16px 20px', borderRadius: 12,
                                    border: '1.5px solid #bbf7d0', background: '#f0fdf4',
                                    cursor: 'pointer', textAlign: 'left', width: '100%',
                                    transition: 'all .15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.background = '#dcfce7'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#bbf7d0'; e.currentTarget.style.background = '#f0fdf4'; }}
                            >
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <FileSpreadsheet size={20} color="#fff" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '.9rem', color: '#14532d' }}>Excel Spreadsheet</div>
                                    <div style={{ fontSize: '.75rem', color: '#15803d', marginTop: 2 }}>Downloads as .xlsx — opens in Excel or Sheets</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
