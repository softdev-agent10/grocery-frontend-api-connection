"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  AlertTriangle,
  Search,
  X,
  ArrowUpDown,
  Calendar,
  MailIcon as MdEmail
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DownloadButton, FilterButton, EditButton } from "@/components/toolbar-buttons";
import DownloadModal from "@/components/download-modal";
import { generatePDFWithLogo, generateCSV } from "@/lib/pdf-export";
import { fetchInventory } from "@/app/services/comon/fetchInventory";

// interface OutOfStock {
//   id: number;
//   name: string;
//   category: string;
//   lastRestocked: string;
//   supplier: string;
// }

interface OutOfStock {
  id: number,
  name: string,
  upc_code: string,
  plu_code: string,
  category: {
    id: number,
    name: string
  },
  brand: {
    id: 3,
    name: string
  },
  unit: {
    id: 5,
    name: string
  },
  selling_price: number,
  buying_price: number,
  quantity: number,
  quantity_alert: number,
  stock_status: string,
  percentage_of_alert: number,
  image_url: string,
  last_updated: string
}

// const mockOutOfStock: OutOfStock[] = [
//   { id: 1, name: "Product A", category: "test 01", lastRestocked: "2026-02-15", supplier: "Supplier 1" },
//   { id: 2, name: "Product B", category: "test 01", lastRestocked: "2026-02-20", supplier: "Supplier 2" },
//   { id: 3, name: "Product C", category: "test 01", lastRestocked: "2026-01-10", supplier: "Supplier 1" },
// ];

type ModalType = "download" | "filter" | "edit" | null;

interface TableViewColumns {
  name: boolean;
  category: boolean;
  upc_code: boolean;
  plu_code: boolean;
  brand: boolean;
  unit: boolean;
  selling_price: boolean;
  buying_price: boolean;
  quantity: boolean;
  stock_status: boolean;
  last_updated: boolean;
}

const defaultColumns: TableViewColumns = {
  name: true,
  category: true,
  upc_code: true,
  plu_code: true,
  brand: true,
  unit: true,
  selling_price: true,
  buying_price: true,
  quantity: true,
  stock_status: true,
  last_updated: true,

};

export default function OutOfStocks() {
  const [products, setProducts] = useState<OutOfStock[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Recently Restocked");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<TableViewColumns>(defaultColumns);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [tempColumns, setTempColumns] = useState<TableViewColumns>(defaultColumns);
  const [tempItemsPerPage, setTempItemsPerPage] = useState(15);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply sorting
    if (sortBy === "Recently Restocked") {
      result.sort((a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime());
    } else if (sortBy === "Oldest Restocked") {
      result.sort((a, b) => new Date(a.last_updated).getTime() - new Date(b.last_updated).getTime());
    } else if (sortBy === "Name (A-Z)") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, searchQuery, sortBy]);

  const openModal = (type: ModalType) => {
    if (type === "edit") {
      setTempColumns({ ...visibleColumns });
      setTempItemsPerPage(itemsPerPage);
      setIsEditModalOpen(true);
    } else if (type === "download") {
      setIsDownloadModalOpen(true);
    } else if (type === "filter") {
      setIsFilterMenuOpen(!isFilterMenuOpen);
    }
  };

  const handleApplyTableChanges = () => {
    setVisibleColumns({ ...tempColumns });
    setItemsPerPage(tempItemsPerPage);
    localStorage.setItem(
      "outOfStocksTableSettings",
      JSON.stringify({
        columns: tempColumns,
        itemsPerPage: tempItemsPerPage,
      })
    );
    setIsEditModalOpen(false);
  };

  const handleResetTableDefaults = () => {
    setTempColumns({ ...defaultColumns });
    setTempItemsPerPage(15);
    localStorage.removeItem("outOfStocksTableSettings");
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem("outOfStocksTableSettings");

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

    // Simulate fetching data from an API
    const fetchData = async () => {
      const data = await fetchInventory("out-of-stock", {
        branchId: "1234567890",
        token: "your-auth-token",
        page: 1,
        limit: 100,
        sortBy: "name",
        sortOrder: "asc",
      });
      console.log("Fetched data:", data.data.items);
      setProducts(data.data.items);
    };

    fetchData();


  }, []);

  const handleDownload = (scope: 'current' | 'all', format: 'pdf' | 'csv') => {
    const dataToExport = scope === 'current' ? filteredProducts.slice(0, 15) : filteredProducts;
    const columns = ['Product Name', 'Category', 'Last Updated', 'Brand'];
    const rows = dataToExport.map(p => [p.name, p.category, p.last_updated, p.brand]);

    if (format === 'csv') {
      generateCSV(columns, rows, `out-of-stocks_${scope}_${new Date().getTime()}.csv`);
    } else if (format === 'pdf') {
      generatePDFWithLogo({
        title: `Out of Stock Products Report (${scope === 'current' ? 'Current Page' : 'All Pages'})`,
        columns,
        rows,
        fileName: `out-of-stocks_${scope}_${new Date().getTime()}.pdf`,
        scope
      });
    }

    setIsDownloadModalOpen(false);
  };
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header Section */}
      <header className="bg-blue-600 px-6 py-10 flex justify-between items-center shadow-lg rounded-2xl">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight uppercase">
            Out of Stocks
          </h1>
          <p className="text-red-100 mt-2">Products that need immediate restocking</p>
        </div>
        <div className="text-white">
          <AlertTriangle size={64} strokeWidth={2.5} />
        </div>
      </header>

      {/* Toolbar Section */}
      <div className="p-6 space-y-6">
        <div className="flex flex-row items-center gap-3 border border-gray-200 rounded-lg bg-white p-4 shadow-sm">
          <DownloadButton onClick={() => setIsDownloadModalOpen(true)} />
          <FilterButton onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} />
          <EditButton onClick={() => setIsEditModalOpen(true)} />

          <div className="grow max-w-md ml-auto  relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500" />
          </div>

          <button className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700 transition-all shadow-sm">
            <MdEmail className="w-5 h-5" /> Email
          </button>

        </div>

        {/* Stats Section */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-sm font-semibold">Total Out of Stock Products</p>
          <p className="text-4xl font-bold text-red-600 mt-2">{filteredProducts.length}</p>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-4 font-bold text-sm tracking-wider">
                  <input type="checkbox" className="w-4 h-4 cursor-pointer" />
                </th>
                {visibleColumns.name && <th className="p-4 font-bold text-sm tracking-wider">Product Name</th>}
                {visibleColumns.category && <th className="p-4 font-bold text-sm tracking-wider">Department</th>}
                {visibleColumns.upc_code && <th className="p-4 font-bold text-sm tracking-wider">UPC Code</th>}
                {visibleColumns.plu_code && <th className="p-4 font-bold text-sm tracking-wider">PLU Code</th>}
                {visibleColumns.last_updated && <th className="p-4 font-bold text-sm tracking-wider">Last Updated</th>}
                {visibleColumns.brand && <th className="p-4 font-bold text-sm tracking-wider">Brand</th>}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.slice(0, itemsPerPage).length > 0 ? (
                filteredProducts.slice(0, itemsPerPage).map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <input type="checkbox" className="w-4 h-4 cursor-pointer" />
                    </td>
                    {visibleColumns.name && <td className="p-4 font-medium text-gray-800">{item.name}</td>}
                    {visibleColumns.category && <td className="p-4 text-gray-600">{item.category.name}</td>}
                    {visibleColumns.upc_code && <td className="p-4 text-gray-600">{item.upc_code}</td>}
                    {visibleColumns.plu_code && <td className="p-4 text-gray-600">{item.plu_code}</td>}
                    {visibleColumns.last_updated && <td className="p-4 text-gray-600">{item.last_updated}</td>}
                    {visibleColumns.brand && <td className="p-4 text-gray-600">{item.brand.name}</td>}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={Object.values(visibleColumns).filter(v => v).length + 1} className="p-12 text-center text-gray-500 italic">
                    No out of stock products found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {filteredProducts.length > itemsPerPage && (
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Page 1 of {Math.ceil(filteredProducts.length / itemsPerPage)}
              </span>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">←</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">→</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Download Modal */}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onDownload={handleDownload}
        title="Export Out of Stock Products"
        subtitle="Choose your preferred format"
      />

      {/* Filter Modal */}
      <AnimatePresence>
        {isFilterMenuOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterMenuOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                <h2 className="text-xl font-bold">Filter & Sort</h2>
                <button onClick={() => setIsFilterMenuOpen(false)} className="hover:bg-blue-700 p-1 rounded-full">
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2 uppercase text-xs tracking-wider">
                    <ArrowUpDown size={16} /> SORT BY
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {["Recently Updated", "Oldest Updated", "Name (A-Z)"].map(opt => (
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
                    {["All Time", "Last 30 Days", "Last 90 Days"].map(opt => (
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
                  onClick={() => setIsFilterMenuOpen(false)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold shadow-md hover:bg-blue-700 transition-colors mt-4"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal (Table View Settings) */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                <h2 className="text-xl font-bold">Edit View Settings</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="hover:bg-blue-700 p-1 rounded-full">
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
                {/* Table View Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">Table View</h3>
                  <div className="space-y-2">
                    {[
                      { key: 'name' as const, label: 'Product Name', icon: '📦' },
                      { key: 'category' as const, label: 'Category', icon: '📂' },
                      { key: 'last_updated' as const, label: 'Last Updated', icon: '📅' },
                      { key: 'upc_code' as const, label: 'UPC Code', icon: '🏷️' },
                      { key: 'plu_code' as const, label: 'PLU Code', icon: '🏷️' },
                      { key: 'brand' as const, label: 'Brand', icon: '🏷️' },
                      { key: 'unit' as const, label: 'Unit', icon: '📏' },
                      { key: 'quantity' as const, label: 'Quantity', icon: '📊' },
                      { key: 'stock_status' as const, label: 'Status', icon: '📊' }
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
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

