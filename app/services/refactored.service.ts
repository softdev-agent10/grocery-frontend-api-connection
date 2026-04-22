/**
 * REFACTORED Service Pattern
 * Reusable, maintainable, DRY
 */

import { apiClient } from '@/lib/apiClient';
import { Tax, PaginatedResponse, SingleResponse } from '@/lib/types/api.types';

// ============ TAXES SERVICE ============

export interface TaxPayload {
    name: string;
    rate: number;
    is_active: boolean;
}

export interface TaxFilter {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
}

/**
 * Get all taxes with filters
 */
export const getTaxes = (filters?: TaxFilter) =>
    apiClient.get<PaginatedResponse<Tax>>('/inventory/taxes', filters);

/**
 * Get single tax by ID
 */
export const getTaxById = (id: number) =>
    apiClient.get<SingleResponse<Tax>>(`/inventory/taxes/${id}`);

/**
 * Create new tax
 */
export const createTax = (data: TaxPayload) =>
    apiClient.post<SingleResponse<Tax>>('/inventory/taxes', data);

/**
 * Update tax
 */
export const updateTax = (id: number, data: Partial<TaxPayload>) =>
    apiClient.put<SingleResponse<Tax>>(`/inventory/taxes/${id}`, data);

/**
 * Delete tax
 */
export const deleteTax = (id: number) =>
    apiClient.delete<{ status: string }>(`/inventory/taxes/${id}`);

// ============ FEES SERVICE ============

import { Fee } from '@/lib/types/api.types';

export interface FeePayload {
    name: string;
    amount: number;
    is_percentage: boolean;
    is_active: boolean;
}

export interface FeeFilter {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
}

export const getFees = (filters?: FeeFilter) =>
    apiClient.get<PaginatedResponse<Fee>>('/inventory/fees', filters);

export const getFeeById = (id: number) =>
    apiClient.get<SingleResponse<Fee>>(`/inventory/fees/${id}`);

export const createFee = (data: FeePayload) =>
    apiClient.post<SingleResponse<Fee>>('/inventory/fees', data);

export const updateFee = (id: number, data: Partial<FeePayload>) =>
    apiClient.put<SingleResponse<Fee>>(`/inventory/fees/${id}`, data);

export const deleteFee = (id: number) =>
    apiClient.delete<{ status: string }>(`/inventory/fees/${id}`);

// ============ USAGE IN COMPONENTS ============

/*
// In your component:
import { getTaxes, createTax } from '@/app/services/refactored.service';
import { apiClient } from '@/lib/apiClient';

function TaxList() {
  useEffect(() => {
    // Set context once (usually on app init)
    apiClient.setContext(9, 'branch-123', token);
    
    // Then use services without passing merchant_id/branch_id
    getTaxes({ page: 1, limit: 10 }).then(res => {
      console.log(res.data.items);
    });
  }, []);
  
  const handleCreate = async (formData) => {
    const result = await createTax(formData);
    console.log(result.data);
  };
}
*/
