"use client";

import React from "react";
import { motion ,Variants} from "framer-motion";
import { Download, Filter, Edit2, Search } from "lucide-react";

interface ToolHeaderProps {
  title: string;
  icon: React.ReactNode;
  description?: string;
  onDownload?: () => void;
  onFilter?: () => void;
  onEdit?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export const ToolHeader: React.FC<ToolHeaderProps> = ({
  title,
  icon,
  description,
  onDownload,
  onFilter,
  onEdit,
  searchValue = "",
  onSearchChange,
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const buttonVariants: Variants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.95,
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header Section */}
      <div className="bg-blue-600 rounded-2xl p-8 shadow-lg">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white">
            {icon}
          </div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-white"
          >
            {title}
          </motion.h1>
        </div>
        {description && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/90 text-sm md:text-base"
          >
            {description}
          </motion.p>
        )}
      </div>

      {/* Controls Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col md:flex-row gap-4 items-center"
      >
        {/* Search Bar */}
        {onSearchChange && (
          <div className="w-full md:flex-1 relative group">
            <input
              type="text"
              placeholder="Search records..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-300 group-hover:border-gray-300 text-sm md:text-base"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-600 transition-colors" size={18} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 w-full md:w-auto">
          {onFilter && (
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={onFilter}
              className="flex items-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg min-w-max"
            >
              <Filter size={18} />
              <span className="hidden sm:inline">Filter</span>
            </motion.button>
          )}

          {onEdit && (
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg min-w-max"
            >
              <Edit2 size={18} />
              <span className="hidden sm:inline">Edit</span>
            </motion.button>
          )}

          {onDownload && (
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={onDownload}
              className="flex items-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg min-w-max"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Download</span>
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
