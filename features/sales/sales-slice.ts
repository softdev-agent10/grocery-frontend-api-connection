import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItemType } from '@/components/sales/cart-items';
import { CardOrder, Order } from '@/components/sales/order-history';

export interface HeldSale {
  id: string;
  items: CartItemType[];
  customer: { name: string; contact: string } | null;
  taxPercent: number;
  isTaxFree: boolean;
  discountValue: number;
  discountType: 'percentage' | 'flat';
  heldAt: string; // Serialized Date
}

interface SalesState {
  items: CartItemType[];
  customer: { name: string; contact: string } | null;
  taxPercent: number;
  discountValue: number;
  discountType: 'percentage' | 'flat';
  isTaxFree: boolean;
  history: Order[];
  heldSales: HeldSale[];
  selectedCategory: string | null;
  searchQuery: string;
  keyInput: string;
  paymentStatus: 'idle' | 'pending' | 'success' | 'error';
  paymentMethod: string | null;
}

const initialState: SalesState = {
  items: [],
  customer: null,
  taxPercent: 0,
  discountValue: 0,
  discountType: 'percentage',
  isTaxFree: false,
  history: [],
  heldSales: [],
  selectedCategory: null,
  searchQuery: "",
  keyInput: "",
  paymentStatus: 'idle',
  paymentMethod: null,
};

export const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItemType>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        existingItem.qty += action.payload.qty;
      } else {
        state.items.push(action.payload);
      }
    },
    updateItemQty: (state, action: PayloadAction<{ id: string; qty: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.qty = action.payload.qty;
      }
    },
    updateItem: (state, action: PayloadAction<{ id: string; updates: Partial<CartItemType> }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        Object.assign(item, action.payload.updates);
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    setCustomer: (state, action: PayloadAction<{ name: string; contact: string } | null>) => {
      state.customer = action.payload;
    },
    setTaxPercent: (state, action: PayloadAction<number>) => {
      state.taxPercent = action.payload;
    },
    setDiscount: (state, action: PayloadAction<{ type: 'percentage' | 'flat'; value: number }>) => {
      state.discountType = action.payload.type;
      state.discountValue = action.payload.value;
    },
    setTaxFree: (state, action: PayloadAction<boolean>) => {
      state.isTaxFree = action.payload;
      if (action.payload) {
        state.taxPercent = 0;
      }
    },
    cancelSale: (state) => {
      state.items = [];
      state.customer = null;
      state.taxPercent = 0;
      state.discountValue = 0;
      state.discountType = 'percentage';
      state.isTaxFree = false;
    },
    holdSale: (state, action: PayloadAction<HeldSale>) => {
      // 1. Always prevent duplicate entries by ID (e.g., from sync)
      if (state.heldSales.some(sale => sale.id === action.payload.id)) return;
      
      // 2. If it's a local action (not from sync), prevent holding an empty cart
      // This catches double-clicks before the state can update and clear the items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isSyncAction = (action as any).meta?.isSyncAction;
      if (!isSyncAction && state.items.length === 0) return;

      state.heldSales.push(action.payload);
      // Reset current sale
      state.items = [];
      state.customer = null;
      state.taxPercent = 0;
      state.discountValue = 0;
      state.discountType = 'percentage';
      state.isTaxFree = false;
    },
    resumeSale: (state, action: PayloadAction<string>) => {
      const heldSale = state.heldSales.find(sale => sale.id === action.payload);
      if (heldSale) {
        state.items = heldSale.items;
        state.customer = heldSale.customer;
        state.taxPercent = heldSale.taxPercent;
        state.isTaxFree = heldSale.isTaxFree;
        state.discountValue = heldSale.discountValue;
        state.discountType = heldSale.discountType;
        state.heldSales = state.heldSales.filter(sale => sale.id !== action.payload);
      }
    },
    deleteHeldSale: (state, action: PayloadAction<string>) => {
      state.heldSales = state.heldSales.filter(sale => sale.id !== action.payload);
    },
    addToHistory: (state, action: PayloadAction<Order>) => {
      // Prevent duplicate entries by ID (e.g., if sync listener dispatches twice)
      if (state.history.some(order => order.id === action.payload.id)) return;
      
      state.history.unshift(action.payload);
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setKeyInput: (state, action: PayloadAction<string>) => {
      state.keyInput = action.payload;
    },
    setPaymentStatus: (state, action: PayloadAction<'idle' | 'pending' | 'success' | 'error'>) => {
      state.paymentStatus = action.payload;
    },
    setPaymentMethod: (state, action: PayloadAction<string | null>) => {
      state.paymentMethod = action.payload;
    },
    refundOrder: (state, action: PayloadAction<string>) => {
      const order = state.history.find(o => o.id === action.payload);
      if (order) {
        order.isRefunded = true;
      }
    },
  },
});

export const {
  addItem,
  updateItemQty,
  updateItem,
  removeItem,
  setCustomer,
  setTaxPercent,
  setDiscount,
  setTaxFree,
  cancelSale,
  holdSale,
  resumeSale,
  deleteHeldSale,
  addToHistory,
  setSelectedCategory,
  setSearchQuery,
  setKeyInput,
  setPaymentStatus,
  setPaymentMethod,
  refundOrder,
} = salesSlice.actions;

export default salesSlice.reducer;
