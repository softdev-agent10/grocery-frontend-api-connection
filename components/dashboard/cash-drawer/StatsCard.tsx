'use client';

import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string;
  bgColor: string;
  textColor: string;
  index: number;
}

/**
 * StatsCard Component
 * 
 * Displays transaction statistics in the footer area.
 * Shows:
 * - Cash In (Green)
 * - Cash Out (Red)
 * - Transaction Count (Blue)
 * - Net Balance (Purple)
 */
export function StatsCard({
  label,
  value,
  bgColor,
  textColor,
  index,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`rounded-lg p-2 md:p-3 ${bgColor}`}
    >
      <p className={`text-xs font-medium ${textColor}`}>{label}</p>
      <p className={`mt-1 text-sm font-bold md:text-base ${textColor}`}>
        {value}
      </p>
    </motion.div>
  );
}
