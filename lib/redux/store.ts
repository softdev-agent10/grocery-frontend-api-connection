import { configureStore } from '@reduxjs/toolkit';
import salesReducer from '@/features/sales/sales-slice';
import { syncMiddleware } from './sync';

export const store = configureStore({
  reducer: {
    sales: salesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore Date objects in state as they are not serializable by default
        ignoredActions: ['sales/holdSale', 'sales/addToHistory'],
        ignoredActionPaths: ['payload.heldAt', 'payload.date'],
        ignoredPaths: ['sales.heldSales.heldAt', 'sales.history.date'],
      },
    }).concat(syncMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
