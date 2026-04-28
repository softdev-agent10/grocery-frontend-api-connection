// components/dashboard/products/EditTableViewModal.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { X, Check, RotateCcw } from 'lucide-react';

interface TableViewColumns {
    checkbox: boolean;
    name: boolean;
    upc: boolean;
    plu: boolean;
    category: boolean;
    brand: boolean;
    selling_price: boolean;
    quantity: boolean;
    in_stock: boolean;
}

interface EditTableViewModalProps {
    isOpen: boolean;
    tempColumns: TableViewColumns;
    tempItemsPerPage: number;
    onClose: () => void;
    onApply: () => void;
    onReset: () => void;
    onColumnToggle: (column: keyof TableViewColumns) => void;
    onItemsPerPageChange: (value: number) => void;
}

export function EditTableViewModal({
    isOpen,
    tempColumns,
    tempItemsPerPage,
    onClose,
    onApply,
    onReset,
    onColumnToggle,
    onItemsPerPageChange,
}: EditTableViewModalProps) {
    const columnLabels: Record<keyof TableViewColumns, string> = {
        checkbox: 'Checkbox',
        name: 'Product Name',
        upc: 'UPC',
        plu: 'PLU',
        category: 'Category',
        brand: 'Brand',
        selling_price: 'Pricing',
        quantity: 'QTY',
        in_stock: 'Status',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border"
                    >
                        <div className="p-6 border-b flex justify-between items-center bg-zinc-50">
                            <h2 className="font-bold text-lg">Edit Table View</h2>
                            <button onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-zinc-600 uppercase block">TABLE VIEW</label>
                                {(Object.keys(tempColumns) as Array<keyof TableViewColumns>).map((col) => (
                                    <label key={col} className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={tempColumns[col]}
                                            onChange={() => onColumnToggle(col)}
                                            className="w-5 h-5 rounded cursor-pointer accent-blue-600"
                                        />
                                        <span className="text-xl capitalize">{columnLabels[col]}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-zinc-600 uppercase block">ITEMS PER PAGE</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[5, 10, 15, 25, 50].map((num) => (
                                        <label key={num} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="itemsPerPage"
                                                value={num}
                                                checked={tempItemsPerPage === num}
                                                onChange={() => onItemsPerPageChange(num)}
                                                className="w-5 h-5 cursor-pointer accent-blue-600"
                                            />
                                            <span className="text-xl">{num}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t space-y-3 bg-zinc-50">
                            <button
                                onClick={onApply}
                                className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 shadow-md"
                            >
                                <Check size={18} /> Apply
                            </button>
                            <button
                                onClick={onReset}
                                className="w-full py-2.5 bg-zinc-100 text-zinc-700 font-semibold rounded-lg hover:bg-zinc-200 flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={18} /> Reset
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}