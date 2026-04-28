import { Product, PRODUCTS } from "./sales-data";

export const calculateSubtotal = (items: any[]) => {
  return items.reduce((sum, item) => {
    const itemSubtotal = item.price * item.qty;
    const itemDiscount =
      item.discountType === "percentage"
        ? (itemSubtotal * (item.discountValue || 0)) / 100
        : (item.discountValue || 0);

    return sum + (itemSubtotal - itemDiscount);
  }, 0);
};

export const calculateTaxAmount = (
  subtotal: number,
  taxPercent: number,
  isTaxFree: boolean
) => {
  return isTaxFree ? 0 : (subtotal * taxPercent) / 100;
};

export const calculateDiscountAmount = (
  subtotal: number,
  discountType: "percentage" | "flat",
  discountValue: number
) => {
  return discountType === "percentage"
    ? (subtotal * discountValue) / 100
    : discountValue;
};

export const calculateTotal = (
  subtotal: number,
  taxAmount: number,
  discountAmount: number
) => {
  return Math.max(0, subtotal + taxAmount - discountAmount);
};

export const findProductByBarcode = (barcode: string) => {
  return PRODUCTS.find((p) => p.barcode === barcode);
};

export const getFilteredProducts = (
  products: Product[],
  selectedCategory: string | null,
  searchQuery: string
) => {
  return products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode?.includes(searchQuery);

    if (searchQuery) return matchesSearch;
    if (selectedCategory) return p.category === selectedCategory;
    return false;
  });
};