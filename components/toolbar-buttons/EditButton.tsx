"use client";

import React from "react";
import { motion } from "framer-motion";
import { SquarePen } from "lucide-react";

interface EditButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: "icon" | "text"; // icon: শুধু আইকন, text: আইকন + টেক্সট
  size?: "sm" | "md" | "lg";
}

export const EditButton: React.FC<EditButtonProps> = ({
  onClick,
  disabled = false,
  variant = "text",
  size = "md",
}) => {
  if (variant === "icon") {
    // Icon তে এডিট বাটন - View Product স্টাইল
    return (
      <motion.button
        whileHover={{ scale: 1.2, rotate: -5 }}
        onClick={onClick}
        disabled={disabled}
        className="text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <SquarePen size={20} />
      </motion.button>
    );
  }

  // Text + Icon সহ এডিট বাটন - Toolbar স্টাইল
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
      <SquarePen size={20} /> Edit
    </motion.button>
  );
};
