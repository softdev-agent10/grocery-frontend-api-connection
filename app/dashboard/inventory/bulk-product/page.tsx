// app/bulk-products/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useApiContext } from '@/hooks/useApiContext';
import { useBulkUpload } from '@/hooks/Bulk-upload/useBulkUpload';
import { BulkUploadHeader } from '@/components/dashboard/bulk-upload/BulkUploadHeader';
import { BulkUploadToolbar } from '@/components/dashboard/bulk-upload/BulkUploadToolbar';
import { CSVDataTable } from '@/components/dashboard/bulk-upload/CSVDataTable';
import { UploadActionButtons } from '@/components/dashboard/bulk-upload/UploadActionButtons';
import { ImportModal } from '@/components/dashboard/bulk-upload/ImportModal';
import { SummaryModal } from '@/components/dashboard/bulk-upload/SummaryModal';
import { UploadProgressBar } from '@/components/dashboard/bulk-upload/UploadProgressBar';
import { Notification } from '@/components/Notification';
import { apiClient } from '@/lib/apiClient';
import { useNotification } from '@/lib/context/NotificationContext';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

export default function BulkProductsPage() {
    useApiContext();
    const { branchId } = apiClient.getContext();
    const {
        csvData,
        failedRows,
        uploadCompleted,
        uploadSummary,
        isUploading,
        isPolling,
        jobProgress,
        upload,
        retryFailed,
        clearData,
        clearSummary,
        setCsvData,
        isProcessing
    } = useBulkUpload(branchId);

    const { notification, hideNotification } = useNotification();
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const handleCellChange = (rowIdx: number, col: string, val: string) => {
        setCsvData(prev => {
            const updated = [...prev];
            if (updated[rowIdx]) {
                updated[rowIdx] = { ...updated[rowIdx], [col]: val };
            }
            return updated;
        });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={hideNotification}
                />
            )}
            {isProcessing && <LoadingOverlay />}

            <section className="rounded-2xl border-b border-slate-200 bg-white mt-0">
                <BulkUploadHeader />
                <BulkUploadToolbar
                    rowCount={csvData.length}
                    onImportClick={() => setIsImportModalOpen(true)}
                    onClearClick={clearData}
                />
                <div className="p-4">
                    {isPolling && jobProgress && <UploadProgressBar {...jobProgress} />}
                    {csvData.length > 0 && (
                        <>
                            <CSVDataTable
                                data={csvData}
                                failedRows={failedRows}
                                onCellChange={handleCellChange}
                            />
                            {uploadCompleted && (
                                <UploadActionButtons
                                    isUploading={isUploading}
                                    onRetry={() => retryFailed('insert')}
                                    onClear={clearData}
                                />
                            )}
                        </>
                    )}
                </div>
            </section>

            <ImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onUpload={upload}
                isUploading={isUploading}
            />

            <SummaryModal
                summary={uploadSummary}
                failedRows={failedRows}
                onClose={clearSummary}
            />
        </div>
    );
}