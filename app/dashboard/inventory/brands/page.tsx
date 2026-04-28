"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit3,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  FileText,
  Table as TableIcon
} from "lucide-react";

import jsPDF from "jspdf";
import "jspdf-autotable";
import HistoryModal, { HistoryItem as HistoryItemType } from "@/components/history-modal";
import DownloadModal from "@/components/download-modal";
import {
  AddButton,
  EditButton,
  DeleteButton,
  DownloadButton,
  FilterButton,
  HistoryButton
} from "@/components/toolbar-buttons";
import { generatePDFWithLogo, generateCSV } from "@/lib/pdf-export";
import { createBrand, getBrands, updateBrand, } from "@/app/services/brand/brand.service";
import { fetchInventory } from "@/app/services/comon/service.fetchInventory";
import { useNotification } from "@/hooks/useNotification";
import { Notification } from "@/components/Notification";

// Extend jsPDF with autotable types
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface Brand {
  id: number,
  name: string,
  branch_id: string,
  brand_image: string,
  created_at: string,
  updated_at: string,
  created_by: string,
  product_count: number
}

interface HistoryItem {
  id: string;
  action: "Add" | "Edit" | "Delete";
  details: string;
  timestamp: string;
}

export default function App() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const { notification, showNotification } = useNotification();
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
    brand_image: "",
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

  useEffect(() => {
    async function fetchBrands() {
      try {
        const data = await getBrands();

        // console.log("Fetched brands data:", data.data.items); // Log the fetched data

        setBrands(data.data.items || []);
      } catch (error) {
        console.error("Error fetching brands:", error);
        showNotification("Failed to load brands", 'error');
      }
    }
    fetchBrands();
  }, []);

  // Filter and Sort Logic
  const processedBrands = useMemo(() => {
    let filtered = brands.filter(b =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase())
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
      branch_id: `branch${Math.max(0, ...brands.map(b => b.id)) + 1}`,
      name: formData.name,
      brand_image: formData.brand_image,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: "Current User", // Replace with actual user
      product_count: 0
    };
    // TODO: Call API to save new brand to backend
    const createBrandD = async (p0: { name: string; image: string; }) => {
      try {
        const data = await createBrand({
          name: newBrand.name, brand_image: ""
        });
        // console.log("Created brand response:", data);
        showNotification(`Brand "${newBrand.name}" created successfully!`, 'success');
      } catch (error) {
        console.error("Error creating brand:", error);
        showNotification("Failed to create brand", 'error');
      }
    };

    createBrandD({ name: newBrand.name, image: newBrand.brand_image });

    setBrands([newBrand, ...brands]);
    addHistory(`Added brand: ${newBrand.name}`);
    setFormData({ name: "", brand_image: "", });
    setIsAddModalOpen(false);

  };

  const updateBrandD = async ({
    brandId,
    name,
    brand_image,
  }: {
    brandId: number;
    name: string;
    brand_image: string;
  }) => {
    try {
      const data = await updateBrand(
        brandId,
        {
          name,
          brand_image,
        }
      );

      // console.log("Updated brand response:", data);
      return data;
    } catch (error) {
      console.error("Error updating brand:", error);
      throw error;
    }
  };

  const handleEditBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand) return;

    try {
      const response = await updateBrandD({
        brandId: editingBrand.id,
        name: formData.name,
        brand_image: "images/apple.jpg", // Replace with actual image handling
      });

      const updatedItem = response.data;

      setBrands((prev) =>
        prev.map((b) =>
          b.id === updatedItem.id ? updatedItem : b
        )
      );

      addHistory(`Updated brand: ${formData.name}`);
      showNotification(
        `Brand "${formData.name}" updated successfully!`,
        "success"
      );

      // Cleanup
      setIsEditModalOpen(false);
      setEditingBrand(null);
      setFormData({ name: "", brand_image: "" });

    } catch (error) {
      console.error("Update failed:", error);
      showNotification("Failed to update brand", "error");
    }
  };



  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      brand_image: brand.brand_image
    });

    // console.log("Opening edit modal for brand:", brand.id, brand.name); // Log the brand being edited

    setIsEditModalOpen(true);
  };

  const handleDelete = (id: number) => {
    const brandToDelete = brands.find(b => b.id === id);
    if (brandToDelete) {
      // Show confirmation with two notifications
      const confirmDelete = window.confirm(`Are you sure you want to delete "${brandToDelete.name}"?`);
      if (confirmDelete) {
        setBrands(brands.filter(b => b.id !== id));
        setSelectedBrands(selectedBrands.filter(sid => sid !== id));
        addHistory(`Deleted brand: ${brandToDelete.name}`);
        showNotification(`Brand "${brandToDelete.name}" deleted successfully!`, 'success');
      }
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

  return (
    <div className="min-h-screen bg-gray-50  font-sans text-gray-900">
      {notification && <Notification message={notification.message} type={notification.type} />}
      <div className=" mx-auto space-y-6">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-blue-600 p-8 text-white shadow-xl overflow-hidden relative"
        >
          <div className="relative z-10">
            <h1 className="text-4xl font-bold tracking-tight">Brands Dashboard</h1>
            <p className="text-blue-100 mt-2 text-lg font-light">Manage and monitor your product brands with ease.</p>
          </div>
          {/* Decorative background circle */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
        </motion.div>

        {/* Toolbar Section */}
        <div className="flex flex-wrap gap-3 items-center bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <AddButton onClick={() => {
            setFormData({ name: "", brand_image: "", });
            setIsAddModalOpen(true);
          }} label="Create Brand"></AddButton>

          <div className="flex items-center gap-2">
            <DownloadButton onClick={() => setIsDownloadModalOpen(true)} />

            <DownloadModal
              isOpen={isDownloadModalOpen}
              onClose={() => setIsDownloadModalOpen(false)}
              onDownload={(scope, format) => {
                const data = scope === 'current' ? currentItems : processedBrands;
                const columns = ["Brand Name", "Products", "Created By", "Created On"];
                const rows = data.map(b => [
                  b.name,
                  b.brand_image,
                  b.branch_id,
                  b.created_by,
                  b.created_at,

                ]);

                if (format === 'csv') {
                  generateCSV(columns, rows, `brands_${scope}_${new Date().getTime()}.csv`);
                } else if (format === 'pdf') {
                  generatePDFWithLogo({
                    title: `Brands Report (${scope === 'current' ? 'Current Page' : 'All Pages'})`,
                    columns,
                    rows,
                    fileName: `brands_${scope}_${new Date().getTime()}.pdf`,
                    scope
                  });
                }
              }}
              title="Export Brands"
              subtitle="Choose your preferred format"
            />

            <div className="relative" ref={filterMenuRef}>
              <FilterButton onClick={() => setShowFilterMenu(!showFilterMenu)} />

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
                      <button onClick={() => handleSort('name', 'asc')} className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors">Name (A-Z)</button>
                      <button onClick={() => handleSort('name', 'desc')} className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors">Name (Z-A)</button>
                    </div>
                    <button onClick={() => { setSortConfig(null); setShowFilterMenu(false); }} className="w-full text-left px-4 py-3 text-sm font-semibold text-red-600 border-t hover:bg-red-50 transition-colors">Reset Filters</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>


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

          <HistoryButton onClick={() => setIsHistoryModalOpen(true)} />
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-blue-600 text-white">
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
                  <th className="p-4 font-semibold uppercase tracking-wider text-xs">Created By</th>
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
                      key={brand.id + (Math.random() * 1000).toString()} // Use a more stable key in production
                      className={`hover:bg-blue-50/30 transition-colors ${selectedBrands.includes(brand.id) ? 'bg-blue-50/50' : ''}`}
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
                        <div className="flex flex-row items-center gap-3">
                          {/* <span className="text-xs text-gray-500">Slug: {brand.brand_image}</span> */}
                          <span className="rounded-full">
                            <img
                              className="rounded-full border-2 border-slate-200"
                              src="/desipayments_logo.png"
                              width={50}
                              height={50}
                              alt="brand"
                            />
                          </span>
                          <span className="font-bold text-gray-900">{brand.name}</span>

                        </div>
                      </td>
                      <td className="p-4 text-gray-600 font-medium">{new Date(brand.created_at).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className="bg-blue-100 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-indigo-200">
                          {brand.product_count}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="bg-blue-100 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-indigo-200">
                          {brand.created_by || "Unknown"}
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
                    className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${currentPage === page
                      ? 'bg-blue-600 text-white shadow-md shadow-indigo-200'
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
              setBrands([]);
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
              showNotification('Changes applied successfully!', 'success');
            }}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all shadow-md shadow-indigo-200"
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
              <div className="bg-blue-600 p-6 text-white">
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
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Brand Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData({ ...formData, brand_image: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}

                  />
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
                    className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all shadow-md shadow-indigo-200"
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
          key={"history-modal"}
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
