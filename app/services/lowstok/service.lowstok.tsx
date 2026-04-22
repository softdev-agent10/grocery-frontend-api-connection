import { apiClient } from '@/lib/apiClient';
import { LowStockProduct, PaginatedResponse } from '@/lib/types/api.types';

/**
 * Low stock filter options
 */
export interface LowStockFilter {
  page?: number;
  limit?: number;
  category_name?: string;
  brand_name?: string;
  search?: string;
  threshold?: 'critical' | 'warning' | 'all'; // Default: 'all'
  sort_by?: 'name' | 'selling_price' | 'quantity' | 'quantity_alert'; // Default: 'name'
  sort_order?: 'asc' | 'desc'; // Default: 'asc'
}

/**
 * Get low stock products with filters
 */
export const getLowStocks = (filters?: LowStockFilter) =>
  apiClient.get<PaginatedResponse<LowStockProduct>>('/inventory/low-stock', filters);