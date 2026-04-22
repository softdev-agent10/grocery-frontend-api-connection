import { apiClient } from '@/lib/apiClient';
import { PaginatedResponse } from '@/lib/types/api.types';

/**
 * Cash history item
 */
export interface CashHistoryItem {
    id: number;
    amount: string;
    note: string;
    timestamp: string;
    branch_id: string;
    device_id: number;
}

/**
 * Filters
 */
export interface CashFilter {
    page?: number;
    limit?: number;
    device_id?: number;
    search?: string;
    sort_by?: 'amount' | 'date';
    order?: 'asc' | 'desc';
}

/**
 * Cash In
 */
export const getCashIn = (filters?: CashFilter) =>
    apiClient.get<PaginatedResponse<CashHistoryItem>>(
        '/tools/cashin',
        filters
    );

/**
 * Cash Out
 */
export const getCashOut = (filters?: CashFilter) =>
    apiClient.get<PaginatedResponse<CashHistoryItem>>(
        '/tools/cashout',
        filters
    );