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

// Separate PDF generation functions for different data types
function generateTableReport(doc, items, dateStr, filenamePrefix, flattenFn) {
    if (!items || items.length === 0) return;

    const flattenedItems = items.map((item, index) => flattenFn(item, index));
    if (flattenedItems.length === 0) return;

    const columns = Object.keys(flattenedItems[0]);
    const totalRecords = flattenedItems.length;

    // Landscape A4: 297 x 210 mm
    const pageW = 297;
    const pageH = 210;
    const marginX = 10;
    const marginY = 10;
    const tableWidth = pageW - marginX * 2;

    // Define column widths proportionally based on column name
    const colWidthMap = {
        '#': 8,
        'Student ID': 22, 'Faculty ID': 22,
        'Last Name': 24, 'First Name': 24,
        'Gender': 16, 'Age': 12,
        'Department': 22, 'Status': 18,
        'Skills': 38, 'Affiliations': 38,
        'Email': 48, 'Contact': 24,
        'Position': 28, 'Middle Name': 22,
        'Section': 18, 'Guardian': 28,
        'Violations': 20, 'Category': 24,
        'Skill Name': 28, 'Skill Level': 22,
        'Certification': 22, 'Type': 18,
        'Name': 30, 'Description': 40,
    };

    // Assign widths, distribute remaining space evenly for unknown columns
    let assignedWidth = 0;
    let unassignedCols = 0;
    columns.forEach(col => {
        if (colWidthMap[col]) assignedWidth += colWidthMap[col];
        else unassignedCols++;
    });
    const remainingWidth = tableWidth - assignedWidth;
    const defaultColWidth = unassignedCols > 0 ? Math.max(remainingWidth / unassignedCols, 18) : 18;
    const colWidths = columns.map(col => colWidthMap[col] || defaultColWidth);

    // Scale columns to fit exactly in tableWidth
    const totalAssigned = colWidths.reduce((a, b) => a + b, 0);
    const scale = tableWidth / totalAssigned;
    const finalColWidths = colWidths.map(w => w * scale);

    const headerRowH = 12;
    const dataRowH = 18;
    const pageHeaderH = 28;
    const availableH = pageH - marginY - pageHeaderH - headerRowH - 8;
    const rowsPerPage = Math.max(1, Math.floor(availableH / dataRowH));

    const pages = [];
    for (let i = 0; i < flattenedItems.length; i += rowsPerPage) {
        pages.push(flattenedItems.slice(i, i + rowsPerPage));
    }
    if (pages.length === 0) pages.push([]);

    const reportLabel = filenamePrefix.replace(/_/g, ' ');

    pages.forEach((pageItems, pageIndex) => {
        if (pageIndex > 0) doc.addPage();

        let curY = marginY;

        // Page header — left aligned like the example
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(28, 25, 23);
        doc.text('CCS Comprehensive Profiling System', marginX, curY + 8);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(120, 113, 108);
        doc.text(
            `Report ${reportLabel}  \u00B7  ${totalRecords} record(s)  \u00B7  Generated ${dateStr}`,
            marginX, curY + 16
        );

        curY += pageHeaderH;

        // Orange header row
        doc.setFillColor(249, 115, 22);
        doc.rect(marginX, curY, tableWidth, headerRowH, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);

        let colX = marginX;
        columns.forEach((col, ci) => {
            const cw = finalColWidths[ci];
            const headerLines = doc.splitTextToSize(col, cw - 3);
            doc.text(headerLines[0], colX + 2, curY + 8);
            colX += cw;
        });

        curY += headerRowH;

        // Data rows
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);

        pageItems.forEach((item, rowIndex) => {
            const rowY = curY + rowIndex * dataRowH;

            // White background for all rows (clean look matching example)
            doc.setFillColor(255, 255, 255);
            doc.rect(marginX, rowY, tableWidth, dataRowH, 'F');

            doc.setTextColor(51, 65, 85);

            let cx = marginX;
            columns.forEach((col, ci) => {
                const cw = finalColWidths[ci];
                const raw = item[col];
                const value = raw == null || raw === '' ? '\u2014' : String(raw);
                const lines = doc.splitTextToSize(value, cw - 3);
                lines.slice(0, 3).forEach((line, li) => {
                    doc.text(line, cx + 2, rowY + 5 + li * 4.5);
                });
                cx += cw;
            });
        });

        const tableBodyH = pageItems.length * dataRowH;

        // Grid lines
        doc.setDrawColor(209, 213, 219);
        doc.setLineWidth(0.3);

        // Outer border
        doc.rect(marginX, curY - headerRowH, tableWidth, headerRowH + tableBodyH);

        // Horizontal row lines
        for (let r = 1; r <= pageItems.length; r++) {
            const ly = curY + r * dataRowH;
            doc.line(marginX, ly, marginX + tableWidth, ly);
        }

        // Vertical column lines
        let vx = marginX;
        for (let ci = 0; ci < columns.length - 1; ci++) {
            vx += finalColWidths[ci];
            doc.line(vx, curY - headerRowH, vx, curY + tableBodyH);
        }

        // Footer
        doc.setFontSize(7.5);
        doc.setTextColor(160, 160, 160);
        doc.text(`Generated on ${dateStr}`, marginX, pageH - 4);
        doc.text(`Page ${pageIndex + 1} of ${pages.length}`, pageW - marginX, pageH - 4, { align: 'right' });
        doc.setTextColor(0);
    });
}


function generateReportPages(doc, reports, dateStr) {
    reports.forEach((report, index) => {
        if (index > 0) doc.addPage();
        
        const reportTitle = report['Report Title'] || report.title || 'Faculty Report';
        
        // Header
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('CCS Comprehensive Profiling System', 105, 20, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(reportTitle, 105, 30, { align: 'center' });

        // Report metadata
        const metadataY = 45;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const facultyName = report['Faculty Name'] || report.faculty_name || 
                           (report.faculty ? `${report.faculty.first_name} ${report.faculty.last_name}` : '—');
        const department = report['Department'] || report.department || 
                          (report.faculty?.department || '—');
        const reportType = report['Report Type'] || report.report_type || '—';
        const reportDate = report['Report Date'] || report.report_date || '—';
        const status = report['Status'] || report.status || '—';
        const subjectStudent = report['Subject/Student'] || report.subject_student || '—';

        const tableData = [
            ['Report Type', reportType, 'Date', reportDate],
            ['Prepared By', facultyName, 'Status', status],
            ['Department', department, 'Subject/Student', subjectStudent]
        ];

        // Draw metadata table
        let currentY = metadataY;
        tableData.forEach(row => {
            doc.setFont('helvetica', 'bold');
            doc.text(row[0], 20, currentY);
            doc.setFont('helvetica', 'normal');
            doc.text(String(row[1]), 55, currentY);
            
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

        const contentBoxY = contentY + 8;
        const contentBoxHeight = 150;
        doc.setDrawColor(200, 200, 200);
        doc.rect(20, contentBoxY, 170, contentBoxHeight);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const content = report['Content'] || report.content || 'No content available.';
        const lines = doc.splitTextToSize(content, 160);
        
        let textY = contentBoxY + 8;
        lines.forEach(line => {
            if (textY + 5 > contentBoxY + contentBoxHeight - 5) {
                doc.text('...', 25, textY);
                return;
            }
            doc.text(line, 25, textY);
            textY += 5;
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Generated on ${dateStr}`, 20, 285);
        doc.text(`Page ${index + 1} of ${reports.length}`, 170, 285);
        doc.setTextColor(0);
    });
}

function generateFacultyPages(doc, faculties, dateStr) {
    faculties.forEach((faculty, index) => {
        if (index > 0) doc.addPage();
        
        const facultyName = `${faculty['First Name'] || faculty.first_name || ''} ${faculty['Last Name'] || faculty.last_name || ''}`.trim();
        const facultyId = faculty['Faculty ID'] || faculty.faculty_id || `FAC-${index + 1}`;
        const title = `Faculty Profile - ${facultyName}`;
        
        console.log(`Generating faculty page ${index + 1}: ${title}`);
        
        // Header
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('CCS Comprehensive Profiling System', 105, 20, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 105, 30, { align: 'center' });

        // Create comprehensive faculty information table
        const startY = 45;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Prepare all faculty data
        const department = faculty['Department'] || faculty.department || '—';
        const position = faculty['Position'] || faculty.position || '—';
        const email = faculty['Email'] || faculty.email || '—';
        const contact = faculty['Contact Number'] || faculty.contact_number || '—';
        const middleName = faculty['Middle Name'] || faculty.middle_name || '';
        const fullName = `${faculty['First Name'] || faculty.first_name || ''} ${middleName} ${faculty['Last Name'] || faculty.last_name || ''}`.trim();

        // Table structure with proper formatting
        const tableRows = [
            ['Faculty Information', '', '', ''],
            ['Faculty ID', facultyId, 'Full Name', fullName],
            ['Department', department, 'Position', position],
            ['', '', '', ''],
            ['Contact Information', '', '', ''],
            ['Email Address', email, 'Contact Number', contact],
            ['', '', '', ''],
            ['System Information', '', '', ''],
            ['Generated On', dateStr, 'Profile Type', 'Faculty Profile']
        ];

        // Draw table with borders and proper formatting
        let currentY = startY;
        const rowHeight = 14;
        const colWidths = [45, 65, 35, 45];
        const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
        const startX = 20;

        // Table border
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.rect(startX, startY, tableWidth, tableRows.length * rowHeight);

        tableRows.forEach((row, rowIndex) => {
            const isHeaderRow = row[0] === 'Faculty Information' || 
                               row[0] === 'Contact Information' || 
                               row[0] === 'System Information';
            const isEmptyRow = row[0] === '' && row[1] === '' && row[2] === '' && row[3] === '';

            // Row background for headers
            if (isHeaderRow) {
                doc.setFillColor(249, 115, 22); // Orange color #f97316
                doc.rect(startX, currentY, tableWidth, rowHeight, 'F');
            }

            // Draw horizontal lines
            if (rowIndex > 0) {
                doc.line(startX, currentY, startX + tableWidth, currentY);
            }

            if (!isEmptyRow) {
                let currentX = startX;
                
                row.forEach((cell, colIndex) => {
                    // Draw vertical lines
                    if (colIndex > 0) {
                        doc.line(currentX, startY, currentX, startY + (tableRows.length * rowHeight));
                    }

                    // Cell content
                    if (cell && cell !== '') {
                        const isLabel = colIndex % 2 === 0;
                        
                        if (isHeaderRow) {
                            doc.setFont('helvetica', 'bold');
                            doc.setFontSize(11);
                            doc.setTextColor(255, 255, 255); // White text for orange headers
                        } else if (isLabel) {
                            doc.setFont('helvetica', 'bold');
                            doc.setFontSize(9);
                            doc.setTextColor(0, 0, 0); // Black text for labels
                        } else {
                            doc.setFont('helvetica', 'normal');
                            doc.setFontSize(9);
                            doc.setTextColor(0, 0, 0); // Black text for values
                        }

                        // Handle text
                        const maxWidth = colWidths[colIndex] - 4;
                        const lines = doc.splitTextToSize(String(cell), maxWidth);
                        
                        if (lines.length === 1) {
                            doc.text(lines[0], currentX + 2, currentY + 9);
                        } else {
                            lines.slice(0, 2).forEach((line, lineIndex) => {
                                doc.text(line, currentX + 2, currentY + 6 + (lineIndex * 5));
                            });
                            if (lines.length > 2) {
                                doc.text('...', currentX + 2, currentY + 11);
                            }
                        }
                    }

                    currentX += colWidths[colIndex];
                });
            }

            currentY += rowHeight;
        });

        // Draw final vertical lines
        let lineX = startX;
        colWidths.forEach((width, index) => {
            if (index < colWidths.length) {
                doc.line(lineX + width, startY, lineX + width, startY + (tableRows.length * rowHeight));
            }
            lineX += width;
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Generated on ${dateStr}`, 20, 285);
        doc.text(`Page ${index + 1} of ${faculties.length}`, 170, 285);
        doc.setTextColor(0);
    });
}

function generateStudentPages(doc, students, dateStr) {
    students.forEach((student, index) => {
        if (index > 0) doc.addPage();
        
        const studentName = `${student['First Name'] || student.first_name || ''} ${student['Last Name'] || student.last_name || ''}`.trim();
        const studentId = student['Student ID'] || student.student_id || `STU-${index + 1}`;
        const title = `Student Profile - ${studentName}`;
        
        console.log(`Generating student page ${index + 1}: ${title}`);
        
        // Header
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('CCS Comprehensive Profiling System', 105, 20, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 105, 30, { align: 'center' });

        // Create comprehensive student information table
        const startY = 45;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Prepare all student data using correct field names from flattenStudent
        const department = student['Department'] || student.department || '—';
        const section = student['Section'] || student.section || '—';
        const middleName = student['Middle Name'] || student.middle_name || '';
        const fullName = `${student['First Name'] || student.first_name || ''} ${middleName} ${student['Last Name'] || student.last_name || ''}`.trim();
        const age = student['Age'] || student.age || '—';
        const gender = student['Gender'] || student.gender || '—';
        const contact = student['Contact'] || student.contact_number || '—';
        const guardian = student['Guardian'] || student.guardian_name || '—';
        const status = student['Status'] || student.status || '—';
        const skills = student['Skills'] || '—';
        const affiliations = student['Affiliations'] || '—';
        const violations = student['Violations'] || '0';

        // Table structure with proper formatting using available fields
        const tableRows = [
            ['Personal Information', '', '', ''],
            ['Student ID', studentId, 'Full Name', fullName],
            ['Department', department, 'Section', section],
            ['Age', age, 'Gender', gender],
            ['Status', status, 'Contact Number', contact],
            ['', '', '', ''],
            ['Guardian Information', '', '', ''],
            ['Guardian Name', guardian, '', ''],
            ['', '', '', ''],
            ['Academic & Activities', '', '', ''],
            ['Skills', skills, '', ''],
            ['Affiliations', affiliations, '', ''],
            ['Violations Count', violations, 'Generated On', dateStr]
        ];

        // Draw table with borders and proper formatting
        let currentY = startY;
        const rowHeight = 14; // Increased row height for better readability
        const colWidths = [45, 65, 35, 45]; // Adjusted column widths
        const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
        const startX = 20;

        // Table border
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.rect(startX, startY, tableWidth, tableRows.length * rowHeight);

        tableRows.forEach((row, rowIndex) => {
            const isHeaderRow = row[0] === 'Personal Information' || 
                               row[0] === 'Guardian Information' || 
                               row[0] === 'Academic & Activities';
            const isEmptyRow = row[0] === '' && row[1] === '' && row[2] === '' && row[3] === '';

            // Row background for headers
            if (isHeaderRow) {
                doc.setFillColor(249, 115, 22); // Orange color #f97316
                doc.rect(startX, currentY, tableWidth, rowHeight, 'F');
            }

            // Draw horizontal lines
            if (rowIndex > 0) {
                doc.line(startX, currentY, startX + tableWidth, currentY);
            }

            if (!isEmptyRow) {
                let currentX = startX;
                
                row.forEach((cell, colIndex) => {
                    // Draw vertical lines
                    if (colIndex > 0) {
                        doc.line(currentX, startY, currentX, startY + (tableRows.length * rowHeight));
                    }

                    // Cell content
                    if (cell && cell !== '') {
                        const isLabel = colIndex % 2 === 0; // Even columns are labels
                        
                        if (isHeaderRow) {
                            doc.setFont('helvetica', 'bold');
                            doc.setFontSize(11);
                            doc.setTextColor(255, 255, 255); // White text for orange headers
                        } else if (isLabel) {
                            doc.setFont('helvetica', 'bold');
                            doc.setFontSize(9);
                            doc.setTextColor(0, 0, 0); // Black text for labels
                        } else {
                            doc.setFont('helvetica', 'normal');
                            doc.setFontSize(9);
                            doc.setTextColor(0, 0, 0); // Black text for values
                        }

                        // Handle long text with better wrapping
                        const maxWidth = colWidths[colIndex] - 4;
                        let textToShow = String(cell);
                        
                        // Special handling for long content (skills, affiliations)
                        if (textToShow.length > 50 && (cell === skills || cell === affiliations)) {
                            textToShow = textToShow.substring(0, 47) + '...';
                        }
                        
                        const lines = doc.splitTextToSize(textToShow, maxWidth);
                        
                        if (lines.length === 1) {
                            doc.text(lines[0], currentX + 2, currentY + 9);
                        } else {
                            // Multi-line text with better spacing
                            lines.slice(0, 2).forEach((line, lineIndex) => {
                                doc.text(line, currentX + 2, currentY + 6 + (lineIndex * 5));
                            });
                            if (lines.length > 2) {
                                doc.text('...', currentX + 2, currentY + 11);
                            }
                        }
                    }

                    currentX += colWidths[colIndex];
                });
            }

            currentY += rowHeight;
        });

        // Draw final vertical lines
        let lineX = startX;
        colWidths.forEach((width, index) => {
            if (index < colWidths.length) {
                doc.line(lineX + width, startY, lineX + width, startY + (tableRows.length * rowHeight));
            }
            lineX += width;
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Generated on ${dateStr}`, 20, 285);
        doc.text(`Page ${index + 1} of ${students.length}`, 170, 285);
        doc.setTextColor(0);
    });
}

function generateGenericPages(doc, items, dateStr, filenamePrefix) {
    items.forEach((item, index) => {
        if (index > 0) doc.addPage();
        
        const title = `${filenamePrefix} - Record ${index + 1}`;
        
        // Header
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('CCS Comprehensive Profiling System', 105, 20, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 105, 30, { align: 'center' });

        // Generic data display
        const startY = 50;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        let currentY = startY;
        Object.entries(item).forEach(([key, value]) => {
            if (currentY > 270) return; // Prevent overflow
            
            doc.setFont('helvetica', 'bold');
            doc.text(`${key}:`, 20, currentY);
            doc.setFont('helvetica', 'normal');
            doc.text(String(value || '—'), 60, currentY);
            currentY += 8;
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Generated on ${dateStr}`, 20, 285);
        doc.text(`Page ${index + 1} of ${items.length}`, 170, 285);
        doc.setTextColor(0);
    });
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

    // PDF — generate pages based on data type
    const handlePdfDownload = useCallback(async () => {
        setPdfGenerating(true);
        try {
            const { jsPDF } = await import('jspdf');

            // Get data
            const rawData = typeof data === 'function' ? await data() : (data || []);
            
            if (rawData.length === 0) {
                showToast('No data available to export to PDF.');
                return;
            }

            // Detect data type based on flattened properties and filename prefix
            const sampleItem = rawData[0];
            
            // Check properties first, then filename prefix as fallback
            const hasReportTitle = sampleItem['Report Title'] || sampleItem.title;
            const hasFacultyId = sampleItem['Faculty ID'] || sampleItem.faculty_id;
            const hasStudentId = sampleItem['Student ID'] || sampleItem.student_id;
            
            // Filename-based detection — exclude Filter & Query prefixes (Report_students, Report_faculties)
            const isFilterQueryReport = /^Report_(students|faculties)$/i.test(filenamePrefix);
            const prefixIsFaculty = !isFilterQueryReport && (
                                   filenamePrefix.includes('Faculty') || 
                                   filenamePrefix.startsWith('Faculty_') || 
                                   filenamePrefix.includes('faculties'));
            const prefixIsStudent = !isFilterQueryReport && (
                                   filenamePrefix.includes('Student') || 
                                   filenamePrefix.startsWith('Students_') || 
                                   filenamePrefix.includes('students'));
            const prefixIsReport = (filenamePrefix.includes('Report') || filenamePrefix.includes('_Reports')) && 
                                  !prefixIsFaculty && !prefixIsStudent && !isFilterQueryReport;
            
            // Determine data type with priority: property-based > filename-based
            const isFacultyData = hasFacultyId || prefixIsFaculty;
            const isStudentData = hasStudentId || prefixIsStudent;
            const isReportData = hasReportTitle || prefixIsReport;
            
            // Check if this is a table-based report (multiple records) vs individual profiles
            // Report_students / Report_faculties from Filter & Query page are always table reports
            const isTableReport = filenamePrefix.includes('Map') || 
                                 filenamePrefix.includes('Skills') || 
                                 filenamePrefix.includes('Violations') || 
                                 filenamePrefix.includes('Affiliations') || 
                                 filenamePrefix.includes('Histories') || 
                                 filenamePrefix.includes('Criteria') ||
                                 filenamePrefix.includes('Global_Search') ||
                                 filenamePrefix.startsWith('Students_') ||
                                 filenamePrefix.startsWith('Faculty_') ||
                                 /^Report_(students|faculties)$/i.test(filenamePrefix);
            
            // Use landscape for table reports, portrait for individual profiles
            const orientation = isTableReport ? 'landscape' : 'portrait';
            const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
            const filename = `CCS_${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.pdf`;
            const dateStr = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
            console.log('Sample item properties:', Object.keys(sampleItem));

            if (isTableReport) {
                console.log('Using generateTableReport for landscape layout');
                generateTableReport(doc, rawData, dateStr, filenamePrefix, flattenFn);
            } else if (isFacultyData && !isTableReport) {
                console.log('Using generateFacultyPages');
                generateFacultyPages(doc, rawData, dateStr);
            } else if (isStudentData && !isTableReport) {
                console.log('Using generateStudentPages');
                generateStudentPages(doc, rawData, dateStr);
            } else if (isReportData) {
                console.log('Using generateReportPages');
                generateReportPages(doc, rawData, dateStr);
            } else {
                console.log('Using generateGenericPages');
                generateGenericPages(doc, rawData, dateStr, filenamePrefix);
            }

            console.log(`PDF generated with ${rawData.length} pages`);
            doc.save(filename);
            showToast(`PDF downloaded successfully! (${rawData.length} records)`, 'success');
        } catch (err) {
            console.error('PDF export error:', err);
            showToast('PDF export failed: ' + (err?.message || String(err)));
        } finally {
            setPdfGenerating(false);
        }
    }, [data, filenamePrefix, flattenFn]);

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
                    // Truncate content for better Excel readability - only if Content field exists
                    if (flattened && flattened['Content'] && typeof flattened['Content'] === 'string' && flattened['Content'].length > 200) {
                        flattened['Content'] = flattened['Content'].substring(0, 197) + '...';
                    }
                    return flattened;
                });
                if (rows.length === 0) return;

                // Validate that we have valid data structure
                const firstRow = rows[0];
                if (!firstRow || typeof firstRow !== 'object') {
                    console.warn('Invalid data structure for Excel export:', firstRow);
                    return;
                }

                const columnKeys = Object.keys(firstRow);
                if (columnKeys.length === 0) {
                    console.warn('No columns found in data for Excel export');
                    return;
                }

                // Limit to reasonable number of columns to prevent Excel limits
                const maxColumns = 50; // Well within Excel's 16384 limit
                const limitedKeys = columnKeys.slice(0, maxColumns);

                // Custom column widths with special handling for Content
                const columns = limitedKeys.map(k => {
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

                // Add rows with only the limited columns
                rows.forEach(r => {
                    const limitedRow = {};
                    limitedKeys.forEach(key => {
                        limitedRow[key] = r[key];
                    });
                    ws.addRow(limitedRow);
                });

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
                    
                    // Set row height for better content visibility - only if Content column exists
                    const hasContentColumn = columns.some(col => col.key === 'Content');
                    if (hasContentColumn) {
                        const contentCell = row.getCell('Content');
                        if (contentCell && contentCell.value && String(contentCell.value).length > 50) {
                            row.height = 60; // Taller rows for content
                        } else {
                            row.height = 20; // Standard height
                        }
                    } else {
                        row.height = 20; // Standard height for non-content data
                    }
                    
                    row.eachCell((cell, colNumber) => {
                        if (colNumber > columns.length) return; // Prevent out of bounds access
                        
                        const val = cell.value;
                        const columnKey = columns[colNumber - 1]?.key;
                        
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
