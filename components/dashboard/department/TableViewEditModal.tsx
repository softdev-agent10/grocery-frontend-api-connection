import { motion } from "framer-motion";
import { X, Check, RotateCcw } from "lucide-react";

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

interface TableViewEditModalProps {
    tempColumns: TableViewColumns;
    tempItemsPerPage: number;
    onClose: () => void;
    onApply: () => void;
    onReset: () => void;
    onColumnToggle: (col: keyof TableViewColumns) => void;
    onItemsPerPageChange: (value: number) => void;
}

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

export function TableViewEditModal({
    tempColumns,
    tempItemsPerPage,
    onClose,
    onApply,
    onReset,
    onColumnToggle,
    onItemsPerPageChange,
}: TableViewEditModalProps) {
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
                className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            >
                <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
                    <h2 className="text-xl font-black uppercase tracking-tight">Edit Table View</h2>
                    <button onClick={onClose} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-8 space-y-6 max-h-96 overflow-y-auto">
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-600 uppercase block">TABLE VIEW</label>
                        {(Object.keys(tempColumns) as Array<keyof TableViewColumns>).map((col) => (
                            <label key={col} className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={tempColumns[col]}
                                    onChange={() => onColumnToggle(col)}
                                    className="w-5 h-5 rounded cursor-pointer accent-indigo-600"
                                />
                                <span className="text-sm capitalize">{columnLabels[col]}</span>
                            </label>
                        ))}
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-600 uppercase block">ITEMS PER PAGE</label>
                        <div className="grid grid-cols-2 gap-3">
                            {[5, 10, 15, 25, 50].map((num) => (
                                <label key={num} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="itemsPerPage"
                                        value={num}
                                        checked={tempItemsPerPage === num}
                                        onChange={() => onItemsPerPageChange(num)}
                                        className="w-5 h-5 cursor-pointer accent-indigo-600"
                                    />
                                    <span className="text-sm">{num}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t space-y-3 bg-slate-50">
                    <button
                        onClick={onApply}
                        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                        <Check size={20} /> Apply
                    </button>
                    <button
                        onClick={onReset}
                        className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 flex items-center justify-center gap-2 transition-all"
                    >
                        <RotateCcw size={20} /> Reset
                    </button>
                </div>
            </motion.div>
        </div>
    );
}