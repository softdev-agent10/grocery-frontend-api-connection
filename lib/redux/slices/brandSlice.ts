import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getBrands } from '@/app/services/brand/brand.service';

export interface Brand {
    id: number;
    name: string;
    description?: string;
}

interface BrandState {
    data: Brand[];
    loading: boolean;
    error: string | null;
}

const initialState: BrandState = {
    data: [],
    loading: false,
    error: null,
};

export const fetchBrands = createAsyncThunk(
    'brands/fetchBrands',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getBrands();
            return response.data.items;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch brands');
        }
    }
);

const brandSlice = createSlice({
    name: 'brands',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBrands.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBrands.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchBrands.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError } = brandSlice.actions;

export default brandSlice.reducer;
