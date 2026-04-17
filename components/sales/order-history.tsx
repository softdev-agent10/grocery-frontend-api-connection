"use client";

import { useState, useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { ChevronRight, Calendar, User, CreditCard, Receipt, Printer, RotateCcw, Search, X, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface OrderItem {
    id: string;
    name: string;
    price: number;
    qty: number;
    stock: number;
    discountValue?: number;
    discountType?: 'percentage' | 'flat';
}

export interface Order {
    id: string;
    date: string;
    customer: string;
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

export interface CardOrder {
    id: string;
    date: string;
    customer: string;
    total: number;
    paymentMethod: string;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    discount: number;
    cashGiven?: number;
    change?: number;
    isRefunded?: boolean;
}

interface OrderHistoryProps {
    orders: Order[];
    onClose: () => void;
    onReprint: (order: Order) => void;
    onRefund: (order: Order) => void;
}

export default function OrderHistory({ orders, onClose, onReprint, onRefund }: OrderHistoryProps) {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [filterDate, setFilterDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [searchQuery, setSearchQuery] = useState("");

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesDate = isSameDay(order.date, new Date(filterDate));
            const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.customer.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesDate && matchesSearch;
        });
    }, [orders, filterDate, searchQuery]);

    return (
        <div className="flex flex-col h-full w-full bg-white overflow-hidden">
            {/* Custom Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <History className="size-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold uppercase tracking-tight">Order History</h2>
                        <p className="text-blue-100 text-xs font-medium">View and manage past transactions</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                    <X className="size-6" />
                </button>
            </div>

            {/* Filter Bar */}
            <div className="p-4 bg-gray-50 border-b flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 shadow-sm">
                    <Calendar className="size-4 text-gray-400" />
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="outline-none text-sm font-semibold text-gray-700"
                    />
                </div>
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                        placeholder="Search by Order ID or Customer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10 border-gray-200 focus:ring-blue-500 rounded-lg"
                    />
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Side: Order List */}
                <div className={`w-full xl:w-[350px] flex flex-col min-h-0 border-r ${selectedOrder ? 'hidden xl:flex' : 'flex'}`}>
                    <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <div
                                    key={order.id}
                                    onClick={() => setSelectedOrder(order)}
                                    className={`p-4 border-b cursor-pointer transition-all hover:bg-blue-50/50 ${selectedOrder?.id === order.id ? 'bg-blue-50 border-l-4 border-l-blue-600 pl-3' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-blue-600 truncate max-w-[180px]">{order.id}</span>
                                            {order.isRefunded && (
                                                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-full w-fit mt-1">
                                                    Refunded
                                                </span>
                                            )}
                                        </div>
                                        <span className="font-black text-gray-900">${order.total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <User className="size-3" />
                                            <span className="font-medium truncate max-w-[120px]">{order.customer}</span>
                                        </div>
                                        <span>{format(order.date, "h:mm a")}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400">
                                <div className="p-4 bg-gray-50 rounded-full mb-3">
                                    <Receipt className="size-8 opacity-20" />
                                </div>
                                <p className="text-sm font-medium">No orders found for this date</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Order Details */}
                <div className={`flex-1 flex flex-col min-h-0 bg-gray-50/50 ${selectedOrder ? 'flex' : 'hidden xl:flex items-center justify-center'}`}>
                    {selectedOrder ? (
                        <>
                            <div className="p-4 bg-white border-b flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="xl:hidden p-0 h-auto"
                                        onClick={() => setSelectedOrder(null)}
                                    >
                                        <ChevronRight className="rotate-180 size-5" />
                                    </Button>
                                    <h3 className="font-bold text-lg flex items-center gap-2 text-gray-800">
                                        <Receipt className="size-5 text-blue-600" />
                                        Order Details
                                    </h3>
                                </div>
                                <div className="flex flex-col items-end min-w-0 ml-4">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate max-w-[120px] sm:max-w-[200px] xl:max-w-none">{selectedOrder.id}</span>
                                    {selectedOrder.isRefunded && <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-0.5">Transaction Refunded</span>}
                                    <span className="text-[10px] font-medium text-gray-400">{format(selectedOrder.date, "MMM d, yyyy h:mm a")}</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6 custom-scrollbar">
                                {/* Summary Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm min-w-0">
                                        <p className="text-[10px] text-gray-400 uppercase font-black mb-1 tracking-widest">Customer</p>
                                        <p className="font-bold text-gray-800 truncate">{selectedOrder.customer}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                        <p className="text-[10px] text-gray-400 uppercase font-black mb-1 tracking-widest">Payment</p>
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="size-3 text-blue-500" />
                                            <p className="font-bold text-gray-800">{selectedOrder.paymentMethod}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50/80 text-[10px] text-gray-400 uppercase font-black">
                                            <tr>
                                                <th className="p-4 tracking-widest">Item Description</th>
                                                <th className="p-4 text-center tracking-widest">Qty</th>
                                                <th className="p-4 text-right tracking-widest">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {selectedOrder.items.map((item) => {
                                                const itemSubtotal = item.price * item.qty;
                                                const itemDiscount = item.discountType === "percentage"
                                                    ? (itemSubtotal * (item.discountValue || 0)) / 100
                                                    : (item.discountValue || 0);
                                                const itemTotal = itemSubtotal - itemDiscount;
                                                return (
                                                    <tr key={item.id} className="text-sm hover:bg-gray-50/50 transition-colors">
                                                        <td className="p-4 max-w-[200px]">
                                                            <p className="font-bold text-gray-800 truncate">{item.name}</p>
                                                            <p className="text-xs text-gray-400">${item.price.toFixed(2)} / unit</p>
                                                        </td>
                                                        <td className="p-4 text-center text-gray-600 font-medium">{item.qty}</td>
                                                        <td className="p-4 text-right font-black text-gray-900">${itemTotal.toFixed(2)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Totals */}
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-3">
                                    <div className="flex justify-between text-sm text-gray-500 font-medium">
                                        <span>Subtotal</span>
                                        <span>${selectedOrder.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-500 font-medium">
                                        <span>Tax</span>
                                        <span>${selectedOrder.tax.toFixed(2)}</span>
                                    </div>
                                    {selectedOrder.discount > 0 && (
                                        <div className="flex justify-between text-sm text-green-600 font-bold">
                                            <span>Discount</span>
                                            <span>-${selectedOrder.discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="pt-4 border-t border-dashed flex justify-between items-center">
                                        <span className="text-base font-black text-gray-900 uppercase tracking-tight">Total Amount</span>
                                        <span className="text-3xl font-black text-blue-600">${selectedOrder.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-white border-t flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                <Button
                                    className="flex-1 h-12 font-bold gap-2 rounded-xl border-2"
                                    variant="outline"
                                    onClick={() => onReprint(selectedOrder)}
                                >
                                    <Printer className="size-4" />
                                    Re-print
                                </Button>
                                <Button
                                    className={cn(
                                        "flex-1 h-12 font-bold gap-2 rounded-xl transition-all",
                                        selectedOrder.isRefunded
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-orange-500 hover:bg-orange-600 text-white"
                                    )}
                                    disabled={selectedOrder.isRefunded}
                                    onClick={() => onRefund(selectedOrder)}
                                >
                                    <RotateCcw className="size-4" />
                                    {selectedOrder.isRefunded ? "Refunded" : "Refund"}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-10 max-w-sm">
                            <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-12 inline-block mb-6">
                                <Receipt className="size-16 text-gray-200" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-300 uppercase tracking-tight mb-2">No Order Selected</h3>
                            <p className="text-gray-400 text-sm font-medium">Please select an order from the list on the left to view full transaction details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
