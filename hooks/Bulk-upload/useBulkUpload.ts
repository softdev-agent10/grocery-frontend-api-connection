// hooks/useBulkUpload.ts
import { useState, useCallback, useEffect } from 'react';
import { useUploadDraft } from '../useUploadDraft';
// import { useNotification } from '../useNotification';
import {
    uploadBulkProducts,
    uploadBulkProductsAsync,
    pollJobUntilCompletion,
} from '@/app/services/bulkproducts/service.bulkproducts';
import Papa from 'papaparse';
import { useNotification } from '@/lib/context/NotificationContext';

interface FailedRowDetail {
    error_code: string;
    error_message: string;
    failed_fields: string[];
}

export function useBulkUpload(branchId: string) {
    const { savedDraft, isLoading: isDraftLoading, save: saveDraft, removeDraft } = useUploadDraft(branchId);
    const { showNotification } = useNotification();

    const [csvData, setCsvData] = useState<any[]>([]);
    const [originalCsvData, setOriginalCsvData] = useState<any[]>([]);
    const [failedRows, setFailedRows] = useState<Map<number, FailedRowDetail>>(new Map());
    const [uploadCompleted, setUploadCompleted] = useState(false);
    const [uploadSummary, setUploadSummary] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isPolling, setIsPolling] = useState(false);
    const [jobProgress, setJobProgress] = useState<any>(null);
    const isProcessing = isUploading || isPolling;

    // Auto‑restore draft from IndexedDB when it becomes available
    useEffect(() => {
        if (!isDraftLoading && savedDraft && csvData.length === 0) {
            setCsvData(savedDraft.csvData);
            setOriginalCsvData(savedDraft.originalCsvData);
            const failedRowsMap = new Map<number, FailedRowDetail>();
            Object.entries(savedDraft.failedRows).forEach(([key, value]) => {
                failedRowsMap.set(parseInt(key), value as FailedRowDetail);
            });
            setFailedRows(failedRowsMap);
            setUploadSummary(savedDraft.uploadSummary);
            setUploadCompleted(true); // Show retry buttons
        }
    }, [isDraftLoading, savedDraft]);

    const parseFile = useCallback((file: File): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => resolve(results.data as any[]),
                error: reject,
            });
        });
    }, []);

    const upload = useCallback(
        async (file: File, mode: 'insert' | 'skip' | 'update') => {
            setIsUploading(true);
            setFailedRows(new Map());
            setUploadCompleted(false);
            setJobProgress(null);
            setIsPolling(false);

            try {
                const csvRows = await parseFile(file);
                const uploadFn = csvRows.length > 2000 ? uploadBulkProductsAsync : uploadBulkProducts;
                const result = await uploadFn(file, { mode });

                // Debug
                // console.log('Upload result:', result);

                let responseData = result.data || result;
                if (result.status === 'accepted') {
                    setIsPolling(true);
                    const pollResult = await pollJobUntilCompletion({
                        jobId: responseData.job_id as string,
                        pollUrl: responseData.poll_url,
                        useDetailedStatus: true,
                        onProgress: setJobProgress,
                        maxAttempts: 120,
                        pollInterval: 10000,
                    });
                    responseData = pollResult.data || pollResult;
                    setIsPolling(false);
                }

                const resultData = responseData.result || responseData;
                const summary = resultData.summary || {};
                const { successful = 0, failed = 0, skipped = 0 } = summary;

                const failedMap = new Map<number, FailedRowDetail>();
                if (resultData.failed_rows) {
                    resultData.failed_rows.forEach((fr: any) => {
                        failedMap.set(fr.row_number - 1, {
                            error_code: fr.error_code,
                            error_message: fr.error_message?.split('\n')[0] || 'Unknown error',
                            failed_fields: fr.failed_fields || [],
                        });
                    });
                }

                const failedIndices = Array.from(failedMap.keys());
                const filteredData = csvRows.filter((_, idx) => failedIndices.includes(idx));
                const filteredFailedMap = new Map<number, FailedRowDetail>();
                failedIndices.forEach((orig, displayIdx) => {
                    filteredFailedMap.set(displayIdx, failedMap.get(orig)!);
                });

                setCsvData(filteredData);
                setOriginalCsvData(csvRows);
                setFailedRows(filteredFailedMap);
                setUploadSummary(resultData);
                setUploadCompleted(true);

                if (failed > 0) {
                    await saveDraft({
                        csvData: filteredData,
                        failedRows: Object.fromEntries(filteredFailedMap),
                        uploadSummary: resultData,
                        originalCsvData: csvRows,
                        uploadMode: mode,
                    });
                } else {
                    await removeDraft();
                }

                if (successful > 0 && failed === 0 && skipped === 0) {
                    showNotification(`All ${successful} products imported successfully!`, 'success');
                    setCsvData([]);
                    setFailedRows(new Map());
                    setUploadCompleted(false);
                } else if (successful > 0 && failed > 0) {
                    showNotification(`Partial success: ${successful} imported, ${failed} failed.`, 'warning');
                } else if (failed > 0) {
                    showNotification(`All ${failed} products failed. Check validation errors.`, 'error');
                }
            } catch (error: any) {
                showNotification(`Upload error: ${error.message}`, 'error');
            } finally {
                setIsUploading(false);
                setIsPolling(false);
                setJobProgress(null);
            }
        },
        [parseFile, saveDraft, removeDraft, showNotification]
    );

    const retryFailed = useCallback(
        async (mode: 'insert' | 'skip' | 'update') => {
            if (csvData.length === 0) return;
            const csvString = Papa.unparse(csvData);
            const blob = new Blob([csvString], { type: 'text/csv' });
            const file = new File([blob], `retry-${Date.now()}.csv`, { type: 'text/csv' });
            await upload(file, mode);
        },
        [csvData, upload]
    );

    const clearData = useCallback(async () => {
        setCsvData([]);
        setFailedRows(new Map());
        setUploadCompleted(false);
        setUploadSummary(null);
        await removeDraft();
    }, [removeDraft]);

    const clearSummary = useCallback(() => {
        setUploadSummary(null);
    }, []);

    return {
        csvData,
        setCsvData,
        originalCsvData,
        failedRows,
        setFailedRows,
        uploadCompleted,
        uploadSummary,
        isUploading,
        isPolling,
        isProcessing,
        jobProgress,
        upload,
        retryFailed,
        clearData,
        clearSummary,
        removeDraft,
        savedDraft,
    };
}