"use client";

import React from "react";
import { motion } from "framer-motion";
import { Download, ChevronDown } from "lucide-react";

interface DownloadTemplateButtonProps {
    onClick: () => void;
    disabled?: boolean;
    size?: "sm" | "md" | "lg";
    showChevron?: boolean;
    label: string;
    icon?: React.ReactNode; // Optional icon prop for flexibility
}

export const DownloadTemplateButton: React.FC<DownloadTemplateButtonProps> = ({
    onClick,
    disabled = false,
    size = "md",
    showChevron = true,
    label,
    icon
}) => {
    const sizeClasses = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg"
    };

    return (
        <motion.button
            whileHover={!disabled ? { scale: 1.05, y: -2 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center gap-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold transition-all shadow-sm hover:border-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]}`}
        >
            {icon && <span className="flex items-center justify-center">{icon}</span>} {label} {showChevron && <ChevronDown size={16} />}
        </motion.button>
    );
};
