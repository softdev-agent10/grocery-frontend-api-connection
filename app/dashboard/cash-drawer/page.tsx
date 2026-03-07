'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  PageHeader,
  SuccessNotification,
  TabBar,
  DataTable,
  StatsFooter,
} from '@/components/dashboard/cash-drawer';
import { useCashDrawer, Transaction } from '@/hooks/useCashDrawer';

// ============================================================================
// SAMPLE DATA - Replace with API call in production
// ============================================================================

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    name: 'John Davis',
    role: 'Admin',
    date: 'Mar 06, 2026',
    time: '03:15 PM',
    amount: 5000,
    type: 'open',
    note: 'Opening drawer - Initial cash',
  },
  {
    id: '2',
    name: 'Sarah Miller',
    role: 'Manager',
    date: 'Mar 06, 2026',
    time: '03:20 PM',
    amount: 2500,
    type: 'in',
    note: 'Cash deposit from sales',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    role: 'Employee',
    date: 'Mar 06, 2026',
    time: '03:45 PM',
    amount: 750,
    type: 'out',
    note: 'Change shortage correction',
  },
  {
    id: '4',
    name: 'Emma Wilson',
    role: 'Manager',
    date: 'Mar 06, 2026',
    time: '04:10 PM',
    amount: 1200,
    type: 'in',
    note: 'Mid-shift deposit',
  },
  {
    id: '5',
    name: 'Alex Brown',
    role: 'Customer',
    date: 'Mar 06, 2026',
    time: '04:30 PM',
    amount: 500,
    type: 'out',
    note: 'Customer refund',
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    role: 'Employee',
    date: 'Mar 06, 2026',
    time: '05:00 PM',
    amount: 3200,
    type: 'in',
    note: 'Afternoon sales deposit',
  },
  {
    id: '7',
    name: 'David Lee',
    role: 'Admin',
    date: 'Mar 06, 2026',
    time: '05:30 PM',
    amount: 400,
    type: 'out',
    note: 'Supply purchase',
  },
  {
    id: '8',
    name: 'Jennifer White',
    role: 'Manager',
    date: 'Mar 06, 2026',
    time: '06:00 PM',
    amount: 1800,
    type: 'in',
    note: 'Evening deposit',
  },
];

/**
 * Cash Drawer Page
 *
 * Main Cash Drawer dashboard with:
 * - Interactive tabbed interface for filtering transactions
 * - Data table displaying detailed transaction history
 * - Real-time statistics footer
 * - Responsive design for all screen sizes (Volcora, Mobile, Nest Hub, Desktop)
 */
export default function CashDrawerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'all';
  const [showSuccess, setShowSuccess] = useState(false);

  // Use the custom hook to handle filtering and statistics
  const { filteredTransactions, stats } = useCashDrawer(MOCK_TRANSACTIONS, currentTab);

  /**
   * Handle drawer opening action
   * Shows success notification and resets after 3 seconds
   */
  const handleOpenDrawer = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  /**
   * Handle tab change
   * Updates URL with selected tab
   */
  const handleTabChange = (tabId: string) => {
    router.push(`?tab=${tabId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex h-full w-full flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-white"
    >
      {/* Page Header with Quick Open Action */}
      <PageHeader onOpenDrawer={handleOpenDrawer} />

      {/* Success Notification */}
      {showSuccess && <SuccessNotification show={showSuccess} />}

      {/* Tab Navigation Bar */}
      <TabBar currentTab={currentTab} onTabChange={handleTabChange} />

      {/* Main Content Area - Responsive */}
      <div className="flex-1 overflow-auto px-4 py-4 md:px-6 md:py-6 lg:px-8">
        <DataTable transactions={filteredTransactions} />
      </div>

      {/* Footer Statistics */}
      <StatsFooter
        totalCashIn={stats.totalCashIn}
        totalCashOut={stats.totalCashOut}
        transactionCount={stats.transactionCount}
        netBalance={stats.netBalance}
      />
    </motion.div>
  );
}
