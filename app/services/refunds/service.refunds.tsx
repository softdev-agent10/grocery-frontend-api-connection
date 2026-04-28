import { apiClient } from "@/lib/apiClient";
import { SingleResponse } from "@/lib/types/api.types";

export interface RefundFilter {
  order_id: string;
  branch_id?: string;
}

export interface RefundPayload {
  order_id: string;
  branch_id: string;
  product_id: number;
  quantity: number;
}

export interface RefundItem {
  refund_id: string;
  amount: string;
  refunded_at: string;
}

export interface Refund {
  refund_id: string;
  amount: string;
  refunded_at: string;
}

export interface RefundLookupResponse {
  status: string;
  data: {
    order: {
      id: string;
      order_number: string;
      total_amount: string;
    };
    refunds: RefundItem[];
    totals: {
      refunded: string;
      net_paid: string;
    };
  };
}

export const getRefunds = (filters: RefundFilter) =>
  apiClient.get<RefundLookupResponse>("/register/refunds", filters);

export const createRefund = (data: RefundPayload) =>
  apiClient.post<SingleResponse<Refund>>("/register/refunds", data);