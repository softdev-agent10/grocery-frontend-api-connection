"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  Plus, 
  Download, 
  Filter, 
  Edit, 
  Trash2, 
  Search, 
  History, 
  Eye, 
  SquarePen, 
  ChevronDown,
  X,
  Check,
  Package,
  Lock,
  FileText,
  Table as TableIcon,
  Clock,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  id: number;
  action: string;
  details: string;
  timestamp: string;
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
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  
  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  
  // Pagination & Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
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
    const newItem: HistoryItem = {
      id: Date.now(),
      action,
      details,
      timestamp: new Date().toLocaleString()
    };
    setHistory(prev => [newItem, ...prev].slice(0, 50));
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
        message: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
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
    
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `products_${scope}_${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addHistory("Download", `Exported ${scope === 'current' ? 'current page' : 'all'} products as CSV`);
    setIsDownloadMenuOpen(false);
  };

  const downloadPDF = (scope: 'current' | 'all') => {
    const dataToExport = scope === 'current' ? paginatedProducts : sortedAndFilteredProducts;
    const doc = new jsPDF();
    doc.text(`Product Inventory Report (${scope === 'current' ? 'Current Page' : 'All Pages'})`, 14, 15);
    
    const tableColumn = ["Name", "UPC", "Category", "Price", "QTY", "Status"];
    const tableRows = dataToExport.map(p => [
      p.name, p.upc, p.category, p.price, p.qty, p.status
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] },
    });
    
    doc.save(`products_${scope}_${new Date().getTime()}.pdf`);
    addHistory("Download", `Exported ${scope === 'current' ? 'current page' : 'all'} products as PDF`);
    setIsDownloadMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      {/* Header Section */}
      <header className="bg-blue-600 px-6 py-8 flex justify-between items-center shadow-lg relative overflow-hidden rounded-2xl">
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
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/30 shadow-xl">
            <Package size={40} strokeWidth={2} />
          </div>
        </motion.div>
      </header>

      {/* Toolbar Section */}
      <div className="p-8 space-y-8">
        <div className="flex flex-wrap items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2  bg-white border  text-slate-700 px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-blue-200"
          >
            <Plus size={20} /> Add Product
          </motion.button>
          
          {/* Download Dropdown */}
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-400 text-slate-700 px-6 py-3 rounded-xl font-bold transition-all shadow-sm"
            >
              <Download size={20} /> Download <ChevronDown size={16} className={`transition-transform duration-300 ${isDownloadMenuOpen ? 'rotate-180' : ''}`} />
            </motion.button>
            
            <AnimatePresence>
              {isDownloadMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsDownloadMenuOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 z-20 overflow-hidden"
                  >
                    <div className="p-3 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Current Page</div>
                    <button 
                      onClick={() => downloadPDF('current')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <FileText size={16} className="text-red-500" /> PDF
                    </button>
                    <button 
                      onClick={() => downloadCSV('current')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100"
                    >
                      <TableIcon size={16} className="text-emerald-500" /> CSV
                    </button>

                    <div className="p-3 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">All Pages</div>
                    <button 
                      onClick={() => downloadPDF('all')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <FileText size={16} className="text-red-500" /> PDF
                    </button>
                    <button 
                      onClick={() => downloadCSV('all')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <TableIcon size={16} className="text-emerald-500" /> CSV
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-400 text-slate-700 px-6 py-3 rounded-xl font-bold transition-all shadow-sm"
            >
              <Filter size={20} /> Filter <ChevronDown size={16} className={`transition-transform duration-300 ${isFilterMenuOpen ? 'rotate-180' : ''}`} />
            </motion.button>

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

                    <div className="p-3 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 border-t border-slate-100">Sort By</div>
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

          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (selectedIds.size === 1) {
                const id = Array.from(selectedIds)[0];
                const product = products.find(p => p.id === id);
                if (product) handleOpenModal(product);
              } else if (selectedIds.size > 1) {
                alert("Please select only one product to edit.");
              } else {
                alert("Please select a product to edit.");
              }
            }}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-400 text-slate-700 px-6 py-3 rounded-xl font-bold transition-all shadow-sm"
          >
            <Edit size={20} /> Edit
          </motion.button>

          <motion.button 
            whileHover={selectedIds.size > 0 ? { scale: 1.05, y: -2 } : {}}
            whileTap={selectedIds.size > 0 ? { scale: 0.95 } : {}}
            onClick={handleBulkDelete}
            disabled={selectedIds.size === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md ${
              selectedIds.size > 0 
                ? "bg-red-500 hover:bg-red-600 text-white shadow-red-100" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            }`}
          >
            <Trash2 size={20} /> Delete {selectedIds.size > 0 && `(${selectedIds.size})`}
          </motion.button>

          <div className="flex-grow max-w-md ml-auto flex relative">
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

          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-slate-200"
          >
            <History size={20} /> History
          </motion.button>
        </div>

        {/* Table Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse ">
              <thead  >
                <tr className="bg-blue-600 border-b border-slate-100">
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
                  <th className="p-6 font-bold text-xs uppercase tracking-widest text-white">Product Name</th>
                  <th className="p-6 font-bold text-xs uppercase tracking-widest  text-white">UPC</th>
                  <th className="p-6 font-bold text-xs uppercase tracking-widest  text-white">Category</th>
                  <th className="p-6 font-bold text-xs uppercase tracking-widest  text-white">Brand</th>
                  <th className="p-6 font-bold text-xs uppercase tracking-widest  text-white">Price</th>
                  <th className="p-6 font-bold text-xs uppercase tracking-widest  text-white">Pricing Type</th>
                  <th className="p-6 font-bold text-xs uppercase tracking-widest  text-white">Unit</th>
                  <th className="p-6 font-bold text-xs uppercase tracking-widest  text-white text-center">QTY</th>
                  <th className="p-6 font-bold text-xs uppercase tracking-widest  text-white">Status</th>
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
                      <td className="p-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{product.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5">ID: #{product.id.toString().padStart(4, '0')}</span>
                        </div>
                      </td>
                      <td className="p-6 text-slate-600 font-mono text-sm">{product.upc}</td>
                      <td className="p-6">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                          {product.category}
                        </span>
                      </td>
                      <td className="p-6 text-slate-600 font-medium">{product.brand}</td>
                      <td className="p-6 font-black text-slate-900">{product.price}</td>
                      <td className="p-6">
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-100 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit">
                          <Lock size={12} strokeWidth={3} /> {product.pricing}
                        </span>
                      </td>
                      <td className="p-6 text-slate-500 font-medium italic">{product.unit}</td>
                      <td className="p-6 text-center">
                        <span className={`font-bold ${product.qty < 5 ? 'text-red-500' : 'text-slate-700'}`}>
                          {product.qty.toFixed(2)}
                        </span>
                      </td>
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
                      <td className="p-6">
                        <div className="flex justify-center items-center gap-4">
                          <motion.button 
                            whileHover={{ scale: 1.2, rotate: 5 }}
                            className="text-slate-400 hover:text-blue-500 transition-colors"
                          >
                            <Eye size={20} />
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.2, rotate: -5 }}
                            onClick={() => handleOpenModal(product)}
                            className="text-slate-400 hover:text-slate-900 transition-colors"
                          >
                            <SquarePen size={20} />
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.2, rotate: 10 }}
                            onClick={() => handleDelete(product.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={20} />
                          </motion.button>
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
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20"
            >
              <div className="bg-blue-600 p-8 flex justify-between items-center text-white relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="relative z-10">
                  <h2 className="text-3xl font-black tracking-tight">
                    {editingProduct ? "Update Product" : "New Product"}
                  </h2>
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1">Fill in the details below</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors relative z-10"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-10 grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Product Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Organic Green Tea"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-800"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">UPC Code</label>
                  <input 
                    required
                    type="text" 
                    placeholder="12-digit code"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                    value={formData.upc}
                    onChange={(e) => setFormData({ ...formData, upc: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Beverages"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Brand</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Nature's Best"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Price</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                    <input 
                      required
                      type="text" 
                      placeholder="0.00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black"
                      value={formData.price?.replace('$', '')}
                      onChange={(e) => setFormData({ ...formData, price: `$${e.target.value}` })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Unit</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. pcs, kg, box"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Quantity</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black"
                    value={formData.qty}
                    onChange={(e) => setFormData({ ...formData, qty: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Status</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold appearance-none cursor-pointer"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "Active" | "Inactive" })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="col-span-2 pt-6 flex gap-4">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-8 py-4 border-2 border-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
                  >
                    {editingProduct ? "Save Changes" : "Create Product"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
              className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20 p-8"
            >
              <div className="flex items-center gap-4 text-red-500 mb-6">
                <div className="bg-red-50 p-3 rounded-2xl">
                  <AlertCircle size={32} />
                </div>
                <h2 className="text-2xl font-black tracking-tight">{confirmModal.title}</h2>
              </div>
              
              <p className="text-slate-600 font-medium leading-relaxed mb-8">
                {confirmModal.message}
              </p>
              
              <div className="flex gap-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 px-6 py-4 border-2 border-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmModal.onConfirm}
                  className="flex-1 px-6 py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-100"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Modal Section */}
      <AnimatePresence>
        {isHistoryOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className="relative bg-white h-full w-full max-w-md shadow-2xl overflow-hidden flex flex-col rounded-l-[3rem]"
            >
              <div className="bg-slate-900 p-10 flex justify-between items-center text-white">
                <div>
                  <h2 className="text-3xl font-black tracking-tight">Activity Log</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Recent inventory actions</p>
                </div>
                <button 
                  onClick={() => setIsHistoryOpen(false)}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-10 space-y-8">
                {history.length > 0 ? (
                  history.map((item) => (
                    <div key={item.id} className="flex gap-4 relative">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                          item.action === 'Add' ? 'bg-emerald-100 text-emerald-600' :
                          item.action === 'Edit' ? 'bg-blue-100 text-blue-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {item.action === 'Add' ? <Plus size={20} /> :
                           item.action === 'Edit' ? <SquarePen size={20} /> :
                           <Trash2 size={20} />}
                        </div>
                        <div className="w-0.5 h-full bg-slate-100 mt-2" />
                      </div>
                      <div className="pb-8">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-slate-800">{item.action}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Clock size={10} /> {item.timestamp}
                          </span>
                        </div>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.details}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-4">
                    <Clock size={64} strokeWidth={1} />
                    <p className="font-bold italic">No activity recorded yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
