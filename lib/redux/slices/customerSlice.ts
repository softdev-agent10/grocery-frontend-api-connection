// lib/redux/slices/customerSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getCustomers, createCustomer, updateCustomer, Customer } from "@/app/services/tools/service.customer";

// Thunks
export const fetchCustomers = createAsyncThunk(
    "customer/fetchCustomers",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getCustomers();
            return response.data?.items || [];
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const createNewCustomer = createAsyncThunk(
    "customer/createNewCustomer",
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await createCustomer(data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateExistingCustomer = createAsyncThunk(
    "customer/updateExistingCustomer",
    async ({ id, data }: { id: string; data: Partial<Customer> }, { rejectWithValue }) => {
        try {
            const response = await updateCustomer(id, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

interface CustomerState {
    customers: Customer[];
    loading: boolean;
    error: string | null;
}

const initialState: CustomerState = {
    customers: [],
    loading: false,
    error: null,
};

const customerSlice = createSlice({
    name: "customer",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchCustomers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCustomers.fulfilled, (state, action) => {
                state.loading = false;
                state.customers = action.payload;
            })
            .addCase(fetchCustomers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create
            .addCase(createNewCustomer.fulfilled, (state, action) => {
                state.customers.unshift(action.payload);
            })
            // Update
            .addCase(updateExistingCustomer.fulfilled, (state, action) => {
                const index = state.customers.findIndex(c => c.id === action.payload.id);
                if (index !== -1) state.customers[index] = action.payload;
            });
    },
});

export default customerSlice.reducer;