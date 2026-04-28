import { configureStore } from '@reduxjs/toolkit';
import salesReducer from '@/features/sales/sales-slice';
import authReducer from './slices/authSlice';
import productsReducer from './slices/productsSlice';
import categoryReducer from './slices/categorySlice';
import brandReducer from './slices/brandSlice';
import unitReducer from './slices/unitSlice';
import bulkImportReducer from './slices/bulkImportSlice';
import notificationReducer from './slices/notificationSlice';
import uiReducer from './slices/uiSlice';
import { syncMiddleware } from './sync';
import customerReducer from './slices/customerSlice';
import taxReducer from './slices/taxSlice';
import feeReducer from './slices/feeSlice';

export const store = configureStore({
  reducer: {
    sales: salesReducer,
    auth: authReducer,
    products: productsReducer,
    categories: categoryReducer,
    brands: brandReducer,
    units: unitReducer,
    bulkImport: bulkImportReducer,
    notifications: notificationReducer,
    ui: uiReducer,
    customers: customerReducer,
    taxes: taxReducer,
    fees: feeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore Date objects and File objects in state as they are not serializable by default
        ignoredActions: [
          'sales/holdSale',
          'sales/addToHistory',
          'bulkImport/setSelectedFile',
          'bulkImport/setCsvData',
          'bulkImport/setFailedRows',
        ],
        ignoredActionPaths: [
          'payload.heldAt',
          'payload.date',
          'payload.selectedFile',
          'payload.csvData',
          'payload.failedRows',
        ],
        ignoredPaths: [
          'sales.heldSales.heldAt',
          'sales.history.date',
          'bulkImport.selectedFile',
          'bulkImport.csvData',
          'bulkImport.failedRows',
        ],
      },
    }).concat(syncMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
