"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface AddButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export const AddButton: React.FC<AddButtonProps> = ({
  onClick,
  disabled = false,
  label = "Add",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-7 py-4 text-lg"
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-200 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group ${sizeClasses[size]}`}
    >
      <Plus size={20} className="group-hover:rotate-90 transition-transform" /> {label}
    </motion.button>
  );
};
