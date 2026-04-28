import { apiClient } from '@/lib/apiClient';

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

export const createCashIn = (data: CashInPayload) => {
  return apiClient.post<CashInResponse>('/tools/cashin', data);
};

export const validateCashIn = (amount: number): string | null => {
  if (!amount || amount <= 0) {
    return "Amount must be greater than 0";
  }

  if (amount < 0.01) {
    return "Minimum amount is 0.01";
  }

  return null;
};

export const createCashOut = (data: CashInPayload) => {
  return apiClient.post<CashInResponse>('/tools/cashout', data);
};

export const validateCashOut = (amount: number): string | null => {
  if (!amount || amount <= 0) {
    return "Amount must be greater than 0";
  }

  if (amount < 0.01) {
    return "Minimum amount is 0.01";
  }

  return null;
};