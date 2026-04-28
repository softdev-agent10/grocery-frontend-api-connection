// productsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createNewProduct, deleteExistingProduct, fetchProductById, fetchProducts, updateExistingProduct } from '../thunks';
// import {
//     fetchProducts,
//     fetchProductById,
//     createNewProduct,
//     updateExistingProduct,
//     deleteExistingProduct,
// } from './thunks/productThunks'; // adjust the import path as needed

export interface Product {
    id: number;
    name: string;
    upc: string;
    plu: string;
    category: { id: number; name: string };
    brand: { id: number; name: string };
    selling_price: string;
    quantity: number;
    in_stock: boolean;
}

export interface ProductsState {
    data: Product[];
    loading: boolean;
    error: string | null;
    totalProducts: number;
    currentPage: number;
    itemsPerPage: number;
    searchQuery: string;
    filterStatus: string;
    sortConfig: { key: string; direction: 'asc' | 'desc' };
    selectedIds: number[];
}

const initialState: ProductsState = {
    data: [],
    loading: false,
    error: null,
    totalProducts: 0,
    currentPage: 1,
    itemsPerPage: 5,
    searchQuery: '',
    filterStatus: 'All',
    sortConfig: { key: 'none', direction: 'asc' },
    selectedIds: [],
};

const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        setProducts: (state, action: PayloadAction<Product[]>) => {
            state.data = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        setTotalProducts: (state, action: PayloadAction<number>) => {
            state.totalProducts = action.payload;
        },
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },
        setItemsPerPage: (state, action: PayloadAction<number>) => {
            state.itemsPerPage = action.payload;
        },
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
            state.currentPage = 1;
        },
        setFilterStatus: (state, action: PayloadAction<string>) => {
            state.filterStatus = action.payload;
            state.currentPage = 1;
        },
        setSortConfig: (
            state,
            action: PayloadAction<{ key: string; direction: 'asc' | 'desc' }>
        ) => {
            state.sortConfig = action.payload;
            state.currentPage = 1;
        },
        addProduct: (state, action: PayloadAction<Product>) => {
            state.data.unshift(action.payload);
            state.totalProducts += 1;
        },
        updateProduct: (state, action: PayloadAction<Product>) => {
            const index = state.data.findIndex(p => p.id === action.payload.id);
            if (index !== -1) {
                state.data[index] = action.payload;
            }
        },
        deleteProduct: (state, action: PayloadAction<number>) => {
            state.data = state.data.filter(p => p.id !== action.payload);
            state.totalProducts -= 1;
            state.selectedIds = state.selectedIds.filter(id => id !== action.payload);
        },
        selectProduct: (state, action: PayloadAction<number>) => {
            if (!state.selectedIds.includes(action.payload)) {
                state.selectedIds.push(action.payload);
            }
        },
        deselectProduct: (state, action: PayloadAction<number>) => {
            state.selectedIds = state.selectedIds.filter(id => id !== action.payload);
        },
        clearSelectedIds: state => {
            state.selectedIds = [];
        },
        resetFilters: state => {
            state.searchQuery = '';
            state.filterStatus = 'All';
            state.sortConfig = { key: 'none', direction: 'asc' };
            state.currentPage = 1;
        },
    },
    extraReducers: builder => {
        builder
            // Fetch products
            .addCase(fetchProducts.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.items;
                state.totalProducts = action.payload.total;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch single product
            .addCase(fetchProductById.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.loading = false;
                // Optionally update the product in the list if it exists
                const index = state.data.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create product
            .addCase(createNewProduct.fulfilled, (state, action) => {
                const newProduct = action.payload;
                state.data.unshift(newProduct as unknown as Product);
                state.totalProducts += 1;
            })
            // Update product
            .addCase(updateExistingProduct.fulfilled, (state, action) => {
                const updated = action.payload;
                const index = state.data.findIndex(p => p.id === updated.id);
                if (index !== -1) {
                    state.data[index] = updated as unknown as Product;
                }
            })
            // Delete product
            .addCase(deleteExistingProduct.fulfilled, (state, action) => {
                const id = action.payload;
                state.data = state.data.filter(p => p.id !== id);
                state.totalProducts -= 1;
                state.selectedIds = state.selectedIds.filter(selectedId => selectedId !== id);
            });
    },
});

export const {
    setProducts,
    setLoading,
    setError,
    setTotalProducts,
    setCurrentPage,
    setItemsPerPage,
    setSearchQuery,
    setFilterStatus,
    setSortConfig,
    addProduct,
    updateProduct,
    deleteProduct,
    selectProduct,
    deselectProduct,
    clearSelectedIds,
    resetFilters,
} = productsSlice.actions;

export default productsSlice.reducer;