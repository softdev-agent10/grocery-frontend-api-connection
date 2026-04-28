// components/bulk-upload/CSVDataTable.tsx
import { useState, memo } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

const TableRow = memo(({ row, rowIndex, columns, isFailed, errorDetail, onCellChange }: any) => {
    const failedFieldsSet = new Set(errorDetail?.failed_fields || []);
    return (
        <tr className={isFailed ? 'hover:bg-red-50' : 'hover:bg-slate-50'}>
            <td className="p-2 border text-center text-sm group relative">
                {isFailed ? (
                    <div className="flex justify-between gap-2">
                        <span>{rowIndex + 1}</span>
                        <AlertCircle size={18} className="text-red-600" />
                        {/* Tooltip on status icon */}
                        {errorDetail && (
                            <div className="hidden group-hover:block absolute bottom-0 mb-2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 left-50 -translate-x-1/2">
                                <div className="font-semibold">[{errorDetail.error_code}]</div>
                                <div>{errorDetail.error_message}</div>
                            </div>
                        )}
                    </div>
                ) : (
                    <CheckCircle2 size={18} className="text-green-600 mx-auto" />
                )}
            </td>
            {columns.map((key: string) => {
                const isFieldFailed = failedFieldsSet.has(key);
                return (
                    <td
                        key={key}
                        className={`p-2 border relative group text-sm ${isFieldFailed ? 'bg-red-100' : ''}`}
                    >
                        <input
                            type="text"
                            value={row[key] || ''}
                            onChange={(e) => onCellChange(rowIndex, key, e.target.value)}
                            className="w-full bg-transparent outline-none text-xs"
                        />
                        {isFieldFailed && errorDetail && (
                            <>
                                <div className="absolute -top-1 -right-0">
                                    <AlertCircle size={16} className="text-red-600" />
                                </div>
                                {/* Tooltip that appears on hover over the whole cell */}
                                <div className="hidden group-hover:block absolute -bottom-5 z-10 left-40 -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                                    <div className="font-semibold">[{errorDetail.error_code}]</div>
                                    <div>{errorDetail.error_message}</div>
                                    <div className="text-yellow-300 text-[10px] mt-1">Field: {key}</div>
                                </div>
                            </>
                        )}
                    </td>
                );
            })}
        </tr>
    );
});

interface CSVDataTableProps {
    data: any[];
    failedRows: Map<number, any>;
    onCellChange: (rowIndex: number, column: string, value: string) => void;
    disabled?: boolean; // optional – to disable editing during upload
}

export function CSVDataTable({ data, failedRows, onCellChange, disabled = false }: CSVDataTableProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const rowsPerPage = 50;
    if (!data.length) return null;

    const columns = Object.keys(data[0]);
    const totalPages = Math.ceil(data.length / rowsPerPage);
    const start = currentPage * rowsPerPage;
    const pageData = data.slice(start, start + rowsPerPage);

    return (
        <div className="border rounded-xl bg-white flex flex-col h-[60vh]">
            <div className="overflow-auto h-[60vh] border rounded-xl bg-white">
                <table className="min-w-max text-md text-left">
                    <thead className="bg-slate-400 sticky top-0 z-10">
                        <tr>
                            <th className="p-2 border w-12 text-center text-sm font-semibold">Status</th>
                            {columns.map((col) => (
                                <th key={col} className="p-2 border whitespace-nowrap text-sm font-semibold">{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {pageData.map((row, idx) => {
                            const actualIndex = start + idx;
                            return (
                                <TableRow
                                    key={actualIndex}
                                    row={row}
                                    rowIndex={actualIndex}
                                    columns={columns}
                                    isFailed={failedRows.has(actualIndex)}
                                    errorDetail={failedRows.get(actualIndex)}
                                    onCellChange={onCellChange}
                                />
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {data.length > rowsPerPage && (
                <div className="flex items-center justify-between p-4 border-t bg-slate-50 shrink-0">
                    <div className="text-sm text-slate-600">
                        Showing {start + 1} - {Math.min(start + rowsPerPage, data.length)} of {data.length} rows
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setCurrentPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0}
                            className="p-2 rounded-lg border border-slate-300 disabled:opacity-50">
                            <ChevronLeft size={18} />
                        </button>
                        <div className="px-3 py-2 bg-white rounded-lg border">Page {currentPage + 1} of {totalPages}</div>
                        <button onClick={() => setCurrentPage((p) => p + 1)} disabled={start + rowsPerPage >= data.length}
                            className="p-2 rounded-lg border border-slate-300 disabled:opacity-50">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}