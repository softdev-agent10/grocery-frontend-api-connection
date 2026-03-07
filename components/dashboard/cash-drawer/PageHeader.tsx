'use client';

import { motion } from 'framer-motion';
import { Wallet, Plus } from 'lucide-react';

interface PageHeaderProps {
  onOpenDrawer: () => void;
}

/**
 * PageHeader Component
 * 
 * Top section of the Cash Drawer page with:
 * - Title and description
 * - "Quick Open" action button
 * - Responsive design
 */
export function PageHeader({ onOpenDrawer }: PageHeaderProps) {
  return (
    <div className="border-b border-gray-200 bg-white px-4 py-4 md:px-6 md:py-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Title Section */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-100 p-2 md:p-3">
            <Wallet className="h-5 w-5 text-indigo-600 md:h-6 md:w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 md:text-2xl">
              Cash Drawer
            </h1>
            <p className="text-xs text-gray-500 md:text-sm">
              Manage cash transactions
            </p>
          </div>
        </div>

        {/* Quick Open Button */}
        <motion.button
          onClick={onOpenDrawer}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 font-medium text-sm text-white transition-all hover:shadow-lg md:px-6 md:py-2.5 md:text-base"
        >
          <Plus size={18} />
          <span className="hidden md:inline">Quick Open</span>
          <span className="md:hidden">Open</span>
        </motion.button>
      </div>
    </div>
  );
}
