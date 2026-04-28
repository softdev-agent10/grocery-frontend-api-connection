import { apiClient } from "@/lib/apiClient";
import { getCustomers } from "../customer/service.customer";
// import { getCustomers } from "../tools/service.customer";
;
/* ---------- HISTORY LIST ---------- */

export interface HistoryFilter {
  page?: number;
  per_page?: number;
  order_number?: string;
  sort_by?: string;
  order?: "asc" | "desc";
  transaction_status?: string;
}

export interface HistoryItem {
  id?: string;
  order_id?: string;
  order_number: string;
  timestamp: string;
  total_amount: string;
  transaction_status: string;

  customer_id?: number | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
}

export interface HistoryPagination {
  current_page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
}

export interface HistoryResponse {
  status: string;
  data: {
    items: HistoryItem[];
    pagination: HistoryPagination;
    filters: Record<string, unknown>;
  };
}

export const getHistory = (filters?: HistoryFilter) =>
  apiClient.get<HistoryResponse>("/register/transaction-history", filters);

/* ---------- ORDER LOOKUP ---------- */

export interface OrderLookupItem {
  id: string;
  order_number: string;
  timestamp?: string;
  total_amount?: string | number;
  transaction_status?: string;

  customer_id?: number | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
}

export interface OrderLookupResponse {
  status: string;
  data: {
    items: OrderLookupItem[];
    pagination?: {
      current_page: number;
      per_page: number;
      total_items: number;
      total_pages: number;
    };
    filters?: Record<string, unknown>;
  };
}

export const getOrdersLookup = (filters?: {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  order?: "asc" | "desc";
}) =>
  apiClient.get<OrderLookupResponse>("/register/orders", filters);

export const resolveOrderRecord = async (
  order: HistoryItem
): Promise<OrderLookupItem | null> => {
  if (order.id) {
    return {
      id: order.id,
      order_number: order.order_number,
      timestamp: order.timestamp,
      total_amount: order.total_amount,
      transaction_status: order.transaction_status,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_email: order.customer_email,
    };
  }

  if (order.order_id) {
    return {
      id: order.order_id,
      order_number: order.order_number,
      timestamp: order.timestamp,
      total_amount: order.total_amount,
      transaction_status: order.transaction_status,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_email: order.customer_email,
    };
  }

  const res = await getOrdersLookup({
    page: 1,
    per_page: 100,
    search: order.order_number,
    sort_by: "timestamp",
    order: "desc",
  });

  const found = res?.data?.items?.find(
    (item) => item.order_number === order.order_number
  );

  return found || null;
};

/* ---------- ORDER ITEMS ---------- */

export interface HistoryOrderItem {
  product: any;
  id?: string;
  order_id?: string;
  product_id?: number | null;
  product_name: string;
  quantity: number;
  price: number | string;
  promotion_type?: "bundle" | "buy_n_get_offer" | null;
  promotion_source_id?: number | null;
  promotion_snapshot?: Record<string, unknown> | null;
}

export interface OrderItemsResponse {
  status: string;
  data: {
    items: HistoryOrderItem[];
  } | HistoryOrderItem[];
}

export const getHistoryOrderItems = (
  order_id: string,
  include_promotions = true
) =>
  apiClient.get<OrderItemsResponse>("/register/order-items", {
    order_id,
    include_promotions,
  });

/* ---------- ORDER PAYMENTS ---------- */

export interface HistoryOrderPayment {
  id?: string;
  order_id?: string;
  method: string;
  amount: number | string;
  card_type?: string | null;
  card_number?: string | null;
}

export interface OrderPaymentsResponse {
  status: string;
  data: {
    items: HistoryOrderPayment[];
  } | HistoryOrderPayment[];
}

export const getHistoryOrderPayments = (order_id: string) =>
  apiClient.get<OrderPaymentsResponse>("/register/order-payments", {
    order_id,
  });

/* ---------- HELPER ---------- */

export interface FullHistoryOrder {
  order_id: string;
  order_number: string;
  timestamp: string;
  total_amount: number;
  transaction_status: string;

  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;

  items: HistoryOrderItem[];
  payments: HistoryOrderPayment[];
}

export const getFullHistoryOrder = async (
  order: HistoryItem
): Promise<FullHistoryOrder> => {
  const orderRecord = await resolveOrderRecord(order);

  if (!orderRecord?.id) {
    throw new Error(`Order ID not found for order number: ${order.order_number}`);
  }

  const [itemsRes, paymentsRes] = await Promise.all([
    getHistoryOrderItems(orderRecord.id, true),
    getHistoryOrderPayments(orderRecord.id),
  ]);

  const rawItems = Array.isArray(itemsRes?.data)
    ? itemsRes.data
    : itemsRes?.data?.items || [];

  const items = rawItems.map((item: any) => ({
    ...item,
    product_id:
      item.product_id ??
      item.product?.id ??
      item.product?.product_id ??
      null,
  }));

  const payments = Array.isArray(paymentsRes?.data)
    ? paymentsRes.data
    : paymentsRes?.data?.items || [];

  let customer_name =
    order.customer_name ?? orderRecord.customer_name ?? null;
  let customer_phone =
    order.customer_phone ?? orderRecord.customer_phone ?? null;
  let customer_email =
    order.customer_email ?? orderRecord.customer_email ?? null;

  const normalizedCustomerName =
    typeof customer_name === "string" &&
      customer_name.trim().toLowerCase() === "walk-in customer"
      ? null
      : customer_name;


  const customerId =
    (order as any).customer_id ?? (orderRecord as any).customer_id ?? null;

  if (customerId) {
    try {
      const customerRes = await getCustomers({
        page: 1,
        limit: 50,
        search: String(customerId),
      });

      const customers = customerRes?.data?.items || [];

      const matchedCustomer = customers.find(
        (customer: any) => Number(customer.id) === Number(customerId)
      );

      if (matchedCustomer) {
        customer_name = matchedCustomer.name ?? customer_name;
        customer_phone = matchedCustomer.phone_number ?? customer_phone;
        customer_email = matchedCustomer.email ?? customer_email;
      }
    } catch (error) {
      console.error("Failed to fetch customer details:", error);
    }
  }

  return {
    order_id: orderRecord.id,
    order_number: order.order_number,
    timestamp: order.timestamp,
    total_amount: Number(order.total_amount) || 0,
    transaction_status: order.transaction_status,
    customer_name: normalizedCustomerName,
    customer_phone,
    customer_email,
    items,
    payments,
  };
};