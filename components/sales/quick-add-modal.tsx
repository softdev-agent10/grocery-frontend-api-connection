"use client";

import React, { useState } from "react";
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
        { id: Math.random().toString(), name: "", qty: 1, originalPrice: 0, customPrice: 0 }
    ]);

    const addItem = () => {
        setItems([...items, { id: Math.random().toString(), name: "", qty: 1, originalPrice: 0, customPrice: 0 }]);
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
        <div className="w-full max-w-4xl bg-white rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] p-8 relative">
                <div className="flex items-center gap-3">
                    <Zap className="size-8 text-white fill-white" />
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Quick Add</h2>
                        <p className="text-white/80 text-lg mt-1 font-medium italic">
                            Add multiple items with custom prices quickly
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-8 space-y-8">
                {/* Search Bar */}
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-6 text-gray-400 group-focus-within:text-[#6366f1] transition-colors" />
                    <Input 
                        placeholder="Search products by name or scan barcode..."
                        className="h-16 pl-14 pr-6 text-xl border-gray-200 focus:border-[#6366f1] focus:ring-0 rounded-2xl shadow-sm transition-all bg-gray-50/30"
                    />
                </div>

                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {items.map((item, index) => (
                        <div 
                            key={item.id}
                            className="grid grid-cols-12 gap-4 p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative"
                        >
                            <div className="col-span-12 lg:col-span-5 space-y-2">
                                <Label className="text-sm font-bold text-[#6366f1] uppercase tracking-wider ml-1">
                                    Product Name
                                </Label>
                                <Input 
                                    value={item.name}
                                    onChange={(e) => updateItem(item.id, "name", e.target.value)}
                                    placeholder="Enter name or leave blank for 'Custom Product'"
                                    className="h-14 text-lg rounded-xl border-gray-200 focus:border-[#6366f1]"
                                />
                            </div>
                            <div className="col-span-4 lg:col-span-2 space-y-2">
                                <Label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">
                                    Qty
                                </Label>
                                <Input 
                                    type="number"
                                    value={item.qty}
                                    onChange={(e) => updateItem(item.id, "qty", parseInt(e.target.value) || 0)}
                                    className="h-14 text-center text-lg rounded-xl border-gray-200 focus:border-[#6366f1]"
                                />
                            </div>
                            <div className="col-span-4 lg:col-span-2 space-y-2">
                                <Label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">
                                    Original Price
                                </Label>
                                <div className="h-14 flex items-center justify-center bg-gray-50/50 rounded-xl border border-gray-200 text-gray-400 font-medium text-lg">
                                    {item.originalPrice.toFixed(2)}
                                </div>
                            </div>
                            <div className="col-span-4 lg:col-span-2 space-y-2">
                                <Label className="text-sm font-bold text-[#6366f1] uppercase tracking-wider ml-1 flex items-center gap-1">
                                    Custom Price <span className="text-red-500">*</span>
                                </Label>
                                <Input 
                                    type="number"
                                    value={item.customPrice || ""}
                                    onChange={(e) => updateItem(item.id, "customPrice", parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    className="h-14 text-center text-lg rounded-xl border-2 border-[#6366f1]/30 focus:border-[#6366f1] font-bold"
                                />
                            </div>
                            <div className="col-span-12 lg:col-span-1 flex items-end justify-center lg:pb-1">
                                <button 
                                    onClick={() => removeItem(item.id)}
                                    className="p-3 text-red-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-xl"
                                    disabled={items.length === 1}
                                >
                                    <Trash2 className="size-7" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Another Item Button */}
                <button 
                    onClick={addItem}
                    className="w-full py-5 border-2 border-dashed border-[#6366f1]/30 hover:border-[#6366f1] text-[#6366f1] font-bold text-lg rounded-3xl transition-all hover:bg-[#6366f1]/5 flex items-center justify-center gap-3 group"
                >
                    <Plus className="size-6 transition-transform group-hover:scale-110" />
                    <span>Add Another Item</span>
                </button>
            </div>

            {/* Footer */}
            <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xl font-semibold text-gray-400">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
                <div className="flex gap-4">
                    <Button 
                        onClick={onCancel}
                        variant="outline"
                        className="h-14 px-10 text-xl font-bold text-gray-500 border-gray-200 hover:bg-white rounded-2xl shadow-sm"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConfirm}
                        className="h-14 px-10 text-xl font-bold bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 border-0"
                    >
                        <ShoppingCart className="size-6" />
                        <span>Add to Cart</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
