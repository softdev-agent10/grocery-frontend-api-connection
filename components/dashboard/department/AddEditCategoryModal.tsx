"use client";
import { motion } from "framer-motion";
import { X, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";

interface AddEditCategoryModalProps {
    isOpen: boolean;
    mode: "add" | "edit";
    initialData?: any;
    taxes: any[];
    fees: any[];
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
}

export function AddEditCategoryModal({
    isOpen,
    mode,
    initialData,
    taxes,
    fees,
    onClose,
    onSave,
}: AddEditCategoryModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        tax_id: 0,
        fee_id: 0,
        is_active: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description || "",
                tax_id: initialData.tax_id || 0,
                fee_id: initialData.fee_id || 0,
                is_active: initialData.is_active ?? true,
            });
        } else {
            setFormData({ name: "", description: "", tax_id: 0, fee_id: 0, is_active: true });
        }
    }, [initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave(formData);
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200"
            >
                <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">
                            {mode === "edit" ? "Edit Department" : "New Department"}
                        </h2>
                        <p className="text-indigo-100 text-sm font-medium">Fill in the details below</p>
                    </div>
                    <button onClick={onClose} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tax</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                                value={formData.tax_id}
                                onChange={(e) => setFormData({ ...formData, tax_id: Number(e.target.value) })}
                            >
                                <option value={0}>Select a tax</option>
                                {taxes.map((tax) => (
                                    <option key={tax.id} value={tax.id}>
                                        {tax.name} ({tax.rate}%)
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Fee</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                                value={formData.fee_id}
                                onChange={(e) => setFormData({ ...formData, fee_id: Number(e.target.value) })}
                            >
                                <option value={0}>Select a fee</option>
                                {fees.map((fee) => (
                                    <option key={fee.id} value={fee.id}>
                                        {fee.name} ({fee.amount}{fee.is_percentage ? "%" : ""})
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
                            disabled={isSubmitting}
                            className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95 disabled:opacity-50"
                        >
                            {mode === "edit" ? "Update Department" : "Create Department"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}