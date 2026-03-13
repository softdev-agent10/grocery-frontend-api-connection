"use client";

import React from "react";
import { motion } from "framer-motion";
import { History } from "lucide-react";

interface HistoryButtonProps {
  onClick: () => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export const HistoryButton: React.FC<HistoryButtonProps> = ({
  onClick,
  disabled = false,
  size = "md",
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
      <History size={15} />
    </motion.button>
  );
};
