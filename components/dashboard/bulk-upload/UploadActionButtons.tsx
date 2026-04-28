// components/bulk-upload/UploadActionButtons.tsx
import { Download, Upload, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { saveFailedRowsAsCSV } from '@/utils/csvExport';

interface UploadActionButtonsProps {
    isUploading: boolean;
    onRetry: () => void;
    onClear: () => void;
}

export function UploadActionButtons({ isUploading, onRetry, onClear }: UploadActionButtonsProps) {
    return (
        <div className="flex gap-3 mt-4 flex-wrap bg-white p-4 rounded-lg border border-slate-200 shadow-lg">
            <button onClick={() => saveFailedRowsAsCSV} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-slate-600 text-white">
                <Download size={18} /> Save as CSV
            </button>
            <button onClick={onRetry} disabled={isUploading}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50">
                {isUploading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Upload size={18} /></motion.div> : <Upload size={18} />}
                {isUploading ? 'Uploading...' : 'Retry Upload'}
            </button>
            <button onClick={onClear} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-red-600 text-white">
                <Trash2 size={18} /> Clear Data
            </button>
        </div>
    );
}