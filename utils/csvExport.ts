// utils/csvExport.ts
import Papa from 'papaparse';

/**
 * Export an array of objects as a CSV file and trigger download.
 * @param data - Array of objects to export (each object's keys become CSV headers)
 * @param filename - Optional filename (default: 'failed-products-YYYY-MM-DD.csv')
 */
export function saveFailedRowsAsCSV(data: any[], filename?: string) {
    if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
    }

    // Convert array of objects to CSV string
    const csv = Papa.unparse(data);

    // Create a blob and trigger download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    // Set filename with current date if not provided
    const defaultFilename = `failed-products-${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename || defaultFilename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the object URL
    URL.revokeObjectURL(url);
}

/**
 * Export only the currently displayed failed rows (already filtered in state).
 * If you need to export the original unfiltered data, pass that instead.
 */
export function exportFailedRows(csvData: any[], failedRowsMap: Map<number, any>) {
    // csvData is already the filtered data (only rows that failed)
    // So we can directly export csvData
    if (csvData.length === 0) {
        console.warn('No failed rows to export');
        return;
    }
    saveFailedRowsAsCSV(csvData);
}