'use client';

import { motion } from 'framer-motion';
import { TabCard } from './TabCard';
import { CASH_DRAWER_TABS } from '@/lib/constants';

interface TabBarProps {
  currentTab: string;
  onTabChange: (tabId: string) => void;
}

/**
 * TabBar Component
 * 
 * Navigation bar with interactive tab cards.
 * Displays all transaction filter options:
 * - All Transactions
 * - Cash In
 * - Cash Out
 * - Open Drawer
 */
export function TabBar({ currentTab, onTabChange }: TabBarProps) {
  return (
    <div className="border-b border-gray-200 bg-white overflow-x-auto px-4 pt-4 md:px-6 md:pt-6 lg:px-8">
      <div className="flex gap-1 min-w-min md:gap-2 md:min-w-0">
        {CASH_DRAWER_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabCard
              key={tab.id}
              id={tab.id}
              label={tab.label}
              icon={<Icon size={18} className="shrink-0" />}
              isActive={currentTab === tab.id}        
              onClick={onTabChange}
              isMobile={true}
            />
          );
        })}
      </div>
    </div>
  );
}
