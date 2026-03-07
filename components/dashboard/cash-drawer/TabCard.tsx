'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface TabCardProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: (tabId: string) => void;
  isMobile?: boolean;
}

/**
 * TabCard Component
 * 
 * Interactive card-style tab with:
 * - Smooth Framer Motion animations
 * - Hover and active states
 * - Responsive sizing
 * - Accessibility features
 * 
 * Used for Cash Drawer tab navigation system.
 */
export function TabCard({
  id,
  label,
  icon,
  isActive,
  onClick,
  isMobile = false,
}: TabCardProps) {
  return (
    <motion.button
      onClick={() => onClick(id)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        flex items-center gap-2 rounded-lg px-3 py-2.5 font-medium text-sm transition-all
        focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
        md:px-4 md:py-3 md:text-base min-h-11
        ${
          isActive
            ? 'bg-indigo-50 text-indigo-600 shadow-md'
            : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
        }
        ${isMobile ? 'whitespace-nowrap' : ''}
      `}
      aria-pressed={isActive}
      aria-label={`${label} tab`}
    >
      <span className="flex-shrink-0">{icon}</span>
      {!isMobile && <span className="hidden md:inline">{label}</span>}
      {isMobile && <span>{label}</span>}
    </motion.button>
  );
}
