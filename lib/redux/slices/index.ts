// Export all slices (reducers)
export { default as authReducer } from './authSlice';
export { default as productsReducer } from './productsSlice';
export { default as categoryReducer } from './categorySlice';
export { default as brandReducer } from './brandSlice';
export { default as unitReducer } from './unitSlice';
export { default as bulkImportReducer } from './bulkImportSlice';
export { default as notificationReducer } from './notificationSlice';
export { default as uiReducer } from './uiSlice';

// Export all actions with namespaces to avoid conflicts
export * as authActions from './authSlice';
export * as productActions from './productsSlice';
export * as categoryActions from './categorySlice';
export * as brandActions from './brandSlice';
export * as unitActions from './unitSlice';
export * as bulkImportActions from './bulkImportSlice';
export * as notificationActions from './notificationSlice';
export * as uiActions from './uiSlice';


// Export types (not actions) to prevent naming conflicts
export type { AuthUser } from './authSlice';
export type { Product, ProductsState } from './productsSlice';
export type { Category } from './categorySlice';
export type { Brand } from './brandSlice';
export type { Unit } from './unitSlice';
export type { FailedRow, UploadSummary, JobProgress, BulkImportDraft } from './bulkImportSlice';
export type { Notification } from './notificationSlice';
export type { TableViewColumns } from './uiSlice';
