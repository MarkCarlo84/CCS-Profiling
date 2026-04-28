import React, { useState, useCallback, useEffect } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { FileDown, FileSpreadsheet, X, FileText, Loader2, AlertCircle } from 'lucide-react';

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
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'error') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    // PDF — generate individual report pages with proper formatting
    const handlePdfDownload = useCallback(async () => {
        setPdfGenerating(true);
        try {
            const { jsPDF } = await import('jspdf');

            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const filename = `CCS_${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.pdf`;
            const dateStr = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });

            // Get data
            const rawData = typeof data === 'function' ? await data() : (data || []);
            
            console.log('PDF Export - Raw data count:', rawData.length); // Debug log
            
            if (rawData.length === 0) {
                showToast('No data available to export to PDF.');
                return;
            }

            // Generate individual report pages
            rawData.forEach((report, index) => {
                console.log(`Processing report ${index + 1}:`, report.title); // Debug log
                
                if (index > 0) {
                    doc.addPage();
                }

                // Header
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text('CCS Comprehensive Profiling System', 105, 20, { align: 'center' });
                
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text(report.title || 'Faculty Report', 105, 30, { align: 'center' });

                // Report metadata table
                const metadataY = 45;
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');

                // Get faculty name properly - handle both direct properties and nested objects
                const facultyName = report['Faculty Name'] || 
                                  report.faculty_name || 
                                  (report.faculty ? `${report.faculty.first_name} ${report.faculty.last_name}` : '—');
                const department = report['Department'] || 
                                 report.department || 
                                 (report.faculty?.department || '—');
                const reportType = report['Report Type'] || report.report_type || '—';
                const reportDate = report['Report Date'] || report.report_date || '—';
                const status = report['Status'] || report.status || '—';
                const subjectStudent = report['Subject/Student'] || report.subject_student || '—';

                // Table headers and data
                const tableData = [
                    ['Report Type', reportType, 'Date', reportDate],
                    ['Prepared By', facultyName, 'Status', status],
                    ['Department', department, 'Subject/Student', subjectStudent]
                ];

                // Draw metadata table
                let currentY = metadataY;
                tableData.forEach(row => {
                    // Left column
                    doc.setFont('helvetica', 'bold');
                    doc.text(row[0], 20, currentY);
                    doc.setFont('helvetica', 'normal');
                    doc.text(String(row[1]), 55, currentY);
                    
                    // Right column
                    doc.setFont('helvetica', 'bold');
                    doc.text(row[2], 110, currentY);
                    doc.setFont('helvetica', 'normal');
                    doc.text(String(row[3]), 140, currentY);
                    
                    currentY += 8;
                });

                // Content section
                const contentY = currentY + 10;
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text('Report Content:', 20, contentY);

                // Content box
                const contentBoxY = contentY + 8;
                const contentBoxHeight = 150;
                doc.setDrawColor(200, 200, 200);
                doc.rect(20, contentBoxY, 170, contentBoxHeight);

                // Content text - handle both flattened and original data
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                const content = report['Content'] || report.content || 'No content available.';
                
                // Split content into lines that fit within the box
                const maxWidth = 160; // Box width minus padding
                const lines = doc.splitTextToSize(content, maxWidth);
                
                let textY = contentBoxY + 8;
                const lineHeight = 5;
                
                lines.forEach(line => {
                    if (textY + lineHeight > contentBoxY + contentBoxHeight - 5) {
                        // If text exceeds box, add "..." and stop
                        doc.text('...', 25, textY);
                        return;
                    }
                    doc.text(line, 25, textY);
                    textY += lineHeight;
                });

                // Signature section
                const signatureY = 250;
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text('Prepared by:', 20, signatureY);
                
                // Signature line
                doc.line(120, signatureY + 15, 190, signatureY + 15);
                doc.setFontSize(9);
                doc.text('Signature over Printed Name', 120, signatureY + 20);

                // Footer
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Generated on ${dateStr}`, 20, 285);
                doc.text(`Page ${index + 1} of ${rawData.length}`, 170, 285);
                doc.setTextColor(0);
            });

            console.log(`PDF generated with ${rawData.length} pages`); // Debug log
            doc.save(filename);
            showToast(`PDF downloaded successfully! (${rawData.length} reports)`, 'success');
        } catch (err) {
            console.error('PDF export error:', err);
            showToast('PDF export failed: ' + (err?.message || String(err)));
        } finally {
            setPdfGenerating(false);
        }
    }, [data, filenamePrefix]);

    const handleExcelExport = useCallback(async () => {
        try {
            let exportData = data;
            if (typeof data === 'function') {
                setPdfGenerating(true);
                try { exportData = await data(); }
                finally { setPdfGenerating(false); }
            }

            if (!exportData || exportData.length === 0) {
                showToast('No data available to export.');
                return;
            }

            const wb = new ExcelJS.Workbook();

            const addSheet = (sheetName, items) => {
                const cleanName = String(sheetName).replace(/[\[\]\*\\\?\:\/]/g, '').substring(0, 31) || 'Report';
                const ws = wb.addWorksheet(cleanName);
                const rows = items.map((item, i) => {
                    const flattened = flattenFn(item, i);
                    // Truncate content for better Excel readability
                    if (flattened['Content'] && flattened['Content'].length > 200) {
                        flattened['Content'] = flattened['Content'].substring(0, 197) + '...';
                    }
                    return flattened;
                });
                if (rows.length === 0) return;

                // Custom column widths with special handling for Content
                const columns = Object.keys(rows[0]).map(k => {
                    if (k === 'Content') {
                        return { header: k, key: k, width: 50 }; // Wider for content
                    } else if (k === 'Report Title') {
                        return { header: k, key: k, width: 30 };
                    } else if (k === 'Faculty Name' || k === 'Department') {
                        return { header: k, key: k, width: 20 };
                    } else {
                        const maxLen = rows.reduce((max, r) => Math.max(max, r[k] == null ? 0 : String(r[k]).length), 0);
                        return { header: k, key: k, width: Math.min(Math.max(k.length + 2, maxLen + 2, 12), 25) };
                    }
                });
                ws.columns = columns;

                rows.forEach(r => ws.addRow(r));

                // Header row style
                const headerRow = ws.getRow(1);
                headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEA580C' } };
                headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
                headerRow.height = 25;
                headerRow.eachCell(cell => {
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFC2410C' } },
                        left: { style: 'thin', color: { argb: 'FFC2410C' } },
                        bottom: { style: 'thin', color: { argb: 'FFC2410C' } },
                        right: { style: 'thin', color: { argb: 'FFC2410C' } },
                    };
                });

                // Data rows style with special handling for Content column
                ws.eachRow((row, rowNumber) => {
                    if (rowNumber === 1) return; // Skip header
                    
                    row.font = { color: { argb: 'FF334155' } };
                    
                    // Set row height for better content visibility
                    const contentCell = row.getCell('Content');
                    if (contentCell && contentCell.value && String(contentCell.value).length > 50) {
                        row.height = 60; // Taller rows for content
                    } else {
                        row.height = 20; // Standard height
                    }
                    
                    row.eachCell((cell, colNumber) => {
                        const val = cell.value;
                        const columnKey = ws.columns[colNumber - 1]?.key;
                        
                        if (columnKey === 'Content') {
                            // Special formatting for Content column
                            cell.alignment = { 
                                vertical: 'top', 
                                horizontal: 'left', 
                                wrapText: true 
                            };
                        } else {
                            const isShort = val == null || String(val).length <= 3;
                            cell.alignment = { 
                                vertical: 'middle', 
                                horizontal: isShort ? 'center' : 'left', 
                                wrapText: false 
                            };
                        }
                        
                        cell.border = {
                            top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                            left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                            right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                        };
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
                Object.entries(groups).forEach(([key, items]) => addSheet(key, items));
            } else {
                addSheet('Report', exportData);
            }

            const buffer = await wb.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `CCS_${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.xlsx`);
            showToast('Excel file downloaded successfully!', 'success');
        } catch (err) {
            console.error('Excel export error:', err);
            showToast('Excel export failed: ' + (err?.message || String(err)));
        }
    }, [data, flattenFn, filenamePrefix, groupByKey]);

    return (
        <>
            {/* Toast notification */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
                    border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
                    borderRadius: 12, padding: '12px 16px',
                    boxShadow: '0 8px 24px rgba(0,0,0,.12)',
                    fontSize: '.875rem', fontWeight: 600,
                    color: toast.type === 'error' ? '#dc2626' : '#16a34a',
                    maxWidth: 360,
                }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{toast.msg}</span>
                    <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, marginLeft: 4, display: 'flex' }}>
                        <X size={14} />
                    </button>
                </div>
            )}
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
