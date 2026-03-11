"use client";

import React, { useState } from "react";
import {
  Plus,
  Calendar,
  Percent,
  Settings2,
  LayoutGrid,
  Gift,
  Check,
  X,
  Search,
  Package,
  ArrowRight,
  Tag,
  Sparkles,
  ShoppingCart,
  Calculator,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

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
    <div className="space-y-2 relative">
      <label className="text-xs md:text-sm lg:text-base font-medium text-slate-700">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 md:px-4 py-2 md:py-2.5 lg:py-3 bg-white border border-slate-200 rounded-lg text-xs md:text-sm lg:text-base text-left focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        >
          <div className="flex flex-col">
            <span className={selectedProduct ? "text-slate-900 text-xs md:text-sm lg:text-base" : "text-slate-400 text-xs md:text-sm lg:text-base"}>
              {selectedProduct ? selectedProduct.name : placeholder}
            </span>
            {selectedProduct && (
              <span className="text-[10px] md:text-xs lg:text-sm text-slate-400">
                UPC: {selectedProduct.upc} | PLU: {selectedProduct.plu}
              </span>
            )}
          </div>
          <Search size={14} className="md:w-4 md:h-4 lg:w-5 lg:h-5 text-slate-400" />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
            <div className="p-2 md:p-2.5 lg:p-3 border-b border-slate-100">
              <input
                autoFocus
                type="text"
                className="w-full px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm lg:text-base bg-slate-50 border-none rounded-md focus:ring-0"
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
                  className="w-full flex items-center justify-between px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm lg:text-base hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <img
                      src={product.image}
                      alt=""
                      className="w-7 h-7 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-left">
                      <div className="font-medium text-slate-900 text-xs md:text-sm lg:text-base">{product.name}</div>
                      <div className="text-[10px] md:text-xs lg:text-sm text-slate-500">
                        UPC: {product.upc} | PLU: {product.plu}
                      </div>
                      <div className="text-[10px] md:text-xs lg:text-sm text-slate-500 font-bold">
                        ${product.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  {selectedId === product.id && (
                    <Check size={14} className="md:w-4 md:h-4 lg:w-5 lg:h-5 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function CreatePromotionPage() {
  const [formData, setFormData] = useState<PromotionFormData>({
    type: PromotionType.BOGO,
    title: "",
    buyProductId: "",
    buyQuantity: 1,
    getProductId: "",
    getQuantity: 1,
    bundleItems: [],
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    status: PromotionStatus.Inactive,
  });

  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const buyProduct = MOCK_PRODUCTS.find((p) => p.id === formData.buyProductId);
  const getProduct = MOCK_PRODUCTS.find((p) => p.id === formData.getProductId);

  return (
    <div className="w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl md:rounded-3xl 2xl:rounded-4xl p-6 md:p-8 2xl:p-12 mb-6 md:mb-8 2xl:mb-10 shadow-lg flex justify-between items-center"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-lg md:text-2xl lg:text-3xl font-black text-white tracking-tight mb-2">
            Create Promotion
          </h1>
          <p className="text-xs md:text-sm lg:text-base text-blue-100 font-medium">
            Choose promotion type and fill in the details
          </p>
        </motion.div>
        <Link href="/dashboard/tools/promotion">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 md:px-5 lg:px-6 py-2 md:py-2.5 lg:py-3 bg-white text-blue-600 rounded-lg md:rounded-lg lg:rounded-xl font-bold text-xs md:text-sm lg:text-base hover:bg-blue-50 transition-all"
          >
            Back
          </motion.button>
        </Link>
      </motion.div>

      {/* Type Selection Dropdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative w-full max-w-md mb-6 md:mb-8 lg:mb-10"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowTypeDropdown(!showTypeDropdown)}
          className="w-full flex items-center justify-between px-4 md:px-5 lg:px-6 py-3 md:py-3.5 lg:py-4 bg-white border-2 border-indigo-200 rounded-lg md:rounded-lg lg:rounded-xl text-slate-900 font-bold text-sm md:text-base lg:text-base hover:border-indigo-400 transition-all"
        >
          <div className="flex items-center gap-2">
            {formData.type === PromotionType.BOGO ? (
              <>
                <Gift size={18} className="md:w-5 md:h-5 lg:w-6 lg:h-6 text-indigo-600" />
                <span>Buy 1 Get 1</span>
              </>
            ) : (
              <>
                <LayoutGrid size={18} className="md:w-5 md:h-5 lg:w-6 lg:h-6 text-purple-600" />
                <span>Bundle</span>
              </>
            )}
          </div>
          <ChevronDown
            size={18}
            className={`md:w-5 md:h-5 lg:w-6 lg:h-6 text-slate-400 transition-transform ${
              showTypeDropdown ? "rotate-180" : ""
            }`}
          />
        </motion.button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {showTypeDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg md:rounded-lg lg:rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <motion.button
                whileHover={{ backgroundColor: "rgb(242 252 255)" }}
                onClick={() => {
                  setFormData({ ...formData, type: PromotionType.BOGO });
                  setShowTypeDropdown(false);
                }}
                className="w-full flex items-center gap-3 px-4 md:px-5 lg:px-6 py-3 md:py-3.5 lg:py-4 text-left hover:bg-blue-50 transition-colors border-b border-slate-100"
              >
                <Gift size={20} className="md:w-5 md:h-5 lg:w-6 lg:h-6 text-indigo-600" />
                <div>
                  <div className="font-bold text-slate-900 text-sm md:text-base">Buy 1 Get 1</div>
                  <div className="text-xs md:text-sm text-slate-500">Offer free items with purchase</div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ backgroundColor: "rgb(242 252 255)" }}
                onClick={() => {
                  setFormData({ ...formData, type: PromotionType.BUNDLE });
                  setShowTypeDropdown(false);
                }}
                className="w-full flex items-center gap-3 px-4 md:px-5 lg:px-6 py-3 md:py-3.5 lg:py-4 text-left hover:bg-blue-50 transition-colors"
              >
                <LayoutGrid size={20} className="md:w-5 md:h-5 lg:w-6 lg:h-6 text-purple-600" />
                <div>
                  <div className="font-bold text-slate-900 text-sm md:text-base">Bundle</div>
                  <div className="text-xs md:text-sm text-slate-500">Combine multiple items</div>
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Form & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 2xl:gap-10">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-7 xl:col-span-8"
        >
          <div className="bg-white rounded-2xl md:rounded-2xl lg:rounded-3xl p-5 md:p-6 lg:p-8 shadow-2xl border border-indigo-100/20">
            <div className="space-y-4 md:space-y-6 lg:space-y-8">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-xs md:text-sm lg:text-base font-medium text-slate-700">
                  Promotion Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Summer Tech Extravaganza"
                  className="w-full px-3 md:px-4 py-2 md:py-2.5 lg:py-3 bg-white border border-indigo-200/50 rounded-lg md:rounded-lg lg:rounded-xl text-xs md:text-sm lg:text-base focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Status Toggle */}
              <motion.div className="flex items-center justify-between bg-slate-900 p-3 md:p-4 lg:p-5 rounded-lg md:rounded-lg lg:rounded-2xl text-white">
                <span className="text-xs md:text-sm lg:text-base font-bold">Promotion Status</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      status:
                        formData.status === PromotionStatus.Active
                          ? PromotionStatus.Inactive
                          : PromotionStatus.Active,
                    })
                  }
                  className={`flex items-center gap-2 px-3 md:px-4 lg:px-5 py-1.5 md:py-2 lg:py-2.5 rounded-full text-xs md:text-xs lg:text-sm font-bold transition-all ${
                    formData.status === PromotionStatus.Active
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 md:w-2 md:h-2 lg:w-2.5 lg:h-2.5 rounded-full ${
                      formData.status === PromotionStatus.Active
                        ? "bg-green-500"
                        : "bg-slate-400"
                    }`}
                  />
                  {formData.status}
                </motion.button>
              </motion.div>

              {/* BOGO Form */}
              {formData.type === PromotionType.BOGO && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4 md:space-y-6 lg:space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                    <div className="space-y-3 md:space-y-4 lg:space-y-5">
                      <ProductSelector
                        label="Buy Product"
                        selectedId={formData.buyProductId}
                        onSelect={(id) => setFormData({ ...formData, buyProductId: id })}
                      />
                      <div className="space-y-2">
                        <label className="text-xs md:text-sm lg:text-base font-medium text-slate-700">
                          Buy Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          className="w-full px-3 md:px-4 py-2 md:py-2.5 lg:py-3 bg-white border border-slate-200 rounded-lg md:rounded-lg lg:rounded-xl text-xs md:text-sm lg:text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                          value={formData.buyQuantity}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              buyQuantity: parseInt(e.target.value) || 1,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-3 md:space-y-4 lg:space-y-5">
                      <ProductSelector
                        label="Get Product (Free)"
                        selectedId={formData.getProductId}
                        onSelect={(id) => setFormData({ ...formData, getProductId: id })}
                      />
                      <div className="space-y-2">
                        <label className="text-xs md:text-sm lg:text-base font-medium text-slate-700">
                          Get Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          className="w-full px-3 md:px-4 py-2 md:py-2.5 lg:py-3 bg-white border border-slate-200 rounded-lg md:rounded-lg lg:rounded-xl text-xs md:text-sm lg:text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                          value={formData.getQuantity}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              getQuantity: parseInt(e.target.value) || 1,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Bundle Form */}
              {formData.type === PromotionType.BUNDLE && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4 md:space-y-6 lg:space-y-8"
                >
                  <div>
                    <h3 className="text-xs md:text-sm lg:text-base font-bold text-slate-900 flex items-center gap-2 mb-3 md:mb-4 lg:mb-5">
                      <ShoppingCart size={16} className="md:w-4 md:h-4 lg:w-5 lg:h-5" />
                      Bundle Products
                    </h3>
                    <p className="text-xs text-slate-500 mb-3 md:mb-4">Add multiple products to create a bundle offer</p>
                    
                    {formData.bundleItems.length > 0 && (
                      <div className="space-y-2 mb-4 md:mb-5 lg:mb-6 bg-slate-50 p-3 md:p-4 lg:p-5 rounded-lg border border-slate-200">
                        <h4 className="text-xs md:text-sm font-bold text-slate-900 mb-3">Bundle Items</h4>
                        {formData.bundleItems.map((item, idx) => {
                          const product = MOCK_PRODUCTS.find(p => p.id === item.productId);
                          return (
                            <div key={idx} className="bg-white p-2 md:p-3 rounded-lg border border-slate-100">
                              <div className="space-y-2">
                                <div>
                                  <label className="text-[10px] md:text-xs font-bold text-slate-600">Product {idx + 1}</label>
                                  <select
                                    className="w-full px-2 md:px-3 py-1.5 md:py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    value={item.productId}
                                    onChange={(e) => {
                                      const newBundleItems = [...formData.bundleItems];
                                      const selected = MOCK_PRODUCTS.find(p => p.id === e.target.value);
                                      if (selected) {
                                        newBundleItems[idx] = {
                                          ...item,
                                          productId: e.target.value,
                                          originalPrice: selected.price,
                                          newPrice: selected.price
                                        };
                                        setFormData({ ...formData, bundleItems: newBundleItems });
                                      }
                                    }}
                                  >
                                    <option value="">Select Product</option>
                                    {MOCK_PRODUCTS.map(p => (
                                      <option key={p.id} value={p.id}>{p.name} (${p.price.toFixed(2)})</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[10px] md:text-xs font-bold text-slate-600">Qty</label>
                                    <input
                                      type="number"
                                      min="1"
                                      className="w-full px-2 md:px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                      value={item.quantity}
                                      onChange={(e) => {
                                        const newBundleItems = [...formData.bundleItems];
                                        newBundleItems[idx] = { ...item, quantity: parseInt(e.target.value) || 1 };
                                        setFormData({ ...formData, bundleItems: newBundleItems });
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] md:text-xs font-bold text-slate-600">Price</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      className="w-full px-2 md:px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                      value={item.newPrice}
                                      onChange={(e) => {
                                        const newBundleItems = [...formData.bundleItems];
                                        newBundleItems[idx] = { ...item, newPrice: parseFloat(e.target.value) || 0 };
                                        setFormData({ ...formData, bundleItems: newBundleItems });
                                      }}
                                    />
                                  </div>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    const updated = formData.bundleItems.filter((_, i) => i !== idx);
                                    setFormData({ ...formData, bundleItems: updated });
                                  }}
                                  className="w-full px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded border border-red-200 transition-all"
                                >
                                  Remove
                                </motion.button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        const newItem: BundleItem = {
                          productId: "",
                          quantity: 1,
                          originalPrice: 0,
                          newPrice: 0,
                          isCustomPrice: false,
                        };
                        setFormData({
                          ...formData,
                          bundleItems: [...formData.bundleItems, newItem],
                        });
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 md:px-4 lg:px-5 py-2 md:py-2.5 lg:py-3 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all text-xs md:text-sm font-bold"
                    >
                      <Plus size={14} className="md:w-4 md:h-4 lg:w-5 lg:h-5" />
                      Add Product to Bundle
                    </motion.button>
                  </div>

                  {/* Bundle Pricing */}
                  {formData.bundleItems.length > 0 && (
                    <div className="bg-indigo-50 rounded-lg md:rounded-lg lg:rounded-xl border border-indigo-200 p-3 md:p-4 lg:p-5">
                      <h4 className="text-xs md:text-sm lg:text-base font-bold text-slate-900 mb-3 md:mb-4">Bundle Pricing</h4>
                      <div className="space-y-2 md:space-y-3 lg:space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs md:text-sm text-slate-600">Original Total:</span>
                          <span className="text-sm md:text-base font-bold text-slate-900">${formData.bundleItems.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <label className="text-xs md:text-sm text-slate-600">Bundle Price:</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-24 md:w-28 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none"
                            placeholder="0.00"
                            onChange={(e) => {
                              // Update bundle price
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Dates */}
              <div className="space-y-3 md:space-y-4 lg:space-y-5">
                <h3 className="text-xs md:text-sm lg:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar size={16} className="md:w-4 md:h-4 lg:w-5 lg:h-5" />
                  Promotion Period
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
                  <div className="space-y-2">
                    <label className="text-xs md:text-sm lg:text-base font-medium text-slate-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 lg:py-3 bg-white border border-indigo-200/50 rounded-lg md:rounded-lg lg:rounded-xl text-xs md:text-sm lg:text-base focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs md:text-sm lg:text-base font-medium text-slate-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 lg:py-3 bg-white border border-indigo-200/50 rounded-lg md:rounded-lg lg:rounded-xl text-xs md:text-sm lg:text-base focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(79, 70, 229, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (!formData.title) {
                    alert("Please enter a promotion title");
                    return;
                  }
                  if (formData.type === PromotionType.BOGO && (!formData.buyProductId || !formData.getProductId)) {
                    alert("Please select buy and get products for BOGO promotion");
                    return;
                  }
                  if (formData.type === PromotionType.BUNDLE && formData.bundleItems.length === 0) {
                    alert("Please add at least one product to the bundle");
                    return;
                  }
                  alert(`✓ ${formData.type} promotion "${formData.title}" created successfully!`);
                  // Redirect back to promotion page
                  window.location.href = "/dashboard/tools/promotion";
                }}
                className="w-full flex items-center justify-center gap-2 px-5 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg md:rounded-lg lg:rounded-xl font-bold text-xs md:text-sm lg:text-base hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg"
              >
                <Plus size={16} className="md:w-4 md:h-4 lg:w-5 lg:h-5" />
                Create Promotion
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-5 xl:col-span-4 sticky top-20"
        >
          <div className="flex items-center gap-2 mb-3 md:mb-4 text-slate-500">
            <Sparkles size={14} className="md:w-4 md:h-4 lg:w-5 lg:h-5" />
            <span className="text-[10px] md:text-xs lg:text-sm font-bold uppercase tracking-widest">
              Live Preview
            </span>
          </div>

          <motion.div
            whileHover={{ boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.2)" }}
            transition={{ duration: 0.3 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl md:rounded-2xl lg:rounded-3xl shadow-xl border border-indigo-100/30 overflow-hidden"
          >
            <div className="bg-slate-900 p-2 md:p-3 lg:p-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5 md:gap-2">
                <div className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                  <ShoppingCart size={12} className="md:w-4 md:h-4 lg:w-5 lg:h-5 text-white" />
                </div>
                <span className="text-white font-bold text-xs md:text-sm lg:text-base tracking-tight">StoreFront</span>
              </div>
            </div>

            <div className="p-3 md:p-4 lg:p-5">
              {formData.type === PromotionType.BOGO ? (
                <motion.div
                  key="bogo"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2 md:space-y-3 lg:space-y-4"
                >
                  <div className="relative group">
                    <div className="absolute top-1 md:top-2 lg:top-3 left-1 md:left-2 lg:left-3 z-10">
                      <span className="bg-red-600 text-white text-[8px] md:text-[9px] lg:text-xs font-black px-1.5 md:px-2 lg:px-3 py-0.5 md:py-1 lg:py-1.5 rounded uppercase tracking-tighter shadow-lg">
                        BUY {formData.buyQuantity} GET {formData.getQuantity} FREE
                      </span>
                    </div>
                    <div className="aspect-square bg-slate-50 rounded-lg md:rounded-lg lg:rounded-xl overflow-hidden border border-slate-100">
                      {buyProduct ? (
                        <img
                          src={buyProduct.image}
                          alt=""
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 italic text-[10px] md:text-xs lg:text-sm">
                          Select buy product
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-0.5 md:space-y-1 lg:space-y-1.5">
                    <h3 className="text-sm md:text-base lg:text-lg font-bold text-slate-900 leading-tight line-clamp-2">
                      {buyProduct ? buyProduct.name : "Product Title"}
                    </h3>
                    <div className="flex items-baseline gap-1.5 md:gap-2">
                      <span className="text-lg md:text-xl lg:text-2xl font-black text-slate-900">
                        ${buyProduct ? buyProduct.price.toFixed(2) : "0.00"}
                      </span>
                      <span className="text-[10px] md:text-xs lg:text-sm text-slate-400 font-medium">
                        x {formData.buyQuantity}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 md:p-3 lg:p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-white rounded-lg border border-blue-200 overflow-hidden shrink-0">
                      {getProduct ? (
                        <img
                          src={getProduct.image}
                          alt=""
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100">
                          <Package size={12} className="md:w-4 md:h-4 lg:w-5 lg:h-5 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-[8px] md:text-[9px] lg:text-xs font-bold text-blue-600 uppercase tracking-wider">
                        Bonus Gift
                      </div>
                      <div className="text-xs md:text-sm lg:text-base font-bold text-slate-900 truncate">
                        {getProduct ? getProduct.name : "Select free product"}
                      </div>
                      <div className="text-[10px] md:text-xs lg:text-sm text-slate-500 line-through">
                        ${getProduct ? getProduct.price.toFixed(2) : "0.00"}
                      </div>
                    </div>
                    <div className="text-[10px] md:text-xs lg:text-sm font-bold text-green-600 bg-green-100 px-1.5 md:px-2 lg:px-3 py-0.5 md:py-1 lg:py-1.5 rounded">
                      x {formData.getQuantity} FREE
                    </div>
                  </div>

                  <button className="w-full py-2 md:py-2.5 lg:py-3 bg-slate-900 text-white rounded-lg text-xs md:text-sm lg:text-base font-bold flex items-center justify-center gap-1.5 md:gap-2 hover:bg-slate-800 transition-all">
                    Add to Cart
                    <ArrowRight size={12} className="md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="bundle"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2 md:space-y-3 lg:space-y-4"
                >
                  {formData.bundleItems.length > 0 ? (
                    <>
                      <div className="bg-purple-50 p-2 md:p-3 lg:p-4 rounded-lg border border-purple-200">
                        <h4 className="text-xs md:text-sm font-bold text-purple-900 mb-2">Bundle Offer</h4>
                        <div className="space-y-1.5 md:space-y-2">
                          {formData.bundleItems.slice(0, 3).map((item, idx) => {
                            const product = MOCK_PRODUCTS.find(p => p.id === item.productId);
                            return (
                              <div key={idx} className="text-[10px] md:text-xs lg:text-sm text-purple-800">
                                {item.quantity}× {product?.name || 'Product'}
                              </div>
                            );
                          })}
                          {formData.bundleItems.length > 3 && (
                            <div className="text-[10px] md:text-xs text-purple-600 font-bold">+{formData.bundleItems.length - 3} more</div>
                          )}
                        </div>
                      </div>
                      <button className="w-full py-2 md:py-2.5 lg:py-3 bg-purple-600 text-white rounded-lg text-xs md:text-sm lg:text-base font-bold flex items-center justify-center gap-1.5 md:gap-2 hover:bg-purple-700 transition-all">
                        Get Bundle Deal
                        <ArrowRight size={12} className="md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" />
                      </button>
                    </>
                  ) : (
                    <p className="text-[10px] md:text-xs lg:text-sm text-slate-500 italic text-center py-4">
                      Add products to see bundle preview
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
