"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CartItemType } from "@/components/sales/cart-items";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { Order } from "./activity/order-history";
import { Loader2 } from "lucide-react";

interface CardPaymentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    items: CartItemType[];
    discountAmount: number;
    total: number;
    customerName?: string | null;
    onProcess: () => void;
    isLoading?: boolean;
    cashGiven?: number;

}

export default function CardPaymentModal({
    open,
    onOpenChange,
    items,
    discountAmount,
    total,
    customerName,
    onProcess,
    isLoading = false,
    cashGiven
}: CardPaymentModalProps) {

    return (
        <Dialog open={open} onOpenChange={(newOpen) => !isLoading && onOpenChange(newOpen)}>
            <DialogContent className="sm:max-w-125 p-0 overflow-hidden border-none rounded-3xl">
                <VisuallyHidden>
                    <DialogTitle>Card Payment</DialogTitle>
                </VisuallyHidden>

                {/* Header */}
                <div
                    className="py-8 text-center"
                    style={{ background: "linear-gradient(135deg, #2563eb 0%, #3b4fcf 55%, #4338ca 100%)" }}
                >
                    <h2 className="text-3xl font-bold text-white">Card Payment</h2>
                </div>

                <div className="p-6 space-y-6 bg-white">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="size-16 text-blue-600 animate-spin" />
                            <p className="text-lg font-semibold text-gray-700">Processing payment...</p>
                            <p className="text-sm text-gray-500">Please wait (5-10 seconds)</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 rounded-xl border p-3">
                                <div className="text-sm text-gray-500">Customer</div>
                                <div className="text-base font-semibold">
                                    {customerName || "Walk-in Customer"}
                                </div>
                            </div>
                            {/* Items List */}
                            <div className="space-y-2 max-h-50 overflow-y-auto pr-2 custom-scrollbar">
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
                                    <span className="text-xl font-medium text-gray-700">Discount:</span>
                                    <span className="text-xl font-bold text-red-500">
                                        ${discountAmount.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                {!isLoading && (
                    <div className="p-6 bg-gray-50 flex gap-4">
                        <Button
                            onClick={onProcess}
                            disabled={isLoading}
                            className="flex-1 py-6 text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
                            style={{ background: "linear-gradient(135deg, #2563eb 0%, #3b4fcf 55%, #4338ca 100%)" }}
                        >
                            Process & Print
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                            className="flex-1 py-6 text-lg font-bold rounded-2xl border-2 border-gray-200 hover:bg-gray-100 transition-all"
                        >
                            Cancel
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
