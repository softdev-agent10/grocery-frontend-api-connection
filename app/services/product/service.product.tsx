import { apiClient } from '@/lib/apiClient';
import { PaginatedResponse, SingleResponse } from '@/lib/types/api.types';

/**
 * Product category type
 */
export type ProductCategory = {
  id: number;
  name: string;
};

/**
 * Product brand type
 */
export type ProductBrand = {
  id: number;
  name: string;
};

/**
 * Product unit type
 */
export type ProductUnit = {
  id: number;
  name: string;
};

/**
 * Product data type
 */
export type ProductData = {
  id: number;
  name: string;
  selling_price: string | number;
  quantity: number;
  category: ProductCategory;
  brand: ProductBrand;
  unit: ProductUnit;
  plu: string;
  upc: string;
  description?: string;
  buying_price: string | number;
  custom_price?: string | number;
  quantity_alert: number;
  discount?: string | number;
  age_verification?: boolean;
  ebt_eligible?: boolean;
  sold_by_weight?: boolean;
  is_refundable?: boolean;
  warranty_period?: string;
  warranty_description?: string;
  manufacturer_date?: string;
  expiration_date?: string;
  is_available: boolean;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
};

export interface ProductFormData {
  id?: number;
  name: string;
  category_name: string;
  brand_name: string;
  unit_name: string;
  upc_code: string;
  plu_code: string;
  description: string;
  buying_price: number;
  selling_price: number;
  custom_price: number;
  quantity: number;
  quantity_alert: number;
  discount: number;
  age_verification: boolean;
  ebt_eligible: boolean;
  sold_by_weight: boolean;
  is_refundable: boolean;
  warranty_period: string;
  warranty_description: string;
  manufacturer_date: string;
  expiration_date: string;
  image_url: string | undefined;
  is_available: boolean;
}

/**
 * Filter options for product list
 */
export interface ProductFilter {
  page?: number;
  limit?: number;
  category_id?: number;
  min_price?: number | string;
  max_price?: number | string;
  search?: string;
  sort_by?: 'name' | 'selling_price' | 'quantity' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

/**
 * Product create/update payload
 */
export interface ProductPayload extends Partial<ProductData> {
  name: string;
  category_id: number;
  brand_id: number;
  unit_id: number;
  selling_price: number | string;
  buying_price?: number | string;
  quantity?: number;
  quantity_alert?: number;
}

/**
 * Get all products with optional filters
 */
export const getProducts = (filters?: ProductFilter) =>
  apiClient.get<PaginatedResponse<ProductData>>('/inventory/products', filters);

/**
 * Get single product by ID
 */
export const getProductById = (productId: number) =>
  apiClient.get<SingleResponse<ProductData>>(`/inventory/products/${productId}`);

/**
 * Create a new product
 */
export const createProduct = (data: ProductFormData) =>
  apiClient.post<SingleResponse<ProductData>>('/inventory/products', data);

/**
 * Update an existing product
 */
export const updateProduct = (productId: number, data: Partial<ProductFormData>) =>
  apiClient.patch<SingleResponse<ProductData>>(`/inventory/products/${productId}`, data);

/**
 * Delete a product
 */
export const deleteProduct = (productId: number) =>
  apiClient.delete<SingleResponse<ProductData>>(`/inventory/products/${productId}`);

/**
 * Get products by category ID
 */
// export const getProductsByCategory = (categoryId: number, filters?: ProductFilter) =>
//   apiClient.get<PaginatedResponse<ProductData>>(`/inventory/products/category/${categoryId}`, filters);
export const getProductsByCategory = (categoryId: number, filters?: ProductFilter) =>
  apiClient.get<PaginatedResponse<ProductData>>('/inventory/products', {
    ...filters,
    category_id: categoryId,
  });

/**
 * Helper function to transform API response to form data
 * Used for populating form fields when editing a product
 */
export const transformProductToFormData = (product: ProductData): any => {
  return {
    name: product.name,
    category_id: product.category.id,
    brand_id: product.brand.id,
    unit_id: product.unit.id,
    upc_code: product.upc,
    plu_code: product.plu,
    description: product.description || "",
    buying_price: product.buying_price,
    selling_price: product.selling_price,
    custom_price: product.custom_price || 0,
    quantity: product.quantity,
    quantity_alert: product.quantity_alert,
    discount: product.discount || 0,
    age_verification: product.age_verification || false,
    ebt_eligible: product.ebt_eligible || false,
    sold_by_weight: product.sold_by_weight || false,
    is_refundable: product.is_refundable || false,
    warranty_period: product.warranty_period || "",
    warranty_description: product.warranty_description || "",
    manufacturer_date: product.manufacturer_date ? new Date(product.manufacturer_date) : new Date(),
    expiration_date: product.expiration_date ? new Date(product.expiration_date) : new Date(),
    image_url: product.image_url || "",
    is_available: product.is_available,
  };
};
