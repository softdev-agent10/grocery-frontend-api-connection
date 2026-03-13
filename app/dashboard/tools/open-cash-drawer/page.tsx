"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Inbox, AlertCircle, Clock } from "lucide-react";
import { ToolHeader } from "../components/ToolHeader";
import { EmptyState } from "../components/EmptyState";

export default function OpenCashDrawerPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [lastOpenTime, setLastOpenTime] = useState<Date | null>(null);

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
    setLastOpenTime(new Date());
    
    // Auto close after 5 seconds
    setTimeout(() => {
      setIsDrawerOpen(false);
    }, 5000);
  };

  return (
    <div className="space-y-6">
      <ToolHeader
        title="Open Cash Drawer"
        icon={<Inbox size={32} />}
        description="Control your cash drawer and track opening history"
      />

      {/* Main Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Drawer Status - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl border-2 border-green-200 p-8 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Drawer Status</h3>
              <motion.div
                animate={{
                  scale: isDrawerOpen ? [1, 1.1, 1] : 1,
                }}
                transition={{ duration: 0.5 }}
                className={`px-4 py-2 rounded-full font-bold text-sm ${
                  isDrawerOpen
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {isDrawerOpen ? "OPEN" : "CLOSED"}
              </motion.div>
            </div>

            {/* Visual Drawer Representation */}
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: isDrawerOpen ? 20 : 0 }}
              transition={{ duration: 0.4 }}
              className="relative h-40 mb-8"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-4 border-gray-300 flex items-center justify-center overflow-hidden">
                <motion.div
                  animate={{ y: isDrawerOpen ? 30 : 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center"
                >
                  <Inbox size={60} className="text-white" />
                </motion.div>
              </div>
            </motion.div>

            {/* Open Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenDrawer}
              disabled={isDrawerOpen}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-lg ${
                isDrawerOpen
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white hover:shadow-xl"
              }`}
            >
              {isDrawerOpen ? "Drawer is Open" : "Open Cash Drawer"}
            </motion.button>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl"
          >
            <div className="flex gap-3">
              <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-bold text-blue-900 mb-1">Instructions</p>
                <p className="text-sm text-blue-700">
                  Click the "Open Cash Drawer" button to open your physical cash drawer. The drawer
                  will automatically close after 5 seconds. Make sure your drawer is properly connected
                  before attempting to open it.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity - Right Column */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {lastOpenTime ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
              >
                <Clock size={16} className="text-green-600 mt-1" />
                <div>
                  <p className="font-medium text-sm text-green-900">Drawer Opened</p>
                  <p className="text-xs text-green-700 mt-1">
                    {lastOpenTime.toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                No recent activity
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Connection Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-3 h-3 bg-green-500 rounded-full"
          />
          <h3 className="font-bold text-green-900">Connection Status: Connected</h3>
        </div>
        <p className="text-sm text-green-700">
          Your cash drawer is properly connected and ready to use.
        </p>
      </motion.div>
    </div>
  );
}
