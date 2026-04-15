const BASE_URL = process.env.NEXT_PUBLIC_API_URI;

type BaseInventoryParams = {
    branchId: string;
    token: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    extraParams?: Record<string, string | number>;
};

export const fetchInventory = async (
    endpoint: string,
    {
        branchId,
        token,
        page = 1,
        limit = 15,
        sortBy = "name",
        sortOrder = "asc",
        extraParams = {},
    }: BaseInventoryParams
) => {
    const query = new URLSearchParams({
        branch_id: branchId,
        page: String(page),
        limit: String(limit),
        sort_by: sortBy,
        sort_order: sortOrder,
    });

    // append extra params dynamically
    Object.entries(extraParams).forEach(([key, value]) => {
        query.append(key, String(value));
    });

    const res = await fetch(
        `${BASE_URL}/inventory/${endpoint}?${query.toString()}`,
        {
            method: "GET",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        }
    );

    if (!res.ok) {
        throw new Error(`Failed to fetch ${endpoint}`);
    }

    return res.json();
};