import { apiClient } from '@/lib/apiClient';
import { TopSellingProduct, PaginatedResponse } from '@/lib/types/api.types';

/**
 * Filter options for top-selling products
 */
export interface TopSellingFilter {
       page?: number;
       limit?: number;
       start_date?: string;
       end_date?: string;
       category_name?: string;
}

/**
 * Get top selling products with filters
 */
export const getTopSellings = (filters?: TopSellingFilter) =>
       apiClient.get<PaginatedResponse<TopSellingProduct>>('/inventory/top-sell', filters);