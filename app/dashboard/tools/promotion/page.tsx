"use client";

import React, { useState, useEffect } from "react";
import { Plus, Gift, LayoutGrid, Edit2, Trash2, Calendar, User, ShieldCheck, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getBundles, BundleItem, getBuyNGet, BuyNGetItem } from "@/app/services/tools/serive.tools";

interface Promotion {
  id: string;
  type: "BOGO" | "BUNDLE";
  title: string;
  status: "Active" | "Inactive";
  createdBy: string;
  createdAt: string;
}

// Helper function to map Bundle to Promotion
const mapBundleToPromotion = (bundle: BundleItem): Promotion => {
  return {
    id: `bundle_${bundle.id}`,
    type: "BUNDLE",
    title: bundle.name,
    status: bundle.start_date <= new Date().toISOString().split('T')[0] && bundle.end_date >= new Date().toISOString().split('T')[0] ? "Active" : "Inactive",
    createdBy: "System",
    createdAt: bundle.start_date,
  };
};

// Helper function to map BuyNGet to Promotion
const mapBuyNGetToPromotion = (offer: BuyNGetItem): Promotion => {
  return {
    id: `buynget_${offer.id}`,
    type: "BOGO",
    title: offer.name,
    status: offer.is_active ? "Active" : "Inactive",
    createdBy: "System",
    createdAt: offer.start_date,
  };
};

export default function PromotionPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch bundles and buy n get offers
  useEffect(() => {
    const fetchPromotions = async () => {
      // if (authLoading || !user || !token) {
      //   return;
      // }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch both in parallel
        const [bundlesResponse, buyNGetResponse] = await Promise.all([
          getBundles({
            branchId: "1234567890",
            token: "your_token_here",
            page: 1,
            perPage: 50,
            sort_by: "start_date",
            order: "desc",
          }),
          getBuyNGet({
            branchId: "1234567890",
            token: "your_token_here",
            page: 1,
            perPage: 50,
            sort_by: "start_date",
            order: "desc",
          }),
        ]);

        // Map and merge promotions
        const bundlePromotions: Promotion[] = [];
        const buyNGetPromotions: Promotion[] = [];

        if (bundlesResponse.status === "success" && bundlesResponse.data?.items) {
          bundlePromotions.push(...bundlesResponse.data.items.map(mapBundleToPromotion));
        }

        if (buyNGetResponse.status === "success" && buyNGetResponse.data?.items) {
          buyNGetPromotions.push(...buyNGetResponse.data.items.map(mapBuyNGetToPromotion));
        }

        // Merge and sort by date
        const allPromotions = [...bundlePromotions, ...buyNGetPromotions].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setPromotions(allPromotions);
      } catch (err) {
        console.error('Failed to fetch promotions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch promotions');
        setPromotions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromotions();
  }, [user, token, authLoading]);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this promotion?")) {
      setPromotions(promotions.filter((p) => p.id !== id));
    }
  };

  const handleEdit = (id: string) => {
    alert("Edit functionality - would redirect to edit page with promotion ID: " + id);
  };

  return (
    <main className="min-h-screen bg-white w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-blue-600 rounded-2xl md:rounded-3xl 2xl:rounded-4xl p-6 md:p-8 2xl:p-12 mb-6 md:mb-8 2xl:mb-10 shadow-lg m-4 md:m-6 2xl:m-8"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-xl md:text-2xl 2xl:text-4xl font-black text-white tracking-tight">
              Promotion Management
            </h1>
            <p className="text-sm md:text-base 2xl:text-xl text-blue-100 font-medium mt-2 md:mt-3">
              Create and manage promotional campaigns to boost your sales with BOGO and Bundle offers
            </p>
          </motion.div>
          <Link href="/dashboard/tools/promotion/create">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 md:px-6 2xl:px-8 py-2.5 md:py-3 2xl:py-4 bg-white text-blue-600 rounded-lg md:rounded-xl 2xl:rounded-2xl font-bold text-sm md:text-base 2xl:text-lg hover:bg-blue-50 transition-all shadow-lg"
            >
              <Plus className="w-3 h-3 md:w-4 md:h-4 2xl:w-5 2xl:h-5" />
              Create Promotion
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Error Notification */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-4 md:mx-6 2xl:mx-8 rounded-lg bg-red-50 border border-red-200 p-4 mb-6"
        >
          <p className="text-sm text-red-600">Error: {error}</p>
        </motion.div>
      )}

      {/* Active Promotions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-white rounded-2xl md:rounded-3xl 2xl:rounded-4xl shadow-xl border border-indigo-100/30 overflow-hidden m-4 md:m-6 2xl:m-8"
      >
        <div className="p-4 md:p-6 2xl:p-8 border-b border-indigo-100/30 bg-linear-to-r from-indigo-50/50 to-blue-50/50 flex items-center justify-between">
          <h2 className="text-lg md:text-2xl 2xl:text-3xl font-black text-indigo-900 tracking-tight">
            All Promotions
          </h2>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs md:text-sm 2xl:text-base font-bold text-indigo-600 uppercase tracking-widest bg-indigo-100/50 px-3 md:px-4 2xl:px-5 py-1.5 md:py-2 2xl:py-2.5 rounded-full border border-indigo-200/50"
          >
            {isLoading ? "Loading..." : `${promotions.length} Campaigns`}
          </motion.span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : promotions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
            <Gift size={40} className="text-gray-300" />
            <div>
              <h3 className="font-semibold text-gray-700 mb-1">No Promotions Found</h3>
              <p className="text-sm text-gray-500">No promotion records available. Create one to get started.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base 2xl:text-lg text-left">
              <thead className="text-xs md:text-sm 2xl:text-base font-bold text-indigo-700 uppercase tracking-widest bg-indigo-50/30 border-b border-indigo-200/30">
                <tr>
                  <th className="px-4 md:px-6 2xl:px-8 py-3 md:py-4 2xl:py-5">Promotion Name</th>
                  <th className="px-4 md:px-6 2xl:px-8 py-3 md:py-4 2xl:py-5">Type</th>
                  <th className="px-4 md:px-6 2xl:px-8 py-3 md:py-4 2xl:py-5">Created By</th>
                  <th className="px-4 md:px-6 2xl:px-8 py-3 md:py-4 2xl:py-5">Date & Time</th>
                  <th className="px-4 md:px-6 2xl:px-8 py-3 md:py-4 2xl:py-5">Status</th>
                  <th className="px-4 md:px-6 2xl:px-8 py-3 md:py-4 2xl:py-5 text-right">Actions</th>
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
                    className="group transition-colors hover:bg-indigo-50/50"
                  >
                    <td className="px-4 md:px-6 2xl:px-8 py-3 md:py-4 2xl:py-5">
                      <div className="font-bold text-slate-900 text-sm md:text-base 2xl:text-lg">
                        {promo.title}
                      </div>
                      <div className="text-xs md:text-sm 2xl:text-base text-slate-400">
                        ID: {promo.id}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 2xl:px-8 py-3 md:py-4 2xl:py-5">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2 md:px-3 2xl:px-4 py-1 md:py-1.5 2xl:py-2 rounded-md text-xs md:text-sm 2xl:text-base font-bold uppercase tracking-tighter ${promo.type === "BOGO"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-purple-50 text-purple-600"
                          }`}
                      >
                        {promo.type === "BOGO" ? (
                          <Gift className="w-3 h-3 md:w-4 md:h-4 2xl:w-5 2xl:h-5" />
                        ) : (
                          <LayoutGrid className="w-3 h-3 md:w-4 md:h-4 2xl:w-5 2xl:h-5" />
                        )}
                        {promo.type}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 2xl:px-8 py-3 md:py-4 2xl:py-5">
                      <div className="flex items-center gap-2 md:gap-3 2xl:gap-4">
                        <div className="w-6 h-6 md:w-8 md:h-8 2xl:w-10 2xl:h-10 bg-slate-100 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 md:w-4 md:h-4 2xl:w-5 2xl:h-5 text-slate-400" />
                        </div>
                        <span className="text-xs md:text-sm 2xl:text-base font-medium text-slate-600">
                          {promo.createdBy}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 2xl:px-8 py-3 md:py-4 2xl:py-5">
                      <div className="flex items-center gap-1.5 md:gap-2 2xl:gap-3 text-slate-500">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4 2xl:w-5 2xl:h-5" />
                        <span className="text-xs md:text-sm 2xl:text-base">
                          {new Date(promo.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 2xl:px-8 py-3 md:py-4 2xl:py-5">
                      <div
                        className={`inline-flex items-center gap-1 md:gap-1.5 2xl:gap-2 px-2 md:px-3 2xl:px-4 py-0.5 md:py-1 2xl:py-1.5 rounded-full text-xs md:text-sm 2xl:text-base font-bold ${promo.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                          }`}
                      >
                        <div
                          className={`w-1 h-1 md:w-1.5 md:h-1.5 2xl:w-2 2xl:h-2 rounded-full ${promo.status === "Active"
                            ? "bg-green-500"
                            : "bg-slate-400"
                            }`}
                        />
                        {promo.status}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 2xl:px-8 py-3 md:py-4 2xl:py-5 text-right">
                      <div className="flex items-center justify-end gap-1 md:gap-2 2xl:gap-3 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEdit(promo.id)}
                          className="p-1.5 md:p-2 2xl:p-2.5 text-black hover:text-indigo-600  rounded-lg md:rounded-xl 2xl:rounded-xl transition-all"
                        >
                          <Edit2 className="w-4 h-4 md:w-5 md:h-5 2xl:w-6 2xl:h-6" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(promo.id)}
                          className="p-1.5 md:p-2 2xl:p-2.5 text-black hover:text-red-600  rounded-lg md:rounded-xl 2xl:rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4 md:w-5 md:h-5 2xl:w-6 2xl:h-6" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </main>
  );
}
