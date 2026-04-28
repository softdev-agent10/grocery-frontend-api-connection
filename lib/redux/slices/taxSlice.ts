import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getTaxes } from '@/app/services/taxes/service.taxes';

interface Tax {
    id: number;
    name: string;
    rate: number;
    is_active: boolean;
}

interface TaxState {
    items: Tax[];
    loading: boolean;
    error: string | null;
}

const initialState: TaxState = {
    items: [],
    loading: false,
    error: null,
};

export const fetchTaxes = createAsyncThunk('taxes/fetch', async () => {
    const response = await getTaxes({ page: 1, limit: 100 });
    return response.data.items;
});

const taxSlice = createSlice({
    name: 'taxes',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTaxes.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTaxes.fulfilled, (state, action: PayloadAction<Tax[]>) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchTaxes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch taxes';
            });
    },
});

export default taxSlice.reducer;