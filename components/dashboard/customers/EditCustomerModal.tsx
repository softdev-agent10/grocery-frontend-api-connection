import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: "active" | "inactive";
}

interface EditCustomerModalProps {
    isOpen: boolean;
    customer: Customer | null;
    onClose: () => void;
    onSave: (id: string, data: Partial<Customer>) => Promise<void>;
}

export function EditCustomerModal({ isOpen, customer, onClose, onSave }: EditCustomerModalProps) {
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", status: "active" as "active" | "inactive" });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (customer) {
            setFormData({ name: customer.name, email: customer.email, phone: customer.phone, status: customer.status });
        }
    }, [customer]);

    if (!isOpen || !customer) return null;

    const handleSubmit = async () => {
        if (!formData.name || !formData.email || !formData.phone) return;
        setIsSaving(true);
        try {
            await onSave(customer.id, formData);
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

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
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white">Edit Customer: {customer.name}</h2>
                        <button onClick={onClose} className="hover:bg-blue-700 p-2 rounded-full transition-colors">
                            <X size={28} className="text-white" />
                        </button>
                    </div>
                </div>
                <div className="p-8 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Customer Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex gap-4 justify-end">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className="px-8 py-3 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300 transition-all"
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className={`px-8 py-3 bg-green-600 text-white rounded-lg font-bold transition-all flex items-center gap-2 ${isSaving ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"}`}
                    >
                        {isSaving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : "Save Changes"}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}