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
  Check,
  History
} from "lucide-react";
import DownloadModal from "@/components/download-modal";
import HistoryModal, { HistoryItem as HistoryItemType } from "@/components/history-modal";
import {
  AddButton,
  EditButton,
  DeleteButton,
  DownloadButton,
  FilterButton,
  HistoryButton
} from "@/components/toolbar-buttons";
import { generatePDFWithLogo, generateCSV } from "@/lib/pdf-export";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { createUnits, getUnits, updateUnits } from "@/app/services/units/units.service";
import { fetchInventory } from "@/app/services/comon/service.fetchInventory";

// --- Types ---

interface Unit {
  id: string;
  name: string;
  shortName: string;
  productCount: number;
  createdAt: string;
}

type SortOption =
  | "name-asc" | "name-desc"
  | "productCount-low" | "productCount-high";

interface HistoryItem {
  id: string;
  action: "Add" | "Edit" | "Delete";
  details: string;
  timestamp: string;
}

// --- Mock Data ---

// const INITIAL_UNITS: Unit[] = [
//   { id: "1", name: "Kilogram", shortName: "kg", productCount: 150, createdAt: "2024-01-01" },
//   { id: "2", name: "Gram", shortName: "g", productCount: 5000, createdAt: "2024-01-02" },
//   { id: "3", name: "Liter", shortName: "L", productCount: 80, createdAt: "2024-01-03" },
//   { id: "4", name: "Piece", shortName: "pcs", productCount: 1200, createdAt: "2024-01-04" },
//   { id: "5", name: "Box", shortName: "box", productCount: 25, createdAt: "2024-01-05" },
//   { id: "6", name: "Dozen", shortName: "dz", productCount: 60, createdAt: "2024-01-06" },
//   { id: "7", name: "Meter", shortName: "m", productCount: 300, createdAt: "2024-01-07" },
//   { id: "8", name: "Pack", shortName: "pk", productCount: 45, createdAt: "2024-01-08" },
//   { id: "9", name: "Roll", shortName: "roll", productCount: 110, createdAt: "2024-01-09" },
//   { id: "10", name: "Set", shortName: "set", productCount: 15, createdAt: "2024-01-10" },
//   { id: "11", name: "Case", shortName: "case", productCount: 10, createdAt: "2024-01-11" },
//   { id: "12", name: "Bag", shortName: "bag", productCount: 200, createdAt: "2024-01-12" },
// ];

// --- Components ---

export default function App() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortBy, setSortBy] = useState<SortOption | "">("");
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Form State
  const [formData, setFormData] = useState({ name: "", shortName: "" });

  // --- Logic ---

  const filteredAndSortedUnits = useMemo(() => {
    let result = units.filter(u =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.shortName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy) {
      result = [...result].sort((a, b) => {
        switch (sortBy) {
          case "name-asc": return a.name.localeCompare(b.name);
          case "name-desc": return b.name.localeCompare(a.name);
          case "productCount-low": return a.productCount - b.productCount;
          case "productCount-high": return b.productCount - a.productCount;
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
    async function fetchUnits() {
      try {
        // const data = await getUnits({
        //   branchId: 1234567890,
        //   token: "1234",
        // });
        const data = await fetchInventory("units", {
          branchId: "1234567890",
          token: "1234",
          page: 1,
          limit: 100,
          sortBy: "name",
          sortOrder: "asc",
        });

        const mappedUnits: Unit[] = data.data.items.map((item: any) => ({
          id: item.id.toString(),
          name: item.name,
          shortName: item.short_name,
          productCount: item.product_count ?? 0,
          createdAt: item.created_at,
        }));

        setUnits(mappedUnits);
      } catch (error) {
        console.error("Error fetching units:", error);
      }
    }

    fetchUnits();
  }, []);

  const addHistory = (action: string, details: string) => {
    const mapAction = (act: string): "Add" | "Edit" | "Delete" => {
      if (act === "Add") return "Add";
      if (act === "Delete") return "Delete";
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

  const handleSave = async () => {
    if (!formData.name || !formData.shortName) return;

    try {
      if (editingUnit) {
        console.log(editingUnit)
        // ✅ CALL UPDATE API
        const res = await updateUnits({
          brandId: editingUnit.id, // ⚠️ API expects string
          branchId: 1234567890,
          token: "1234",
          name: formData.name,
          short_name: formData.shortName,
        });

        console.log("Update response:", res);

        // ✅ Update UI AFTER success
        setUnits(prev =>
          prev.map(u =>
            u.id === editingUnit.id
              ? {
                ...u,
                name: formData.name,
                shortName: formData.shortName,
              }
              : u
          )
        );

        addHistory("Edit", `Updated unit: ${formData.name}`);
      } else {
        // ✅ CREATE (already done earlier)
        const res = await createUnits({
          branchId: 1234567890,
          token: "1234",
          name: formData.name,
          short_name: formData.shortName,
        });

        const newUnit: Unit = {
          id: res.data?.id?.toString() || Math.random().toString(),
          name: res.data?.name || formData.name,
          shortName: res.data?.short_name || formData.shortName,
          productCount: res.data?.product_count ?? 0,
          createdAt: res.data?.created_at || new Date().toISOString(),
        };

        setUnits(prev => [newUnit, ...prev]);

        addHistory("Add", `Created new unit: ${formData.name}`);
      }

      closeModal();
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const handleDelete = (id: string) => {
    const unit = units.find(u => u.id === id);
    if (window.confirm("Are you sure you want to delete this unit?")) {
      setUnits(prev => prev.filter(u => u.id !== id));
      addHistory("Delete", `Deleted unit: ${unit?.name}`);
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
    const columns = ['Name', 'Short Name', 'Product Count', 'Created At'];
    const rows = data.map(u => [
      u.name,
      u.shortName,
      u.productCount,
      u.createdAt
    ]);

    if (format === 'csv') {
      generateCSV(columns, rows, `units_${scope}_${new Date().getTime()}.csv`);
    } else if (format === 'pdf') {
      generatePDFWithLogo({
        title: `Units Report (${scope === 'current' ? 'Current Page' : 'All Pages'})`,
        columns,
        rows,
        fileName: `units_${scope}_${new Date().getTime()}.pdf`,
        scope
      });
    }

    setIsDownloadModalOpen(false);
  };

  // --- Export Functions ---

  const exportCSV = (data: Unit[], filename: string) => {
    const headers = ["Name", "Short Name", "Product Count", "Created At"];
    const rows = data.map(u => [u.name, u.shortName, u.productCount, u.createdAt]);
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
      head: [["Name", "Short Name", "Products", "Created At"]],
      body: data.map(u => [u.name, u.shortName, u.productCount, u.createdAt]),
    });
    doc.save(`${filename}.pdf`);
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-gray-50  font-sans text-gray-900">
      <div className="space-y-6">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-linear-to-br from-blue-700 via-blue-600 to-indigo-700 p-8 text-white shadow-xl shadow-blue-200/50"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Units Management</h1>
              <p className="text-blue-100 mt-2 font-medium opacity-90">Create and manage measurement units for your inventory system.</p>
            </div>
          </div>
        </motion.div>

        {/* Toolbar Section */}
        <div className="flex flex-wrap gap-3 items-center bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">


          <div className="flex items-center gap-2">
            <AddButton onClick={() => openModal()} label="Create Unit" />
            {/* Download Modal */}
            <DownloadButton onClick={() => setIsDownloadModalOpen(true)} />

            <DownloadModal
              isOpen={isDownloadModalOpen}
              onClose={() => setIsDownloadModalOpen(false)}
              onDownload={handleDownload}
              title="Export Units"
              subtitle="Choose your preferred format"
            />



            {/* Filter Dropdown */}
            <div className="relative">
              <FilterButton onClick={() => setShowFilterMenu(!showFilterMenu)} />

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
          <div className="relative flex-1 min-w-70">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search units, short names or UPC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <HistoryButton onClick={() => setIsHistoryOpen(true)} />
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-blue-600 border-b border-gray-200 text-white uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="p-5">Unit Name</th>
                  <th className="p-5">Short Name</th>
                  <th className="p-5">Products</th>
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
                        <td className="p-5">
                          <span className={`font-bold ${unit.productCount < 50 ? 'text-orange-600' : 'text-emerald-600'}`}>
                            {unit.productCount}
                          </span>
                        </td>
                        <td className="p-5 text-gray-400">{unit.createdAt}</td>
                        <td className="p-5">
                          <div className="flex justify-end gap-4  transition-opacity mr-4">
                            {/* <EditButton
                              onClick={() => openModal(unit)}
                              variant="icon"
                            /> */}
                            <div className="bg-slate-200 rounded-full px-2 py-2 w-10 h-10 flex items-center justify-center  group-hover:opacity-100 transition-opacity">
                              <EditButton
                                onClick={() => openModal(unit)}
                                variant="icon"
                                size="lg"
                              />
                            </div>
                            <div className="bg-slate-200 rounded-full px-2 py-2 w-10 h-10 flex items-center justify-center  group-hover:opacity-100 transition-opacity">
                              <DeleteButton
                                onClick={() => handleDelete(unit.id)}
                                variant="icon"
                              />
                            </div>

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
                <button onClick={closeModal} className="hover:bg-white/20 p-1 rounded-lg transition-colors cursor-pointer">
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

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
      />
    </div>
  );
}
