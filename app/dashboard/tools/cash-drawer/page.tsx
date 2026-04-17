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
import { getCashInHistory, getCashOutHistory, CashHistoryItem } from '@/app/services/tools/serive.tools';

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
      // if (authLoading || !user || !token) {
      //   return;
      // }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch both cash-in and cash-out data in parallel
        const [cashInResponse, cashOutResponse] = await Promise.all([
          getCashInHistory({
            branchId: "1234567890",
            token: "your_token_here",
            page: 1,
            perPage: 50, // Increased to get more records for merged list
            sortBy: 'date',
            order: 'desc',
          }),
          getCashOutHistory({
            branchId: "1234567890",
            token: "your_token_here",
            page: 1,
            perPage: 50,
            sortBy: 'date',
            order: 'desc',
          }),
        ]);

        console.log('Cash In Response:', cashInResponse);
        console.log('Cash Out Response:', cashOutResponse);

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
      } catch (err) {
        console.error('Failed to fetch cash history:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCashData();
  }, [user, token, authLoading]);

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

      {/* Error Notification */}
      {error && (
        <div className="mx-4 rounded-lg bg-red-50 border border-red-200 p-4 mt-4">
          <p className="text-sm text-red-600">Error: {error}</p>
        </div>
      )}

      {/* Tab Navigation Bar */}
      <TabBar currentTab={currentTab} onTabChange={handleTabChange} />

      {/* Main Content Area - Responsive */}
      <div className="flex-1 overflow-auto px-4 py-4 md:px-6 md:py-6 lg:px-8">
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
  );
}
