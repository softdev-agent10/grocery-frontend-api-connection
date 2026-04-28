import { motion } from "framer-motion";
import { useState } from "react";

interface AddCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    isSubmitting: boolean;
}

export function AddCustomerModal({ isOpen, onClose, onSubmit, isSubmitting }: AddCustomerModalProps) {
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "", status: "active" });

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
                <h2 className="text-2xl font-bold mb-6">Add Customer</h2>
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Customer Name *"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                    />
                    <input
                        type="email"
                        placeholder="Email Address *"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                    />
                    <input
                        type="tel"
                        placeholder="Phone Number *"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                    />
                    <input
                        type="text"
                        placeholder="Address (optional)"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                    />
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <div className="flex gap-3 mt-6">
                    <motion.button
                        whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                        whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                        onClick={async () => {
                            await onSubmit(formData);
                            setFormData({ name: "", email: "", phone: "", address: "", status: "active" });
                        }}
                        disabled={isSubmitting}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${isSubmitting
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-green-500 text-white hover:bg-green-600"
                            }`}
                    >
                        {isSubmitting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : "Save Customer"}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                        whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                        onClick={() => !isSubmitting && onClose()}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-all disabled:opacity-50"
                    >
                        Close
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}