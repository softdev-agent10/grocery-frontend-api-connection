"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Download, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical,
  CheckCircle,
  XCircle,
  History,
  ArrowUpDown,
  FileText,
  Table as TableIcon
} from "lucide-react";
 
import jsPDF from "jspdf";
import "jspdf-autotable";
import HistoryModal, { HistoryItem as HistoryItemType } from "@/components/history-modal";
import DownloadModal from "@/components/download-modal";

// Extend jsPDF with autotable types
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  products: number;
  status: "Active" | "Inactive";
  price: number;
  quantity: number;
  upc: string;
  createdOn: string;
}

interface HistoryItem {
  id: string;
  action: "Add" | "Edit" | "Delete";
  details: string;
  timestamp: string;
}

const mockBrands: Brand[] = [
  { id: 1, name: "Apple", slug: "apple", products: 120, status: "Active", price: 999, quantity: 50, upc: "UPC001", createdOn: "2023-10-01" },
  { id: 2, name: "Samsung", slug: "samsung", products: 85, status: "Active", price: 799, quantity: 30, upc: "UPC002", createdOn: "2023-10-05" },
  { id: 3, name: "Sony", slug: "sony", products: 45, status: "Inactive", price: 599, quantity: 15, upc: "UPC003", createdOn: "2023-10-10" },
  { id: 4, name: "Microsoft", slug: "microsoft", products: 60, status: "Active", price: 1200, quantity: 20, upc: "UPC004", createdOn: "2023-11-01" },
  { id: 5, name: "Google", slug: "google", products: 30, status: "Active", price: 899, quantity: 10, upc: "UPC005", createdOn: "2023-11-15" },
  { id: 6, name: "Amazon", slug: "amazon", products: 200, status: "Active", price: 49, quantity: 500, upc: "UPC006", createdOn: "2023-12-01" },
  { id: 7, name: "Tesla", slug: "tesla", products: 10, status: "Inactive", price: 45000, quantity: 5, upc: "UPC007", createdOn: "2024-01-10" },
  { id: 8, name: "Nike", slug: "nike", products: 150, status: "Active", price: 120, quantity: 100, upc: "UPC008", createdOn: "2024-01-15" },
  { id: 9, name: "Adidas", slug: "adidas", products: 130, status: "Active", price: 110, quantity: 80, upc: "UPC009", createdOn: "2024-02-01" },
  { id: 10, name: "Puma", slug: "puma", products: 90, status: "Inactive", price: 80, quantity: 60, upc: "UPC010", createdOn: "2024-02-10" },
  { id: 11, name: "Intel", slug: "intel", products: 40, status: "Active", price: 300, quantity: 25, upc: "UPC011", createdOn: "2024-02-15" },
  { id: 12, name: "AMD", slug: "amd", products: 35, status: "Active", price: 280, quantity: 22, upc: "UPC012", createdOn: "2024-03-01" },
];

export default function App() {
  const [brands, setBrands] = useState<Brand[]>(mockBrands);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Brand; direction: "asc" | "desc" } | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    status: "Active" as "Active" | "Inactive",
    price: 0,
    quantity: 0,
    upc: ""
  });

  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter and Sort Logic
  const processedBrands = useMemo(() => {
    let filtered = brands.filter(b => 
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.upc.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [brands, searchTerm, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(processedBrands.length / itemsPerPage);
  const currentItems = processedBrands.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key: keyof Brand, direction: "asc" | "desc") => {
    setSortConfig({ key, direction });
    setShowFilterMenu(false);
  };

  const addHistory = (details: string) => {
    // Determine action based on details
    const action: "Add" | "Edit" | "Delete" = 
      details.includes("Added") ? "Add" :
      details.includes("Updated") ? "Edit" :
      details.includes("Deleted") ? "Delete" :
      "Edit";

    setHistory(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      action,
      details,
      timestamp: new Date().toLocaleString()
    }, ...prev].slice(0, 50)); // Keep last 50 actions
  };

  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    const newBrand: Brand = {
      id: Math.max(0, ...brands.map(b => b.id)) + 1,
      name: formData.name,
      slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
      products: 0,
      status: formData.status,
      price: formData.price,
      quantity: formData.quantity,
      upc: formData.upc || `UPC${Math.floor(Math.random() * 1000)}`,
      createdOn: new Date().toISOString().split('T')[0]
    };
    setBrands([newBrand, ...brands]);
    addHistory(`Added brand: ${newBrand.name}`);
    setIsAddModalOpen(false);
    setFormData({ name: "", status: "Active", price: 0, quantity: 0, upc: "" });
  };

  const handleEditBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand) return;
    
    const updatedBrands = brands.map(b => 
      b.id === editingBrand.id 
        ? { ...b, ...formData, slug: formData.name.toLowerCase().replace(/\s+/g, '-') } 
        : b
    );
    setBrands(updatedBrands);
    addHistory(`Updated brand: ${formData.name}`);
    setIsEditModalOpen(false);
    setEditingBrand(null);
    setFormData({ name: "", status: "Active", price: 0, quantity: 0, upc: "" });
  };

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      status: brand.status,
      price: brand.price,
      quantity: brand.quantity,
      upc: brand.upc
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: number) => {
    const brandToDelete = brands.find(b => b.id === id);
    if (brandToDelete && window.confirm(`Are you sure you want to delete "${brandToDelete.name}"?`)) {
      setBrands(brands.filter(b => b.id !== id));
      setSelectedBrands(selectedBrands.filter(sid => sid !== id));
      addHistory(`Deleted brand: ${brandToDelete.name}`);
    }
  };

  const toggleSelectAll = () => {
    if (selectedBrands.length === currentItems.length) {
      setSelectedBrands([]);
    } else {
      setSelectedBrands(currentItems.map(b => b.id));
    }
  };

  const toggleSelectBrand = (id: number) => {
    if (selectedBrands.includes(id)) {
      setSelectedBrands(selectedBrands.filter(sid => sid !== id));
    } else {
      setSelectedBrands([...selectedBrands, id]);
    }
  };

  // Export Logic
  const exportToCSV = (data: Brand[], filename: string) => {
    const headers = ["Brand Name", "Slug", "Products", "Status", "Price", "Quantity", "UPC", "Created On"];
    const csvContent = [
      headers.join(","),
      ...data.map(b => [
        `"${b.name}"`,
        `"${b.slug}"`,
        b.products,
        `"${b.status}"`,
        b.price,
        b.quantity,
        `"${b.upc}"`,
        `"${b.createdOn}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = (data: Brand[], filename: string) => {
    const doc = new jsPDF();
    const tableColumn = ["Brand Name", "Slug", "Products", "Status", "Price", "Quantity", "UPC", "Created On"];
    const tableRows = data.map(b => [
      b.name,
      b.slug,
      b.products,
      b.status,
      `$${b.price}`,
      b.quantity,
      b.upc,
      b.createdOn
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.text("Brands Report", 14, 15);
    doc.save(`${filename}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50  font-sans text-gray-900">
      <div className=" mx-auto space-y-6">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 p-8 text-white shadow-xl overflow-hidden relative"
        >
          <div className="relative z-10">
            <h1 className="text-4xl font-bold tracking-tight">Brands Dashboard</h1>
            <p className="text-blue-100 mt-2 text-lg font-light">Manage and monitor your product brands with ease.</p>
          </div>
          {/* Decorative background circle */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </motion.div>

        {/* Toolbar Section */}
        <div className="flex flex-wrap gap-3 items-center bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setFormData({ name: "", status: "Active", price: 0, quantity: 0, upc: "" });
              setIsAddModalOpen(true);
            }} 
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
          >
            <Plus size={18} /> Add Brand
          </motion.button>

          <div className="flex items-center gap-2">
            {/* Download Modal */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsDownloadModalOpen(true)}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-gray-50 transition-all"
            >
              <Download size={18} className="text-indigo-600" /> Download
            </motion.button>

            <DownloadModal
              isOpen={isDownloadModalOpen}
              onClose={() => setIsDownloadModalOpen(false)}
              onDownload={(scope, format) => {
                const data = scope === 'current' ? currentItems : processedBrands;
                const filename = `brands_${scope}_page`;
                if (format === 'pdf') exportToPDF(data, filename);
                else exportToCSV(data, filename);
              }}
              title="Export Brands"
              subtitle="Choose your preferred format"
            />

            {/* Filter Dropdown */}
            <div className="relative" ref={filterMenuRef}>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-gray-50 transition-all"
              >
                <Filter size={18} className="text-indigo-600" /> Filter
              </motion.button>

              <AnimatePresence>
                {showFilterMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-3 bg-gray-50 text-[10px] uppercase tracking-wider font-bold text-gray-500 px-4">SORT BY</div>
                    <div className="max-h-64 overflow-y-auto">
                      <button onClick={() => handleSort('name', 'asc')} className="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 transition-colors">Name (A-Z)</button>
                      <button onClick={() => handleSort('name', 'desc')} className="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 transition-colors">Name (Z-A)</button>
                      <button onClick={() => handleSort('price', 'asc')} className="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 transition-colors">Price (Low to High)</button>
                      <button onClick={() => handleSort('price', 'desc')} className="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 transition-colors">Price (High to Low)</button>
                      <button onClick={() => handleSort('quantity', 'asc')} className="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 transition-colors">Quantity (Low to High)</button>
                      <button onClick={() => handleSort('quantity', 'desc')} className="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 transition-colors">Quantity (High to Low)</button>
                      <button onClick={() => handleSort('upc', 'asc')} className="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 transition-colors">UPC (Ascending)</button>
                      <button onClick={() => handleSort('upc', 'desc')} className="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 transition-colors">UPC (Descending)</button>
                    </div>
                    <button onClick={() => { setSortConfig(null); setShowFilterMenu(false); }} className="w-full text-left px-4 py-3 text-sm font-semibold text-red-600 border-t hover:bg-red-50 transition-colors">Reset Filters</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsHistoryModalOpen(true)}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-gray-50 transition-all"
            >
              <History size={18} className="text-indigo-600" /> History
            </motion.button>
          </div>

          <div className="ml-auto flex items-center bg-gray-50 px-4 rounded-xl border border-gray-200 w-full md:w-72 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="bg-transparent border-none outline-none ml-3 py-2.5 text-sm w-full placeholder:text-gray-400" 
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="p-4 w-12">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                      checked={selectedBrands.length === currentItems.length && currentItems.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-xs">Brand Name</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-xs">Created On</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-xs">Products</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-xs text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence mode="popLayout">
                  {currentItems.map((brand) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={brand.id} 
                      className={`hover:bg-indigo-50/30 transition-colors ${selectedBrands.includes(brand.id) ? 'bg-indigo-50/50' : ''}`}
                    >
                      <td className="p-4">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                          checked={selectedBrands.includes(brand.id)}
                          onChange={() => toggleSelectBrand(brand.id)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{brand.name}</span>
                          <span className="text-xs text-gray-500">Slug: {brand.slug}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 font-medium">{brand.createdOn}</td>
                      <td className="p-4">
                        <span className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-indigo-200">
                          {brand.products}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          brand.status === 'Active' 
                            ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' 
                            : 'bg-rose-100 text-rose-700 ring-1 ring-rose-200'
                        }`}>
                          {brand.status === 'Active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          {brand.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1">
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEditModal(brand)}
                            className="text-amber-600 hover:bg-amber-50 p-2 rounded-lg transition-colors"
                          >
                            <Edit3 size={18} />
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(brand.id)}
                            className="text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-500 italic">
                      No brands found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Section */}
          <div className="p-5 border-t border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Items per page</span>
                <select 
                  value={itemsPerPage}
                  onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="bg-white border border-gray-200 rounded-lg text-xs font-bold py-1.5 px-3 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                >
                  <option value={10}>10 items</option>
                  <option value={15}>15 items</option>
                  <option value={25}>25 items</option>
                  <option value={50}>50 items</option>
                  <option value={100}>100 items</option>
                </select>
              </div>
              <div className="text-xs font-medium text-gray-500">
                Showing <span className="text-gray-900 font-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, processedBrands.length)}</span> to <span className="text-gray-900 font-bold">{Math.min(currentPage * itemsPerPage, processedBrands.length)}</span> of <span className="text-gray-900 font-bold">{processedBrands.length}</span> brands
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={20} />
              </motion.button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <motion.button
                    key={page}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                      currentPage === page 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </motion.button>
                ))}
              </div>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronRight size={20} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setItemsPerPage(10);
              setCurrentPage(1);
              setSortConfig(null);
              setSearchTerm("");
              setSelectedBrands([]);
              setBrands(mockBrands);
              setHistory([]);
            }}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-100 transition-all"
          >
            Reset to Default
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              addHistory("Applied changes manually");
              alert('Changes applied successfully!');
            }}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
          >
            Apply Changes
          </motion.button>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {(isAddModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-indigo-600 p-6 text-white">
                <h2 className="text-xl font-bold">{isAddModalOpen ? 'Add New Brand' : 'Edit Brand'}</h2>
                <p className="text-indigo-100 text-sm mt-1">Fill in the details below.</p>
              </div>
              <form onSubmit={isAddModalOpen ? handleAddBrand : handleEditBrand} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Brand Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    placeholder="e.g. Microsoft"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Price ($)</label>
                    <input 
                      type="number" 
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Quantity</label>
                    <input 
                      type="number" 
                      value={formData.quantity}
                      onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">UPC Code</label>
                  <input 
                    type="text" 
                    value={formData.upc}
                    onChange={e => setFormData({ ...formData, upc: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as "Active" | "Inactive" })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
                  >
                    {isAddModalOpen ? 'Create Brand' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* History Modal */}
        <HistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          history={history}
          title="Action History"
          subtitle="Recent activities in your dashboard"
        />
      </AnimatePresence>
    </div>
  );
}
