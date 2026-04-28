// components/bulk-upload/SummaryModal.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function SummaryModal({ summary, failedRows, onClose }: any) {
    if (!summary) return null;
    const stats = summary.summary || {};
    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                    className="bg-white rounded-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto relative">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100">✕</button>
                    <h2 className="text-3xl font-bold mb-6">Upload Summary</h2>
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        <div className="bg-blue-50 p-4 rounded-lg"><div className="text-3xl font-bold text-blue-600">{stats.total_rows || 0}</div><div>Total Rows</div></div>
                        <div className="bg-green-50 p-4 rounded-lg"><div className="text-3xl font-bold text-green-600">{stats.successful || 0}</div><div>Successful</div></div>
                        <div className="bg-red-50 p-4 rounded-lg"><div className="text-3xl font-bold text-red-600">{stats.failed || 0}</div><div>Failed</div></div>
                        <div className="bg-yellow-50 p-4 rounded-lg"><div className="text-3xl font-bold text-yellow-600">{stats.skipped || 0}</div><div>Skipped</div></div>
                    </div>
                    {/* Show created products and failed details similarly to original */}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}