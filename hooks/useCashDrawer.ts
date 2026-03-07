'use client';

import { useMemo } from 'react';
import { TransactionType } from '@/lib/constants';

/**
 * Transaction interface - represents a cash drawer transaction
 */
export interface Transaction {
  id: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Employee' | 'Customer';
  date: string;
  time: string;
  amount: number;
  type: TransactionType;
  note: string;
}

/**
 * useCashDrawer Hook
 * 
 * Handles filtering, aggregation, and state management for cash drawer transactions.
 * Separates data logic from UI components following Clean Architecture principles.
 * 
 * @param transactions - Array of all transactions to filter
 * @param activeTab - Current active tab filter ('all' | 'in' | 'out' | 'open')
 * @returns Object containing filtered transactions and calculated statistics
 */
export function useCashDrawer(transactions: Transaction[], activeTab: string) {
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (activeTab === 'all') return true;
      if (activeTab === 'in') return transaction.type === 'in';
      if (activeTab === 'out') return transaction.type === 'out';
      if (activeTab === 'open') return transaction.type === 'open';
      return true;
    });
  }, [transactions, activeTab]);

  /**
   * Calculate total cash in
   */
  const totalCashIn = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'in')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  /**
   * Calculate total cash out
   */
  const totalCashOut = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'out')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  /**
   * Calculate net balance (in - out)
   */
  const netBalance = useMemo(() => {
    return totalCashIn - totalCashOut;
  }, [totalCashIn, totalCashOut]);

  /**
   * Get transaction count
   */
  const transactionCount = useMemo(() => {
    return filteredTransactions.length;
  }, [filteredTransactions]);

  return {
    filteredTransactions,
    stats: {
      totalCashIn,
      totalCashOut,
      netBalance,
      transactionCount,
    },
  };
}
