'use client';

import { useState, useEffect } from 'react';
import { Notification } from '@/components/Notification';
import { useProducts } from '@/hooks/products/useProducts';
import { ProductHeader } from '@/components/dashboard/products/ProductHeader';
import { ProductToolbar } from '@/components/dashboard/products/ProductToolbar';
import { ProductTable } from '@/components/dashboard/products/ProductTable';
import { Pagination } from '@/components/dashboard/products/Pagination';
import { EditTableViewModal } from '@/components/dashboard/products/EditTableViewModal';
import { ConfirmationModal } from '@/components/dashboard/products/ConfirmationModal';
import ProductModal from '@/components/dashboard/products/ProductModal';
import HistoryModal from '@/components/history-modal';
import ProductModalOverView from '@/components/dashboard/products/ProductModalOverView';
import { deleteExistingProduct } from '@/lib/redux/thunks/productThunks';
import { useNotification } from '@/lib/context/NotificationContext';
import { TableViewColumns } from '@/lib/redux/slices';
import { clearSelectedIds } from '@/lib/redux/slices/productsSlice';
import { createProduct, getProductById, ProductFormData, ProductPayload, updateProduct } from '@/app/services/product/service.product';
// import type { TableViewColumns } from '@/components/dashboard/products/ProductTable'; // export type from that file

export default function ProductsPage() {
  const { notification, hideNotification } = useNotification();
  const {
    products,
    loading,
    totalProducts,
    currentPage,
    itemsPerPage,
    searchQuery,
    filterStatus,
    sortConfig,
    selectedIds,
    totalPages,
    history,
    setSearchQuery,
    setFilterStatus,
    setSortConfig,
    setCurrentPage,
    setItemsPerPage,
    handleSelectAll,
    handleSelectOne,
    handleBulkDelete,
    addHistory,
    showNotification,
    dispatch,
  } = useProducts();

  // Column visibility state with localStorage
  const [visibleColumns, setVisibleColumns] = useState<TableViewColumns>(() => {
    const saved = localStorage.getItem('tableSettingsProductsView');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.columns) return parsed.columns;
      } catch { }
    }
    return {
      checkbox: true,
      name: true,
      upc: true,
      plu: true,
      category: true,
      brand: true,
      selling_price: true,
      quantity: true,
      in_stock: true,
    };
  });
  const [tempColumns, setTempColumns] = useState(visibleColumns);
  const [tempItemsPerPage, setTempItemsPerPage] = useState(itemsPerPage);

  // Local UI states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProductOverviewOpen, setIsProductOverviewOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    product: undefined as any,
    onConfirm: async () => { },
  });
  const [isFetchingProduct, setIsFetchingProduct] = useState(false);

  // Save column settings to localStorage when changed
  useEffect(() => {
    localStorage.setItem('tableSettingsProductsView', JSON.stringify({ columns: visibleColumns, itemsPerPage }));
  }, [visibleColumns, itemsPerPage]);

  const handleApplyTableChanges = () => {
    setVisibleColumns(tempColumns);
    setItemsPerPage(tempItemsPerPage);
    setIsEditModalOpen(false);
  };

  const handleResetTableDefaults = () => {
    const defaults: TableViewColumns = {
      checkbox: true,
      name: true,
      upc: true,
      plu: true,
      category: true,
      brand: true,
      selling_price: true,
      quantity: true,
      in_stock: true,
    };
    setTempColumns(defaults);
    setTempItemsPerPage(5);
    localStorage.removeItem('tableSettingsProductsView');
  };

  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: 'Bulk Delete',
      message: `Are you sure you want to delete ${selectedIds.length} selected products? This action cannot be undone.`,
      product: undefined,
      onConfirm: async () => {
        try {
          const deletePromises = selectedIds.map((id) => dispatch(deleteExistingProduct(id)).unwrap());
          await Promise.all(deletePromises);
          dispatch(clearSelectedIds()); // assuming clearSelectedIds is exported from slice
          showNotification(`${selectedIds.length} products deleted successfully`, 'success');
          addHistory('Bulk Delete', `Deleted ${selectedIds.length} products`);
        } catch (error) {
          showNotification('Failed to delete some products', 'error');
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleSingleDelete = (product: any) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Product',
      message: `Are you sure you want to delete "${product.name}"?`,
      product,
      onConfirm: async () => {
        try {
          await dispatch(deleteExistingProduct(product.id)).unwrap();
          showNotification(`Product "${product.name}" deleted successfully`, 'success');
          addHistory('Delete', `Deleted product: ${product.name}`);
        } catch (error) {
          showNotification('Failed to delete product', 'error');
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleDownload = (scope: 'current' | 'all', format: 'pdf' | 'csv') => {
    // Implement export logic here – similar to original component
    showNotification(`${format.toUpperCase()} export coming soon`, 'info');
  };

  // Helper to open modal for add
  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = async (product: any) => {
    // product from table is minimal (list view)
    setIsFetchingProduct(true);
    try {
      // Fetch full product details by ID
      const response = await getProductById(product.id);
      const fullProduct = response.data;

      // Map API response (ProductData) to ProductFormData
      const formData: ProductFormData = {
        id: fullProduct.id,
        name: fullProduct.name,
        category_name: fullProduct.category.name,
        brand_name: fullProduct.brand.name,
        unit_name: fullProduct.unit?.name || '', // unit is an object with name
        upc_code: fullProduct.upc,
        plu_code: fullProduct.plu || '',
        description: fullProduct.description || '',
        buying_price: parseFloat(fullProduct.buying_price as string) || 0,
        selling_price: parseFloat(fullProduct.selling_price as string) || 0,
        custom_price: parseFloat(fullProduct.custom_price as string) || 0,
        quantity: fullProduct.quantity || 0,
        quantity_alert: fullProduct.quantity_alert || 0,
        discount: parseFloat(fullProduct.discount as string) || 0,
        age_verification: fullProduct.age_verification ?? false,
        ebt_eligible: fullProduct.ebt_eligible ?? false,
        sold_by_weight: fullProduct.sold_by_weight ?? false,
        is_refundable: fullProduct.is_refundable ?? false,
        warranty_period: fullProduct.warranty_period || '',
        warranty_description: fullProduct.warranty_description || '',
        manufacturer_date: fullProduct.manufacturer_date || '',
        expiration_date: fullProduct.expiration_date || '',
        image_url: fullProduct.image_url || undefined,
        is_available: fullProduct.is_available ?? true,
      };
      setEditingProduct(formData);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch product details:', error);
      showNotification('Could not load product details', 'error');
    } finally {
      setIsFetchingProduct(false);
    }
  };

  const handleSaveProduct = async (data: ProductFormData) => {
    try {
      if (editingProduct?.id) {
        await updateProduct(editingProduct.id, data);
        showNotification('Product updated successfully!', 'success');
      } else {
        const response = await createProduct(data);
        // console.log('Created product:', response);
        showNotification('Product created successfully!', 'success');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (error: any) {
      showNotification(error.message || 'Failed to save product', 'error');
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      {notification && <Notification message={notification.message} type={notification.type} onClose={hideNotification} />}
      <section className="rounded-2xl border-b border-slate-200 bg-white mt-0">
        <ProductHeader />
        <ProductToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          sortConfig={sortConfig}
          onSortChange={(key, dir) => setSortConfig({ key, direction: dir })}
          selectedCount={selectedIds.length}
          onAddClick={() => setIsModalOpen(true)}
          onEditViewClick={() => setIsEditModalOpen(true)}
          onBulkDelete={handleBulkDeleteClick}
          onHistoryClick={() => setIsHistoryOpen(true)}
          onDownload={handleDownload}
        />
        <div className="p-4 space-y-8">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl">
            <ProductTable
              products={products}
              loading={loading}
              visibleColumns={visibleColumns}
              selectedIds={selectedIds}
              onSelectAll={handleSelectAll}
              onSelectOne={handleSelectOne}
              onViewDetails={(product) => {
                setEditingProduct(product as any);
                setIsProductOverviewOpen(true);
              }}
              onEdit={handleEditProduct}
              onDelete={handleSingleDelete}
              itemsPerPage={itemsPerPage}
            />
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalProducts={totalProducts}
            paginatedCount={products.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(limit) => {
              setItemsPerPage(limit);
              setCurrentPage(1);
            }}
          />
        </div>
      </section>

      {/* Modals – implement as needed */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        product={editingProduct || undefined}
        isEditing={!!editingProduct?.id}
        title={editingProduct ? "Edit Product" : "Add Product"}
        subtitle={editingProduct ? "Update product information" : "Add new product to inventory"}
        isLoading={isFetchingProduct} // optional: pass to modal to show a spinner
      />
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} history={history} />
      <EditTableViewModal
        isOpen={isEditModalOpen}
        tempColumns={tempColumns}
        tempItemsPerPage={tempItemsPerPage}
        onClose={() => setIsEditModalOpen(false)}
        onApply={handleApplyTableChanges}
        onReset={handleResetTableDefaults}
        onColumnToggle={(col) => setTempColumns({ ...tempColumns, [col]: !tempColumns[col] })}
        onItemsPerPageChange={setTempItemsPerPage}
      />
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        product={confirmModal.product}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
      <ProductModalOverView
        isOpen={isProductOverviewOpen}
        onClose={() => setIsProductOverviewOpen(false)}
        product={editingProduct}
      />
    </div>
  );
}