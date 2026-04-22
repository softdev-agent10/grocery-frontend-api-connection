"use client";

import React, { useState, useEffect } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import { createBuyNGet, updateBuyNGet, getBuyNGetById } from "@/app/services/tools/serive.buynget";
import { getProducts, type ProductData } from "@/app/services/product/service.product";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify/unstyled";
import { useNotification } from "@/hooks/useNotification";
import { getBundle, getBundles, createBundle, updateBundle } from "@/app/services/tools/service.bundle";

enum PromotionType {
  BOGO = "BOGO",
  BUNDLE = "BUNDLE",
}

enum PromotionStatus {
  Inactive = "Inactive",
  Active = "Active",
}

interface Product {
  id: number;
  name: string;
  selling_price: string | number;
  quantity: number;
  category: any;
  brand: any;
  unit: any;
  upc: string;
  plu: string | null;
}

interface BundleItem {
  productId: number | null;
  quantity: number;
  originalPrice: number;
  newPrice: number;
  isCustomPrice: boolean;
}

interface BundleProduct {
  product_id: number;
  quantity: number;
  price: number;
}

interface PromotionFormData {
  type: PromotionType;
  title: string;
  buyProductId: number | null;
  buyQuantity: number;
  getProductId: number | null;
  getQuantity: number;
  bundleItems: BundleItem[];
  bundleDiscountPrice: number;
  bundleDiscountType: "flat" | "percent";
  startDate: string;
  endDate: string;
  status: PromotionStatus;
}

const MOCK_PRODUCTS: Product[] = [];

// For real products, they'll be loaded from the API

const ProductSelector: React.FC<{
  label: string;
  selectedId: number | null;
  onSelect: (id: number) => void;
  products: Product[];
  placeholder?: string;
}> = ({ label, selectedId, onSelect, products, placeholder = "Select a product..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.upc?.includes(search) ||
      p.plu?.includes(search)
  );

  const selectedProduct = products.find((p) => p.id === selectedId);

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
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
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
                      <div className="w-7 h-7 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded bg-slate-100 flex items-center justify-center">
                        <Package size={16} className="text-slate-400" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-slate-900 text-xs md:text-sm lg:text-base">{product.name}</div>
                        <div className="text-[10px] md:text-xs lg:text-sm text-slate-500">
                          UPC: {product.upc} | PLU: {product.plu}
                        </div>
                        <div className="text-[10px] md:text-xs lg:text-sm text-slate-500 font-bold">
                          ${Number(product.selling_price).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    {selectedId === product.id && (
                      <Check size={14} className="md:w-4 md:h-4 lg:w-5 lg:h-5 text-blue-600" />
                    )}
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-slate-500 text-xs md:text-sm">
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

export default function CreatePromotionPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const promotionId = searchParams?.get("id");
  const isEditMode = !!promotionId;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingPromotion, setIsLoadingPromotion] = useState(isEditMode);
  const [products, setProducts] = useState<Product[]>([]);
  const { notification, showNotification } = useNotification();

  const [formData, setFormData] = useState<PromotionFormData>({
    type: PromotionType.BOGO,
    title: "",
    buyProductId: null,
    buyQuantity: 1,
    getProductId: null,
    getQuantity: 1,
    bundleItems: [],
    bundleDiscountPrice: 0,
    bundleDiscountType: "flat",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    status: PromotionStatus.Inactive,
  });

  const [showTypeDropdown, setShowTypeDropdown] = useState(!isEditMode);
  const buyProduct = products.find((p) => p.id === formData.buyProductId);
  const getProduct = products.find((p) => p.id === formData.getProductId);

  // Fetch real products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const response = await getProducts({
          limit: 100,
        });

        console.log(`Products fetched: ${response.data?.items?.length || 0} items`);
        if (response.data?.items) {
          setProducts(response.data.items);
        }
        showNotification("Products loaded successfully", "success");
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setSubmitError("Failed to load products. Please try again.");
        showNotification("Failed to load products", "error");
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [token]);

  // Fetch promotion details if editing
  useEffect(() => {
    const fetchPromotionDetails = async () => {
      if (!isEditMode || !promotionId) return;

      try {
        setIsLoadingPromotion(true);
        const promotionType = promotionId.startsWith("bundle_") ? "bundle" : "buynget";

        if (promotionType === "bundle") {
          const bundleIdNum = parseInt(promotionId.replace("bundle_", ""));
          const response = await getBundle(bundleIdNum);

          if (response.data) {
            const bundle = response.data;
            setFormData({
              type: PromotionType.BUNDLE,
              title: bundle.name,
              buyProductId: null,
              buyQuantity: 1,
              getProductId: null,
              getQuantity: 1,
              bundleItems: bundle.items.map((p) => ({
                productId: p.product_id,
                quantity: p.quantity,
                originalPrice: typeof p.price === "string" ? parseFloat(p.price) : p.price,
                newPrice: typeof p.price === "string" ? parseFloat(p.price) : p.price,
                isCustomPrice: false,
              })),
              bundleDiscountPrice: bundle.flat_discount ? (typeof bundle.flat_discount === "string" ? parseFloat(bundle.flat_discount) : bundle.flat_discount) : 0,
              bundleDiscountType: (bundle.discount_type as "flat" | "percent") || "flat",
              startDate: bundle.start_date,
              endDate: bundle.end_date,
              status: PromotionStatus.Active,
            });
          }
          showNotification("Promotion details loaded successfully", "success");
        } else {
          const offerIdNum = parseInt(promotionId.replace("buynget_", ""));
          const response = await getBuyNGetById(offerIdNum);

          if (response.data) {
            const offer = response.data;
            setFormData({
              type: PromotionType.BOGO,
              title: offer.name,
              buyProductId: offer.buy_conditions[0]?.product_id || null,
              buyQuantity: offer.buy_conditions[0]?.required_qty || 1,
              getProductId: offer.reward_items[0]?.product_id || null,
              getQuantity: offer.reward_items[0]?.reward_qty || 1,
              bundleItems: [],
              bundleDiscountPrice: 0,
              bundleDiscountType: "flat",
              startDate: offer.start_date,
              endDate: offer.end_date,
              status: offer.is_active ? PromotionStatus.Active : PromotionStatus.Inactive,
            });
          }
          showNotification("Promotion details loaded successfully", "success");
        }
      } catch (error) {
        console.error("Failed to fetch promotion details:", error);
        setSubmitError("Failed to load promotion details. Please try again.");
        showNotification("Failed to load promotion details", "error");
      } finally {
        setIsLoadingPromotion(false);
      }
    };

    fetchPromotionDetails();
  }, [isEditMode, promotionId, token]);

  const handleCreatePromotion = async (): Promise<void> => {
    // Validation
    if (!formData.title) {
      setSubmitError("Please enter a promotion title");
      return;
    }
    if (formData.type === PromotionType.BOGO && (!formData.buyProductId || !formData.getProductId)) {
      setSubmitError("Please select buy and get products for BOGO promotion");
      return;
    }
    if (formData.type === PromotionType.BUNDLE && formData.bundleItems.length === 0) {
      setSubmitError("Please add at least one product to the bundle");
      return;
    }
    if (formData.type === PromotionType.BUNDLE && formData.bundleDiscountPrice <= 0) {
      setSubmitError(`Bundle ${formData.bundleDiscountType === "percent" ? "discount percentage" : "discount amount"} must be greater than 0`);
      return;
    }
    if (formData.type === PromotionType.BUNDLE && formData.bundleDiscountType === "percent" && formData.bundleDiscountPrice > 100) {
      setSubmitError("Discount percentage cannot exceed 100%");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      if (formData.type === PromotionType.BOGO) {
        // Create Buy N Get offer
        const payload = {
          branchId: "1234567890", // TODO: Get from user context
          token: "your-auth-token", // TODO: Get from auth context
          name: formData.title,
          description: `Buy ${formData.buyQuantity} get ${formData.getQuantity}`,
          offer_type: "buy_n_get",
          pricing_mode: "individual",
          start_date: formData.startDate,
          end_date: formData.endDate,
          buy_conditions: [
            {
              product_id: formData.buyProductId!,
              required_qty: formData.buyQuantity,
            },
          ],
          reward_items: [
            {
              product_id: formData.getProductId!,
              reward_qty: formData.getQuantity,
              reward_price_type: "free",
              reward_value: 0,
            },
          ],
          grand_reward_type: null,
          grand_reward_value: null,
          priority: 1,
          offer_limit: 999,
          is_active: formData.status === PromotionStatus.Active,
        };
        await createBuyNGet(payload);
        showNotification("Promotion created successfully", "success");

      } else {
        // Create Bundle
        const bundleProducts: BundleProduct[] = formData.bundleItems.map((item) => ({
          product_id: item.productId!,
          quantity: item.quantity,
          price: item.newPrice,
        }));

        // Get first product's PLU as bundle identifier (with safety check)
        const firstProductId = formData.bundleItems[0]?.productId;
        const firstProduct = firstProductId ? products.find(p => p.id === firstProductId) : null;
        // Generate 11-digit random PLU code if product doesn't have one
        const bundlePluCode = firstProduct?.plu || Math.floor(10000000000 + Math.random() * 90000000000).toString();

        // Determine flat and percent discounts based on discount type
        const flatDiscount = formData.bundleDiscountType === "flat" ? formData.bundleDiscountPrice : null;
        const percentDiscount = formData.bundleDiscountType === "percent" ? formData.bundleDiscountPrice : null;

        const bundlePayload = {
          name: formData.title,
          description: `Bundle with ${formData.bundleItems.length} items`,
          type: "special",
          subtype: "customer",
          discount_type: formData.bundleDiscountType,
          flat_discount: flatDiscount as any,
          percent_discount: percentDiscount as any,
          offer_limit: 999,
          plu_code: bundlePluCode,
          tax_id: 1,
          fees_id: 1,
          start_date: formData.startDate,
          end_date: formData.endDate,
          products: bundleProducts,
        };
        await createBundle(bundlePayload);
      }

      // Success
      showNotification(`Promotion ${isEditMode ? "updated" : "created"} successfully!`, "success");

      router.push("/dashboard/tools/promotion");
    } catch (err) {
      console.error("Error creating promotion:", err);
      setSubmitError(
        err instanceof Error ? err.message : "Failed to create promotion"
      );
      showNotification("Failed to create promotion", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePromotion = async (): Promise<void> => {
    if (!promotionId) {
      setSubmitError("Promotion ID not found");
      return;
    }

    // Validation
    if (!formData.title) {
      setSubmitError("Please enter a promotion title");
      return;
    }
    if (formData.type === PromotionType.BOGO && (!formData.buyProductId || !formData.getProductId)) {
      setSubmitError("Please select buy and get products for BOGO promotion");
      return;
    }
    if (formData.type === PromotionType.BUNDLE && formData.bundleItems.length === 0) {
      setSubmitError("Please add at least one product to the bundle");
      return;
    }
    if (formData.type === PromotionType.BUNDLE && formData.bundleDiscountPrice <= 0) {
      setSubmitError(`Bundle ${formData.bundleDiscountType === "percent" ? "discount percentage" : "discount amount"} must be greater than 0`);
      return;
    }
    if (formData.type === PromotionType.BUNDLE && formData.bundleDiscountType === "percent" && formData.bundleDiscountPrice > 100) {
      setSubmitError("Discount percentage cannot exceed 100%");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      if (formData.type === PromotionType.BOGO) {
        const buyOfferIdNum = parseInt(promotionId.replace("buynget_", ""));
        const payload = {
          branchId: "1234567890",
          token: "your-auth-token",
          name: formData.title,
          description: `Buy ${formData.buyQuantity} get ${formData.getQuantity}`,
          offer_type: "buy_n_get",
          pricing_mode: "individual",
          start_date: formData.startDate,
          end_date: formData.endDate,
          buy_conditions: [
            {
              product_id: formData.buyProductId!,
              required_qty: formData.buyQuantity,
            },
          ],
          reward_items: [
            {
              product_id: formData.getProductId!,
              reward_qty: formData.getQuantity,
              reward_price_type: "free",
              reward_value: 0,
            },
          ],
          grand_reward_type: null,
          grand_reward_value: null,
          priority: 1,
          offer_limit: 999,
          is_active: formData.status === PromotionStatus.Active,
        };
        await updateBuyNGet(buyOfferIdNum, payload);
      } else {
        const bundleIdNum = parseInt(promotionId.replace("bundle_", ""));
        const bundleProducts: BundleProduct[] = formData.bundleItems.map((item) => ({
          product_id: item.productId!,
          quantity: item.quantity,
          price: item.newPrice,
        }));

        const firstProductId = formData.bundleItems[0]?.productId;
        const firstProduct = firstProductId ? products.find(p => p.id === firstProductId) : null;
        const bundlePluCode = firstProduct?.plu || Math.floor(10000000000 + Math.random() * 90000000000).toString();

        const flatDiscount = formData.bundleDiscountType === "flat" ? formData.bundleDiscountPrice : null;
        const percentDiscount = formData.bundleDiscountType === "percent" ? formData.bundleDiscountPrice : null;

        const bundlePayload = {
          name: formData.title,
          description: `Bundle with ${formData.bundleItems.length} items`,
          type: "special",
          subtype: "customer",
          discount_type: formData.bundleDiscountType,
          flat_discount: flatDiscount as any,
          percent_discount: percentDiscount as any,
          offer_limit: 999,
          plu_code: bundlePluCode,
          tax_id: 1,
          fees_id: 1,
          start_date: formData.startDate,
          end_date: formData.endDate,
          products: bundleProducts,
        };
        await updateBundle(bundleIdNum, bundlePayload);
      }

      showNotification("Promotion updated successfully!", "success");
      router.push("/dashboard/tools/promotion");
    } catch (err) {
      console.error("Error updating promotion:", err);
      setSubmitError(
        err instanceof Error ? err.message : "Failed to update promotion"
      );
      showNotification("Failed to update promotion", "error");
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isLoadingProducts || isLoadingPromotion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-blue-600 rounded-2xl md:rounded-3xl 2xl:rounded-4xl p-6 md:p-8 2xl:p-12 mb-6 md:mb-8 2xl:mb-10 shadow-lg flex justify-between items-center"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-lg md:text-2xl lg:text-3xl font-black text-white tracking-tight mb-2">
            {isEditMode ? "Edit" : "Create"} Promotion
          </h1>
          <p className="text-xs md:text-sm lg:text-base text-blue-100 font-medium">
            {isEditMode ? "Update promotion details" : "Choose promotion type and fill in the details"}
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

      {/* Type Selection Dropdown - Only show in create mode */}
      {!isEditMode && (
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
              className={`md:w-5 md:h-5 lg:w-6 lg:h-6 text-slate-400 transition-transform ${showTypeDropdown ? "rotate-180" : ""
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
      )}

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
            {/* Error Notification */}
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 md:mb-5 lg:mb-6 rounded-lg bg-red-50 border border-red-200 p-3 md:p-4"
              >
                <p className="text-xs md:text-sm text-red-600">{submitError}</p>
              </motion.div>
            )}

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
                  className={`flex items-center gap-2 px-3 md:px-4 lg:px-5 py-1.5 md:py-2 lg:py-2.5 rounded-full text-xs md:text-xs lg:text-sm font-bold transition-all ${formData.status === PromotionStatus.Active
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                >
                  <div
                    className={`w-1.5 h-1.5 md:w-2 md:h-2 lg:w-2.5 lg:h-2.5 rounded-full ${formData.status === PromotionStatus.Active
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
                        products={products}
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
                        products={products}
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
                          const product = products.find(p => p.id === item.productId);
                          return (
                            <div key={idx} className="bg-white p-2 md:p-3 rounded-lg border border-slate-100">
                              <div className="space-y-2">
                                <div>
                                  <label className="text-[10px] md:text-xs font-bold text-slate-600">Product {idx + 1}</label>
                                  <select
                                    className="w-full px-2 md:px-3 py-1.5 md:py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    value={item.productId || ""}
                                    onChange={(e) => {
                                      const newBundleItems = [...formData.bundleItems];
                                      const selected = products.find(p => p.id === parseInt(e.target.value));
                                      if (selected) {
                                        newBundleItems[idx] = {
                                          ...item,
                                          productId: parseInt(e.target.value),
                                          originalPrice: typeof selected.selling_price === "string" ? parseFloat(selected.selling_price) : selected.selling_price,
                                          newPrice: typeof selected.selling_price === "string" ? parseFloat(selected.selling_price) : selected.selling_price
                                        };
                                        setFormData({ ...formData, bundleItems: newBundleItems });
                                      }
                                    }}
                                  >
                                    <option value="">Select Product</option>
                                    {products.map(p => (
                                      <option key={p.id} value={p.id}>{p.name} (${typeof p.selling_price === "string" ? parseFloat(p.selling_price).toFixed(2) : p.selling_price.toFixed(2)})</option>
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
                          productId: null,
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
                        {/* Discount Type Toggle */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs md:text-sm text-slate-600 font-medium">Discount Type:</span>
                          <div className="flex gap-2 bg-white rounded-lg border border-indigo-200 p-1">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setFormData({ ...formData, bundleDiscountType: "flat" })}
                              className={`px-3 py-1.5 text-xs md:text-sm rounded font-bold transition-all ${formData.bundleDiscountType === "flat"
                                ? "bg-indigo-600 text-white"
                                : "bg-white text-slate-700 hover:bg-slate-50"
                                }`}
                            >
                              Flat ($)
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setFormData({ ...formData, bundleDiscountType: "percent" })}
                              className={`px-3 py-1.5 text-xs md:text-sm rounded font-bold transition-all ${formData.bundleDiscountType === "percent"
                                ? "bg-indigo-600 text-white"
                                : "bg-white text-slate-700 hover:bg-slate-50"
                                }`}
                            >
                              Percentage (%)
                            </motion.button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-xs md:text-sm text-slate-600">Original Total:</span>
                          <span className="text-sm md:text-base font-bold text-slate-900">${formData.bundleItems.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0).toFixed(2)}</span>
                        </div>

                        {/* Flat Discount Input */}
                        {formData.bundleDiscountType === "flat" && (
                          <div className="flex justify-between items-center">
                            <label className="text-xs md:text-sm text-slate-600">Discount Amount ($):</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              className="w-24 md:w-28 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none"
                              placeholder="0.00"
                              value={formData.bundleDiscountPrice || ""}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  bundleDiscountPrice: parseFloat(e.target.value) || 0
                                });
                              }}
                            />
                          </div>
                        )}

                        {/* Percentage Discount Input */}
                        {formData.bundleDiscountType === "percent" && (
                          <div className="flex justify-between items-center">
                            <label className="text-xs md:text-sm text-slate-600">Discount Percentage (%):</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              max="100"
                              className="w-24 md:w-28 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none"
                              placeholder="0.00"
                              value={formData.bundleDiscountPrice}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  bundleDiscountPrice: parseFloat(e.target.value) || 0
                                });
                              }}
                            />
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-2 border-t border-indigo-200">
                          <span className="text-xs md:text-sm text-slate-600 font-medium">
                            {formData.bundleDiscountType === "percent"
                              ? "Discount Amount:"
                              : "Final Bundle Price:"}
                          </span>
                          <span className="text-sm md:text-base font-bold text-green-600">
                            {formData.bundleDiscountType === "percent"
                              ? `$${((formData.bundleItems.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0)) * (formData.bundleDiscountPrice / 100)).toFixed(2)}`
                              : `$${Math.max(0, formData.bundleItems.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0) - formData.bundleDiscountPrice).toFixed(2)}`
                            }
                          </span>
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
                disabled={isSubmitting || authLoading}
                onClick={isEditMode ? handleUpdatePromotion : handleCreatePromotion}
                className="w-full flex items-center justify-center gap-2 px-5 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-4 bg-linear-to-r from-indigo-600 to-blue-600 text-white rounded-lg md:rounded-lg lg:rounded-xl font-bold text-xs md:text-sm lg:text-base hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} className="md:w-4 md:h-4 lg:w-5 lg:h-5" />
                {isSubmitting ? "Saving..." : isEditMode ? "Update Promotion" : "Create Promotion"}
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
                    <div className="aspect-square bg-slate-50 rounded-lg md:rounded-lg lg:rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center">
                      {buyProduct ? (
                        <div className="flex flex-col items-center justify-center text-center p-4">
                          <Package size={32} className="text-slate-400 mb-2" />
                          <span className="text-[10px] md:text-xs lg:text-sm text-slate-600 font-medium line-clamp-2">
                            {buyProduct.name}
                          </span>
                        </div>
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
                        ${buyProduct ? (typeof buyProduct.selling_price === "string" ? parseFloat(buyProduct.selling_price).toFixed(2) : buyProduct.selling_price.toFixed(2)) : "0.00"}
                      </span>
                      <span className="text-[10px] md:text-xs lg:text-sm text-slate-400 font-medium">
                        x {formData.buyQuantity}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 md:p-3 lg:p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-white rounded-lg border border-blue-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {getProduct ? (
                        <span className="text-[8px] md:text-[9px] lg:text-xs font-bold text-slate-500 text-center line-clamp-2">
                          {getProduct.name}
                        </span>
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
                        ${getProduct ? (typeof getProduct.selling_price === "string" ? parseFloat(getProduct.selling_price).toFixed(2) : getProduct.selling_price.toFixed(2)) : "0.00"}
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
                            const product = products.find(p => p.id === item.productId);
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
