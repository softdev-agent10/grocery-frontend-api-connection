const BASE_URL = process.env.NEXT_PUBLIC_API_URI;

// Types for cash history (cash-in & cash-out)
export interface CashHistoryItem {
    id: number;
    amount: string;
    note: string;
    timestamp: string;
    branch_id: string;
    device_id: number;
}

export interface HistoryPreview {
    amount: string;
    note: string;
    timestamp: string;
    device_id: number;
}

export interface Pagination {
    current_page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
}

export interface CashHistoryResponse {
    status: string;
    data: {
        items: CashHistoryItem[];
        history_preview: HistoryPreview[];
        pagination: Pagination;
    };
}

// Generic cash history function - works for both /tools/cashin and /tools/cashout
export const getCashHistory = async ({
    endpoint,
    branchId,
    token,
    page = 1,
    deviceId,
    perPage = 15,
    search,
    sortBy = "date",
    order = "desc",
}: {
    endpoint: "cashin" | "cashout";
    branchId: string;
    token: string;
    page?: number;
    deviceId?: number;
    perPage?: number;
    search?: string;
    sortBy?: "amount" | "date";
    order?: "asc" | "desc";
}): Promise<CashHistoryResponse> => {
    // Build query parameters
    const queryParams = new URLSearchParams({
        branch_id: branchId,
        page: page.toString(),
        per_page: perPage.toString(),
        sort_by: sortBy,
        order: order,
    });

    // Add optional parameters
    if (deviceId) {
        queryParams.append("device_id", deviceId.toString());
    }
    if (search) {
        queryParams.append("search", search);
    }

    const res = await fetch(
        `${BASE_URL}/tools/${endpoint}?${queryParams.toString()}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        }
    );

    if (!res.ok) {
        throw new Error(`Failed to fetch cash ${endpoint} history`);
    }

    return res.json();
};

// Backwards compatible functions
export const getCashInHistory = async (params: {
    branchId: string;
    token: string;
    page?: number;
    deviceId?: number;
    perPage?: number;
    search?: string;
    sortBy?: "amount" | "date";
    order?: "asc" | "desc";
}): Promise<CashHistoryResponse> => {
    return getCashHistory({ ...params, endpoint: "cashin" });
};

export const getCashOutHistory = async (params: {
    branchId: string;
    token: string;
    page?: number;
    deviceId?: number;
    perPage?: number;
    search?: string;
    sortBy?: "amount" | "date";
    order?: "asc" | "desc";
}): Promise<CashHistoryResponse> => {
    return getCashHistory({ ...params, endpoint: "cashout" });
};

// ============================================================================
// Customer Management Types & Functions
// ============================================================================

export interface CustomerItem {
    id: number;
    card_number: string;
    name: string;
    phone_number: string;
    email: string;
    address: string;
    point: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    synced_to_backup: boolean;
}

export interface CustomerHistoryPreview {
    name: string;
    card_number: string;
    phone_number: string;
    created_at: string;
}

export interface CustomerResponse {
    status: string;
    data: {
        items: CustomerItem[];
        history_preview: CustomerHistoryPreview[];
        pagination: Pagination;
    };
}

// Fetch customer accounts with filtering and sorting
export const getCustomers = async ({
    branchId,
    token,
    page = 1,
    perPage = 15,
    search,
    isActive,
    sortBy = "created_at",
    order = "asc",
}: {
    branchId: string;
    token: string;
    page?: number;
    perPage?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: "created_at" | "name" | "point";
    order?: "asc" | "desc";
}): Promise<CustomerResponse> => {
    const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        sort_by: sortBy,
        order: order,
    });

    if (search) {
        queryParams.append("search", search);
    }
    if (isActive !== undefined) {
        queryParams.append("is_active", isActive.toString());
    }

    const res = await fetch(
        `${BASE_URL}/tools/customer?${queryParams.toString()}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch customers");
    }

    return res.json();
};

// Create new customer
export const createCustomer = async ({
    branchId,
    token,
    name,
    phone_number,
    email,
    address,
    point = 0,
    is_active = true,
}: {
    branchId: string;
    token: string;
    name: string;
    phone_number: string;
    email: string;
    address?: string;
    point?: number;
    is_active?: boolean;
}): Promise<{
    status: string;
    message: string;
    data: CustomerItem;
    metadata?: Record<string, any>;
}> => {
    const res = await fetch(
        `${BASE_URL}/tools/customer?branch_id=${branchId}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                name,
                phone_number,
                email,
                address: address || "",
                point,
                is_active,
            }),
            cache: "no-store",
        }
    );

    if (!res.ok) {
        throw new Error("Failed to create customer");
    }

    return res.json();
};

// ============================================================================
// Bundles Management Types & Functions
// ============================================================================

export interface BundleProduct {
    product_id: number;
    quantity: number;
    price: number;
}

export interface BundleItem {
    id: number;
    branch_id: string;
    name: string;
    description: string;
    type: "special" | "regular";
    subtype: "customer" | "all";
    discount_type: "flat" | "percent";
    flat_discount: string;
    percent_discount: string;
    offer_limit: number;
    plu_code: string;
    tax_id: number;
    fees_id: number;
    start_date: string;
    end_date: string;
    synced_to_backup: boolean;
    products: BundleProduct[];
}

export interface BundleResponse {
    status: string;
    data: {
        items: BundleItem[];
        pagination: Pagination;
    };
}

// Fetch bundles with filtering and sorting
export const getBundles = async ({
    branchId,
    token,
    page = 1,
    perPage = 15,
    search,
    type,
    subtype,
    discount_type,
    status,
    date_from,
    date_to,
    sort_by = "start_date",
    order = "desc",
}: {
    branchId: string;
    token: string;
    page?: number;
    perPage?: number;
    search?: string;
    type?: "special" | "regular";
    subtype?: "customer" | "all";
    discount_type?: "flat" | "percent";
    status?: "active" | "upcoming" | "expired";
    date_from?: string;
    date_to?: string;
    sort_by?: "name" | "start_date" | "end_date" | "offer_limit";
    order?: "asc" | "desc";
}): Promise<BundleResponse> => {
    const queryParams = new URLSearchParams({
        branch_id: branchId,
        page: page.toString(),
        per_page: perPage.toString(),
        sort_by: sort_by,
        order: order,
    });

    if (search) {
        queryParams.append("search", search);
    }
    if (type) {
        queryParams.append("type", type);
    }
    if (subtype) {
        queryParams.append("subtype", subtype);
    }
    if (discount_type) {
        queryParams.append("discount_type", discount_type);
    }
    if (status) {
        queryParams.append("status", status);
    }
    if (date_from) {
        queryParams.append("date_from", date_from);
    }
    if (date_to) {
        queryParams.append("date_to", date_to);
    }

    const res = await fetch(
        `${BASE_URL}/tools/bundles?${queryParams.toString()}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch bundles");
    }

    return res.json();
};

// Create new bundle
export const createBundle = async ({
    branchId,
    token,
    name,
    description,
    type,
    subtype,
    discount_type,
    flat_discount = 0,
    percent_discount = null,
    offer_limit,
    plu_code,
    tax_id,
    fees_id,
    start_date,
    end_date,
    products,
}: {
    branchId: string;
    token: string;
    name: string;
    description: string;
    type: "special" | "regular";
    subtype: "customer" | "all";
    discount_type: "flat" | "percent";
    flat_discount?: number;
    percent_discount?: number | null;
    offer_limit: number;
    plu_code: string;
    tax_id: number;
    fees_id: number;
    start_date: string;
    end_date: string;
    products: BundleProduct[];
}): Promise<{
    status: string;
    message: string;
    data: BundleItem;
    metadata?: Record<string, any>;
}> => {
    try {
        const res = await fetch(
            `${BASE_URL}/tools/bundles?branch_id=${branchId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name,
                    description,
                    type,
                    subtype,
                    discount_type,
                    flat_discount,
                    percent_discount,
                    offer_limit,
                    plu_code,
                    tax_id,
                    fees_id,
                    start_date,
                    end_date,
                    products,
                }),
                cache: "no-store",
            }
        );

        if (!res.ok) {
            let errorData: any = {};
            try {
                errorData = await res.json();
            } catch {
                errorData = { rawResponse: await res.text() };
            }
            console.error("❌ API Error Details (Bundle):", {
                status: res.status,
                statusText: res.statusText,
                errorData,
                requestBody: {
                    name,
                    description,
                    type,
                    subtype,
                    discount_type,
                    flat_discount,
                    percent_discount,
                    offer_limit,
                    plu_code,
                    tax_id,
                    fees_id,
                    start_date,
                    end_date,
                    products,
                }
            });
            throw new Error((errorData?.message || errorData?.error || `Failed to create bundle: ${res.status} ${res.statusText}`) as string);
        }

        return res.json();
    } catch (error) {
        console.error("Bundle creation error:", error);
        throw error;
    }
};

// ============================================================================
// Buy N Get Management Types & Functions
// ============================================================================

export interface BuyCondition {
    product_id: number;
    required_qty: number;
}

export interface RewardItem {
    product_id: number;
    reward_qty: number;
    reward_price_type: string;
    reward_value: number;
}

export interface BuyNGetItem {
    id: number;
    name: string;
    description: string;
    offer_type: string;
    pricing_mode: string;
    grand_reward_type: string;
    grand_reward_value: string;
    start_date: string;
    end_date: string;
    priority: number;
    offer_limit: number;
    is_active: boolean;
    buy_conditions: BuyCondition[];
    reward_items: RewardItem[];
}

export interface BuyNGetResponse {
    status: string;
    data: {
        items: BuyNGetItem[];
        pagination: Pagination;
    };
}

// Fetch buy n get offers with filtering and sorting
export const getBuyNGet = async ({
    branchId,
    token,
    page = 1,
    perPage = 15,
    search,
    pricing_mode,
    status,
    date_from,
    date_to,
    sort_by = "start_date",
    order = "desc",
}: {
    branchId: string;
    token: string;
    page?: number;
    perPage?: number;
    search?: string;
    pricing_mode?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    sort_by?: string;
    order?: "asc" | "desc";
}): Promise<BuyNGetResponse> => {
    const queryParams = new URLSearchParams({
        branch_id: branchId,
        page: page.toString(),
        per_page: perPage.toString(),
        sort_by: sort_by,
        order: order,
    });

    if (search) {
        queryParams.append("search", search);
    }
    if (pricing_mode) {
        queryParams.append("pricing_mode", pricing_mode);
    }
    if (status) {
        queryParams.append("status", status);
    }
    if (date_from) {
        queryParams.append("date_from", date_from);
    }
    if (date_to) {
        queryParams.append("date_to", date_to);
    }

    const res = await fetch(
        `${BASE_URL}/tools/offers/buy-n-get?${queryParams.toString()}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch buy n get offers");
    }

    return res.json();
};

// Create new buy n get offer
export const createBuyNGet = async ({
    branchId,
    token,
    name,
    description,
    offer_type,
    pricing_mode,
    start_date,
    end_date,
    buy_conditions,
    reward_items,
    grand_reward_type,
    grand_reward_value,
    priority,
    offer_limit,
    is_active,
}: {
    branchId: string;
    token: string;
    name: string;
    description: string;
    offer_type: string;
    pricing_mode: string;
    start_date: string;
    end_date: string;
    buy_conditions: BuyCondition[];
    reward_items: RewardItem[];
    grand_reward_type: string | null;
    grand_reward_value: number | null;
    priority: number;
    offer_limit: number;
    is_active: boolean;
}): Promise<{
    status: string;
    message: string;
    data: {
        id: number;
        name: string;
        pricing_mode: string;
        start_date: string;
        end_date: string;
    };
    metadata?: Record<string, any>;
}> => {
    try {
        const res = await fetch(
            `${BASE_URL}/tools/offers/buy-n-get?branch_id=${branchId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name,
                    description,
                    offer_type,
                    pricing_mode,
                    start_date,
                    end_date,
                    buy_conditions,
                    reward_items,
                    grand_reward_type,
                    grand_reward_value,
                    priority,
                    offer_limit,
                    is_active,
                }),
                cache: "no-store",
            }
        );

        if (!res.ok) {
            let errorData: any = {};
            try {
                errorData = await res.json();
            } catch {
                errorData = { rawResponse: await res.text() };
            }
            console.error("❌ API Error Details:", {
                status: res.status,
                statusText: res.statusText,
                errorData,
                requestBody: {
                    name,
                    description,
                    offer_type,
                    pricing_mode,
                    start_date,
                    end_date,
                    buy_conditions,
                    reward_items,
                    grand_reward_type,
                    grand_reward_value,
                    priority,
                    offer_limit,
                    is_active,
                }
            });
            throw new Error((errorData?.message || errorData?.error || `Failed to create buy n get offer: ${res.status} ${res.statusText}`) as string);
        }

        return res.json();
    } catch (error) {
        console.error("Buy N Get creation error:", error);
        throw error;
    }
}


