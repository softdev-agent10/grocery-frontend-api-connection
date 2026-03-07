"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpCircle, Plus, Eye, Trash2, DollarSign } from "lucide-react";
import { ToolHeader } from "../components/ToolHeader";
import { DataTable } from "../components/DataTable";
import { StatCard } from "../components/StatCard";
import { EmptyState } from "../components/EmptyState";

interface CashOutRecord {
  id: string;
  date: string;
  user: string;
  amount: string;
  reason: string;
  status: "completed" | "pending" | "failed";
}

const mockData: CashOutRecord[] = [
  {
    id: "1",
    date: "2026-03-06 02:10 PM",
    user: "John Doe",
    amount: "$200.00",
    reason: "Supplier Payment",
    status: "completed",
  },
  {
    id: "2",
    date: "2026-03-06 11:45 AM",
    user: "Jane Smith",
    amount: "$450.00",
    reason: "Employee Advance",
    status: "completed",
  },
  {
    id: "3",
    date: "2026-03-05 03:20 PM",
    user: "Mike Johnson",
    amount: "$150.00",
    reason: "Maintenance Cost",
    status: "pending",
  },
  {
    id: "4",
    date: "2026-03-05 10:00 AM",
    user: "Sarah Lee",
    amount: "$300.00",
    reason: "Daily Expense",
    status: "failed",
  },
];

export default function CashOutPage() {
  const [searchValue, setSearchValue] = useState("");
  const [records, setRecords] = useState<CashOutRecord[]>(mockData);
  const [showModal, setShowModal] = useState(false);

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
        title="Cash Out"
        icon={<ArrowUpCircle size={32} />}
        description="Track and manage all cash withdrawals from the drawer"
        onDownload={() => alert("Download feature coming soon")}
        onFilter={() => alert("Filter feature coming soon")}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign size={24} />}
          label="Total Cash Out"
          value={`$${totalAmount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          change={{ value: 8, direction: "down" }}
          color="orange"
        />
        <StatCard
          icon={<ArrowUpCircle size={24} />}
          label="Records"
          value={records.length}
          change={{ value: 12, direction: "up" }}
          color="blue"
        />
        <StatCard
          icon={<span className="text-2xl">✓</span>}
          label="Completed"
          value={records.filter((r) => r.status === "completed").length}
          color="green"
        />
        <StatCard
          icon={<span className="text-2xl">✕</span>}
          label="Failed"
          value={records.filter((r) => r.status === "failed").length}
          color="orange"
        />
      </div>

      {/* Add Cash Out Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          Add Cash Out
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
          icon={<ArrowUpCircle size={48} />}
          title="No Cash Out Records"
          description="No withdrawals recorded yet"
          action={{
            label: "Add Cash Out",
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
            <h2 className="text-2xl font-bold mb-4">Add Cash Out</h2>
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
