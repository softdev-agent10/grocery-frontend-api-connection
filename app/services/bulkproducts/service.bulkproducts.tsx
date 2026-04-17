const BASE_URL = process.env.NEXT_PUBLIC_API_URI;

type BaseInventoryParams = {
    branchId: string;
    job_id?: string;
    token: string;
};

// export const fetchBulkProducts = async (
//     endpoint: string,
//     {
//         branchId,
//         job_id,
//         token,
//     }: BaseInventoryParams
// ) => {
//     const query = new URLSearchParams({
//         branch_id: branchId,
//         job_id: job_id ?? "",
//     });

//     const res = await fetch(
//         `${BASE_URL}/inventory/${endpoint}?${query.toString()}`,
//         {
//             method: "GET",
//             headers: {
//                 accept: "application/json",
//                 Authorization: `Bearer ${token}`,
//             },
//             cache: "no-store",
//         }
//     );

//     if (!res.ok) {
//         throw new Error(`Failed to fetch ${endpoint}`);
//     }

//     return res.json();
// };

/**
 * Download bulk product import template as CSV
 * @param branchId - Branch ID
 * @param token - Authorization token
 */
export const downloadBulkProductTemplate = async ({
    branchId,
    token,
}: Omit<BaseInventoryParams, "job_id">) => {
    try {
        const query = new URLSearchParams({
            branch_id: branchId,
        });

        const res = await fetch(
            `${BASE_URL}/inventory/products/bulk-import/template?${query.toString()}`,
            {
                method: "GET",
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            }
        );

        if (!res.ok) {
            throw new Error(`Failed to download template: ${res.status}`);
        }

        // Get the blob
        const blob = await res.blob();

        // Extract filename from Content-Disposition header
        const contentDisposition = res.headers.get("content-disposition");
        let filename = "product_import_template.csv";

        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+?)"/);
            if (filenameMatch) {
                filename = filenameMatch[1];
            }
        }

        // Create blob URL and trigger download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true, filename };
    } catch (error) {
        console.error("Error downloading bulk product template:", error);
        throw error;
    }
};

/**
 * Upload bulk products via CSV file
 * @param file - CSV file to upload
 * @param branchId - Branch ID
 * @param token - Authorization token
 * @param mode - Import mode: 'insert', 'skip', or 'update' (default: 'insert')
 */
export const uploadBulkProducts = async ({
    file,
    branchId,
    token,
    mode = "insert",
}: {
    file: File;
    branchId: string;
    token: string;
    mode?: "insert" | "skip" | "update";
}) => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const query = new URLSearchParams({
            branch_id: branchId,
            mode,
        });

        const res = await fetch(
            `${BASE_URL}/inventory/products/bulk-import?${query.toString()}`,
            {
                method: "POST",
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
                cache: "no-store",
            }
        );

        if (!res.ok) {
            let errorMessage = `Failed to upload bulk products: ${res.status}`;
            let errorData: { message?: string; error?: string } = {};

            try {
                const text = await res.text();
                console.error("API Error Response:", text);

                if (text) {
                    errorData = JSON.parse(text);
                    errorMessage = errorData.message || errorData.error || errorMessage;
                }
            } catch (parseError) {
                console.error("Failed to parse error response:", parseError);
            }

            throw new Error(errorMessage);
        }

        return await res.json();
    } catch (error) {
        console.error("Error uploading bulk products:", error);
        throw error;
    }
};


export const uploadBulkProductsAsync = async ({
    file,
    branchId,
    token,
    mode = "insert",
}: {
    file: File;
    branchId: string;
    token: string;
    mode?: "insert" | "skip" | "update";
}) => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const query = new URLSearchParams({
            branch_id: branchId,
            mode,
        });

        const res = await fetch(
            `${BASE_URL}/inventory/products/bulk-import/async?${query.toString()}`,
            {
                method: "POST",
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
                cache: "no-store",
            }
        );

        if (!res.ok) {
            let errorMessage = `Failed to upload bulk products: ${res.status}`;
            let errorData: { message?: string; error?: string } = {};

            try {
                const text = await res.text();
                console.error("API Error Response:", text);

                if (text) {
                    errorData = JSON.parse(text);
                    errorMessage = errorData.message || errorData.error || errorMessage;
                }
            } catch (parseError) {
                console.error("Failed to parse error response:", parseError);
            }

            throw new Error(errorMessage);
        }

        return await res.json();
    } catch (error) {
        console.error("Error uploading bulk products:", error);
        throw error;
    }
};

/**
 * Poll job status using poll_url
 * @param pollUrl - The URL to poll for job status (can be relative or absolute)
 * @param branchId - Branch ID (required as query parameter)
 * @param token - Authorization token
 */
export const pollJobStatus = async ({
    pollUrl,
    branchId,
    token,
}: {
    pollUrl: string;
    branchId: string;
    token: string;
}) => {
    try {
        // Construct full URL if pollUrl is relative
        let fullUrl = pollUrl;

        // Check if URL is relative (doesn't start with http)
        if (!pollUrl.startsWith("http")) {
            const baseUrl = process.env.NEXT_PUBLIC_API_URI;
            if (!baseUrl) {
                throw new Error("NEXT_PUBLIC_API_URI is not configured");
            }

            // Extract origin (protocol + host) from base URL
            // e.g., from http://192.168.0.186:8000/api/v1 -> http://192.168.0.186:8000
            const url = new URL(baseUrl);
            const origin = url.origin;

            // Prepend origin to relative URL
            fullUrl = `${origin}${pollUrl}`;
        }

        // Ensure branch_id is included as a query parameter
        const urlObj = new URL(fullUrl);
        if (!urlObj.searchParams.has("branch_id")) {
            urlObj.searchParams.append("branch_id", branchId);
        }
        fullUrl = urlObj.toString();

        const res = await fetch(fullUrl, {
            method: "GET",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (!res.ok) {
            throw new Error(`Failed to poll job status: ${res.status}`);
        }

        return await res.json();
    } catch (error) {
        console.error("Error polling job status:", error);
        throw error;
    }
};

/**
 * Poll job status by job_id and branch_id
 * @param jobId - Job ID returned from async upload
 * @param branchId - Branch ID
 * @param token - Authorization token
 */
export const pollJobStatusById = async ({
    jobId,
    branchId,
    token,
}: {
    jobId: string;
    branchId: string;
    token: string;
}) => {
    try {
        const query = new URLSearchParams({
            branch_id: branchId,
        });

        const res = await fetch(
            `${BASE_URL}/inventory/products/bulk-import/jobs/${jobId}?${query.toString()}`,
            {
                method: "GET",
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            }
        );

        if (!res.ok) {
            throw new Error(`Failed to poll job status: ${res.status}`);
        }

        return await res.json();
    } catch (error) {
        console.error("Error polling job status:", error);
        throw error;
    }
};

/**
 * Handle async upload with polling
 * Automatically polls the job until completion
 * @param jobId - Job ID returned from async upload
 * @param pollUrl - Poll URL returned from async upload
 * @param branchId - Branch ID
 * @param token - Authorization token
 * @param onProgress - Optional callback for progress updates
 * @param maxAttempts - Maximum polling attempts (default: 120 for 10 minutes with 5s interval)
 * @param pollInterval - Polling interval in milliseconds (default: 5000ms)
 */
export const pollJobUntilCompletion = async ({
    jobId,
    pollUrl,
    branchId,
    token,
    onProgress,
    maxAttempts = 120,
    pollInterval = 5000,
}: {
    jobId: string;
    pollUrl?: string;
    branchId: string;
    token: string;
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
    const maxRetries = maxAttempts;

    while (attempts < maxRetries) {
        try {
            // Use poll_url if provided, otherwise construct the URL
            const statusResponse = pollUrl
                ? await pollJobStatus({ pollUrl, branchId, token })
                : await pollJobStatusById({ jobId, branchId, token });

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
            if (status === "completed" || status === "success") {
                return statusResponse;
            }

            // Check for failed status
            if (status === "failed" || status === "error") {
                throw new Error(`Job failed with status: ${status}`);
            }

            // If still processing, wait and retry
            if (status === "queued" || status === "processing" || status === "in_progress") {
                attempts++;
                if (attempts < maxRetries) {
                    await new Promise((resolve) => setTimeout(resolve, pollInterval));
                    continue;
                } else {
                    throw new Error(
                        `Job polling timeout after ${maxRetries} attempts (${(maxRetries * pollInterval) / 1000}s)`
                    );
                }
            }

            // Unknown status
            throw new Error(`Unknown job status: ${status}`);
        } catch (error) {
            console.error(`Error polling job (attempt ${attempts}):`, error);

            // If this is the last attempt, throw the error
            if (attempts >= maxRetries - 1) {
                throw error;
            }

            // Otherwise, wait and retry
            attempts++;
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
        }
    }

    throw new Error("Job polling failed: maximum attempts reached");
};