import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FailedRow {
    error_code: string;
    error_message: string;
    failed_fields: string[];
}

export interface UploadSummary {
    successful: number;
    failed: number;
    skipped: number;
    total_rows: number;
}

export interface JobProgress {
    totalRows: number;
    processedRows: number;
    successful: number;
    failed: number;
    skipped: number;
    percentComplete: number;
}

export interface BulkImportDraft {
    csvData: any[];
    failedRows: Record<number, FailedRow>;
    uploadSummary: any;
    originalCsvData: any[];
    uploadMode: 'insert' | 'skip' | 'update';
}

interface BulkImportState {
    csvData: any[];
    failedRows: Map<number, FailedRow>;
    originalCsvData: any[];
    uploadCompleted: boolean;
    uploadSummary: any | null;
    uploadMode: 'insert' | 'skip' | 'update';
    isUploading: boolean;
    isPolling: boolean;
    jobProgress: JobProgress | null;
    currentPage: number;
    selectedFile: File | null;
    isDragOver: boolean;
    isParsingCsv: boolean;
    error: string | null;
}

const initialState: BulkImportState = {
    csvData: [],
    failedRows: new Map(),
    originalCsvData: [],
    uploadCompleted: false,
    uploadSummary: null,
    uploadMode: 'insert',
    isUploading: false,
    isPolling: false,
    jobProgress: null,
    currentPage: 0,
    selectedFile: null,
    isDragOver: false,
    isParsingCsv: false,
    error: null,
};

const bulkImportSlice = createSlice({
    name: 'bulkImport',
    initialState,
    reducers: {
        setCsvData: (state, action: PayloadAction<any[]>) => {
            state.csvData = action.payload;
        },
        setFailedRows: (state, action: PayloadAction<Map<number, FailedRow>>) => {
            state.failedRows = action.payload;
        },
        setOriginalCsvData: (state, action: PayloadAction<any[]>) => {
            state.originalCsvData = action.payload;
        },
        setUploadCompleted: (state, action: PayloadAction<boolean>) => {
            state.uploadCompleted = action.payload;
        },
        setUploadSummary: (state, action: PayloadAction<any | null>) => {
            state.uploadSummary = action.payload;
        },
        setUploadMode: (state, action: PayloadAction<'insert' | 'skip' | 'update'>) => {
            state.uploadMode = action.payload;
        },
        setIsUploading: (state, action: PayloadAction<boolean>) => {
            state.isUploading = action.payload;
        },
        setIsPolling: (state, action: PayloadAction<boolean>) => {
            state.isPolling = action.payload;
        },
        setJobProgress: (state, action: PayloadAction<JobProgress | null>) => {
            state.jobProgress = action.payload;
        },
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },
        setSelectedFile: (state, action: PayloadAction<File | null>) => {
            state.selectedFile = action.payload;
        },
        setIsDragOver: (state, action: PayloadAction<boolean>) => {
            state.isDragOver = action.payload;
        },
        setIsParsingCsv: (state, action: PayloadAction<boolean>) => {
            state.isParsingCsv = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        clearAll: (state) => {
            state.csvData = [];
            state.failedRows.clear();
            state.originalCsvData = [];
            state.uploadCompleted = false;
            state.uploadSummary = null;
            state.uploadMode = 'insert';
            state.isUploading = false;
            state.isPolling = false;
            state.jobProgress = null;
            state.currentPage = 0;
            state.selectedFile = null;
            state.isDragOver = false;
            state.isParsingCsv = false;
            state.error = null;
        },
        resetUploadState: (state) => {
            state.uploadCompleted = false;
            state.failedRows.clear();
            state.jobProgress = null;
            state.isUploading = false;
            state.isPolling = false;
            state.error = null;
        },
    },
});

export const {
    setCsvData,
    setFailedRows,
    setOriginalCsvData,
    setUploadCompleted,
    setUploadSummary,
    setUploadMode,
    setIsUploading,
    setIsPolling,
    setJobProgress,
    setCurrentPage,
    setSelectedFile,
    setIsDragOver,
    setIsParsingCsv,
    setError,
    clearAll,
    resetUploadState,
} = bulkImportSlice.actions;

export default bulkImportSlice.reducer;
