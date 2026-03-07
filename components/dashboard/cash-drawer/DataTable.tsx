'use client';

import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Transaction } from '@/hooks/useCashDrawer';
import { ROLE_BADGE_STYLES, AMOUNT_STYLES } from '@/lib/constants';

interface DataTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  className?: string;
}

/**
 * DataTable Component
 * 
 * Reusable data table for displaying transactions with:
 * - Desktop table view with all columns
 * - Mobile card view for small screens
 * - Smooth animations and hover states
 * - Accessibility features (keyboard navigation)
 */
export function DataTable({ transactions, isLoading = false, className = '' }: DataTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
        <AlertCircle size={40} className="text-gray-300" />
        <div>
          <h3 className="font-semibold text-gray-700 mb-1">No transactions</h3>
          <p className="text-sm text-gray-500">No transaction records found.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View (Hidden on Volcora: 220px width) */}
      <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 lg:px-6">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 lg:px-6">
                Role
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 lg:px-6">
                Date & Time
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 lg:px-6">
                Amount
              </th>
              <th className="hidden px-4 py-3 text-left text-sm font-semibold text-gray-900 lg:table-cell lg:px-6">
                Note
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, idx) => (
              <motion.tr
                key={transaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border-b border-gray-100 transition-colors hover:bg-gray-50"
              >
                <td className="px-4 py-4 text-sm font-medium text-gray-900 lg:px-6">
                  {transaction.name}
                </td>
                <td className="px-4 py-4 lg:px-6">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${ROLE_BADGE_STYLES[transaction.role]}`}
                  >
                    {transaction.role.slice(0, 2).toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600 lg:px-6">
                  <div>{transaction.date}</div>
                  <div className="text-xs text-gray-500">{transaction.time}</div>
                </td>
                <td
                  className={`px-4 py-4 text-right text-sm font-semibold lg:px-6 ${AMOUNT_STYLES[transaction.type]}`}
                >
                  {transaction.type === 'out' ? '-' : '+'} PKR{' '}
                  {transaction.amount.toLocaleString()}
                </td>
                <td className="hidden px-4 py-4 text-sm text-gray-600 lg:table-cell lg:px-6 lg:max-w-xs lg:truncate">
                  {transaction.note}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (Visible on Volcora and small screens) */}
      <div className="space-y-3 sm:hidden">
        {transactions.map((transaction, idx) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
          >
            {/* Header: Name and Role Badge */}
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-gray-900">
                  {transaction.name}
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  {transaction.date} • {transaction.time}
                </p>
              </div>
              <span
                className={`inline-flex shrink-0 items-center rounded border px-2 py-0.5 text-xs font-semibold ${ROLE_BADGE_STYLES[transaction.role]}`}
              >
                {transaction.role.slice(0, 2).toUpperCase()}
              </span>
            </div>

            {/* Amount */}
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-gray-600">Amount:</span>
              <span
                className={`text-sm font-bold ${AMOUNT_STYLES[transaction.type]}`}
              >
                {transaction.type === 'out' ? '-' : '+'} PKR{' '}
                {transaction.amount.toLocaleString()}
              </span>
            </div>

            {/* Note */}
            <p className="line-clamp-2 text-xs text-gray-600">
              <span className="text-gray-500">Note: </span>
              {transaction.note}
            </p>
          </motion.div>
        ))}
      </div>
    </>
  );
}
