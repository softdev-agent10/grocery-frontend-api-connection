"use client";
import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Percent, DollarSign, ShieldCheck, ShieldAlert, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTaxes, createTax, updateTax, deleteTax as deleteTaxAPI } from "@/app/services/taxes/service.taxes";
import { getFees, createFee, updateFee, deleteFee as deleteFeeAPI } from "@/app/services/fees/service.fees";
import { useNotification } from "@/hooks/useNotification";
import { useApiContext } from "@/hooks/useApiContext";
import { Notification } from "@/components/Notification";

interface Tax {
  id: number;
  name: string;
  rate: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Fee {
  id: number;
  name: string;
  amount: number;
  is_percentage: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function App() {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const { notification, showNotification } = useNotification();

  // Modal States
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);

  // Form States
  const [taxForm, setTaxForm] = useState({ name: "", rate: "", status: true });
  const [feeForm, setFeeForm] = useState({ name: "", type: "Flat" as "Flat" | "Percentage", amount: "", status: true });

  // Set API context once (merchant_id, branch_id, token)
  useApiContext('9', '1234567890');

  useEffect(() => {
    setIsClient(true);
    const mediaQuery = window.matchMedia('print');
    setIsPrintMode(mediaQuery.matches);

    const handlePrintChange = (e: MediaQueryListEvent) => {
      setIsPrintMode(e.matches);
    };

    mediaQuery.addEventListener('change', handlePrintChange);
    return () => mediaQuery.removeEventListener('change', handlePrintChange);
  }, []);

  // Fetch taxes and fees on mount
  useEffect(() => {
    loadTaxes();
    loadFees();
  }, []);

  const loadTaxes = async () => {
    try {
      setLoading(true);
      const response = await getTaxes({ page: 1, limit: 100 });
      setTaxes(response.data.items);
    } catch (error) {
      console.error("Error fetching taxes:", error);
      showNotification("Failed to load taxes", 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadFees = async () => {
    try {
      setLoading(true);
      const response = await getFees({ page: 1, limit: 100 });
      setFees(response.data.items);
    } catch (error) {
      console.error("Error fetching fees:", error);
      showNotification("Failed to load fees", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handlers for Taxes
  const handleSaveTax = async () => {
    if (taxForm.name && taxForm.rate) {
      try {
        setLoading(true);
        await createTax({
          name: taxForm.name,
          rate: parseFloat(taxForm.rate),
          is_active: taxForm.status,
        });
        console.log("Tax created successfully", taxForm);
        showNotification(`Tax "${taxForm.name}" created successfully!`, 'success');
        setShowTaxModal(false);
        setTaxForm({ name: "", rate: "", status: true });
        await loadTaxes();
      } catch (error) {
        console.error("Error creating tax:", error);
        showNotification("Failed to create tax", 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const deleteTax = async (id: number) => {
    if (isClient && window.confirm("Are you sure you want to delete this tax?")) {
      try {
        setLoading(true);
        await deleteTaxAPI(id);
        showNotification("Tax deleted successfully!", 'success');
        await loadTaxes();
      } catch (error) {
        console.error("Error deleting tax:", error);
        showNotification("Failed to delete tax", 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleTaxStatus = async (id: number) => {
    try {
      const tax = taxes.find(t => t.id === id);
      if (tax) {
        setLoading(true);
        await updateTax(id, {
          name: tax.name,
          rate: tax.rate,
          is_active: !tax.is_active,
        });
        showNotification("Tax status updated!", 'success');
        await loadTaxes();
      }
    } catch (error) {
      console.error("Error updating tax status:", error);
      showNotification("Failed to update tax status", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handlers for Fees
  const handleSaveFee = async () => {
    if (feeForm.name && feeForm.amount) {
      try {
        setLoading(true);
        await createFee({
          name: feeForm.name,
          amount: parseFloat(feeForm.amount),
          is_percentage: feeForm.type === "Percentage",
          is_active: feeForm.status,
        });
        showNotification(`Fee "${feeForm.name}" created successfully!`, 'success');
        setShowFeeModal(false);
        setFeeForm({ name: "", type: "Flat", amount: "", status: true });
        console.log("Fee created successfully", feeForm);
        await loadFees();

      } catch (error) {
        console.error("Error creating fee:", error);
        showNotification("Failed to create fee", 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const deleteFee = async (id: number) => {
    if (isClient && window.confirm("Are you sure you want to delete this fee?")) {
      try {
        setLoading(true);
        await deleteFeeAPI(id);
        showNotification("Fee deleted successfully!", 'success');
        await loadFees();
      } catch (error) {
        console.error("Error deleting fee:", error);
        showNotification("Failed to delete fee", 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleFeeStatus = async (id: number) => {
    try {
      const fee = fees.find(f => f.id === id);
      if (fee) {
        setLoading(true);
        await updateFee(id, {
          name: fee.name,
          amount: fee.amount,
          is_percentage: fee.is_percentage,
          is_active: !fee.is_active,
        });
        showNotification("Fee status updated!", 'success');
        await loadFees();
      }
    } catch (error) {
      console.error("Error updating fee status:", error);
      showNotification("Failed to update fee status", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 ">
      {notification && <Notification message={notification.message} type={notification.type} />}
      <div className=" mx-auto space-y-8 md:space-y-10 2xl:space-y-12">

        {/* Header */}
        <header className="bg-blue-600 p-6 md:p-8 2xl:p-10 rounded-2xl md:rounded-3xl flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-4 print:hidden">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl 2xl:text-5xl font-bold tracking-tight text-white">Tax & Fees</h1>
            <p className="text-white mt-1 md:mt-2 text-xs sm:text-sm md:text-base 2xl:text-lg">Configure and manage global tax rates and service fees.</p>
          </div>
          <div className="flex gap-2 md:gap-3">
            <button
              onClick={() => isClient && window.print()}
              className="bg-green-500 border border-slate-200 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm hover:bg-green-800 transition-all shadow-sm flex items-center gap-2 active:scale-95"
            >
              <span className="hidden sm:inline">Print Report</span>
              <span className="sm:hidden">Print</span>
            </button>
          </div>
        </header>

        {/* Print Only Header */}
        <div className="hidden print:block mb-6 md:mb-8 border-b-2 border-slate-900 pb-3 md:pb-4">
          <h1 className="text-2xl md:text-3xl 2xl:text-4xl font-bold">Tax & Fees Report</h1>
          <p className="text-xs md:text-sm 2xl:text-base text-slate-500 mt-1">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 2xl:gap-10">

          {/* Tax Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between border-2 p-4 md:p-6 2xl:p-8 rounded-xl md:rounded-2xl 2xl:rounded-3xl bg-white shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 md:p-3 2xl:p-4 bg-indigo-600 text-white rounded-lg md:rounded-2xl 2xl:rounded-3xl shadow-lg shadow-indigo-100">
                  <Percent size={20} className="md:w-6 md:h-6 2xl:w-8 2xl:h-8" />
                </div>
                <div>
                  <h2 className="text-lg md:text-2xl 2xl:text-3xl font-bold">Taxes</h2>
                  <p className="text-slate-400 text-xs md:text-sm 2xl:text-base">Percentage based government levies</p>
                </div>
              </div>
              <button
                onClick={() => setShowTaxModal(true)}
                className="bg-indigo-600 text-white px-3 md:px-6 py-2 md:py-3 rounded-lg md:rounded-2xl 2xl:rounded-3xl font-bold text-xs md:text-sm 2xl:text-base flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 print:hidden whitespace-nowrap"
              >
                <Plus size={16} className="md:w-5 md:h-5 2xl:w-6 2xl:h-6" /> Add Tax
              </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs md:text-sm 2xl:text-lg text-left">
                  <thead className="bg-blue-600 border-b border-slate-100 text-white uppercase text-[9px] md:text-xs 2xl:text-sm font-bold tracking-[0.1em]">
                    <tr>
                      <th className="p-3 md:p-4 2xl:p-6 pl-4 md:pl-6 2xl:pl-8">Tax Name</th>
                      <th className="p-3 md:p-4 2xl:p-6">Rate (%)</th>
                      <th className="p-3 md:p-4 2xl:p-6">Status</th>
                      <th className="p-3 md:p-4 2xl:p-6 pr-4 md:pr-6 2xl:pr-8 text-right print:hidden">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <AnimatePresence mode="popLayout">
                      {taxes.map((tax) => (
                        <motion.tr
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, x: -20 }}
                          key={tax.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className="p-3 md:p-4 2xl:p-6 pl-4 md:pl-6 2xl:pl-8 font-semibold text-slate-700 text-xs md:text-sm 2xl:text-base">{tax.name}</td>
                          <td className="p-3 md:p-4 2xl:p-6">
                            <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-lg md:rounded-xl text-xs md:text-sm 2xl:text-base font-bold bg-indigo-50 text-indigo-600 border border-indigo-100/50">
                              {tax.rate}%
                            </span>
                          </td>
                          <td className="p-3 md:p-4 2xl:p-6">
                            <button
                              onClick={() => toggleTaxStatus(tax.id)}
                              disabled={isPrintMode}
                              className={`inline-flex items-center gap-2 px-2 md:px-3 py-1 rounded-lg md:rounded-xl text-[10px] md:text-xs 2xl:text-sm font-bold border transition-all print:border-none print:bg-transparent ${tax.is_active
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 print:text-emerald-700'
                                : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200 print:text-slate-500'
                                }`}
                            >
                              {tax.is_active ? <ShieldCheck size={12} className="md:w-4 md:h-4 2xl:w-5 2xl:h-5" /> : <ShieldAlert size={12} className="md:w-4 md:h-4 2xl:w-5 2xl:h-5" />}
                              {tax.is_active ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="p-3 md:p-4 2xl:p-6 pr-4 md:pr-6 2xl:pr-8 text-right print:hidden">
                            <div className="flex justify-end gap-1 md:gap-2">
                              <button
                                onClick={() => {
                                  const newName = isClient && window.prompt("Edit Tax Name:", tax.name);
                                  if (newName) setTaxes(taxes.map(t => t.id === tax.id ? { ...t, name: newName } : t));
                                }}
                                className="p-2 md:p-2.5 2xl:p-3 text-black hover:text-indigo-600 hover:bg-indigo-50 rounded-lg md:rounded-xl 2xl:rounded-2xl transition-all"
                              >
                                <Edit3 size={16} className="md:w-4.5 md:h-4.5 2xl:w-5 2xl:h-5" />
                              </button>
                              <button
                                onClick={() => deleteTax(tax.id)}
                                className="p-2 md:p-2.5 2xl:p-3 text-black hover:text-rose-600 hover:bg-rose-50 rounded-lg md:rounded-xl 2xl:rounded-2xl transition-all"
                              >
                                <Trash2 size={16} className="md:w-4.5 md:h-4.5 2xl:w-5 2xl:h-5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>

          {/* Fees Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between border-2 p-4 md:p-6 2xl:p-8 rounded-xl md:rounded-2xl 2xl:rounded-3xl bg-white shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 md:p-3 2xl:p-4 bg-emerald-600 text-white rounded-lg md:rounded-2xl 2xl:rounded-3xl shadow-lg shadow-emerald-100">
                  <DollarSign size={20} className="md:w-6 md:h-6 2xl:w-8 2xl:h-8" />
                </div>
                <div>
                  <h2 className="text-lg md:text-2xl 2xl:text-3xl font-bold">Fees</h2>
                  <p className="text-slate-400 text-xs md:text-sm 2xl:text-base">Service charges and processing costs</p>
                </div>
              </div>
              <button
                onClick={() => setShowFeeModal(true)}
                className="bg-emerald-600 text-white px-3 md:px-6 py-2 md:py-3 rounded-lg md:rounded-2xl 2xl:rounded-3xl font-bold text-xs md:text-sm 2xl:text-base flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95 print:hidden whitespace-nowrap"
              >
                <Plus size={16} className="md:w-5 md:h-5 2xl:w-6 2xl:h-6" /> Add Fee
              </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs md:text-sm 2xl:text-lg text-left">
                  <thead className="bg-blue-600 border-b border-slate-100 text-white uppercase text-[9px] md:text-xs 2xl:text-sm font-bold tracking-[0.1em]">
                    <tr>
                      <th className="p-6 pl-8">Fee Name</th>
                      <th className="p-6">Amount</th>
                      <th className="p-6">Percentage</th>
                      <th className="p-6">Status</th>
                      <th className="p-6 pr-8 text-right print:hidden">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <AnimatePresence mode="popLayout">
                      {fees.map((fee) => (
                        <motion.tr
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, x: -20 }}
                          key={fee.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className="p-3 md:p-4 2xl:p-6 pl-4 md:pl-6 2xl:pl-8 font-semibold text-slate-700 text-xs md:text-sm 2xl:text-base">{fee.name}</td>
                          <td className="p-3 md:p-4 2xl:p-6 text-slate-600 font-medium text-xs md:text-sm 2xl:text-base">
                            {!fee.is_percentage && fee.amount > 0 ? `$${fee.amount.toFixed(2)}` : <span className="text-slate-300 print:text-slate-400">—</span>}
                          </td>
                          <td className="p-3 md:p-4 2xl:p-6">
                            {fee.is_percentage && fee.amount > 0 ? (
                              <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-lg md:rounded-xl text-xs md:text-sm 2xl:text-base font-bold bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                                {fee.amount}%
                              </span>
                            ) : <span className="text-slate-300 print:text-slate-400">—</span>}
                          </td>
                          <td className="p-3 md:p-4 2xl:p-6">
                            <button
                              onClick={() => toggleFeeStatus(fee.id)}
                              disabled={isPrintMode}
                              className={`inline-flex items-center gap-2 px-2 md:px-3 py-1 rounded-lg md:rounded-xl text-[10px] md:text-xs 2xl:text-sm font-bold border transition-all print:border-none print:bg-transparent ${fee.is_active
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 print:text-emerald-700'
                                : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200 print:text-slate-500'
                                }`}
                            >
                              {fee.is_active ? <ShieldCheck size={12} className="md:w-4 md:h-4 2xl:w-5 2xl:h-5" /> : <ShieldAlert size={12} className="md:w-4 md:h-4 2xl:w-5 2xl:h-5" />}
                              {fee.is_active ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="p-3 md:p-4 2xl:p-6 pr-4 md:pr-6 2xl:pr-8 text-right print:hidden">
                            <div className="flex justify-end gap-1 md:gap-2">
                              <button
                                onClick={() => {
                                  const newName = isClient && window.prompt("Edit Fee Name:", fee.name);
                                  if (newName) setFees(fees.map(f => f.id === fee.id ? { ...f, name: newName } : f));
                                }}
                                className="p-2 md:p-2.5 2xl:p-3 text-black hover:text-emerald-600 hover:bg-emerald-50 rounded-lg md:rounded-xl 2xl:rounded-2xl transition-all"
                              >
                                <Edit3 size={16} className="md:w-4.5 md:h-4.5 2xl:w-5 2xl:h-5" />
                              </button>
                              <button
                                onClick={() => deleteFee(fee.id)}
                                className="p-2 md:p-2.5 2xl:p-3 text-black hover:text-rose-600 hover:bg-rose-50 rounded-lg md:rounded-xl 2xl:rounded-2xl transition-all"
                              >
                                <Trash2 size={16} className="md:w-4.5 md:h-4.5 2xl:w-5 2xl:h-5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>

        </div>


      </div>

      {/* Add Tax Modal */}
      <AnimatePresence>
        {showTaxModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTaxModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md md:max-w-lg 2xl:max-w-2xl bg-white rounded-2xl md:rounded-3xl 2xl:rounded-4xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 md:p-6 2xl:p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg md:text-xl 2xl:text-2xl font-bold text-slate-900">Add Tax</h3>
                <button onClick={() => setShowTaxModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} className="md:w-6 md:h-6 2xl:w-7 2xl:h-7 text-slate-400" />
                </button>
              </div>
              <div className="p-6 md:p-8 2xl:p-10 space-y-6 md:space-y-8 2xl:space-y-10">
                <div className="space-y-2">
                  <label className="text-xs md:text-sm 2xl:text-base font-bold text-slate-400 uppercase tracking-wider">Name</label>
                  <input
                    type="text"
                    placeholder="Enter tax name"
                    value={taxForm.name}
                    onChange={(e) => setTaxForm({ ...taxForm, name: e.target.value })}
                    className="w-full px-3 md:px-4 2xl:px-5 py-2 md:py-3 2xl:py-4 bg-slate-50 border border-slate-200 rounded-lg md:rounded-xl 2xl:rounded-2xl text-sm md:text-base 2xl:text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs md:text-sm 2xl:text-base font-bold text-slate-400 uppercase tracking-wider">Rate (%)</label>
                  <input
                    type="number"
                    placeholder="Enter tax rate"
                    value={taxForm.rate}
                    onChange={(e) => setTaxForm({ ...taxForm, rate: e.target.value })}
                    className="w-full px-3 md:px-4 2xl:px-5 py-2 md:py-3 2xl:py-4 bg-slate-50 border border-slate-200 rounded-lg md:rounded-xl 2xl:rounded-2xl text-sm md:text-base 2xl:text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="flex items-center justify-between p-3 md:p-4 2xl:p-6 bg-slate-50 rounded-lg md:rounded-xl 2xl:rounded-2xl border border-slate-100">
                  <span className="font-semibold text-slate-700 text-sm md:text-base 2xl:text-lg">Active</span>
                  <button
                    onClick={() => setTaxForm({ ...taxForm, status: !taxForm.status })}
                    className={`w-12 h-6 rounded-full transition-all relative ${taxForm.status ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${taxForm.status ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>
              <div className="p-4 md:p-6 2xl:p-8 bg-slate-50 flex gap-2 md:gap-3 2xl:gap-4">
                <button
                  onClick={handleSaveTax}
                  className="flex-1 bg-indigo-600 text-white py-2 md:py-3 2xl:py-4 rounded-lg md:rounded-xl 2xl:rounded-2xl font-bold text-sm md:text-base 2xl:text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowTaxModal(false)}
                  className="flex-1 bg-white border border-slate-200 text-slate-600 py-2 md:py-3 2xl:py-4 rounded-lg md:rounded-xl 2xl:rounded-2xl font-bold text-sm md:text-base 2xl:text-lg hover:bg-slate-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Fee Modal */}
      <AnimatePresence>
        {showFeeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFeeModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md md:max-w-lg 2xl:max-w-2xl bg-white rounded-2xl md:rounded-3xl 2xl:rounded-4xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 md:p-6 2xl:p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg md:text-xl 2xl:text-2xl font-bold text-slate-900">Add Fee</h3>
                <button onClick={() => setShowFeeModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} className="md:w-6 md:h-6 2xl:w-7 2xl:h-7 text-slate-400" />
                </button>
              </div>
              <div className="p-6 md:p-8 2xl:p-10 space-y-6 md:space-y-8 2xl:space-y-10">
                <div className="space-y-2">
                  <label className="text-xs md:text-sm 2xl:text-base font-bold text-slate-400 uppercase tracking-wider">Name</label>
                  <input
                    type="text"
                    placeholder="Enter fee name"
                    value={feeForm.name}
                    onChange={(e) => setFeeForm({ ...feeForm, name: e.target.value })}
                    className="w-full px-3 md:px-4 2xl:px-5 py-2 md:py-3 2xl:py-4 bg-slate-50 border border-slate-200 rounded-lg md:rounded-xl 2xl:rounded-2xl text-sm md:text-base 2xl:text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs md:text-sm 2xl:text-base font-bold text-slate-400 uppercase tracking-wider">Amount Type</label>
                  <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-lg md:rounded-xl 2xl:rounded-2xl">
                    <button
                      onClick={() => setFeeForm({ ...feeForm, type: "Flat" })}
                      className={`py-1.5 md:py-2 2xl:py-3 rounded-lg text-xs md:text-sm 2xl:text-base font-bold transition-all ${feeForm.type === "Flat" ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                    >
                      Flat
                    </button>
                    <button
                      onClick={() => setFeeForm({ ...feeForm, type: "Percentage" })}
                      className={`py-1.5 md:py-2 2xl:py-3 rounded-lg text-xs md:text-sm 2xl:text-base font-bold transition-all ${feeForm.type === "Percentage" ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                    >
                      Percentage
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs md:text-sm 2xl:text-base font-bold text-slate-400 uppercase tracking-wider">Please enter amount</label>
                  <div className="relative">
                    <div className="absolute left-3 md:left-4 2xl:left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm md:text-base 2xl:text-lg">
                      {feeForm.type === "Flat" ? "$" : "%"}
                    </div>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      value={feeForm.amount}
                      onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                      className="w-full pl-8 md:pl-10 2xl:pl-12 pr-3 md:pr-4 2xl:pr-5 py-2 md:py-3 2xl:py-4 bg-slate-50 border border-slate-200 rounded-lg md:rounded-xl 2xl:rounded-2xl text-sm md:text-base 2xl:text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 md:p-4 2xl:p-6 bg-slate-50 rounded-lg md:rounded-xl 2xl:rounded-2xl border border-slate-100">
                  <span className="font-semibold text-slate-700 text-sm md:text-base 2xl:text-lg">Active</span>
                  <button
                    onClick={() => setFeeForm({ ...feeForm, status: !feeForm.status })}
                    className={`w-12 h-6 rounded-full transition-all relative ${feeForm.status ? 'bg-emerald-600' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${feeForm.status ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>
              <div className="p-4 md:p-6 2xl:p-8 bg-slate-50 flex gap-2 md:gap-3 2xl:gap-4">
                <button
                  onClick={handleSaveFee}
                  className="flex-1 bg-emerald-600 text-white py-2 md:py-3 2xl:py-4 rounded-lg md:rounded-xl 2xl:rounded-2xl font-bold text-sm md:text-base 2xl:text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowFeeModal(false)}
                  className="flex-1 bg-white border border-slate-200 text-slate-600 py-2 md:py-3 2xl:py-4 rounded-lg md:rounded-xl 2xl:rounded-2xl font-bold text-sm md:text-base 2xl:text-lg hover:bg-slate-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
