/* eslint-disable @typescript-eslint/no-explicit-any */

import { redirect } from "next/dist/server/api-utils";

interface FetchOptions {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    headers?: Record<string, string>;
    body?: any;
    cache?: "no-store" | "default";
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
    private merchantId: string;
    private branchId: string;
    private token: string;

    private refreshPromise: Promise<string> | null = null;

    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URI || "";
        this.merchantId = process.env.NEXT_PUBLIC_MERCHANT_ID || "";
        this.branchId = process.env.NEXT_PUBLIC_BRANCH_ID || "";
        this.token = process.env.NEXT_PUBLIC_API_TOKEN || "";
    }

    setContext(merchantId?: string, branchId?: string, token?: string) {
        if (merchantId) this.merchantId = merchantId;
        if (branchId) this.branchId = branchId;

        if (token) {
            this.token = token;

            if (typeof window !== "undefined") {
                sessionStorage.setItem("jwt", token);
            }
        }
    }

    private getJwt(): string {
        if (typeof window !== "undefined") {
            return sessionStorage.getItem("jwt") || "";
        }

        return this.token || "";
    }

    private getRefreshToken(): string {
        if (typeof window === "undefined") return "";
        return sessionStorage.getItem("refresh_token") || "";
    }

    // private setTokens(jwt: string, refreshToken?: string) {
    //     this.token = jwt;

    //     if (typeof window === "undefined") return;

    //     sessionStorage.setItem("jwt", jwt);

    //     if (refreshToken) {
    //         sessionStorage.setItem("refresh_token", refreshToken);
    //     }
    // }

    private setTokens(jwt: string, refreshToken?: string) {
        this.token = jwt;

        if (typeof window === "undefined") return;

        sessionStorage.setItem("jwt", jwt);

        document.cookie = `jwt=${encodeURIComponent(
            jwt
        )}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;

        if (refreshToken) {
            sessionStorage.setItem("refresh_token", refreshToken);
        }
    }

    // private clearTokens() {
    //     this.token = "";

    //     if (typeof window === "undefined") return;

    //     sessionStorage.removeItem("jwt");
    //     sessionStorage.removeItem("refresh_token");
    //     sessionStorage.removeItem("login_response");
    // }
    private clearTokens() {
        this.token = "";

        if (typeof window === "undefined") return;

        sessionStorage.removeItem("jwt");
        sessionStorage.removeItem("refresh_token");
        sessionStorage.removeItem("login_response");
        sessionStorage.removeItem("user");

        document.cookie = "jwt=; path=/; max-age=0; SameSite=Lax";
    }

    private async getFreshToken(): Promise<string> {
        if (!this.refreshPromise) {
            this.refreshPromise = this.refreshAccessToken().finally(() => {
                this.refreshPromise = null;
            });
        }

        return this.refreshPromise;
    }

    public async refreshAccessToken(): Promise<string> {
        const refreshToken = this.getRefreshToken();

        if (!refreshToken) {
            this.clearTokens();
            throw new Error("No refresh token found");
        }

        const authBaseUrl = process.env.NEXT_PUBLIC_AUTH_API_URI || this.baseUrl;
        const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

        const response = await fetch(
            `${authBaseUrl}/access-token?client_id=${clientId}`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${refreshToken}`,
                },
                cache: "no-store",
            }
        );

        if (!response.ok) {
            if (response.status === 401) {
                this.clearTokens();
                throw new Error("Refresh token expired. Please login again.");
            }

            throw new Error(`Token refresh failed: ${response.statusText}`);
        }

        const data = await response.json();

        const newJwt = data?.jwt || data?.data?.jwt || data?.access_token;

        const newRefreshToken =
            data?.refresh_token ||
            data?.data?.refresh_token ||
            data?.refreshToken ||
            refreshToken;

        if (!newJwt) {
            this.clearTokens();
            throw new Error("Invalid refresh response: JWT missing");
        }

        this.setTokens(newJwt, newRefreshToken);

        return newJwt;
    }

    private buildQueryString(params?: Record<string, any>): string {
        const searchParams = new URLSearchParams({
            merchant_id: this.merchantId.toString(),
            branch_id: this.branchId,
        });

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    searchParams.append(key, String(value));
                }
            });
        }

        return searchParams.toString();
    }

    private async parseResponse<T>(response: Response): Promise<T> {
        const text = await response.text();

        if (!text) {
            return {} as T;
        }

        try {
            return JSON.parse(text);
        } catch {
            throw new Error("Invalid JSON response from server");
        }
    }

    private async request<T>(
        endpoint: string,
        options: FetchOptions = {},
        retry = true
    ): Promise<T> {
        const {
            method = "GET",
            headers = {},
            body,
            cache = "no-store",
        } = options;

        const url = `${this.baseUrl}${endpoint}`;

        const requestHeaders: Record<string, string> = {
            "Content-Type": "application/json",
            ...headers,
        };

        const jwt = this.getJwt();

        if (jwt) {
            requestHeaders.Authorization = `Bearer ${jwt}`;
        }

        let response: Response;

        try {
            response = await fetch(url, {
                method,
                headers: requestHeaders,
                cache,
                ...(body !== undefined && { body: JSON.stringify(body) }),
            });
        } catch {
            window.location.href = "/login";
            throw new Error("Network error. Please check your connection.");
        }

        if (response.status === 401 && retry) {
            try {
                const newJwt = await this.getFreshToken();

                requestHeaders.Authorization = `Bearer ${newJwt}`;

                response = await fetch(url, {
                    method,
                    headers: requestHeaders,
                    cache,
                    ...(body !== undefined && { body: JSON.stringify(body) }),
                });
            } catch {
                this.clearTokens();

                throw new Error("Session expired. Please login again.");
            }
        }

        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

            try {
                const text = await response.text();

                if (text) {
                    const error = JSON.parse(text);
                    errorMessage = error?.message || error?.detail || errorMessage;
                }
            } catch {
                // Ignore error body parse issue
            }

            throw new Error(errorMessage);
        }

        return this.parseResponse<T>(response);
    }

    async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
        const queryString = this.buildQueryString(params);
        const url = `${endpoint}?${queryString}`;

        return this.request<T>(url, { method: "GET" });
    }

    async post<T>(
        endpoint: string,
        data?: any,
        params?: Record<string, any>
    ): Promise<T> {
        const queryString = this.buildQueryString(params);
        const url = `${endpoint}?${queryString}`;

        return this.request<T>(url, {
            method: "POST",
            body: data,
        });
    }

    async put<T>(
        endpoint: string,
        data?: any,
        params?: Record<string, any>
    ): Promise<T> {
        const queryString = this.buildQueryString(params);
        const url = `${endpoint}?${queryString}`;

        return this.request<T>(url, {
            method: "PUT",
            body: data,
        });
    }

    async patch<T>(
        endpoint: string,
        data?: any,
        params?: Record<string, any>
    ): Promise<T> {
        const queryString = this.buildQueryString(params);
        const url = `${endpoint}?${queryString}`;

        return this.request<T>(url, {
            method: "PATCH",
            body: data,
        });
    }

    async delete<T>(
        endpoint: string,
        params?: Record<string, any>
    ): Promise<T> {
        const queryString = this.buildQueryString(params);
        const url = `${endpoint}?${queryString}`;

        return this.request<T>(url, { method: "DELETE" });
    }

    getContext() {
        return {
            merchantId: this.merchantId,
            branchId: this.branchId,
            token: this.getJwt(),
        };
    }

    async postFile<T>(
        endpoint: string,
        formData: FormData,
        params?: Record<string, any>
    ): Promise<T> {
        const queryString = this.buildQueryString(params);
        const url = `${this.baseUrl}${endpoint}?${queryString}`;

        const requestHeaders: Record<string, string> = {};

        const jwt = this.getJwt();

        if (jwt) {
            requestHeaders.Authorization = `Bearer ${jwt}`;
        }

        let response = await fetch(url, {
            method: "POST",
            headers: requestHeaders,
            body: formData,
            cache: "no-store",
        });

        if (response.status === 401) {
            const newJwt = await this.getFreshToken();

            requestHeaders.Authorization = `Bearer ${newJwt}`;

            response = await fetch(url, {
                method: "POST",
                headers: requestHeaders,
                body: formData,
                cache: "no-store",
            });
        }

        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

            try {
                const text = await response.text();

                if (text) {
                    const error = JSON.parse(text);
                    errorMessage = error?.message || error?.detail || errorMessage;
                }
            } catch {
                // Ignore error body parse issue
            }

            throw new Error(errorMessage);
        }

        return this.parseResponse<T>(response);
    }
}

export const apiClient = new ApiClient();

export type { ApiResponse, PaginationParams };