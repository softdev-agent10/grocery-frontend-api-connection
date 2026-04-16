'use client'
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Check } from 'lucide-react';
import { UploadDraft } from '@/hooks/useUploadDraft';

interface ResumeDraftPromptProps {
    draft: UploadDraft | null;
    isOpen: boolean;
    onResume: () => void;
    onDiscard: () => void;
    failedRowCount?: number;
}

export const ResumeDraftPrompt: React.FC<ResumeDraftPromptProps> = ({
    draft,
    isOpen,
    onResume,
    onDiscard,
    failedRowCount = 0,
}) => {
    if (!draft) return null;

    const timeSinceLastAttempt = Math.floor((Date.now() - draft.timestamp) / 1000);
    let timeDisplay = 'just now';

    if (timeSinceLastAttempt < 60) {
        timeDisplay = 'a few seconds ago';
    } else if (timeSinceLastAttempt < 3600) {
        const minutes = Math.floor(timeSinceLastAttempt / 60);
        timeDisplay = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (timeSinceLastAttempt < 86400) {
        const hours = Math.floor(timeSinceLastAttempt / 3600);
        timeDisplay = `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(timeSinceLastAttempt / 86400);
        timeDisplay = `${days} day${days > 1 ? 's' : ''} ago`;
    }

    const failedRows = failedRowCount || Object.keys(draft.failedRows).length;
    const successfulRows = (draft.uploadSummary?.summary?.successful || 0);
    const totalRows = draft.uploadSummary?.summary?.total_rows || 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-3">
                                <div className="bg-amber-100 p-2 rounded-lg mt-1">
                                    <AlertCircle size={20} className="text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">Resume Failed Upload?</h3>
                                    <p className="text-xs text-slate-500 mt-1">{timeDisplay}</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="bg-slate-50 rounded-lg p-4 mb-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600">Failed Rows</span>
                                    <span className="font-bold text-red-600">{failedRows}</span>
                                </div>
                                {successfulRows > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">Already Imported</span>
                                        <span className="font-bold text-green-600">{successfulRows}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600">Total Rows</span>
                                    <span className="font-bold text-slate-900">{totalRows}</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-slate-600 mb-6">
                            You have {failedRows} row{failedRows !== 1 ? 's' : ''} that need fixing. You can edit them and retry the upload, or discard this draft.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={onDiscard}
                                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                            >
                                <X size={18} />
                                Discard
                            </button>
                            <button
                                onClick={onResume}
                                className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                            >
                                <Check size={18} />
                                Resume
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ResumeDraftPrompt;
