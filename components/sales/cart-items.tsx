"use client";

import { Trash2 } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

export type CartItemType = {
    id: string;
    name: string;
    price: number;
    qty: number;
    stock: number;
    promotion?: string;
    discountValue?: number;
    discountType?: 'percentage' | 'flat';
};

type Props = {
    item: CartItemType;
    onDelete: (id: string) => void;
    onUpdate: (id: string, qty: number) => void;
    onEdit: (item: CartItemType) => void;
};

export default function CartItem({ item, onDelete, onUpdate, onEdit }: Props) {
    const startX = useRef<number | null>(null);
    const [translateX, setTranslateX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [inputValue, setInputValue] = useState(item.qty.toString());
    const lastTap = useRef<number>(0);

    useEffect(() => {
        setInputValue(item.qty.toString());
    }, [item.qty]);

    const THRESHOLD = 90;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        // Allow only numbers
        if (/^\d*$/.test(val)) {
            setInputValue(val);
        }
    };

    const handleInputBlur = () => {
        const newQty = parseInt(inputValue);
        if (isNaN(newQty) || newQty < 1) {
            setInputValue(item.qty.toString());
        } else {
            onUpdate(item.id, newQty);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.currentTarget.blur();
        }
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        // Only trigger double tap on the main container, not on children buttons
        const target = e.target as HTMLElement;
        if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.closest('button')) {
            return;
        }

        const now = Date.now();
        const DOUBLE_TAP_DELAY = 500;

        if (now - lastTap.current < DOUBLE_TAP_DELAY) {
            // Double tap detected
            onEdit(item);
            // Reset to prevent triple tap from triggering twice
            lastTap.current = 0;
            setTranslateX(0); // Reset any drag that might have started
            setIsDragging(false);
            return; // Don't start dragging on double tap
        } else {
            lastTap.current = now;
        }

        startX.current = e.touches[0].clientX;
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!startX.current) return;

        const currentX = e.touches[0].clientX;
        const diff = currentX - startX.current;

        // only allow swipe left
        if (diff < 0) {
            setTranslateX(diff);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);

        if (translateX < -THRESHOLD) {
            triggerDelete();
        } else {
            setTranslateX(0);
        }

        startX.current = null;
    };

    const triggerDelete = () => {
        setIsRemoving(true);

        setTimeout(() => {
            onDelete(item.id);
        }, 200);
    };



    return (
        <div className="w-full relative overflow-hidden">
            {/* Red Delete Background */}
            <div className="absolute inset-0  flex items-center justify-end pr-5 text-white font-semibold">
                Delete
            </div>

            {/* Swipeable Content */}
            <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onDoubleClick={() => onEdit(item)}
                style={{
                    transform: `translateX(${translateX}px)`,
                }}
                className={`
          ${item.promotion === "b2g1" && item.qty >= 2 ? "bg-green-100" : "bg-zinc-300"} px-3 py-2 rounded-lg
          transition-transform duration-200 select-none
          ${isRemoving ? "opacity-0 scale-95" : ""}
          ${isDragging ? "" : "ease-out"}
        `}
            >
                {/* Responsive row layout */}
                <div className="flex flex-col xl:flex-row xl:items-center font-medium gap-2">
                    {/* Top: Name & Promotion (On narrow screens) / Left: Name (On large) */}
                    <div className="flex-1 flex flex-col text-md xl:text-2xl min-w-0">
                        <span className="truncate">{item.name}</span>
                        {item.promotion === "b2g1" && item.qty >= 2 && (
                            <span className="text-green-600 text-xs xl:text-sm font-semibold">
                                (Buy 2 Get 1 Free)
                            </span>
                        )}
                    </div>

                    {/* Bottom row for narrow screens / Right side for large screens */}
                    <div className="flex items-center justify-between xl:justify-end gap-2 xl:gap-4">
                        {/* quantity with +/- controls */}
                        <div className="flex items-center gap-1 z-10 shrink-0">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdate(item.id, Math.max(1, item.qty - 1));
                                }}
                                onTouchStart={(e) => e.stopPropagation()}
                                onDoubleClick={(e) => e.stopPropagation()}
                                className="w-8 h-8 xl:w-10 xl:h-10 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 border border-gray-300 text-lg font-bold shrink-0"
                                aria-label="Decrease quantity"
                            >
                                -
                            </button>
                            <Input
                                value={inputValue}
                                // onChange={handleInputChange}
                                onChange={(e) => {
                                    let value = Number(e.target.value);
                                    if (value > item.stock) value = item.stock;
                                    if (value < 1) value = 1;
                                    
                                      e.target.value = String(value);
                                      handleInputChange(e);
                                }}
                                onBlur={handleInputBlur}
                                onKeyDown={handleKeyDown}
                                onClick={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                onDoubleClick={(e) => e.stopPropagation()}
                                className="w-10 xl:w-16 h-8 xl:h-10 text-center text-lg xl:text-2xl font-bold bg-white border-2 border-gray-400 focus:border-blue-500 focus-visible:ring-0 p-0"
                            />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdate(item.id, item.qty + 1);
                                }}
                                onTouchStart={(e) => e.stopPropagation()}
                                onDoubleClick={(e) => e.stopPropagation()}
                                className="w-8 h-8 xl:w-10 xl:h-10 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 border border-gray-300 text-lg font-bold shrink-0"
                                aria-label="Increase quantity"
                            >
                                +
                            </button>
                        </div>

                        {/* Price and Delete */}
                        <div className="flex items-center gap-2 xl:gap-4 shrink-0 min-w-[80px] xl:min-w-[140px] justify-end">
                            <div className="text-right flex flex-col items-end">
                                {item.discountValue && item.discountValue > 0 ? (
                                    <>
                                        <div className="text-gray-500/50 text-xs xl:text-sm line-through font-bold">
                                            ${(item.price * item.qty).toFixed(2)}
                                        </div>
                                        <div className="text-md xl:text-2xl font-black text-blue-600">
                                            ${((item.price * item.qty) - (item.discountType === 'percentage' ? (item.price * item.qty * item.discountValue) / 100 : item.discountValue)).toFixed(2)}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-md xl:text-2xl font-black truncate text-gray-900">
                                        ${(item.price * item.qty).toFixed(2)}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    triggerDelete();
                                }}
                                onTouchStart={(e) => e.stopPropagation()}
                                onDoubleClick={(e) => e.stopPropagation()}
                                className="p-1 rounded hover:bg-red-100 shrink-0"
                                aria-label="Delete item"
                            >
                                <Trash2 className="text-red-700 size-5 xl:size-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}