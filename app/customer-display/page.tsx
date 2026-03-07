"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Types matching POS
type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  promotion?: string;
};

// Mock Ads
const ADS = [
  {
    id: 1,
    title: "Fresh Organic Produce",
    subtitle: "Up to 30% OFF this weekend!",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop",
    color: "bg-green-600",
  },
  {
    id: 2,
    title: "Premium Meat & Seafood",
    subtitle: "Daily fresh arrivals from local farms.",
    image: "https://images.unsplash.com/photo-1551028150-64b9f398f678?q=80&w=1000&auto=format&fit=crop",
    color: "bg-red-600",
  },
  {
    id: 3,
    title: "Freshly Baked Goods",
    subtitle: "Try our new sourdough bread!",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000&auto=format&fit=crop",
    color: "bg-amber-600",
  },
];

export default function CustomerDisplayPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [currentAd, setCurrentAd] = useState(0);

  // Auto-rotate ads
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % ADS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Mock calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const taxPercent = 5;
  const taxAmount = (subtotal * taxPercent) / 100;
  const total = subtotal + taxAmount;

  // Toggle for demo
  const addMockItem = () => {
    setItems([
      { id: "1", name: "Red Apple", price: 1.5, qty: 2, promotion: "B2G1" },
      { id: "2", name: "Banana", price: 0.8, qty: 5 },
      { id: "3", name: "Chicken Breast", price: 12.99, qty: 1 },
      { id: "4", name: "Milk 1L", price: 2.5, qty: 1 },
      { id: "5", name: "Large Eggs 12ct", price: 3.99, qty: 1 },
    ]);
  };

  const clearCart = () => setItems([]);

  return (
    <div className="h-screen w-full bg-[#F3F4F6] overflow-hidden flex flex-col p-2 gap-2">
      {/* Demo Controls - Hidden in production */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button 
          onClick={items.length === 0 ? addMockItem : clearCart}
          className="bg-black/50 hover:bg-black/70 text-white text-[10px] px-3 py-1 rounded-full backdrop-blur-md border border-white/20 uppercase font-black transition-all"
        >
          {items.length === 0 ? "Demo: Add Items" : "Demo: Clear Cart"}
        </button>
      </div>

      <div className="flex-1 flex gap-2 min-h-0">
        {/* Left Panel: Cart (Matching Sales Page Layout) */}
        <AnimatePresence>
          {items.length > 0 && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "400px", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex flex-col gap-2 shrink-0"
            >
              {/* Cart Items Container */}
              <div className="flex-1 bg-white border border-gray-200 shadow-sm rounded-xl flex flex-col overflow-hidden">
                <div className="p-4 border-b bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="size-5 text-amber-600" />
                    <h2 className="font-black text-gray-900 uppercase tracking-tight">Shopping Cart</h2>
                  </div>
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    {items.length} Items
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-10 bg-gray-50 rounded-lg flex items-center justify-center text-xs font-black text-gray-400 shrink-0">
                          {item.name[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate text-sm">{item.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            ${item.price.toFixed(2)} x {item.qty}
                          </p>
                        </div>
                      </div>
                      <p className="font-black text-gray-900 shrink-0 text-sm">
                        ${(item.price * item.qty).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Summary Section (Matching Sales Page Style) */}
                <div className="bg-gray-800 p-4 space-y-2 text-white border-t border-gray-700">
                  <div className="flex items-center justify-between text-xs opacity-80 uppercase tracking-widest font-bold">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs opacity-80 uppercase tracking-widest font-bold">
                    <span>Tax (5%)</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex items-center justify-between">
                    <span className="text-lg font-black uppercase tracking-tight">Total Due</span>
                    <span className="text-2xl font-black text-amber-400">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Branding Footer */}
              <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-center shadow-sm">
                <Image 
                  src="/assets/logo-light.svg" 
                  alt="Logo" 
                  width={140} 
                  height={40} 
                  className="h-8 w-auto"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Panel: Full Screen Ads or Side Ads */}
        <div className="flex-1 bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={`ad-${currentAd}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <Image
                src={ADS[currentAd].image}
                alt={ADS[currentAd].title}
                fill
                className="object-cover transition-all duration-1000"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute bottom-12 left-12 right-12 text-white">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className={cn(
                    "inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-lg mb-4",
                    ADS[currentAd].color
                  )}>
                    Featured Offer
                  </div>
                  <h1 className={cn(
                    "font-black tracking-tight leading-none drop-shadow-2xl mb-2",
                    items.length > 0 ? "text-5xl" : "text-8xl"
                  )}>
                    {ADS[currentAd].title}
                  </h1>
                  <p className={cn(
                    "font-medium text-white/90 italic drop-shadow-lg",
                    items.length > 0 ? "text-xl" : "text-3xl"
                  )}>
                    {ADS[currentAd].subtitle}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Ad Indicators */}
          <div className="absolute bottom-6 right-8 flex gap-2">
            {ADS.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  currentAd === i ? "w-8 bg-white" : "w-1.5 bg-white/30"
                )}
              />
            ))}
          </div>

          {/* Header Branding (Visible when full screen ads) */}
          {items.length === 0 && (
            <div className="absolute top-8 left-8 z-20">
              <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/20">
                <Image 
                  src="/assets/logo-light.svg" 
                  alt="Logo" 
                  width={150} 
                  height={45} 
                  className="h-8 w-auto"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E5E7EB;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
