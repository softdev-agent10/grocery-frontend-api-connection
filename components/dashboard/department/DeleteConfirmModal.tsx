import { motion } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onClose: () => void;
}

export function DeleteConfirmModal({ title, message, onConfirm, onClose }: DeleteConfirmModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            >
                <div className="bg-red-600 p-4 flex justify-between items-center text-white">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="hover:bg-red-700 p-1 rounded-full">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
                        <p className="text-sm text-red-800 font-medium">{message}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}