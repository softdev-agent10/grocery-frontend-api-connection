import { motion } from "framer-motion";
import { X, CheckCircle2, Filter } from "lucide-react";

interface FilterModalProps {
    sortBy: string;
    onSortChange: (value: string) => void;
    onClose: () => void;
}

export function FilterModal({ sortBy, onSortChange, onClose }: FilterModalProps) {
    const options = ["Name (A-Z)", "Name (Z-A)", "Date (Oldest First)", "Date (Newest First)"];

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
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            >
                <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
                    <h2 className="text-xl font-black flex items-center gap-2 uppercase tracking-tight">
                        <Filter size={24} /> Sort Options
                    </h2>
                    <button onClick={onClose} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-8 space-y-6">
                    <div className="space-y-3">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Order By</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {options.map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => onSortChange(opt)}
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
                        onClick={onClose}
                        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all mt-4 active:scale-95"
                    >
                        Apply Changes
                    </button>
                </div>
            </motion.div>
        </div>
    );
}