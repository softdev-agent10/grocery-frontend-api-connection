import { apiClient } from '@/lib/apiClient';
import { Category, PaginatedResponse, SingleResponse } from '@/lib/types/api.types';

/**
 * Category filter options
 */
export interface CategoryFilter {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Category payload for create/update
 */
export interface CategoryPayload {
  name: string;
  description?: string;
  tax_id?: number;
  fee_id?: number;
  category_image?: string;
  is_active?: boolean;
}

/**
 * Get all categories (departments)
 */
export const getCategories = (filters?: CategoryFilter) =>
  apiClient.get<PaginatedResponse<Category>>('/inventory/departments', filters);

/**
 * Create a new category
 */
export const createCategory = (data: CategoryPayload) =>
  apiClient.post<SingleResponse<Category>>('/inventory/departments', data);

/**
 * Update an existing category
 */
export const updateCategory = (id: number, data: Partial<CategoryPayload>) =>
  apiClient.patch<SingleResponse<Category>>(`/inventory/departments/${id}`, data);

/**
 * Delete a category
 */
export const deleteCategory = (id: number) =>
  apiClient.delete<{ status: string }>(`/inventory/departments/${id}`);
