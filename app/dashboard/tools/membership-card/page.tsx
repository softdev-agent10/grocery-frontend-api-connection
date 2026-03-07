"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Plus, Eye, Trash2, Edit2, Users } from "lucide-react";
import { ToolHeader } from "../components/ToolHeader";
import { DataTable } from "../components/DataTable";
import { StatCard } from "../components/StatCard";
import { EmptyState } from "../components/EmptyState";

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

  const filteredRecords = records.filter(
    (record) =>
      record.memberName.toLowerCase().includes(searchValue.toLowerCase()) ||
      record.memberId.toLowerCase().includes(searchValue.toLowerCase())
  );

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
        onDownload={() => alert("Download feature coming soon")}
        onFilter={() => alert("Filter feature coming soon")}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
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
          icon={<span className="text-2xl">✓</span>}
          label="Active Members"
          value={records.filter((r) => r.status === "active").length}
          color="green"
        />
        <StatCard
          icon={<span className="text-2xl">👑</span>}
          label="Premium Members"
          value={records.filter((r) => r.membershipType === "Premium").length}
          color="purple"
        />
        <StatCard
          icon={<span className="text-2xl">⚠️</span>}
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
            <h2 className="text-2xl font-bold mb-4">Add Membership Card</h2>
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
