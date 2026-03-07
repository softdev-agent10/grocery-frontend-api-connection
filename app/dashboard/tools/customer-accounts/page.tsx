"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Eye, Trash2, Edit2, Mail, Phone } from "lucide-react";
import { ToolHeader } from "../components/ToolHeader";
import { DataTable } from "../components/DataTable";
import { StatCard } from "../components/StatCard";
import { EmptyState } from "../components/EmptyState";

interface CustomerAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  totalPurchase: string;
  status: "active" | "inactive";
}

const mockData: CustomerAccount[] = [
  {
    id: "1",
    name: "Ahmed Hassan",
    email: "ahmed@example.com",
    phone: "01712345678",
    joinDate: "2025-06-15",
    totalPurchase: "$2,450.00",
    status: "active",
  },
  {
    id: "2",
    name: "Fatima Khan",
    email: "fatima@example.com",
    phone: "01812345678",
    joinDate: "2025-08-20",
    totalPurchase: "$1,850.00",
    status: "active",
  },
  {
    id: "3",
    name: "Mohammad Ali",
    email: "ali@example.com",
    phone: "01912345678",
    joinDate: "2024-12-10",
    totalPurchase: "$5,200.00",
    status: "inactive",
  },
];

export default function CustomerAccountsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [records, setRecords] = useState<CustomerAccount[]>(mockData);
  const [showModal, setShowModal] = useState(false);

  const filteredRecords = records.filter(
    (record) =>
      record.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      record.email.toLowerCase().includes(searchValue.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold ${
          status === "active"
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const columns = [
    { key: "name", label: "Customer Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "joinDate", label: "Join Date" },
    { key: "totalPurchase", label: "Total Purchase" },
    { key: "status", label: "Status", width: "120px" },
  ];

  return (
    <div className="space-y-6">
      <ToolHeader
        title="Customer Accounts"
        icon={<Users size={32} />}
        description="Manage and track customer accounts and their purchase history"
        onDownload={() => alert("Download feature coming soon")}
        onFilter={() => alert("Filter feature coming soon")}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users size={24} />}
          label="Total Customers"
          value={records.length}
          change={{ value: 15, direction: "up" }}
          color="blue"
        />
        <StatCard
          icon={<span className="text-2xl">✓</span>}
          label="Active Customers"
          value={records.filter((r) => r.status === "active").length}
          color="green"
        />
        <StatCard
          icon={<span className="text-2xl">⊗</span>}
          label="Inactive"
          value={records.filter((r) => r.status === "inactive").length}
          color="orange"
        />
        <StatCard
          icon={<Phone size={24} />}
          label="Contact Required"
          value="12"
          color="purple"
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
          className="w-full md:w-auto flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          Add Customer
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
          icon={<Users size={48} />}
          title="No Customers Found"
          description="Start by adding your first customer account"
          action={{
            label: "Add Customer",
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
            <h2 className="text-2xl font-bold mb-4">Add Customer</h2>
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
