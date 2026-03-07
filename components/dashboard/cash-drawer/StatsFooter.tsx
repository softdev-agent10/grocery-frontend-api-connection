'use client';

import { StatsCard } from './StatsCard';

interface StatsFooterProps {
  totalCashIn: number;
  totalCashOut: number;
  transactionCount: number;
  netBalance: number;
}

/**
 * StatsFooter Component
 * 
 * Bottom footer showing key statistics:
 * - Total Cash In (Green)
 * - Total Cash Out (Red)
 * - Transaction Count (Blue)
 * - Net Balance (Purple)
 * 
 * Responsive grid: 2 columns on mobile, 4 columns on desktop
 */
export function StatsFooter({
  totalCashIn,
  totalCashOut,
  transactionCount,
  netBalance,
}: StatsFooterProps) {
  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3 md:px-6 md:py-4 lg:px-8">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatsCard
          label="Cash In"
          value={`$ ${totalCashIn.toLocaleString()}`}
          bgColor="bg-green-50"
          textColor="text-green-700"
          index={0}
        />
        <StatsCard
          label="Cash Out"
          value={`$ ${totalCashOut.toLocaleString()}`}
          bgColor="bg-red-50"
          textColor="text-red-700"
          index={1}
        />
        <StatsCard
          label="Transactions"
          value={transactionCount.toString()}
          bgColor="bg-blue-50"
          textColor="text-blue-700"
          index={2}
        />
        <StatsCard
          label="Net Balance"
          value={`$${netBalance.toLocaleString()}`}
          bgColor="bg-purple-50"
          textColor="text-purple-700"
          index={3}
        />
      </div>
    </div>
  );
}
