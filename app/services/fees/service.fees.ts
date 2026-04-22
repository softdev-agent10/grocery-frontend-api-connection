/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient } from '@/lib/apiClient';
import { Fee, PaginatedResponse, SingleResponse } from '@/lib/types/api.types';

/**
 * Fee payload for create/update operations
 */
export interface FeePayload {
    name: string;
    amount: number;
    is_percentage: boolean;
    is_active: boolean;
}

/**
 * Fee filter options
 */
export interface FeeFilter {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
}

/**
 * Fetch all fees with pagination
 */
export const getFees = (filters?: FeeFilter) =>
    apiClient.get<PaginatedResponse<Fee>>('/inventory/fees', filters);

/**
 * Get single fee by ID
 */
export const getFeeById = (id: number) =>
    apiClient.get<SingleResponse<Fee>>(`/inventory/fees/${id}`);

/**
 * Create a new fee
 */
export const createFee = (data: FeePayload) =>
    apiClient.post<SingleResponse<Fee>>('/inventory/fees', data);

/**
 * Update an existing fee
 */
export const updateFee = (id: number, data: Partial<FeePayload>) =>
    apiClient.put<SingleResponse<Fee>>(`/inventory/fees/${id}`, data);

/**
 * Delete a fee
 */
export const deleteFee = (id: number) =>
    apiClient.delete<{ status: string }>(`/inventory/fees/${id}`);
