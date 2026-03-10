"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HistoryModal, { HistoryItem as HistoryItemType } from "@/components/history-modal";
import DownloadModal from "@/components/download-modal";
import { 
  Plus, 
  Download, 
  Filter, 
  Edit, 
  Trash2, 
  Search, 
  History, 
  SquarePen, 
  ChevronDown,
  X,
  Boxes,
  FileText,
  Calendar,
  ArrowUpDown,
  RotateCcw,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Package,
  CheckCircle2
} from "lucide-react";


// --- Types ---

interface Category {
  id: number;
  name: string;
  description: string;
  taxes: string;
  productCount: number;
  createdOn: string;
}

interface HistoryItem {
  id: string;
  action: "Add" | "Edit" | "Delete";
  details: string;
  timestamp: string;
}

type ModalType = "add" | "edit" | "download" | "filter" | "history" | "success" | null;

// --- Mock Data ---

const INITIAL_CATEGORIES: Category[] = Array.from({ length: 25 }).map((_, i) => ({
  id: i + 1,
  name: ["Drinks", "Electronics", "Furniture", "Clothing", "Groceries", "Toys", "Books", "Beauty"][i % 8] + (i > 7 ? ` ${Math.floor(i/8)}` : ""),
  description: i % 3 === 0 ? "Premium quality items" : "Standard category description",
  taxes: i % 4 === 0 ? "Standard Tax (15%)" : "No taxes",
  productCount: Math.floor(Math.random() * 150) + 10,
  createdOn: new Date(2024, 0, 1 + i).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}));

// --- Main Component ---

export default function App() {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [successMessage, setSuccessMessage] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Form state for Add/Edit
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    taxes: "No taxes",
    productCount: 0
  });

  // Filter state
  const [sortBy, setSortBy] = useState("Name (A-Z)");

  // --- Logic ---

  const filteredCategories = useMemo(() => {
    let result = categories.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortBy === "Name (A-Z)") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "Name (Z-A)") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "Date (Oldest First)") {
      result.sort((a, b) => new Date(a.createdOn).getTime() - new Date(b.createdOn).getTime());
    } else if (sortBy === "Date (Newest First)") {
      result.sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime());
    }

    return result;
  }, [categories, searchQuery, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  // Stats for current page
  const currentPageProductCount = paginatedCategories.reduce((sum, c) => sum + c.productCount, 0);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedCategories.map(c => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      const deletedCategory = categories.find(c => c.id === id);
      setCategories(categories.filter(c => c.id !== id));
      addHistory("Delete", `Deleted category: ${deletedCategory?.name || 'Unknown'}`);
      showSuccess("Category deleted successfully!");
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.size} categories?`)) {
      const deletedCount = selectedIds.size;
      setCategories(categories.filter(c => !selectedIds.has(c.id)));
      setSelectedIds(new Set());
      addHistory("Bulk Delete", `Deleted ${deletedCount} categories`);
      showSuccess(`${deletedCount} categories deleted successfully!`);
    }
  };

  const openModal = (type: ModalType, category?: Category) => {
    if (type === "edit" && category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        taxes: category.taxes,
        productCount: category.productCount
      });
    } else if (type === "add") {
      setEditingCategory(null);
      setFormData({ name: "", description: "", taxes: "No taxes", productCount: 0 });
    }
    setActiveModal(type);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      setCategories(categories.map(c => c.id === editingCategory.id ? { 
        ...c, 
        ...formData
      } : c));
      addHistory("Edit", `Updated category: ${formData.name}`);
      showSuccess("Category updated successfully!");
    } else {
      const newCategory: Category = {
        id: Math.max(0, ...categories.map(c => c.id)) + 1,
        ...formData,
        createdOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      };
      setCategories([newCategory, ...categories]);
      addHistory("Add", `Created new category: ${formData.name}`);
      showSuccess("New category created successfully!");
    }
    setActiveModal(null);
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setActiveModal("success");
    setTimeout(() => setActiveModal(null), 2000);
  };

  const addHistory = (action: string, details: string) => {
    const mapAction = (act: string): "Add" | "Edit" | "Delete" => {
      if (act === "Add") return "Add";
      if (act === "Delete" || act === "Bulk Delete") return "Delete";
      return "Edit";
    };

    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      action: mapAction(action),
      details,
      timestamp: new Date().toLocaleString()
    };
    setHistory(prev => [newItem, ...prev].slice(0, 50));
  };

  const handleDownload = (scope: 'current' | 'all', format: 'pdf' | 'csv') => {
    const dataToExport = scope === 'current' ? paginatedCategories : filteredCategories;
    
    // Simulate file generation
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `categories_${scope}_${new Date().getTime()}.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    showSuccess(`${format.toUpperCase()} file for ${scope} page(s) downloaded!`);
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      {/* Header Section */}
      <header className="bg-indigo-600 px-6 py-10 flex justify-between items-center shadow-xl relative overflow-hidden rounded-2xl">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-400 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
            Categories
          </h1>
          <p className="text-indigo-100 mt-2 font-medium tracking-wide">Manage your product hierarchy with precision</p>
        </div>
        
        <div className="relative z-10 bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/30 shadow-2xl">
          <Boxes size={48} className="text-white" strokeWidth={2} />
        </div>
      </header>

      {/* Toolbar Section */}
      <div className="  mx-auto px-6 mt-6 relative z-20">
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-200 flex flex-wrap items-center gap-3">
          <button 
            onClick={() => openModal("add")}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold transition-all   hover:shadow-blue-200 shadow-lg active:scale-95 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Add Category
          </button>
          
          <button 
            onClick={() => openModal("download")}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-5 py-3 rounded-xl font-bold border  border-slate-200 transition-all shadow-sm active:scale-95"
          >
            <Download size={20} className="text-indigo-600" /> Download <ChevronDown size={16} />
          </button>

          <button 
            onClick={() => openModal("filter")}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-5 py-3 rounded-xl font-bold border border-slate-200 transition-all shadow-sm active:scale-95"
          >
            <Filter size={20} className="text-indigo-600" /> Filter <ChevronDown size={16} />
          </button>

          <button 
            onClick={handleBulkDelete}
            disabled={selectedIds.size === 0}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all shadow-sm ${
              selectedIds.size > 0 
                ? "bg-rose-500 hover:bg-rose-600 text-white" 
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Trash2 size={20} /> Delete {selectedIds.size > 0 && `(${selectedIds.size})`}
          </button>

          <div className="flex-grow max-w-md ml-auto relative">
            <input 
              type="text" 
              placeholder="Search by name or description..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12 shadow-inner transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <button 
            onClick={() => openModal("history")}
            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
            title="History"
          >
            <History size={20} />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 ">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4  hover:border-blue-300 hover:translate-y-1.5 transition-transform duration-300">
            <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
              <Boxes size={24} />
            </div>
            <div className=" hover:border-blue-300 ">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categories on Page</p>
              <p className="text-2xl font-black text-slate-800">{paginatedCategories.length}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4  hover:border-blue-300 hover:translate-y-1.5 transition-transform duration-300">
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600 ">
              <Package size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Products on Page</p>
              <p className="text-2xl font-black text-slate-800">{currentPageProductCount}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4  hover:border-blue-300 hover:translate-y-1.5 transition-transform duration-300">
            <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
              <Filter size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Categories</p>
              <p className="text-2xl font-black text-slate-800">{filteredCategories.length}</p>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="mt-6 bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-5 w-16">
                    <div className="flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        checked={paginatedCategories.length > 0 && selectedIds.size === paginatedCategories.length}
                        onChange={handleSelectAll}
                      />
                    </div>
                  </th>
                  <th className="p-5 font-bold text-xs text-slate-500 uppercase tracking-widest">Category Name</th>
                  <th className="p-5 font-bold text-xs text-slate-500 uppercase tracking-widest">Description</th>
                  <th className="p-5 font-bold text-xs text-slate-500 uppercase tracking-widest">Taxes</th>
                  <th className="p-5 font-bold text-xs text-slate-500 uppercase tracking-widest">Products</th>
                  <th className="p-5 font-bold text-xs text-slate-500 uppercase tracking-widest">Created On</th>
                  <th className="p-5 font-bold text-xs text-slate-500 uppercase tracking-widest text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedCategories.length > 0 ? (
                  paginatedCategories.map((category) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={category.id} 
                      className="group hover:bg-indigo-50/30 transition-colors"
                    >
                      <td className="p-5">
                        <div className="flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            checked={selectedIds.has(category.id)}
                            onChange={() => handleSelectOne(category.id)}
                          />
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                            {category.name.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-800">{category.name}</span>
                        </div>
                      </td>
                      <td className="p-5 text-slate-600 text-sm max-w-xs truncate">{category.description}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${category.taxes === 'No taxes' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>
                          {category.taxes}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <Package size={14} className="text-slate-400" />
                          <span className="font-mono font-bold text-slate-700">{category.productCount}</span>
                        </div>
                      </td>
                      <td className="p-5 text-slate-500 text-sm font-medium">{category.createdOn}</td>
                      <td className="p-5">
                        <div className="flex justify-center items-center gap-3">
                          <button 
                            onClick={() => openModal("edit", category)}
                            className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all"
                            title="Edit"
                          >
                            <SquarePen size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(category.id)}
                            className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="bg-slate-100 p-6 rounded-full">
                          <Search size={48} className="text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-medium italic">No categories found matching your search.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="bg-slate-50 p-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-500">Items per page:</span>
              <select 
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <span className="text-sm font-medium text-slate-400">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCategories.length)} of {filteredCategories.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 2 + i;
                    if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                  }
                  
                  return (
                    <button 
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                        currentPage === pageNum 
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                          : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            
            {/* Add/Edit Modal */}
            {(activeModal === "add" || activeModal === "edit") && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200"
              >
                <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">
                      {activeModal === "edit" ? "Edit Category" : "New Category"}
                    </h2>
                    <p className="text-indigo-100 text-sm font-medium">Fill in the details below</p>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>
                
                <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* <div className="col-span-full">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Category Image</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer group bg-slate-50">
                        <input type="file" className="hidden" id="category-image" />
                        <label htmlFor="category-image" className="cursor-pointer">
                          <ImageIcon className="mx-auto text-slate-300 group-hover:text-indigo-500 mb-2 transition-colors" size={40} />
                          <p className="text-sm text-slate-500 font-bold">Click to upload or drag & drop</p>
                          <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                        </label>
                      </div>
                    </div> */}

                    <div className="col-span-full">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Category Name*</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Electronics"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="col-span-full">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                      <textarea 
                        placeholder="What's this category about?"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none h-28 resize-none font-medium text-slate-600"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Applicable Taxes</label>
                      <select 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 appearance-none"
                        value={formData.taxes}
                        onChange={(e) => setFormData({...formData, taxes: e.target.value})}
                      >
                        <option value="No taxes">No taxes</option>
                        <option value="Standard Tax (15%)">Standard Tax (15%)</option>
                        <option value="Reduced Tax (5%)">Reduced Tax (5%)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Initial Product Count</label>
                      <input 
                        type="number" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                        value={formData.productCount}
                        onChange={(e) => setFormData({ ...formData, productCount: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setFormData({ name: "", description: "", taxes: "No taxes", productCount: 0 })}
                      className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 flex items-center justify-center gap-2 transition-all"
                    >
                      <RotateCcw size={20} /> Reset
                    </button>
                    <button 
                      type="submit"
                      className="flex-[2] px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95"
                    >
                      {activeModal === "edit" ? "Update Category" : "Create Category"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Download Modal */}
            <DownloadModal
              isOpen={activeModal === "download"}
              onClose={() => setActiveModal(null)}
              onDownload={handleDownload}
              title="Export Data"
              subtitle="Choose your preferred format"
            />

            {/* Success Modal */}
            {activeModal === "success" && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white p-8 rounded-[2rem] shadow-2xl flex flex-col items-center gap-4 text-center border border-slate-200"
              >
                <div className="bg-emerald-100 text-emerald-600 p-4 rounded-full">
                  <CheckCircle2 size={48} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">Success!</h3>
                  <p className="text-slate-500 font-medium">{successMessage}</p>
                </div>
              </motion.div>
            )}

            {/* Filter Modal */}
            {activeModal === "filter" && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
              >
                <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
                  <h2 className="text-xl font-black flex items-center gap-2 uppercase tracking-tight">
                    <Filter size={24} /> Sort Options
                  </h2>
                  <button onClick={() => setActiveModal(null)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Order By</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {["Name (A-Z)", "Name (Z-A)", "Date (Oldest First)", "Date (Newest First)"].map(opt => (
                        <button 
                          key={opt}
                          onClick={() => setSortBy(opt)}
                          className={`px-4 py-3 rounded-xl text-sm font-bold border transition-all text-left flex justify-between items-center ${
                            sortBy === opt 
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" 
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300"
                          }`}
                        >
                          {opt}
                          {sortBy === opt && <CheckCircle2 size={16} />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all mt-4 active:scale-95"
                  >
                    Apply Changes
                  </button>
                </div>
              </motion.div>
            )}

            {/* History Modal */}
            <HistoryModal
              isOpen={activeModal === "history"}
              onClose={() => setActiveModal(null)}
              history={history}
              title="Activity Log"
              subtitle="Recent category actions"
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
