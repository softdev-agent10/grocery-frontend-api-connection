import { apiClient } from '@/lib/apiClient';
import { Unit, PaginatedResponse, SingleResponse } from '@/lib/types/api.types';

/**
 * Unit payload for create/update operations
 */
export interface UnitPayload {
  name: string;
  short_name: string;
}

/**
 * Unit filter options
 */
export interface UnitFilter {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Fetch all units with pagination
 */
export const getUnits = (filters?: UnitFilter) =>
  apiClient.get<PaginatedResponse<Unit>>('/inventory/units', filters);

/**
 * Get single unit by ID
 */
export const getUnitById = (id: number) =>
  apiClient.get<SingleResponse<Unit>>(`/inventory/units/${id}`);

/**
 * Create a new unit
 */
export const createUnits = (data: UnitPayload) =>
  apiClient.post<SingleResponse<Unit>>('/inventory/units', data);

/**
 * Update an existing unit
 */
export const updateUnits = (id: number, data: Partial<UnitPayload>) =>
  apiClient.patch<SingleResponse<Unit>>(`/inventory/units/${id}`, data);

/**
 * Delete a unit
 */
export const deleteUnits = (id: number) =>
  apiClient.delete<{ status: string }>(`/inventory/units/${id}`);