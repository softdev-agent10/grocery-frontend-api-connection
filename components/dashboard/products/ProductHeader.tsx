// components/dashboard/products/ProductHeader.tsx
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

export function ProductHeader() {
    return (
        <header className="bg-blue-600 rounded-2xl px-6 py-8 flex justify-between items-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[120%] bg-white rotate-12 blur-3xl rounded-full" />
            </div>
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="relative z-10"
            >
                <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">products</h1>
            </motion.div>
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-white relative z-10"
            >
                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/30 shadow-xl">
                    <Package size={40} strokeWidth={2} />
                </div>
            </motion.div>
        </header>
    );
}