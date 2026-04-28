import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TableViewColumns {
    checkbox: boolean;
    name: boolean;
    upc: boolean;
    plu: boolean;
    category: boolean;
    brand: boolean;
    selling_price: boolean;
    quantity: boolean;
    in_stock: boolean;
}

interface UIState {
    isModalOpen: boolean;
    isEditModalOpen: boolean;
    isDownloadModalOpen: boolean;
    isFilterMenuOpen: boolean;
    isHistoryOpen: boolean;
    isProductOverviewOpen: boolean;
    editingProductId: number | null;
    visibleColumns: TableViewColumns;
}

const initialState: UIState = {
    isModalOpen: false,
    isEditModalOpen: false,
    isDownloadModalOpen: false,
    isFilterMenuOpen: false,
    isHistoryOpen: false,
    isProductOverviewOpen: false,
    editingProductId: null,
    visibleColumns: {
        checkbox: true,
        name: true,
        upc: true,
        plu: true,
        category: true,
        brand: true,
        selling_price: true,
        quantity: true,
        in_stock: true,
    },
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        openModal: (state) => {
            state.isModalOpen = true;
        },
        closeModal: (state) => {
            state.isModalOpen = false;
            state.editingProductId = null;
        },
        toggleEditModal: (state) => {
            state.isEditModalOpen = !state.isEditModalOpen;
        },
        toggleDownloadModal: (state) => {
            state.isDownloadModalOpen = !state.isDownloadModalOpen;
        },
        toggleFilterMenu: (state) => {
            state.isFilterMenuOpen = !state.isFilterMenuOpen;
        },
        toggleHistoryModal: (state) => {
            state.isHistoryOpen = !state.isHistoryOpen;
        },
        toggleProductOverviewModal: (state) => {
            state.isProductOverviewOpen = !state.isProductOverviewOpen;
        },
        setEditingProductId: (state, action: PayloadAction<number | null>) => {
            state.editingProductId = action.payload;
        },
        setVisibleColumns: (state, action: PayloadAction<Partial<TableViewColumns>>) => {
            state.visibleColumns = { ...state.visibleColumns, ...action.payload };
        },
        resetVisibleColumns: (state) => {
            state.visibleColumns = initialState.visibleColumns;
        },
    },
});

export const {
    openModal,
    closeModal,
    toggleEditModal,
    toggleDownloadModal,
    toggleFilterMenu,
    toggleHistoryModal,
    toggleProductOverviewModal,
    setEditingProductId,
    setVisibleColumns,
    resetVisibleColumns,
} = uiSlice.actions;

export default uiSlice.reducer;
