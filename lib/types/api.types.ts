/**
 * Reusable types for API responses
 */

// Pagination
export interface Pagination {
    current_page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
}

// Generic paginated response
export interface PaginatedResponse<T> {
    status: string;
    data: {
        data: any;
        results: any;
        items: T[];
        pagination: Pagination;
    };
    metadata?: any;
}

// Generic single item response
export interface SingleResponse<T> {
    status: string;
    data: T;
    metadata?: any;
}

// Common item types
export interface BaseEntity {
    id: number;
    created_at: string;
    updated_at: string;
}

export interface Tax extends BaseEntity {
    name: string;
    rate: number;
    is_active: boolean;
}

export interface Fee extends BaseEntity {
    name: string;
    amount: number;
    is_percentage: boolean;
    is_active: boolean;
}

export interface Category extends BaseEntity {
    name: string;
    description?: string;
    is_active: boolean;
    taxes?: number;
    fees?: number;
    tax_id?: number;
    fee_id?: number;
    product_count?: number;
}

export interface Unit extends BaseEntity {
    name: string;
    short_name: string;
    product_count?: number;
}

export interface Brand extends BaseEntity {
    name: string;
    branch_id: string;
    brand_image: string;
    created_at: string;
    updated_at: string;
    created_by: string;
    product_count: number;


}

export interface Product extends BaseEntity {
    name: string;
    sku: string;
    upc: string;
    plu: string;
    selling_price: number;
    buying_price: number;
    quantity: number;
    category_id: number;
    brand_id: number;
    unit_id: number;
    description?: string;
    is_available: boolean;
    image_url?: string;
}

export interface TopSellingProduct {
    product: {
        id: number;
        name: string;
        upc_code: string;
        plu_code: string;
        category: string;
        brand: string;
        price: string;
        unit: string;
        selling_price: string;
    };
    total_quantity_sold: string;
}

export interface LowStockProduct extends BaseEntity {
    name: string;
    upc_code: string;
    plu_code: string;
    category: {
        id: number;
        name: string;
    };
    brand: {
        id: number;
        name: string;
    };
    unit: {
        id: number;
        name: string;
    };
    selling_price: number;
    buying_price: number;
    quantity: number;
    quantity_alert: number;
    stock_status: string;
    percentage_of_alert: number;
    image_url?: string;
    last_updated: string;
}
