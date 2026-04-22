// services/brand.service.ts

import { apiClient } from '@/lib/apiClient';
import { Brand, PaginatedResponse, SingleResponse } from '@/lib/types/api.types';

/**
 * Payload
 */
export interface BrandPayload {
  name: string;
  brand_image?: string;
}

/**
 * Filters
 */
export interface BrandFilter {
  page?: number;
  perPage?: number;
  search?: string;
  limit?: number;
}

/**
 * Get all brands
 */
export const getBrands = (filters?: BrandFilter) =>
  apiClient.get<PaginatedResponse<Brand>>(
    '/inventory/brands',
    {
      page: filters?.page,
      per_page: filters?.perPage,
      search: filters?.search,
      limit: filters?.limit,
    }
  );

/**
 * Get single brand
 */
export const getBrandById = (id: number) =>
  apiClient.get<SingleResponse<Brand>>(
    `/inventory/brands/${id}`
  );

/**
 * Create brand
 */
export const createBrand = (data: BrandPayload) =>
  apiClient.post<SingleResponse<Brand>>(
    '/inventory/brands',
    {
      name: data.name,
      brand_image:
        data.brand_image ||
        'https://example.com/default-brand-image.png',
    }
  );

/**
 * Update brand
 */
export const updateBrand = (
  id: number,
  data: Partial<BrandPayload>
) =>
  apiClient.patch<SingleResponse<Brand>>(
    `/inventory/brands/${id}`,
    data
  );

/**
 * Delete brand
 */
export const deleteBrand = (id: number) =>
  apiClient.delete<{ status: string }>(
    `/inventory/brands/${id}`
  );