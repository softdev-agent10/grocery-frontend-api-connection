"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Eye, Trash2, Edit2, Mail, Phone, CheckCircle2, XCircle, Search, X, ArrowUpDown } from "lucide-react";
import { ToolHeader } from "../components/ToolHeader";
import { DataTable } from "../components/DataTable";
import { StatCard } from "../components/StatCard";
import { EmptyState } from "../components/EmptyState";
import DownloadModal from "@/components/download-modal";
import { generatePDFWithLogo, generateCSV } from "@/lib/pdf-export";
import { DownloadButton, FilterButton, EditButton, DeleteButton } from "@/components/toolbar-buttons";
import { useAuth } from "@/hooks/useAuth";
import { getCustomers, createCustomer, CustomerItem } from "@/app/services/tools/serive.tools";

interface CustomerAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  totalPurchase: string;
  status: "active" | "inactive";
}

// Helper function to map API response to component format
const mapApiCustomerToAccount = (customer: CustomerItem): CustomerAccount => {
  const joinDate = new Date(customer.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return {
    id: customer.id.toString(),
    name: customer.name,
    email: customer.email,
    phone: customer.phone_number,
    joinDate,
    totalPurchase: `${customer.point} Points`,
    status: customer.is_active ? 'active' : 'inactive',
  };
};

export default function CustomerAccountsPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const [records, setRecords] = useState<CustomerAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isTableViewEditOpen, setIsTableViewEditOpen] = useState(false);
  const [isCustomerEditOpen, setIsCustomerEditOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [filters, setFilters] = useState({ status: "all" });
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "", status: "active" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerAccount | null>(null);
  const [editFormData, setEditFormData] = useState({ name: "", email: "", phone: "", status: "active" as "active" | "inactive" });
  const [sortBy, setSortBy] = useState("Recently Added");
  const [dateFilter, setDateFilter] = useState("All Time");

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      // if (authLoading || !user || !token) {
      //   return;
      // }

      try {
        setIsLoading(true);
        setError(null);

        const response = await getCustomers({
          branchId: "1234567890", // Replace with actual branch ID
          token: "your_token_here", // Replace with actual token
          page: 1,
          perPage: 50,
          sortBy: "created_at",
          order: "desc",
        });

        if (response.status === 'success' && response.data?.items) {
          const mappedCustomers = response.data.items.map(mapApiCustomerToAccount);
          setRecords(mappedCustomers);
        }
      } catch (err) {
        console.error('Failed to fetch customers:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch customers');
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [user, token, authLoading]);

  // Table view customization
  const defaultColumns = {
    name: true,
    phone: true,
    email: true,
    address: true,
    due: false,
    points: false,
    status: true,
    lastOrder: true,
    action: true,
  };
  const [visibleColumns, setVisibleColumns] = useState(defaultColumns);
  const [tempColumns, setTempColumns] = useState(defaultColumns);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [tempItemsPerPage, setTempItemsPerPage] = useState(15);

  const handleDownload = (scope: 'current' | 'all', format: 'pdf' | 'csv') => {
    const dataToExport = scope === 'current' ? records.slice(0, 5) : records;
    const columns = ['Name', 'Email', 'Phone', 'Join Date', 'Total Purchase', 'Status'];
    const rows = dataToExport.map(r => [r.name, r.email, r.phone, r.joinDate, r.totalPurchase, r.status]);

    if (format === 'csv') {
      generateCSV(columns, rows, `customer-accounts_${scope}_${new Date().getTime()}.csv`);
    } else if (format === 'pdf') {
      generatePDFWithLogo({
        title: `Customer Accounts Report (${scope === 'current' ? 'Current Page' : 'All Pages'})`,
        columns,
        rows,
        fileName: `customer-accounts_${scope}_${new Date().getTime()}.pdf`,
        scope
      });
    }

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

  const handleAddCustomer = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      alert("Please fill all required fields");
      return;
    }

    // if (!user || !token) {
    //   alert("Please login first");
    //   return;
    // }

    try {
      setIsSubmitting(true);
      const response = await createCustomer({
        branchId: "1234567890", // Replace with actual branch ID
        token: "your_token_here", // Replace with actual token
        name: formData.name,
        phone_number: formData.phone,
        email: formData.email,
        address: formData.address,
        point: 0,
        is_active: formData.status === "active",
      });

      if (response.status === "success") {
        // Add new customer to the list
        const newCustomer = mapApiCustomerToAccount(response.data);
        setRecords([newCustomer, ...records]);
        setFormData({ name: "", email: "", phone: "", address: "", status: "active" });
        setShowModal(false);
        alert("Customer created successfully!");
      }
    } catch (err) {
      console.error('Failed to create customer:', err);
      alert(err instanceof Error ? err.message : 'Failed to create customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCustomer = (customer: CustomerAccount) => {
    setSelectedCustomer(customer);
    setEditFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      status: customer.status,
    });
    setIsCustomerEditOpen(true);
  };

  const handleSaveCustomerEdit = () => {
    if (!editFormData.name || !editFormData.email || !editFormData.phone) {
      alert("Please fill all fields");
      return;
    }
    setRecords(records.map(r =>
      r.id === selectedCustomer?.id
        ? { ...r, name: editFormData.name, email: editFormData.email, phone: editFormData.phone, status: editFormData.status }
        : r
    ));
    setIsCustomerEditOpen(false);
    setSelectedCustomer(null);
  };

  const getStatusBadge = (status: string) => {
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold ${status === "active"
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-800"
          }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleApplyTableChanges = () => {
    setVisibleColumns({ ...tempColumns });
    setItemsPerPage(tempItemsPerPage);
    setIsTableViewEditOpen(false);
  };

  const handleResetTableDefaults = () => {
    setTempColumns({ ...defaultColumns });
    setTempItemsPerPage(15);
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
      {/* Header Section */}
      <div className="bg-blue-600 rounded-2xl p-8 shadow-lg">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white">
            <Users size={32} />
          </div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-white"
          >
            Customer Accounts
          </motion.h1>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-white/90 text-sm md:text-base"
        >
          Manage and track customer accounts and their purchase history
        </motion.p>
      </div>

      {/* Error Notification */}
      {error && (
        <div className="mx-4 rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-600">Error: {error}</p>
        </div>
      )}

      {/* Toolbar Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col md:flex-row gap-4 items-center justify-between"
      >
        {/* Left Section - Buttons */}
        <div className="flex gap-3 w-full md:w-auto">
          <DownloadButton onClick={() => setIsDownloadModalOpen(true)} />
          <FilterButton onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} />
          <EditButton onClick={() => setIsTableViewEditOpen(true)} />
          <DeleteButton onClick={() => setIsDeleteModalOpen(true)} />
        </div>

        {/* Right Section - Search */}
        <div className="w-full md:flex-1 relative group md:flex md:justify-end">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full md:w-80 px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-300 group-hover:border-gray-300 text-sm md:text-base"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-600 transition-colors" size={18} />
        </div>
      </motion.div>

      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onDownload={handleDownload}
        title="Export Customer Accounts"
        subtitle="Choose your preferred format"
      />

      {/* Filter Modal */}
      <AnimatePresence>
        {isFilterMenuOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterMenuOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                <h2 className="text-xl font-bold">Filter & Sort</h2>
                <button onClick={() => setIsFilterMenuOpen(false)} className="hover:bg-blue-700 p-1 rounded-full">
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2 uppercase text-xs tracking-wider">
                    <ArrowUpDown size={16} /> SORT BY
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {["Recently Added", "Name (A-Z)", "Purchase Amount"].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setSortBy(opt)}
                        className={`px-4 py-2.5 rounded text-sm font-medium border text-left transition-all ${sortBy === opt
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300"
                          }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider">STATUS FILTER</h3>
                  <div className="space-y-2">
                    {["All", "Active", "Inactive"].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setFilters({ status: opt.toLowerCase() === "all" ? "all" : opt.toLowerCase() })}
                        className={`w-full px-4 py-2.5 rounded text-sm font-medium border text-left transition-all ${filters.status === (opt.toLowerCase() === "all" ? "all" : opt.toLowerCase())
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300"
                          }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setIsFilterMenuOpen(false)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold shadow-md hover:bg-blue-700 transition-colors mt-4"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isTableViewEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTableViewEditOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                <h2 className="text-xl font-bold">Edit View Settings</h2>
                <button onClick={() => setIsTableViewEditOpen(false)} className="hover:bg-blue-700 p-1 rounded-full">
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
                {/* Table View Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">Table View</h3>
                  <div className="space-y-2">
                    {[
                      { key: 'name' as const, label: 'Name', icon: '👤' },
                      { key: 'phone' as const, label: 'Phone', icon: '📱' },
                      { key: 'email' as const, label: 'Email', icon: '📧' },
                      { key: 'address' as const, label: 'Address', icon: '📍' },
                      { key: 'due' as const, label: 'Due', icon: '💳' },
                      { key: 'points' as const, label: 'Points', icon: '⭐' },
                      { key: 'status' as const, label: 'Status', icon: '✓' },
                      { key: 'lastOrder' as const, label: 'Last Order', icon: '📦' },
                      { key: 'action' as const, label: 'Action', icon: '⚙️' },
                    ].map(column => (
                      <label key={column.key} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={tempColumns[column.key]}
                          onChange={(e) => setTempColumns({ ...tempColumns, [column.key]: e.target.checked })}
                          className="w-4 h-4 accent-blue-600 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-700">{column.icon} {column.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Items Per Page Section */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">Items Per Page</h3>
                  <div className="space-y-2">
                    {[10, 15, 25, 50].map(num => (
                      <label key={num} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded transition-colors">
                        <input
                          type="radio"
                          name="itemsPerPage"
                          value={num}
                          checked={tempItemsPerPage === num}
                          onChange={(e) => setTempItemsPerPage(Number(e.target.value))}
                          className="w-4 h-4 accent-blue-600 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-700">{num} items</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="space-y-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setVisibleColumns({ ...tempColumns });
                      setItemsPerPage(tempItemsPerPage);
                      setIsTableViewEditOpen(false);
                    }}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    ✓ Apply
                  </button>
                  <button
                    onClick={() => {
                      setTempColumns({ name: true, phone: true, email: true, address: true, due: true, points: true, status: true, lastOrder: true, action: true });
                      setTempItemsPerPage(15);
                    }}
                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    ↻ Reset
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-red-600 p-4 flex justify-between items-center text-white">
                <h2 className="text-xl font-bold">Delete Customers</h2>
                <button onClick={() => setIsDeleteModalOpen(false)} className="hover:bg-red-700 p-1 rounded-full">
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800 font-medium">
                    ⚠️ Are you sure you want to delete selected customers? This action cannot be undone.
                  </p>
                </div>
                <div className="space-y-2 flex gap-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Customer Modal */}
      <AnimatePresence>
        {isCustomerEditOpen && selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCustomerEditOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Edit Customer: {selectedCustomer.name}</h2>
                  <button onClick={() => setIsCustomerEditOpen(false)} className="hover:bg-blue-700 p-2 rounded-full transition-colors">
                    <X size={28} className="text-white" />
                  </button>
                </div>
              </div>

              <div className="p-8 max-h-[70vh] overflow-y-auto">
                <div className="space-y-6">
                  {/* Row 1 - Name and Email */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Customer Name</label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
                        placeholder="Enter customer name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  {/* Row 2 - Phone and Status */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                      <select
                        value={editFormData.status}
                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as "active" | "inactive" })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-800 cursor-pointer"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons Section */}
              <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex gap-4 justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCustomerEditOpen(false)}
                  className="px-8 py-3 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveCustomerEdit}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all"
                >
                  Save Changes
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
          whileHover={{ scale: isLoading ? 1 : 1.05 }}
          whileTap={{ scale: isLoading ? 1 : 0.95 }}
          onClick={() => !isLoading && setShowModal(true)}
          disabled={isLoading}
          className={`w-full md:w-auto flex items-center gap-2 px-6 py-3 rounded-xl transition-all shadow-lg ${isLoading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold hover:shadow-xl'
            }`}
          title={isLoading ? 'Loading customers...' : 'Add new customer'}
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
          isLoading={isLoading}
          actionButton={(row) => {
            const originalRecord = filteredRecords.find(r => r.id === row.id);
            return (
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
                  onClick={() => originalRecord && handleEditCustomer(originalRecord)}
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
            );
          }}
        />
      ) : isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <EmptyState
          icon={<Users size={48} />}
          title="No Customers Found"
          description="No customer records available"
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
                placeholder="Customer Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <input
                type="email"
                placeholder="Email Address *"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <input
                type="tel"
                placeholder="Phone Number *"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <input
                type="text"
                placeholder="Address (optional)"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <motion.button
                whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                onClick={handleAddCustomer}
                disabled={isSubmitting}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  'Save Customer'
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                onClick={() => !isSubmitting && setShowModal(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
