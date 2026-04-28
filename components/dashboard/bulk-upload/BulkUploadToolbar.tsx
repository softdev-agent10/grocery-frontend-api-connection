// components/bulk-upload/BulkUploadToolbar.tsx
import { downloadBulkProductTemplate } from '@/app/services/bulkproducts/service.bulkproducts';
import { AddButton, } from '@/components/toolbar-buttons';
import { DownloadTemplateButton } from '@/components/toolbar-buttons/DownloadTemplateButton';
import { Trash2 } from 'lucide-react';

interface BulkUploadToolbarProps {
    rowCount: number;
    onImportClick: () => void;
    onClearClick: () => void;
}

export function BulkUploadToolbar({ rowCount, onImportClick, onClearClick }: BulkUploadToolbarProps) {
    return (
        <div className="bg-white p-4 shadow-xl rounded-2xl mt-4 border border-slate-200 flex flex-row items-center gap-2">
            <AddButton onClick={onImportClick} label="Import" />
            <DownloadTemplateButton onClick={() => downloadBulkProductTemplate()} label="Export Template" />
            <div className="ml-auto flex items-center gap-3">
                <p className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-md font-medium">
                    {rowCount} rows loaded
                </p>
                {rowCount > 0 && (
                    <button onClick={onClearClick} className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-md font-medium hover:bg-red-200 transition-all flex items-center gap-2">
                        <Trash2 size={16} /> Clear
                    </button>
                )}
            </div>
        </div>
    );
}