// components/bulk-upload/UploadProgressBar.tsx
import { motion } from 'framer-motion';

export function UploadProgressBar({ percent, processed, total, successful, failed }: any) {
    return (
        <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4">
            <motion.div
                className="bg-blue-600 h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.5 }}
            />
            <div className="text-xs text-slate-600 mt-2">
                Processed {processed} / {total} rows – ✅ {successful} success, ❌ {failed} failed
            </div>
        </div>
    );
}