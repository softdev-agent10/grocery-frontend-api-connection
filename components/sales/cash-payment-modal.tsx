"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { CartItemType } from "@/components/sales/cart-items";

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
  onProcess,
}: CashPaymentModalProps) {
  const change = cashGiven - total;
  const isInvalidPayment = cashGiven < total;

  const handleProcessClick = () => {

    if (isInvalidPayment) {
      console.error("Cash received is less than total amount");
      return;
    }

    onProcess();

  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden rounded-3xl border-none p-0">
        <VisuallyHidden>
          <DialogTitle>Cash Payment</DialogTitle>
        </VisuallyHidden>

        <div
          className="py-8 text-center"
          style={{
            background:
              "linear-gradient(135deg, #2563eb 0%, #3b4fcf 55%, #4338ca 100%)",
          }}
        >
          <h2 className="text-3xl font-bold text-white">Cash Payment</h2>
        </div>

        <div className="space-y-6 bg-white p-6">
          <div className="custom-scrollbar max-h-[200px] space-y-2 overflow-y-auto pr-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3"
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

          <div className="h-px w-full bg-gray-100" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">Total Bill:</span>
              <span className="text-2xl font-extrabold text-gray-900">
                ${total.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xl font-medium text-gray-700">Cash Given:</span>
              <span className="text-xl font-bold text-gray-700">
                ${cashGiven.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xl font-medium text-gray-700">Discount:</span>
              <span className="text-xl font-bold text-red-500">
                ${discountAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xl font-medium text-gray-700">Change:</span>
              <span className="text-xl font-bold text-gray-700">
                ${change.toFixed(2)}
              </span>
            </div>

            {isInvalidPayment && (
              <p className="text-sm font-medium text-red-500">
                Cash received is less than total amount.
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-4 bg-gray-50 p-6">
          <Button
            onClick={handleProcessClick}
            disabled={isInvalidPayment}
            className="flex-1 rounded-2xl py-6 text-lg font-bold shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background:
                "linear-gradient(135deg, #2563eb 0%, #3b4fcf 55%, #4338ca 100%)",
            }}
          >
            Process & Print ty
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              // console.log("Cash payment modal closed");
              onOpenChange(false);
            }}
            className="flex-1 rounded-2xl border-2 border-gray-200 py-6 text-lg font-bold transition-all hover:bg-gray-100"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}