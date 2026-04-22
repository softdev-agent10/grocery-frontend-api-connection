/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient } from '@/lib/apiClient';
import { Tax, PaginatedResponse, SingleResponse } from '@/lib/types/api.types';

/**
 * Tax payload for create/update operations
 */
export interface TaxPayload {
  name: string;
  rate: number;
  is_active: boolean;
}

/**
 * Tax filter options
 */
export interface TaxFilter {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
}

/**
 * Fetch all taxes with pagination
 */
export const getTaxes = (filters?: TaxFilter) =>
  apiClient.get<PaginatedResponse<Tax>>('/inventory/taxes', filters);

/**
 * Get single tax by ID
 */
export const getTaxById = (id: number) =>
  apiClient.get<SingleResponse<Tax>>(`/inventory/taxes/${id}`);

/**
 * Create a new tax
 */
export const createTax = (data: TaxPayload) =>
  apiClient.post<SingleResponse<Tax>>('/inventory/taxes', data);

/**
 * Update an existing tax
 */
export const updateTax = (id: number, data: Partial<TaxPayload>) =>
  apiClient.put<SingleResponse<Tax>>(`/inventory/taxes/${id}`, data);

/**
 * Delete a tax
 */
export const deleteTax = (id: number) =>
  apiClient.delete<{ status: string }>(`/inventory/taxes/${id}`);
