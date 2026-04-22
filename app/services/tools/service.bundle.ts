import { apiClient } from '@/lib/apiClient';
import { PaginatedResponse, SingleResponse } from '@/lib/types/api.types';

export interface Bundle {
    id: number;
    name: string;
    description: string;
    type: string;
    discount_type?: "flat" | "percent";
    flat_discount?: string | number;
    percent_discount?: string | number;
    start_date: string;
    end_date: string;
    items: {
        product_id: number;
        quantity: number;
        price: string | number;
        name: string;
    }[];
}

/**
 * Get bundles
 */
export const getBundles = (filters?: any) =>
    apiClient.get<PaginatedResponse<Bundle>>(
        '/tools/bundles',
        filters
    );

/**
 * Get single
 */
export const getBundle = (id: number) =>
    apiClient.get<SingleResponse<Bundle>>(
        `/tools/bundles/${id}`
    );

/**
 * Create
 */
export const createBundle = (data: any) =>
    apiClient.post<SingleResponse<Bundle>>(
        '/tools/bundles',
        data
    );

/**
 * Update
 */
export const updateBundle = (id: number, data: any) =>
    apiClient.patch<SingleResponse<Bundle>>(
        `/tools/bundles/${id}`,
        data
    );