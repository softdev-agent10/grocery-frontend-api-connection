"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: "icon" | "text"; // icon: শুধু আইকন, text: আইকন + টেক্সট
  size?: "sm" | "md" | "lg";
  count?: number; // Bulk delete এর জন্য count দেখানো
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({
  onClick,
  disabled = false,
  variant = "text",
  size = "md",
  count = 0,
}) => {
  if (variant === "icon") {
    // Icon তে ডিলিট বাটন - View Product স্টাইল
    return (
      <motion.button
        whileHover={{ scale: 1.2, rotate: 10 }}
        onClick={onClick}
        disabled={disabled}
        className="text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Trash2 size={20} />
      </motion.button>
    );
  }

  // Text + Icon সহ ডিলিট বাটন - Toolbar স্টাইল (Red)
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
      className={`flex items-center gap-2 rounded-xl font-bold transition-all shadow-md ${
        !disabled
          ? "bg-red-500 hover:bg-red-600 text-white shadow-red-100"
          : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
      } ${sizeClasses[size]}`}
    >
      <Trash2 size={20} /> Delete {count > 0 && `(${count})`}
    </motion.button>
  );
};
