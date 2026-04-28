
import { getProductsByCategory } from "@/app/services/product/service.product";

import { getCategoryIcon, getProductIcon } from "./sales-data";
import { getBuyNGet } from "@/app/services/tools/serive.buynget";
import { getCategories } from "@/app/services/categories/service.categories";
import { getBundles } from "@/app/services/tools/service.bundle";

export const fetchCategoriesApi = async () => {
  const response = await getCategories({
    limit: 15,
    page: 1,
  });

  if (response?.status !== "success") {
    throw new Error(response?.status || "Invalid API response");
  }

  const items = response?.data?.items || [];

  return items.map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description || "",
    count: `${cat.product_count ?? 0} Products`,
    product_count: cat.product_count ?? 0,
    is_active: cat.is_active,
    taxes: cat.taxes,
    fees: cat.fees,
    icon: getCategoryIcon(cat.name),
  }));
};

export const fetchProductsByCategoryApi = async (categoryId: number) => {
  const response = await getProductsByCategory(categoryId, {
    page: 1,
    limit: 50,
  });

  if (response?.status !== "success") {
    throw new Error(response?.status || "Invalid API response");
  }

  const items = response?.data?.items || [];

  return items.map((prod: any) => ({
    id: prod.id.toString(),
    name: prod.name,
    price: parseFloat(prod.selling_price) || 0,
    category: prod.category?.name || prod.category_name || "Uncategorized",
    stock: parseInt(prod.quantity) || 0,
    barcode: prod.barcode || "",
    icon: getProductIcon(prod.name),
    image: prod.image,
    promotion: prod.promotion,
  }));
};

export const fetchPromotionsApi = async () => {
  const [bundlesResponse, bogoResponse] = await Promise.all([
    getBundles({
      page: 1,
      perPage: 50,
    }),
    getBuyNGet({
      page: 1,
      perPage: 50,
    }),
  ]);

  const allPromotions: any[] = [];

  if (bundlesResponse?.status === "success" && bundlesResponse?.data?.items) {
    bundlesResponse.data.items.forEach((bundle: any) => {
      allPromotions.push({
        id: `bundle_${bundle.id}`,
        name: bundle.name,
        type: "Bundle",
        description: bundle.description || "",
        discount:
          bundle.discount_type === "flat"
            ? `$${bundle.flat_discount}`
            : `${bundle.percent_discount}%`,
        discountType: bundle.discount_type,
        products: bundle.products,
        startDate: bundle.start_date,
        endDate: bundle.end_date,
        productCount: bundle.products?.length || 0,
      });
    });
  }

  if (bogoResponse?.status === "success" && bogoResponse?.data?.items) {
    bogoResponse.data.items.forEach((offer: any) => {
      allPromotions.push({
        id: `buynget_${offer.id}`,
        name: offer.name,
        type: "Buy N Get",
        description: offer.description || "",
        discount: "Free Reward",
        buyQty: offer.buy_conditions?.[0]?.required_qty || 1,
        getQty: offer.reward_items?.[0]?.reward_qty || 1,
        startDate: offer.start_date,
        endDate: offer.end_date,
      });
    });
  }

  return allPromotions;
};