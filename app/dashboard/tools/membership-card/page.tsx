"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Plus, Eye, Trash2, Edit2, Users, CheckCircle2, Crown, AlertCircle } from "lucide-react";
import { ToolHeader } from "../components/ToolHeader";
import { DataTable } from "../components/DataTable";
import { StatCard } from "../components/StatCard";
import { EmptyState } from "../components/EmptyState";
import DownloadModal from "@/components/download-modal";

interface MembershipCard {
  id: string;
  memberName: string;
  memberId: string;
  membershipType: string;
  joinDate: string;
  renewalDate: string;
  status: "active" | "expired" | "pending";
}

const mockData: MembershipCard[] = [
  {
    id: "1",
    memberName: "Ahmed Hassan",
    memberId: "MEM-001",
    membershipType: "Premium",
    joinDate: "2024-01-15",
    renewalDate: "2026-01-15",
    status: "active",
  },
  {
    id: "2",
    memberName: "Fatima Khan",
    memberId: "MEM-002",
    membershipType: "Standard",
    joinDate: "2024-06-20",
    renewalDate: "2025-06-20",
    status: "expired",
  },
  {
    id: "3",
    memberName: "Mohammad Ali",
    memberId: "MEM-003",
    membershipType: "VIP",
    joinDate: "2025-12-10",
    renewalDate: "2026-12-10",
    status: "active",
  },
];

export default function MembershipCardPage() {
  const [searchValue, setSearchValue] = useState("");
  const [records, setRecords] = useState<MembershipCard[]>(mockData);
  const [showModal, setShowModal] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ status: "all", type: "all" });
  const [formData, setFormData] = useState({ memberName: "", memberId: "", membershipType: "Standard", status: "active" });

  const handleDownload = (scope: 'current' | 'all', format: 'pdf' | 'csv') => {
    const dataToExport = scope === 'current' ? records.slice(0, 5) : records;
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `membership-cards_${scope}_${new Date().getTime()}.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    setIsDownloadModalOpen(false);
  };
  const filteredRecords = records.filter(
    (record) => {
      const matchesSearch = record.memberName.toLowerCase().includes(searchValue.toLowerCase()) ||
                          record.memberId.toLowerCase().includes(searchValue.toLowerCase());
      const matchesStatusFilter = filters.status === "all" || record.status === filters.status;
      const matchesTypeFilter = filters.type === "all" || record.membershipType === filters.type;
      return matchesSearch && matchesStatusFilter && matchesTypeFilter;
    }
  );

  const handleAddMember = () => {
    if (!formData.memberName || !formData.memberId) {
      alert("Please fill required fields");
      return;
    }
    const newMember: MembershipCard = {
      id: (records.length + 1).toString(),
      memberName: formData.memberName,
      memberId: formData.memberId,
      membershipType: formData.membershipType,
      status: formData.status as "active" | "expired" | "pending",
      joinDate: new Date().toISOString().split('T')[0],
      renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
    setRecords([...records, newMember]);
    setFormData({ memberName: "", memberId: "", membershipType: "Standard", status: "active" });
    setShowModal(false);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      expired: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
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

  const getTypeBadge = (type: string) => {
    const colors = {
      Premium: "bg-purple-100 text-purple-800",
      Standard: "bg-blue-100 text-blue-800",
      VIP: "bg-yellow-100 text-yellow-800",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold ${
          colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }`}
      >
        {type}
      </span>
    );
  };

  const columns = [
    { key: "memberName", label: "Member Name" },
    { key: "memberId", label: "Membership ID" },
    { key: "membershipType", label: "Type", width: "100px" },
    { key: "joinDate", label: "Join Date" },
    { key: "renewalDate", label: "Renewal Date" },
    { key: "status", label: "Status", width: "120px" },
  ];

  return (
    <div className="space-y-6">
      <ToolHeader
        title="Membership Cards"
        icon={<CreditCard size={32} />}
        description="Manage membership subscriptions and renewals"
        onDownload={() => setIsDownloadModalOpen(true)}
        onFilter={() => setFilterOpen(true)}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />

      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onDownload={handleDownload}
        title="Export Membership Cards"
        subtitle="Choose your preferred format"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users size={24} />}
          label="Total Members"
          value={records.length}
          change={{ value: 12, direction: "up" }}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle2 size={24} />}
          label="Active Members"
          value={records.filter((r) => r.status === "active").length}
          color="green"
        />
        <StatCard
          icon={<Crown size={24} />}
          label="Premium Members"
          value={records.filter((r) => r.membershipType === "Premium").length}
          color="purple"
        />
        <StatCard
          icon={<AlertCircle size={24} />}
          label="Need Renewal"
          value={records.filter((r) => r.status === "expired").length}
          color="orange"
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
          className="w-full md:w-auto flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          Add Member
        </motion.button>
      </motion.div>

      {filteredRecords.length > 0 ? (
        <DataTable
          columns={columns}
          data={filteredRecords.map((record) => ({
            ...record,
            membershipType: getTypeBadge(record.membershipType),
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
          icon={<CreditCard size={48} />}
          title="No Membership Cards"
          description="Create your first membership program"
          action={{
            label: "Add Member",
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
            <h2 className="text-2xl font-bold mb-6">Add Membership Card</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Member Name"
                value={formData.memberName}
                onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Membership ID"
                value={formData.memberId}
                onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={formData.membershipType}
                onChange={(e) => setFormData({ ...formData, membershipType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
                <option value="VIP">VIP</option>
              </select>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "expired" | "pending" })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddMember}
                className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-all"
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
            <h2 className="text-2xl font-bold mb-6">Filter Memberships</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setFilters({ status: "all", type: "all" }); setFilterOpen(false); }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-all"
              >
                Reset
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterOpen(false)}
                className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-all"
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
