// components/dashboard/products/Pagination.tsx
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalProducts: number;
    paginatedCount: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (limit: number) => void;
}

export function Pagination({
    currentPage,
    totalPages,
    itemsPerPage,
    totalProducts,
    paginatedCount,
    onPageChange,
    onItemsPerPageChange,
}: PaginationProps) {
    const generatePages = () => {
        const pages: (number | string)[] = [];
        const maxPagesToShow = 5;
        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            if (start > 2) pages.push('...');
            for (let i = start; i <= end; i++) pages.push(i);
            if (end < totalPages - 1) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-lg">
            <div className="text-xl font-bold text-slate-500 uppercase tracking-widest">
                Showing <span className="text-blue-600">{paginatedCount}</span> of{' '}
                <span className="text-slate-800">{totalProducts}</span> products
            </div>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 mr-4">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Show</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {[5, 10, 20, 50].map((n) => (
                            <option key={n} value={n}>
                                {n}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-1">
                    <motion.button
                        whileHover={currentPage > 1 ? { scale: 1.1 } : {}}
                        whileTap={currentPage > 1 ? { scale: 0.9 } : {}}
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-xl border transition-all ${currentPage === 1
                            ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                            : 'border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'
                            }`}
                    >
                        <ChevronDown size={20} className="rotate-90" />
                    </motion.button>
                    <div className="flex items-center gap-1">
                        {generatePages().map((page, idx) =>
                            page === '...' ? (
                                <span key={`ellipsis-${idx}`} className="text-slate-400 px-1">
                                    ...
                                </span>
                            ) : (
                                <motion.button
                                    key={page}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => onPageChange(page as number)}
                                    className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${currentPage === page
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                                        : 'text-slate-500 hover:bg-slate-50'
                                        }`}
                                >
                                    {page}
                                </motion.button>
                            )
                        )}
                    </div>
                    <motion.button
                        whileHover={currentPage < totalPages ? { scale: 1.1 } : {}}
                        whileTap={currentPage < totalPages ? { scale: 0.9 } : {}}
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className={`p-2 rounded-xl border transition-all ${currentPage === totalPages || totalPages === 0
                            ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                            : 'border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'
                            }`}
                    >
                        <ChevronDown size={20} className="-rotate-90" />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}