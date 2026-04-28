import React, { useState, useCallback } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { FileDown, FileSpreadsheet, X, FileText, Loader2 } from 'lucide-react';

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
 * - groupByKey: Optional field to group data into multiple sheets.
 */
export function ExportButtons({ printRef, data, flattenFn, filenamePrefix = 'Export', groupByKey = null, onBeforePdf = null, onAfterPdf = null }) {
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [pdfGenerating, setPdfGenerating] = useState(false);

    // PDF — generate directly from data using jsPDF + autoTable (no DOM capture)
    const handlePdfDownload = useCallback(async () => {
        if (!printRef.current) return;
        setPdfGenerating(true);
        try {
            const { jsPDF } = await import('jspdf');
            const autoTable = (await import('jspdf-autotable')).default;

            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const filename = `CCS_${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.pdf`;
            const dateStr = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });

            // Collect all rows from the pdf-only tables inside printRef
            const tables = printRef.current.querySelectorAll('.pdf-only table');

            if (tables.length === 0) {
                // Fallback: use flattenFn on data array
                const rows = (typeof data === 'function' ? [] : (data || [])).map((item, i) => flattenFn(item, i));
                if (rows.length > 0) {
                    const cols = Object.keys(rows[0]);
                    // Header
                    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
                    doc.text('CCS Comprehensive Profiling System', 14, 14);
                    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
                    doc.text(`${filenamePrefix.replace(/_/g, ' ')} · ${rows.length} record(s) · Generated ${dateStr}`, 14, 20);
                    autoTable(doc, {
                        head: [cols],
                        body: rows.map(r => cols.map(c => r[c] ?? '')),
                        startY: 26,
                        styles: { fontSize: 8, cellPadding: 2 },
                        headStyles: { fillColor: [249, 115, 22], textColor: 255, fontStyle: 'bold' },
                        alternateRowStyles: { fillColor: [255, 247, 237] },
                    });
                }
            } else {
                // Header page
                doc.setFontSize(14); doc.setFont('helvetica', 'bold');
                doc.text('CCS Comprehensive Profiling System', 14, 14);
                doc.setFontSize(9); doc.setFont('helvetica', 'normal');
                doc.text(`${filenamePrefix.replace(/_/g, ' ')} · Generated ${dateStr}`, 14, 20);

                let isFirst = true;
                tables.forEach(table => {
                    // Get section heading from sibling h2
                    const section = table.closest('.pdf-only');
                    const heading = section?.querySelector('h2')?.textContent?.trim() || '';

                    const thead = table.querySelector('thead');
                    const tbody = table.querySelector('tbody');
                    if (!thead || !tbody) return;

                    const cols = Array.from(thead.querySelectorAll('th')).map(th => th.textContent.trim());
                    const rows = Array.from(tbody.querySelectorAll('tr')).map(tr =>
                        Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim())
                    );

                    if (!isFirst) doc.addPage();
                    isFirst = false;

                    if (heading) {
                        doc.setFontSize(11); doc.setFont('helvetica', 'bold');
                        doc.setTextColor(249, 115, 22);
                        doc.text(heading, 14, 28);
                        doc.setTextColor(0, 0, 0);
                    }

                    autoTable(doc, {
                        head: [cols],
                        body: rows,
                        startY: heading ? 32 : 26,
                        styles: { fontSize: 8, cellPadding: 2 },
                        headStyles: { fillColor: [249, 115, 22], textColor: 255, fontStyle: 'bold' },
                        alternateRowStyles: { fillColor: [255, 247, 237] },
                        didDrawPage: (d) => {
                            // Page number footer
                            doc.setFontSize(7); doc.setTextColor(150);
                            doc.text(`Page ${d.pageNumber}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 5);
                            doc.setTextColor(0);
                        },
                    });
                });
            }

            doc.save(filename);
        } finally {
            setPdfGenerating(false);
        }
    }, [printRef, filenamePrefix, data, flattenFn]);

    const handleExcelExport = useCallback(async () => {
        let exportData = data;
        if (typeof data === 'function') {
            setPdfGenerating(true); // Reuse loading state for UI
            try {
                exportData = await data();
            } finally {
                setPdfGenerating(false);
            }
        }

        if (!exportData || exportData.length === 0) return;
        
        const wb = new ExcelJS.Workbook();
        
        const addSheet = (sheetName, items) => {
            // Clean sheet name (Excel limits to 31 chars and disallows some special chars)
            const cleanName = String(sheetName).replace(/[\[\]\*\\\?\:\/]/g, '').substring(0, 31) || 'Report';
            const ws = wb.addWorksheet(cleanName);
            const rows = items.map(flattenFn);
            if (rows.length === 0) return;
            
            // Set columns
            const columns = Object.keys(rows[0]).map(k => ({
                header: k,
                key: k,
                width: Math.max(k.length + 5, 16)
            }));
            ws.columns = columns;
            
            // Add rows
            rows.forEach(r => ws.addRow(r));
            
            // Style Header Row
            const headerRow = ws.getRow(1);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFEA580C' } // Orange matching PDF headers
            };
            headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
            headerRow.height = 25;
            
            // Style Data Rows
            ws.eachRow((row, rowNumber) => {
                if (rowNumber > 1) {
                    row.font = { color: { argb: 'FF334155' } };
                    row.alignment = { vertical: 'middle', wrapText: true };
                }
                // Add Borders to all rows
                row.eachCell(cell => {
                    if (rowNumber === 1) {
                        cell.border = {
                            top: {style:'thin', color: {argb:'FFC2410C'}},
                            left: {style:'thin', color: {argb:'FFC2410C'}},
                            bottom: {style:'thin', color: {argb:'FFC2410C'}},
                            right: {style:'thin', color: {argb:'FFC2410C'}}
                        };
                    } else {
                        cell.border = {
                            top: {style:'thin', color: {argb:'FFE2E8F0'}},
                            left: {style:'thin', color: {argb:'FFE2E8F0'}},
                            bottom: {style:'thin', color: {argb:'FFE2E8F0'}},
                            right: {style:'thin', color: {argb:'FFE2E8F0'}}
                        };
                    }
                });
            });
        };

        if (groupByKey) {
            const groups = exportData.reduce((acc, item) => {
                const key = item[groupByKey] || 'Other';
                if (!acc[key]) acc[key] = [];
                acc[key].push(item);
                return acc;
            }, {});
            Object.entries(groups).forEach(([key, items]) => {
                addSheet(key, items);
            });
        } else {
            addSheet('Report', exportData);
        }

        const buffer = await wb.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `CCS_${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    }, [data, flattenFn, filenamePrefix, groupByKey]);

    return (
        <>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
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
