"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
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
import { generatePDFWithLogo, generateCSV } from "@/lib/pdf-export";
import { getTopSellings } from "@/app/services/topSell/topSell";
import { tr } from "date-fns/locale";
import SkeletonTable from "@/components/dashboard/SkeletonTable/SkeletonTable";


// "product": {
//  "id": 0,
//  "name": "string",
//  "upc_code": "string",
//  "plu_code": "string",
//  "category": "string",
//  "brand": "string",
//  "unit": "string",
//  "selling_price": "string"
// },
// "total_quantity_sold": "string"

interface TopSellingProduct {
  product: {
    id: number;
    name: string;
    upc_code: string;
    plu_code: string;
    category: string;
    brand: string;
    price: string;
    unit: string;
    selling_price: string;
  }
  total_quantity_sold: string;
}

// const mockTopSelling: TopSellingProduct[] = [
//   { id: 1, name: "test product", upc_code: "819584499442", plu_code: "PLU001", category: "test 01", brand: "test", price: "$100.00", selling_price: "113.00", unit: "tes" },
//   { id: 2, name: "Beef - Diced", upc_code: "952877402750", plu_code: "PLU002", category: "test 01", brand: "test", price: "$8888.88", selling_price: "31.00", unit: "tes" },
//   { id: 3, name: "Chicken Breast", upc_code: "952877402751", plu_code: "PLU003", category: "test 01", brand: "test", price: "$180.00", selling_price: "8.00", unit: "tes" },
//   { id: 4, name: "Artichoke - Hearts, Canned", upc_code: "744889933567", plu_code: "PLU004", category: "test 01", brand: "test", price: "$3.00", selling_price: "6.00", unit: "tes" },
//   { id: 5, name: "Shrimp Medium", upc_code: "952877402756", plu_code: "PLU005", category: "test 01", brand: "test", price: "$300.00", selling_price: "5.00", unit: "tes" },
//   { id: 6, name: "Milk 1 Liter", upc_code: "952877402758", plu_code: "PLU006", category: "test 01", brand: "test", price: "$90.00", selling_price: "5.00", unit: "tes" },
//   { id: 7, name: "Tilapia Whole", upc_code: "952877402755", plu_code: "PLU007", category: "test 01", brand: "test", price: "$220.00", unit: "tes", selling_price: "0.00" }
// ];

type ModalType = "download" | "filter" | "edit" | null;

interface TableViewColumns {
  productName: boolean;
  upc: boolean;
  category: boolean;
  brand: boolean;
  price: boolean;
  unit: boolean;
  qtySold: boolean;
  viewProduct: boolean;
}

const defaultColumns: TableViewColumns = {
  productName: true,
  upc: true,
  category: true,
  brand: true,
  price: true,
  unit: true,
  qtySold: true,
  viewProduct: false,
};

export default function TopSellingPage() {
  const [products, setProducts] = useState<TopSellingProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editingProduct, setEditingProduct] = useState<TopSellingProduct | null>(null);

  // Filter state
  const [sortBy, setSortBy] = useState("QTY Sold (High to Low)");
  const [dateFilter, setDateFilter] = useState("Current (Last 30 Days)");

  // Table view state
  const [visibleColumns, setVisibleColumns] = useState<TableViewColumns>(defaultColumns);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [tempColumns, setTempColumns] = useState<TableViewColumns>(defaultColumns);
  const [tempItemsPerPage, setTempItemsPerPage] = useState(10);
  const [isLoadingTopSelling, setIsLoadingTopSelling] = useState(false);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p =>
      p.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.product.upc_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply sorting
    if (sortBy === "QTY Sold (High to Low)") {
      result.sort((a, b) => parseFloat(b.total_quantity_sold) - parseFloat(a.total_quantity_sold));
    } else if (sortBy === "QTY Sold (Low to High)") {
      result.sort((a, b) => parseFloat(a.total_quantity_sold) - parseFloat(b.total_quantity_sold));
    } else if (sortBy === "Name (A-Z)") {
      result.sort((a, b) => a.product.name.localeCompare(b.product.name));
    } else if (sortBy === "Price (High to Low)") {
      result.sort((a, b) => parseFloat(b.product.selling_price.replace('$', '')) - parseFloat(a.product.selling_price.replace('$', '')));
    }

    return result;
  }, [products, searchQuery, sortBy]);

  const openModal = (type: ModalType, product?: TopSellingProduct) => {
    if (type === "edit" && product) {
      setEditingProduct(product);
    }
    if (type === "edit") {
      setTempColumns({ ...visibleColumns });
      setTempItemsPerPage(itemsPerPage);
    }
    setActiveModal(type);
  };

  const handleApplyTableChanges = () => {
    setVisibleColumns({ ...tempColumns });
    setItemsPerPage(tempItemsPerPage);

    localStorage.setItem(
      "tableSettingsTopSelling",
      JSON.stringify({
        columns: tempColumns,
        itemsPerPage: tempItemsPerPage,
      })
    );

    setActiveModal(null);
  };

  const handleResetTableDefaults = () => {
    setTempColumns({ ...defaultColumns });
    setTempItemsPerPage(10);
    localStorage.removeItem("tableSettingsTopSelling");
  };

  const loadTopSellingProducts = async () => {
    setIsLoadingTopSelling(true);
    try {
      const data = await getTopSellings({ branchId: "123456789", token: "your_token_here" });
      console.log("Fetched top selling products:", data.data.items);
      setIsLoadingTopSelling(false);
      // setProducts(data.data.items);

    } catch (error) {
      console.error("Failed to load top selling products:", error);
    } finally {
      setIsLoadingTopSelling(false);
    }
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem("tableSettingsTopSelling");

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);

        if (parsed.columns) {
          setVisibleColumns(parsed.columns);
          setTempColumns(parsed.columns);
        }

        if (parsed.itemsPerPage) {
          setItemsPerPage(parsed.itemsPerPage);
          setTempItemsPerPage(parsed.itemsPerPage);
        }
      } catch (error) {
        console.error("Failed to parse table settings:", error);
      }
    }

    loadTopSellingProducts();
  }, []);

  const handleDownload = (scope: 'current' | 'all', format: 'pdf' | 'csv') => {
    const dataToExport = scope === 'current' ? filteredProducts.slice(0, 10) : filteredProducts;
    const columns = ['Product Name', 'UPC', 'Category', 'Brand', 'Price', 'Unit', 'QTY Sold'];
    const rows = dataToExport.map(p => [p.product.name, p.product.upc_code, p.product.category, p.product.brand, p.product.price, p.product.unit, p.total_quantity_sold]);

    if (format === 'csv') {
      generateCSV(columns, rows, `top-selling_${scope}_${new Date().getTime()}.csv`);
    } else if (format === 'pdf') {
      generatePDFWithLogo({
        title: `Top Selling Products Report (${scope === 'current' ? 'Current Page' : 'All Pages'})`,
        columns,
        rows,
        fileName: `top-selling_${scope}_${new Date().getTime()}.pdf`,
        scope
      });
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
      <div className="p-6 space-y-6 ">
        <div className="flex flex-wrap items-center gap-3  bg-white p-4 rounded-2xl shadow-xl border border-slate-200">
          <button
            onClick={() => openModal("download")}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-400 text-slate-700 px-6 py-3 rounded-xl font-bold transition-all shadow-sm"
          >
            <Download size={18} /> Download <ChevronDown size={14} />
          </button>

          <button
            onClick={() => openModal("filter")}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-400 text-slate-700 px-6 py-3 rounded-xl font-bold transition-all shadow-sm"
          >
            <Filter size={18} /> Filter <ChevronDown size={14} />
          </button>

          <button
            onClick={() => openModal("edit")}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-400 text-slate-700 px-6 py-3 rounded-xl font-bold transition-all shadow-sm"
          >
            <Edit size={18} /> Edit <ChevronDown size={14} />
          </button>

          <div className="flex-grow:1 max-w-md ml-auto relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 shadow-sm"
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
                {visibleColumns.productName && <th className="p-4 font-bold text-sm tracking-wider">Product Name</th>}
                {visibleColumns.upc && <th className="p-4 font-bold text-sm tracking-wider">UPC</th>}
                {visibleColumns.category && <th className="p-4 font-bold text-sm tracking-wider">Category</th>}
                {visibleColumns.brand && <th className="p-4 font-bold text-sm tracking-wider">Brand</th>}
                {visibleColumns.price && <th className="p-4 font-bold text-sm tracking-wider">Price</th>}
                {visibleColumns.unit && <th className="p-4 font-bold text-sm tracking-wider">Unit</th>}
                {visibleColumns.qtySold && <th className="p-4 font-bold text-sm tracking-wider">QTY Sold</th>}
                {visibleColumns.viewProduct && <th className="p-4 font-bold text-sm tracking-wider text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isLoadingTopSelling ? (
                // Show 5 skeleton rows while loading
                Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonTable key={index} />
                ))
              ) : filteredProducts.slice(0, itemsPerPage).length > 0 ? (
                filteredProducts.slice(0, itemsPerPage).map((product) => (
                  <tr key={product.product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    {visibleColumns.productName && <td className="p-4 font-medium text-gray-800">{product.product.name}</td>}
                    {visibleColumns.upc && <td className="p-4 text-gray-600">{product.product.upc_code}</td>}
                    {visibleColumns.category && <td className="p-4 text-gray-600">{product.product.category}</td>}
                    {visibleColumns.brand && <td className="p-4 text-gray-600">{product.product.brand}</td>}
                    {visibleColumns.price && <td className="p-4 font-medium text-gray-800">{product.product.selling_price}</td>}
                    {visibleColumns.unit && <td className="p-4 text-gray-600">{product.product.unit}</td>}
                    {visibleColumns.qtySold && <td className="p-4 font-bold text-gray-800">{product.total_quantity_sold}</td>}
                    {visibleColumns.viewProduct && <td className="p-4 text-right"><button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors">View Product</button></td>}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={Object.values(visibleColumns).filter(v => v).length} className="p-12 text-center text-gray-500 italic">
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
                          className={`px-4 py-2.5 rounded text-sm font-medium border text-left transition-all ${sortBy === opt
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
                          className={`w-full px-4 py-2.5 rounded text-sm font-medium border text-left transition-all ${dateFilter === opt
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

            {/* Edit Modal (Table View Settings) */}
            {activeModal === "edit" && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
              >
                <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Edit size={20} /> Edit View Settings
                  </h2>
                  <button onClick={() => setActiveModal(null)} className="hover:bg-blue-700 p-1 rounded-full">
                    <X size={24} />
                  </button>
                </div>
                <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
                  {/* Table View Section */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">Table View</h3>
                    <div className="space-y-2">
                      {[
                        { key: 'productName' as const, label: 'Product Name', icon: '📦' },
                        { key: 'upc' as const, label: 'UPC', icon: '🏷️' },
                        { key: 'category' as const, label: 'Category', icon: '📂' },
                        { key: 'brand' as const, label: 'Brand', icon: '🎯' },
                        { key: 'price' as const, label: 'Price', icon: '💰' },
                        { key: 'unit' as const, label: 'Unit', icon: '📏' },
                        { key: 'qtySold' as const, label: 'QTY Sold', icon: '📊' },
                        { key: 'viewProduct' as const, label: 'View Product', icon: '👁️' },
                      ].map(column => (
                        <label key={column.key} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={tempColumns[column.key]}
                            onChange={(e) => setTempColumns({ ...tempColumns, [column.key]: e.target.checked })}
                            className="w-4 h-4 accent-blue-600 cursor-pointer"
                          />
                          <span className="text-sm font-medium text-gray-700">{column.icon} {column.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Items Per Page Section */}
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">Items Per Page</h3>
                    <div className="space-y-2">
                      {[10, 15, 25, 50, 100].map(num => (
                        <label key={num} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded transition-colors">
                          <input
                            type="radio"
                            name="itemsPerPage"
                            value={num}
                            checked={tempItemsPerPage === num}
                            onChange={(e) => setTempItemsPerPage(Number(e.target.value))}
                            className="w-4 h-4 accent-blue-600 cursor-pointer"
                          />
                          <span className="text-sm font-medium text-gray-700">{num} items</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={handleApplyTableChanges}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      ✓ Apply Changes
                    </button>
                    <button
                      onClick={handleResetTableDefaults}
                      className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      ↻ Reset to Default
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
