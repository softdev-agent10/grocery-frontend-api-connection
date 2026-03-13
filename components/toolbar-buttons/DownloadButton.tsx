"use client";

import React from "react";
import { motion } from "framer-motion";
import { Download, ChevronDown } from "lucide-react";

interface DownloadButtonProps {
  onClick: () => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  showChevron?: boolean;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  onClick,
  disabled = false,
  size = "md",
  showChevron = true,
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
      <Download size={20} /> Download {showChevron && <ChevronDown size={16} />}
    </motion.button>
  );
};
