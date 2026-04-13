const BASE_URL = process.env.NEXT_PUBLIC_API_URI;

type OutOfStockParams = {
    branchId: string;
    token: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
};

export const getOutOfStockItems = async ({
    branchId,
    token,
    page = 1,
    limit = 15,
    sortBy = "name",
    sortOrder = "asc",
}: OutOfStockParams) => {
    const query = new URLSearchParams({
        branch_id: branchId,
        page: String(page),
        limit: String(limit),
        sort_by: sortBy,
        sort_order: sortOrder,
    });

    const res = await fetch(
        `${BASE_URL}/inventory/out-of-stock?${query.toString()}`,
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
        throw new Error("Failed to fetch out-of-stock items");
    }

    return res.json();
};