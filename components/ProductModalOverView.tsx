"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getProductById } from "@/app/services/product/service.product";
import { X } from "lucide-react";
import { div } from "framer-motion/client";

export default function ProductModalOverView({
  title,
  subTitle,
  isOpen,
  onClose,
  product,
}: any) {
  const [productDetails, setProductDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProductDetails = async () => {
      if (!product) return;

      try {
        setLoading(true);

        const res = await getProductById({
          branchId: 1234567890,
          token: "your_token",
          productId: product.id,
        });

        if (isMounted) setProductDetails(res.data);
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProductDetails();

    return () => {
      isMounted = false;
    };
  }, [product]);

  return (
    <div>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end">
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40"
            >

              {/* MODAL PANEL */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.3 }}
                className="fixed inset-y-0 right-0 z-50 w-3/4 bg-white shadow-2xl overflow-y-auto rounded-l-4xl border-l border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                {/* Header */}
                <div className="bg-slate-900 p-10 flex justify-between items-center text-white shrink-0">
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-200">{title}</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                      {subTitle}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-2 bg-gray-400 hover:bg-gray-100 transition-colors"
                  >
                    <X size={20} sm-size={24} className="text-gray-600" />
                  </button>
                </div>
                {loading ? (
                  <div className="flex justify-center items-center h-40 text-gray-500">
                    Loading product details...
                  </div>
                ) : productDetails ? (
                  <div className="p-6 space-y-8">
                    {/* PRODUCT HEADER */}
                    <div className="bg-white rounded-2xl shadow-md p-5 border border-blue-100">
                      <h3 className="text-2xl font-bold text-gray-800">
                        {productDetails.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        UPC: {productDetails.upc}
                      </p>

                      <div
                        className={`mt-2 inline-block px-3 py-1 text-xs rounded-full font-semibold ${productDetails.is_available
                          ? "bg-blue-100 text-blue-600"
                          : "bg-red-100 text-red-500"
                          }`}
                      >
                        {productDetails.is_available
                          ? "Available"
                          : "Not Available"}
                      </div>
                    </div>

                    {/* IMAGE */}
                    {productDetails.image_url && (
                      <div className="bg-white rounded-2xl shadow-md p-4 flex justify-center">
                        <img
                          src={productDetails.image_url}
                          alt={productDetails.name}
                          className="max-h-60 object-contain rounded-xl"
                        />
                      </div>
                    )}
                    <Grid>
                      {/* BASIC INFO */}
                      <Section title="Basic Info">
                        <Grid>
                          <Info label="Category" value={productDetails.category?.name} />
                          <Info label="Brand" value={productDetails.brand?.name} />
                          <Info label="Unit" value={productDetails.unit?.name} />
                          <Info label="PLU" value={productDetails.plu} />
                          <Info label="UPC" value={productDetails.upc} />
                          <Info label="Quantity" value={productDetails.quantity} />
                        </Grid>
                      </Section>

                      {/* PRICING */}
                      <Section title="Pricing">
                        <Grid>
                          <Info label="Selling Price" value={`$${productDetails.selling_price}`} highlight />
                          <Info label="Buying Price" value={`$${productDetails.buying_price}`} />
                          <Info label="Custom Price" value={`$${productDetails.custom_price}`} />
                          <Info label="Discount" value={productDetails.discount} />
                        </Grid>
                      </Section>

                      {/* SETTINGS */}
                      <Section title="Settings">
                        <Grid>
                          <Badge label="Age Verification" value={productDetails.age_verification} />
                          <Badge label="EBT Eligible" value={productDetails.ebt_eligible} />
                          <Badge label="Sold by Weight" value={productDetails.sold_by_weight} />
                          <Badge label="Refundable" value={productDetails.is_refundable} />
                        </Grid>
                      </Section>
                      {/* EXTRA */}
                      <Section title="Additional Info">
                        <Grid>
                          <Info label="Warranty Period" value={productDetails.warranty_period} />
                          <Info label="Warranty Description" value={productDetails.warranty_description} />
                          <Info label="Manufacture Date" value={productDetails.manufacturer_date} />
                          <Info label="Expiration Date" value={productDetails.expiration_date} />
                          <Info label="Created At" value={productDetails.created_at} />
                          <Info label="Updated At" value={productDetails.updated_at} />
                        </Grid>
                      </Section>
                    </Grid>
                    {/* DESCRIPTION */}
                    <Section title="Description">
                      <p className="text-gray-600 text-sm">
                        {productDetails.description || "No description available."}
                      </p>
                    </Section>
                  </div>
                ) : (
                  <p className="text-center text-gray-400">
                    No product details available.
                  </p>
                )}
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- REUSABLE UI ---------- */

function Section({ title, children }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 border border-blue-100">
      <h3 className="text-lg font-semibold text-blue-600 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Grid({ children }: any) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2  gap-4">
      {children}
    </div>
  );
}

function Info({ label, value, highlight = false }: any) {
  return (
    <div className="bg-blue-50 p-3 rounded-lg">
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className={`font-semibold ${highlight ? "text-blue-600 text-lg" : "text-gray-800"
          }`}
      >
        {value || "-"}
      </p>
    </div>
  );
}

function Badge({ label, value }: any) {
  return (
    <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg">
      <span className="text-sm text-gray-600">{label}</span>
      <span
        className={`text-xs font-semibold px-2 py-1 rounded-full ${value ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-500"
          }`}
      >
        {value ? "Yes" : "No"}
      </span>
    </div>
  );
}