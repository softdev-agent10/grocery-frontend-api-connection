// app/customers/page.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchCustomers, createNewCustomer, updateExistingCustomer } from "@/lib/redux/slices/customerSlice";
import { Plus, Edit2, Trash2, Users } from "lucide-react";
import { useNotification } from "@/lib/context/NotificationContext";
import { Notification } from "@/components/Notification";
import { CustomerHeader } from "@/components/dashboard/customers/CustomerHeader";
import { CustomerToolbar } from "@/components/dashboard/customers/CustomerToolbar";
import { CustomerStats } from "@/components/dashboard/customers/CustomerStats";
import { AddCustomerModal } from "@/components/dashboard/customers/AddCustomerModal";
import { EditCustomerModal } from "@/components/dashboard/customers/EditCustomerModal";
import { DeleteModal } from "@/components/dashboard/customers/DeleteModal";
import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import DownloadModal from "@/components/download-modal";
import { generatePDFWithLogo, generateCSV } from "@/lib/pdf-export";

// Define row type for table
interface CustomerRow {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  totalPurchase: string;
  status: string;
}

const mapCustomerToRow = (customer: any): CustomerRow => ({
  id: customer.id,
  name: customer.name,
  email: customer.email,
  phone: customer.phone_number,
  joinDate: new Date(customer.created_at).toLocaleDateString(),
  totalPurchase: `${customer.point} Points`,
  status: customer.is_active ? "active" : "inactive",
});

const getStatusBadge = (status: string) => (
  <span className={`px-3 py-1 rounded-full text-xs font-bold ${status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

export default function CustomerAccountsPage() {
  const dispatch = useAppDispatch();
  const { customers, loading } = useAppSelector(state => state.customers);
  const { notification, hideNotification } = useNotification();

  // UI state (local)
  const [searchValue, setSearchValue] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isTableViewEditOpen, setIsTableViewEditOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [filters, setFilters] = useState({ status: "all" });
  const [visibleColumns, setVisibleColumns] = useState({ name: true, phone: true, email: true, address: true, due: false, points: false, status: true, lastOrder: true, action: true });
  const [tempColumns, setTempColumns] = useState(visibleColumns);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [tempItemsPerPage, setTempItemsPerPage] = useState(15);

  // Load customers on mount
  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const records: CustomerRow[] = customers.map(mapCustomerToRow);
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch = record.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        record.email.toLowerCase().includes(searchValue.toLowerCase());
      const matchesFilter = filters.status === "all" || record.status === filters.status;
      return matchesSearch && matchesFilter;
    });
  }, [records, searchValue, filters]);

  const handleAddCustomer = async (data: any) => {
    const result = await dispatch(createNewCustomer({
      name: data.name,
      phone_number: data.phone,
      email: data.email,
      address: data.address,
      point: 0,
      is_active: data.status === "active",
    })).unwrap();
    if (result) setIsAddModalOpen(false);
  };

  const handleEditCustomer = (customerRow: any) => {
    const original = customers.find((c: any) => String(c.id) === String(customerRow.id));
    if (original) {
      setSelectedCustomer({
        id: original.id,
        name: original.name,
        email: original.email,
        phone: original.phone_number,
        status: original.is_active ? "active" : "inactive",
      });
      setIsEditModalOpen(true);
    }
  };

  const handleUpdateCustomer = async (id: string, data: any) => {
    await dispatch(updateExistingCustomer({
      id,
      data: {
        name: data.name,
        email: data.email,
        phone_number: data.phone,
        is_active: data.status === "active",
      },
    })).unwrap();
    setIsEditModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleDownload = (scope: "current" | "all", format: "pdf" | "csv") => {
    const dataToExport = scope === "current" ? filteredRecords.slice(0, itemsPerPage) : filteredRecords;
    const cols = ["Name", "Email", "Phone", "Join Date", "Total Purchase", "Status"];
    const rows = dataToExport.map(r => [r.name, r.email, r.phone, r.joinDate, r.totalPurchase, r.status]);
    if (format === "csv") generateCSV(cols, rows, `customers_${scope}_${Date.now()}.csv`);
    else generatePDFWithLogo({ title: "Customer Report", columns: cols, rows, fileName: `customers_${scope}_${Date.now()}.pdf`, scope });
    setIsDownloadModalOpen(false);
  };

  // Prepare data for DataTable - convert status to badge component
  const tableData = filteredRecords.map(row => ({
    ...row,
    status: getStatusBadge(row.status),
  })) as any; // Type assertion to bypass DataTable's strict typing if needed, but ensure id is present

  return (
    <div className="space-y-6">
      {notification && <Notification message={notification.message} type={notification.type} onClose={hideNotification} />}
      <CustomerHeader />
      <CustomerToolbar
        setIsAddModalOpen={() => setIsAddModalOpen(true)}
        onDownload={() => setIsDownloadModalOpen(true)}
        onFilter={() => setIsFilterModalOpen(true)}
        onEditView={() => setIsTableViewEditOpen(true)}
        onBulkDelete={() => setIsDeleteModalOpen(true)}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />
      <CustomerStats
        total={customers.length}
        active={customers.filter((c: any) => c.is_active).length}
        inactive={customers.filter((c: any) => !c.is_active).length}
        contactRequired={customers.filter((c: any) => c.phone_number).length}
      />


      {filteredRecords.length > 0 ? (
        <DataTable
          columns={[
            { key: "name", label: "Customer Name" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Phone" },
            { key: "joinDate", label: "Join Date" },
            { key: "totalPurchase", label: "Total Purchase" },
            { key: "status", label: "Status", width: "120px" },
          ]}
          data={tableData}
          isLoading={loading}
          actionButton={(row) => (
            <div className="">
              {/* <button onClick={() => handleEditCustomer(row)} className="p-2 hover:bg-yellow-100 text-yellow-600 rounded-lg transition">
                <Edit2 size={16} />
              </button>
              <button className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition">
                <Trash2 size={16} />
              </button> */}
            </div>
          )}
        />
      ) : (
        !loading && (
          <EmptyState
            icon={<Users size={48} />}
            title="No Customers Found"
            description="No customer records available"
            action={{ label: "Add Customer", onClick: () => setIsAddModalOpen(true) }}
          />
        )
      )}

      <AddCustomerModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddCustomer} isSubmitting={false} />
      <EditCustomerModal isOpen={isEditModalOpen} customer={selectedCustomer} onClose={() => setIsEditModalOpen(false)} onSave={handleUpdateCustomer} />
      <DeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={() => { }} />
      <DownloadModal isOpen={isDownloadModalOpen} onClose={() => setIsDownloadModalOpen(false)} onDownload={handleDownload} title="Export Customers" subtitle="Choose format" />
    </div>
  );
}