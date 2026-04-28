import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getFees } from '@/app/services/fees/service.fees';

interface Fee {
    id: number;
    name: string;
    amount: number;
    is_percentage: boolean;
    is_active: boolean;
}

interface FeeState {
    items: Fee[];
    loading: boolean;
    error: string | null;
}

const initialState: FeeState = {
    items: [],
    loading: false,
    error: null,
};

export const fetchFees = createAsyncThunk('fees/fetch', async () => {
    const response = await getFees({ page: 1, limit: 100 });
    return response.data.items;
});

const feeSlice = createSlice({
    name: 'fees',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFees.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchFees.fulfilled, (state, action: PayloadAction<Fee[]>) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchFees.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch fees';
            });
    },
});

export default feeSlice.reducer;