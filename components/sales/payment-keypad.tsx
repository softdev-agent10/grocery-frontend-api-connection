/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import { setKeyInput as setReduxKeyInput } from "@/features/sales/sales-slice";

interface PaymentKeypadProps {
    subtotal: number;
    total: number;
    hasItems: boolean;
    onSetDiscount: (percent: number) => void;
    onSetTax: (percent: number) => void;
    onAction: (type: string, data?: any) => void;
    showNotification: (message: string, type: 'success' | 'error') => void;
}

export default function PaymentKeypad({
    subtotal,
    total,
    hasItems,
    onSetDiscount,
    onSetTax,
    onAction,
    showNotification
}: PaymentKeypadProps) {
    const dispatch = useAppDispatch();
    const keyInput = useAppSelector(state => state.sales.keyInput);

    const setKeyInput = (val: string | ((prev: string) => string)) => {
        const newVal = typeof val === 'function' ? val(keyInput) : val;
        dispatch(setReduxKeyInput(newVal));
    };

    const formatDisplay = (input: string) => {
        if (!input) return "0.00";
        const numeric = input;
        const cents = parseInt(numeric || "0", 10);
        const formatted = (cents / 100).toFixed(2);
        return formatted;
    };

    const addDigit = (d: string) => {
        setKeyInput(prev => {
            // Prevent leading zeros if the current value is 0
            if (prev === "0") return d;
            return prev + d;
        });
    };

    const addDoubleZero = () => {
        setKeyInput(prev => {
            if (!prev || prev === "0") return "0";
            return prev + "00";
        });
    };

    const addTripleZero = () => {
        setKeyInput(prev => {
            if (!prev || prev === "0") return "0";
            return prev + "000";
        });
    };

    const addQuickAmount = (amount: number) => {
        setKeyInput(prev => {
            const numeric = prev;
            const currentCents = parseInt(numeric || "0", 10);
            const amountCents = amount * 100;
            const nextCents = currentCents + amountCents;
            return String(nextCents);
        });
    };

    const backspace = () => {
        setKeyInput(prev => prev.length <= 1 ? "" : prev.slice(0, -1));
    };
    const clearInput = () => {
        setKeyInput("");
    };

    const handleCashPayment = () => {
        if (!hasItems) {
            showNotification("Cart is empty! Add products first.", 'error');
            return;
        }

        const cashValue = parseFloat(formatDisplay(keyInput));
        if (cashValue < total) {
            showNotification(`Insufficient amount! Minimum needed: $${total.toFixed(2)}`, 'error');
            return;
        }
        onAction('Cash', { cashGiven: cashValue });
    };

    const parsePercentFromInput = () => {
        const raw = keyInput.trim();
        if (!raw) return null;
        const numeric = raw;
        const cents = parseInt(numeric || "0", 10);
        const value = cents / 100;

        if (isNaN(value) || subtotal <= 0) return null;
        const pct = (value / subtotal) * 100;
        return Math.max(0, Math.min(100, pct));
    };

    return (
        <div className="bg-white p-1 rounded flex flex-col h-full overflow-hidden shadow-inner border border-gray-100 relative">
            <div className="flex-1 flex flex-col gap-1 min-h-0">
                {/* Quick Add Buttons on Top for small screens/Nest Hub, Left for very large screens */}
                <div className="grid grid-cols-4 xl:hidden gap-1 shrink-0">
                    {[10, 50, 100, 200].map((amt) => (
                        <Button
                            key={amt}
                            variant="outline"
                            className="h-10 text-xl font-bold bg-[#22c55e] text-white border border-black hover:bg-[#16a34a] px-0.5"
                            onClick={() => addQuickAmount(amt)}
                        >
                            {amt}
                        </Button>
                    ))}
                </div>

                <div className="grid grid-cols-[1fr_auto_auto] gap-1 shrink-0">
                    <Input
                        value={formatDisplay(keyInput)}
                        readOnly
                        placeholder="0.00"
                        className="h-8 sm:h-12 xl:h-14 text-lg sm:text-xl! xl:text-3xl! font-bold bg-white text-black border-2 border-black focus-visible:ring-0 text-right"
                    />
                    <Button
                        variant="outline"
                        className="h-8 sm:h-12 xl:h-14 w-8 sm:w-12 xl:w-14 bg-gray-200 text-black border-2 border-black hover:bg-gray-300 p-0"
                        onClick={backspace}
                        aria-label="Backspace"
                    >
                        <X className="size-5 md:size-6 xl:size-8" strokeWidth={3} />
                    </Button>
                    <Button
                        variant="destructive"
                        className="h-8 sm:h-12 xl:h-14 w-8 sm:w-12 xl:w-14 text-sm sm:text-lg xl:text-2xl font-bold bg-[#ef4444] text-white border-2 border-black hover:bg-[#dc2626] p-0"
                        onClick={clearInput}
                        aria-label="All Clear"
                    >
                        AC
                    </Button>
                </div>
                <div className="flex-1 grid grid-cols-4 xl:grid-cols-5 gap-1 min-h-0">
                    {/* Quick Add Buttons on Left for very large screens */}
                    <div className="hidden xl:grid grid-rows-4 gap-1 h-full">
                        {[10, 50, 100, 200].map((amt) => (
                            <Button
                                key={amt}
                                variant="outline"
                                className="h-full text-xl xl:text-3xl font-bold bg-[#22c55e] text-white border-2 border-black hover:bg-[#16a34a] px-0.5"
                                onClick={() => addQuickAmount(amt)}
                            >
                                {amt}
                            </Button>
                        ))}
                    </div>
                    <div className="col-span-3 grid grid-cols-3 gap-1 h-full">
                        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "00", "000"].map((k) => (
                            <Button
                                key={k}
                                variant="outline"
                                className="h-full text-sm sm:text-xl xl:text-3xl font-extrabold border-2 border-black bg-white text-black hover:bg-gray-100 p-0"
                                onClick={() => {
                                    if (k === "000") addTripleZero();
                                    else if (k === "00") addDoubleZero();
                                    else addDigit(k);
                                }}
                            >
                                {k}
                            </Button>
                        ))}
                    </div>
                    <div className="grid grid-rows-4 gap-1 h-full">
                        <Button
                            variant="outline"
                            className="h-full text-[10px] sm:text-xs xl:text-xl font-bold bg-[#eab308] text-white border-2 border-black hover:bg-[#ca8a04] px-0.5"
                            onClick={() => onAction('Refund')}
                        >
                            Refund
                        </Button>
                        <Button
                            variant="outline"
                            className="h-full text-[10px] sm:text-xs xl:text-xl font-bold bg-[#eab308] text-white border-2 border-black hover:bg-[#ca8a04] px-0.5"
                            onClick={() => onAction('Discount')}
                        >
                            Discount
                        </Button>
                        <Button
                            variant="outline"
                            className="h-full text-[10px] sm:text-xs xl:text-xl font-bold bg-[#eab308] text-white border-2 border-black hover:bg-[#ca8a04] px-0.5"
                            onClick={() => onAction('Other')}
                        >
                            Other
                        </Button>
                        <Button
                            variant="outline"
                            className="h-full text-[10px] sm:text-xs xl:text-xl font-bold bg-[#eab308] text-white border-2 border-black hover:bg-[#ca8a04] px-0.5"
                            onClick={() => onAction('Credit Card')}
                        >
                            Card
                        </Button>
                    </div>
                </div>
                <div className="h-9 sm:h-11 xl:h-16 shrink-0">
                    <Button
                        className="w-full h-full text-sm sm:text-lg xl:text-3xl font-bold bg-[#22c55e] text-white border-2 border-black hover:bg-[#16a34a] rounded-lg p-1"
                        onClick={handleCashPayment}
                    >
                        Cash Payment
                    </Button>
                </div>
            </div>
        </div>
    );
}
