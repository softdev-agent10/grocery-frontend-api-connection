"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, FileText } from "lucide-react";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (scope: 'current' | 'all', format: 'pdf' | 'csv') => void;
  title?: string;
  subtitle?: string;
}

/**
 * Reusable Download Modal Component
 * Provides consistent download interface across inventory and tools sections
 */
export default function DownloadModal({
  isOpen,
  onClose,
  onDownload,
  title = "Export Data",
  subtitle = "Choose your preferred format"
}: DownloadModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
          >
            {/* Header */}
            <div className="bg-indigo-600 p-8 flex justify-between items-center text-white">
              <div>
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                  <Download size={28} /> {title}
                </h2>
                <p className="text-indigo-100 text-sm font-medium mt-1">{subtitle}</p>
              </div>
              <button
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              {/* Current Page Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                  Current Page
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* PDF Button */}
                  <button
                    onClick={() => {
                      onDownload('current', 'pdf');
                      onClose();
                    }}
                    className="flex flex-col items-center justify-center gap-3 bg-rose-50 text-rose-600 border border-rose-100 p-6 rounded-3xl font-black hover:bg-rose-100 transition-all group active:scale-95"
                  >
                    <div className="bg-rose-500 text-white p-3 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <FileText size={24} />
                    </div>
                    PDF
                  </button>

                  {/* CSV Button */}
                  <button
                    onClick={() => {
                      onDownload('current', 'csv');
                      onClose();
                    }}
                    className="flex flex-col items-center justify-center gap-3 bg-emerald-50 text-emerald-600 border border-emerald-100 p-6 rounded-3xl font-black hover:bg-emerald-100 transition-all group active:scale-95"
                  >
                    <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <FileText size={24} />
                    </div>
                    CSV
                  </button>
                </div>
              </div>

              {/* All Pages Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                  All Pages
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* PDF Button */}
                  <button
                    onClick={() => {
                      onDownload('all', 'pdf');
                      onClose();
                    }}
                    className="flex flex-col items-center justify-center gap-3 bg-rose-50 text-rose-600 border border-rose-100 p-6 rounded-3xl font-black hover:bg-rose-100 transition-all group active:scale-95"
                  >
                    <div className="bg-rose-500 text-white p-3 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <FileText size={24} />
                    </div>
                    PDF
                  </button>

                  {/* CSV Button */}
                  <button
                    onClick={() => {
                      onDownload('all', 'csv');
                      onClose();
                    }}
                    className="flex flex-col items-center justify-center gap-3 bg-emerald-50 text-emerald-600 border border-emerald-100 p-6 rounded-3xl font-black hover:bg-emerald-100 transition-all group active:scale-95"
                  >
                    <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <FileText size={24} />
                    </div>
                    CSV
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
