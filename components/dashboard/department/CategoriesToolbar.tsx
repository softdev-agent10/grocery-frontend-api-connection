import { Search } from 'lucide-react';
import { AddButton, DownloadButton, FilterButton, EditButton, DeleteButton, HistoryButton } from '@/components/toolbar-buttons';

interface CategoriesToolbarProps {
    onAdd: () => void;
    onDownload: () => void;
    onFilter: () => void;
    onEditView: () => void;
    onBulkDelete: () => void;
    onHistory: () => void;
    searchValue: string;
    onSearchChange: (value: string) => void;
    selectedCount: number;
}

export function CategoriesToolbar({
    onAdd,
    onDownload,
    onFilter,
    onEditView,
    onBulkDelete,
    onHistory,
    searchValue,
    onSearchChange,
    selectedCount,
}: CategoriesToolbarProps) {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-200 flex flex-row items-center gap-2">
            <AddButton onClick={onAdd} label="Add" />
            <DownloadButton onClick={onDownload} />
            <FilterButton onClick={onFilter} />
            <EditButton onClick={onEditView} variant="text" size="md" />
            <DeleteButton onClick={onBulkDelete} disabled={selectedCount === 0} count={selectedCount} />
            <div className="grow max-w-md ml-auto relative">
                <input
                    type="text"
                    placeholder="Search by name or description..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12 shadow-inner transition-all"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
                <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <HistoryButton onClick={onHistory} />
        </div>
    );
}