// productThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
    ProductPayload,
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct as apiDeleteProduct,
    ProductData,
    ProductFormData,
} from '@/app/services/product/service.product';
import { Product } from '../slices';
// import { Product } from './productsSlice'; // adjust path

export interface FetchProductsParams {
    page: number;
    limit: number;
    search?: string;
    category_id?: number;
    sort_by?: 'name' | 'selling_price' | 'quantity' | 'created_at';
    sort_order?: 'asc' | 'desc';
    both?: boolean; // for fetching all products without pagination
    in_stock?: boolean; // filter by stock status
}

// Mapper: Convert API ProductData to Redux Product
const mapProductDataToProduct = (data: ProductData): Product => ({
    id: data.id,
    name: data.name,
    upc: data.upc,
    plu: data.plu,
    category: data.category,
    brand: data.brand,
    selling_price: String(data.selling_price),
    quantity: data.quantity,
    in_stock: data.is_available ?? data.quantity > 0, // fallback: in stock if quantity > 0
});
/**
 * Fetch products with filters, pagination, and sorting
 */
export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (params: FetchProductsParams, { rejectWithValue }) => {
        try {
            const response = await getProducts(params);
            const items = response.data.items.map(mapProductDataToProduct);
            // console.log("Products fetched successfully:", items);
            return {
                items,
                total: response.data.pagination?.total_items || 0,
            };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch products');
        }
    }
);

/**
 * Fetch single product by ID
 */
export const fetchProductById = createAsyncThunk(
    'products/fetchProductById',
    async (productId: number, { rejectWithValue }) => {
        try {
            const response = await getProductById(productId);
            return mapProductDataToProduct(response.data);
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch product');
        }
    }
);

/**
 * Create new product
 */
export const createNewProduct = createAsyncThunk(
    'products/createProduct',
    async (payload: ProductFormData, { rejectWithValue }) => {
        try {
            const response = await createProduct(payload);
            return mapProductDataToProduct(response.data);
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create product');
        }
    }
);

/**
 * Update existing product
 */
export const updateExistingProduct = createAsyncThunk(
    'products/updateProduct',
    async ({ id, payload }: { id: number; payload: ProductFormData }, { rejectWithValue }) => {
        try {
            const response = await updateProduct(id, payload);
            return mapProductDataToProduct(response.data);
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to update product');
        }
    }
);

/**
 * Delete product
 */
export const deleteExistingProduct = createAsyncThunk(
    'products/deleteProduct',
    async (productId: number, { rejectWithValue }) => {
        try {
            await apiDeleteProduct(productId);
            return productId;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to delete product');
        }
    }
);