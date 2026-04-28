import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUnits } from '@/app/services/units/units.service';

export interface Unit {
    id: number;
    name: string;
    description?: string;
}

interface UnitState {
    data: Unit[];
    loading: boolean;
    error: string | null;
}

const initialState: UnitState = {
    data: [],
    loading: false,
    error: null,
};

export const fetchUnits = createAsyncThunk(
    'units/fetchUnits',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getUnits();
            return response.data.items;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch units');
        }
    }
);

const unitSlice = createSlice({
    name: 'units',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUnits.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUnits.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchUnits.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError } = unitSlice.actions;
export default unitSlice.reducer;
