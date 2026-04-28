// components/LoadingOverlay.tsx
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function LoadingOverlay() {
    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="bg-white p-4 rounded-full shadow-xl"
            >
                <Loader2 size={48} className="text-blue-600" />
            </motion.div>
        </div>
    );
}