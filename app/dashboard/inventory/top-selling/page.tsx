"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Download, 
  Filter, 
  Edit, 
  Search, 
  ChevronDown,
  X,
  LineChart,
  FileText,
  Calendar,
  ArrowUpDown,
  SquarePen,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DownloadModal from "@/components/download-modal";

interface TopSellingProduct {
  id: number;
  name: string;
  upc: string;
  category: string;
  brand: string;
  price: string;
  unit: string;
  qtySold: number;
}

const mockTopSelling: TopSellingProduct[] = [
  { id: 1, name: "test product", upc: "819584499442", category: "test 01", brand: "test", price: "$100.00", unit: "tes", qtySold: 113.00 },
  { id: 2, name: "Beef - Diced", upc: "952877402750", category: "test 01", brand: "test", price: "$8888.88", unit: "tes", qtySold: 31.00 },
  { id: 3, name: "Chicken Breast", upc: "952877402751", category: "test 01", brand: "test", price: "$180.00", unit: "tes", qtySold: 8.00 },
  { id: 4, name: "Artichoke - Hearts, Canned", upc: "744889933567", category: "test 01", brand: "test", price: "$3.00", unit: "tes", qtySold: 6.00 },
  { id: 5, name: "Shrimp Medium", upc: "952877402756", category: "test 01", brand: "test", price: "$300.00", unit: "tes", qtySold: 5.00 },
  { id: 6, name: "Milk 1 Liter", upc: "952877402758", category: "test 01", brand: "test", price: "$90.00", unit: "tes", qtySold: 5.00 },
  { id: 7, name: "Tilapia Whole", upc: "952877402755", category: "test 01", brand: "test", price: "$220.00", unit: "tes", qtySold: 0.00 },
  { id: 8, name: "Salmon Fillet", upc: "952877402754", category: "test 01", brand: "test", price: "$450.00", unit: "tes", qtySold: 0.00 },
  { id: 9, name: "Eggs 12 Pack", upc: "952877402757", category: "test 01", brand: "test", price: "$130.00", unit: "tes", qtySold: 0.00 },
  { id: 10, name: "cola", upc: "CUSTOM56498022", category: "N/A", brand: "test", price: "$10.00", unit: "tes", qtySold: 0.00 },
];

type ModalType = "download" | "filter" | "edit" | null;

export default function TopSellingPage() {
  const [products, setProducts] = useState<TopSellingProduct[]>(mockTopSelling);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editingProduct, setEditingProduct] = useState<TopSellingProduct | null>(null);

  // Filter state
  const [sortBy, setSortBy] = useState("QTY Sold (High to Low)");
  const [dateFilter, setDateFilter] = useState("Current (Last 30 Days)");

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.upc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply sorting
    if (sortBy === "QTY Sold (High to Low)") {
      result.sort((a, b) => b.qtySold - a.qtySold);
    } else if (sortBy === "QTY Sold (Low to High)") {
      result.sort((a, b) => a.qtySold - b.qtySold);
    } else if (sortBy === "Name (A-Z)") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "Price (High to Low)") {
      result.sort((a, b) => parseFloat(b.price.replace('$', '')) - parseFloat(a.price.replace('$', '')));
    }

    return result;
  }, [products, searchQuery, sortBy]);

  const openModal = (type: ModalType, product?: TopSellingProduct) => {
    if (type === "edit" && product) {
      setEditingProduct(product);
    }
    setActiveModal(type);
  };

  const handleDownload = (scope: 'current' | 'all', format: 'pdf' | 'csv') => {
    const dataToExport = scope === 'current' ? filteredProducts.slice(0, 10) : filteredProducts;

    if (format === 'csv') {
      const headers = ['Product Name', 'UPC', 'Category', 'Brand', 'Price', 'Unit', 'QTY Sold'];
      const csvContent = [
        headers.join(','),
        ...dataToExport.map(p => 
          `"${p.name}","${p.upc}","${p.category}","${p.brand}","${p.price}","${p.unit}",${p.qtySold}`
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `top-selling_${scope}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      const pdfContent = `
Top Selling Products Report - ${scope === 'current' ? 'Current' : 'All'} Pages

Generated on: ${new Date().toLocaleDateString()}

${dataToExport.map((p, i) => `
${i + 1}. ${p.name}
   UPC: ${p.upc}
   Category: ${p.category}
   Brand: ${p.brand}
   Price: ${p.price}
   Unit: ${p.unit}
   Quantity Sold: ${p.qtySold}
`).join('\n')}
`;

      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `top-selling_${scope}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }

    setActiveModal(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header Section */}
      <header className="bg-blue-600 px-6 py-10 flex justify-between items-center shadow-lg rounded-2xl">
        <h1 className="text-4xl font-bold text-white tracking-tight uppercase">
          Top Selling
        </h1>
        <div className="text-white">
          <LineChart size={64} strokeWidth={2.5} />
        </div>
      </header>

      {/* Toolbar Section */}
      <div className="p-6 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => openModal("download")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded font-semibold transition-all shadow-md active:scale-95"
          >
            <Download size={18} /> Download <ChevronDown size={14} />
          </button>

          <button 
            onClick={() => openModal("filter")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded font-semibold transition-all shadow-md active:scale-95"
          >
            <Filter size={18} /> Filter <ChevronDown size={14} />
          </button>

          <button 
            onClick={() => openModal("edit")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded font-semibold transition-all shadow-md active:scale-95"
          >
            <Edit size={18} /> Edit <ChevronDown size={14} />
          </button>

          <div className="flex-grow max-w-md ml-auto relative">
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full border border-gray-300 rounded px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500" />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-4 font-bold text-sm tracking-wider">Product Name</th>
                <th className="p-4 font-bold text-sm tracking-wider">UPC</th>
                <th className="p-4 font-bold text-sm tracking-wider">Category</th>
                <th className="p-4 font-bold text-sm tracking-wider">Brand</th>
                <th className="p-4 font-bold text-sm tracking-wider">Price</th>
                <th className="p-4 font-bold text-sm tracking-wider">Unit</th>
                <th className="p-4 font-bold text-sm tracking-wider">QTY Sold</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-800">{product.name}</td>
                    <td className="p-4 text-gray-600">{product.upc}</td>
                    <td className="p-4 text-gray-600">{product.category}</td>
                    <td className="p-4 text-gray-600">{product.brand}</td>
                    <td className="p-4 font-medium text-gray-800">{product.price}</td>
                    <td className="p-4 text-gray-600">{product.unit}</td>
                    <td className="p-4 font-bold text-gray-800">{product.qtySold.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-500 italic">
                    No products found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            
            {/* Download Modal */}
            <DownloadModal
              isOpen={activeModal === "download"}
              onClose={() => setActiveModal(null)}
              onDownload={handleDownload}
              title="Export Products"
              subtitle="Choose your preferred format"
            />

            {/* Filter Modal */}
            {activeModal === "filter" && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
              >
                <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Filter size={20} /> Filter & Sort
                  </h2>
                  <button onClick={() => setActiveModal(null)} className="hover:bg-blue-700 p-1 rounded-full">
                    <X size={24} />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2 uppercase text-xs tracking-wider">
                      <ArrowUpDown size={16} /> SORT BY
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {["QTY Sold (High to Low)", "QTY Sold (Low to High)", "Name (A-Z)", "Price (High to Low)"].map(opt => (
                        <button 
                          key={opt}
                          onClick={() => setSortBy(opt)}
                          className={`px-4 py-2.5 rounded text-sm font-medium border text-left transition-all ${
                            sortBy === opt 
                              ? "bg-blue-600 text-white border-blue-600" 
                              : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2 uppercase text-xs tracking-wider">
                      <Calendar size={16} /> FILTER BY DATE
                    </h3>
                    <div className="space-y-2">
                      {["Current (Last 30 Days)", "Older (30+ Days)", "Custom Date Range"].map(opt => (
                        <button 
                          key={opt}
                          onClick={() => setDateFilter(opt)}
                          className={`w-full px-4 py-2.5 rounded text-sm font-medium border text-left transition-all ${
                            dateFilter === opt 
                              ? "bg-blue-600 text-white border-blue-600" 
                              : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold shadow-md hover:bg-blue-700 transition-colors mt-4"
                  >
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            )}

            {/* Edit Modal (Placeholder for context) */}
            {activeModal === "edit" && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
              >
                <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Edit size={20} /> Edit Top Selling
                  </h2>
                  <button onClick={() => setActiveModal(null)} className="hover:bg-blue-700 p-1 rounded-full">
                    <X size={24} />
                  </button>
                </div>
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <SquarePen size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Edit Mode Active</h3>
                  <p className="text-gray-500">You can now modify the top selling parameters or manually adjust rankings.</p>
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold shadow-md hover:bg-blue-700 transition-colors"
                  >
                    Got it
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
