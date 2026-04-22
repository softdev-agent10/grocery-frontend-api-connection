"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HistoryModal, { HistoryItem as HistoryItemType } from "@/components/history-modal";
import DownloadModal from "@/components/download-modal";
import { generatePDFWithLogo, generateCSV } from "@/lib/pdf-export";
import {
  AddButton,
  EditButton,
  DeleteButton,
  DownloadButton,
  FilterButton,
  HistoryButton
} from "@/components/toolbar-buttons";
import {
  Search,
  X,
  Boxes,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Package,
  CheckCircle2,
  SquarePen,
  Trash2,
  RotateCcw,
  Image as ImageIcon,
  Filter
} from "lucide-react";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
} from "@/app/services/categories/service.categories";
import { getTaxes } from "@/app/services/taxes/service.taxes";
import { getFees } from "@/app/services/fees/service.fees";
import { fr, is } from "date-fns/locale";
import { EmailButton } from "@/components/toolbar-buttons/EmailButton";
import { useNotification } from "@/hooks/useNotification";
import { useApiContext } from "@/hooks/useApiContext";
import { Notification } from "@/components/Notification";


// --- Types ---

interface Tax {
  id: number;
  name: string;
  rate: number;
  is_active: boolean;
}

interface Fee {
  id: number;
  name: string;
  amount: number;
  is_percentage: boolean;
  is_active: boolean;
}

interface Category {
  id: number,
  name: string,
  description?: string,
  taxes?: number,
  fees?: number,
  is_active: boolean,
  created_at: string,
  updated_at: string,
  product_count?: number
}

interface HistoryItem {
  id: string;
  action: "Add" | "Edit" | "Delete";
  details: string;
  timestamp: string;
}

interface TableViewColumns {
  checkbox: boolean;
  categoryName: boolean;
  product_count: boolean;
  description: boolean;
  taxes: boolean;
  fees: boolean;
  action: boolean;
  is_active: boolean;
  created_on: boolean;
}

type ModalType = "add" | "edit" | "download" | "filter" | "history" | "success" | null;

// --- Main Component ---

export default function App() {
  // Set API context once (merchant_id, branch_id, token)
  useApiContext('9', '1234567890');

  const [categories, setCategories] = useState<Category[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const { notification, showNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [successMessage, setSuccessMessage] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isEditTableViewOpen, setIsEditTableViewOpen] = useState(false);

  const columnLabels: Record<keyof TableViewColumns, string> = {
    checkbox: "Checkbox",
    categoryName: "Department Name",
    description: "Description",
    taxes: "Taxes",
    fees: "Fees",
    product_count: "Product Count",
    is_active: "Status",
    created_on: "Created On",
    action: "Action",
  };


  // Table view columns state
  const [visibleColumns, setVisibleColumns] = useState<TableViewColumns>({
    checkbox: true,
    categoryName: true,
    description: true,
    taxes: true,
    fees: true,
    is_active: true,
    created_on: true,
    action: true,
    product_count: true
  });

  const [tempColumns, setTempColumns] = useState<TableViewColumns>(visibleColumns);
  const [tempItemsPerPage, setTempItemsPerPage] = useState(itemsPerPage);

  // Form state for Add/Edit
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tax_id: 0,
    fee_id: 0,
    is_active: true,
  });

  // Filter state
  const [sortBy, setSortBy] = useState("Name (A-Z)");

  // --- Logic ---

  const filteredCategories = useMemo(() => {
    let result = categories.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortBy === "Name (A-Z)") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "Name (Z-A)") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "Date (Oldest First)") {
      result.sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
      );
    } else if (sortBy === "Date (Newest First)") {
      result.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );
    }

    return result;
  }, [categories, searchQuery, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  // Stats for current page
  const currentPageProductCount = paginatedCategories.reduce((sum, c) => sum + (c.product_count ?? 0), 0);

  const getCategorie = async () => {
    try {
      const data = await getCategories({ page: 1, limit: 100 });
      setCategories(data.data.items);
      console.log("Fetched categories:", data.data.items);
    } catch (error) {
      console.error("Error fetching categories:", error);
      showNotification("Failed to load departments", 'error');
    }
  };

  const loadTaxes = async () => {
    try {
      const data = await getTaxes({ page: 1, limit: 100 });
      setTaxes(data.data.items);
      console.log("Fetched taxes:", data.data.items);
    } catch (error) {
      console.error("Error fetching taxes:", error);
      showNotification("Failed to load taxes", 'error');
    }
  };

  const loadFees = async () => {
    try {
      const data = await getFees({ page: 1, limit: 100 });
      setFees(data.data.items);
      console.log("Fetched fees:", data.data.items);
    } catch (error) {
      console.error("Error fetching fees:", error);
      showNotification("Failed to load fees", 'error');
    }
  };

  useEffect(() => {
    getCategorie();
    loadTaxes();
    loadFees();
  }, []);

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
      deleteCategory(id).catch(error => {
        console.error("Failed to delete category:", error);
        showNotification("Failed to delete department", 'error');
      });
      addHistory("Delete", `Deleted category: ${deletedCategory?.name || 'Unknown'}`);
      showNotification("Department deleted successfully!", 'success');
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.size} categories?`)) {
      const deletedCount = selectedIds.size;
      setCategories(categories.filter(c => !selectedIds.has(c.id)));
      setSelectedIds(new Set());
      addHistory("Bulk Delete", `Deleted ${deletedCount} categories`);
      showNotification(`${deletedCount} departments deleted successfully!`, 'success');
    }
  };

  const openModal = (type: ModalType, category?: Category) => {
    if (type === "edit" && category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description ?? "",
        tax_id: category.taxes ?? 0,
        fee_id: category.fees ?? 0,
        is_active: category.is_active,
      });
    } else if (type === "add") {
      setEditingCategory(null);
      setFormData({ name: "", description: "", tax_id: 0, fee_id: 0, is_active: true });
    }
    setActiveModal(type);
  };

<<<<<<< HEAD
  const createCategory = async (
    data: Omit<Category, "id" | "created_at" | "updated_at" | "product_count">
  ): Promise<Category | null> => {
    try {
      const res = await createCategories({
        merchant_id: 1,
        branchId: "432273096245408",
        token: "123456",
        data
      });

      console.log("API FULL RESPONSE:", res);

      // adjust this based on actual response
      const item = res?.data?.item || res?.data?.items?.[0];

      return item || null;
    } catch (error) {
      console.error("Error creating category:", error);
      return null;
    }
  };
=======
>>>>>>> origin/feature/fixRerenderCart
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: formData.name,
          description: formData.description,
          tax_id: formData.tax_id,
          fee_id: formData.fee_id,
        });

        const updatedCategory = {
          ...editingCategory,
          name: formData.name,
          description: formData.description,
          taxes: formData.tax_id,
          fees: formData.fee_id,
        };

        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id ? updatedCategory : c
          )
        );

        addHistory("Edit", `Updated category: ${formData.name}`);
<<<<<<< HEAD

        const updated = await updateCategory({
          merchant_id: 1,
          branchId: "432273096245408",
          token: "123456",
          data: {
            id: editingCategory.id,
            name: formData.name,
            description: formData.description,
            taxes: formData.taxes,
            fees: formData.fees,
            is_active: formData.is_active
          }
        });

        console.log("Updated category from API:", updated);


        toast.success("Saved!", {
          style: {
            background: "#2563eb",
            color: "#fff",
            borderRadius: "10px",
          },
        });
=======
        console.log("Category updated successfully");
        showNotification(`Department "${formData.name}" updated successfully!`, 'success');
>>>>>>> origin/feature/fixRerenderCart
      } else {
        const payload = {
          name: formData.name,
          description: formData.description,
          tax_id: formData.tax_id,
          fee_id: formData.fee_id,
        };

        console.log("Creating category with payload:", payload);
        await createCategory(payload);

        console.log("Category created successfully");

        addHistory("Add", `Created new department: ${formData.name}`);
        showNotification(`Department "${formData.name}" created successfully!`, 'success');

        // Reload categories to get the new one
        getCategorie();
      }

      setActiveModal(null);
    } catch (error) {
      console.error(error);
      showNotification("Failed to save department", 'error');
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setActiveModal("success");
    setTimeout(() => setActiveModal(null), 2000);
  };

  const handleEditModalOpen = () => {
    setTempColumns(visibleColumns);
    setTempItemsPerPage(itemsPerPage);
    setIsEditTableViewOpen(true);
  };

  const handleApplyTableChanges = () => {
    setVisibleColumns(tempColumns);
    setItemsPerPage(tempItemsPerPage);

    localStorage.setItem("categoriesTableView", JSON.stringify({
      columns: tempColumns,
      itemsPerPage: tempItemsPerPage
    }));

    setIsEditTableViewOpen(false);
  };


  /**
   * Load table settings from localStorage on mount
   */
  useEffect(() => {
    const savedSettings = localStorage.getItem("categoriesTableView");

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
  }, []);


  const handleResetTableDefaults = () => {
    const defaults: TableViewColumns = {
      checkbox: true,
      categoryName: true,
      description: true,
      taxes: true,
      fees: true,
      created_on: true,
      action: true,
      is_active: true,
      product_count: true
    };
    setTempColumns(defaults);
    setTempItemsPerPage(5);
    localStorage.removeItem("categoriesTableView");
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
    const getTaxName = (taxId?: number) => {
      if (!taxId) return 'No tax';
      return taxes.find(t => t.id === taxId)?.name || 'Unknown';
    };

    const getFeeName = (feeId?: number) => {
      if (!feeId) return 'No fee';
      return fees.find(f => f.id === feeId)?.name || 'Unknown';
    };

    const dataToExport = scope === 'current' ? paginatedCategories : filteredCategories;

    if (format === 'csv') {
      const headers = ["Department Name", "Description", "Product Count", "Status", "Created Date"];
      const rows = dataToExport.map((cat: any) => [
        cat.name,
        cat.description || '',
        cat.product_count || 0,
        cat.status || 'Active',
        cat.created_at || new Date().toLocaleDateString()
      ]);
      generateCSV(headers, rows, `categories_${scope}_${new Date().getTime()}.csv`);
    } else {
      const columns = ["Department Name", "Description", "Product Count", "Status"];
      const rows = dataToExport.map((cat: any) => [
        cat.name,
        cat.description || '',
        cat.product_count || 0,
        cat.status || 'Active'
      ]);
      generatePDFWithLogo({
        title: `Department Report (${scope === 'current' ? 'Current Page' : 'All'})`,
        columns,
        rows,
        fileName: `categories_${scope}_${new Date().getTime()}.pdf`,
        scope
      });
    }

    showNotification(`${format.toUpperCase()} file downloaded successfully!`, 'success');
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      {notification && <Notification message={notification.message} type={notification.type} />}
      {/* Header Section */}
      <header className="bg-blue-600 px-6 py-10 flex justify-between items-center shadow-xl relative overflow-hidden rounded-2xl">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
            Departments
          </h1>
          <p className="text-blue-100 mt-2 font-medium tracking-wide">Manage your product hierarchy with precision</p>
        </div>

        <div className="relative z-10 bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/30 shadow-2xl">
          <Boxes size={48} className="text-white" strokeWidth={2} />
        </div>
      </header>

      {/* Toolbar Section */}
      <div className="  mx-auto px-6 mt-6 relative z-20">
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-200 flex flex-row items-center gap-2">
          <AddButton onClick={() => openModal("add")} label="Add" />

          <DownloadButton onClick={() => openModal("download")} />

          <FilterButton onClick={() => openModal("filter")} />

          <EditButton
            onClick={handleEditModalOpen}
            variant="text"
            size="md"
          />

          <DeleteButton
            onClick={handleBulkDelete}
            disabled={selectedIds.size === 0}
            count={selectedIds.size}
          />

          <div className="grow max-w-md ml-auto relative">
            <input
              type="text"
              placeholder="Search by name or description..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12 shadow-inner transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {/* <EmailButton onClick={() => {}} /> */}

          <HistoryButton onClick={() => openModal("history")} />
        </div>

        {/* Stats Bar */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 ">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4  hover:border-blue-300 hover:translate-y-1.5 transition-transform duration-300">
            <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
              <Boxes size={24} />
            </div>
            <div className=" hover:border-blue-300 ">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Departments on Page</p>
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
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Departments</p>
              <p className="text-2xl font-black text-slate-800">{filteredCategories.length}</p>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="mt-6 bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-600 border-b border-slate-200">

                  <th className="p-5 w-16">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        className="w-5 h-5  rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        checked={paginatedCategories.length > 0 && selectedIds.size === paginatedCategories.length}
                        onChange={handleSelectAll}
                      />
                    </div>
                  </th>

                  <th className="p-5 font-bold text-xs text-white uppercase tracking-widest">Department Name</th>


                  <th className="p-5 font-bold text-xs text-white uppercase tracking-widest">Taxes</th>


                  <th className="p-5 font-bold text-xs text-white uppercase tracking-widest">Fees</th>


                  <th className="p-5 font-bold text-xs text-white uppercase tracking-widest">Products</th>


                  <th className="p-5 font-bold text-xs text-white uppercase tracking-widest">Is Active</th>


                  <th className="p-5 font-bold text-xs text-white uppercase tracking-widest">Created On</th>


                  <th className="p-5 font-bold text-xs text-white uppercase tracking-widest text-center">Action</th>


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
                      {/* <td className="p-5 text-slate-600 text-sm max-w-xs truncate">{category.description}</td> */}
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${!category.taxes ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>
                          {!category.taxes ? 'No tax' : taxes.find(t => t.id === category.taxes)?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${!category.fees ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>
                          {!category.fees ? 'No fee' : fees.find(f => f.id === category.fees)?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <Package size={14} className="text-slate-400" />
                          <span className="font-mono font-bold text-slate-700">{category.product_count}</span>
                        </div>
                      </td>

                      <td>
                        {category.is_active ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                            <span className="text-emerald-700 font-bold text-sm">Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <X size={14} className="text-red-500" />
                            <span className="text-red-700 font-bold text-sm">Inactive</span>
                          </div>
                        )}
                      </td>
                      <td className="p-5 text-slate-500 text-sm font-medium">
                        {new Date(category.created_at).toLocaleDateString()}
                      </td>

                      <td className="p-5">
                        <div className="flex justify-center items-center gap-3">
                          <div className="bg-slate-200 rounded-full px-2 py-2 w-10 h-10 flex items-center justify-center  group-hover:opacity-100 transition-opacity">
                            <EditButton
                              onClick={() => openModal("edit", category)}
                              variant="icon"
                              size="lg"
                            />
                          </div>
                          <div className="bg-slate-200 rounded-full px-2 py-2 w-10 h-10 flex items-center justify-center disabled:not-first:not-even:  group-hover:opacity-100 transition-opacity">
                            <DeleteButton
                              disabled={true}
                              onClick={() => handleDelete(category.id)}
                              variant="icon"
                              size="lg"
                            />
                          </div>
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
                        <p className="text-slate-400 font-medium italic">No departments found matching your search.</p>
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
                      className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${currentPage === pageNum
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setActiveModal(null)
              }}
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
                      {activeModal === "edit" ? "Edit Department" : "New Department"}
                    </h2>
                    <p className="text-indigo-100 text-sm font-medium">Fill in the details below</p>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>
                <p>{successMessage}</p>
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
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Department Name*</label>
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
                        placeholder="What's this department about?"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none h-28 resize-none font-medium text-slate-600"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tax*</label>
                      <select
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 appearance-none"
                        value={formData.tax_id}
                        onChange={(e) => setFormData({ ...formData, tax_id: Number(e.target.value) })}
                      >
                        <option value={0}>Select a tax</option>
                        {taxes.map(tax => (
                          <option key={tax.id} value={tax.id}>
                            {tax.name} ({tax.rate}%)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Fee*</label>
                      <select
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 appearance-none"
                        value={formData.fee_id}
                        onChange={(e) => setFormData({ ...formData, fee_id: Number(e.target.value) })}
                      >
                        <option value={0}>Select a fee</option>
                        {fees.map(fee => (
                          <option key={fee.id} value={fee.id}>
                            {fee.name} ({fee.amount}{fee.is_percentage ? '%' : ''})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ name: "", description: "", tax_id: 0, fee_id: 0, is_active: true })}
                      className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 flex items-center justify-center gap-2 transition-all"
                    >
                      <RotateCcw size={20} /> Reset
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95"
                    >
                      {activeModal === "edit" ? "Update Department" : "Create Department"}
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
                          className={`px-4 py-3 rounded-xl text-sm font-bold border transition-all text-left flex justify-between items-center ${sortBy === opt
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
                    onClick={() => {
                      setActiveModal(null);
                      showNotification('Sort order updated successfully!', 'success');
                    }}
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
              subtitle="Recent department actions"
            />
          </div>
        )}
      </AnimatePresence>

      {/* Edit Table View Modal - Separate from activeModal */}
      <AnimatePresence>
        {isEditTableViewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditTableViewOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            >
              <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
                <h2 className="text-xl font-black uppercase tracking-tight">
                  Edit Table View
                </h2>
                <button onClick={() => setIsEditTableViewOpen(false)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 space-y-6 max-h-96 overflow-y-auto">
                {/* Table View Columns */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-600 uppercase block">TABLE VIEW</label>
                  {(Object.keys(tempColumns) as Array<keyof TableViewColumns>).map(col => (
                    <label key={col} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempColumns[col]}
                        onChange={() => setTempColumns({ ...tempColumns, [col]: !tempColumns[col] })}
                        className="w-5 h-5 rounded cursor-pointer accent-indigo-600"
                      />
                      <span className="text-sm capitalize">
                        {columnLabels[col]}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Items Per Page */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-600 uppercase block">ITEMS PER PAGE</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[5, 10, 15, 25, 50].map(num => (
                      <label key={num} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="itemsPerPage"
                          value={num}
                          checked={tempItemsPerPage === num}
                          onChange={() => setTempItemsPerPage(num)}
                          className="w-5 h-5 cursor-pointer accent-indigo-600"
                        />
                        <span className="text-sm">{num}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="p-6 border-t space-y-3 bg-slate-50">
                <button
                  onClick={handleApplyTableChanges}
                  className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <CheckCircle2 size={20} /> Apply
                </button>
                <button
                  onClick={handleResetTableDefaults}
                  className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw size={20} /> Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

