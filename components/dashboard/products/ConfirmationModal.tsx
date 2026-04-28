// components/dashboard/products/ConfirmationModal.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    product?: any;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmationModal({
    isOpen,
    title,
    message,
    product,
    onConfirm,
    onCancel,
}: ConfirmationModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20"
                    >
                        <div className="bg-red-50 p-8 border-b border-red-100">
                            <div className="flex items-center gap-4 text-red-500 mb-2">
                                <div className="bg-red-100 p-3 rounded-2xl">
                                    <AlertCircle size={32} />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight">{title}</h2>
                            </div>
                            <p className="text-slate-600 text-xl ml-16">{message}</p>
                        </div>
                        {product && (
                            <div className="p-8 space-y-4 bg-white border-b border-slate-100">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Product Name</p>
                                        <p className="text-base font-bold text-slate-900">{product.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Category</p>
                                        <p className="text-base font-bold text-slate-900">{product.category.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Price</p>
                                        <p className="text-base font-bold text-slate-900">{product.selling_price}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Quantity</p>
                                        <p className="text-base font-bold text-slate-900">{product.quantity}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Brand</p>
                                        <p className="text-base font-bold text-slate-900">{product.brand.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">PLU</p>
                                        <p className="text-base font-bold text-slate-900">{product.plu || '-'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">UPC</p>
                                    <p className="text-base font-mono text-slate-700">{product.upc}</p>
                                </div>
                            </div>
                        )}
                        <div className="p-6 bg-slate-50 flex gap-4">
                            <button
                                onClick={onCancel}
                                className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-2xl font-bold uppercase tracking-widest hover:bg-slate-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-100"
                            >
                                Delete
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}