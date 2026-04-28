"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  RotateCcw,
  X,
  Receipt,
  User,
  CreditCard,
  Calendar,
  CheckCircle2,
  History,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import {
  getHistory,
  getFullHistoryOrder,
  HistoryItem,
  FullHistoryOrder,
} from "@/app/services/history/service.history";
import { createRefund } from "@/app/services/refunds/service.refunds";

// import { createRefund } from "@/app/services/history/service.history";

interface RefundModalProps {
  refundOrders: HistoryItem[];
  onRefund: (order: any) => void;
  onClose: () => void;
}

export default function RefundModal({ onClose, onRefund, refundOrders }: RefundModalProps) {
  const [searchId, setSearchId] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [foundOrder, setFoundOrder] = useState<FullHistoryOrder | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadHistory = async () => {
    try {
      setIsLoadingHistory(true);

      const res = await getHistory({
        page: 1,
        per_page: 10,
        sort_by: "timestamp",
        order: "desc",
      });

      setHistory(res?.data?.items || []);
    } catch (err) {
      console.error("Failed to load refund history:", err);
      setError("Failed to load transaction history.");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSearch = async (
    e?: React.MouseEvent | React.KeyboardEvent
  ) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const keyword = searchId.trim().toLowerCase();

    if (!keyword) {
      setError("Please enter an order number or order ID.");
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      setSuccess(false);

      let match = history.find(
        (item) =>
          item.order_number?.toLowerCase() === keyword ||
          item.order_id?.toLowerCase() === keyword ||
          item.id?.toLowerCase() === keyword
      );

      if (!match) {
        const res = await getHistory({
          page: 1,
          per_page: 20,
          order_number: searchId.trim(),
          sort_by: "timestamp",
          order: "desc",
        });

        match = res?.data?.items?.[0];
      }

      if (!match) {
        setFoundOrder(null);
        setError("Order not found. Please check the ID and try again.");
        return;
      }

      if (match.transaction_status?.toLowerCase() === "refund") {
        setFoundOrder(null);
        setError("This transaction is already a refund record.");
        return;
      }

      const fullOrder = await getFullHistoryOrder(match);
      setFoundOrder(fullOrder);
    } catch (err) {
      console.error("Failed to search order:", err);
      setError("Failed to load order details.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleProcessRefund = async () => {
    if (!foundOrder) return;

    try {
      setIsProcessing(true);
      setError(null);

      const refundableItems = foundOrder.items.filter(
        (item) => item.product_id !== null && item.product_id !== undefined
      );

      if (refundableItems.length === 0) {
        setError("No refundable product found for this order.");
        return;
      }

      await Promise.all(
        refundableItems.map((item) =>
          createRefund({
            order_id: foundOrder.order_id,
            branch_id: "branch-id-placeholder",
            product_id: Number(item.product_id),
            quantity: Number(item.quantity),
          })
        )
      );

      setSuccess(true);
      setFoundOrder(null);
      setSearchId("");

      await loadHistory();
    } catch (err) {
      console.error("Failed to process refund:", err);
      setError("Failed to process refund.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="flex flex-col h-full w-full bg-white overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <RotateCcw className="size-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-tight">
              Process Refund
            </h2>
            <p className="text-blue-100 text-xs font-medium">
              Search and refund past transactions
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="size-6" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden p-6 gap-6">
        <div className="w-full xl:w-[400px] flex flex-col gap-6">
          <div className="space-y-4">
            <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-1">
              Find Transaction
            </label>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Enter Order ID / Order Number..."
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
                  className="pl-10 h-12 border-gray-200 focus:ring-blue-500 rounded-xl font-bold"
                />
              </div>

              <Button
                onClick={(e) => handleSearch(e)}
                disabled={isSearching}
                className="h-12 px-6 bg-blue-600 hover:bg-blue-700 font-bold rounded-xl shadow-lg shadow-blue-100"
              >
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>

            {error && (
              <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-1">
                {error}
              </p>
            )}
          </div>

          {success && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-emerald-50 rounded-[2.5rem] border-2 border-emerald-100 animate-in zoom-in duration-300">
              <div className="size-20 bg-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-emerald-200">
                <CheckCircle2 className="size-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-emerald-900 uppercase tracking-tight mb-2">
                Refund Complete
              </h3>
              <p className="text-emerald-700 font-medium">
                Refund stored successfully in refund and history.
              </p>
              <Button
                variant="outline"
                onClick={() => setSuccess(false)}
                className="mt-6 border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-xl font-bold"
              >
                Refund Another
              </Button>
            </div>
          )}

          {!foundOrder && !success && (
            <div className="flex-1 flex flex-col min-h-0 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 overflow-hidden">
              <div className="p-6 border-b bg-white flex items-center justify-between">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">
                  Transaction History
                </h3>
                <History className="size-4 text-gray-300" />
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {isLoadingHistory && (
                  <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest py-10">
                    Loading history...
                  </p>
                )}

                {!isLoadingHistory &&
                  history.map((order) => {
                    const isRefund =
                      order.transaction_status?.toLowerCase() === "refund";

                    return (
                      <div
                        key={order.id || order.order_id || order.order_number}
                        onClick={async () => {
                          if (isRefund) return;

                          try {
                            setError(null);
                            setSuccess(false);
                            setIsSearching(true);
                            const fullOrder = await getFullHistoryOrder(order);
                            setFoundOrder(fullOrder);
                          } catch (err) {
                            console.error(err);
                            setError("Failed to load order details.");
                          } finally {
                            setIsSearching(false);
                          }
                        }}
                        className={cn(
                          "p-4 bg-white rounded-2xl border-2 transition-all group",
                          isRefund
                            ? "opacity-60 grayscale border-gray-50 cursor-not-allowed"
                            : "border-gray-50 cursor-pointer hover:border-blue-200 hover:shadow-md"
                        )}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex flex-col">
                            <span className="font-bold text-blue-600 truncate max-w-[150px]">
                              {order.order_number}
                            </span>
                            <span className="text-[10px] font-medium text-gray-400">
                              {order.timestamp
                                ? format(new Date(order.timestamp), "h:mm a")
                                : "-"}
                            </span>
                          </div>

                          <div className="text-right">
                            <p className="font-black text-gray-900">
                              ${Number(order.total_amount || 0).toFixed(2)}
                            </p>

                            {isRefund && (
                              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-full">
                                Refund
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 truncate max-w-[180px]">
                            <User className="size-3" />
                            <span className="truncate">
                              {order.customer_name || "Walk-in Customer"}
                            </span>
                          </div>

                          {!isRefund && (
                            <ChevronRight className="size-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                          )}
                        </div>
                      </div>
                    );
                  })}

                {!isLoadingHistory && history.length === 0 && (
                  <div className="flex flex-col items-center justify-center text-center p-10 opacity-50">
                    <Receipt className="size-16 text-gray-200 mb-4" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
                      No transaction history
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {foundOrder && (
            <div className="flex-1 bg-gray-50 rounded-[2.5rem] p-6 border border-gray-100 flex flex-col gap-6 animate-in fade-in slide-in-from-left-4">
              <div className="space-y-4">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">
                  Transaction Summary
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] text-gray-400 uppercase font-black mb-1 tracking-widest">
                      Total Amount
                    </p>
                    <p className="text-2xl font-black text-gray-900">
                      ${foundOrder.total_amount.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] text-gray-400 uppercase font-black mb-1 tracking-widest">
                      Payment
                    </p>
                    <div className="flex items-center gap-2">
                      <CreditCard className="size-4 text-blue-600" />
                      <p className="font-bold text-gray-800">
                        {foundOrder.payments?.[0]?.method || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <User className="size-4" />
                    <span className="text-xs font-bold truncate">
                      {foundOrder.customer_name || "Walk-in Customer"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="size-4" />
                    <span className="text-xs font-bold">
                      {foundOrder.timestamp
                        ? format(
                          new Date(foundOrder.timestamp),
                          "MMM d, yyyy h:mm a"
                        )
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-auto space-y-3">
                <Button
                  onClick={handleProcessRefund}
                  disabled={isProcessing}
                  className="w-full h-14 font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100 active:scale-95"
                >
                  {isProcessing ? (
                    <RotateCcw className="size-5 animate-spin" />
                  ) : (
                    <RotateCcw className="size-5" />
                  )}
                  {isProcessing ? "Processing..." : "Confirm Refund"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setFoundOrder(null)}
                  className="w-full h-12 border-2 border-gray-200 text-gray-500 font-bold uppercase tracking-widest rounded-xl hover:bg-gray-100"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 flex flex-col overflow-hidden">
          {foundOrder ? (
            <>
              <div className="p-6 bg-white border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Receipt className="size-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-800">
                    Order Items
                  </h3>
                </div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                  {foundOrder.order_number}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <table className="w-full">
                  <thead className="text-[10px] text-gray-400 font-black uppercase tracking-widest border-b">
                    <tr>
                      <th className="text-left pb-4 px-4">
                        Item Description
                      </th>
                      <th className="text-center pb-4 px-4">Qty</th>
                      <th className="text-right pb-4 px-4">Total</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {foundOrder.items.map((item, index) => {
                      const price = Number(item.price || 0);
                      const qty = Number(item.quantity || 0);

                      return (
                        <tr
                          key={item.id || `${item.product_id}-${index}`}
                          className="text-sm hover:bg-white/50 transition-colors"
                        >
                          <td className="p-4 max-w-[250px]">
                            <p className="font-bold text-gray-800 truncate">
                              {item.product_name}
                            </p>
                            <p className="text-xs text-gray-400">
                              ${price.toFixed(2)} / unit
                            </p>
                          </td>

                          <td className="p-4 text-center font-bold text-gray-600">
                            {qty}
                          </td>

                          <td className="p-4 text-right font-black text-gray-900">
                            ${(price * qty).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-6 bg-white border-t space-y-2">
                <div className="flex justify-between text-xl font-black text-gray-900 pt-2 border-t border-dashed">
                  <span>Refund Amount</span>
                  <span className="text-blue-600">
                    ${foundOrder.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-50">
              <Receipt className="size-24 text-gray-200 mb-6" />
              <h3 className="text-2xl font-black text-gray-300 uppercase tracking-tight">
                Order Details
              </h3>
              <p className="text-gray-400 text-sm font-medium">
                Find an order to view its itemized breakdown here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}