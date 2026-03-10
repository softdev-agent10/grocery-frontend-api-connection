"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Plus, SquarePen, Trash2, X } from "lucide-react";

export interface HistoryItem {
  id: string;
  action: "Add" | "Edit" | "Delete";
  details: string;
  timestamp: string;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  title?: string;
  subtitle?: string;
}

/**
 * Reusable History Modal Component
 * Displays activity log with consistent design across inventory and tools sections
 * Opens from the right side with slide animation
 */
export default function HistoryModal({
  isOpen,
  onClose,
  history,
  title = "Activity Log",
  subtitle = "Recent actions"
}: HistoryModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end p-4">
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
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="relative bg-white h-full w-full max-w-md shadow-2xl overflow-hidden flex flex-col rounded-l-[3rem]"
          >
            {/* Header */}
            <div className="bg-slate-900 p-10 flex justify-between items-center text-white">
              <div>
                <h2 className="text-3xl font-black tracking-tight">{title}</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                  {subtitle}
                </p>
              </div>
              <button
                onClick={onClose}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-10 space-y-8">
              {history.length > 0 ? (
                history.map((item) => (
                  <div key={item.id} className="flex gap-4 relative">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                          item.action === "Add"
                            ? "bg-emerald-100 text-emerald-600"
                            : item.action === "Edit"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-red-100 text-red-600"
                        }`}
                      >
                        {item.action === "Add" ? (
                          <Plus size={20} />
                        ) : item.action === "Edit" ? (
                          <SquarePen size={20} />
                        ) : (
                          <Trash2 size={20} />
                        )}
                      </div>
                      <div className="w-0.5 h-full bg-slate-100 mt-2" />
                    </div>

                    {/* Content */}
                    <div className="pb-8">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-slate-800">
                          {item.action}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Clock size={10} /> {item.timestamp}
                        </span>
                      </div>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">
                        {item.details}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-4">
                  <Clock size={64} strokeWidth={1} />
                  <p className="font-bold italic">No activity recorded yet.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
