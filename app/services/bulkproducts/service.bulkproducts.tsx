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