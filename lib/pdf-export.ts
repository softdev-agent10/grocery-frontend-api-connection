/**
 * PDF Export Utility with Logo
 * Handles PDF generation with company logo for inventory exports
 * 
 * LOGO SOURCE:
 * Direct URL: https://i.postimg.cc/R0cFshz8/Onebalance-Logo-White-BG.png
 */

import { request } from 'http';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Logo from '../public/assets/desi-payment-dark.png'

// Direct image URL for logo
// Source: https://i.postimg.cc/R0cFshz8/Onebalance-Logo-White-BG.png
const COMPANY_LOGO_URL = 'https://i.postimg.cc/R0cFshz8/Onebalance-Logo-White-BG.png';

interface PDFExportOptions {
  title: string;
  columns: string[];
  rows: any[][];
  fileName: string;
  scope?: 'current' | 'all';
}

/**
 * Generate PDF with logo and table
 * Logo: 30x15mm positioned at top-left
 * Title below logo
 * Table starts below title with proper spacing
 */
export function generatePDFWithLogo(options: PDFExportOptions) {
  const { title, columns, rows, fileName, scope = 'all' } = options;
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  let currentY = 14;
  
  // Add logo at top-left (30x15mm size)
  try {
    doc.addImage(COMPANY_LOGO_URL, 'PNG', 14, currentY, 40, 10);
    currentY += 15; // Add spacing after logo
  } catch (error) {
    console.warn('Logo failed to load, continuing without it', error);
  }
  
  // Add title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, currentY);
  
  currentY += 8;
  
  // Add metadata
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, currentY);
  doc.text(`Records: ${rows.length}`, 14, currentY + 5);
  
  currentY += 15;
  
  // Add table
  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: currentY,
    theme: 'grid',
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 4,
    },
    bodyStyles: {
      textColor: [60, 60, 60],
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: currentY, left: 14, right: 14, bottom: 14 },
    didDrawPage: function (data) {
      // Add page number at bottom
      const pageCount = (doc as any).internal.pages.length - 1;
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.getHeight();
      const pageWidth = pageSize.getWidth();
      
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    },
  });
  
  doc.save(fileName);
}

/**
 * Export table data as CSV
 */
export function generateCSV(columns: string[], rows: any[][], fileName: string) {
  const headers = columns.join(',');
  const timestamp = new Date().toLocaleString();
  
  const csvContent = [

    `${Logo}`,
    `Generated: ${timestamp}`,
    `Records: ${rows.length}`,
    
    headers,
    ...rows.map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if contains comma
          const escapedCell = String(cell).replace(/"/g, '""');
          return `"${escapedCell}"`;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.click();
}
