"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  Search, 
  X,
  Check,
  Package,
  Lock,
  FileText,
  Table as TableIcon,
  Clock,
  AlertCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import HistoryModal, { HistoryItem as HistoryItemType } from "@/components/history-modal";
import DownloadModal from "@/components/download-modal";
import { ProductModal, ProductFormData } from "@/components/ProductModal";
import { 
  AddButton, 
  EditButton, 
  DeleteButton, 
  DownloadButton, 
  FilterButton, 
  HistoryButton 
} from "@/components/toolbar-buttons";
import { generatePDFWithLogo, generateCSV } from "@/lib/pdf-export";

interface Product {
  id: number;
  name: string;
  upc: string;
  category: string;
  brand: string;
  price: string;
  pricing: string;
  unit: string;
  qty: number;
  status: "Active" | "Inactive";
}

interface HistoryItem {
  id: string;
  action: "Add" | "Edit" | "Delete";
  details: string;
  timestamp: string;
}

interface TableViewColumns {
  checkbox: boolean;
  name: boolean;
  upc: boolean;
  category: boolean;
  brand: boolean;
  price: boolean;
  pricing: boolean;
  unit: boolean;
  qty: boolean;
  status: boolean;
}

const mockProducts: Product[] = [
  { id: 1, name: "Alovera", upc: "CUSTOM33552923", category: "Skincare", brand: "Nature", price: "$600.00", pricing: "Fixed", unit: "pcs", qty: 1.0, status: "Inactive" },
  { id: 2, name: "Artichoke - Hearts, Canned", upc: "744889933567", category: "Canned Food", brand: "Gourmet", price: "$3.00", pricing: "Fixed", unit: "can", qty: 194.0, status: "Active" },
  { id: 3, name: "Beef - Diced", upc: "952877402759", category: "Meat", brand: "Butcher", price: "$100.00", pricing: "Fixed", unit: "kg", qty: 10.0, status: "Active" },
  { id: 4, name: "Beef - Diced Prime", upc: "952877402750", category: "Meat", brand: "Butcher", price: "$8888.88", pricing: "Fixed", unit: "kg", qty: 9.0, status: "Active" },
  { id: 5, name: "Beef Mince", upc: "952877402753", category: "Meat", brand: "Butcher", price: "$120.00", pricing: "Fixed", unit: "kg", qty: 5.0, status: "Active" },
  { id: 6, name: "Butter 500g", upc: "952877402789", category: "Dairy", brand: "Farm", price: "$250.00", pricing: "Fixed", unit: "pack", qty: 9.0, status: "Active" },
  { id: 7, name: "Chicken Breast", upc: "952877402751", category: "Meat", brand: "Poultry", price: "$180.00", pricing: "Fixed", unit: "kg", qty: 3.0, status: "Active" },
  { id: 8, name: "Cola 500ml", upc: "CUSTOM56498022", category: "Beverage", brand: "SodaCo", price: "$10.00", pricing: "Fixed", unit: "bottle", qty: 1.0, status: "Active" },
  { id: 9, name: "Eggs 12 Pack", upc: "952877402757", category: "Dairy", brand: "Farm", price: "$130.00", pricing: "Fixed", unit: "box", qty: 8.0, status: "Active" },
  { id: 10, name: "Milk 1 Liter", upc: "952877402758", category: "Dairy", brand: "Farm", price: "$90.00", pricing: "Fixed", unit: "bottle", qty: 6.0, status: "Active" },
];

export default function App() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState<TableViewColumns>({
    checkbox: true,
    name: true,
    upc: true,
    category: true,
    brand: true,
    price: true,
    pricing: true,
    unit: true,
    qty: true,
    status: true,
  });

  // Pagination & Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  const [tempColumns, setTempColumns] = useState<TableViewColumns>(visibleColumns);
  const [tempItemsPerPage, setTempItemsPerPage] = useState(itemsPerPage);
  
  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    product?: Product;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    product: undefined,
    onConfirm: () => {},
  });
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product | 'none', direction: 'asc' | 'desc' }>({ key: 'none', direction: 'asc' });

  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    upc: "",
    category: "",
    brand: "",
    price: "",
    pricing: "Fixed",
    unit: "",
    qty: 0,
    status: "Active"
  });

  const addHistory = (action: string, details: string) => {
    const mapAction = (act: string): "Add" | "Edit" | "Delete" => {
      if (act === "Add") return "Add";
      if (act === "Delete" || act === "Bulk Delete") return "Delete";
      return "Edit"; // Default for Edit, Download, and other actions
    };

    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      action: mapAction(action),
      details,
      timestamp: new Date().toLocaleString()
    };
    setHistory(prev => [newItem, ...prev].slice(0, 50));
  };

  const handleEditModalOpen = () => {
    setTempColumns(visibleColumns);
    setTempItemsPerPage(itemsPerPage);
    setIsEditModalOpen(true);
  };

  const handleApplyTableChanges = () => {
    setVisibleColumns(tempColumns);
    setItemsPerPage(tempItemsPerPage);
    setIsEditModalOpen(false);
  };

  const handleResetTableDefaults = () => {
    const defaults: TableViewColumns = {
      checkbox: true,
      name: true,
      upc: true,
      category: true,
      brand: true,
      price: true,
      pricing: true,
      unit: true,
      qty: true,
      status: true,
    };
    setTempColumns(defaults);
    setTempItemsPerPage(5);
  };

  const sortedAndFilteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.upc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterStatus === "All" || p.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    });

    if (sortConfig.key !== 'none') {
      result.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof Product];
        let bValue: any = b[sortConfig.key as keyof Product];

        if (sortConfig.key === 'price') {
          aValue = parseFloat(a.price.replace('$', '').replace(',', ''));
          bValue = parseFloat(b.price.replace('$', '').replace(',', ''));
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [products, searchQuery, filterStatus, sortConfig]);

  const totalPages = Math.ceil(sortedAndFilteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedAndFilteredProducts.slice(start, start + itemsPerPage);
  }, [sortedAndFilteredProducts, currentPage, itemsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, sortConfig]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedProducts.map(p => p.id)));
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
    const product = products.find(p => p.id === id);
    if (product) {
      setConfirmModal({
        isOpen: true,
        title: "Delete Product",
        message: `Are you sure you want to delete this product? This action cannot be undone.`,
        product: product,
        onConfirm: () => {
          setProducts(prev => prev.filter(p => p.id !== id));
          addHistory("Delete", `Deleted product: ${product.name}`);
          setSelectedIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setConfirmModal({
      isOpen: true,
      title: "Bulk Delete",
      message: `Are you sure you want to delete ${selectedIds.size} selected products? This action cannot be undone.`,
      onConfirm: () => {
        const deletedCount = selectedIds.size;
        setProducts(prev => prev.filter(p => !selectedIds.has(p.id)));
        addHistory("Bulk Delete", `Deleted ${deletedCount} products`);
        setSelectedIds(new Set());
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        upc: "",
        category: "",
        brand: "",
        price: "",
        pricing: "Fixed",
        unit: "",
        qty: 0,
        status: "Active"
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...formData } as Product : p));
      addHistory("Edit", `Updated product: ${formData.name}`);
    } else {
      const newProduct: Product = {
        id: Math.max(0, ...products.map(p => p.id)) + 1,
        ...(formData as Omit<Product, "id">)
      };
      setProducts([...products, newProduct]);
      addHistory("Add", `Created new product: ${formData.name}`);
    }
    setIsModalOpen(false);
  };

  const downloadCSV = (scope: 'current' | 'all') => {
    const dataToExport = scope === 'current' ? paginatedProducts : sortedAndFilteredProducts;
    const headers = ["Name", "UPC", "Category", "Brand", "Price", "Pricing", "Unit", "QTY", "Status"];
    const rows = dataToExport.map(p => [
      p.name, p.upc, p.category, p.brand, p.price, p.pricing, p.unit, p.qty, p.status
    ]);
    
    generateCSV(headers, rows, `products_${scope}_${new Date().getTime()}.csv`);
    addHistory("Download", `Exported ${scope === 'current' ? 'current page' : 'all'} products as CSV`);
    setIsDownloadModalOpen(false);
  };

  const downloadPDF = (scope: 'current' | 'all') => {
    const dataToExport = scope === 'current' ? paginatedProducts : sortedAndFilteredProducts;
    const columns = ["Name", "UPC", "Category", "Brand", "Price", "QTY", "Status"];
    const rows = dataToExport.map(p => [
      p.name, p.upc, p.category, p.brand, p.price, p.qty, p.status
    ]);

    generatePDFWithLogo({
      title: `Product Inventory Report (${scope === 'current' ? 'Current Page' : 'All Pages'})`,
      columns,
      rows,
      fileName: `products_${scope}_${new Date().getTime()}.pdf`,
      scope
    });
    
    addHistory("Download", `Exported ${scope === 'current' ? 'current page' : 'all'} products as PDF`);
    setIsDownloadModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      {/* Header Section */}
    <section className=" rounded-2xl border-b border-slate-200 bg-white  mt-0"> 
       <header className="bg-blue-600 rounded-2xl px-6 py-8 flex justify-between items-center shadow-lg relative overflow-hidden ">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[120%] bg-white rotate-12 blur-3xl rounded-full" />
        </div>
        
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="relative z-10"
        >
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
      products
          </h1>
          
        </motion.div>

        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-white relative z-10"
        >
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md border  border-white/30 shadow-xl">
            <Package size={40} strokeWidth={2} />
          </div>
        </motion.div>
      </header>
 <div className="bg-white p-4 shadow-xl  rounded-2xl mt-4 border border-slate-200 flex flex-wrap items-center gap-3 ">
          <AddButton onClick={() => handleOpenModal()} label="Add Product" />
          
          {/* Download Dropdown */}
          <div className="relative">
            <DownloadButton onClick={() => setIsDownloadModalOpen(true)} />

            <DownloadModal
              isOpen={isDownloadModalOpen}
              onClose={() => setIsDownloadModalOpen(false)}
              onDownload={(scope, format) => {
                if (format === 'pdf') downloadPDF(scope);
                else downloadCSV(scope);
              }}
              title="Export Products"
              subtitle="Choose your preferred format"
            />
          </div>

          {/* Filter Section - Using Custom Filter Component */}
          <div className="relative">
            <FilterButton onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} />

            <AnimatePresence>
              {isFilterMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsFilterMenuOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 z-20 overflow-hidden max-h-[80vh] overflow-y-auto"
                  >                  
                        <div className="p-3 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Status</div>
                    {["All", "Active", "Inactive"].map((status) => (
                      <button 
                        key={status}
                        onClick={() => {
                          setFilterStatus(status);
                          setIsFilterMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors ${
                          filterStatus === status ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {status} {filterStatus === status && <Check size={16} />}
                      </button>
                    ))}

                    <div className="p-3 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b   border-t border-slate-100">Sort By</div>
                    {[
                      { label: "Name (A-Z)", key: "name", dir: "asc" },
                      { label: "Name (Z-A)", key: "name", dir: "desc" },
                      { label: "Price (Low to High)", key: "price", dir: "asc" },
                      { label: "Price (High to Low)", key: "price", dir: "desc" },
                      { label: "Quantity (Low to High)", key: "qty", dir: "asc" },
                      { label: "Quantity (High to Low)", key: "qty", dir: "desc" },
                      { label: "UPC (Ascending)", key: "upc", dir: "asc" },
                      { label: "UPC (Descending)", key: "upc", dir: "desc" },
                    ].map((sort) => (
                      <button 
                        key={sort.label}
                        onClick={() => {
                          setSortConfig({ key: sort.key as any, direction: sort.dir as any });
                          setIsFilterMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors ${
                          sortConfig.key === sort.key && sortConfig.direction === sort.dir ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {sort.label} {sortConfig.key === sort.key && sortConfig.direction === sort.dir && <Check size={16} />}
                      </button>
                    ))}

                    <button 
                      onClick={() => {
                        setFilterStatus("All");
                        setSortConfig({ key: 'none', direction: 'asc' });
                        setSearchQuery("");
                        setIsFilterMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors border-t border-slate-100"
                    >
                      <X size={16} /> Reset Filters
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

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

          <div className="flex-grow:1 max-w-md ml-auto flex relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search by name, UPC, brand..." 
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <HistoryButton onClick={() => setIsHistoryOpen(true)} />
        </div> 
        </section>
      {/* Toolbar Section */}
      <div className="p-4 space-y-8">
       

        {/* Table Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 "
        >
          <div className="overflow-x-auto rounded-2xl">
            <table className="w-full text-left border-collapse ">
              <thead  >
                <tr className="bg-blue-600 border-b border-slate-100">
                  {visibleColumns.checkbox && (
                    <th className="p-6 w-12">
                      <div className="flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded-lg bg-blue-600 border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={paginatedProducts.length > 0 && selectedIds.size === paginatedProducts.length}
                          onChange={handleSelectAll}
                        />
                      </div>
                    </th>
                  )}
                  {visibleColumns.name && (
                    <th className="p-6 font-bold text-xs uppercase tracking-widest text-white">Product Name</th>
                  )}
                  {visibleColumns.upc && (
                    <th className="p-6 font-bold text-xs uppercase tracking-widest  text-white">UPC</th>
                  )}
                  {visibleColumns.category && (
                    <th className="p-6 font-bold text-xs uppercase tracking-widest  text-white">Category</th>
                  )}
                  {visibleColumns.brand && (
                    <th className="p-6 font-bold text-xs uppercase tracking-widest  text-white">Brand</th>
                  )}
                  {visibleColumns.price && (
                    <th className="p-6 font-bold text-xs uppercase tracking-widest  text-white">Price</th>
                  )}
                  {visibleColumns.pricing && (
                    <th className="p-6 font-bold text-xs uppercase tracking-widest  text-white">Pricing Type</th>
                  )}
                  {visibleColumns.unit && (
                    <th className="p-6 font-bold text-xs uppercase tracking-widest  text-white">Unit</th>
                  )}
                  {visibleColumns.qty && (
                    <th className="p-6 font-bold text-xs uppercase tracking-widest  text-white text-center">QTY</th>
                  )}
                  {visibleColumns.status && (
                    <th className="p-6 font-bold text-xs uppercase tracking-widest  text-white">Status</th>
                  )}
                  <th className="p-6 font-bold text-xs uppercase tracking-widest  text-white text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product, index) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={product.id} 
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      {visibleColumns.checkbox && (
                        <td className="p-6">
                          <div className="flex items-center justify-center">
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              checked={selectedIds.has(product.id)}
                              onChange={() => handleSelectOne(product.id)}
                            />
                          </div>
                        </td>
                      )}
                      {visibleColumns.name && (
                        <td className="p-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{product.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5">ID: #{product.id.toString().padStart(4, '0')}</span>
                          </div>
                        </td>
                      )}
                      {visibleColumns.upc && (
                        <td className="p-6 text-slate-600 font-mono text-sm">{product.upc}</td>
                      )}
                      {visibleColumns.category && (
                        <td className="p-6">
                          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                            {product.category}
                          </span>
                        </td>
                      )}
                      {visibleColumns.brand && (
                        <td className="p-6 text-slate-600 font-medium">{product.brand}</td>
                      )}
                      {visibleColumns.price && (
                        <td className="p-6 font-black text-slate-900">{product.price}</td>
                      )}
                      {visibleColumns.pricing && (
                        <td className="p-6">
                          <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-100 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit">
                            <Lock size={12} strokeWidth={3} /> {product.pricing}
                          </span>
                        </td>
                      )}
                      {visibleColumns.unit && (
                        <td className="p-6 text-slate-500 font-medium italic">{product.unit}</td>
                      )}
                      {visibleColumns.qty && (
                        <td className="p-6 text-center">
                          <span className={`font-bold ${product.qty < 5 ? 'text-red-500' : 'text-slate-700'}`}>
                            {product.qty.toFixed(2)}
                          </span>
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td className="p-6">
                          <span className={`flex items-center gap-2 text-xs font-bold ${
                            product.status === 'Active' ? 'text-emerald-500' : 'text-slate-300'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              product.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                            }`} />
                            {product.status}
                          </span>
                        </td>
                      )}
                      <td className="p-6">
                        <div className="flex justify-center items-center gap-4">
                          <motion.button 
                            whileHover={{ scale: 1.2, rotate: 5 }}
                            className="text-slate-400 hover:text-blue-500 transition-colors"
                          >
                            <Eye size={20} />
                          </motion.button>
                          <EditButton 
                            onClick={() => handleOpenModal(product)}
                            variant="icon"
                          />
                          <DeleteButton 
                            onClick={() => handleDelete(product.id)}
                            variant="icon"
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-slate-400">
                        <AlertCircle size={48} strokeWidth={1} />
                        <p className="text-lg font-medium italic">No products found matching your search.</p>
                        <button 
                          onClick={() => {setSearchQuery(""); setFilterStatus("All");}}
                          className="text-blue-600 font-bold hover:underline"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Pagination Section */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50">
          <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            Showing <span className="text-blue-600">{paginatedProducts.length}</span> of <span className="text-slate-800">{sortedAndFilteredProducts.length}</span> products
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mr-4">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Show</span>
              <select 
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
              >
                {[5, 10, 20, 50].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <motion.button 
                whileHover={currentPage > 1 ? { scale: 1.1 } : {}}
                whileTap={currentPage > 1 ? { scale: 0.9 } : {}}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-xl border transition-all ${
                  currentPage === 1 
                    ? "border-slate-100 text-slate-300 cursor-not-allowed" 
                    : "border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600"
                }`}
              >
                <ChevronDown size={20} className="rotate-90" />
              </motion.button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <motion.button
                    key={page}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${
                      currentPage === page 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </motion.button>
                ))}
              </div>

              <motion.button 
                whileHover={currentPage < totalPages ? { scale: 1.1 } : {}}
                whileTap={currentPage < totalPages ? { scale: 0.9 } : {}}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`p-2 rounded-xl border transition-all ${
                  currentPage === totalPages || totalPages === 0
                    ? "border-slate-100 text-slate-300 cursor-not-allowed" 
                    : "border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600"
                }`}
              >
                <ChevronDown size={20} className="-rotate-90" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Section */}
      <ProductModal
        isOpen={isModalOpen}
        isEditing={editingProduct !== null}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => {
          if (editingProduct) {
            setProducts(products.map(p => p.id === editingProduct.id ? { ...p, name: data.name, upc: data.upc, category: data.category, brand: data.brand, price: `$${data.price}`, unit: data.unit, qty: data.quantity, status: "Active" } as Product : p));
            addHistory("Edit", `Updated product: ${data.name}`);
          } else {
            const newProduct: Product = {
              id: Math.max(0, ...products.map(p => p.id)) + 1,
              name: data.name,
              upc: data.upc,
              category: data.category,
              brand: data.brand,
              price: `$${data.price}`,
              pricing: "Fixed",
              unit: data.unit,
              qty: data.quantity,
              status: "Active"
            };
            setProducts([...products, newProduct]);
            addHistory("Add", `Created new product: ${data.name}`);
          }
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
      />

      {/* Edit Table View Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border">
              <div className="p-6 border-b flex justify-between items-center bg-zinc-50">
                <h2 className="font-bold text-lg">Edit Table View</h2>
                <button onClick={() => setIsEditModalOpen(false)}><X size={20}/></button>
              </div>
              <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
                {/* Table View Columns */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-600 uppercase block">TABLE VIEW</label>
                  {(Object.keys(tempColumns) as Array<keyof TableViewColumns>).map(col => (
                    <label key={col} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempColumns[col]}
                        onChange={() => setTempColumns({...tempColumns, [col]: !tempColumns[col]})}
                        className="w-5 h-5 rounded cursor-pointer accent-blue-600"
                      />
                      <span className="text-sm capitalize">
                        {col === 'checkbox' ? 'Checkbox' : col === 'name' ? 'Product Name' : col === 'upc' ? 'UPC' : col === 'category' ? 'Category' : col === 'brand' ? 'Brand' : col === 'price' ? 'Price' : col === 'pricing' ? 'Pricing' : col === 'unit' ? 'Unit' : col === 'qty' ? 'QTY' : 'Status'}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Items Per Page */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-600 uppercase block">ITEMS PER PAGE</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[5, 10, 15, 25, 50].map(num => (
                      <label key={num} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="itemsPerPage"
                          value={num}
                          checked={tempItemsPerPage === num}
                          onChange={() => setTempItemsPerPage(num)}
                          className="w-5 h-5 cursor-pointer accent-blue-600"
                        />
                        <span className="text-sm">{num}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="p-6 border-t space-y-3 bg-zinc-50">
                <button
                  onClick={handleApplyTableChanges}
                  className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 shadow-md"
                >
                  <Check size={18} /> Apply
                </button>
                <button
                  onClick={handleResetTableDefaults}
                  className="w-full py-2.5 bg-zinc-100 text-zinc-700 font-semibold rounded-lg hover:bg-zinc-200 flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} /> Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20"
            >
              {/* Header */}
              <div className="bg-red-50 p-8 border-b border-red-100">
                <div className="flex items-center gap-4 text-red-500 mb-2">
                  <div className="bg-red-100 p-3 rounded-2xl">
                    <AlertCircle size={32} />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">{confirmModal.title}</h2>
                </div>
                <p className="text-slate-600 text-sm ml-16">{confirmModal.message}</p>
              </div>

              {/* Product Details */}
              {confirmModal.product && (
                <div className="p-8 space-y-4 bg-white border-b border-slate-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Product Name</p>
                      <p className="text-base font-bold text-slate-900">{confirmModal.product.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Category</p>
                      <p className="text-base font-bold text-slate-900">{confirmModal.product.category}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Price</p>
                      <p className="text-base font-bold text-slate-900">{confirmModal.product.price}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Quantity</p>
                      <p className="text-base font-bold text-slate-900">{confirmModal.product.qty}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Brand</p>
                      <p className="text-base font-bold text-slate-900">{confirmModal.product.brand}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Unit</p>
                      <p className="text-base font-bold text-slate-900">{confirmModal.product.unit}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">UPC/PLU Code</p>
                    <p className="text-sm font-mono text-slate-700">{confirmModal.product.upc}</p>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="p-6 bg-slate-50 flex gap-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-2xl font-bold uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmModal.onConfirm}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-100"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Modal Section */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        title="Activity Log"
        subtitle="Recent inventory actions"
      />
    </div>
  );
}
