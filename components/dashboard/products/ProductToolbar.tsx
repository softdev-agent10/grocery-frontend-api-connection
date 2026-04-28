// components/dashboard/products/ProductToolbar.tsx
import { useState, useEffect, useRef } from 'react';
import { Search, X, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AddButton,
    EditButton,
    DeleteButton,
    DownloadButton,
    FilterButton,
    HistoryButton,
} from '@/components/toolbar-buttons';
import DownloadModal from '@/components/download-modal';

interface ProductToolbarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    filterStatus: string;
    onFilterChange: (status: string) => void;
    sortConfig: { key: string; direction: 'asc' | 'desc' };
    onSortChange: (key: string, direction: 'asc' | 'desc') => void;
    selectedCount: number;
    onAddClick: () => void;
    onEditViewClick: () => void;
    onBulkDelete: () => void;
    onHistoryClick: () => void;
    onDownload: (scope: 'current' | 'all', format: 'pdf' | 'csv') => void;
}

export function ProductToolbar({
    searchQuery: externalSearchQuery,
    onSearchChange,
    filterStatus,
    onFilterChange,
    sortConfig,
    onSortChange,
    selectedCount,
    onAddClick,
    onEditViewClick,
    onBulkDelete,
    onHistoryClick,
    onDownload,
}: ProductToolbarProps) {
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [localSearch, setLocalSearch] = useState(externalSearchQuery);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const MIN_SEARCH_LENGTH = 5;

    // Sync external search query changes (e.g., reset from filters) with local input
    useEffect(() => {
        setLocalSearch(externalSearchQuery);
    }, [externalSearchQuery]);

    const handleSearchChange = (value: string) => {
        setLocalSearch(value);

        // Clear previous timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // If value is empty, search immediately (clear filter)
        if (value.length === 0) {
            onSearchChange('');
            return;
        }

        // If value length < MIN_SEARCH_LENGTH, do not search yet
        if (value.length < MIN_SEARCH_LENGTH) {
            return;
        }

        // Debounce: wait 500ms after user stops typing
        debounceTimer.current = setTimeout(() => {
            onSearchChange(value);
        }, 500);
    };

    return (
        <div className="bg-white p-4 shadow-xl rounded-2xl mt-4 border border-slate-200 flex flex-row items-center gap-2">
            <AddButton onClick={onAddClick} label="Add" />

            <div className="relative">
                <DownloadButton onClick={() => setIsDownloadModalOpen(true)} />
                <DownloadModal
                    isOpen={isDownloadModalOpen}
                    onClose={() => setIsDownloadModalOpen(false)}
                    onDownload={onDownload}
                    title="Export Products"
                    subtitle="Choose your preferred format"
                />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
                <FilterButton onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} />
                <AnimatePresence>
                    {isFilterMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsFilterMenuOpen(false)} />
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 z-20 overflow-hidden"
                            >
                                <div className="p-3 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b">Status</div>
                                {['All', 'In Stock', 'Out of Stock'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => {
                                            onFilterChange(status);
                                            setIsFilterMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xl font-semibold transition-colors ${filterStatus === status ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                                            }`}
                                    >
                                        {status} {filterStatus === status && <Check size={16} />}
                                    </button>
                                ))}
                                <div className="p-3 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-t">Sort By</div>
                                {[
                                    { label: 'Name (A-Z)', key: 'name', dir: 'asc' },
                                    { label: 'Name (Z-A)', key: 'name', dir: 'desc' },
                                    { label: 'Price (Low to High)', key: 'price', dir: 'asc' },
                                    { label: 'Price (High to Low)', key: 'price', dir: 'desc' },
                                    { label: 'Quantity (Low to High)', key: 'qty', dir: 'asc' },
                                    { label: 'Quantity (High to Low)', key: 'qty', dir: 'desc' },
                                    { label: 'UPC (Ascending)', key: 'upc', dir: 'asc' },
                                    { label: 'UPC (Descending)', key: 'upc', dir: 'desc' },
                                ].map((sort) => (
                                    <button
                                        key={sort.label}
                                        onClick={() => {
                                            onSortChange(sort.key, sort.dir as any);
                                            setIsFilterMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xl font-semibold transition-colors ${sortConfig.key === sort.key && sortConfig.direction === sort.dir
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-slate-700 hover:bg-slate-50'
                                            }`}
                                    >
                                        {sort.label}{' '}
                                        {sortConfig.key === sort.key && sortConfig.direction === sort.dir && <Check size={16} />}
                                    </button>
                                ))}
                                <button
                                    onClick={() => {
                                        onFilterChange('All');
                                        onSortChange('none', 'asc');
                                        onSearchChange('');
                                        setIsFilterMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors border-t"
                                >
                                    <X size={16} /> Reset Filters
                                </button>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>

            <EditButton onClick={onEditViewClick} variant="text" size="md" />
            <DeleteButton onClick={onBulkDelete} disabled={selectedCount === 0} count={selectedCount} />

            {/* Debounced Search Input */}
            <div className="flex-grow max-w-md ml-auto flex relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search size={20} />
                </div>
                <input
                    type="text"
                    placeholder={`Search by name, UPC, brand... (min ${MIN_SEARCH_LENGTH} characters)`}
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={localSearch}
                    onChange={(e) => handleSearchChange(e.target.value)}
                />
                {localSearch && localSearch.length < MIN_SEARCH_LENGTH && localSearch.length > 0 && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-amber-600">
                        {MIN_SEARCH_LENGTH - localSearch.length} more char...
                    </div>
                )}
            </div>

            <HistoryButton onClick={onHistoryClick} />
        </div>
    );
}