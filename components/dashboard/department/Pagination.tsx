import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (limit: number) => void;
}

export function Pagination({
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    onPageChange,
    onItemsPerPageChange,
}: PaginationProps) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return (
        <div className="bg-slate-50 p-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-slate-500">Items per page:</span>
                <select
                    className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                >
                    {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="text-sm font-medium text-slate-400">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <button
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                        let pageNum = i + 1;
                        if (totalPages > 5 && currentPage > 3) {
                            pageNum = currentPage - 2 + i;
                            if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                        }
                        return (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${currentPage === pageNum
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                    : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
                                    }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                </div>
                <button
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}