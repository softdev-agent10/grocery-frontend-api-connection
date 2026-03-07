"use client";

import React, { useState } from "react";
import { Plus, Gift, Calendar, Check, X, Trash2, Edit2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface BOGO {
  id: string;
  title: string;
  buyProductId: string;
  buyQuantity: number;
  getProductId: string;
  getQuantity: number;
  startDate: string;
  endDate: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

const MOCK_PRODUCTS = [
  { id: "1", name: "Premium Wireless Headphones", price: 199.99, image: "https://picsum.photos/seed/headphones/400/400", category: "Electronics" },
  { id: "2", name: "Ergonomic Mechanical Keyboard", price: 129.5, image: "https://picsum.photos/seed/keyboard/400/400", category: "Electronics" },
  { id: "3", name: "Ultra-Wide 4K Monitor", price: 449.0, image: "https://picsum.photos/seed/monitor/400/400", category: "Electronics" },
  { id: "4", name: "Minimalist Leather Backpack", price: 85.0, image: "https://picsum.photos/seed/backpack/400/400", category: "Accessories" },
  { id: "5", name: "Stainless Steel Water Bottle", price: 24.99, image: "https://picsum.photos/seed/bottle/400/400", category: "Lifestyle" },
  { id: "6", name: "Smart Fitness Tracker", price: 59.99, image: "https://picsum.photos/seed/watch/400/400", category: "Electronics" },
];

export default function BOGOPage() {
  const [bogoPromos, setBogoPromos] = useState<BOGO[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    buyProductId: "",
    buyQuantity: 1,
    getProductId: "",
    getQuantity: 1,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "Inactive" as "Active" | "Inactive",
  });

  const handleSubmit = () => {
    if (formData.title && formData.buyProductId && formData.getProductId) {
      setBogoPromos([
        {
          id: Math.random().toString(36).substr(2, 9),
          ...formData,
          createdAt: new Date().toISOString(),
        },
        ...bogoPromos,
      ]);
      setFormData({
        title: "",
        buyProductId: "",
        buyQuantity: 1,
        getProductId: "",
        getQuantity: 1,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "Inactive",
      });
      setShowForm(false);
      alert("BOGO Promotion created successfully!");
    }
  };

  const buyProduct = MOCK_PRODUCTS.find((p) => p.id === formData.buyProductId);
  const getProduct = MOCK_PRODUCTS.find((p) => p.id === formData.getProductId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6 lg:p-8 2xl:p-10">
      {/* Header with Back Button */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 md:mb-8 2xl:mb-10">
        <Link href="/dashboard/tools/promotion" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4">
          <ArrowLeft size={20} />
          Back to Promotions
        </Link>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl md:rounded-3xl p-6 md:p-8 2xl:p-10 text-white shadow-lg">
          <h1 className="text-2xl sm:text-3xl md:text-4xl 2xl:text-5xl font-black tracking-tight">Buy 1 Get 1 (BOGO) Promotions</h1>
          <p className="text-xs sm:text-sm md:text-base 2xl:text-lg text-blue-100 mt-2 md:mt-3">Create and manage BOGO campaigns to attract more customers</p>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8 2xl:gap-10">
        {/* Form Section */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 2xl:col-span-2">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-blue-100 p-6 md:p-8 2xl:p-10">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl 2xl:text-3xl font-bold text-gray-900">Create BOGO Promotion</h2>
              {showForm && (
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} className="text-gray-600" />
                </button>
              )}
            </div>

            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all text-sm md:text-base 2xl:text-lg"
              >
                <Plus size={20} /> Create New BOGO
              </button>
            ) : (
              <div className="space-y-4 md:space-y-6">
                {/* Title */}
                <div>
                  <label className="text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">Promotion Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Buy Headphones Get Keyboard Free"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full mt-2 px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm md:text-base"
                  />
                </div>

                {/* Buy Product */}
                <div>
                  <label className="text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">Buy Product</label>
                  <select
                    value={formData.buyProductId}
                    onChange={(e) => setFormData({ ...formData, buyProductId: e.target.value })}
                    className="w-full mt-2 px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm md:text-base"
                  >
                    <option value="">Select product to buy</option>
                    {MOCK_PRODUCTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${p.price})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Buy Quantity */}
                <div>
                  <label className="text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">Buy Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.buyQuantity}
                    onChange={(e) => setFormData({ ...formData, buyQuantity: parseInt(e.target.value) || 1 })}
                    className="w-full mt-2 px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm md:text-base"
                  />
                </div>

                {/* Get Product */}
                <div>
                  <label className="text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">Get Product (Free)</label>
                  <select
                    value={formData.getProductId}
                    onChange={(e) => setFormData({ ...formData, getProductId: e.target.value })}
                    className="w-full mt-2 px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm md:text-base"
                  >
                    <option value="">Select product to get free</option>
                    {MOCK_PRODUCTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${p.price})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Get Quantity */}
                <div>
                  <label className="text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">Get Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.getQuantity}
                    onChange={(e) => setFormData({ ...formData, getQuantity: parseInt(e.target.value) || 1 })}
                    className="w-full mt-2 px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm md:text-base"
                  />
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
                    className={`w-12 md:w-14 h-6 md:h-7 rounded-full transition-all relative ${formData.status === "Active" ? "bg-blue-600" : "bg-gray-300"}`}
                  >
                    <div className={`absolute top-1 w-4 md:w-5 h-4 md:h-5 bg-white rounded-full transition-all ${formData.status === "Active" ? "left-7" : "left-1"}`} />
                  </button>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-3 md:py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all text-sm md:text-base"
                  >
                    Save BOGO
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
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
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-blue-100 p-6 md:p-8 2xl:p-10 sticky top-24">
            <h3 className="text-lg md:text-xl 2xl:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
              <Gift size={20} className="text-blue-600" />
              Customer Preview
            </h3>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 2xl:p-8">
              {buyProduct && getProduct ? (
                <div className="space-y-4 md:space-y-6">
                  <div className="bg-red-600 text-white px-3 md:px-4 py-2 rounded-lg inline-block text-xs md:text-sm font-bold">
                    BUY {formData.buyQuantity} GET {formData.getQuantity} FREE
                  </div>
                  <div>
                    <img src={buyProduct.image} alt="" className="w-full rounded-lg object-cover h-32 md:h-48 2xl:h-64" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs md:text-sm">Buy:</p>
                    <h4 className="font-bold text-sm md:text-lg 2xl:text-xl text-gray-900">{buyProduct.name}</h4>
                    <p className="text-blue-600 font-bold text-base md:text-lg 2xl:text-xl">${buyProduct.price.toFixed(2)}</p>
                  </div>
                  <div className="border-t border-gray-200 pt-4 md:pt-6">
                    <p className="text-gray-600 text-xs md:text-sm font-semibold uppercase tracking-wider">Bonus Gift</p>
                    <img src={getProduct.image} alt="" className="w-20 md:w-24 2xl:w-32 rounded-lg mt-2" referrerPolicy="no-referrer" />
                    <h4 className="font-bold text-sm md:text-base 2xl:text-lg text-gray-900 mt-2">{getProduct.name}</h4>
                    <p className="text-green-600 font-bold text-xs md:text-sm">FREE!</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 italic text-sm md:text-base text-center py-8">Select products to see preview</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Active BOGOs List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 md:mt-10 2xl:mt-12">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-blue-100 p-6 md:p-8 2xl:p-10">
          <h2 className="text-xl md:text-2xl 2xl:text-3xl font-bold text-gray-900 mb-6 md:mb-8">Active BOGO Promotions ({bogoPromos.length})</h2>
          {bogoPromos.length === 0 ? (
            <p className="text-center text-gray-400 italic py-8 text-sm md:text-base">No BOGO promotions created yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm 2xl:text-base">
                <thead className="bg-blue-50 border-b border-blue-200">
                  <tr>
                    <th className="px-4 md:px-6 py-3 md:py-4 font-bold text-gray-700">Title</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 font-bold text-gray-700">Offer</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 font-bold text-gray-700">Status</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bogoPromos.map((promo) => (
                    <tr key={promo.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-4 md:px-6 py-3 md:py-4 font-semibold">{promo.title}</td>
                      <td className="px-4 md:px-6 py-3 md:py-4">Buy {promo.buyQuantity} Get {promo.getQuantity}</td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${promo.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                          {promo.status}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600">
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
