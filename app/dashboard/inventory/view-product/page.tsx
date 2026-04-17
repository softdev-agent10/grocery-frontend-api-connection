"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  X,
  Check,
  Package,
  Lock,
  FileText,
  Table as TableIcon,
  Clock,
  AlertCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import HistoryModal, { HistoryItem as HistoryItemType } from "@/components/history-modal";
import DownloadModal from "@/components/download-modal";
import { ProductModal, ProductFormData } from "@/components/ProductModal";
import {
  AddButton,
  EditButton,
  DeleteButton,
  DownloadButton,
  FilterButton,
  HistoryButton
} from "@/components/toolbar-buttons";
import { generatePDFWithLogo, generateCSV } from "@/lib/pdf-export";
import { get } from "http";
import ProductModalOverView from "@/components/ProductModalOverView";
import { getCategories } from "@/app/services/categories/service.categories";
import { getBrands } from "@/app/services/brand/brand.service";
import { getProducts, getProductById, createProduct, updateProduct } from "@/app/services/product/service.product";
import SkeletonTable from "@/components/dashboard/SkeletonTable/SkeletonTable";
import loading from "@/app/loading";
import { se } from "date-fns/locale";
import { s } from "framer-motion/client";

type Product = {
  id: number;
  name: string;
  upc: string;
  category: Category;
  brand: Brand;
  selling_price: string;
  quantity: number;
  in_stock: boolean;
  plu: string | null;
};



type Category = {
  id: number;
  name: string;
};

type Brand = {
  id: number;
  name: string;
};

interface HistoryItem {
  id: string;
  action: "Add" | "Edit" | "Delete";
  details: string;
  timestamp: string;
}

interface TableViewColumns {
  checkbox: boolean;
  name: boolean;
  upc: boolean;
  plu: boolean;
  category: boolean;
  brand: boolean;
  selling_price: boolean;
  quantity: boolean;
  in_stock: boolean;
}


export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProductOverviewOpen, setIsProductOverviewOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [visibleColumns, setVisibleColumns] = useState<TableViewColumns>({
    checkbox: true,
    name: true,
    upc: true,
    plu: true,
    category: true,
    brand: true,
    selling_price: true,
    quantity: true,
    in_stock: true,
  });

  // Pagination & Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalProducts, setTotalProducts] = useState(0);

  const [tempColumns, setTempColumns] = useState<TableViewColumns>(visibleColumns);
  const [tempItemsPerPage, setTempItemsPerPage] = useState(itemsPerPage);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    product?: Product;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    product: undefined,
    onConfirm: () => { },
  });
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product | 'none', direction: 'asc' | 'desc' }>({ key: 'none', direction: 'asc' });

  // Form state
  const [formData, setFormData] = useState<Partial<ProductFormData>>({
    name: "",
    category_id: 0,
    brand_id: 0,
    unit_id: 0,
    upc_code: "",
    plu_code: "",
    description: "",
    buying_price: 0,
    selling_price: 0,
    custom_price: 0,
    quantity: 0,
    quantity_alert: 0,
    discount: 0,
    age_verification: false,
    ebt_eligible: false,
    sold_by_weight: false,
    is_refundable: false,
    warranty_period: "",
    warranty_description: "",
    manufacturer_date: "",
    expiration_date: "",
    image_url: undefined,
    is_available: true,
  });

  const addHistory = (action: string, details: string) => {
    const mapAction = (act: string): "Add" | "Edit" | "Delete" => {
      if (act === "Add") return "Add";
      if (act === "Delete" || act === "Bulk Delete") return "Delete";
      return "Edit";
    };

    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      action: mapAction(action),
      details,
      timestamp: new Date().toLocaleString()
    };
    setHistory(prev => [newItem, ...prev].slice(0, 50));
  };

  const handleEditModalOpen = () => {
    setTempColumns(visibleColumns);
    setTempItemsPerPage(itemsPerPage);
    setIsEditModalOpen(true);
  };

  // Apply changes and persist to localStorage
  const handleApplyTableChanges = () => {
    setVisibleColumns(tempColumns);
    setItemsPerPage(tempItemsPerPage);
    localStorage.setItem(
      "tableSettingsProductsView",
      JSON.stringify({
        columns: tempColumns,
        itemsPerPage: tempItemsPerPage,
      })
    );
    setIsEditModalOpen(false);
  };



  // Reset to defaults and clear localStorage
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
    localStorage.removeItem("tableSettingsProductsView");
  };

  // Calculate total pages from API total count
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  // Use products directly from API (already paginated server-side)
  const paginatedProducts = products;


  /**
   * Fetch products from API with filters and pagination
   */
  const loadProducts = async (searchTerm = "", categoryId?: number) => {
    try {
      setLoading(true);
      const response = await getProducts({
        branchId: "1234567890",
        token: "your_token_here",
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        category_id: categoryId || undefined,
        sort_by: sortConfig.key !== 'none' ? (sortConfig.key === 'selling_price' ? 'selling_price' : sortConfig.key === 'quantity' ? 'quantity' : sortConfig.key) : 'name',
        sort_order: sortConfig.direction,
      });

      const productsData = response.data.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        upc: item.upc,
        category: { id: item.category.id, name: item.category.name },
        brand: { id: item.brand.id, name: item.brand.name },
        selling_price: typeof item.selling_price === 'number' ? `$${item.selling_price.toFixed(2)}` : item.selling_price,
        quantity: item.quantity,
        in_stock: item.in_stock,
        plu: item.plu,
      }));

      setProducts(productsData);
      setTotalProducts(response.data.pagination?.total_items || 0);
      setLoading(false);
      console.log("✅ Products loaded:", {
        count: productsData.length,
        totalProducts: response.data.pagination?.total_items,
        currentPage: response.data.pagination?.current_page,
        perPage: response.data.pagination?.per_page,
        totalPages: response.data.pagination?.total_pages,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  const fetchData = async () => {
    const catRes = await getCategories({ branchId: 1234567890, token: 'your_token_here' });
    const brandRes = await getBrands({ branchId: 1234567890, token: 'your_token_here' });

    setCategories(catRes.data.items);
    setBrands(brandRes.data.items);
  };


  // Reset page when filters/search change
  useEffect(() => {
    fetchData();
    setCurrentPage(1);
  }, [searchQuery, sortConfig]);

  // Reload products when page or items per page changes
  useEffect(() => {
    loadProducts(searchQuery);
  }, [searchQuery, sortConfig]);

  // Reload products when page changes
  useEffect(() => {
    if (currentPage >= 1) {
      loadProducts(searchQuery);
    }
  }, [currentPage, itemsPerPage]);

  // Initial load on component mount
  useEffect(() => {
    console.log("Component mounted, loading initial data...");
    fetchData();
    loadProducts("");
  }, []);


  /**
   * Handle window resize events to adjust visible columns
   */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1280) {
        setVisibleColumns(prev => ({
          ...prev,
          plu: false,
          brand: false,
          category: true,
          upc: false,
        }));
      } else {
        setVisibleColumns({
          checkbox: true,
          name: true,
          upc: true,
          plu: true,
          category: true,
          brand: true,
          selling_price: true,
          quantity: true,
          in_stock: true,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /**
   * Load table settings from localStorage on mount
   */
  useEffect(() => {
    const savedSettings = localStorage.getItem("tableSettingsProductsView");

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);

        if (parsed.columns) {
          setVisibleColumns(parsed.columns);
          setTempColumns(parsed.columns);
        }

        if (parsed.itemsPerPage) {
          setItemsPerPage(parsed.itemsPerPage);
          setTempItemsPerPage(parsed.itemsPerPage);
        }
      } catch (error) {
        console.error("Failed to parse table settings:", error);
      }
    }
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedProducts.map(p => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDelete = (id: number) => {
    const product = products.find(p => p.id === id);
    if (product) {
      setConfirmModal({
        isOpen: true,
        title: "Delete Product",
        message: `Are you sure you want to delete this product? This action cannot be undone.`,
        product: product,
        onConfirm: () => {
          setProducts(prev => prev.filter(p => p.id !== id));
          addHistory("Delete", `Deleted product: ${product.name}`);
          setSelectedIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setConfirmModal({
      isOpen: true,
      title: "Bulk Delete",
      message: `Are you sure you want to delete ${selectedIds.size} selected products? This action cannot be undone.`,
      onConfirm: () => {
        const deletedCount = selectedIds.size;
        setProducts(prev => prev.filter(p => !selectedIds.has(p.id)));
        addHistory("Bulk Delete", `Deleted ${deletedCount} products`);
        setSelectedIds(new Set());
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleOpenModal = async (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      try {
        setLoading(true);
        const branchId = "1234567890";
        const token = "your_token_here";

        // Fetch full product details by ID
        const response = await getProductById({ branchId, token, productId: product.id });
        const fullProduct = response.data;

        // Format the fetched product data into form structure
        const formattedData: ProductFormData = {
          id: fullProduct.id,
          name: fullProduct.name || '',
          category_id: fullProduct.category?.id || 0,
          brand_id: fullProduct.brand?.id || 0,
          unit_id: fullProduct.unit?.id || 0,
          upc_code: fullProduct.upc || '',
          plu_code: fullProduct.plu || '',
          description: fullProduct.description || '',
          buying_price: Number(fullProduct.buying_price) || 0,
          selling_price: Number(fullProduct.selling_price) || 0,
          custom_price: Number(fullProduct.custom_price) || 0,
          quantity: Number(fullProduct.quantity) || 0,
          quantity_alert: Number(fullProduct.quantity_alert) || 0,
          discount: Number(fullProduct.discount) || 0,
          age_verification: fullProduct.age_verification || false,
          ebt_eligible: fullProduct.ebt_eligible || false,
          sold_by_weight: fullProduct.sold_by_weight || false,
          is_refundable: fullProduct.is_refundable || false,
          warranty_period: fullProduct.warranty_period || '',
          warranty_description: fullProduct.warranty_description || '',
          manufacturer_date: fullProduct.manufacturer_date || '',
          expiration_date: fullProduct.expiration_date || '',
          image_url: fullProduct.image_url || undefined,
          is_available: fullProduct.is_available || true,
        };

        setFormData(formattedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product details:", error);
        setLoading(false);
        // Fall back to using the basic product data
        setFormData({
          id: product.id,
          name: product.name,
          category_id: product.category.id,
          brand_id: product.brand.id,
          unit_id: 0,
          upc_code: product.upc,
          plu_code: product.plu || '',
          description: '',
          buying_price: 0,
          selling_price: Number(product.selling_price.replace('$', '').replace(',', '')),
          custom_price: 0,
          quantity: product.quantity,
          quantity_alert: 0,
          discount: 0,
          age_verification: false,
          ebt_eligible: false,
          sold_by_weight: false,
          is_refundable: false,
          warranty_period: '',
          warranty_description: '',
          manufacturer_date: '',
          expiration_date: '',
          image_url: undefined,
          is_available: product.in_stock,
        });
      }
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        category_id: 0,
        brand_id: 0,
        unit_id: 0,
        upc_code: "",
        plu_code: "",
        description: "",
        buying_price: 0,
        selling_price: 0,
        custom_price: 0,
        quantity: 0,
        quantity_alert: 0,
        discount: 0,
        age_verification: false,
        ebt_eligible: false,
        sold_by_weight: false,
        is_refundable: false,
        warranty_period: "",
        warranty_description: "",
        manufacturer_date: "",
        expiration_date: "",
        image_url: undefined,
        is_available: true,
      });
    }
    setValidationErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...formData } as Product : p));
      addHistory("Edit", `Updated product: ${formData.name}`);
    } else {
      const newProduct: Product = {
        id: Math.max(0, ...products.map(p => p.id)) + 1,
        ...(formData as unknown as Omit<Product, "id">)
      };
      setProducts([...products, newProduct]);
      addHistory("Add", `Created new product: ${formData.name}`);
    }
    setIsModalOpen(false);
  };

  const downloadCSV = (scope: 'current' | 'all') => {
    // With server-side pagination, only current page data is available
    const dataToExport = paginatedProducts;
    const headers = ["ID", "Name", "UPC", "PLU", "Category", "Brand", "Buying Price", "Selling Price", "Quantity", "Status"];
    const rows = dataToExport.map(p => [
      p.id,
      p.name,
      p.upc as string,
      p.plu as string || 'N/A',
      p.category.name,
      p.brand.name,
      'N/A', // Buying price not available in list view
      p.selling_price,
      p.quantity,
      p.in_stock ? "In Stock" : "Out of Stock"
    ]);

    generateCSV(headers, rows, `products_page-${currentPage}_${new Date().getTime()}.csv`);
    addHistory("Download", `Exported current page (page ${currentPage}) products as CSV`);
    setIsDownloadModalOpen(false);
  };

  const downloadPDF = (scope: 'current' | 'all') => {
    // With server-side pagination, only current page data is available
    const dataToExport = paginatedProducts;
    const columns = ["ID", "Name", "UPC", "PLU", "Category", "Brand", "Selling Price", "Quantity", "Status"];
    const rows = dataToExport.map(p => [
      p.id,
      p.name,
      p.upc as string,
      p.plu || 'N/A',
      p.category.name,
      p.brand.name,
      p.selling_price,
      p.quantity,
      p.in_stock ? "In Stock" : "Out of Stock"
    ]);

    generatePDFWithLogo({
      title: `Product Inventory Report (Current Page)`,
      columns,
      rows,
      fileName: `products_page-${currentPage}_${new Date().getTime()}.pdf`,
      scope: 'current'
    });

    addHistory("Download", `Exported current page products as PDF`);
    setIsDownloadModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      {/* Header Section */}
      <section className=" rounded-2xl border-b border-slate-200 bg-white  mt-0">
        <header className="bg-blue-600 rounded-2xl px-6 py-8 flex justify-between items-center shadow-lg relative overflow-hidden ">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[120%] bg-white rotate-12 blur-3xl rounded-full" />
          </div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="relative z-10"
          >
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
              products
            </h1>

          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-white relative z-10"
          >
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md border  border-white/30 shadow-xl">
              <Package size={40} strokeWidth={2} />
            </div>
          </motion.div>
        </header>
        <div className="bg-white p-4 shadow-xl  rounded-2xl mt-4 border border-slate-200 flex flex-row items-center gap-2 ">
          <AddButton onClick={() => handleOpenModal()} label="Add" />
          {/* Download Dropdown */}
          <div className="relative">
            <DownloadButton onClick={() => setIsDownloadModalOpen(true)} />

            <DownloadModal
              isOpen={isDownloadModalOpen}
              onClose={() => setIsDownloadModalOpen(false)}
              onDownload={(scope, format) => {
                if (format === 'pdf') downloadPDF(scope);
                else downloadCSV(scope);
              }}
              title="Export Products"
              subtitle="Choose your preferred format"
            />
          </div>

          {/* Filter Section - Using Custom Filter Component */}
          <div className="relative">
            <FilterButton onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} />

            <AnimatePresence>
              {isFilterMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsFilterMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 z-20 overflow-hidden max-h-[80vh] overflow-y-auto"
                  >
                    <div className="p-3 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Status</div>
                    {["All", "In Stock", "Out of Stock"].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setFilterStatus(status);
                          setIsFilterMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xl font-semibold transition-colors ${filterStatus === status ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                      >
                        {status} {filterStatus === status && <Check size={16} />}
                      </button>
                    ))}

                    <div className="p-3 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b   border-t border-slate-100">Sort By</div>
                    {[
                      { label: "Name (A-Z)", key: "name", dir: "asc" },
                      { label: "Name (Z-A)", key: "name", dir: "desc" },
                      { label: "Price (Low to High)", key: "price", dir: "asc" },
                      { label: "Price (High to Low)", key: "price", dir: "desc" },
                      { label: "Quantity (Low to High)", key: "qty", dir: "asc" },
                      { label: "Quantity (High to Low)", key: "qty", dir: "desc" },
                      { label: "UPC (Ascending)", key: "upc", dir: "asc" },
                      { label: "UPC (Descending)", key: "upc", dir: "desc" },
                    ].map((sort) => (
                      <button
                        key={sort.label}
                        onClick={() => {
                          setSortConfig({ key: sort.key as any, direction: sort.dir as any });
                          setIsFilterMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xl font-semibold transition-colors ${sortConfig.key === sort.key && sortConfig.direction === sort.dir ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                      >
                        {sort.label} {sortConfig.key === sort.key && sortConfig.direction === sort.dir && <Check size={16} />}
                      </button>
                    ))}

                    <button
                      onClick={() => {
                        setFilterStatus("All");
                        setSortConfig({ key: 'none', direction: 'asc' });
                        setSearchQuery("");
                        setIsFilterMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors border-t border-slate-100"
                    >
                      <X size={16} /> Reset Filters
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <EditButton
            onClick={handleEditModalOpen}
            variant="text"
            size="md"
          />

          <DeleteButton
            onClick={handleBulkDelete}
            disabled={selectedIds.size === 0}
            count={selectedIds.size}
          />

          <div className="flex-grow:1 max-w-md ml-auto flex relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search by name, UPC, brand..."
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <HistoryButton onClick={() => setIsHistoryOpen(true)} />
        </div>
      </section>
      {/* Toolbar Section */}
      <div className="p-4 space-y-8">
        {/* Table Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 "
        >
          <div className="overflow-x-auto rounded-2xl">
            <table className="w-full text-left border-collapse ">
              <thead  >
                <tr className="bg-blue-600 border-b border-slate-100">
                  {visibleColumns.checkbox && (
                    <th className="p-6 w-12">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded-lg bg-blue-600 border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={paginatedProducts.length > 0 && selectedIds.size === paginatedProducts.length}
                          onChange={handleSelectAll}
                        />
                      </div>
                    </th>
                  )}
                  {visibleColumns.name && (
                    <th className="p-6 font-bold text-xs uppercase tracking-widest text-white">Product Name</th>
                  )}
                  {visibleColumns.upc && (
                    <th className="p-6 font-bold text-xs uppercase tracking-widest  text-white">UPC</th>
                  )}
                  {visibleColumns.plu && (
                    <th className="p-6 font-bold text-xs uppercase tracking-widest  text-white">PLU</th>
                  )}
                  {visibleColumns.category && (
                    <th className="p-6 font-bold text-xs uppercase tracking-widest  text-white">Category</th>
                  )}
                  {visibleColumns.brand && (
                    <th className="p-6 font-bold text-xs uppercase tracking-widest  text-white">Brand</th>
                  )}
                  {visibleColumns.selling_price && (
                    <th className="p-6 font-bold text-xs uppercase tracking-widest  text-white">Selling Price</th>
                  )}
                  {visibleColumns.quantity && (
                    <th className="p-6 font-bold text-xs uppercase tracking-widest  text-white text-center">Quantity</th>
                  )}
                  {visibleColumns.in_stock && (
                    <th className="p-6 font-bold text-xs uppercase tracking-widest  text-white">Status</th>
                  )}
                  <th className="p-6 font-bold text-xs uppercase tracking-widest  text-white text-center">Action</th>
                </tr>
              </thead>
              {loading ? (
                <tbody>
                  <SkeletonTable
                    rows={paginatedProducts.length || itemsPerPage}
                    columns={
                      Object.values(visibleColumns).filter(Boolean).length
                    }
                    showCheckbox={visibleColumns.checkbox}
                  />
                </tbody>
              ) : (
                <tbody className="divide-y divide-slate-50">
                  {paginatedProducts.length > 0 ? (
                    paginatedProducts.map((product, index) => (
                      <motion.tr
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={product.id}
                        className="hover:bg-blue-50/30 transition-colors group"
                      >
                        {visibleColumns.checkbox && (
                          <td className="p-6">
                            <div className="flex items-center justify-center">
                              <input
                                type="checkbox"
                                className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                checked={selectedIds.has(product.id)}
                                onChange={() => handleSelectOne(product.id)}
                              />
                            </div>
                          </td>
                        )}
                        {visibleColumns.name && (
                          <td className="p-6">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{product.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono mt-0.5">ID: #{product.id.toString().padStart(4, '0')}</span>
                            </div>
                          </td>
                        )}
                        {visibleColumns.upc && (
                          <td className="p-6 text-slate-600 font-mono text-md">{product.upc}</td>
                        )}
                        {visibleColumns.plu && (
                          <td className="p-6 text-slate-600 font-mono text-md">{product.plu}</td>
                        )}
                        {visibleColumns.category && (
                          <td className="p-6">
                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                              {product.category.name}
                            </span>
                          </td>
                        )}
                        {visibleColumns.brand && (
                          <td className="p-6 text-slate-600 font-medium">{product.brand.name}</td>
                        )}
                        {visibleColumns.selling_price && (
                          <td className="p-6 font-black text-slate-900">{product.selling_price}</td>
                        )}
                        {visibleColumns.quantity && (
                          <td className="p-6 text-center">
                            <span className={`font-bold ${product.quantity < 5 ? 'text-red-500' : 'text-slate-700'}`}>
                              {product.quantity.toFixed(2)}
                            </span>
                          </td>
                        )}
                        {visibleColumns.in_stock && (
                          <td className="p-6">
                            <div>
                              <div className={`flex items-center justify-center  ${product.in_stock ? 'bg-green-100' : 'bg-red-100'
                                } rounded-full px-1 py-1 border ${product.in_stock ? 'border-green-200' : 'border-red-200'
                                } gap-2 text-xs  ${product.in_stock ? 'text-green-900' : 'text-red-900'
                                }`}>
                                <p className="text-wrap text-center">{product.in_stock ? 'In Stock' : 'Out of Stock'}</p>
                              </div>
                            </div>
                          </td>
                        )}
                        <td className="p-6">
                          <div className="flex justify-center items-center gap-3">
                            <div className="bg-slate-200 rounded-full px-2 py-2 w-10 h-10 flex items-center justify-center  group-hover:opacity-100 transition-opacity">
                              <motion.button
                                whileHover={{ scale: 1.2, rotate: 5 }}
                                className="text-slate-400 hover:text-blue-500 transition-colors"
                                onClick={() => {
                                  setIsProductOverviewOpen(true); setEditingProduct(product);
                                }}
                              >
                                <Eye size={25} />
                              </motion.button>
                            </div>
                            <div className="bg-slate-200 rounded-full px-2 py-2 w-10 h-10 flex items-center justify-center  group-hover:opacity-100 transition-opacity">
                              <EditButton
                                onClick={() => handleOpenModal(product)}
                                variant="icon"
                                size="lg"
                              />
                            </div>
                            <div className="bg-slate-200 rounded-full px-2 py-2 w-10 h-10 flex items-center justify-center disabled:not-first:not-even:  group-hover:opacity-100 transition-opacity">
                              <DeleteButton
                                disabled={true}
                                onClick={() => handleDelete(product.id)}
                                variant="icon"
                                size="lg"
                              />
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={11} className="p-20 text-center">
                        <div className="flex flex-col items-center gap-4 text-slate-400">
                          <AlertCircle size={48} strokeWidth={1} />
                          <p className="text-lg font-medium italic">No products found matching your search.</p>
                          <button
                            onClick={() => { setSearchQuery(""); setFilterStatus("All"); }}
                            className="text-blue-600 font-bold hover:underline"
                          >
                            Clear all filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              )}
            </table>
          </div>
        </motion.div>

        {/* Pagination Section */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50">
          <div className="text-xl font-bold text-slate-500 uppercase tracking-widest">
            Showing <span className="text-blue-600">{paginatedProducts.length}</span> of <span className="text-slate-800">{totalProducts}</span> products
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mr-4">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  const newItemsPerPage = Number(e.target.value);
                  setItemsPerPage(newItemsPerPage);
                  setCurrentPage(1);
                  // Save to localStorage
                  const savedSettings = localStorage.getItem("tableSettingsProductsView");
                  const settings = savedSettings ? JSON.parse(savedSettings) : { columns: visibleColumns };
                  localStorage.setItem("tableSettingsProductsView", JSON.stringify({ ...settings, itemsPerPage: newItemsPerPage }));
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
              >
                {[5, 10, 20, 50].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <motion.button
                whileHover={currentPage > 1 ? { scale: 1.1 } : {}}
                whileTap={currentPage > 1 ? { scale: 0.9 } : {}}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-xl border transition-all ${currentPage === 1
                  ? "border-slate-100 text-slate-300 cursor-not-allowed"
                  : "border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600"
                  }`}
              >
                <ChevronDown size={20} className="rotate-90" />
              </motion.button>

              <div className="flex items-center gap-1">
                {(() => {
                  // Generate page numbers to display with ellipsis
                  const pages: (number | string)[] = [];
                  const maxPagesToShow = 5; // Show max 5 page buttons

                  if (totalPages <= maxPagesToShow) {
                    // Show all pages if less than max
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // Always show first page
                    pages.push(1);

                    // Calculate range around current page
                    const start = Math.max(2, currentPage - 1);
                    const end = Math.min(totalPages - 1, currentPage + 1);

                    // Add ellipsis before if needed
                    if (start > 2) {
                      pages.push('...');
                    }

                    // Add pages around current
                    for (let i = start; i <= end; i++) {
                      if (!pages.includes(i)) {
                        pages.push(i);
                      }
                    }

                    // Add ellipsis after if needed
                    if (end < totalPages - 1) {
                      pages.push('...');
                    }

                    // Always show last page
                    if (!pages.includes(totalPages)) {
                      pages.push(totalPages);
                    }
                  }

                  return pages.map((page, idx) => (
                    page === '...' ? (
                      <span key={`ellipsis-${idx}`} className="text-slate-400 px-1">...</span>
                    ) : (
                      <motion.button
                        key={page}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCurrentPage(page as number)}
                        className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${currentPage === page
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                          : "text-slate-500 hover:bg-slate-50"
                          }`}
                      >
                        {page}
                      </motion.button>
                    )
                  ));
                })()}
              </div>

              <motion.button
                whileHover={currentPage < totalPages ? { scale: 1.1 } : {}}
                whileTap={currentPage < totalPages ? { scale: 0.9 } : {}}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`p-2 rounded-xl border transition-all ${currentPage === totalPages || totalPages === 0
                  ? "border-slate-100 text-slate-300 cursor-not-allowed"
                  : "border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600"
                  }`}
              >
                <ChevronDown size={20} className="-rotate-90" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Section */}
      <ProductModal
        title={editingProduct ? "Edit Product" : "Add Product"}
        subtitle={editingProduct ? "Update product information" : "Add new product to inventory"}
        isOpen={isModalOpen}
        isEditing={editingProduct !== null}
        product={editingProduct ? (formData as unknown as ProductFormData) : undefined}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
          setValidationErrors({});
        }}
        onSave={async (data) => {
          try {
            const branchId = "1234567890";
            const token = "your_token_here";

            // Helper to format dates
            const formatDateToISO = (dateStr: string | Date): string => {
              if (!dateStr) return new Date().toISOString().split('T')[0];
              const dateObj = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
              return dateObj.toISOString().split('T')[0];
            };

            // Construct payload (validation already done by ProductModal)
            const payload = {
              name: data.name?.trim() || '',
              category_id: Number(data.category_id) || 0,
              brand_id: Number(data.brand_id) || 0,
              unit_id: Number(data.unit_id) || 0,
              upc_code: data.upc_code?.trim() || '',
              plu_code: data.plu_code?.trim() || '',
              description: data.description?.trim() || '',
              buying_price: Number(data.buying_price) || 0,
              selling_price: Number(data.selling_price) || 0,
              custom_price: Number(data.custom_price) || 0,
              quantity: Number(data.quantity) || 0,
              quantity_alert: Number(data.quantity_alert) || 0,
              discount: Number(data.discount) || 0,
              age_verification: Boolean(data.age_verification),
              ebt_eligible: Boolean(data.ebt_eligible),
              sold_by_weight: Boolean(data.sold_by_weight),
              is_refundable: Boolean(data.is_refundable),
              warranty_period: data.warranty_period?.trim() || '',
              warranty_description: data.warranty_description?.trim() || '',
              manufacturer_date: formatDateToISO(data.manufacturer_date),
              expiration_date: formatDateToISO(data.expiration_date),
              image_url: data.image_url || undefined,
              is_available: Boolean(data.is_available),
            };

            console.log("Payload being sent:", JSON.stringify(payload, null, 2));

            if (editingProduct && data.id) {
              // Update existing product (PATCH)
              const response = await updateProduct({
                branchId,
                token,
                productId: data.id,
                data: payload,
              });

              console.log("Product updated:", response);

              // Update local state
              setProducts((prev) =>
                prev.map((p) =>
                  p.id === data.id
                    ? {
                      ...p,
                      name: data.name,
                      upc: data.upc_code,
                      plu: data.plu_code || null,
                      category: {
                        id: data.category_id,
                        name:
                          categories.find(c => c.id === data.category_id)?.name || '',
                      },
                      brand: {
                        id: data.brand_id,
                        name:
                          brands.find(b => b.id === data.brand_id)?.name || '',
                      },
                      selling_price: String(data.selling_price),
                      quantity: data.quantity,
                      in_stock: data.is_available,
                    }
                    : p
                )
              );

              addHistory("Edit", `Updated product: ${data.name}`);
            } else {
              // Create new product (POST)
              const response = await createProduct({
                branchId,
                token,
                data: payload,
              });

              console.log("Product created:", response);

              // Add to local state
              const newProduct: Product = {
                id: response.data.id || Math.max(0, ...products.map((p) => p.id)) + 1,
                name: data.name,
                upc: data.upc_code,
                plu: data.plu_code || null,
                category: {
                  id: data.category_id,
                  name:
                    categories.find(c => c.id === data.category_id)?.name || '',
                },
                brand: {
                  id: data.brand_id,
                  name:
                    brands.find(b => b.id === data.brand_id)?.name || '',
                },
                selling_price: String(data.selling_price),
                quantity: data.quantity,
                in_stock: data.is_available,
              };

              setProducts((prev) => [...prev, newProduct]);
              addHistory("Add", `Created new product: ${data.name}`);
            }

            // Close modal on success
            setIsModalOpen(false);
            setEditingProduct(null);
            setValidationErrors({});
          } catch (error: any) {
            console.error("Product save error:", error.message);
            console.error("Full error:", error);

            // Re-throw error so ProductModal can catch and display it
            throw error;
          }
        }}
      />



      {/* Edit Table View Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border">
              <div className="p-6 border-b flex justify-between items-center bg-zinc-50">
                <h2 className="font-bold text-lg">Edit Table View</h2>
                <button onClick={() => setIsEditModalOpen(false)}><X size={20} /></button>
              </div>
              <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
                {/* Table View Columns */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-600 uppercase block">TABLE VIEW</label>
                  {(Object.keys(tempColumns) as Array<keyof TableViewColumns>).map(col => (
                    <label key={col} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempColumns[col]}
                        onChange={() => setTempColumns({ ...tempColumns, [col]: !tempColumns[col] })}
                        className="w-5 h-5 rounded cursor-pointer accent-blue-600"
                      />
                      <span className="text-xl capitalize">
                        {col === 'checkbox' ? 'Checkbox' : col === 'name' ? 'Product Name' : col === 'upc' ? 'UPC' : col === 'category' ? 'Category' : col === 'brand' ? 'Brand' : col === 'selling_price' ? 'Pricing' : col === 'in_stock' ? 'Unit' : col === 'quantity' ? 'QTY' : 'Status'}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Items Per Page */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-600 uppercase block">ITEMS PER PAGE</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[5, 10, 15, 25, 50].map(num => (
                      <label key={num} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="itemsPerPage"
                          value={num}
                          checked={tempItemsPerPage === num}
                          onChange={() => setTempItemsPerPage(num)}
                          className="w-5 h-5 cursor-pointer accent-blue-600"
                        />
                        <span className="text-xl">{num}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="p-6 border-t space-y-3 bg-zinc-50">
                <button
                  onClick={handleApplyTableChanges}
                  className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 shadow-md"
                >
                  <Check size={18} /> Apply
                </button>
                <button
                  onClick={handleResetTableDefaults}
                  className="w-full py-2.5 bg-zinc-100 text-zinc-700 font-semibold rounded-lg hover:bg-zinc-200 flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} /> Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20"
            >
              {/* Header */}
              <div className="bg-red-50 p-8 border-b border-red-100">
                <div className="flex items-center gap-4 text-red-500 mb-2">
                  <div className="bg-red-100 p-3 rounded-2xl">
                    <AlertCircle size={32} />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">{confirmModal.title}</h2>
                </div>
                <p className="text-slate-600 text-xl ml-16">{confirmModal.message}</p>
              </div>

              {/* Product Details */}
              {confirmModal.product && (
                <div className="p-8 space-y-4 bg-white border-b border-slate-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Product Name</p>
                      <p className="text-base font-bold text-slate-900">{confirmModal.product.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Category</p>
                      <p className="text-base font-bold text-slate-900">{confirmModal.product.category.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Price</p>
                      <p className="text-base font-bold text-slate-900">{confirmModal.product.selling_price}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Quantity</p>
                      <p className="text-base font-bold text-slate-900">{confirmModal.product.quantity}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Brand</p>
                      <p className="text-base font-bold text-slate-900">{confirmModal.product.brand.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Unit</p>
                      <p className="text-base font-bold text-slate-900">{confirmModal.product.plu}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">UPC/PLU Code</p>
                    <p className="text-base font-mono text-slate-700">{confirmModal.product.upc}</p>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="p-6 bg-slate-50 flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-2xl font-bold uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmModal.onConfirm}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-100"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Modal Section */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        title="Activity Log"
        subtitle="Recent inventory actions"
      />

      <ProductModalOverView
        isOpen={isProductOverviewOpen}
        onClose={() => setIsProductOverviewOpen(false)}
        product={products.find(p => p.id === editingProduct?.id) || null}
        title="Product Overview"
        subtitle="Full details of the selected product"
      />
    </div>
  );
}


