import { apiClient } from "@/lib/apiClient";
import { PaginatedResponse, SingleResponse } from "@/lib/types/api.types";

/* ---------- ORDERS ---------- */

export interface Order {
  id: string;
  order_number: string;
  reference_id?: string | null;
  transaction_status?: string | null;
}

export interface OrderFilter {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  order?: string;
}

export interface OrderPayload {
  total_amount: number;
  card_type?: string;
  card_number?: string;
  cash_received?: number;
  change_given?: number;
  reference_id?: string;
  transaction_type?: string;
  terminals?: Record<string, Record<string, unknown>>;
  user_role?: string;

  customer_id?: number | string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
}

export const getOrders = (filters?: OrderFilter) =>
  apiClient.get<PaginatedResponse<Order>>("/register/orders", filters);

export const createOrder = (data: OrderPayload) =>
  apiClient.post<SingleResponse<Order>>("/register/orders", data);

/* ---------- ORDER ITEMS ---------- */

export interface OrderItemPayload {
  product_id?: number | null;
  product_name: string;
  quantity: number;
  price: number;
  promotion_type?: "bundle" | "buy_n_get_offer" | null;
  promotion_source_id?: number | null;
  promotion_snapshot?: Record<string, unknown> | null;
}

export interface OrderItemsCreateBody {
  order_id: string;
  branch_id: string;
  items: OrderItemPayload[];
}

export interface OrderItemsCreateResponse {
  status: string;
  data: {
    order_id: string;
    items_created: number;
  };
}

export const createOrderItems = (data: OrderItemsCreateBody) =>
  apiClient.post<OrderItemsCreateResponse>("/register/order-items", data);

export const getOrderItems = (
  order_id: string,
  branch_id: string,
  include_promotions = false
) =>
  apiClient.get("/register/order-items", {
    order_id,
    branch_id,
    include_promotions,
  });

/* ---------- ORDER PAYMENTS ---------- */

export type PaymentMethod =
  | "cash"
  | "card"
  | "customer_credit"
  | "membership_points"
  | "loyalty_points"
  | "gift_card";

export interface PaymentCreatePayload {
  method: string;
  amount: number;
}

export interface OrderPaymentsCreateBody {
  order_id: string;
  branch_id: string;
  payments: PaymentCreatePayload[];
  card_type?: string | null;
  card_number?: string | null;
  customer_id?: number | string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
}

export interface OrderPaymentsCreateResponse {
  status: string;
  data: {
    order_id: string;
    payments_created: number;
    balance: string;
  };
}

export const createOrderPayments = (data: OrderPaymentsCreateBody) =>
  apiClient.post<OrderPaymentsCreateResponse>("/register/order-payments", data);

export const getOrderPayments = (order_id: string, branch_id: string) =>
  apiClient.get("/register/order-payments", {
    order_id,
    branch_id,
  });