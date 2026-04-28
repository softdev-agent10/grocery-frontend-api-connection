// hooks/useProducts.ts
import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { fetchProducts, deleteExistingProduct } from '@/lib/redux/thunks/productThunks';
import {
    setSearchQuery,
    setFilterStatus,
    setSortConfig,
    setCurrentPage,
    setItemsPerPage,
    clearSelectedIds,
    selectProduct,
    deselectProduct,
    setProducts,
} from '@/lib/redux/slices/productsSlice';
import { useNotification } from '@/hooks/useNotification';

export function useProducts() {
    const dispatch = useAppDispatch();
    const { showNotification } = useNotification();

    const {
        data: products,
        loading,
        totalProducts,
        currentPage,
        itemsPerPage,
        searchQuery,
        filterStatus,
        sortConfig,
        selectedIds,
    } = useAppSelector((state) => state.products);

    const [history, setHistory] = useState<any[]>([]);
    //TODO:  
    const [visibleColumns, setVisibleColumns] = useState({}); // from localStorage later

    const totalPages = Math.ceil(totalProducts / itemsPerPage);
    const inStockParam =
        filterStatus === 'In Stock' ? true : filterStatus === 'Out of Stock' ? false : undefined;

    const loadData = useCallback(async () => {
        try {
            const sortByMap: Record<string, any> = {
                selling_price: 'selling_price',
                price: 'selling_price',
                quantity: 'quantity',
                qty: 'quantity',
                upc: 'name',
                none: 'name',
                name: 'name',
            };
            const sortKey = typeof sortConfig.key === 'string' ? sortConfig.key : String(sortConfig.key);
            const mappedSortBy = sortByMap[sortKey] || 'name';
            await dispatch(
                fetchProducts({
                    page: currentPage,
                    limit: itemsPerPage,
                    search: searchQuery || undefined,
                    sort_by: mappedSortBy,
                    sort_order: sortConfig.direction,
                    in_stock: inStockParam,
                })
            ).unwrap();
        } catch (error) {
            showNotification('Failed to load products', 'error');
        }
    }, [currentPage, itemsPerPage, searchQuery, sortConfig, dispatch]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            products.forEach((p) => dispatch(selectProduct(p.id)));
        } else {
            dispatch(clearSelectedIds());
        }
    };

    const handleSelectOne = (id: number) => {
        if (selectedIds.includes(id)) {
            dispatch(deselectProduct(id));
        } else {
            dispatch(selectProduct(id));
        }
    };

    const handleBulkDelete = () => {
        // returns a promise that can be used in modal
        return async () => {
            try {
                const deletePromises = selectedIds.map((id) => dispatch(deleteExistingProduct(id)).unwrap());
                await Promise.all(deletePromises);
                dispatch(clearSelectedIds());
                showNotification(`${selectedIds.length} products deleted successfully`, 'success');
                addHistory('Bulk Delete', `Deleted ${selectedIds.length} products`);
            } catch (error: any) {
                showNotification('Failed to delete some products', 'error');
            }
        };
    };

    const addHistory = (action: string, details: string) => {
        const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            action: action === 'Add' ? 'Add' : action.includes('Delete') ? 'Delete' : 'Edit',
            details,
            timestamp: new Date().toLocaleString(),
        };
        setHistory((prev) => [newItem, ...prev].slice(0, 50));
    };

    return {
        // Data
        products,
        loading,
        totalProducts,
        currentPage,
        itemsPerPage,
        searchQuery,
        filterStatus,
        sortConfig,
        selectedIds,
        totalPages,
        history,
        visibleColumns,
        setVisibleColumns,
        // Actions
        dispatch,
        setSearchQuery: (q: string) => dispatch(setSearchQuery(q)),
        setFilterStatus: (s: string) => dispatch(setFilterStatus(s)),
        setSortConfig: (cfg: any) => dispatch(setSortConfig(cfg)),
        setCurrentPage: (p: number) => dispatch(setCurrentPage(p)),
        setItemsPerPage: (i: number) => dispatch(setItemsPerPage(i)),
        handleSelectAll,
        handleSelectOne,
        handleBulkDelete,
        addHistory,
        showNotification,
    };
}