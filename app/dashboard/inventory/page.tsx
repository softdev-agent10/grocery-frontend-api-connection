"use client";

import React from "react";
import { Package } from "lucide-react";

export default function InventoryHome() {
  return (
    <div className="w-full space-y-6">
      <div className="rounded-lg bg-linear-to-r from-blue-600 to-blue-800 p-8 text-white">
        <div className="flex items-center gap-3">
          <Package size={32} />
          <div>
            <h1 className="text-3xl font-bold">Inventory Management</h1>
            <p className="text-blue-100 mt-2">Select an option from the sidebar to manage your inventory</p>
          </div>
        </div>
      </div>
    </div>
  );
}
