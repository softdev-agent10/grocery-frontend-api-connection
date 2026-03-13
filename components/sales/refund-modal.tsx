"use client";

import React, { useState } from "react";
import { Search, RotateCcw, X, Receipt, Printer, User, CreditCard, Calendar, CheckCircle2, History, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Order } from "./order-history";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface RefundModalProps {
    orders: Order[];
    onRefund: (order: Order) => void;
    onClose: () => void;
}

export default function RefundModal({ orders, onRefund, onClose }: RefundModalProps) {
    const [searchId, setSearchId] = useState("");
    const [foundOrder, setFoundOrder] = useState<Order | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSearch = (e?: React.MouseEvent | React.KeyboardEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setError(null);
        setSuccess(false);
        const order = orders.find(o => o.id.toLowerCase() === searchId.toLowerCase().trim());
        if (order) {
            setFoundOrder(order);
        } else {
            setFoundOrder(null);
            setError("Order not found. Please check the ID and try again.");
        }
    };

    const handleProcessRefund = () => {
        if (!foundOrder) return;
        setIsProcessing(true);
        
        // Simulate API call
        setTimeout(() => {
            onRefund(foundOrder);
            setIsProcessing(false);
            setSuccess(true);
            setFoundOrder(null);
            setSearchId("");
        }, 1500);
    };

    return (
        <div 
            className="flex flex-col h-full w-full bg-white overflow-hidden"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <RotateCcw className="size-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold uppercase tracking-tight">Process Refund</h2>
                        <p className="text-blue-100 text-xs font-medium">Search and refund past transactions</p>
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
                {/* Left Side: Search & Found Order Summary */}
                <div className="w-full xl:w-[400px] flex flex-col gap-6">
                    <div className="space-y-4">
                        <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-1">Find Transaction</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                <Input 
                                    placeholder="Enter Order ID..."
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                                    className="pl-10 h-12 border-gray-200 focus:ring-blue-500 rounded-xl font-bold"
                                />
                            </div>
                            <Button 
                                onClick={(e) => handleSearch(e)}
                                className="h-12 px-6 bg-blue-600 hover:bg-blue-700 font-bold rounded-xl shadow-lg shadow-blue-100"
                            >
                                Search
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
                            <h3 className="text-2xl font-black text-emerald-900 uppercase tracking-tight mb-2">Refund Complete</h3>
                            <p className="text-emerald-700 font-medium">The transaction has been successfully refunded to the original payment method.</p>
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
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Recent Transactions</h3>
                                <History className="size-4 text-gray-300" />
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {orders.slice(0, 10).map((order) => (
                                    <div
                                        key={order.id}
                                        onClick={() => {
                                            setFoundOrder(order);
                                            setError(null);
                                        }}
                                        className={cn(
                                            "p-4 bg-white rounded-2xl border-2 cursor-pointer transition-all hover:border-blue-200 hover:shadow-md group",
                                            order.isRefunded ? "opacity-60 grayscale border-gray-50" : "border-gray-50"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-blue-600 truncate max-w-[150px]">{order.id}</span>
                                                <span className="text-[10px] font-medium text-gray-400">{format(order.date, "h:mm a")}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-gray-900">${order.total.toFixed(2)}</p>
                                                {order.isRefunded && (
                                                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-full">
                                                        Refunded
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 truncate max-w-[180px]">
                                                <User className="size-3" />
                                                <span className="truncate">{order.customer}</span>
                                            </div>
                                            <ChevronRight className="size-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                    </div>
                                ))}
                                {orders.length === 0 && (
                                    <div className="flex flex-col items-center justify-center text-center p-10 opacity-50">
                                        <Receipt className="size-16 text-gray-200 mb-4" />
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No recent transactions</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {foundOrder && (
                        <div className="flex-1 bg-gray-50 rounded-[2.5rem] p-6 border border-gray-100 flex flex-col gap-6 animate-in fade-in slide-in-from-left-4">
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Transaction Summary</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                        <p className="text-[10px] text-gray-400 uppercase font-black mb-1 tracking-widest">Total Amount</p>
                                        <p className="text-2xl font-black text-gray-900">${foundOrder.total.toFixed(2)}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                        <p className="text-[10px] text-gray-400 uppercase font-black mb-1 tracking-widest">Payment</p>
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="size-4 text-blue-600" />
                                            <p className="font-bold text-gray-800">{foundOrder.paymentMethod}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-2">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <User className="size-4" />
                                        <span className="text-xs font-bold truncate">{foundOrder.customer}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Calendar className="size-4" />
                                        <span className="text-xs font-bold">{format(foundOrder.date, "MMM d, yyyy h:mm a")}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto space-y-3">
                                <Button 
                                    onClick={handleProcessRefund}
                                    disabled={isProcessing || foundOrder.isRefunded}
                                    className={cn(
                                        "w-full h-14 font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3",
                                        foundOrder.isRefunded 
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100 active:scale-95"
                                    )}
                                >
                                    {isProcessing ? (
                                        <RotateCcw className="size-5 animate-spin" />
                                    ) : (
                                        <RotateCcw className="size-5" />
                                    )}
                                    {foundOrder.isRefunded ? "Already Refunded" : "Confirm Refund"}
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

                {/* Right Side: Order Items Details */}
                <div className="flex-1 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 flex flex-col overflow-hidden">
                    {foundOrder ? (
                        <>
                            <div className="p-6 bg-white border-b flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <Receipt className="size-5 text-blue-600" />
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-800">Order Items</h3>
                                </div>
                                <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{foundOrder.id}</span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                <table className="w-full">
                                    <thead className="text-[10px] text-gray-400 font-black uppercase tracking-widest border-b">
                                        <tr>
                                            <th className="text-left pb-4 px-4">Item Description</th>
                                            <th className="text-center pb-4 px-4">Qty</th>
                                            <th className="text-right pb-4 px-4">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {foundOrder.items.map((item) => (
                                            <tr key={item.id} className="text-sm hover:bg-white/50 transition-colors">
                                                <td className="p-4 max-w-[250px]">
                                                    <p className="font-bold text-gray-800 truncate">{item.name}</p>
                                                    <p className="text-xs text-gray-400">${item.price.toFixed(2)} / unit</p>
                                                </td>
                                                <td className="p-4 text-center font-bold text-gray-600">{item.qty}</td>
                                                <td className="p-4 text-right font-black text-gray-900">
                                                    ${(item.price * item.qty).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-6 bg-white border-t space-y-2">
                                <div className="flex justify-between text-sm font-bold text-gray-500">
                                    <span>Subtotal</span>
                                    <span>${foundOrder.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-gray-500">
                                    <span>Tax</span>
                                    <span>${foundOrder.tax.toFixed(2)}</span>
                                </div>
                                {foundOrder.discount > 0 && (
                                    <div className="flex justify-between text-sm font-bold text-blue-600">
                                        <span>Discount</span>
                                        <span>-${foundOrder.discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xl font-black text-gray-900 pt-2 border-t border-dashed">
                                    <span>Refund Amount</span>
                                    <span className="text-blue-600">${foundOrder.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-50">
                            <Receipt className="size-24 text-gray-200 mb-6" />
                            <h3 className="text-2xl font-black text-gray-300 uppercase tracking-tight">Order Details</h3>
                            <p className="text-gray-400 text-sm font-medium">Find an order to view its itemized breakdown here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
