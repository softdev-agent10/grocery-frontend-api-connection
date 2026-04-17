'use client'
import React, { useRef, useState, useEffect, useMemo, useCallback, memo } from 'react'
import { motion, AnimatePresence } from "framer-motion";
import { Download, Package, Upload, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { AddButton } from '@/components/toolbar-buttons/AddButton';
import DownloadModal from '@/components/download-modal';
import { DownloadTemplateButton } from '@/components/toolbar-buttons/DownloadTemplateButton';
import {
    downloadBulkProductTemplate,
    uploadBulkProducts,
    uploadBulkProductsAsync,
    pollJobUntilCompletion
} from '@/app/services/bulkproducts/service.bulkproducts';
import { toast, Bounce } from "react-toastify/unstyled";
import Papa from "papaparse";
import { useAuth } from '@/hooks/useAuth';
import { useUploadDraft } from '@/hooks/useUploadDraft';
import { ResumeDraftPrompt } from '@/components/ResumeDraftPrompt';

// Memoized Row Component for Virtual Scrolling
const TableRow = memo(({
    rowIndex,
    row,
    isRowFailed,
    errorDetail,
    failedFieldsSet,
    columns,
    uploadCompleted,
    onCellChange
}: any) => {
    return (
        <tr className={isRowFailed ? 'hover:bg-red-50' : 'hover:bg-slate-50'}>
            <td className="p-2 border text-center text-sm">
                {uploadCompleted ? (
                    isRowFailed ? (
                        <div className="flex justify-between group relative gap-2">
                            <p>{rowIndex + 1}</p>
                            <AlertCircle size={18} className="text-red-600" />
                            {errorDetail && (
                                <div className="hidden group-hover:block absolute bottom-full mb-2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 shadow-lg">
                                    <div className="font-semibold">[{errorDetail.error_code}]</div>
                                    <div>{errorDetail.error_message}</div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <CheckCircle2 size={18} className="text-green-600" />
                        </div>
                    )
                ) : (
                    <div className="flex justify-center">
                        <div className="w-4 h-4 rounded-full bg-slate-300"></div>
                    </div>
                )}
            </td>
            {columns.map((key: string) => {
                const isFailedField = failedFieldsSet.has(key);
                return (
                    <td
                        key={key}
                        className={`p-2 border relative group text-sm ${isFailedField ? 'bg-red-100' : ''}`}
                    >
                        <input
                            type="text"
                            value={row[key] || ''}
                            onChange={(e) => onCellChange(rowIndex, key, e.target.value)}
                            className={`w-full bg-transparent outline-none text-xs ${isFailedField ? 'text-red-900 font-semibold' : ''}`}
                        />
                        {isFailedField && errorDetail && (
                            <div className="absolute -top-1 -right-1 flex items-center">
                                <AlertCircle size={16} className="text-red-600" />
                            </div>
                        )}
                        {isFailedField && errorDetail && (
                            <div className={`hidden group-hover:block absolute ${rowIndex > 4 ? "bottom-full" : "top-full"} left-0 mb-2 bg-gray-800 text-white text-xs rounded px-2 py-1 z-10 shadow-lg max-w-xs wrap-break-word`}>
                                <div className="font-semibold mb-1">[{errorDetail.error_code}]</div>
                                <div>{errorDetail.error_message}</div>
                            </div>
                        )}
                    </td>
                );
            })}
        </tr>
    );
});

TableRow.displayName = 'TableRow';

function Page() {
    const { user, token, isAuthenticated } = useAuth();
    const branchId = '1234567890'; // TODO: Get from actual user context

    // Draft management
    const { savedDraft, isLoading: isDraftLoading, save: saveDraft, remove: removeDraft } = useUploadDraft(branchId);
    const [showResumeDraftPrompt, setShowResumeDraftPrompt] = useState(false);

    const [isDownloadModalOpen, setIsDownloadModalOpen] = React.useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [isUploading, setIsUploading] = React.useState(false);
    const [uploadMode, setUploadMode] = React.useState<"insert" | "skip" | "update">("insert");
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [csvData, setCsvData] = useState<any[]>([]);
    const [failedRows, setFailedRows] = useState<Map<number, { error_code: string; error_message: string; failed_fields: string[] }>>(new Map());
    const [uploadCompleted, setUploadCompleted] = useState(false);
    const [uploadSummary, setUploadSummary] = useState<any>(null);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [originalCsvData, setOriginalCsvData] = useState<any[]>([]);

    // Async job tracking
    const [jobProgress, setJobProgress] = useState<{
        totalRows: number;
        processedRows: number;
        successful: number;
        failed: number;
        skipped: number;
        percentComplete: number;
    } | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [isParsingCsv, setIsParsingCsv] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const ROWS_PER_PAGE = 50;

    // Auto-resume draft if there's a saved draft
    useEffect(() => {
        if (isDraftLoading) {
            // Show skeleton while loading from IndexedDB
            setIsParsingCsv(true);
        } else if (savedDraft && !isDraftLoading) {
            // Draft is loaded, resume it and hide skeleton
            handleResumeDraft();
            setIsParsingCsv(false);
        } else {
            // No draft to load, hide skeleton
            setIsParsingCsv(false);
        }
    }, [isDraftLoading, savedDraft]);

    function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>): void {
        const file = event.target.files?.[0];

        if (file && validateFile(file)) {
            setSelectedFile(file);
            setFailedRows(new Map());
            setUploadCompleted(false);
            setShowSummaryModal(false);
            setUploadSummary(null);
            setIsParsingCsv(true);

            Papa.parse(file, {
                header: true, // converts to objects using headers
                skipEmptyLines: true,
                complete: (results) => {
                    const data = results.data as any[];
                    setCsvData(data);
                    setOriginalCsvData(JSON.parse(JSON.stringify(data)));
                    setIsParsingCsv(false);
                },
            });
        }
    }

    function handleOpenModal(): void {
        setIsImportModalOpen(true);
    }

    function validateFile(file: File): boolean {
        if (!file.name.endsWith('.csv')) {
            toast.error("Please select a CSV file", {
                autoClose: 3000,
                transition: Bounce,
            });
            return false;
        }

        if (file.size > 100 * 1024 * 1024) { // 100MB limit
            toast.error("File size must be less than 100MB", {
                autoClose: 3000,
                transition: Bounce,
            });
            return false;
        }

        return true;
    }

    // Handler to resume a saved draft
    async function handleResumeDraft(): Promise<void> {
        if (!savedDraft) return;

        try {
            setCsvData(savedDraft.csvData);
            setFailedRows(new Map(Object.entries(savedDraft.failedRows).map(([k, v]) => [parseInt(k), v])));
            setOriginalCsvData(savedDraft.originalCsvData);
            // setUploadSummary(null);
            setUploadCompleted(true);
            setShowResumeDraftPrompt(false);
            setIsImportModalOpen(false);

            // toast.info("✓ Draft resumed! Review and retry the failed rows.", {
            //     autoClose: 3000,
            //     transition: Bounce,
            // });
        } catch (error) {
            console.error('Error resuming draft:', error);
            toast.error("Failed to resume draft", {
                autoClose: 3000,
                transition: Bounce,
            });
        }
    }

    // Handler to discard a saved draft
    async function handleDiscardDraft(): Promise<void> {
        try {
            await removeDraft();
            setShowResumeDraftPrompt(false);
            setCsvData([]);
            setFailedRows(new Map());
            setUploadCompleted(false);
            // setUploadSummary(null);

            toast.info("Draft discarded", {
                autoClose: 2000,
                transition: Bounce,
            });
        } catch (error) {
            console.error('Error discarding draft:', error);
            toast.error("Failed to discard draft", {
                autoClose: 3000,
                transition: Bounce,
            });
        }
    }

    function handleDragOver(event: React.DragEvent<HTMLDivElement>): void {
        event.preventDefault();
        event.stopPropagation();
        setIsDragOver(true);
    }

    function handleDragLeave(event: React.DragEvent<HTMLDivElement>): void {
        event.preventDefault();
        event.stopPropagation();
        setIsDragOver(false);
    }

    function handleDrop(event: React.DragEvent<HTMLDivElement>): void {
        event.preventDefault();
        event.stopPropagation();
        setIsDragOver(false);

        const file = event.dataTransfer.files?.[0];
        if (file && validateFile(file)) {
            setSelectedFile(file);
            setFailedRows(new Map());
            setUploadCompleted(false);
            setShowSummaryModal(false);
            setUploadSummary(null);
            setIsParsingCsv(true);

            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const data = results.data as any[];
                    setCsvData(data);
                    setOriginalCsvData(JSON.parse(JSON.stringify(data)));
                    setIsParsingCsv(false);
                },
            });
        }
    }

    async function handleUploadFile(): Promise<void> {
        if (!selectedFile) {
            // toast.error("Please select a file first", {
            //     autoClose: 3000,
            //     transition: Bounce,
            // });
            return;
        }

        setIsUploading(true);
        setFailedRows(new Map());
        setUploadCompleted(false);
        setJobProgress(null);
        setIsPolling(false);

        try {
            // Use async endpoint for large files (> 2000 rows)
            const uploadFunction = csvData.length > 2000 ? uploadBulkProductsAsync : uploadBulkProducts;

            const result = await uploadFunction({
                file: selectedFile,
                branchId: '1234567890',
                token: "your_token_here",
                mode: uploadMode,
            });

            // Check if this is an async response
            let responseData = result.data || result;
            const initialStatus = result.status || responseData.status;

            // If async job is accepted, poll until completion
            if (initialStatus === "accepted") {
                const jobId = responseData.job_id;
                const pollUrl = responseData.poll_url;
                console.log(`Job accepted. Job ID: ${jobId}. Polling at: ${pollUrl}`);

                setIsPolling(true);

                try {
                    const pollResult = await pollJobUntilCompletion({
                        jobId,
                        pollUrl,
                        branchId: '1234567890',
                        token: "your_token_here",
                        onProgress: (progress) => {
                            setJobProgress(progress);
                            console.log("Job progress:", progress);
                        },
                        maxAttempts: 120,
                        pollInterval: 5000,
                    });

                    setIsPolling(false);
                    responseData = pollResult.data || pollResult;
                } catch (pollError) {
                    setIsPolling(false);
                    throw new Error(
                        `Polling failed: ${pollError instanceof Error ? pollError.message : "Unknown error"}`
                    );
                }
            }

            // Extract result data - handle both sync and async final responses
            const result_data = responseData.result || responseData;
            const summary = result_data.summary || {};
            const { successful = 0, failed = 0, skipped = 0, total_rows = 0 } = summary;

            // Extract failed rows from response
            const failedRowsMap = new Map<number, { error_code: string; error_message: string; failed_fields: string[] }>();
            if (result_data.failed_rows && Array.isArray(result_data.failed_rows)) {
                result_data.failed_rows.forEach((failedRow: any) => {
                    // row_number is 1-based, convert to 0-based index
                    const rowIndex = failedRow.row_number - 1;
                    const errorMessage = failedRow.error_message?.split('\n')[0] || "Unknown error";
                    const error_code = failedRow.error_code || "ERROR";
                    const failed_fields = failedRow.failed_fields || [];
                    failedRowsMap.set(rowIndex, {
                        error_code,
                        error_message: errorMessage,
                        failed_fields
                    });
                });
            }

            // Filter to show only failed rows in the table
            const failedRowIndices = Array.from(failedRowsMap.keys());
            const filteredCsvData = originalCsvData.filter((_, index) => failedRowIndices.includes(index));

            // Create a new map with sequential indices for the filtered data
            const filteredFailedRowsMap = new Map<number, { error_code: string; error_message: string; failed_fields: string[] }>();
            failedRowIndices.forEach((origIndex, displayIndex) => {
                const failedRowDetail = failedRowsMap.get(origIndex);
                if (failedRowDetail) {
                    filteredFailedRowsMap.set(displayIndex, failedRowDetail);
                }
            });

            setCsvData(filteredCsvData);
            setFailedRows(filteredFailedRowsMap);
            setUploadSummary(result_data);
            setUploadCompleted(true);
            setIsImportModalOpen(false);
            setJobProgress(null);

            // Save draft to IndexedDB if there are failed rows
            if (failed > 0) {
                try {
                    await saveDraft({
                        csvData: filteredCsvData,
                        failedRows: Object.fromEntries(filteredFailedRowsMap),
                        uploadSummary: result_data,
                        originalCsvData: originalCsvData,
                        uploadMode: uploadMode,
                        branchId: branchId,
                    });
                } catch (error) {
                    console.error('Error saving draft:', error);
                }
            }

            if (successful > 0) {
                // Partial or full success
                if (failed === 0 && skipped === 0) {
                    // All products imported successfully
                    toast.success(`All ${successful} products imported successfully!`, {
                        autoClose: 5000,
                        transition: Bounce,
                    });
                    // Clear the draft from IndexedDB
                    try {
                        await removeDraft();
                    } catch (error) {
                        console.error('Error removing draft:', error);
                    }
                    setSelectedFile(null);
                    setCsvData([]);
                    setFailedRows(new Map());
                    setUploadCompleted(false);
                } else {
                    // Partial success
                    toast.warning(`Partial success: ${successful} imported, ${failed} failed!`, {
                        autoClose: 5000,
                        transition: Bounce,
                    });
                }
            } else if (failed > 0) {
                // All failed
                toast.error(`All ${failed} products failed to import. Check validation errors.`, {
                    autoClose: 5000,
                    transition: Bounce,
                });
                setSelectedFile(null);
                setCsvData([]);
                setFailedRows(new Map());
                setUploadCompleted(false);
            }
            console.log("Upload result:", result);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to upload bulk products";
            toast.error(`Upload error: ${errorMessage}`, {
                autoClose: 5000,
                transition: Bounce,
            });
            console.error("Upload error:", error);
        } finally {
            setIsUploading(false);
            setIsPolling(false);
            setJobProgress(null);
        }
    }

    function downloadPDF(scope: string) {
        // TODO: Implement PDF export
        toast.info("PDF export coming soon", {
            autoClose: 3000,
            transition: Bounce,
        });
    }

    function downloadCSV(scope: string) {
        // TODO: Implement CSV export
        toast.info("CSV export coming soon", {
            autoClose: 3000,
            transition: Bounce,
        });
    }

    function saveFailedRowsAsCSV() {
        if (csvData.length === 0) {
            return;
        }

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `failed-products-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Optimized cell change handler using useCallback
    const handleCellChange = useCallback((rowIndex: number, columnKey: string, value: string) => {
        setCsvData((prevData) => {
            const updated = [...prevData];
            updated[rowIndex] = { ...updated[rowIndex], [columnKey]: value };
            return updated;
        });
    }, []);

    function handleRetryUpload() {
        setUploadCompleted(false);
        setFailedRows(new Map());
    }

    // Clear all data handler
    function handleClearData() {
        setCsvData([]);
        setFailedRows(new Map());
        setUploadCompleted(false);
        setUploadSummary(null);
        setSelectedFile(null);
        setCurrentPage(0);
        setIsParsingCsv(false);
        removeDraft().catch((error) => console.error('Error removing draft:', error));
        toast.info("Data cleared", {
            autoClose: 2000,
            transition: Bounce,
        });
    }

    async function handleRetryUploadFromTable(): Promise<void> {
        if (csvData.length === 0) {
            // toast.error("No data to upload", {
            //     autoClose: 3000,
            //     transition: Bounce,
            // });
            return;
        }

        setIsUploading(true);
        setJobProgress(null);
        setIsPolling(false);

        try {
            // Convert current csvData to CSV format and create a blob
            const csv = Papa.unparse(csvData);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const file = new File([blob], `retry-products-${new Date().toISOString().split('T')[0]}.csv`, { type: 'text/csv' });

            // Use async endpoint for large files (> 2000 rows)
            const uploadFunction = csvData.length > 2000 ? uploadBulkProductsAsync : uploadBulkProducts;

            const result = await uploadFunction({
                file: file,
                branchId: '1234567890',
                token: "your_token_here",
                mode: uploadMode,
            });

            // Check if this is an async response
            let responseData = result.data || result;
            const initialStatus = result.status || responseData.status;

            // If async job is accepted, poll until completion
            if (initialStatus === "accepted") {
                const jobId = responseData.job_id;
                const pollUrl = responseData.poll_url;

                setIsPolling(true);

                try {
                    const pollResult = await pollJobUntilCompletion({
                        jobId,
                        pollUrl,
                        branchId: '1234567890',
                        token: "your_token_here",
                        onProgress: (progress) => {
                            setJobProgress(progress);
                            console.log("Job progress:", progress);
                        },
                        maxAttempts: 120,
                        pollInterval: 5000,
                    });

                    setIsPolling(false);
                    responseData = pollResult.data || pollResult;
                } catch (pollError) {
                    setIsPolling(false);
                    throw new Error(
                        `Polling failed: ${pollError instanceof Error ? pollError.message : "Unknown error"}`
                    );
                }
            }

            // Extract result data - handle both sync and async final responses
            const result_data = responseData.result || responseData;
            const summary = result_data.summary || {};
            const { successful = 0, failed = 0 } = summary;

            // Extract failed rows from response
            const failedRowsMap = new Map<number, { error_code: string; error_message: string; failed_fields: string[] }>();
            if (result_data.failed_rows && Array.isArray(result_data.failed_rows)) {
                result_data.failed_rows.forEach((failedRow: any) => {
                    // row_number is 1-based, convert to 0-based index
                    const rowIndex = failedRow.row_number - 1;
                    const errorMessage = failedRow.error_message?.split('\n')[0] || "Unknown error";
                    const error_code = failedRow.error_code || "ERROR";
                    const failed_fields = failedRow.failed_fields || [];
                    failedRowsMap.set(rowIndex, {
                        error_code,
                        error_message: errorMessage,
                        failed_fields
                    });
                });
            }

            // Filter to show only failed rows in the table
            const failedRowIndices = Array.from(failedRowsMap.keys());
            const filteredCsvData = csvData.filter((_, index) => failedRowIndices.includes(index));

            // Create a new map with sequential indices for the filtered data
            const filteredFailedRowsMap = new Map<number, { error_code: string; error_message: string; failed_fields: string[] }>();
            failedRowIndices.forEach((origIndex, displayIndex) => {
                const failedRowDetail = failedRowsMap.get(origIndex);
                if (failedRowDetail) {
                    filteredFailedRowsMap.set(displayIndex, failedRowDetail);
                }
            });

            setUploadSummary(result_data);

            setCsvData(filteredCsvData);
            setFailedRows(filteredFailedRowsMap);
            setJobProgress(null);


            // Save or update draft based on failed rows
            if (failed > 0) {
                try {
                    await saveDraft({
                        csvData: filteredCsvData,
                        failedRows: Object.fromEntries(filteredFailedRowsMap),
                        uploadSummary: result_data,
                        originalCsvData: originalCsvData,
                        uploadMode: uploadMode,
                        branchId: branchId,
                    });
                } catch (error) {
                    console.error('Error saving draft:', error);
                }
            } else {
                // Clear draft if no failed rows
                try {
                    await removeDraft();
                } catch (error) {
                    console.error('Error removing draft:', error);
                }
            }

            if (successful > 0) {
                // Partial or full success
                if (failed === 0) {
                    // All products imported successfully
                    // toast.success(`All ${successful} products imported successfully!`, {
                    //     autoClose: 3000,
                    //     transition: Bounce,
                    // });
                    setCsvData([]);
                    setFailedRows(new Map());

                    // Clear draft on complete success
                    try {
                        await removeDraft();
                    } catch (error) {
                        console.error('Error removing draft:', error);
                    }
                    toast.success(`All ${successful} products imported successfully!`, {
                        autoClose: 5000,
                        transition: Bounce,
                    });
                } else {
                    // Partial success - keep showing table for remaining failed rows
                    toast.warning(`Partial success: ${successful} imported, ${failed} still failed!`, {
                        autoClose: 5000,
                        transition: Bounce,
                    });
                }
            } else if (failed > 0) {
                // All failed
                toast.error(` All ${failed} products failed. Check the errors below.`, {
                    autoClose: 5000,
                    transition: Bounce,
                });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to upload bulk products";
            toast.error(`Retry error: ${errorMessage}`, {
                autoClose: 5000,
                transition: Bounce,
            });
            console.error("Upload error:", error);
        } finally {
            setIsUploading(false);
            setIsPolling(false);
            setJobProgress(null);
        }
    }


    return (
        <div className=" bg-[#F8FAFC] font-sans text-slate-900">
            <section className=" rounded-2xl border-b border-slate-200 overflow-hidden bg-white  mt-0">
                <header className="bg-blue-600 rounded-2xl px-6 py-8 flex justify-between items-center shadow-lg relative overflow-hidden ">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[120%] bg-white rotate-12 blur-3xl rounded-full" />
                    </div>

                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="relative z-10"
                    >
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
                            Bulk products
                        </h1>

                    </motion.div>

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-white relative z-10"
                    >
                        <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md border  border-white/30 shadow-xl">
                            <Package size={40} strokeWidth={2} />
                        </div>
                    </motion.div>
                </header>
                <div className='bg-white p-4 shadow-xl overflow-hidden  rounded-2xl mt-4 border border-slate-200 flex flex-row items-center gap-2' >
                    <AddButton onClick={() => handleOpenModal()} label="Import" />


                    {/* <div className="relative">
                        <DownloadTemplateButton
                            onClick={() => setIsDownloadModalOpen(true)}
                            label="Export"
                            icon={<Download size={20} />}
                        />

                        <DownloadModal
                            isOpen={isDownloadModalOpen}
                            onClose={() => setIsDownloadModalOpen(false)}
                            onDownload={(scope, format) => {
                                if (format === 'pdf') downloadPDF(scope);
                                else downloadCSV(scope);
                            }}
                            title="Export Products"
                            subtitle="Choose your preferred format"
                        />
                    </div> */}
                    <div className="relative">
                        <DownloadTemplateButton
                            onClick={() => downloadBulkProductTemplate({ branchId: '1234567890', token: "your_token_here" })}
                            label="Export Template"
                            icon={<Download size={20} />}
                        />
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        <p className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-md font-medium">
                            {csvData.length} rows loaded
                        </p>
                        {csvData.length > 0 && (
                            <button
                                onClick={handleClearData}
                                className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-md font-medium hover:bg-red-200 transition-all flex items-center gap-2"
                            >
                                <Trash2 size={16} />
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                <div>
                    {/* Load CSV Section */}
                    <section className="p-4">
                        {/* Skeleton Loader */}
                        {isParsingCsv && (
                            <div className="border rounded-xl overflow-auto h-[60vh] bg-slate-50">
                                <table className="min-w-full text-sm text-left overflow-x-auto shrink-0">
                                    <thead className="bg-slate-400 sticky top-0 z-50">
                                        <tr>
                                            <th className="p-2 border w-12 text-center">Status</th>
                                            {[...Array(21)].map((_, i) => (
                                                <th key={i} className="p-2 border">
                                                    <div className="h-4 bg-slate-300 rounded animate-pulse"></div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...Array(21)].map((_, rowIndex) => (
                                            <tr key={rowIndex} className="border-b hover:bg-slate-100">
                                                <td className="p-2 border text-center">
                                                    <div className="flex justify-center">
                                                        <div className="w-4 h-10 rounded-full bg-slate-300 animate-pulse"></div>
                                                    </div>
                                                </td>
                                                {[...Array(21)].map((_, colIndex) => (
                                                    <td key={colIndex} className="p-2 border">
                                                        <div className="h-4 bg-slate-300 rounded animate-pulse"></div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Actual CSV Data Table with Pagination */}
                        {!isParsingCsv && csvData.length > 0 && (
                            <div className="border rounded-xl bg-white flex flex-col h-[60vh]">
                                {/* Table Header - Sticky Top */}
                                <div className="">
                                    <table className="min-w-full text-md text-left">
                                        <thead className="bg-slate-400 sticky top-0 z-50">
                                            <tr>
                                                <th className="p-2 border w-12 text-center text-sm font-semibold">Index</th>
                                                {Object.keys(csvData[0]).map((header) => (
                                                    <th key={header} className="p-2 border min-w-max whitespace-nowrap text-sm font-semibold">
                                                        {header}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                    </table>
                                </div>

                                {/* Table Body - Scrollable */}
                                <div className="overflow-x-auto flex-1 overflow-y-auto">
                                    <table className="min-w-full text-md text-left">
                                        <tbody>
                                            {csvData.slice(currentPage * ROWS_PER_PAGE, (currentPage + 1) * ROWS_PER_PAGE).map((row, displayIndex) => {
                                                const actualIndex = currentPage * ROWS_PER_PAGE + displayIndex;
                                                const isRowFailed = failedRows.has(actualIndex);
                                                const errorDetail = failedRows.get(actualIndex);
                                                const failedFieldsSet = new Set(errorDetail?.failed_fields || []);
                                                const columns = Object.keys(csvData[0]);

                                                return (
                                                    <TableRow
                                                        key={actualIndex}
                                                        rowIndex={actualIndex}
                                                        row={row}
                                                        isRowFailed={isRowFailed}
                                                        errorDetail={errorDetail}
                                                        failedFieldsSet={failedFieldsSet}
                                                        columns={columns}
                                                        uploadCompleted={uploadCompleted}
                                                        onCellChange={handleCellChange}
                                                    />
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Controls - Sticky Bottom */}
                                {csvData.length > ROWS_PER_PAGE && (
                                    <div className="flex items-center justify-between p-4 border-t bg-slate-50  shrink-0">
                                        <div className="text-sm text-slate-600">
                                            Showing {currentPage * ROWS_PER_PAGE + 1} - {Math.min((currentPage + 1) * ROWS_PER_PAGE, csvData.length)} of {csvData.length} rows
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                                disabled={currentPage === 0}
                                                className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeft size={18} />
                                            </button>
                                            <div className="flex items-center px-3 py-2 bg-white rounded-lg border border-slate-300">
                                                <span className="text-sm font-medium text-slate-700">
                                                    Page {currentPage + 1} of {Math.ceil(csvData.length / ROWS_PER_PAGE)}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => setCurrentPage(p => p + 1)}
                                                disabled={(currentPage + 1) * ROWS_PER_PAGE >= csvData.length}
                                                className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Buttons for CSV Data - Outside Table Container */}
                        {!isParsingCsv && uploadCompleted && csvData.length > 0 && (
                            <div className="flex gap-3 mt-4 flex-wrap bg-white p-4 rounded-lg border border-slate-200 shadow-lg">
                                <button
                                    onClick={() => {
                                        saveFailedRowsAsCSV();
                                    }}
                                    className="flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-slate-600 text-white font-medium hover:bg-slate-700 transition-all"
                                >
                                    <Download size={18} />
                                    Save as CSV
                                </button>
                                <button
                                    onClick={() => {
                                        handleRetryUploadFromTable();
                                    }}
                                    disabled={isUploading}
                                    className="flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUploading ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity }}
                                            >
                                                <Upload size={18} />
                                            </motion.div>
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={18} />
                                            Retry Upload
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleClearData}
                                    className="flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-all"
                                >
                                    <Trash2 size={18} />
                                    Clear Data
                                </button>
                            </div>
                        )}

                    </section>
                </div>

                {/* Import Modal */}
                <AnimatePresence>
                    {isImportModalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                            onClick={() => !isUploading && setIsImportModalOpen(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <Upload size={24} className="text-blue-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">Import Products</h2>
                                </div>

                                <p className="text-slate-600 mb-6">
                                    Upload a CSV file to import multiple products at once. Download the template for the correct format.
                                </p>

                                {/* File Input Section */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-6 ${isDragOver
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'
                                        }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        disabled={isUploading}
                                    />
                                    <div className="flex flex-col items-center gap-2">
                                        <motion.div
                                            animate={isDragOver ? { scale: 1.1, color: '#2563eb' } : { scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Upload size={32} className={isDragOver ? "text-blue-600" : "text-slate-400"} />
                                        </motion.div>
                                        <p className="text-sm font-medium text-slate-900">
                                            {selectedFile ? selectedFile.name : "Click to select CSV file"}
                                        </p>
                                        <p className="text-xs text-slate-500">{isDragOver ? "Drop file here" : "or drag and drop here"}</p>
                                    </div>
                                </div>

                                {/* Mode Selection */}
                                {/* <div className="mb-6">
                                    <label className="text-sm font-semibold text-slate-700 mb-3 block">
                                        Import Mode
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(["insert", "skip", "update"] as const).map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => setUploadMode(mode)}
                                                disabled={isUploading}
                                                className={`py-2 px-3 rounded-lg font-medium text-sm transition-all ${uploadMode === mode
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                                    } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                                            >
                                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-600 mt-2">
                                        {uploadMode === "insert" && "Create new products (skip duplicates)"}
                                        {uploadMode === "skip" && "Skip duplicate products"}
                                        {uploadMode === "update" && "Update existing products"}
                                    </p>
                                </div> */}

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsImportModalOpen(false)}
                                        disabled={isUploading}
                                        className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => setIsImportModalOpen(false)}
                                        disabled={!isUploading}
                                        className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Skip
                                    </button>
                                    {/* {selectedFile && csvData.length > 0 && (
                                        <button
                                            onClick={() => saveFailedRowsAsCSV()}
                                            className="flex-1 px-4 py-2 rounded-lg bg-slate-600 text-white font-medium hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Download size={18} />
                                            Save
                                        </button>
                                    )} */}
                                    <button
                                        onClick={handleUploadFile}
                                        disabled={!selectedFile || isUploading}
                                        className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isUploading ? (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity }}
                                                >
                                                    <Upload size={18} />
                                                </motion.div>
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={18} />
                                                Upload
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Upload Summary Modal - Now outside section */}
            </section>

            {/* Upload Summary Modal - Outside section for correct fixed positioning */}
            <AnimatePresence>
                {uploadSummary && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: -20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: -20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-hidden relative"
                        >
                            {/* Close Button (X) */}
                            <button
                                onClick={() => setUploadSummary(null)}
                                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 transition-all text-slate-500 hover:text-slate-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <h2 className="text-3xl font-bold text-slate-900 mb-8">Upload Summary</h2>

                            {/* Summary Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                                    <div className="text-3xl font-bold text-blue-600">{uploadSummary.summary?.total_rows || 0}</div>
                                    <div className="text-sm text-slate-600 font-medium mt-1">Total Rows</div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                                    <div className="text-3xl font-bold text-green-600">{uploadSummary.summary?.successful || 0}</div>
                                    <div className="text-sm text-slate-600 font-medium mt-1">Successful</div>
                                </div>
                                <div className="bg-red-50 p-4 rounded-lg border border-red-200 hover:shadow-md transition-shadow">
                                    <div className="text-3xl font-bold text-red-600">{uploadSummary.summary?.failed || 0}</div>
                                    <div className="text-sm text-slate-600 font-medium mt-1">Failed</div>
                                </div>
                                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 hover:shadow-md transition-shadow">
                                    <div className="text-3xl font-bold text-yellow-600">{uploadSummary.summary?.skipped || 0}</div>
                                    <div className="text-sm text-slate-600 font-medium mt-1">Skipped</div>
                                </div>
                            </div>

                            {/* Created Products */}
                            {uploadSummary.created_product_ids && uploadSummary.created_product_ids.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
                                        <CheckCircle2 size={20} />
                                        Successfully Created ({uploadSummary.created_product_ids.length})
                                    </h3>
                                    <div className="bg-green-50 rounded-lg p-4 max-h-48 overflow-y-auto border border-green-200">
                                        <div className="space-y-2">
                                            {uploadSummary.created_product_ids.map((product: any, idx: number) => (
                                                <div key={idx} className="text-sm text-slate-700 pb-2 border-b border-green-200 last:border-b-0">
                                                    <div className="font-medium">ID: {product.id}</div>
                                                    <div className="text-xs text-slate-500">
                                                        {product.upc_code ? `UPC: ${product.upc_code}` : `PLU: ${product.plu_code}`}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Failed Products */}
                            {failedRows && failedRows.size > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
                                        <AlertCircle size={20} />
                                        Failed Products ({failedRows.size})
                                    </h3>
                                    <div className="bg-red-50 rounded-lg p-4 max-h-48 overflow-y-auto border border-red-200">
                                        <div className="space-y-2">
                                            {Array.from(failedRows.entries()).map(([rowIdx, errorDetail], idx) => (
                                                <div key={idx} className="text-sm text-slate-700 pb-2 border-b border-red-200 last:border-b-0">
                                                    <div className="font-medium text-red-900">Row {rowIdx + 1}</div>
                                                    <div className="text-xs text-red-700 font-semibold mt-1">[{errorDetail.error_code}]</div>
                                                    <div className="text-xs text-red-600 mt-1">{errorDetail.error_message}</div>
                                                    {errorDetail.failed_fields && errorDetail.failed_fields.length > 0 && (
                                                        <div className="text-xs text-slate-600 mt-1">
                                                            Fields: {errorDetail.failed_fields.join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {/* <div className="flex gap-3 pt-6 border-t border-slate-200 mt-8">
                                <button
                                    onClick={() => {
                                        // setShowSummaryModal(false)
                                    }}
                                    className="flex-1 px-6 py-3 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-all"
                                >
                                    Dismiss
                                </button>
                                <button
                                    onClick={() => {
                                        saveFailedRowsAsCSV();
                                        // setShowSummaryModal(false);
                                    }}
                                    disabled={failedRows.size === 0}
                                    className="flex-1 px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Download size={18} className="inline mr-2" />
                                    Save Failed Rows
                                </button>
                            </div> */}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Resume Draft Prompt */}
            <ResumeDraftPrompt
                draft={savedDraft}
                isOpen={showResumeDraftPrompt}
                onResume={handleResumeDraft}
                onDiscard={handleDiscardDraft}
                failedRowCount={failedRows.size}
            />
        </div>
    )
}

export default Page