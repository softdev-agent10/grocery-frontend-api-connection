"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Plus, Eye, Trash2, Edit2, TrendingUp } from "lucide-react";
import { ToolHeader } from "../components/ToolHeader";
import { DataTable } from "../components/DataTable";
import { StatCard } from "../components/StatCard";
import { EmptyState } from "../components/EmptyState";

interface LoyaltyCard {
  id: string;
  memberName: string;
  cardNumber: string;
  points: string;
  tier: string;
  joinDate: string;
  lastUsed: string;
}

const mockData: LoyaltyCard[] = [
  {
    id: "1",
    memberName: "Ahmed Hassan",
    cardNumber: "LC-100123",
    points: "2,450",
    tier: "Gold",
    joinDate: "2024-06-15",
    lastUsed: "2026-03-05",
  },
  {
    id: "2",
    memberName: "Fatima Khan",
    cardNumber: "LC-100124",
    points: "1,850",
    tier: "Silver",
    joinDate: "2024-08-20",
    lastUsed: "2026-03-06",
  },
  {
    id: "3",
    memberName: "Mohammad Ali",
    cardNumber: "LC-100125",
    points: "850",
    tier: "Bronze",
    joinDate: "2025-12-10",
    lastUsed: "2026-02-28",
  },
];

export default function LoyaltyCardPage() {
  const [searchValue, setSearchValue] = useState("");
  const [records, setRecords] = useState<LoyaltyCard[]>(mockData);
  const [showModal, setShowModal] = useState(false);

  const filteredRecords = records.filter(
    (record) =>
      record.memberName.toLowerCase().includes(searchValue.toLowerCase()) ||
      record.cardNumber.toLowerCase().includes(searchValue.toLowerCase())
  );

  const getTierBadge = (tier: string) => {
    const colors = {
      Gold: "bg-yellow-100 text-yellow-800",
      Silver: "bg-gray-100 text-gray-800",
      Bronze: "bg-orange-100 text-orange-800",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold ${
          colors[tier as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }`}
      >
        {tier}
      </span>
    );
  };

  const columns = [
    { key: "memberName", label: "Member Name" },
    { key: "cardNumber", label: "Card Number" },
    { key: "points", label: "Points" },
    { key: "tier", label: "Tier", width: "100px" },
    { key: "joinDate", label: "Join Date" },
    { key: "lastUsed", label: "Last Used" },
  ];

  return (
    <div className="space-y-6">
      <ToolHeader
        title="Loyalty Cards"
        icon={<Heart size={32} />}
        description="Manage loyalty program and reward points"
        onDownload={() => alert("Download feature coming soon")}
        onFilter={() => alert("Filter feature coming soon")}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Heart size={24} />}
          label="Total Members"
          value={records.length}
          change={{ value: 8, direction: "up" }}
          color="purple"
        />
        <StatCard
          icon={<TrendingUp size={24} />}
          label="Total Points Issued"
          value={records.reduce((sum, r) => sum + parseInt(r.points.replace(/,/g, "")), 0).toLocaleString()}
          color="green"
        />
        <StatCard
          icon={<span className="text-2xl">👑</span>}
          label="Gold Members"
          value={records.filter((r) => r.tier === "Gold").length}
          color="yellow"
        />
        <StatCard
          icon={<span className="text-2xl">🏅</span>}
          label="Silver Members"
          value={records.filter((r) => r.tier === "Silver").length}
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
          className="w-full md:w-auto flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
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
            tier: getTierBadge(record.tier),
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
          icon={<Heart size={48} />}
          title="No Loyalty Members"
          description="Invite your first customer to the loyalty program"
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
            <h2 className="text-2xl font-bold mb-4">Add Loyalty Member</h2>
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
