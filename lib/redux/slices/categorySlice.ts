// lib/redux/slices/categorySlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from '@/app/services/categories/service.categories';
import { Category } from '@/lib/types/api.types';
export type { Category };

interface CategoryState {
    items: Category[];
    loading: boolean;
    error: string | null;
}

const initialState: CategoryState = {
    items: [],
    loading: false,
    error: null,
};

// Thunks
// lib/redux/slices/categorySlice.ts
export const fetchCategories = createAsyncThunk(
    'categories/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            // Do NOT send page, limit, or any parameters that cause 422
            const response = await getCategories(); // no filters
            return response.data.items;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const createNewCategory = createAsyncThunk(
    'categories/create',
    async (data: { name: string; description?: string; tax_id?: number; fee_id?: number }, { rejectWithValue }) => {
        try {
            const response = await createCategory(data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateExistingCategory = createAsyncThunk(
    'categories/update',
    async ({ id, data }: { id: number; data: Partial<Category> }, { rejectWithValue }) => {
        try {
            // Only send fields that have truthy values (except false booleans)
            // console.log('Updating category with raw data:', id);
            const cleanData: any = {};
            if (data.name) cleanData.name = data.name;
            if (data.description) cleanData.description = data.description;
            if (data.tax_id && data.tax_id !== 0) cleanData.tax_id = data.tax_id;
            if (data.fee_id && data.fee_id !== 0) cleanData.fee_id = data.fee_id;
            if (data.is_active !== undefined) cleanData.is_active = data.is_active;
            // console.log('Updating category with data:', cleanData);
            const response = await updateCategory(id, cleanData);
            // console.log('Updated category response:', response);
            return response.data;
        } catch (error: any) {
            // Extract meaningful message from 409 response
            const message = error.response?.data?.message || error.message || 'Update failed';
            return rejectWithValue(message);
        }
    }
);

export const deleteExistingCategory = createAsyncThunk(
    'categories/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            await deleteCategory(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const categorySlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create
            .addCase(createNewCategory.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })
            // Update
            .addCase(updateExistingCategory.fulfilled, (state, action) => {
                const index = state.items.findIndex(c => c.id === action.payload.id);
                if (index !== -1) state.items[index] = action.payload;
            })
            // Delete
            .addCase(deleteExistingCategory.fulfilled, (state, action) => {
                state.items = state.items.filter(c => c.id !== action.payload);
            });
    },
});

export default categorySlice.reducer;