"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Eye, Trash2, Edit2, Mail, Phone, CheckCircle2, XCircle } from "lucide-react";
import { ToolHeader } from "../components/ToolHeader";
import { DataTable } from "../components/DataTable";
import { StatCard } from "../components/StatCard";
import { EmptyState } from "../components/EmptyState";
import DownloadModal from "@/components/download-modal";

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
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ status: "all" });
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", status: "active" });

  const handleDownload = (scope: 'current' | 'all', format: 'pdf' | 'csv') => {
    const dataToExport = scope === 'current' ? records.slice(0, 5) : records;
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customer-accounts_${scope}_${new Date().getTime()}.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    setIsDownloadModalOpen(false);
  };
  const filteredRecords = records.filter(
    (record) => {
      const matchesSearch = record.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                          record.email.toLowerCase().includes(searchValue.toLowerCase());
      const matchesFilter = filters.status === "all" || record.status === filters.status;
      return matchesSearch && matchesFilter;
    }
  );

  const handleAddCustomer = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      alert("Please fill all fields");
      return;
    }
    const newCustomer: CustomerAccount = {
      id: (records.length + 1).toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      status: formData.status as "active" | "inactive",
      joinDate: new Date().toISOString().split('T')[0],
      totalPurchase: "$0.00",
    };
    setRecords([...records, newCustomer]);
    setFormData({ name: "", email: "", phone: "", status: "active" });
    setShowModal(false);
  };

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
        onDownload={() => setIsDownloadModalOpen(true)}
        onFilter={() => setFilterOpen(true)}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />

      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onDownload={handleDownload}
        title="Export Customer Accounts"
        subtitle="Choose your preferred format"
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
          icon={<CheckCircle2 size={24} />}
          label="Active Customers"
          value={records.filter((r) => r.status === "active").length}
          color="green"
        />
        <StatCard
          icon={<XCircle size={24} />}
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
            <h2 className="text-2xl font-bold mb-6">Add Customer</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Customer Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddCustomer}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all"
              >
                Save
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-all"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {filterOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setFilterOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-6">Filter Customers</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setFilters({ status: "all" }); setFilterOpen(false); }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-all"
              >
                Reset
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterOpen(false)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all"
              >
                Apply
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
