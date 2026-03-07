"use client";

import React, { useState } from "react";
import {
  Plus,
  Calendar,
  Percent,
  Settings2,
  LayoutGrid,
  Gift,
  Save,
  AlertCircle,
  Calculator,
  Trash2,
  Edit2,
  Search,
  Check,
  X,
  ShoppingCart,
  ArrowRight,
  Package,
  Sparkles,
  Layout,
  Bell,
  User,
  Tag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types & Enums ---

enum PromotionType {
  BOGO = "BOGO",
  BUNDLE = "BUNDLE",
}

enum PromotionStatus {
  Inactive = "Inactive",
  Active = "Active",
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  upc?: string;
  plu?: string;
}

interface BundleItem {
  productId: string;
  quantity: number;
  originalPrice: number;
  newPrice: number;
  isCustomPrice: boolean;
}

interface Promotion {
  id: string;
  type: PromotionType;
  title: string;
  buyProductId?: string;
  buyQuantity?: number;
  getProductId?: string;
  getQuantity?: number;
  bundleItems?: BundleItem[];
  startDate: string;
  endDate: string;
  status: PromotionStatus;
  createdAt: string;
  createdBy: string;
}

interface PromotionFormData {
  type: PromotionType;
  title: string;
  buyProductId: string;
  buyQuantity: number;
  getProductId: string;
  getQuantity: number;
  bundleItems: BundleItem[];
  startDate: string;
  endDate: string;
  status: PromotionStatus;
}

// --- Mock Data ---

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    price: 199.99,
    image: "https://picsum.photos/seed/headphones/400/400",
    category: "Electronics",
    upc: "880123456789",
    plu: "1001",
  },
  {
    id: "2",
    name: "Ergonomic Mechanical Keyboard",
    price: 129.5,
    image: "https://picsum.photos/seed/keyboard/400/400",
    category: "Electronics",
    upc: "880123456790",
    plu: "1002",
  },
  {
    id: "3",
    name: "Ultra-Wide 4K Monitor",
    price: 449.0,
    image: "https://picsum.photos/seed/monitor/400/400",
    category: "Electronics",
    upc: "880123456791",
    plu: "1003",
  },
  {
    id: "4",
    name: "Minimalist Leather Backpack",
    price: 85.0,
    image: "https://picsum.photos/seed/backpack/400/400",
    category: "Accessories",
    upc: "880123456792",
    plu: "1004",
  },
  {
    id: "5",
    name: "Stainless Steel Water Bottle",
    price: 24.99,
    image: "https://picsum.photos/seed/bottle/400/400",
    category: "Lifestyle",
    upc: "880123456793",
    plu: "1005",
  },
  {
    id: "6",
    name: "Smart Fitness Tracker",
    price: 59.99,
    image: "https://picsum.photos/seed/watch/400/400",
    category: "Electronics",
    upc: "880123456794",
    plu: "1006",
  },
];

// --- Sub-components ---

const ProductSelector: React.FC<{
  label: string;
  selectedId: string;
  onSelect: (id: string) => void;
  placeholder?: string;
}> = ({ label, selectedId, onSelect, placeholder = "Select a product..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredProducts = MOCK_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.upc?.includes(search) ||
      p.plu?.includes(search)
  );

  const selectedProduct = MOCK_PRODUCTS.find((p) => p.id === selectedId);

  return (
    <div className="space-y-1.5 relative">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        >
          <div className="flex flex-col">
            <span className={selectedProduct ? "text-slate-900" : "text-slate-400"}>
              {selectedProduct ? selectedProduct.name : placeholder}
            </span>
            {selectedProduct && (
              <span className="text-[10px] text-slate-400">
                UPC: {selectedProduct.upc} | PLU: {selectedProduct.plu}
              </span>
            )}
          </div>
          <Search className="w-4 h-4 text-slate-400" />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
            <div className="p-2 border-b border-slate-100">
              <input
                autoFocus
                type="text"
                className="w-full px-3 py-1.5 text-sm bg-slate-50 border-none rounded-md focus:ring-0"
                placeholder="Search by Name, UPC, or PLU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    onSelect(product.id);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image}
                      alt=""
                      className="w-8 h-8 rounded object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-left">
                      <div className="font-medium text-slate-900">{product.name}</div>
                      <div className="text-[10px] text-slate-500">
                        UPC: {product.upc} | PLU: {product.plu}
                      </div>
                      <div className="text-xs text-slate-500 font-bold">
                        ${product.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  {selectedId === product.id && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
              {filteredProducts.length === 0 && (
                <div className="px-3 py-4 text-sm text-slate-500 text-center">
                  No products found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MultiProductSelector: React.FC<{
  label: string;
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
}> = ({ label, selectedIds, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredProducts = MOCK_PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleProduct = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelect(selectedIds.filter((i) => i !== id));
    } else {
      onSelect([...selectedIds, id]);
    }
  };

  const selectedProducts = MOCK_PRODUCTS.filter((p) =>
    selectedIds.includes(p.id)
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Add Products
        </button>
      </div>

      <div className="flex flex-wrap gap-2 min-h-[42px] p-2 bg-slate-50 border border-slate-200 rounded-lg">
        {selectedProducts.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-2 px-2 py-1 bg-white border border-slate-200 rounded-md shadow-sm"
          >
            <img
              src={product.image}
              alt=""
              className="w-5 h-5 rounded object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="text-xs font-medium text-slate-700">
              {product.name}
            </span>
            <button
              type="button"
              onClick={() => toggleProduct(product.id)}
              className="text-slate-400 hover:text-red-500 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {selectedProducts.length === 0 && (
          <span className="text-xs text-slate-400 italic flex items-center px-1">
            No products selected
          </span>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-[calc(100%-3rem)] max-w-md mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              type="text"
              className="w-full px-3 py-1.5 text-sm bg-slate-50 border-none rounded-md focus:ring-0"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => toggleProduct(product.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={product.image}
                    alt=""
                    className="w-8 h-8 rounded object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left">
                    <div className="font-medium text-slate-900">{product.name}</div>
                    <div className="text-xs text-slate-500">
                      ${product.price.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    selectedIds.includes(product.id)
                      ? "bg-blue-600 border-blue-600"
                      : "border-slate-300"
                  }`}
                >
                  {selectedIds.includes(product.id) && (
                    <Plus className="w-3 h-3 text-white rotate-45" />
                  )}
                </div>
              </button>
            ))}
          </div>
          <div className="p-2 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const PromotionForm: React.FC<{
  data: PromotionFormData;
  onChange: (data: PromotionFormData) => void;
  onSubmit: () => void;
}> = ({ data, onChange, onSubmit }) => {
  const beforeTotal = data.bundleItems.reduce(
    (sum, item) => sum + item.originalPrice * item.quantity,
    0
  );
  const afterTotal = data.bundleItems.reduce(
    (sum, item) => sum + item.newPrice * item.quantity,
    0
  );
  const savings = beforeTotal - afterTotal;

  const updateBundleItem = (productId: string, updates: Partial<BundleItem>) => {
    const newItems = data.bundleItems.map((item) => {
      if (item.productId === productId) {
        const updated = { ...item, ...updates };
        if (updates.isCustomPrice === false) {
          updated.newPrice = item.originalPrice;
        }
        return updated;
      }
      return item;
    });
    onChange({ ...data, bundleItems: newItems });
  };

  const handleBundleProductsChange = (ids: string[]) => {
    const newItems: BundleItem[] = ids.map((id) => {
      const existing = data.bundleItems.find((item) => item.productId === id);
      if (existing) return existing;

      const product = MOCK_PRODUCTS.find((p) => p.id === id);
      return {
        productId: id,
        quantity: 1,
        originalPrice: product?.price || 0,
        newPrice: product?.price || 0,
        isCustomPrice: false,
      };
    });
    onChange({ ...data, bundleItems: newItems });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 "
    >
      <motion.div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl text-white" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Create Promotion
          </h1>
          <p className="text-sm text-white/70 mt-1">
            Configure your marketing campaign details
          </p>
        </motion.div>
        <motion.div className="flex items-center gap-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              onChange({
                ...data,
                status:
                  data.status === PromotionStatus.Active
                    ? PromotionStatus.Inactive
                    : PromotionStatus.Active,
              })
            }
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              data.status === PromotionStatus.Active
                ? "bg-green-100 text-green-700 border border-green-200 shadow-lg shadow-green-500/20"
                : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            <motion.div
              animate={{ scale: data.status === PromotionStatus.LIVE ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`w-2 h-2 rounded-full ${
                data.status === PromotionStatus.Active
                  ? "bg-green-500"
                  : "bg-slate-400"
              }`}
            />
            {data.status}
          </motion.button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex p-1 bg-slate-100 rounded-xl gap-1"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange({ ...data, type: PromotionType.BOGO })}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
            data.type === PromotionType.BOGO
              ? "bg-white text-indigo-600 shadow-lg shadow-indigo-500/30 border border-indigo-200"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Gift className="w-4 h-4" />
          Buy 1 Get 1
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange({ ...data, type: PromotionType.BUNDLE })}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
            data.type === PromotionType.BUNDLE
              ? "bg-white text-indigo-600 shadow-lg shadow-indigo-500/30 border border-indigo-200"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          Product Bundle
        </motion.button>
      </motion.div>

      <div className="space-y-6">
        <section className="space-y-4">
          <motion.div
            className="flex items-center gap-2 text-slate-900"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Settings2 className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-900">
              General Configuration
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Promotion Title
              </label>
              <input
                type="text"
                placeholder="e.g. Summer Tech Extravaganza"
                className="w-full px-3 py-2 bg-white border border-indigo-200/50 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all hover:border-indigo-300/50"
                value={data.title}
                onChange={(e) => onChange({ ...data, title: e.target.value })}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 p-6 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 rounded-2xl border border-indigo-200/30 shadow-sm">
          <motion.div
            className="flex items-center gap-2 text-slate-900"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Plus className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-900">
              Product Selection
            </h2>
          </motion.div>

          {data.type === PromotionType.BOGO ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <ProductSelector
                    label="Buy Product (Name/UPC/PLU)"
                    selectedId={data.buyProductId}
                    onSelect={(id) =>
                      onChange({ ...data, buyProductId: id })
                    }
                    placeholder="Search buy product..."
                  />
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Buy Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      value={data.buyQuantity}
                      onChange={(e) =>
                        onChange({
                          ...data,
                          buyQuantity: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <ProductSelector
                    label="Get Product (Name/UPC/PLU)"
                    selectedId={data.getProductId}
                    onSelect={(id) =>
                      onChange({ ...data, getProductId: id })
                    }
                    placeholder="Search get product..."
                  />
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Get Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      value={data.getQuantity}
                      onChange={(e) =>
                        onChange({
                          ...data,
                          getQuantity: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <MultiProductSelector
                label="Bundle Products"
                selectedIds={data.bundleItems.map((i) => i.productId)}
                onSelect={handleBundleProductsChange}
              />

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="pb-3 pr-4">Product Name</th>
                      <th className="pb-3 px-4">Qty</th>
                      <th className="pb-3 px-4">Price</th>
                      <th className="pb-3 px-4">Pricing</th>
                      <th className="pb-3 px-4">New Price</th>
                      <th className="pb-3 pl-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.bundleItems.map((item) => {
                      const product = MOCK_PRODUCTS.find(
                        (p) => p.id === item.productId
                      );
                      return (
                        <tr key={item.productId} className="group">
                          <td className="py-4 pr-4">
                            <div className="font-bold text-slate-900">
                              {product?.name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              UPC: {product?.upc}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <input
                              type="number"
                              min="1"
                              className="w-16 px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                              value={item.quantity}
                              onChange={(e) =>
                                updateBundleItem(item.productId, {
                                  quantity: parseInt(e.target.value) || 1,
                                })
                              }
                            />
                          </td>
                          <td className="py-4 px-4 text-slate-500">
                            ${item.originalPrice.toFixed(2)}
                          </td>
                          <td className="py-4 px-4">
                            <select
                              className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium"
                              value={
                                item.isCustomPrice ? "custom" : "default"
                              }
                              onChange={(e) =>
                                updateBundleItem(item.productId, {
                                  isCustomPrice: e.target.value === "custom",
                                })
                              }
                            >
                              <option value="default">Default</option>
                              <option value="custom">Custom</option>
                            </select>
                          </td>
                          <td className="py-4 px-4">
                            <input
                              type="number"
                              disabled={!item.isCustomPrice}
                              className={`w-20 px-2 py-1 border rounded text-xs ${
                                item.isCustomPrice
                                  ? "bg-white border-blue-200"
                                  : "bg-slate-50 border-slate-100 text-slate-400"
                              }`}
                              value={item.newPrice}
                              onChange={(e) =>
                                updateBundleItem(item.productId, {
                                  newPrice: parseFloat(e.target.value) || 0,
                                })
                              }
                            />
                          </td>
                          <td className="py-4 pl-4 text-right font-bold text-slate-900">
                            ${(item.newPrice * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total Before:</span>
                    <span className="font-bold text-slate-900 line-through">
                      ${beforeTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total After:</span>
                    <span className="text-lg font-black text-blue-600">
                      ${afterTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Savings Summary
                    </div>
                    <div
                      className={`text-sm font-bold ${
                        savings > 0 ? "text-green-600" : "text-slate-400"
                      }`}
                    >
                      {savings > 0
                        ? `Total Bundle Savings: $${savings.toFixed(2)}`
                        : "No savings yet"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <motion.div
            className="flex items-center gap-2 text-slate-900"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Calendar className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-900">
              Promotion Period
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Start Promotion
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-white border border-indigo-200/50 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all hover:border-indigo-300/50"
                value={data.startDate}
                onChange={(e) =>
                  onChange({ ...data, startDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                End Promotion
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-white border border-indigo-200/50 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all hover:border-indigo-300/50"
                value={data.endDate}
                onChange={(e) => onChange({ ...data, endDate: e.target.value })}
              />
            </div>
          </div>
        </section>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-end">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(79, 70, 229, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onSubmit}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg shadow-indigo-500/30 border border-indigo-500/20"
          >
            <motion.div animate={{ rotate: 90 }} transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2 }}>
              <Plus className="w-4 h-4" />
            </motion.div>
            Create Promotion
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const PromotionPreview: React.FC<{ data: PromotionFormData }> = ({ data }) => {
  const buyProduct = MOCK_PRODUCTS.find((p) => p.id === data.buyProductId);
  const getProduct = MOCK_PRODUCTS.find((p) => p.id === data.getProductId);
  const bundleProducts = data.bundleItems.map((item) => ({
    ...MOCK_PRODUCTS.find((p) => p.id === item.productId)!,
    ...item,
  }));

  const beforeTotal = data.bundleItems.reduce(
    (sum, item) => sum + item.originalPrice * item.quantity,
    0
  );
  const afterTotal = data.bundleItems.reduce(
    (sum, item) => sum + item.newPrice * item.quantity,
    0
  );
  const savings = beforeTotal - afterTotal;
  const savingsPercentage =
    beforeTotal > 0 ? (savings / beforeTotal) * 100 : 0;

  return (
    <div className="sticky top-8">
      <div className="flex items-center gap-2 mb-4 text-slate-500">
        <Sparkles className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">
          Live Customer Preview
        </span>
      </div>

      <motion.div
        whileHover={{ boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.2)" }}
        transition={{ duration: 0.3 }}
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100/30 overflow-hidden"
      >
        <div className="bg-slate-900 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold tracking-tight">StoreFront</span>
          </div>
          <div className="flex gap-3">
            <div className="w-2 h-2 rounded-full bg-slate-700" />
            <div className="w-2 h-2 rounded-full bg-slate-700" />
            <div className="w-2 h-2 rounded-full bg-slate-700" />
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {data.type === PromotionType.BOGO ? (
              <motion.div
                key="bogo-preview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="relative group">
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter shadow-lg">
                      BUY {data.buyQuantity} GET {data.getQuantity} FREE
                    </span>
                  </div>
                  <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                    {buyProduct ? (
                      <img
                        src={buyProduct.image}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 italic text-sm">
                        Select buy product
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    {buyProduct ? buyProduct.name : "Product Title"}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">
                      ${buyProduct ? buyProduct.price.toFixed(2) : "0.00"}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      x {data.buyQuantity}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-lg border border-blue-200 overflow-hidden shrink-0">
                    {getProduct ? (
                      <img
                        src={getProduct.image}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100">
                        <Package className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      Bonus Gift
                    </div>
                    <div className="text-sm font-bold text-slate-900 truncate">
                      {getProduct ? getProduct.name : "Select free product"}
                    </div>
                    <div className="text-xs text-slate-500 line-through">
                      ${getProduct ? getProduct.price.toFixed(2) : "0.00"}
                    </div>
                  </div>
                  <div className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">
                    x {data.getQuantity} FREE
                  </div>
                </div>

                <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-[0.98]">
                  Add to Cart
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="bundle-preview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                    Frequently Bought Together
                  </h3>
                  {savings > 0 && (
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full">
                      Save {savingsPercentage.toFixed(0)}%
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {bundleProducts.length > 0 ? (
                    bundleProducts.map((p, idx) => (
                      <React.Fragment key={p.id}>
                        <div className="w-20 shrink-0 space-y-2">
                          <div className="aspect-square bg-slate-50 rounded-lg border border-slate-100 overflow-hidden relative">
                            <img
                              src={p.image}
                              alt=""
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute bottom-1 right-1 bg-slate-900 text-white text-[8px] font-bold px-1 rounded">
                              x{p.quantity}
                            </div>
                          </div>
                          <div className="text-[10px] font-medium text-slate-600 truncate">
                            {p.name}
                          </div>
                        </div>
                        {idx < bundleProducts.length - 1 && (
                          <div className="text-slate-300 font-bold text-xl shrink-0">
                            +
                          </div>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <div className="w-full py-8 text-center border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-xs italic">
                      Add products to build your bundle
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-medium text-slate-600">
                      Bundle Price
                    </span>
                    <div className="text-right">
                      <div className="text-xl font-black text-slate-900">
                        ${afterTotal.toFixed(2)}
                      </div>
                      {savings > 0 && (
                        <div className="text-[10px] text-slate-400 line-through">
                          ${beforeTotal.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="w-full py-3 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-[0.98]">
                    Add All to Cart
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400 justify-center">
                  <Tag className="w-3 h-3" />
                  <span>Limited time offer. Terms apply.</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

const PromotionList: React.FC<{
  promotions: Promotion[];
  onEdit: (promo: Promotion) => void;
  onDelete: (id: string) => void;
}> = ({ promotions, onEdit, onDelete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-indigo-100/30 overflow-hidden hover:shadow-indigo-500/10 transition-all"
    >
      <div className="p-6 border-b border-indigo-100/30 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 flex items-center justify-between">
        <h2 className="text-lg font-black text-indigo-900 tracking-tight">
          Active Promotions
        </h2>
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-100/50 px-3 py-1 rounded-full border border-indigo-200/50"
        >
          {promotions.length} Campaigns
        </motion.span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest bg-indigo-50/30 border-b border-indigo-200/30">
            <tr>
              <th className="px-6 py-4">Promotion Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Created By</th>
              <th className="px-6 py-4">Date & Time</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-100/30">
            {promotions.map((promo) => (
              <motion.tr
                key={promo.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ backgroundColor: "rgba(79, 70, 229, 0.02)" }}
                transition={{ duration: 0.2 }}
                className="group transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">
                    {promo.title || "Untitled Promotion"}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    ID: {promo.id}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter ${
                      promo.type === PromotionType.BOGO
                        ? "bg-blue-50 text-blue-600"
                        : "bg-purple-50 text-purple-600"
                    }`}
                  >
                    {promo.type === PromotionType.BOGO ? (
                      <Gift className="w-3 h-3" />
                    ) : (
                      <LayoutGrid className="w-3 h-3" />
                    )}
                    {promo.type}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 text-slate-400" />
                    </div>
                    <span className="text-xs font-medium text-slate-600">
                      {promo.createdBy}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-3 h-3" />
                    <span className="text-xs">
                      {new Date(promo.createdAt).toLocaleString()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      promo.status === PromotionStatus.Active
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <div
                      className={`w-1 h-1 rounded-full ${
                        promo.status === PromotionStatus.Active
                          ? "bg-green-500"
                          : "bg-slate-400"
                      }`}
                    />
                    {promo.status}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onEdit(promo)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onDelete(promo.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
            {promotions.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-400 italic text-sm"
                >
                  No promotions created yet. Start by filling the form above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

// --- Main Content Component ---

export default function PromotionContent() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [formData, setFormData] = useState<PromotionFormData>({
    type: PromotionType.BOGO,
    title: "",
    buyProductId: "",
    buyQuantity: 1,
    getProductId: "",
    getQuantity: 1,
    bundleItems: [],
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split("T")[0],
    status: PromotionStatus.Inactive,
  });

  const handleSubmit = () => {
    const newPromotion: Promotion = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      createdAt: new Date().toISOString(),
      createdBy: "Admin User",
    };

    setPromotions([newPromotion, ...promotions]);

    setFormData({
      type: PromotionType.BOGO,
      title: "",
      buyProductId: "",
      buyQuantity: 1,
      getProductId: "",
      getQuantity: 1,
      bundleItems: [],
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split("T")[0],
      status: PromotionStatus.Inactive,
    });

    alert("Promotion created successfully!");
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this promotion?")) {
      setPromotions(promotions.filter((p) => p.id !== id));
    }
  };

  const handleEdit = (promo: Promotion) => {
    setFormData({
      type: promo.type,
      title: promo.title,
      buyProductId: promo.buyProductId || "",
      buyQuantity: promo.buyQuantity || 1,
      getProductId: promo.getProductId || "",
      getQuantity: promo.getQuantity || 1,
      bundleItems: promo.bundleItems || [],
      startDate: promo.startDate,
      endDate: promo.endDate,
      status: promo.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full">
      {/* Banner Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-10 mb-8 shadow-lg"
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2"
        >
          Promotion Management
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-blue-100 font-medium"
        >
          Create and manage promotional campaigns to boost your sales with BOGO and Bundle offers.
        </motion.p>
      </motion.div>

      <div className=" mx-auto px-4 md:px-6 py-6 md:py-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-7 xl:col-span-8"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-indigo-100/20 hover:shadow-indigo-500/10 transition-all duration-300">
              <PromotionForm
                data={formData}
                onChange={setFormData}
                onSubmit={handleSubmit}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-5 xl:col-span-4"
          >
            <PromotionPreview data={formData} />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <PromotionList
            promotions={promotions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </motion.div>
      </div>
    </div>
  );
}
