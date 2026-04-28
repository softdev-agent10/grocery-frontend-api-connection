'use client';

import { useState, useEffect } from 'react';
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
import { useAuth } from '@/hooks/useAuth';
// import { getCashInHistory, getCashOutHistory, CashHistoryItem } from '@/app/services/tools/serive.tools';
import { useNotification } from '@/hooks/useNotification';
import { div } from 'framer-motion/client';
import { Notification } from '@/components/Notification';
import { CashHistoryItem, getCashIn, getCashOut } from '@/app/services/tools/service.cash';

// ============================================================================
// Helper function to map API response to Transaction format
// ============================================================================
const mapApiResponseToTransaction = (item: CashHistoryItem, type: 'in' | 'out'): Transaction => {
  const timestamp = new Date(item.timestamp);
  const date = timestamp.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
  const time = timestamp.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return {
    id: item.id.toString(),
    name: `Device ${item.device_id}`, // Placeholder, adjust based on actual API data
    role: 'Employee', // Placeholder, adjust based on actual API data
    date,
    time,
    amount: Math.abs(Math.floor(Number(item.amount))), // Convert string to absolute number
    type: type,
    note: item.note || `Cash ${type} transaction`,
    timestamp: new Date(item.timestamp), // Add timestamp for sorting
  };
};

/**
 * Cash Drawer Page
 *
 * Main Cash Drawer dashboard with:
 * - Interactive tabbed interface for filtering transactions
 * - Data table displaying detailed transaction history
 * - Real-time statistics footer
 * - Responsive design for all screen sizes (Volcora, Mobile, Nest Hub, Desktop)
 * - Fetches real data from API
 */
export default function CashDrawerPage() {
  const router = useRouter();
  const { notification, showNotification } = useNotification();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'all';
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, token, isLoading: authLoading } = useAuth();

  // Use the custom hook to handle filtering and statistics
  const { filteredTransactions, stats } = useCashDrawer(transactions, currentTab);

  // Fetch cash-in and cash-out history data
  useEffect(() => {
    const fetchCashData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch both cash-in and cash-out data in parallel
        const [cashInResponse, cashOutResponse] = await Promise.all([
          getCashIn(),
          getCashOut(), // Uncomment when getCashOut is implemented
        ]);

        // console.log('Cash In Response:', cashInResponse);
        // console.log('Cash Out Response:', cashOutResponse);

        // Map and merge both responses
        const cashInTransactions: Transaction[] = [];
        const cashOutTransactions: Transaction[] = [];

        if (cashInResponse.status === 'success' && cashInResponse.data?.items) {
          cashInTransactions.push(
            ...cashInResponse.data.items.map((item) =>
              mapApiResponseToTransaction(item, 'in')
            )
          );
        }

        if (cashOutResponse.status === 'success' && cashOutResponse.data?.items) {
          cashOutTransactions.push(
            ...cashOutResponse.data.items.map((item) =>
              mapApiResponseToTransaction(item, 'out')
            )
          );
        }

        // Merge and sort by timestamp (newest first)
        const allTransactions = [...cashInTransactions, ...cashOutTransactions].sort(
          (a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0)
        );

        setTransactions(allTransactions);
        showNotification('Cash history loaded successfully!', 'success');
      } catch (err) {
        showNotification('Failed to fetch cash history', 'error');
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCashData();
  }, []);

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
    <div>
      {notification && <Notification message={notification.message} type={notification.type} />}
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex h-full w-full flex-col overflow-hidden bgblue-500"
      >
        {/* Page Header with Quick Open Action */}
        <PageHeader onOpenDrawer={handleOpenDrawer} />

        {/* Success Notification */}
        {showSuccess && <SuccessNotification show={showSuccess} />}



        {/* Tab Navigation Bar */}
        <TabBar currentTab={currentTab} onTabChange={handleTabChange} />

        {/* Main Content Area - Responsive */}
        <div className="flex-1 overflow-auto px-4 py-4 md:px-6 md:py-6 lg:px-8 ">
          <DataTable transactions={filteredTransactions} isLoading={isLoading} />
        </div>

        {/* Footer Statistics */}
        <StatsFooter
          totalCashIn={stats.totalCashIn}
          totalCashOut={stats.totalCashOut}
          transactionCount={stats.transactionCount}
          netBalance={stats.netBalance}
        />
      </motion.div>
    </div>
  );
}



