"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Plus, Edit3, Trash2, Search, Download, Filter, X, Check, FileText, Table as TableIcon, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DownloadModal from "@/components/download-modal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

export default function WarrantyApp() {
  const [warranties, setWarranties] = useState<Warranty[]>(MOCK_DATA);
  const [mounted, setMounted] = useState(false); // Hydration fix
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [editingWarranty, setEditingWarranty] = useState<Warranty | null>(null);
  
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [durationFilter, setDurationFilter] = useState<string>("All");

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

  const filteredWarranties = useMemo(() => {
    return warranties.filter(w => {
      const matchesSearch = w.productName.toLowerCase().includes(searchTerm.toLowerCase()) || w.upc.includes(searchTerm);
      const matchesStatus = statusFilter === "All" || w.status === statusFilter;
      const matchesDuration = durationFilter === "All" || w.duration === durationFilter;
      return matchesSearch && matchesStatus && matchesDuration;
    });
  }, [warranties, searchTerm, statusFilter, durationFilter]);

  const uniqueDurations = Array.from(new Set(warranties.map(w => w.duration))).filter(Boolean);

  const downloadAsCSV = (scope: 'current' | 'all' = 'current') => {
    const data = scope === 'current' ? filteredWarranties : warranties;
    const headers = ["Product,Date,UPC,Duration,Status"];
    const rows = data.map(w => `${w.productName},${w.manufacturerDate},${w.upc},${w.duration},${w.status}`);
    const blob = new Blob([[headers, ...rows].join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `warranties_${scope}.csv`;
    a.click();
  };

  const downloadAsPDF = (scope: 'current' | 'all' = 'current') => {
    const data = scope === 'current' ? filteredWarranties : warranties;
    const doc = new jsPDF();
    doc.text("Warranty Report", 14, 15);
    autoTable(doc, {
      startY: 25,
      head: [["Product", "UPC", "Duration", "Status"]],
      body: data.map(w => [w.productName, w.upc, w.duration, w.status]),
    });
    doc.save(`warranties_${scope}.pdf`);
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
          <div className="flex gap-2">
            <button onClick={() => setIsDownloadModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-50 shadow-sm"><Download size={16}/> Download</button>
            <button onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)} className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all ${isFilterPanelOpen ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-zinc-200'}`}><Filter size={16}/> Filter</button>
            <button onClick={() => { setEditingWarranty(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-md shadow-blue-200"><Plus size={16}/> Add New</button>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {isFilterPanelOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase">Status</label>
                <div className="flex gap-2">
                  {["All", "Active", "Inactive"].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 rounded-md text-sm ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-zinc-100 text-zinc-600'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase">Duration</label>
                <select value={durationFilter} onChange={(e) => setDurationFilter(e.target.value)} className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none">
                  <option value="All">All Durations</option>
                  {uniqueDurations.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={() => { setStatusFilter("All"); setDurationFilter("All"); setSearchTerm(""); }} className="text-sm text-blue-600 font-medium">Reset Filters</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input type="text" placeholder="Search product or UPC..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all" />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="  border-b border-zinc-200 bg-blue-600">
              <tr>
                <th className="p-4 text-xs font-semibold text-white uppercase">Product</th>
                <th className="p-4 text-xs font-semibold text-white uppercase">UPC</th>
                <th className="p-4 text-xs font-semibold text-white uppercase">Duration</th>
                <th className="p-4 text-xs font-semibold text-white uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredWarranties.map((w) => (
                <tr key={w.id} className="group hover:bg-zinc-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-zinc-900">{w.productName}</div>
                    <div className={`mt-1 inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${w.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>{w.status}</div>
                  </td>
                  <td className="p-4 text-sm font-mono text-zinc-500">{w.upc}</td>
                  <td className="p-4 text-sm text-zinc-600"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">{w.duration}</span></td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingWarranty(w); setFormData(w); setIsModalOpen(true); }} className="p-2 text-black hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit3 size={16}/></button>
                      <button onClick={() => handleDelete(w.id)} className="p-2 text-black hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                    </div>
                  </td>
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


  








    

