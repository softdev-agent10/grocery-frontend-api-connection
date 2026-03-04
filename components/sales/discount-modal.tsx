"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DiscountModalProps {
    onConfirm: (type: "percentage" | "flat", value: number) => void;
    onCancel: () => void;
    initialType?: "percentage" | "flat";
    initialValue?: number;
}

export default function DiscountModal({
    onConfirm,
    onCancel,
    initialType = "percentage",
    initialValue = 0
}: DiscountModalProps) {
    const [type, setType] = useState<"percentage" | "flat">(initialType);
    const [value, setValue] = useState<string>(
        type === "flat" ? initialValue.toFixed(2) : initialValue.toString()
    );

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    const handleBlur = () => {
        if (type === "flat") {
            const num = parseFloat(value);
            if (!isNaN(num)) {
                setValue(num.toFixed(2));
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numValue = parseFloat(value) || 0;
        onConfirm(type, numValue);
    };

    return (
        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Header */}
            <div 
                className="py-8 text-center"
                style={{ background: "linear-gradient(135deg, #2563eb 0%, #3b4fcf 55%, #4338ca 100%)" }}
            >
                <h2 className="text-3xl font-bold text-white uppercase tracking-wider">Apply Discount</h2>
            </div>

            <div className="p-8 space-y-8">
                <div className="space-y-4">
                    <Label className="text-xl font-bold text-gray-800">Discount Type</Label>
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            type="button"
                            variant={type === "percentage" ? "default" : "outline"}
                            className={`h-16 text-xl font-bold rounded-2xl transition-all ${
                                type === "percentage" 
                                ? "bg-blue-600 text-white shadow-lg scale-[1.02]" 
                                : "border-2 border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                            onClick={() => {
                                setType("percentage");
                                // Optional: convert value to integer-like string for percentage
                                const num = parseFloat(value);
                                if (!isNaN(num)) setValue(num.toString());
                            }}
                        >
                            Percentage (%)
                        </Button>
                        <Button
                            type="button"
                            variant={type === "flat" ? "default" : "outline"}
                            className={`h-16 text-xl font-bold rounded-2xl transition-all ${
                                type === "flat" 
                                ? "bg-blue-600 text-white shadow-lg scale-[1.02]" 
                                : "border-2 border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                            onClick={() => {
                                setType("flat");
                                const num = parseFloat(value);
                                if (!isNaN(num)) setValue(num.toFixed(2));
                            }}
                        >
                            Flat Amount ($)
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="text-xl font-bold text-gray-800">
                        {type === "percentage" ? "Enter Percentage" : "Enter Amount"}
                    </Label>
                    <div className="relative group">
                        <Input
                            type="number"
                            step={type === "flat" ? "0.01" : "1"}
                            value={value}
                            onChange={handleValueChange}
                            onBlur={handleBlur}
                            className="h-20 text-4xl! font-black border-4 border-gray-100 focus:border-blue-500 rounded-2xl pr-24 pl-8 transition-all bg-gray-50/50"
                            placeholder="0.00"
                            autoFocus
                        />
                        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-6xl font-black text-gray-300 group-focus-within:text-blue-500 transition-colors">
                            {type === "percentage" ? "%" : "$"}
                        </span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button 
                        onClick={handleSubmit}
                        className="flex-1 py-6 text-2xl font-black text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 active:translate-y-0"
                        style={{ background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" }}
                    >
                        Apply Discount
                    </Button>
                    <Button 
                        onClick={onCancel}
                        className="flex-1 py-6 text-2xl font-black text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 active:translate-y-0"
                        style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}
                    >
                        Cancel Discount
                    </Button>
                </div>
            </div>
        </div>
    );
}
