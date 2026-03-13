"use client";

import React, { useState } from "react";
import { Smartphone, ChevronRight, LayoutGrid, X, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setPaymentMethod, setPaymentStatus } from "@/features/sales/sales-slice";

const CATEGORIES = [
    { id: "mfs", name: "MFS", icon: Smartphone, description: "Mobile Financial Services" },
    // Future categories can be added here
];

const MFS_SERVICES = [
    { id: "bkash", name: "bKash", color: "bg-[#D12053]" },
    { id: "nagad", name: "Nagad", color: "bg-[#F7941D]" },
    { id: "rocket", name: "Rocket", color: "bg-[#8C3494]" },
    { id: "upay", name: "Upay", color: "bg-[#FFD400]" },
    { id: "tap", name: "Tap", color: "bg-[#00AEEF]" },
    { id: "cellfin", name: "CellFin", color: "bg-[#005CAB]" },
];

export default function PaymentOtherModal({ onClose }: { onClose: () => void }) {
    const dispatch = useAppDispatch();
    const { paymentStatus, paymentMethod } = useAppSelector(state => state.sales);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const handleMFSPayment = (provider: string) => {
        dispatch(setPaymentMethod(provider));
        dispatch(setPaymentStatus('pending'));
    };

    return (
        <div className="flex flex-col h-full w-full bg-white overflow-hidden">
            {/* Header - Consistent with History */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <LayoutGrid className="size-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold uppercase tracking-tight">Other Payments</h2>
                        <p className="text-blue-100 text-xs font-medium">Select a payment category and provider</p>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                    <X className="size-6" />
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Side: Categories */}
                <div className={cn(
                    "w-full xl:w-[350px] flex flex-col border-r min-h-0",
                    selectedCategory ? "hidden xl:flex" : "flex"
                )}>
                    <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
                        <div className="p-4 space-y-2">
                            {CATEGORIES.map((cat) => {
                                const Icon = cat.icon;
                                return (
                                    <div
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={cn(
                                            "p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group",
                                            selectedCategory === cat.id 
                                                ? "bg-blue-50 border-blue-600 shadow-md" 
                                                : "bg-white border-gray-100 hover:border-blue-200 hover:bg-gray-50"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "p-3 rounded-xl transition-colors",
                                                selectedCategory === cat.id ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                                            )}>
                                                <Icon className="size-6" />
                                            </div>
                                            <div>
                                                <p className={cn("font-black uppercase tracking-tight", selectedCategory === cat.id ? "text-blue-700" : "text-gray-700")}>
                                                    {cat.name}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{cat.description}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className={cn("size-5 transition-transform", selectedCategory === cat.id ? "text-blue-600 translate-x-1" : "text-gray-300")} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Side: Options */}
                <div className={cn(
                    "flex-1 flex flex-col min-h-0 bg-gray-50/50",
                    selectedCategory ? "flex" : "hidden xl:flex items-center justify-center"
                )}>
                    {selectedCategory ? (
                        <>
                            {/* Sub-header for Mobile Navigation */}
                            <div className="p-4 bg-white border-b flex items-center gap-3 xl:hidden shadow-sm">
                                <button 
                                    onClick={() => setSelectedCategory(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <ChevronRight className="rotate-180 size-6 text-gray-600" />
                                </button>
                                <h3 className="font-black text-gray-800 uppercase tracking-tight">Select Provider</h3>
                            </div>

                            <div className="flex-1 overflow-y-auto min-h-0 p-6 custom-scrollbar">
                                {selectedCategory === "mfs" && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                        {MFS_SERVICES.map((service) => (
                                            <button
                                                key={service.id}
                                                disabled={paymentStatus !== 'idle'}
                                                className={cn(
                                                    "group flex flex-col items-center justify-center gap-4 p-6 rounded-[2.5rem] border-2 transition-all relative overflow-hidden shadow-sm",
                                                    paymentMethod === service.id 
                                                        ? (paymentStatus === 'success' ? "border-emerald-500 bg-emerald-50" : "border-blue-500 bg-blue-50")
                                                        : "border-white bg-white hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-100 active:scale-95",
                                                    paymentStatus !== 'idle' && paymentMethod !== service.id && "opacity-50 grayscale"
                                                )}
                                                onClick={() => handleMFSPayment(service.id)}
                                            >
                                                <div className={cn(
                                                    "size-20 rounded-3xl flex items-center justify-center p-4 shadow-lg group-hover:scale-110 transition-transform",
                                                    service.color
                                                )}>
                                                    <div className="text-white font-black text-xs text-center uppercase leading-none">
                                                        {service.name}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="font-black text-gray-700 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                                        {service.name}
                                                    </span>
                                                    {paymentMethod === service.id && (
                                                        <div className="flex items-center gap-1.5">
                                                            {paymentStatus === 'pending' ? (
                                                                <>
                                                                    <Loader2 className="size-3 text-blue-600 animate-spin" />
                                                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Pending</span>
                                                                </>
                                                            ) : paymentStatus === 'success' ? (
                                                                <>
                                                                    <CheckCircle2 className="size-3 text-emerald-600" />
                                                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Success</span>
                                                                </>
                                                            ) : null}
                                                        </div>
                                                    )}
                                                </div>

                                                {paymentStatus === 'idle' && (
                                                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="size-2 bg-blue-500 rounded-full" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-10 max-w-sm">
                            <div className="bg-white border-2 border-dashed border-gray-200 rounded-[3rem] p-12 inline-block mb-6 shadow-inner">
                                <LayoutGrid className="size-16 text-gray-200" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-300 uppercase tracking-tight mb-2">Select Category</h3>
                            <p className="text-gray-400 text-sm font-medium">Choose a payment category from the left to view available providers.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
