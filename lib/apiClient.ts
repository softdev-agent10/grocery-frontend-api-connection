/**
 * Generic API Client for all services
 * Handles: merchant_id, branch_id, authentication, error handling
 */

interface FetchOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
    cache?: 'no-store' | 'default';
}

interface ApiResponse<T = any> {
    status: string;
    data: T;
    metadata?: any;
}

interface PaginationParams {
    page?: number;
    limit?: number;
    perPage?: number;
}

class ApiClient {
    private baseUrl: string;
    private merchantId: string = "1"; // Default
    private branchId: string = '1234567890';
    private token: string = 'your-default-token'; // Replace with actual token management

    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URI || '';
    }

    // Set merchant/branch context
    setContext(merchantId: string, branchId: string, token?: string) {
        this.merchantId = merchantId;
        this.branchId = branchId;
        if (token) this.token = token;
    }

    // Build query string with merchant_id and branch_id
    private buildQueryString(params?: Record<string, any>): string {
        const searchParams = new URLSearchParams({
            merchant_id: this.merchantId.toString(),
            branch_id: this.branchId,
        });

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    searchParams.append(key, String(value));
                }
            });
        }

        return searchParams.toString();
    }

    // Generic fetch method
    private async request<T>(
        endpoint: string,
        options: FetchOptions = {}
    ): Promise<T> {
        const {
            method = 'GET',
            headers = {},
            body,
            cache = 'no-store',
        } = options;

        const url = `${this.baseUrl}${endpoint}`;

        const requestHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            ...headers,
        };

        if (this.token) {
            requestHeaders['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                method,
                headers: requestHeaders,
                cache,
                ...(body && { body: JSON.stringify(body) }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error?.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return response.json();
        } catch (error) {
            console.error(`API Error [${method} ${endpoint}]:`, error);
            throw error;
        }
    }

    // GET with pagination
    async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
        const queryString = this.buildQueryString(params);
        const url = `${endpoint}?${queryString}`;
        return this.request<T>(url, { method: 'GET' });
    }

    // POST
    async post<T>(endpoint: string, data?: any, params?: Record<string, any>): Promise<T> {
        const queryString = this.buildQueryString(params);
        const url = `${endpoint}?${queryString}`;
        return this.request<T>(url, {
            method: 'POST',
            body: data,
        });
    }

    // PUT
    async put<T>(endpoint: string, data?: any, params?: Record<string, any>): Promise<T> {
        const queryString = this.buildQueryString(params);
        const url = `${endpoint}?${queryString}`;
        return this.request<T>(url, {
            method: 'PUT',
            body: data,
        });
    }

    // PATCH
    async patch<T>(endpoint: string, data?: any, params?: Record<string, any>): Promise<T> {
        const queryString = this.buildQueryString(params);
        const url = `${endpoint}?${queryString}`;
        return this.request<T>(url, {
            method: 'PATCH',
            body: data,
        });
    }

    // DELETE
    async delete<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
        const queryString = this.buildQueryString(params);
        const url = `${endpoint}?${queryString}`;
        return this.request<T>(url, { method: 'DELETE' });
    }

    // Get current context (for advanced use cases)
    getContext() {
        return {
            merchantId: this.merchantId,
            branchId: this.branchId,
            token: this.token,
        };
    }

    // POST with FormData (for file uploads)
    async postFile<T>(endpoint: string, formData: FormData, params?: Record<string, any>): Promise<T> {
        const queryString = this.buildQueryString(params);
        const url = `${this.baseUrl}${endpoint}?${queryString}`;

        const requestHeaders: Record<string, string> = {};

        if (this.token) {
            requestHeaders['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: requestHeaders,
                body: formData,
                cache: 'no-store',
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error?.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return response.json();
        } catch (error) {
            console.error(`API Error [POST ${endpoint}]:`, error);
            throw error;
        }
    }
}

// Singleton instance
export const apiClient = new ApiClient();
export type { ApiResponse, PaginationParams };
