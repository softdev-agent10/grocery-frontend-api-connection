import { apiClient } from '@/lib/apiClient';
import { LowStockProduct, PaginatedResponse } from '@/lib/types/api.types';

/**
 * Out of stock filter options
 */
export interface OutOfStockFilter {
    page?: number;
    limit?: number;
    category_name?: string;
    brand_name?: string;
    search?: string;
    sort_by?: 'name' | 'selling_price' | 'category'; // Default: 'name'
    sort_order?: 'asc' | 'desc'; // Default: 'asc'
}

/**
 * Get out of stock products with filters
 */
export const getOutOfStocks = (filters?: OutOfStockFilter) =>
    apiClient.get<PaginatedResponse<LowStockProduct>>('/inventory/out-of-stock', filters);