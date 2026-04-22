import { apiClient } from '@/lib/apiClient';

// Types
export interface CashInPayload {
    amount: number;
    note?: string;
    quantity: number;
    device_id: string;
}

export interface CashInResponse {
    status: string;
    data: any;
    message?: string;
}

// API Functions
export const createCashIn = (data: CashInPayload) => {
    return apiClient.post<CashInResponse>('/tools/cashin', data);
};

// Helper Functions
export const validateCashIn = (amount: number): string | null => {
    if (!amount || amount <= 0) {
        return "Amount must be greater than 0";
    }
    
    if (amount < 0.01) {
        return "Minimum amount is 0.01";
    }
    
    return null;
};