import { apiClient } from '@/lib/apiClient';

/**
 * Filter options for bulk product import
 */
export interface BulkImportFilter {
    mode?: 'insert' | 'skip' | 'update';
    callback_url?: string;
}

/**
 * Response type for bulk import operations
 */
export interface BulkImportResponse {
    status: string;
    data: {
        job_id?: string;
        poll_url?: string;
        message?: string;
        [key: string]: any;
    };
    metadata?: any;
}

/**
 * Job status response type
 */
export interface JobStatusResponse {
    status: string;
    data: {
        status: 'completed' | 'success' | 'failed' | 'error' | 'queued' | 'processing' | 'in_progress';
        progress?: {
            total_rows: number;
            processed_rows: number;
            successful: number;
            failed: number;
            skipped: number;
            percent_complete: number;
        };
        [key: string]: any;
    };
    metadata?: any;
}

/**
 * Detailed job status response with full result data
 */
export interface JobStatusDetailedResponse {
    status: string;
    data: {
        job_id: string;
        status: 'completed' | 'success' | 'failed' | 'error' | 'queued' | 'processing' | 'in_progress';
        progress?: {
            total_rows: number;
            processed_rows: number;
            successful: number;
            failed: number;
            skipped: number;
            percent_complete: number;
        };
        result?: {
            summary: {
                total_rows: number;
                successful: number;
                failed: number;
                skipped: number;
                updated: number;
            };
            created_product_ids: Array<{
                id: number;
                upc_code: string;
                plu_code: string;
            }>;
            updated_product_ids: Array<{
                id: number;
                upc_code: string;
                plu_code: string;
            }>;
            skipped_rows: Array<{
                row_number: number;
                name: string;
                upc_code: string;
                reason: string;
            }>;
            failed_rows: Array<{
                row_number: number;
                name: string;
                upc_code: string;
                plu_code: string;
                error_code: string;
                error_message: string;
                failed_fields: string[];
            }>;
        };
        started_at?: string;
        completed_at?: string;
        estimated_completion_at?: string;
    };
    metadata?: any;
}

/**
 * Upload bulk products via CSV file (synchronous)
 * @param file - CSV file to upload
 * @param filters - Filter options (mode: insert|skip|update)
 */
export const uploadBulkProducts = (file: File, filters?: BulkImportFilter) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.postFile<BulkImportResponse>(
        '/inventory/products/bulk-import',
        formData,
        filters
    );
};

/**
 * Upload bulk products asynchronously with job tracking
 * @param file - CSV file to upload
 * @param filters - Filter options (mode: insert|skip|update, callback_url: optional)
 */
export const uploadBulkProductsAsync = (file: File, filters?: BulkImportFilter) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.postFile<BulkImportResponse>(
        '/inventory/products/bulk-import/async',
        formData,
        filters
    );
};

/**
 * Download bulk product import template as CSV
 */
export const downloadBulkProductTemplate = async () => {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URI;
        if (!baseUrl) throw new Error('NEXT_PUBLIC_API_URI is not configured');

        const { token, merchantId, branchId } = apiClient.getContext();
        const response = await fetch(
            `${baseUrl}/inventory/products/bulk-import/template?merchant_id=${merchantId}&branch_id=${branchId}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                cache: 'no-store',
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to download template: ${response.status}`);
        }

        const blob = await response.blob();
        const contentDisposition = response.headers.get('content-disposition');
        let filename = 'product_import_template.csv';

        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+?)"/);
            if (filenameMatch) {
                filename = filenameMatch[1];
            }
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true, filename };
    } catch (error) {
        console.error('Error downloading bulk product template:', error);
        throw error;
    }
};

/**
 * Poll job status by job_id
 * @param jobId - Job ID returned from async upload
 */
export const pollJobStatusById = (jobId: string) =>
    apiClient.get<JobStatusResponse>(`/inventory/products/bulk-import/jobs/${jobId}`);

/**
 * Get detailed job status with full result data
 * @param jobId - Job ID returned from async upload
 */
export const getJobStatusDetailed = (jobId: string) =>
    apiClient.get<JobStatusDetailedResponse>(`/inventory/products/bulk-import/${jobId}/status`);

/**
 * Poll job status using poll_url with rate limit detection
 * @param pollUrl - The URL to poll for job status (can be relative or absolute)
 * @returns Response data or error with status code
 */
export const pollJobStatus = async (pollUrl: string) => {
    try {
        let fullUrl = pollUrl;

        // Check if URL is relative
        if (!pollUrl.startsWith('http')) {
            const baseUrl = process.env.NEXT_PUBLIC_API_URI;
            if (!baseUrl) throw new Error('NEXT_PUBLIC_API_URI is not configured');

            const url = new URL(baseUrl);
            fullUrl = `${url.origin}${pollUrl}`;
        }

        const { token } = apiClient.getContext();
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            const error: any = new Error(`Failed to poll job status: ${response.status}`);
            error.status = response.status;
            error.retryAfter = response.headers.get('retry-after');
            throw error;
        }

        return await response.json();
    } catch (error) {
        console.error('Error polling job status:', error);
        throw error;
    }
};

/**
 * Poll job until completion with exponential backoff for rate limits
 * @param jobId - Job ID returned from async upload
 * @param pollUrl - Poll URL returned from async upload (optional)
 * @param useDetailedStatus - Use detailed status endpoint instead of basic endpoint (default: false)
 * @param onProgress - Callback for progress updates
 * @param maxAttempts - Maximum polling attempts (default: 120)
 * @param pollInterval - Polling interval in milliseconds (default: 10000 = 10 seconds)
 */
export const pollJobUntilCompletion = async ({
    jobId,
    pollUrl,
    useDetailedStatus = false,
    onProgress,
    maxAttempts = 120,
    pollInterval = 10000,
}: {
    jobId: string;
    pollUrl?: string;
    useDetailedStatus?: boolean;
    onProgress?: (progress: {
        totalRows: number;
        processedRows: number;
        successful: number;
        failed: number;
        skipped: number;
        percentComplete: number;
    }) => void;
    maxAttempts?: number;
    pollInterval?: number;
}) => {
    let attempts = 0;
    let currentInterval = pollInterval;

    while (attempts < maxAttempts) {
        try {
            let statusResponse: any;

            if (pollUrl) {
                statusResponse = await pollJobStatus(pollUrl);
            } else if (useDetailedStatus) {
                statusResponse = await getJobStatusDetailed(jobId);
            } else {
                statusResponse = await pollJobStatusById(jobId);
            }

            // Reset interval on successful response
            currentInterval = pollInterval;

            const data = statusResponse.data;
            const status = data.status;

            // Call progress callback if provided
            if (onProgress && data.progress) {
                onProgress({
                    totalRows: data.progress.total_rows || 0,
                    processedRows: data.progress.processed_rows || 0,
                    successful: data.progress.successful || 0,
                    failed: data.progress.failed || 0,
                    skipped: data.progress.skipped || 0,
                    percentComplete: data.progress.percent_complete || 0,
                });
            }

            // Check if job is completed
            if (status === 'completed' || status === 'success') {
                return statusResponse;
            }

            // Check for failed status
            if (status === 'failed' || status === 'error') {
                throw new Error(`Job failed with status: ${status}`);
            }

            // If still processing, wait and retry
            if (status === 'queued' || status === 'processing' || status === 'in_progress') {
                attempts++;
                if (attempts < maxAttempts) {
                    await new Promise((resolve) => setTimeout(resolve, currentInterval));
                    continue;
                } else {
                    throw new Error(
                        `Job polling timeout after ${maxAttempts} attempts (${(maxAttempts * pollInterval) / 1000}s)`
                    );
                }
            }

            // Unknown status
            throw new Error(`Unknown job status: ${status}`);
        } catch (error) {
            const err = error as any;

            // Handle rate limit errors (429) with exponential backoff
            if (err.status === 429) {
                attempts++;

                // Get retry-after header or use exponential backoff
                if (err.retryAfter) {
                    currentInterval = parseInt(err.retryAfter) * 1000;
                } else {
                    // Exponential backoff: 10s, 20s, 40s, 80s, max 5 minutes
                    currentInterval = Math.min(currentInterval * 1.5, 300000);
                }

                console.warn(
                    `Rate limited (429). Retrying in ${currentInterval / 1000}s (attempt ${attempts}/${maxAttempts})`
                );

                if (attempts < maxAttempts) {
                    await new Promise((resolve) => setTimeout(resolve, currentInterval));
                    continue;
                } else {
                    throw new Error(
                        `Job polling failed: Rate limited after ${attempts} attempts. Server requested longer wait time.`
                    );
                }
            }

            // Handle other errors
            console.error(`Error polling job (attempt ${attempts}):`, err);

            if (attempts >= maxAttempts - 1) {
                throw error;
            }

            attempts++;
            await new Promise((resolve) => setTimeout(resolve, currentInterval));
        }
    }

    throw new Error('Job polling failed: maximum attempts reached');
};