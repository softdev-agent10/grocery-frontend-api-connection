import { apiClient } from '@/lib/apiClient';
import { PaginatedResponse, SingleResponse } from '@/lib/types/api.types';

export interface Customer {
    id: number;
    name: string;
    phone_number: string;
    email: string;
    address: string;
    point: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Filters
 */
export interface CustomerFilter {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
}

/**
 * Get all customers
 */
export const getCustomers = (filters?: CustomerFilter) =>
    apiClient.get<PaginatedResponse<Customer>>(
        '/tools/customer',
        filters
    );

/**
 * Create
 */
export const createCustomer = (data: Partial<Customer>) =>
    apiClient.post<SingleResponse<Customer>>(
        '/tools/customer',
        data
    );

/**
 * Update
 */
export const updateCustomer = (id: number, data: Partial<Customer>) =>
    apiClient.patch<SingleResponse<Customer>>(
        `/tools/customer/${id}`,
        data
    );