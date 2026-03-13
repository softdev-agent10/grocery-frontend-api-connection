'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface SuccessNotificationProps {
  show: boolean;
}

/**
 * SuccessNotification Component
 * 
 * Animated success notification shown when drawer is opened.
 * Auto-dismisses after 3 seconds.
 */
export function SuccessNotification({ show }: SuccessNotificationProps) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mx-4 mt-4 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3 md:mx-6 md:p-4 lg:mx-8"
    >
      <Check size={20} className="shrink-0 text-green-600" />
      <span className="text-sm font-medium text-green-700 md:text-base">
        Drawer opened successfully
      </span>
    </motion.div>
  );
}
