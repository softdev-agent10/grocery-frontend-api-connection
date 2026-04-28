// components/dashboard/customers/CustomerToolbar.tsx
import { Plus, Search } from "lucide-react";
import { DownloadButton, FilterButton, EditButton, DeleteButton } from "@/components/toolbar-buttons";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

interface CustomerToolbarProps {
    onDownload: () => void;
    onFilter: () => void;
    onEditView: () => void;
    onBulkDelete: () => void;
    setIsAddModalOpen: () => void;
    searchValue: string;          // external search query (from parent)
    onSearchChange: (value: string) => void;
    minLength?: number;           // optional, default 4
    debounceDelay?: number;       // optional, default 500ms

}

export function CustomerToolbar({
    onDownload,
    onFilter,
    onEditView,
    onBulkDelete,
    setIsAddModalOpen,
    searchValue: externalSearchValue,
    onSearchChange,
    minLength = 4,
    debounceDelay = 500,
}: CustomerToolbarProps) {
    const [localSearch, setLocalSearch] = useState(externalSearchValue);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Sync local state when external search changes (e.g., cleared by filter reset)
    useEffect(() => {
        setLocalSearch(externalSearchValue);
    }, [externalSearchValue]);

    const handleSearchChange = (value: string) => {
        setLocalSearch(value);

        // Clear previous timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // If empty, search immediately (clear filter)
        if (value.length === 0) {
            onSearchChange('');
            return;
        }

        // If below min length, do nothing (wait for more chars)
        if (value.length < minLength) {
            return;
        }

        // Debounce: wait for user to stop typing
        debounceTimer.current = setTimeout(() => {
            onSearchChange(value);
        }, debounceDelay);
    };


    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 items-center justify-between"
        >
            <div className="flex gap-3 w-full md:w-auto">
                {/* <DownloadButton onClick={onDownload} />
                <FilterButton onClick={onFilter} />
                <EditButton onClick={onEditView} />
                <DeleteButton onClick={onBulkDelete} /> */}
                <button
                    onClick={setIsAddModalOpen}
                    className="w-full md:w-auto flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-lg"
                >
                    <Plus size={20} /> Add Customer
                </button>
            </div>

            <div className="w-full md:flex-1 relative group md:flex md:justify-end">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-600 transition-colors z-10 pointer-events-none" size={18} />
                    <input
                        type="text"
                        placeholder={`Search customers... (min ${minLength} chars)`}
                        value={localSearch}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-300 group-hover:border-gray-300 text-sm md:text-base"
                    />
                    {localSearch && localSearch.length < minLength && localSearch.length > 0 && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-600 bg-white px-1 rounded pointer-events-none">
                            {minLength - localSearch.length} more...
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}