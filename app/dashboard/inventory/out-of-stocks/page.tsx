"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface OutOfStock {
  id: number;
  name: string;
  category: string;
  lastRestocked: string;
  supplier: string;
}

const mockOutOfStock: OutOfStock[] = [
  { id: 1, name: "Product A", category: "test 01", lastRestocked: "2026-02-15", supplier: "Supplier 1" },
  { id: 2, name: "Product B", category: "test 01", lastRestocked: "2026-02-20", supplier: "Supplier 2" },
  { id: 3, name: "Product C", category: "test 01", lastRestocked: "2026-01-10", supplier: "Supplier 1" },
];

export default function OutOfStocks() {
  return (
    <div className="w-full space-y-6">
      <div className="rounded-lg bg-gradient-to-r from-red-600 to-red-800 p-8 text-white">
        <div className="flex items-center gap-3">
          <AlertTriangle size={32} />
          <div>
            <h1 className="text-3xl font-bold">Out of Stocks</h1>
            <p className="text-red-100 mt-2">Products that need immediate restocking</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <p className="text-gray-600 text-sm">Total Out of Stock Items</p>
        <p className="text-3xl font-bold text-red-600 mt-2">3</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-red-600 text-white">
            <tr>
              <th className="p-4 text-left font-semibold">Product Name</th>
              <th className="p-4 text-left font-semibold">Category</th>
              <th className="p-4 text-left font-semibold">Last Restocked</th>
              <th className="p-4 text-left font-semibold">Supplier</th>
            </tr>
          </thead>
          <tbody>
            {mockOutOfStock.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{item.name}</td>
                <td className="p-4 text-gray-600">{item.category}</td>
                <td className="p-4 text-gray-600">{item.lastRestocked}</td>
                <td className="p-4">{item.supplier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

