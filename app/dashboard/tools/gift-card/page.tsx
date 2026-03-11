"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Plus, Eye, Trash2, Edit2, DollarSign, CheckCircle2 } from "lucide-react";
import { ToolHeader } from "../components/ToolHeader";
import { DataTable } from "../components/DataTable";
import { StatCard } from "../components/StatCard";
import { EmptyState } from "../components/EmptyState";
import DownloadModal from "@/components/download-modal";

interface GiftCard {
  id: string;
  cardNumber: string;
  amount: string;
  balance: string;
  issueDate: string;
  expiryDate: string;
  status: "active" | "used" | "expired";
}

const mockData: GiftCard[] = [
  {
    id: "1",
    cardNumber: "GC-001234",
    amount: "$100.00",
    balance: "$45.50",
    issueDate: "2026-01-15",
    expiryDate: "2027-01-15",
    status: "active",
  },
  {
    id: "2",
    cardNumber: "GC-005678",
    amount: "$250.00",
    balance: "$0.00",
    issueDate: "2025-12-20",
    expiryDate: "2026-12-20",
    status: "used",
  },
  {
    id: "3",
    cardNumber: "GC-009012",
    amount: "$150.00",
    balance: "$150.00",
    issueDate: "2024-11-10",
    expiryDate: "2025-11-10",
    status: "expired",
  },
];

export default function GiftCardPage() {
  const [searchValue, setSearchValue] = useState("");
  const [records, setRecords] = useState<GiftCard[]>(mockData);
  const [showModal, setShowModal] = useState(false);  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const handleDownload = (scope: 'current' | 'all', format: 'pdf' | 'csv') => {
    const dataToExport = scope === 'current' ? records.slice(0, 5) : records;
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gift-cards_${scope}_${new Date().getTime()}.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    setIsDownloadModalOpen(false);
  };
  const filteredRecords = records.filter(
    (record) =>
      record.cardNumber.toLowerCase().includes(searchValue.toLowerCase())
  );

  const totalValue = records.reduce((sum, r) => {
    const amount = parseFloat(r.amount.replace(/[$,]/g, ""));
    return sum + amount;
  }, 0);

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      used: "bg-blue-100 text-blue-800",
      expired: "bg-red-100 text-red-800",
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
    { key: "cardNumber", label: "Card Number" },
    { key: "amount", label: "Amount" },
    { key: "balance", label: "Balance" },
    { key: "issueDate", label: "Issue Date" },
    { key: "expiryDate", label: "Expiry Date" },
    { key: "status", label: "Status", width: "120px" },
  ];

  return (
    <div className="space-y-6">
      <ToolHeader
        title="Gift Cards"
        icon={<Gift size={32} />}
        description="Create and manage gift cards for your customers"
        onDownload={() => setIsDownloadModalOpen(true)}
        onFilter={() => alert("Filter feature coming soon")}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />

      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onDownload={handleDownload}
        title="Export Gift Cards"
        subtitle="Choose your preferred format"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Gift size={24} />}
          label="Total Cards"
          value={records.length}
          color="purple"
        />
        <StatCard
          icon={<DollarSign size={24} />}
          label="Total Value"
          value={`$${totalValue.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          color="green"
        />
        <StatCard
          icon={<CheckCircle2 size={24} />}
          label="Active Cards"
          value={records.filter((r) => r.status === "active").length}
          color="green"
        />
        <StatCard
          icon={<CheckCircle2 size={24} />}
          label="Used Cards"
          value={records.filter((r) => r.status === "used").length}
          color="blue"
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          Create Gift Card
        </motion.button>
      </motion.div>

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
                className="p-2 hover:bg-yellow-100 text-yellow-600 rounded-lg transition-all"
              >
                <Edit2 size={16} />
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
          icon={<Gift size={48} />}
          title="No Gift Cards"
          description="Create your first gift card"
          action={{
            label: "Create Gift Card",
            onClick: () => setShowModal(true),
          }}
        />
      )}

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
            <h2 className="text-2xl font-bold mb-4">Create Gift Card</h2>
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
