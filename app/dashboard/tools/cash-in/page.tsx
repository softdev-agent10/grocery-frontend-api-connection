"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownCircle, Plus, Eye, Trash2, DollarSign, CheckCircle2, Clock } from "lucide-react";
import { ToolHeader } from "../components/ToolHeader";
import { DataTable } from "../components/DataTable";
import { StatCard } from "../components/StatCard";
import { EmptyState } from "../components/EmptyState";
import DownloadModal from "@/components/download-modal";

interface CashInRecord {
  id: string;
  date: string;
  user: string;
  amount: string;
  reason: string;
  status: "completed" | "pending" | "failed";
}

const mockData: CashInRecord[] = [
  {
    id: "1",
    date: "2026-03-06 10:30 AM",
    user: "John Doe",
    amount: "$500.00",
    reason: "Daily Deposit",
    status: "completed",
  },
  {
    id: "2",
    date: "2026-03-06 09:15 AM",
    user: "Jane Smith",
    amount: "$1,200.00",
    reason: "Bank Transfer",
    status: "completed",
  },
  {
    id: "3",
    date: "2026-03-05 04:45 PM",
    user: "Mike Johnson",
    amount: "$850.00",
    reason: "Customer Payment",
    status: "pending",
  },
];

export default function CashInPage() {
  const [searchValue, setSearchValue] = useState("");
  const [records, setRecords] = useState<CashInRecord[]>(mockData);
  const [showModal, setShowModal] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const handleDownload = (scope: 'current' | 'all', format: 'pdf' | 'csv') => {
    // Simulate file generation
    const dataToExport = scope === 'current' ? records.slice(0, 5) : records;
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cash-in_${scope}_${new Date().getTime()}.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    setIsDownloadModalOpen(false);
  };

  const filteredRecords = records.filter(
    (record) =>
      record.user.toLowerCase().includes(searchValue.toLowerCase()) ||
      record.reason.toLowerCase().includes(searchValue.toLowerCase())
  );

  const totalAmount = records.reduce((sum, r) => {
    const amount = parseFloat(r.amount.replace(/[$,]/g, ""));
    return sum + amount;
  }, 0);

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold ${
          colors[status as keyof typeof colors]
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const columns = [
    { key: "date", label: "Date & Time" },
    { key: "user", label: "User" },
    { key: "amount", label: "Amount" },
    { key: "reason", label: "Reason" },
    {
      key: "status",
      label: "Status",
      width: "150px",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <ToolHeader
        title="Cash In"
        icon={<ArrowDownCircle size={32} />}
        description="Manage and track all cash deposits into the drawer"
        onDownload={() => setIsDownloadModalOpen(true)}
        onFilter={() => alert("Filter feature coming soon")}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />

      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onDownload={handleDownload}
        title="Export Cash In Records"
        subtitle="Choose your preferred format"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign size={24} />}
          label="Total Cash In"
          value={`$${totalAmount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          change={{ value: 12, direction: "up" }}
          color="green"
        />
        <StatCard
          icon={<ArrowDownCircle size={24} />}
          label="Records"
          value={records.length}
          change={{ value: 5, direction: "up" }}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle2 size={24} />}
          label="Completed"
          value={records.filter((r) => r.status === "completed").length}
          color="green"
        />
        <StatCard
          icon={<Clock size={24} />}
          label="Pending"
          value={records.filter((r) => r.status === "pending").length}
          color="orange"
        />
      </div>

      {/* Add Cash In Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          Add Cash In
        </motion.button>
      </motion.div>

      {/* Table */}
      {filteredRecords.length > 0 ? (
        <DataTable
          columns={columns}
          data={filteredRecords.map((record) => ({
            ...record,
            status: getStatusBadge(record.status),
          }))}
          actionButton={(row) => (
            <div className="flex gap-2 justify-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-all"
              >
                <Eye size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-all"
              >
                <Trash2 size={16} />
              </motion.button>
            </div>
          )}
        />
      ) : (
        <EmptyState
          icon={<ArrowDownCircle size={48} />}
          title="No Cash In Records"
          description="Start by adding your first cash deposit"
          action={{
            label: "Add Cash In",
            onClick: () => setShowModal(true),
          }}
        />
      )}

      {/* Add Modal Placeholder */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-4">Add Cash In</h2>
            <p className="text-gray-600 mb-6">
              Form fields will be added here
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(false)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-all"
            >
              Close
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
