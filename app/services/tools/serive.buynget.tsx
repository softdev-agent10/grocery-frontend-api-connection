// services/buyNGet.service.ts

import { apiClient } from '@/lib/apiClient';
import { PaginatedResponse, SingleResponse } from '@/lib/types/api.types';

export interface BuyCondition {
    product_id: number;
    required_qty: number;
}

export interface RewardItem {
    product_id: number;
    reward_qty: number;
    reward_price_type: string;
    reward_value: number;
}

export interface BuyNGet {
    id: number;
    name: string;
    description: string;
    offer_type: string;
    pricing_mode: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    priority: number;
    offer_limit: number;
    buy_conditions: BuyCondition[];
    reward_items: RewardItem[];
}

/**
 * Get all Buy N Get offers
 */
export const getBuyNGet = (filters?: any) =>
    apiClient.get<PaginatedResponse<BuyNGet>>(
        '/tools/offers/buy-n-get',
        filters
    );

/**
 * Get single offer
 */
export const getBuyNGetById = (id: number) =>
    apiClient.get<SingleResponse<BuyNGet>>(
        `/tools/offers/buy-n-get/${id}`
    );

/**
 * Create offer
 */
export const createBuyNGet = (data: Partial<BuyNGet>) =>
    apiClient.post<SingleResponse<BuyNGet>>(
        '/tools/offers/buy-n-get',
        data
    );

/**
 * Update offer
 */
export const updateBuyNGet = (id: number, data: Partial<BuyNGet>) =>
    apiClient.patch<SingleResponse<BuyNGet>>(
        `/tools/offers/buy-n-get/${id}`,
        data
    );