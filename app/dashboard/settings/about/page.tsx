'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Info, Copy, Check, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface InfoItem {
  label: string;
  value: string;
  icon: React.ReactNode;
}

const mockAboutData = {
  accountId: 'ACC-2024-001892',
  branchId: 'BRANCH-DHAKA-05',
  deviceId: 'DEVICE-POS-2024-156',
  accountName: 'Deshi PayPOS - Main Store',
  branchName: 'Dhaka Central',
  deviceName: 'Terminal 5',
  createdDate: '2024-01-15',
  lastUpdated: '2026-03-11',
  appVersion: '1.0.0',
};

const InfoCard = ({ label, value, onCopy }: { label: string; value: string; onCopy: (val: string) => void }) => {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="mt-1 text-lg font-semibold text-gray-900 break-all">{value}</p>
      </div>
      <button
        onClick={() => onCopy(value)}
        className="shrink-0 rounded-lg p-2 hover:bg-gray-100 text-gray-600 transition-colors ml-4"
        title="Copy to clipboard"
      >
        <Copy className="h-5 w-5" />
      </button>
    </div>
  );
};

export default function AboutPage() {
  const router = useRouter();
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedValue(value);
    setTimeout(() => setCopiedValue(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex h-full w-full flex-col overflow-hidden bg-linear-to-br from-gray-50 to-white"
    >
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-4 md:px-6 md:py-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-lg p-2 hover:bg-gray-100 text-gray-600 transition-colors"
            title="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="rounded-lg bg-purple-100 p-2 md:p-3">
            <Info className="h-5 w-5 text-purple-600 md:h-6 md:w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 md:text-2xl">About</h1>
            <p className="text-xs text-gray-500 md:text-sm">Account & system information</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 py-4 md:px-6 md:py-6 lg:px-8">
        <div className="space-y-8 ">
          {/* Account Information Section */}
          <div>
            <h2 className="mb-4 text-lg font-bold text-gray-900">Account Information</h2>
            <div className="space-y-3">
              <InfoCard
                label="Account ID"
                value={mockAboutData.accountId}
                onCopy={handleCopy}
              />
              <InfoCard
                label="Account Name"
                value={mockAboutData.accountName}
                onCopy={handleCopy}
              />
              <InfoCard
                label="Created Date"
                value={mockAboutData.createdDate}
                onCopy={handleCopy}
              />
            </div>
          </div>

          {/* Branch Information Section */}
          <div>
            <h2 className="mb-4 text-lg font-bold text-gray-900">Branch Information</h2>
            <div className="space-y-3">
              <InfoCard
                label="Branch ID"
                value={mockAboutData.branchId}
                onCopy={handleCopy}
              />
              <InfoCard
                label="Branch Name"
                value={mockAboutData.branchName}
                onCopy={handleCopy}
              />
            </div>
          </div>

          {/* Device Information Section */}
          <div>
            <h2 className="mb-4 text-lg font-bold text-gray-900">Device Information</h2>
            <div className="space-y-3">
              <InfoCard
                label="Device ID"
                value={mockAboutData.deviceId}
                onCopy={handleCopy}
              />
              <InfoCard
                label="Device Name"
                value={mockAboutData.deviceName}
                onCopy={handleCopy}
              />
              <InfoCard
                label="Last Updated"
                value={mockAboutData.lastUpdated}
                onCopy={handleCopy}
              />
            </div>
          </div>

          {/* System Information Section */}
          <div>
            <h2 className="mb-4 text-lg font-bold text-gray-900">System Information</h2>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-600">App Version</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{mockAboutData.appVersion}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Environment</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">Production</p>
                </div>
              </div>
            </div>
          </div> 

          {/* Copy Confirmation Toast */}
          {copiedValue && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed bottom-6 right-6 flex items-center gap-2 rounded-lg bg-green-500 px-4 py-3 text-white shadow-lg"
            >
              <Check className="h-5 w-5" />
              <span>Copied to clipboard!</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
