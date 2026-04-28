// app/categories/page.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchCategories, createNewCategory, updateExistingCategory, deleteExistingCategory } from "@/lib/redux/slices/categorySlice";
import { fetchTaxes } from "@/lib/redux/slices/taxSlice";
import { fetchFees } from "@/lib/redux/slices/feeSlice";
import { useNotification } from "@/hooks/useNotification";
import { Notification } from "@/components/Notification";
import { CategoriesHeader } from "@/components/dashboard/department/CategoriesHeader";
import { CategoriesToolbar } from "@/components/dashboard/department/CategoriesToolbar";
import { CategoriesStats } from "@/components/dashboard/department/CategoriesStats";
import { CategoriesTable } from "@/components/dashboard/department/CategoriesTable";
import { Pagination } from "@/components/dashboard/department/Pagination";
import { AddEditCategoryModal } from "@/components/dashboard/department/AddEditCategoryModal";
import { FilterModal } from "@/components/dashboard/department/FilterModal";
import { TableViewEditModal } from "@/components/dashboard/department/TableViewEditModal";
import { DeleteConfirmModal } from "@/components/dashboard/department/DeleteConfirmModal";
import HistoryModal from "@/components/history-modal";
import DownloadModal from "@/components/download-modal";
import { AnimatePresence } from "framer-motion";
import { s } from "framer-motion/client";

// Define TableViewColumns interface
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

const defaultColumns: TableViewColumns = {
  checkbox: true,
  categoryName: true,
  product_count: true,
  description: true,
  taxes: true,
  fees: true,
  action: true,
  is_active: true,
  created_on: true,
};

export default function CategoriesPage() {
  const dispatch = useAppDispatch();
  const { items: categories } = useAppSelector((state) => state.categories);
  const { items: taxes } = useAppSelector((state) => state.taxes);
  const { items: fees } = useAppSelector((state) => state.fees);
  const { showNotification, notification } = useNotification();

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortBy, setSortBy] = useState("Name (A-Z)");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<TableViewColumns>(defaultColumns);
  const [tempColumns, setTempColumns] = useState<TableViewColumns>(visibleColumns);
  const [tempItemsPerPage, setTempItemsPerPage] = useState(itemsPerPage);
  const [isEditTableViewOpen, setIsEditTableViewOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  // Load data
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      dispatch(fetchCategories()),
      dispatch(fetchTaxes()),
      dispatch(fetchFees()),
    ]).finally(() => setLoading(false));
  }, []);
  // Load saved table settings
  useEffect(() => {
    const saved = localStorage.getItem("categoriesTableView");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.columns) setVisibleColumns(parsed.columns);
      if (parsed.itemsPerPage) setItemsPerPage(parsed.itemsPerPage);
    }
  }, []);

  // Filtering, sorting, pagination
  const filteredCategories = useMemo(() => {
    let result = categories.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );
    if (sortBy === "Name (A-Z)") result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "Name (Z-A)") result.sort((a, b) => b.name.localeCompare(a.name));
    else if (sortBy === "Date (Oldest First)")
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    else if (sortBy === "Date (Newest First)")
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return result;
  }, [categories, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const currentPageProductCount = paginatedCategories.reduce((sum, c) => sum + (c.product_count ?? 0), 0);

  // Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(new Set(paginatedCategories.map((c) => c.id)));
    else setSelectedIds(new Set());
  };
  const handleSelectOne = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };
  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setActiveModal("edit");
  };

  const handleDelete = (id: number, name: string) => {
    setDeleteTarget({ id, name });
    setActiveModal("delete");
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteExistingCategory(deleteTarget.id)).unwrap();
    addHistory("Delete", `Deleted category: ${deleteTarget.name}`);
    showNotification("Department deleted successfully!", "success");
    setActiveModal(null);
    setDeleteTarget(null);
  };
  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    // Implement bulk delete confirmation (similar to single delete)
  };
  const addHistory = (action: string, details: string) => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      action: action.includes("Delete") ? "Delete" : action === "Add" ? "Add" : "Edit",
      details,
      timestamp: new Date().toLocaleString(),
    };
    setHistory((prev) => [newItem, ...prev].slice(0, 50));
  };
  const handleSaveCategory = async (data: any) => {
    try {
      if (editingCategory) {
        await dispatch(updateExistingCategory({ id: editingCategory.id, data })).unwrap();
        addHistory("Edit", `Updated category: ${data.name}`);
        showNotification(`Department "${data.name}" updated!`, "success");
        setActiveModal(null);
      } else {
        await dispatch(createNewCategory(data)).unwrap();
        addHistory("Add", `Created new department: ${data.name}`);
        showNotification(`Department "${data.name}" created!`, "success");
        setActiveModal(null);
      }
    } catch (error: any) {
      // Show toast notification for the conflict
      showNotification(error.message || "Failed to save department", "error");
      setActiveModal(null); // Close the add/edit modal
      throw error; // rethrow so modal can also display its own error
    }
  };
  const handleDownload = (scope: "current" | "all", format: "pdf" | "csv") => {
    // Implement download logic using generateCSV/generatePDFWithLogo
    showNotification(`${format.toUpperCase()} download started`, "success");
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      {notification && <Notification message={notification.message} type={notification.type} />}
      <CategoriesHeader />
      <div className="mx-auto px-6 mt-6 relative z-20">
        <CategoriesToolbar
          onAdd={() => {
            setEditingCategory(null);
            setActiveModal("add");
          }}
          onDownload={() => setActiveModal("download")}
          onFilter={() => setActiveModal("filter")}
          onEditView={() => setIsEditTableViewOpen(true)}
          onBulkDelete={handleBulkDelete}
          onHistory={() => setIsHistoryOpen(true)}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCount={selectedIds.size}
        />
        <CategoriesStats
          pageCount={paginatedCategories.length}
          productCount={currentPageProductCount}
          totalCount={filteredCategories.length}
        />
        <div className="mt-6 bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
          <CategoriesTable
            categories={paginatedCategories}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            onEdit={handleEdit}
            onDelete={(id) => {
              const cat = categories.find((c) => c.id === id);
              if (cat) handleDelete(id, cat.name);
            }}
            taxes={taxes}
            fees={fees}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredCategories.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(limit) => {
              setItemsPerPage(limit);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {(activeModal === "add" || activeModal === "edit") && (
          <AddEditCategoryModal
            isOpen={true}
            mode={activeModal as "add" | "edit"}
            initialData={editingCategory}
            taxes={taxes}
            fees={fees}
            onClose={() => setActiveModal(null)}
            onSave={handleSaveCategory}
          />
        )}
        {activeModal === "filter" && (
          <FilterModal sortBy={sortBy} onSortChange={setSortBy} onClose={() => setActiveModal(null)} />
        )}
        {activeModal === "download" && (
          <DownloadModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            onDownload={handleDownload}
            title="Export Departments"
            subtitle="Choose format"
          />
        )}
        {activeModal === "delete" && deleteTarget && (
          <DeleteConfirmModal
            title="Delete Department"
            message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
            onConfirm={confirmDelete}
            onClose={() => setActiveModal(null)}
          />
        )}
      </AnimatePresence>

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        title="Activity Log"
        subtitle="Recent department actions"
      />

      {isEditTableViewOpen && (
        <TableViewEditModal
          tempColumns={tempColumns}
          tempItemsPerPage={tempItemsPerPage}
          onClose={() => setIsEditTableViewOpen(false)}
          onApply={() => {
            setVisibleColumns(tempColumns);
            setItemsPerPage(tempItemsPerPage);
            localStorage.setItem(
              "categoriesTableView",
              JSON.stringify({ columns: tempColumns, itemsPerPage: tempItemsPerPage })
            );
            setIsEditTableViewOpen(false);
          }}
          onReset={() => {
            setTempColumns(defaultColumns);
            setTempItemsPerPage(5);
          }}
          onColumnToggle={(col) => setTempColumns({ ...tempColumns, [col]: !tempColumns[col] })}
          onItemsPerPageChange={setTempItemsPerPage}
        />
      )}
    </div>
  );
}