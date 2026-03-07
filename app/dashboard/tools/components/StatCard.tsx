"use client";

import React from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: {
    value: number;
    direction: "up" | "down";
  };
  color?: "green" | "blue" | "purple" | "orange" | "yellow" | "red" | "pink" | "indigo";
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  change,
  color = "green",
}) => {
  const colorClasses = {
    green: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
    blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
    orange: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
    yellow: { bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-200" },
    red: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
    pink: { bg: "bg-pink-50", text: "text-pink-600", border: "border-pink-200" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200" },
  };

  const colors = colorClasses[color];
  const changeColor = change?.direction === "up" ? "text-green-600" : "text-red-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={`${colors.bg} border-2 ${colors.border} rounded-xl p-6 backdrop-blur-sm hover:shadow-lg transition-all duration-300`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium mb-2">{label}</p>
          <p className={`text-3xl md:text-4xl font-bold ${colors.text}`}>{value}</p>
          {change && (
            <p className={`text-sm font-medium mt-2 ${changeColor}`}>
              {change.direction === "up" ? "↑" : "↓"} {Math.abs(change.value)}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colors.bg} ${colors.text}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};
