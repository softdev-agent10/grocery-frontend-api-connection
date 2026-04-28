import { createAsyncThunk } from '@reduxjs/toolkit';
import {
    uploadBulkProducts,
    uploadBulkProductsAsync,
    pollJobUntilCompletion,
    downloadBulkProductTemplate,
} from '@/app/services/bulkproducts/service.bulkproducts';

export interface UploadBulkProductsParams {
    file: File;
    mode: 'insert' | 'skip' | 'update';
}

export interface PollJobParams {
    jobId: string;
    pollUrl?: string;
    maxAttempts?: number;
    pollInterval?: number;
}

/**
 * Upload bulk products synchronously
 */
export const uploadBulkProductsSync = createAsyncThunk(
    'bulkImport/uploadSync',
    async (params: UploadBulkProductsParams, { rejectWithValue }) => {
        try {
            const result = await uploadBulkProducts(params.file, { mode: params.mode });
            return result;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to upload products');
        }
    }
);

/**
 * Upload bulk products asynchronously (for large files > 2000 rows)
 */
export const uploadBulkProductsAsyncThunk = createAsyncThunk(
    'bulkImport/uploadAsync',
    async (params: UploadBulkProductsParams, { rejectWithValue }) => {
        try {
            const result = await uploadBulkProductsAsync(params.file, { mode: params.mode });
            return result;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to upload products');
        }
    }
);

/**
 * Poll job status until completion
 */
export const pollJobThunk = createAsyncThunk(
    'bulkImport/pollJob',
    async (params: PollJobParams, { rejectWithValue }) => {
        try {
            const result = await pollJobUntilCompletion({
                jobId: params.jobId,
                pollUrl: params.pollUrl,
                useDetailedStatus: true,
                maxAttempts: params.maxAttempts || 120,
                pollInterval: params.pollInterval || 10000,
            });
            return result;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to poll job status');
        }
    }
);

/**
 * Download bulk product import template
 */
export const downloadTemplateThunk = createAsyncThunk(
    'bulkImport/downloadTemplate',
    async (_, { rejectWithValue }) => {
        try {
            const result = await downloadBulkProductTemplate();
            return result;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to download template');
        }
    }
);
