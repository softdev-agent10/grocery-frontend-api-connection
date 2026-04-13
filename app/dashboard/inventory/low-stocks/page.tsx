"use client";
import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Search,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Table as TableIcon,
  Check,
  CheckCircle2,
  Loader2,
  RotateCcw,
  SquarePen
} from "lucide-react";
import DownloadModal from "@/components/download-modal";
import { DownloadButton, FilterButton, EditButton } from "@/components/toolbar-buttons";
import { generatePDFWithLogo, generateCSV } from "@/lib/pdf-export";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getLowStock } from "@/app/services/lowstok/service.lowstok";
import { fetchInventory } from "@/app/services/comon/fetchInventory";
import { se } from "date-fns/locale";

// interface LowStockProduct {
//   id: number;
//   name: string;
//   category: string;
//   currentStock: number;
//   reorderLevel: number;
//   unit: string;
//   price: string;
//   status: "Critical" | "Warning";
// }

interface LowStockProduct {
  id: number,
  name: string,
  upc_code: string,
  plu_code: string,
  category: {
    id: number,
    name: string,
  },
  brand: {
    id: number,
    name: string,
  },
  unit: {
    id: number,
    name: string,
  },
  selling_price: number,
  buying_price: number,
  quantity: number,
  quantity_alert: number,
  stock_status: string,
  percentage_of_alert: number,
  image_url: string | null,
  last_updated: string

}

interface TableViewColumns {
  name: boolean;
  category: boolean;
  upc_code: boolean;
  plu_code: boolean;
  stock_status: boolean;
  quantity: boolean;
  quantity_alert: boolean;
  selling_price: boolean;
  buying_price: boolean;
}

// const INITIAL_MOCK_DATA: LowStockProduct[] = [
//   { id: 1, name: "Chicken Breast", category: "Poultry", currentStock: 4, reorderLevel: 10, unit: "kg", price: "$180.00", status: "Critical" },
//   { id: 2, name: "Milk 1 Liter", category: "Dairy", currentStock: 7, reorderLevel: 15, unit: "L", price: "$90.00", status: "Warning" },
//   { id: 3, name: "Butter 500g", category: "Dairy", currentStock: 3, reorderLevel: 8, unit: "pcs", price: "$250.00", status: "Critical" },
//   { id: 4, name: "Eggs (Dozen)", category: "Dairy", currentStock: 12, reorderLevel: 20, unit: "box", price: "$130.00", status: "Warning" },
//   { id: 5, name: "Salmon Fillet", category: "Seafood", currentStock: 2, reorderLevel: 5, unit: "kg", price: "$450.00", status: "Critical" },
//   { id: 6, name: "Basmati Rice", category: "Grains", currentStock: 15, reorderLevel: 50, unit: "kg", price: "$25.00", status: "Critical" },
//   { id: 7, name: "Olive Oil 500ml", category: "Pantry", currentStock: 5, reorderLevel: 10, unit: "bottle", price: "$42.00", status: "Warning" },
//   { id: 8, name: "Flour 1kg", category: "Pantry", currentStock: 8, reorderLevel: 25, unit: "bag", price: "$15.00", status: "Critical" },
//   { id: 9, name: "Sugar 1kg", category: "Pantry", currentStock: 10, reorderLevel: 15, unit: "bag", price: "$18.00", status: "Warning" },
//   { id: 10, name: "Coffee Beans", category: "Beverages", currentStock: 1, reorderLevel: 5, unit: "kg", price: "$280.00", status: "Critical" },
// ];

export default function App() {
  const [products, setProducts] = useState<LowStockProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortConfig, setSortConfig] = useState<{ key: keyof LowStockProduct | 'none', direction: 'asc' | 'desc' }>({ key: 'none', direction: 'asc' });
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [visibleColumns, setVisibleColumns] = useState<TableViewColumns>({
    name: true,
    category: true,
    upc_code: true,
    plu_code: true,
    stock_status: true,
    quantity: true,
    quantity_alert: true,
    selling_price: true,
    buying_price: true,
  });

  const [tempColumns, setTempColumns] = useState<TableViewColumns>(visibleColumns);
  const [tempItemsPerPage, setTempItemsPerPage] = useState(itemsPerPage);

  // Modals
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<LowStockProduct | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Email Form State
  const [emailTo, setEmailTo] = useState("Groups");
  const [emailSubject, setEmailSubject] = useState("Out of Stock Alert - Immediate Action Required");
  const [emailMessage, setEmailMessage] = useState("");
  const [includePDF, setIncludePDF] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const handleEditModalOpen = () => {
    setTempColumns(visibleColumns);
    setTempItemsPerPage(itemsPerPage);
    setIsEditModalOpen(true);
  };

  const handleApplyTableChanges = () => {
    setVisibleColumns({ ...tempColumns });
    setTempItemsPerPage(tempItemsPerPage);

    localStorage.setItem(
      "lowStockTableViewSettings",
      JSON.stringify({
        columns: tempColumns,
        itemsPerPage: tempItemsPerPage,
      })
    );

    setIsEditModalOpen(false);
  };

  const handleResetTableDefaults = () => {
    const defaults: TableViewColumns = {
      name: true,
      category: true,
      upc_code: true,
      plu_code: true,
      stock_status: true,
      quantity: true,
      quantity_alert: true,
      selling_price: true,
      buying_price: true,
    };
    setTempColumns(defaults);
    setTempItemsPerPage(5);
    localStorage.removeItem("lowStockTableViewSettings");
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem("lowStockTableViewSettings");
    if (savedSettings) {
      const { columns, itemsPerPage } = JSON.parse(savedSettings);
      setVisibleColumns(columns);
      setTempColumns(columns);
      setTempItemsPerPage(itemsPerPage);
    }
  }, []);

  // Filtered and Sorted Paginated Data
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || p.stock_status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortConfig.key !== 'none') {
      result.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof LowStockProduct];
        let bValue: any = b[sortConfig.key as keyof LowStockProduct];

        if (sortConfig.key === 'selling_price' || sortConfig.key === 'buying_price') {
          aValue = parseFloat(aValue.toString().replace('$', '').replace(',', ''));
          bValue = parseFloat(bValue.toString().replace('$', '').replace(',', ''));
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [products, searchTerm, statusFilter, sortConfig]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const getLowStocks = async () => {
    try {
      // const data = await getLowStock({
      //   branchId: 1234567890,
      //   token: "your-token",
      // });

      const data = await fetchInventory("low-stock", {
        branchId: "1234567890",
        token: "your-auth-token",
        page: 1,
        limit: 100,
      });



      console.log("Fetched low stock products:", data);

      // Example:
      const items = data.data.items;
      setProducts(items);

      console.log("Items:", items);

    } catch (error) {
      console.error("Error fetching low stock products:", error);
    }
  };

  useEffect(() => {

    setCurrentPage(1);
    getLowStocks();
  }, [searchTerm, statusFilter, sortConfig]);

  // Export Functions
  const exportToCSV = (data: LowStockProduct[], filename: string) => {
    const headers = ["Product Name", "Category", "Current Stock", "Reorder Level", "Unit", "Status"];
    const csvContent = [
      headers.join(","),
      ...data.map(p => `${p.name},${p.category},${p.quantity_alert},${p.quantity_alert},${p.unit},${p.stock_status}`)
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

  const exportToPDF = (data: LowStockProduct[], filename: string) => {
    const doc = new jsPDF();
    doc.text("Low Stock Inventory Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    autoTable(doc, {
      startY: 30,
      head: [["Product Name", "Category", "Stock", "Reorder", "Unit", "Status"]],
      body: data.map(p => [p.name, p.category.name, p.quantity_alert, p.quantity_alert, p.unit.name, p.stock_status]),
      headStyles: { fillColor: [234, 88, 12] }, // orange-600
    });

    doc.save(`${filename}.pdf`);
  };

  const handleSendEmail = async () => {
    setIsSending(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSending(false);
    setSendSuccess(true);
    setTimeout(() => {
      setSendSuccess(false);
      setIsEmailModalOpen(false);
    }, 2000);
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
    setIsEditModalOpen(false);
  };

  const handleDownload = (scope: 'current' | 'all', format: 'pdf' | 'csv') => {
    const data = scope === 'current' ? paginatedProducts : filteredProducts;
    const columns = ['Product Name', 'Category', 'Current Stock', 'Reorder Level', 'Unit', 'Status'];
    const rows = data.map(p => [p.name, p.category, p.quantity_alert, p.quantity_alert, p.unit, p.stock_status]);

    if (format === 'csv') {
      generateCSV(columns, rows, `low-stock_${scope}_${new Date().getTime()}.csv`);
    } else if (format === 'pdf') {
      generatePDFWithLogo({
        title: `Low Stock Products Report (${scope === 'current' ? 'Current Page' : 'All Pages'})`,
        columns,
        rows,
        fileName: `low-stock_${scope}_${new Date().getTime()}.pdf`,
        scope
      });
    }

    setIsDownloadModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
      <div className="  mx-auto space-y-6">

        {/* Header Section */}
        <div className="rounded-2xl bg-blue-700 p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
                <AlertCircle size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Low Stock Alerts</h1>
                <p className="text-orange-100 mt-1">Real-time inventory monitoring & reporting</p>
              </div>
            </div>

          </div>
        </div>



        {/* Filters & Search Section */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex  gap-3">
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="flex items-center  gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-all shadow-sm active:scale-95"
            >
              <Mail size={18} />
              Email
            </button>
            <DownloadButton onClick={() => setIsDownloadModalOpen(true)} />
            <DownloadModal
              isOpen={isDownloadModalOpen}
              onClose={() => setIsDownloadModalOpen(false)}
              onDownload={handleDownload}
              title="Export Low Stock Report"
              subtitle="Choose your preferred format"
            />

            <div className="relative">
              <FilterButton onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} />
              {isFilterMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsFilterMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-20 overflow-hidden max-h-[80vh] overflow-y-auto"
                  >
                    <div className="p-3 bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Status</div>
                    {["All", "Critical", "Warning"].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setStatusFilter(status);
                          setIsFilterMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors ${statusFilter === status ? 'bg-orange-50 text-orange-600' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {status} {statusFilter === status && <Check size={16} />}
                      </button>
                    ))}

                    <div className="p-3 bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b  border-t border-gray-100">Sort By Name</div>
                    {[
                      { label: "Name (A-Z)", key: "name", dir: "asc" },
                      { label: "Name (Z-A)", key: "name", dir: "desc" },
                    ].map((sort) => (
                      <button
                        key={sort.label}
                        onClick={() => {
                          setSortConfig({ key: sort.key as any, direction: sort.dir as any });
                          setIsFilterMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors ${sortConfig.key === sort.key && sortConfig.direction === sort.dir ? 'bg-orange-50 text-orange-600' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {sort.label} {sortConfig.key === sort.key && sortConfig.direction === sort.dir && <Check size={16} />}
                      </button>
                    ))}

                    <div className="p-3 bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b  border-t border-gray-100">Sort By Price</div>
                    {[
                      { label: "Price (Low to High)", key: "price", dir: "asc" },
                      { label: "Price (High to Low)", key: "price", dir: "desc" },
                    ].map((sort) => (
                      <button
                        key={sort.label}
                        onClick={() => {
                          setSortConfig({ key: sort.key as any, direction: sort.dir as any });
                          setIsFilterMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors ${sortConfig.key === sort.key && sortConfig.direction === sort.dir ? 'bg-orange-50 text-orange-600' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {sort.label} {sortConfig.key === sort.key && sortConfig.direction === sort.dir && <Check size={16} />}
                      </button>
                    ))}

                    <button
                      onClick={() => {
                        setStatusFilter("All");
                        setSortConfig({ key: 'none', direction: 'asc' });
                        setSearchTerm("");
                        setIsFilterMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100"
                    >
                      <X size={16} /> Reset Filters
                    </button>
                  </motion.div>
                </>
              )}
            </div>
            <EditButton onClick={handleEditModalOpen} />
          </div>


          <div className="relative w-full md:w-96">

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by product or category..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-gray-500 text-sm font-medium">Total Low Stock Items</p>
            <p className="text-4xl font-bold text-orange-600 mt-2">{filteredProducts.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-gray-500 text-sm font-medium">Critical Items</p>
            <p className="text-4xl font-bold text-red-600 mt-2">{filteredProducts.filter(p => p.stock_status === 'Critical').length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-gray-500 text-sm font-medium">Warning Items</p>
            <p className="text-4xl font-bold text-yellow-600 mt-2">{filteredProducts.filter(p => p.stock_status === 'Warning').length}</p>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-blue-600 text-white border-b border-gray-200">
                <tr>
                  {visibleColumns.name && <th className="p-5 font-semibold">Product Name</th>}
                  {visibleColumns.category && <th className="p-5 font-semibold">Category</th>}
                  {visibleColumns.selling_price && <th className="p-5 font-semibold">Selling Price</th>}
                  {visibleColumns.buying_price && <th className="p-5 font-semibold">Buying Price</th>}
                  {visibleColumns.quantity && <th className="p-5 font-semibold">Current Stock</th>}
                  {visibleColumns.quantity_alert && <th className="p-5 font-semibold">Reorder Level</th>}
                  {visibleColumns.stock_status && <th className="p-5 font-semibold">Status</th>}
                  {visibleColumns && <th className="p-5 font-semibold text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedProducts.length > 0 ? paginatedProducts.map((item) => (
                  <tr key={item.id} className="hover:bg-orange-50/30 transition-colors group">
                    {visibleColumns.name && <td className="p-5 font-medium text-gray-900">{item.name}</td>}
                    {visibleColumns.category && <td className="p-5 text-gray-500">{item.category.name}</td>}
                    {visibleColumns.selling_price && <td className="p-5 text-gray-500">${item.selling_price}</td>}
                    {visibleColumns.buying_price && <td className="p-5 text-gray-500">${item.buying_price}</td>}
                    {visibleColumns.quantity && (
                      <td className="p-5">
                        <span className={`font-bold ${item.stock_status === 'Critical' ? 'text-red-600' : 'text-yellow-600'}`}>
                          {item.quantity}
                        </span>
                      </td>
                    )}
                    {visibleColumns.quantity_alert && <td className="p-5 text-gray-500">{item.quantity_alert}</td>}
                    {visibleColumns.stock_status && (
                      <td className="p-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${item.stock_status === 'Critical'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                          }`}>
                          {item.stock_status}
                        </span>
                      </td>
                    )}
                    {visibleColumns && (
                      <td className="p-5 text-right">
                        <button
                          onClick={() => { setEditingProduct(item); setIsEditModalOpen(true); }}
                          className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-100 rounded-lg transition-all"
                        >
                          <SquarePen size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-gray-400">
                      No products found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> of <span className="font-medium">{filteredProducts.length}</span> results
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-medium text-gray-700 px-4">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      <AnimatePresence>
        {isEmailModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEmailModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-orange-50">
                <h2 className="text-xl font-bold text-orange-900 flex items-center gap-2">
                  <Mail className="text-orange-600" /> Send Email Report
                </h2>
                <button onClick={() => setIsEmailModalOpen(false)} className="p-2 hover:bg-orange-100 rounded-full transition-colors">
                  <X size={20} className="text-orange-900" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Send To</label>
                  <div className="flex bg-gray-100 p-1 rounded-xl">
                    {["Groups", "Individuals", "Custom Emails"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setEmailTo(tab)}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${emailTo === tab ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                          }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {emailTo === "Groups" ? "Select Recipient Groups" : emailTo === "Individuals" ? "Select Individuals" : "Enter Custom Emails"}
                  </label>
                  <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-center text-gray-400 text-sm italic">
                    {emailTo === "Custom Emails" ? (
                      <input type="text" placeholder="e.g. manager@store.com, admin@store.com" className="w-full bg-transparent border-none focus:ring-0 text-slate-900" />
                    ) : (
                      `No ${emailTo.toLowerCase()} found`
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Additional Message (Optional)</label>
                  <textarea
                    placeholder="Add any additional notes or instructions for the recipients..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none"
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={includePDF}
                      onChange={() => setIncludePDF(!includePDF)}
                    />
                    <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-orange-600 peer-checked:border-orange-600 transition-all" />
                    <CheckCircle2 size={12} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Include PDF attachment with detailed report</span>
                </label>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => setIsEmailModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={isSending || sendSuccess}
                  className="flex-2 px-4 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSending ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : sendSuccess ? (
                    <CheckCircle2 size={20} />
                  ) : null}
                  {isSending ? "Sending..." : sendSuccess ? "Sent Successfully!" : "Send Email"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Edit Product Stock</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateProduct} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                  <input type="text" disabled value={editingProduct.name} className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Current Stock</label>
                    <input
                      type="number"
                      value={editingProduct.quantity}
                      onChange={(e) => setEditingProduct({ ...editingProduct, quantity: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Reorder Level</label>
                    <input
                      type="number"
                      value={editingProduct.quantity_alert}
                      onChange={(e) => setEditingProduct({ ...editingProduct, quantity_alert: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={editingProduct.stock_status}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock_status: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  >
                    <option value="Critical">Critical</option>
                    <option value="Warning">Warning</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Table View Modal */}
      <AnimatePresence>
        {isEditModalOpen && !editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-200"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 p-5 border-b flex justify-between items-center bg-white">
                <h2 className="font-semibold text-lg text-gray-800">Edit Table View</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 rounded hover:bg-gray-100 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-5 space-y-6 max-h-100 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">

                {/* Table View Columns */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Table View
                  </label>

                  {(Object.keys(tempColumns) as Array<keyof TableViewColumns>).map(col => (
                    <label
                      key={col}
                      className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-blue-50 transition"
                    >
                      <input
                        type="checkbox"
                        checked={tempColumns[col]}
                        onChange={() =>
                          setTempColumns({ ...tempColumns, [col]: !tempColumns[col] })
                        }
                        className="w-5 h-5 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        {col === 'name'
                          ? 'Product Name'
                          : col === 'category'
                            ? 'Category'
                            : col === 'upc_code'
                              ? 'UPC Code'
                              : col === 'plu_code'
                                ? 'PLU Code'
                                : col === 'quantity'
                                  ? 'Current Stock'
                                  : col === 'quantity_alert'
                                    ? 'Reorder Level'
                                    : col === 'selling_price'
                                      ? 'Selling Price'
                                      : col === 'buying_price'
                                        ? 'Buying Price'
                                        : col === 'stock_status'
                                          ? 'Status'
                                          : col}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Items Per Page */}
                <div className="space-y-3 pt-4 border-t">
                  <h3 className="text-xs font-bold uppercase text-gray-500">
                    Items Per Page
                  </h3>

                  <div className="space-y-2">
                    {[10, 15, 25, 50, 100].map(num => (
                      <label
                        key={num}
                        className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-blue-50 transition"
                      >
                        <input
                          type="radio"
                          name="itemsPerPage"
                          value={num}
                          checked={tempItemsPerPage === num}
                          onChange={e =>
                            setTempItemsPerPage(Number(e.target.value))
                          }
                          className="w-4 h-4  cursor-pointer"
                        />
                        <span className="text-sm text-gray-700 font-medium">
                          {num} items
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 p-5 border-t bg-white space-y-3">
                <button
                  onClick={handleApplyTableChanges}
                  className="w-full py-2.5 bg-blue-400 text-white font-semibold rounded-lg hover:bg-blue-500 transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Check size={18} /> Apply
                </button>

                <button
                  onClick={handleResetTableDefaults}
                  className="w-full py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} /> Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
