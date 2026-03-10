"use client";

import React, { useState, useEffect } from "react";
import { Minus, Plus, Trash2, X, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartItemType } from "./cart-items";

interface ItemPricingModalProps {
    item: CartItemType;
    onSave: (id: string, updates: Partial<CartItemType>) => void;
    onRemove: (id: string) => void;
    onCancel: () => void;
}

export default function ItemPricingModal({ item, onSave, onRemove, onCancel }: ItemPricingModalProps) {
    const [price, setPrice] = useState(item.price);
    const [qty, setQty] = useState(item.qty);
    const [discountValue, setDiscountValue] = useState(item.discountValue || 0);
    const [discountType, setDiscountType] = useState<'percentage' | 'flat'>(item.discountType || 'percentage');

    const subtotal = price * qty;
    const discountAmount = discountType === 'percentage' ? (subtotal * discountValue) / 100 : discountValue;
    const total = Math.max(0, subtotal - discountAmount);

    const handleSave = () => {
        onSave(item.id, {
            price,
            qty,
            discountValue,
            discountType
        });
    };

    return (
        <div className="bg-white rounded-3xl w-full max-w-lg mx-auto shadow-2xl overflow-hidden border border-gray-100">
            {/* Custom Header (Matching History Style) */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <Tag className="size-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold uppercase tracking-tight leading-tight">Item Pricing</h2>
                        <p className="text-blue-100 text-[10px] font-medium uppercase tracking-wider">Adjust price and discounts</p>
                    </div>
                </div>
                <button 
                    onClick={onCancel}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                    <X className="size-6" />
                </button>
            </div>

            <div className="p-6 space-y-6">
                {/* Item Name */}
                <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Item:</span>
                    <span className="text-gray-900 font-bold text-lg">{item.name}</span>
                </div>

                {/* Unit Price */}
                <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Unit Price:</span>
                    <div className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-xl min-w-[120px] text-center shadow-sm">
                        ${price.toFixed(2)}
                    </div>
                </div>

                {/* Discount Tabs */}
                <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Discount:</span>
                    <div className="flex bg-gray-100 p-1 rounded-xl w-1/2">
                        <button
                            onClick={() => setDiscountType('percentage')}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                discountType === 'percentage'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Percent
                        </button>
                        <button
                            onClick={() => setDiscountType('flat')}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                discountType === 'flat'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Flat
                        </button>
                    </div>
                </div>

                {/* Amount Input */}
                <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Amount:</span>
                    <div className="relative w-1/2">
                        <Input
                            type="number"
                            value={discountValue}
                            onChange={(e) => setDiscountValue(Number(e.target.value))}
                            className="text-center font-bold text-lg rounded-xl h-12 border-gray-200 focus:border-blue-500 pr-10"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                            {discountType === 'percentage' ? '%' : '$'}
                        </span>
                    </div>
                </div>

                {/* Quick Discount Buttons */}
                <div className="grid grid-cols-4 gap-2">
                    {[15, 20, 35, 0].map((val) => (
                        <button
                            key={val}
                            onClick={() => {
                                setDiscountValue(val);
                                setDiscountType('percentage');
                            }}
                            className={`py-2 rounded-xl font-bold text-sm transition-all border ${
                                discountValue === val && discountType === 'percentage'
                                    ? 'bg-blue-50 border-blue-600 text-blue-600 shadow-sm'
                                    : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {val === 0 ? 'None' : `${val}%`}
                        </button>
                    ))}
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Qty:</span>
                    <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-2xl border border-gray-100">
                        <button
                            onClick={() => setQty(Math.max(1, qty - 1))}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm"
                        >
                            <Minus className="size-5" strokeWidth={3} />
                        </button>
                        <input
                            type="number"
                            value={qty}
                            onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                            className="w-16 text-center font-bold text-xl bg-transparent border-none focus:ring-0"
                        />
                        <button
                            onClick={() => setQty(qty + 1)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm"
                        >
                            <Plus className="size-5" strokeWidth={3} />
                        </button>
                    </div>
                </div>

                {/* Adjusted Total */}
                <div className="flex items-center justify-between pt-2">
                    <span className="text-gray-500 font-medium">Adj. Total:</span>
                    <div className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-black text-2xl min-w-[140px] text-center shadow-md">
                        ${total.toFixed(2)}
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6 flex gap-3">
                    <Button
                        variant="destructive"
                        className="flex-1 h-14 rounded-2xl font-bold text-lg bg-red-500 hover:bg-red-600 shadow-md"
                        onClick={() => {
                            onRemove(item.id);
                            onCancel();
                        }}
                    >
                        <Trash2 className="mr-2 size-5" />
                        Remove
                    </Button>
                    
                    <Button
                        className="flex-[2] h-14 rounded-2xl font-bold text-xl bg-blue-700 hover:bg-blue-800 shadow-lg"
                        onClick={handleSave}
                    >
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
