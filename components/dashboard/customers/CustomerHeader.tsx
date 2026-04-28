import { motion } from "framer-motion";
import { Users } from "lucide-react";

export function CustomerHeader() {
    return (
        <div className="bg-blue-600 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white">
                    <Users size={32} />
                </div>
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-3xl md:text-4xl font-bold text-white"
                >
                    Customer Accounts
                </motion.h1>
            </div>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-white/90 text-sm md:text-base"
            >
                Manage and track customer accounts and their purchase history
            </motion.p>
        </div>
    );
}