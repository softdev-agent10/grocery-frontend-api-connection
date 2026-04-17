"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CartItemType } from "@/components/sales/cart-items";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { Order } from "./order-history";

interface CashPaymentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    items: CartItemType[];
    discountAmount: number;
    total: number;
    cashGiven: number;
    onProcess: () => void;
}

export default function CashPaymentModal({
    open,
    onOpenChange,
    items,
    discountAmount,
    total,
    cashGiven,
    onProcess
}: CashPaymentModalProps) {
    const change = cashGiven - total;


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-3xl">
                <VisuallyHidden>
                    <DialogTitle>Cash Payment</DialogTitle>
                </VisuallyHidden>

                {/* Header */}
                <div
                    className="py-8 text-center"
                    style={{ background: "linear-gradient(135deg, #2563eb 0%, #3b4fcf 55%, #4338ca 100%)" }}
                >
                    <h2 className="text-3xl font-bold text-white">Cash Payment</h2>
                </div>

                <div className="p-6 space-y-6 bg-white">
                    {/* Items List */}
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100"
                            >
                                <span className="text-sm font-medium text-gray-600">
                                    {item.qty}x {item.name}
                                </span>
                                <span className="text-sm font-bold text-gray-800">
                                    ${(item.price * item.qty).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="h-px bg-gray-100 w-full" />

                    {/* Summary */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold text-gray-900">Total Bill:</span>
                            <span className="text-2xl font-extrabold text-gray-900">${total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xl font-medium text-gray-700">Cash Given:</span>
                            <span className="text-xl font-bold text-gray-700">{cashGiven.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xl font-medium text-gray-700">Discount:</span>
                            <span className="text-xl font-bold text-red-500">
                                ${discountAmount.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xl font-medium text-gray-700">Change:</span>
                            <span className="text-xl font-bold text-gray-700">${change.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 flex gap-4">
                    <Button
                        onClick={onProcess}
                        className="flex-1 py-6 text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
                        style={{ background: "linear-gradient(135deg, #2563eb 0%, #3b4fcf 55%, #4338ca 100%)" }}
                    >
                        Process & Print
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 py-6 text-lg font-bold rounded-2xl border-2 border-gray-200 hover:bg-gray-100 transition-all"
                    >
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
