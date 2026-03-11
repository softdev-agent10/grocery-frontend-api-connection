"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
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
  X,
  FileText,
  Table as TableIcon,
  RotateCcw,
  Check
} from "lucide-react";
import DownloadModal from "@/components/download-modal";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- Types ---

interface Unit {
  id: string;
  name: string;
  shortName: string;
  price: number;
  quantity: number;
  upc: string;
  createdAt: string;
}

type SortOption = 
  | "name-asc" | "name-desc" 
  | "price-low" | "price-high" 
  | "qty-low" | "qty-high" 
  | "upc-asc" | "upc-desc";

// --- Mock Data ---

const INITIAL_UNITS: Unit[] = [
  { id: "1", name: "Kilogram", shortName: "kg", price: 12.5, quantity: 150, upc: "UPC001", createdAt: "2024-01-01" },
  { id: "2", name: "Gram", shortName: "g", price: 0.05, quantity: 5000, upc: "UPC002", createdAt: "2024-01-02" },
  { id: "3", name: "Liter", shortName: "L", price: 8.0, quantity: 80, upc: "UPC003", createdAt: "2024-01-03" },
  { id: "4", name: "Piece", shortName: "pcs", price: 1.0, quantity: 1200, upc: "UPC004", createdAt: "2024-01-04" },
  { id: "5", name: "Box", shortName: "box", price: 45.0, quantity: 25, upc: "UPC005", createdAt: "2024-01-05" },
  { id: "6", name: "Dozen", shortName: "dz", price: 15.0, quantity: 60, upc: "UPC006", createdAt: "2024-01-06" },
  { id: "7", name: "Meter", shortName: "m", price: 5.5, quantity: 300, upc: "UPC007", createdAt: "2024-01-07" },
  { id: "8", name: "Pack", shortName: "pk", price: 22.0, quantity: 45, upc: "UPC008", createdAt: "2024-01-08" },
  { id: "9", name: "Roll", shortName: "roll", price: 3.2, quantity: 110, upc: "UPC009", createdAt: "2024-01-09" },
  { id: "10", name: "Set", shortName: "set", price: 120.0, quantity: 15, upc: "UPC010", createdAt: "2024-01-10" },
  { id: "11", name: "Case", shortName: "case", price: 85.0, quantity: 10, upc: "UPC011", createdAt: "2024-01-11" },
  { id: "12", name: "Bag", shortName: "bag", price: 18.5, quantity: 200, upc: "UPC012", createdAt: "2024-01-12" },
];

// --- Components ---

export default function App() {
  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortBy, setSortBy] = useState<SortOption | "">("");
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ name: "", shortName: "" });

  // --- Logic ---

  const filteredAndSortedUnits = useMemo(() => {
    let result = units.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.upc.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy) {
      result = [...result].sort((a, b) => {
        switch (sortBy) {
          case "name-asc": return a.name.localeCompare(b.name);
          case "name-desc": return b.name.localeCompare(a.name);
          case "price-low": return a.price - b.price;
          case "price-high": return b.price - a.price;
          case "qty-low": return a.quantity - b.quantity;
          case "qty-high": return b.quantity - a.quantity;
          case "upc-asc": return a.upc.localeCompare(b.upc);
          case "upc-desc": return b.upc.localeCompare(a.upc);
          default: return 0;
        }
      });
    }

    return result;
  }, [units, searchTerm, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedUnits.length / itemsPerPage);
  const paginatedUnits = filteredAndSortedUnits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage, sortBy]);

  const handleSave = () => {
    if (!formData.name || !formData.shortName) return;

    if (editingUnit) {
      setUnits(prev => prev.map(u => u.id === editingUnit.id ? { ...u, ...formData } : u));
    } else {
      const newUnit: Unit = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        shortName: formData.shortName,
        price: 0,
        quantity: 0,
        upc: `UPC${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setUnits(prev => [newUnit, ...prev]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this unit?")) {
      setUnits(prev => prev.filter(u => u.id !== id));
    }
  };

  const openModal = (unit?: Unit) => {
    if (unit) {
      setEditingUnit(unit);
      setFormData({ name: unit.name, shortName: unit.shortName });
    } else {
      setEditingUnit(null);
      setFormData({ name: "", shortName: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUnit(null);
    setFormData({ name: "", shortName: "" });
  };

  const handleDownload = (scope: 'current' | 'all', format: 'pdf' | 'csv') => {
    const data = scope === 'current' ? paginatedUnits : filteredAndSortedUnits;
    if (format === 'pdf') exportPDF(data, `units_${scope}_page`);
    else exportCSV(data, `units_${scope}_page`);
    setIsDownloadModalOpen(false);
  };

  // --- Export Functions ---

  const exportCSV = (data: Unit[], filename: string) => {
    const headers = ["Name", "Short Name", "Price", "Quantity", "UPC", "Created At"];
    const rows = data.map(u => [u.name, u.shortName, u.price, u.quantity, u.upc, u.createdAt]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
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

  const exportPDF = (data: Unit[], filename: string) => {
    const doc = new jsPDF();
    doc.text("Inventory Units Report", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [["Name", "Short Name", "Price", "Quantity", "UPC", "Created At"]],
      body: data.map(u => [u.name, u.shortName, `$${u.price.toFixed(2)}`, u.quantity, u.upc, u.createdAt]),
    });
    doc.save(`${filename}.pdf`);
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-gray-50  font-sans text-gray-900">
      <div className="    space-y-6">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-8 text-white shadow-xl shadow-blue-200/50"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Units Management</h1>
              <p className="text-blue-100 mt-2 font-medium opacity-90">Create and manage measurement units for your inventory system.</p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openModal()}
              className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg hover:bg-blue-50 transition-all cursor-pointer"
            >
              <Plus size={20} /> Create Unit
            </motion.button>
          </div>
        </motion.div>

        {/* Toolbar Section */}
        <div className="flex flex-wrap gap-3 items-center bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="relative flex-1 min-w-[280px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search units, short names or UPC..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Download Modal */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsDownloadModalOpen(true)}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-gray-50 transition-all"
            >
              <Download size={18} className="text-blue-600" /> Download
            </motion.button>
            
            <DownloadModal
              isOpen={isDownloadModalOpen}
              onClose={() => setIsDownloadModalOpen(false)}
              onDownload={handleDownload}
              title="Export Units"
              subtitle="Choose your preferred format"
            />

            {/* Filter Dropdown */}
            <div className="relative">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`px-4 py-3 text-black hover:bg-blue-800 rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer border ${sortBy ? ' text-black hover:bg-blue-800  border-blue-200' : 'text-black hover:bg-blue-800  border-gray-200  '}`}
              >
                <Filter size={18} /> Filter
              </motion.button>

              <AnimatePresence>
                {showFilterMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowFilterMenu(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-20 overflow-hidden"
                    >
                      <div className="p-2 space-y-1">
                        <p className="px-3 py-2 text-[14px] uppercase tracking-wider font-bold text-gray-400 ">Sort By</p>
                        {[
                          { id: "name-asc", label: "Name (A-Z)" },
                          { id: "name-desc", label: "Name (Z-A)" },
                          { id: "price-low", label: "Price (Low to High)" },
                          { id: "price-high", label: "Price (High to Low)" },
                          { id: "qty-low", label: "Quantity (Low to High)" },
                          { id: "qty-high", label: "Quantity (High to Low)" },
                          { id: "upc-asc", label: "UPC (Ascending)" },
                          { id: "upc-desc", label: "UPC (Descending)" },
                        ].map((opt) => (
                          <button 
                            key={opt.id}
                            onClick={() => { setSortBy(opt.id as SortOption); setShowFilterMenu(false); }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${sortBy === opt.id ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-300'}`}
                          >
                            {opt.label}
                            {sortBy === opt.id && <Check size={14} />}
                          </button>
                        ))}
                        
                        <div className="h-px bg-gray-100 my-1" />
                        
                        <button 
                          onClick={() => { setSortBy(""); setShowFilterMenu(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold"
                        >
                          <RotateCcw size={16} /> Reset Filters
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-blue-600 border-b border-gray-200 text-white uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="p-5">Unit Name</th>
                  <th className="p-5">Short Name</th>
                  <th className="p-5">Price</th>
                  <th className="p-5">Quantity</th>
                  <th className="p-5">UPC</th>
                  <th className="p-5">Created At</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence mode="popLayout">
                  {paginatedUnits.length > 0 ? (
                    paginatedUnits.map((unit) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={unit.id} 
                        className="hover:bg-blue-50/30 transition-colors group"
                      >
                        <td className="p-5 font-semibold text-gray-900">{unit.name}</td>
                        <td className="p-5">
                          <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide">
                            {unit.shortName}
                          </span>
                        </td>
                        <td className="p-5 text-gray-600 font-medium">${unit.price.toFixed(2)}</td>
                        <td className="p-5">
                          <span className={`font-bold ${unit.quantity < 50 ? 'text-orange-600' : 'text-emerald-600'}`}>
                            {unit.quantity}
                          </span>
                        </td>
                        <td className="p-5 text-gray-500 font-mono text-xs">{unit.upc}</td>
                        <td className="p-5 text-gray-400">{unit.createdAt}</td>
                        <td className="p-5">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openModal(unit)}
                              className="text-blue-600 hover:bg-blue-100 p-2.5 rounded-xl transition-colors cursor-pointer"
                            >
                              <Edit3 size={18} />
                            </motion.button>
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(unit.id)}
                              className="text-red-600 hover:bg-red-100 p-2.5 rounded-xl transition-colors cursor-pointer"
                            >
                              <Trash2 size={18} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-20 text-center">
                        <div className="flex flex-col items-center gap-3 text-gray-400">
                          <Search size={48} strokeWidth={1.5} />
                          <p className="text-lg font-medium">No units found matching your search.</p>
                          <button onClick={() => { setSearchTerm(""); setSortBy(""); }} className="text-blue-600 font-bold hover:underline">Clear all filters</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="bg-gray-50 p-5 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select 
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="bg-white border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>entries</span>
              </div>
              <span className="hidden sm:inline text-gray-300">|</span>
              <span>
                Showing <span className="text-gray-900 font-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredAndSortedUnits.length)}</span> to <span className="text-gray-900 font-bold">{Math.min(currentPage * itemsPerPage, filteredAndSortedUnits.length)}</span> of <span className="text-gray-900 font-bold">{filteredAndSortedUnits.length}</span> units
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${currentPage === page ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold">{editingUnit ? "Edit Unit" : "Create New Unit"}</h2>
                <button onClick={closeModal} className="hover:bg-black p-1 rounded-lg transition-colors cursor-pointer">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Unit Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Kilogram" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Unit Short Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. kg" 
                    value={formData.shortName}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    {editingUnit ? "Update Unit" : "Save Unit"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
