"use client";

import { useEffect, useMemo, useState } from "react";
import { format, isSameDay, parseISO } from "date-fns";
import {
  ChevronRight,
  Calendar,
  User,
  CreditCard,
  Receipt,
  Printer,
  RotateCcw,
  Search,
  X,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/apiClient";
import {
  getHistory,
  getFullHistoryOrder,
  HistoryItem,
} from "@/app/services/history/service.history";
import { createRefund, getRefunds, Refund } from "@/app/services/refunds/service.refunds";
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  stock: number;
  discountValue?: number;
  discountType?: "percentage" | "flat";
}

export interface Order {
  id: string;
  date: string;
  customer: string;
  customerPhone?: string;
  customerEmail?: string;
  total: number;
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  cashGiven: number;
  change: number;
  isRefunded?: boolean;
}

interface OrderHistoryProps {
  ordersHistory: HistoryItem[];
  onClose: () => void;
  onReprint: (order: Order) => void;
  onRefund: (order: Order) => void;
}

const mapHistoryToOrder = (item: HistoryItem): Order => {
  const total = Number(item.total_amount) || 0;

  return {
    id: item.order_number,
    date: item.timestamp,
    customer: item.customer_name || "Walk-in Customer",
    customerPhone: item.customer_phone || "",
    customerEmail: item.customer_email || "",
    total,
    paymentMethod: "Unknown",
    items: [],
    subtotal: total,
    tax: 0,
    discount: 0,
    cashGiven: 0,
    change: 0,
    isRefunded:
      item.transaction_status?.toLowerCase() === "refunded" ||
      item.transaction_status?.toLowerCase() === "refund",
  };
};

export default function OrderHistory({
  ordersHistory,
  onClose,
  onReprint,
  onRefund,
}: OrderHistoryProps) {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [filterDate, setFilterDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(25);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRefundList, setShowRefundList] = useState(false);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [refundLoading, setRefundLoading] = useState(false);
  const branchId = apiClient.getContext().branchId;

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getHistory({
        page,
        per_page: perPage,
        order_number: searchQuery || undefined,
        sort_by: "timestamp",
        order: "desc",
        transaction_status:
          statusFilter === "refund_check"
            ? undefined
            : statusFilter || undefined,
      });

      const list = response?.data?.items || [];
      const mappedOrders = list.map(mapHistoryToOrder);

      setHistoryItems(list);
      setOrders(mappedOrders);
      setTotalPages(response?.data?.pagination?.total_pages || 1);

      if (mappedOrders.length > 0 && !selectedOrder) {
        setSelectedOrder(mappedOrders[0]);
      }

      if (
        selectedOrder &&
        !mappedOrders.find((order) => order.id === selectedOrder.id)
      ) {
        setSelectedOrder(mappedOrders[0] || null);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load order history");
      setHistoryItems([]);
      setOrders([]);
      setSelectedOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, perPage, searchQuery, statusFilter]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = parseISO(order.date);
      const matchesDate = isSameDay(orderDate, new Date(filterDate));

      // 👇 NEW LOGIC
      if (statusFilter === "refund_check") {
        return matchesDate && order.isRefunded;
      }

      return matchesDate;
    });
  }, [orders, filterDate, statusFilter]);

  const handleSelectOrder = async (order: Order) => {
    try {
      setDetailsLoading(true);
      setError("");

      const historyItem = historyItems.find(
        (item) => item.order_number === order.id
      );

      if (!historyItem) {
        setSelectedOrder(order);
        return;
      }

      const fullOrder = await getFullHistoryOrder(historyItem);

      // console.log("FULL ORDER:", fullOrder);

      const primaryPayment = fullOrder.payments?.[0];
      const paymentAmount = Number(primaryPayment?.amount) || 0;
      const totalAmount = Number(fullOrder.total_amount) || 0;
      const change =
        paymentAmount > totalAmount
          ? Number((paymentAmount - totalAmount).toFixed(2))
          : 0;

      setSelectedOrder({
        id: fullOrder.order_number,
        date: fullOrder.timestamp,
        customer: fullOrder.customer_name || "Walk-in Customer",
        customerPhone: fullOrder.customer_phone || "",
        customerEmail: fullOrder.customer_email || "",
        total: totalAmount,
        paymentMethod: primaryPayment?.method || "Unknown",
        items: fullOrder.items.map((item, index) => ({
          id: String(item.id ?? item.product_id ?? index),
          name: item.product_name,
          price: Number(item.price) || 0,
          qty: Number(item.quantity) || 0,
          stock: 0,
        })),
        subtotal: totalAmount,
        tax: 0,
        discount: 0,
        cashGiven: paymentAmount,
        change,
        isRefunded:
          fullOrder.transaction_status?.toLowerCase() === "refunded" ||
          fullOrder.transaction_status?.toLowerCase() === "refund",
      });
    } catch (err: any) {
      console.error("FAILED TO LOAD ORDER DETAILS:", err);
      setError(err?.message || "Failed to load order details");
      setSelectedOrder(order);
    } finally {
      setDetailsLoading(false);
    }

  };
  // refunds
  const handleRefund = async (order: Order) => {
    try {
      if (!order || order.isRefunded) return;

      setDetailsLoading(true);
      setError("");

      const historyItem = historyItems.find(
        (item) => item.order_number === order.id
      );

      if (!historyItem) throw new Error("Order history item not found");

      const fullOrder = await getFullHistoryOrder(historyItem);

      if (!fullOrder.order_id) throw new Error("Order ID not found");
      if (!branchId) throw new Error("Branch ID not found");
      if (!fullOrder.items.length) throw new Error("No items found for refund");

      // console.log("FULL ORDER ITEMS:", fullOrder.items);

      // ONLY VALID LOGIC
      const refundableItems = fullOrder.items.filter(
        (item: any) => item.product_id
      );

      if (!refundableItems.length) {
        throw new Error(
          "Refund failed: product_id missing from order items. Backend must include product_id."
        );
      }

      for (const item of refundableItems) {
        const payload = {
          order_id: fullOrder.order_id,
          branch_id: branchId,
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
        };

        // console.log("REFUND PAYLOAD:", payload);

        const response = await createRefund(payload);

        // console.log("REFUND RESPONSE:", response);
      }

      setSelectedOrder((prev) =>
        prev ? { ...prev, isRefunded: true } : prev
      );

      setOrders((prev) =>
        prev.map((item) =>
          item.id === order.id ? { ...item, isRefunded: true } : item
        )
      );

      await fetchHistory();

      alert("Refund completed successfully");
    } catch (err: any) {
      console.error("REFUND FAILED:", err);
      setError(err?.message || "Failed to process refund");
    } finally {
      setDetailsLoading(false);
    }
  };
  const fetchRefunds = async () => {
    try {
      setRefundLoading(true);
      setError("");

      if (!selectedOrder) {
        throw new Error("Please select an order first");
      }

      const historyItem = historyItems.find(
        (item) => item.order_number === selectedOrder.id
      );

      if (!historyItem) {
        throw new Error("Order not found");
      }

      const fullOrder = await getFullHistoryOrder(historyItem);
      // console.log("FULL ORDER:", fullOrder);


      const response = await getRefunds({
        order_id: fullOrder.order_id,
        branch_id: branchId,
      });

      setRefunds(response?.data?.refunds || []);
      setShowRefundList(true);
    } catch (err: any) {
      console.error("FAILED TO LOAD REFUNDS:", err);
      setError(err?.message || "Failed to load refund list");
    } finally {
      setRefundLoading(false);
    }
  };
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">
      <div className="border-b bg-linear-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/20 p-2">
              <History className="size-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-tight">
                Order History
              </h2>
              <p className="text-xs font-medium text-blue-100">
                View and manage past transactions
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="h-10 rounded-lg font-bold"
            onClick={fetchRefunds}
          >
            Refund List
          </Button>

          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-white/20"
          >
            <X className="size-6" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-b bg-gray-50 p-4">
        <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 shadow-sm">
          <Calendar className="size-4 text-gray-400" />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="text-sm font-semibold text-gray-700 outline-none"
          />
        </div>

        <div className="relative min-w-50 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by Order ID..."
            value={searchQuery}
            onChange={(e) => {
              setPage(1);
              setSearchQuery(e.target.value);
            }}
            className="h-10 rounded-lg border-gray-200 pl-10 focus:ring-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
          className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
          <option value="cancelled">Cancelled</option>
          <option value="refund_check">Refund Check</option>
        </select>
      </div>

      {error && (
        <div className="border-b bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`min-h-0 w-full flex-col border-r xl:w-87.5 ${selectedOrder ? "hidden xl:flex" : "flex"
            }`}
        >
          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex h-full items-center justify-center p-8 text-gray-400">
                Loading history...
              </div>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => handleSelectOrder(order)}
                  className={`cursor-pointer border-b p-4 transition-all hover:bg-blue-50/50 ${selectedOrder?.id === order.id
                    ? "border-l-4 border-l-blue-600 bg-blue-50 pl-3"
                    : ""
                    }`}
                >
                  <div className="mb-1 flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="max-w-45 truncate font-bold text-blue-600">
                        {order.id}
                      </span>
                      {order.isRefunded && (
                        <span className="mt-1 w-fit rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-red-500">
                          Refunded
                        </span>
                      )}
                    </div>
                    <span className="font-black text-gray-900">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="size-3" />
                      <span className="max-w-30 truncate font-medium">
                        {order.customer}
                      </span>
                    </div>
                    <span>{format(parseISO(order.date), "h:mm a")}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center text-gray-400">
                <div className="mb-3 rounded-full bg-gray-50 p-4">
                  <Receipt className="size-8 opacity-20" />
                </div>
                <p className="text-sm font-medium">
                  No orders found for this date
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t bg-white p-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Prev
            </Button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>

        <div
          className={`min-h-0 flex-1 flex-col bg-gray-50/50 ${selectedOrder
            ? "flex"
            : "hidden items-center justify-center xl:flex"
            }`}
        >
          {selectedOrder ? (
            <>
              <div className="border-b bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 xl:hidden"
                      onClick={() => setSelectedOrder(null)}
                    >
                      <ChevronRight className="size-5 rotate-180" />
                    </Button>
                    <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800">
                      <Receipt className="size-5 text-blue-600" />
                      Order Details
                    </h3>
                  </div>
                  <div className="ml-4 flex min-w-0 flex-col items-end">
                    <span className="max-w-30 truncate text-[10px] font-bold uppercase tracking-wider text-gray-400 sm:max-w-50 xl:max-w-none">
                      {selectedOrder.id}
                    </span>
                    {selectedOrder.isRefunded && (
                      <span className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-red-500">
                        Transaction Refunded
                      </span>
                    )}
                    <span className="text-[10px] font-medium text-gray-400">
                      {format(parseISO(selectedOrder.date), "MMM d, yyyy h:mm a")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="custom-scrollbar min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
                {detailsLoading && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
                    Loading order details...
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="min-w-0 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Customer
                    </p>
                    <p className="truncate font-bold text-gray-800">
                      {selectedOrder.customer}
                    </p>

                    {selectedOrder.customerPhone && (
                      <p className="mt-2 text-sm text-gray-600">
                        Phone: {selectedOrder.customerPhone}
                      </p>
                    )}

                    {selectedOrder.customerEmail && (
                      <p className="mt-1 break-all text-sm text-gray-600">
                        Email: {selectedOrder.customerEmail}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Payment
                    </p>
                    <div className="flex items-center gap-2">
                      <CreditCard className="size-3 text-blue-500" />
                      <p className="font-bold capitalize text-gray-800">
                        {selectedOrder.paymentMethod}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/80 text-[10px] font-black uppercase text-gray-400">
                      <tr>
                        <th className="p-4 tracking-widest">Item Description</th>
                        <th className="p-4 text-center tracking-widest">Qty</th>
                        <th className="p-4 text-right tracking-widest">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item) => {
                          const itemSubtotal = item.price * item.qty;
                          const itemDiscount =
                            item.discountType === "percentage"
                              ? (itemSubtotal * (item.discountValue || 0)) / 100
                              : item.discountValue || 0;
                          const itemTotal = itemSubtotal - itemDiscount;

                          return (
                            <tr
                              key={item.id}
                              className="text-sm transition-colors hover:bg-gray-50/50"
                            >
                              <td className="max-w-50 p-4">
                                <p className="truncate font-bold text-gray-800">
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  ${item.price.toFixed(2)} / unit
                                </p>
                              </td>
                              <td className="p-4 text-center font-medium text-gray-600">
                                {item.qty}
                              </td>
                              <td className="p-4 text-right font-black text-gray-900">
                                ${itemTotal.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="p-6 text-center text-sm text-gray-400"
                          >
                            No item details available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex justify-between text-sm font-medium text-gray-500">
                    <span>Subtotal</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-gray-500">
                    <span>Tax</span>
                    <span>${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm font-bold text-green-600">
                      <span>Discount</span>
                      <span>-${selectedOrder.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedOrder.cashGiven > 0 && (
                    <div className="flex justify-between text-sm font-medium text-gray-500">
                      <span>Cash Given</span>
                      <span>${selectedOrder.cashGiven.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedOrder.change > 0 && (
                    <div className="flex justify-between text-sm font-medium text-gray-500">
                      <span>Change</span>
                      <span>${selectedOrder.change.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-dashed pt-4">
                    <span className="text-base font-black uppercase tracking-tight text-gray-900">
                      Total Amount
                    </span>
                    <span className="text-3xl font-black text-blue-600">
                      ${selectedOrder.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 border-t bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <Button
                  className="h-12 flex-1 gap-2 rounded-xl border-2 font-bold"
                  variant="outline"
                  onClick={() => onReprint(selectedOrder)}
                >
                  <Printer className="size-4" />
                  Re-print
                </Button>
                <Button
                  className={cn(
                    "h-12 flex-1 gap-2 rounded-xl font-bold transition-all",
                    selectedOrder.isRefunded
                      ? "cursor-not-allowed bg-gray-100 text-gray-400"
                      : "bg-orange-500 text-white hover:bg-orange-600"
                  )}
                  disabled={selectedOrder.isRefunded}
                  onClick={() => handleRefund(selectedOrder)}
                >
                  <RotateCcw className="size-4" />
                  {selectedOrder.isRefunded ? "Refunded" : "Refund"}
                </Button>
              </div>
            </>
          ) : (
            <div className="max-w-sm p-10 text-center">
              <div className="mb-6 inline-block rounded-3xl border-2 border-dashed border-gray-200 bg-white p-12">
                <Receipt className="size-16 text-gray-200" />
              </div>
              <h3 className="mb-2 text-2xl font-black uppercase tracking-tight text-gray-300">
                No Order Selected
              </h3>
              <p className="text-sm font-medium text-gray-400">
                Please select an order from the list on the left to view full
                transaction details.
              </p>
            </div>
          )}
        </div>
      </div>
      {showRefundList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="text-lg font-black uppercase text-gray-800">
                Refund List
              </h3>

              <button
                onClick={() => setShowRefundList(false)}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="custom-scrollbar max-h-[60vh] overflow-y-auto p-5">
              {refundLoading ? (
                <p className="text-center text-sm text-gray-400">
                  Loading refunds...
                </p>
              ) : refunds.length > 0 ? (
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400">
                    <tr>
                      <th className="p-3">Refund ID</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-right">Refunded At</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {refunds.map((refund) => (
                      <tr key={refund.refund_id}>
                        <td className="p-3 font-bold text-blue-600">
                          {refund.refund_id}
                        </td>
                        <td className="p-3 text-right font-black">
                          ${Number(refund.amount).toFixed(2)}
                        </td>
                        <td className="p-3 text-right text-gray-500">
                          {format(parseISO(refund.refunded_at), "MMM d, yyyy h:mm a")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-sm text-gray-400">
                  No refunds found
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}