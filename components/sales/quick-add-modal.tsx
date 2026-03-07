/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { X, Zap, Search, Trash2, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QuickAddItem {
    id: string;
    name: string;
    qty: number;
    originalPrice: number;
    customPrice: number;
}

interface QuickAddModalProps {
    onConfirm: (items: any[]) => void;
    onCancel: () => void;
}

export default function QuickAddModal({ onConfirm, onCancel }: QuickAddModalProps) {
    const [items, setItems] = useState<QuickAddItem[]>([
        { id: uuidv4(), name: "", qty: 1, originalPrice: 0, customPrice: 0 }
    ]);

    const addItem = () => {
        setItems([...items, { id: uuidv4(), name: "", qty: 1, originalPrice: 0, customPrice: 0 }]);
    };

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const updateItem = (id: string, field: keyof QuickAddItem, value: any) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleConfirm = () => {
        const itemsToConfirm = items.map(item => ({
            id: `misc-${item.id}`,
            name: item.name || "Custom Product",
            price: item.customPrice || 0,
            qty: item.qty || 1,
            promotion: undefined
        }));
        onConfirm(itemsToConfirm);
    };

    return (
        <div className="w-full max-w-[92vw] sm:max-w-xl md:max-w-2xl lg:max-w-4xl bg-white rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] p-4 sm:p-6 lg:p-8 relative">
                <div className="flex items-center gap-3">
                    <Zap className="size-6 sm:size-8 text-white fill-white" />
                    <div>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">Quick Add</h2>
                        <p className="text-white/80 text-sm sm:text-base lg:text-lg mt-1 font-medium italic">
                            Add multiple items with custom prices quickly
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                {/* Search Bar */}
                {/* <div className="relative group">
                    <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 size-5 sm:size-6 text-gray-400 group-focus-within:text-[#6366f1] transition-colors" />
                    <Input 
                        placeholder="Search products by name or scan barcode..."
                        className="h-10 sm:h-11 pl-10 sm:pl-12 pr-4 sm:pr-6 text-sm sm:text-base border-gray-200 focus:border-[#6366f1] focus:ring-0 rounded-2xl shadow-sm transition-all bg-gray-50/30"
                    />
                </div> */}

                <div className="space-y-4 sm:space-y-6 max-h-[60vh] sm:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {items.map((item, index) => (
                        <div 
                            key={item.id}
                            className="p-3 sm:p-4 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative md:flex md:items-start md:gap-3"
                        >
                            <div className="w-full md:flex-1 space-y-2">
                                <Label className="text-sm font-bold text-[#6366f1] uppercase tracking-wider ml-1">
                                    Product Name
                                </Label>
                                <Input 
                                    value={item.name}
                                    onChange={(e) => updateItem(item.id, "name", e.target.value)}
                                    placeholder="Enter name or leave blank for 'Custom Product'"
                                    className="h-10 sm:h-11 md:h-12 text-sm sm:text-base rounded-xl border-gray-200 focus:border-[#6366f1] w-full"
                                />
                            </div>
                            <div className="w-full md:w-[90px] space-y-2">
                                <Label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">
                                    Qty
                                </Label>
                                <Input 
                                    type="number"
                                    value={item.qty}
                                    onChange={(e) => updateItem(item.id, "qty", parseInt(e.target.value) || 0)}
                                    className="h-10 sm:h-11 md:h-12 text-center text-sm sm:text-base rounded-xl border-gray-200 focus:border-[#6366f1] w-full"
                                />
                            </div>
                            {/* <div className="w-full md:w-[110px] space-y-2">
                                <Label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">
                                    Original Price
                                </Label>
                                <div className="h-10 sm:h-11 md:h-12 flex items-center justify-center bg-gray-50/50 rounded-xl border border-gray-200 text-gray-400 font-medium text-sm sm:text-base w-full">
                                    {item.originalPrice.toFixed(2)}
                                </div>
                            </div> */}
                            <div className="w-full md:w-[140px] space-y-2">
                                <Label className="text-sm font-bold text-[#6366f1] uppercase tracking-wider ml-1 flex items-center gap-1">
                                    Custom Price <span className="text-red-500">*</span>
                                </Label>
                                <Input 
                                    type="number"
                                    value={item.customPrice || ""}
                                    onChange={(e) => updateItem(item.id, "customPrice", parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    className="h-10 sm:h-11 md:h-12 text-center text-sm sm:text-base rounded-xl border-2 border-[#6366f1]/30 focus:border-[#6366f1] font-bold w-full"
                                />
                            </div>
                            <div className="w-full md:w-[44px] flex items-end justify-center md:justify-end md:pb-1">
                                <button 
                                    onClick={() => removeItem(item.id)}
                                    className="p-2 sm:p-3 text-red-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-xl"
                                    disabled={items.length === 1}
                                >
                                    <Trash2 className="size-6 sm:size-7" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Another Item Button */}
                <button 
                    onClick={addItem}
                    className="w-full py-3 sm:py-4 border-2 border-dashed border-[#6366f1]/30 hover:border-[#6366f1] text-[#6366f1] font-bold text-base sm:text-lg rounded-3xl transition-all hover:bg-[#6366f1]/5 flex items-center justify-center gap-3 group"
                >
                    <Plus className="size-5 sm:size-6 transition-transform group-hover:scale-110" />
                    <span>Add Another Item</span>
                </button>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 lg:p-6 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs sm:text-sm lg:text-base font-semibold text-gray-400">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
                <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
                    <Button 
                        onClick={onCancel}
                        variant="outline"
                        className="h-9 sm:h-10 lg:h-11 px-6 sm:px-8 lg:px-10 text-sm sm:text-base lg:text-lg font-bold text-gray-500 border-gray-200 hover:bg-white rounded-2xl shadow-sm w-full sm:w-auto"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConfirm}
                        className="h-9 sm:h-10 lg:h-11 px-6 sm:px-8 lg:px-10 text-sm sm:text-base lg:text-lg font-bold bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 border-0 w-full sm:w-auto"
                    >
                        <ShoppingCart className="size-5 sm:size-6" />
                        <span>Add to Cart</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
