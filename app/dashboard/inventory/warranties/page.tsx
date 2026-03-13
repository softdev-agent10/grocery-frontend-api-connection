"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Plus, Edit3, Trash2, Search, Download, Filter, X, Check, FileText, Table as TableIcon, ChevronDown, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DownloadModal from "@/components/download-modal";
import { 
  AddButton, 
  EditButton, 
  DeleteButton, 
  DownloadButton, 
  FilterButton 
} from "@/components/toolbar-buttons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { generatePDFWithLogo, generateCSV } from "@/lib/pdf-export";

interface Warranty {
  id: number;
  productName: string;
  manufacturerDate: string;
  upc: string;
  description: string;
  duration: string;
  status: 'Active' | 'Inactive';
}

// --- Mock Data ---
const MOCK_DATA: Warranty[] = [
  { id: 1, productName: "iPhone 15 Pro", manufacturerDate: "2023-09-22", upc: "194253701234", description: "Apple standard limited warranty.", duration: "1 Year", status: "Active" },
  { id: 2, productName: "Samsung S24 Ultra", manufacturerDate: "2024-01-15", upc: "880609530000", description: "Samsung Care+ included.", duration: "2 Years", status: "Active" },
  { id: 3, productName: "Sony WH-1000XM5", manufacturerDate: "2023-05-10", upc: "027242923456", description: "Audio component coverage.", duration: "6 Months", status: "Active" },
  { id: 4, productName: "Dell XPS 13", manufacturerDate: "2022-11-12", upc: "088304910293", description: "Expired hardware warranty.", duration: "1 Year", status: "Inactive" },
];

interface TableViewColumns {
  checkbox: boolean;
  productName: boolean;
  manufacturerDate: boolean;
  upc: boolean;
  description: boolean;
  duration: boolean;
  action: boolean;
}

export default function WarrantyApp() {
  const [warranties, setWarranties] = useState<Warranty[]>(MOCK_DATA);
  const [mounted, setMounted] = useState(false); // Hydration fix
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWarranty, setEditingWarranty] = useState<Warranty | null>(null);
  
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [durationFilter, setDurationFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("nameAZ");

  const [visibleColumns, setVisibleColumns] = useState<TableViewColumns>({
    checkbox: true,
    productName: true,
    manufacturerDate: true,
    upc: true,
    description: true,
    duration: true,
    action: true,
  });

  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [tempColumns, setTempColumns] = useState<TableViewColumns>(visibleColumns);
  const [tempItemsPerPage, setTempItemsPerPage] = useState(itemsPerPage);

  const [formData, setFormData] = useState<Partial<Warranty>>({
    productName: "",
    manufacturerDate: "",
    upc: "",
    description: "",
    duration: "",
    status: "Active",
  });

  // Next.js hydration fix: Shudhu browser-e render hobe
  useEffect(() => {
    setMounted(true);
  
    fetchWarranties();
  }, []);

  const fetchWarranties = async () => {
    try {
      const response = await fetch("/api/warranties");
      if (response.ok) {
        const data = await response.json();
        setWarranties(data);
      }
    } catch (error) {
      console.warn("API not found, using mock data.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newWarranty = {
      ...formData,
      id: editingWarranty ? editingWarranty.id : Math.floor(Math.random() * 10000),
    } as Warranty;

    // UI Update (Optimistic)
    if (editingWarranty) {
      setWarranties(warranties.map(w => w.id === editingWarranty.id ? newWarranty : w));
    } else {
      setWarranties([newWarranty, ...warranties]);
    }

    setIsModalOpen(false);
    setEditingWarranty(null);
    setFormData({ productName: "", manufacturerDate: "", upc: "", description: "", duration: "", status: "Active" });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure?")) return;
    setWarranties(warranties.filter(w => w.id !== id));
  };

  const handleDownload = (scope: 'current' | 'all', format: 'pdf' | 'csv') => {
    if (format === 'pdf') downloadAsPDF(scope);
    else downloadAsCSV(scope);
    setIsDownloadModalOpen(false);
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
      productName: true,
      manufacturerDate: true,
      upc: true,
      description: true,
      duration: true,
      action: true,
    };
    setTempColumns(defaults);
    setTempItemsPerPage(15);
  };

  const filteredWarranties = useMemo(() => {
    let filtered = warranties.filter(w => {
      const matchesSearch = w.productName.toLowerCase().includes(searchTerm.toLowerCase()) || w.upc.includes(searchTerm);
      const matchesStatus = statusFilter === "All" || w.status === statusFilter;
      const matchesDuration = durationFilter === "All" || w.duration === durationFilter;
      return matchesSearch && matchesStatus && matchesDuration;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "nameAZ":
          return a.productName.localeCompare(b.productName);
        case "nameZA":
          return b.productName.localeCompare(a.productName);
        case "dateOldest":
          return new Date(a.manufacturerDate).getTime() - new Date(b.manufacturerDate).getTime();
        case "dateNewest":
          return new Date(b.manufacturerDate).getTime() - new Date(a.manufacturerDate).getTime();
        case "durationAsc":
          return a.duration.localeCompare(b.duration);
        case "durationDesc":
          return b.duration.localeCompare(a.duration);
        default:
          return 0;
      }
    });

    return filtered;
  }, [warranties, searchTerm, statusFilter, durationFilter, sortBy]);

  const uniqueDurations = Array.from(new Set(warranties.map(w => w.duration))).filter(Boolean);

  const downloadAsCSV = (scope: 'current' | 'all' = 'current') => {
    const data = scope === 'current' ? filteredWarranties : warranties;
    const headers = ["Product", "Date", "UPC", "Duration", "Status"];
    const rows = data.map(w => [w.productName, w.manufacturerDate, w.upc, w.duration, w.status]);
    generateCSV(headers, rows, `warranties_${scope}_${new Date().getTime()}.csv`);
  };

  const downloadAsPDF = (scope: 'current' | 'all' = 'current') => {
    const data = scope === 'current' ? filteredWarranties : warranties;
    const columns = ["Product", "Date", "UPC", "Duration", "Status"];
    const rows = data.map(w => [w.productName, w.manufacturerDate, w.upc, w.duration, w.status]);
    
    generatePDFWithLogo({
      title: `Warranty Report (${scope === 'current' ? 'Current Page' : 'All'})`,
      columns,
      rows,
      fileName: `warranties_${scope}_${new Date().getTime()}.pdf`,
      scope
    });
  };

  if (!mounted) return null; // Prevents hydration error

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
    

      <main className=" mx-auto space-y-6">
        <div className=" border p-6  rounded-2xl bg-blue-600 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Warranties</h1>
            <p className="text-white">Manage and track product warranty coverage.</p>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {isFilterPanelOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm overflow-hidden w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase block mb-3">Status</label>
                  <div className="flex flex-col gap-2">
                    {["All", "Active", "Inactive"].map(s => (
                      <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-md text-sm text-left ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase block mb-3">Duration</label>
                  <select value={durationFilter} onChange={(e) => setDurationFilter(e.target.value)} className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="All">All Durations</option>
                    {uniqueDurations.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-400 uppercase block mb-3">Sort By Name</label>
                <div className="space-y-2">
                  {[
                    { value: "nameAZ", label: "Name (A-Z)" },
                    { value: "nameZA", label: "Name (Z-A)" }
                  ].map(option => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer hover:bg-zinc-50 p-1 rounded">
                      <input type="radio" name="sortName" value={option.value} checked={sortBy === option.value} onChange={() => setSortBy(option.value)} className="w-4 h-4 cursor-pointer" />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-400 uppercase block mb-3">Sort By Date</label>
                <div className="space-y-2">
                  {[
                    { value: "dateOldest", label: "Date (Oldest)" },
                    { value: "dateNewest", label: "Date (Newest)" }
                  ].map(option => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer hover:bg-zinc-50 p-1 rounded">
                      <input type="radio" name="sortDate" value={option.value} checked={sortBy === option.value} onChange={() => setSortBy(option.value)} className="w-4 h-4 cursor-pointer" />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 lg:col-span-4 pt-2 border-t flex gap-3">
                <button onClick={() => { setStatusFilter("All"); setDurationFilter("All"); setSearchTerm(""); setSortBy("nameAZ"); }} className="text-sm text-blue-600 font-medium px-3 py-1.5 hover:bg-blue-50 rounded">↻ Reset Filters</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Actions */}
        <div className="flex gap-3 items-center justify-between">
          <div className="flex gap-2">
            <DownloadButton onClick={() => setIsDownloadModalOpen(true)} />
            <FilterButton onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)} />
          </div>
          <div className="w-80 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-3 py-2.5 bg-white border border-zinc-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all text-sm" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="  border-b border-zinc-200 bg-blue-600">
              <tr>
                {visibleColumns.checkbox && <th className="p-4 text-xs font-semibold text-white uppercase"><input type="checkbox" className="w-4 h-4" /></th>}
                {visibleColumns.productName && <th className="p-4 text-xs font-semibold text-white uppercase">Product</th>}
                {visibleColumns.manufacturerDate && <th className="p-4 text-xs font-semibold text-white uppercase">Date</th>}
                {visibleColumns.upc && <th className="p-4 text-xs font-semibold text-white uppercase">UPC</th>}
                {visibleColumns.description && <th className="p-4 text-xs font-semibold text-white uppercase">Description</th>}
                {visibleColumns.duration && <th className="p-4 text-xs font-semibold text-white uppercase">Duration</th>}
              
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredWarranties.map((w) => (
                <tr key={w.id} className="group hover:bg-zinc-50/50 transition-colors">
                  {visibleColumns.checkbox && <td className="p-4"><input type="checkbox" className="w-4 h-4" /></td>}
                  {visibleColumns.productName && <td className="p-4">
                    <div className="font-semibold text-zinc-900">{w.productName}</div>
                    <div className={`mt-1 inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${w.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>{w.status}</div>
                  </td>}
                  {visibleColumns.manufacturerDate && <td className="p-4 text-sm text-zinc-600">{w.manufacturerDate}</td>}
                  {visibleColumns.upc && <td className="p-4 text-sm font-mono text-zinc-500">{w.upc}</td>}
                  {visibleColumns.description && <td className="p-4 text-sm text-zinc-600">{w.description}</td>}
                  {visibleColumns.duration && <td className="p-4 text-sm text-zinc-600"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">{w.duration}</span></td>}
         
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Add/Edit */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border">
                <div className="p-6 border-b flex justify-between items-center bg-zinc-50">
                  <h2 className="font-bold text-lg">{editingWarranty ? "Edit" : "Add"} Warranty</h2>
                  <button onClick={() => setIsModalOpen(false)}><X size={20}/></button>
                </div>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                  <div><label className="text-xs font-bold text-zinc-500 uppercase">Product Name</label>
                  <input required className="w-full p-2 border rounded-lg bg-zinc-50 outline-none focus:ring-2 focus:ring-blue-500" value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-bold text-zinc-500 uppercase">UPC</label>
                    <input className="w-full p-2 border rounded-lg bg-zinc-50 outline-none" value={formData.upc} onChange={e => setFormData({...formData, upc: e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-zinc-500 uppercase">Duration</label>
                    <input className="w-full p-2 border rounded-lg bg-zinc-50 outline-none" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} /></div>
                  </div>
                  <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"><Check size={18}/> {editingWarranty ? 'Update' : 'Create'}</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
                          {col === 'checkbox' ? 'Checkbox' : col === 'productName' ? 'Product Name' : col === 'manufacturerDate' ? 'Manufacturer Date' : col === 'upc' ? 'UPC' : col === 'description' ? 'Description' : col === 'duration' ? 'Duration' : 'Action'}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Items Per Page */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-600 uppercase block">ITEMS PER PAGE</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[10, 15, 25, 50, 100].map(num => (
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

        {/* Download Modal */}
        <DownloadModal
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
          onDownload={handleDownload}
          title="Export Warranties"
          subtitle="Choose your preferred format"
        />
      </main>
    </div>
  );
}


  








    

