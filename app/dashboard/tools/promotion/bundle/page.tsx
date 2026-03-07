"use client";

import React, { useState } from "react";
import { Plus, Package, Calendar, X, Trash2, Edit2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface BundlePromo {
  id: string;
  title: string;
  products: string[]; // product IDs
  originalPrice: number;
  bundlePrice: number;
  startDate: string;
  endDate: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

const MOCK_PRODUCTS = [
  { id: "1", name: "Premium Wireless Headphones", price: 199.99, image: "https://picsum.photos/seed/headphones/400/400" },
  { id: "2", name: "Ergonomic Mechanical Keyboard", price: 129.5, image: "https://picsum.photos/seed/keyboard/400/400" },
  { id: "3", name: "Ultra-Wide 4K Monitor", price: 449.0, image: "https://picsum.photos/seed/monitor/400/400" },
  { id: "4", name: "Minimalist Leather Backpack", price: 85.0, image: "https://picsum.photos/seed/backpack/400/400" },
  { id: "5", name: "Stainless Steel Water Bottle", price: 24.99, image: "https://picsum.photos/seed/bottle/400/400" },
  { id: "6", name: "Smart Fitness Tracker", price: 59.99, image: "https://picsum.photos/seed/watch/400/400" },
];

export default function BundlePage() {
  const [bundlePromos, setBundlePromos] = useState<BundlePromo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    bundlePrice: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "Inactive" as "Active" | "Inactive",
  });

  const handleAddProduct = (productId: string) => {
    if (!selectedProducts.includes(productId)) {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((id) => id !== productId));
  };

  const originalPrice = selectedProducts.reduce((sum, id) => sum + (MOCK_PRODUCTS.find((p) => p.id === id)?.price || 0), 0);
  const savings = originalPrice - formData.bundlePrice;

  const handleSubmit = () => {
    if (formData.title && selectedProducts.length > 0 && formData.bundlePrice > 0) {
      setBundlePromos([
        {
          id: Math.random().toString(36).substr(2, 9),
          ...formData,
          products: selectedProducts,
          originalPrice,
          createdAt: new Date().toISOString(),
        },
        ...bundlePromos,
      ]);
      setFormData({
        title: "",
        bundlePrice: 0,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "Inactive",
      });
      setSelectedProducts([]);
      setShowForm(false);
      alert("Bundle Promotion created successfully!");
    }
  };

  const bundleProducts = selectedProducts.map((id) => MOCK_PRODUCTS.find((p) => p.id === id)).filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-3 sm:p-4 md:p-6 lg:p-8 2xl:p-10">
      {/* Header with Back Button */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 md:mb-8 2xl:mb-10">
        <Link href="/dashboard/tools/promotion" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold mb-4">
          <ArrowLeft size={20} />
          Back to Promotions
        </Link>
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl md:rounded-3xl p-6 md:p-8 2xl:p-10 text-white shadow-lg">
          <h1 className="text-2xl sm:text-3xl md:text-4xl 2xl:text-5xl font-black tracking-tight">Product Bundle Offers</h1>
          <p className="text-xs sm:text-sm md:text-base 2xl:text-lg text-purple-100 mt-2 md:mt-3">Create attractive product bundles with special pricing</p>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8 2xl:gap-10">
        {/* Form Section */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 2xl:col-span-2">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-purple-100 p-6 md:p-8 2xl:p-10">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl 2xl:text-3xl font-bold text-gray-900">Create Bundle</h2>
              {showForm && (
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} className="text-gray-600" />
                </button>
              )}
            </div>

            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all text-sm md:text-base 2xl:text-lg"
              >
                <Plus size={20} /> Create New Bundle
              </button>
            ) : (
              <div className="space-y-4 md:space-y-6">
                {/* Title */}
                <div>
                  <label className="text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">Bundle Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Ultimate Office Setup"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full mt-2 px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm md:text-base"
                  />
                </div>

                {/* Product Selection */}
                <div>
                  <label className="text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">Select Products</label>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {MOCK_PRODUCTS.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => (selectedProducts.includes(product.id) ? handleRemoveProduct(product.id) : handleAddProduct(product.id))}
                        className={`p-3 rounded-lg text-left border-2 transition-all text-xs md:text-sm ${
                          selectedProducts.includes(product.id)
                            ? "border-purple-600 bg-purple-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-gray-600">${product.price.toFixed(2)}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Products Summary */}
                {selectedProducts.length > 0 && (
                  <div className="p-4 md:p-6 bg-purple-50 rounded-xl border border-purple-200">
                    <p className="text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Selected Products ({selectedProducts.length})</p>
                    <div className="space-y-2">
                      {bundleProducts.map((product) => (
                        <div key={product?.id} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{product?.name}</span>
                          <span className="text-gray-600">${product?.price.toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t border-purple-200 pt-2 mt-3">
                        <div className="flex items-center justify-between font-bold">
                          <span>Original Price:</span>
                          <span className="line-through text-gray-400">${originalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bundle Price */}
                <div>
                  <label className="text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">Bundle Price</label>
                  <div className="relative mt-2">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-bold">$</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.bundlePrice}
                      onChange={(e) => setFormData({ ...formData, bundlePrice: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-8 pr-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm md:text-base"
                    />
                  </div>
                  {savings > 0 && (
                    <p className="text-xs md:text-sm text-green-600 font-semibold mt-1">Savings: ${savings.toFixed(2)}</p>
                  )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full mt-2 px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm md:text-base"
                    />
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full mt-2 px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm md:text-base"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between p-4 md:p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="font-semibold text-gray-700 text-sm md:text-base">Active</span>
                  <button
                    onClick={() => setFormData({ ...formData, status: formData.status === "Active" ? "Inactive" : "Active" })}
                    className={`w-12 md:w-14 h-6 md:h-7 rounded-full transition-all relative ${formData.status === "Active" ? "bg-purple-600" : "bg-gray-300"}`}
                  >
                    <div className={`absolute top-1 w-4 md:w-5 h-4 md:h-5 bg-white rounded-full transition-all ${formData.status === "Active" ? "left-7" : "left-1"}`} />
                  </button>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-3 md:py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all text-sm md:text-base"
                  >
                    Save Bundle
                  </button>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setSelectedProducts([]);
                    }}
                    className="flex-1 py-3 md:py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all text-sm md:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Preview Section */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 2xl:col-span-2">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-purple-100 p-6 md:p-8 2xl:p-10 sticky top-24">
            <h3 className="text-lg md:text-xl 2xl:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
              <Package size={20} className="text-purple-600" />
              Bundle Preview
            </h3>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 md:p-6 2xl:p-8">
              {selectedProducts.length > 0 ? (
                <div className="space-y-4 md:space-y-6">
                  <h4 className="font-bold text-sm md:text-base 2xl:text-lg text-gray-900">{formData.title || "Bundle Title"}</h4>
                  <div className="flex flex-wrap gap-2">
                    {bundleProducts.map((product) => (
                      <div key={product?.id} className="flex-1 min-w-[80px]">
                        <img src={product?.image} alt="" className="w-full h-16 md:h-24 2xl:h-32 rounded-lg object-cover" referrerPolicy="no-referrer" />
                        <p className="text-xs md:text-sm font-medium mt-1 text-gray-900 truncate">{product?.name}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 pt-4 md:pt-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="text-gray-600">Regular Price:</span>
                        <span className="line-through text-gray-400">${originalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm md:text-base 2xl:text-lg">
                        <span>Bundle Price:</span>
                        <span className="text-purple-600">${formData.bundlePrice.toFixed(2)}</span>
                      </div>
                      {savings > 0 && (
                        <div className="text-center py-2 bg-green-100 text-green-700 rounded-lg text-xs md:text-sm font-bold">
                          Save ${savings.toFixed(2)}!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 italic text-sm md:text-base text-center py-8">Select products to see preview</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Active Bundles List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 md:mt-10 2xl:mt-12">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-purple-100 p-6 md:p-8 2xl:p-10">
          <h2 className="text-xl md:text-2xl 2xl:text-3xl font-bold text-gray-900 mb-6 md:mb-8">Active Bundles ({bundlePromos.length})</h2>
          {bundlePromos.length === 0 ? (
            <p className="text-center text-gray-400 italic py-8 text-sm md:text-base">No bundle promotions created yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm 2xl:text-base">
                <thead className="bg-purple-50 border-b border-purple-200">
                  <tr>
                    <th className="px-4 md:px-6 py-3 md:py-4 font-bold text-gray-700">Title</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 font-bold text-gray-700">Products</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 font-bold text-gray-700">Price</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 font-bold text-gray-700">Status</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bundlePromos.map((promo) => (
                    <tr key={promo.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-4 md:px-6 py-3 md:py-4 font-semibold">{promo.title}</td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-gray-600">{promo.products.length} items</td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <div className="text-xs md:text-sm">
                          <p className="line-through text-gray-400">${promo.originalPrice.toFixed(2)}</p>
                          <p className="font-bold text-purple-600">${promo.bundlePrice.toFixed(2)}</p>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${promo.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                          {promo.status}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-purple-100 rounded-lg transition-colors text-purple-600">
                            <Edit2 size={16} />
                          </button>
                          <button className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
