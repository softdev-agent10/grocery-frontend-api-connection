const BASE_URL = process.env.NEXT_PUBLIC_API_URI;

type TopSellingParams = {
       branchId: string;
       token: string;
       page?: number;
       limit?: number;
       startDate?: string;
       endDate?: string;
       categoryId?: number;
};

export const getTopSellings = async ({
       branchId,
       token,
       page = 1,
       limit = 15,
       startDate,
       endDate,
       categoryId,
}: TopSellingParams) => {
       const query = new URLSearchParams({
              branch_id: branchId,
              page: String(page),
              limit: String(limit),
       });

       if (startDate) query.append("start_date", startDate);
       if (endDate) query.append("end_date", endDate);
       if (categoryId) query.append("category_id", String(categoryId));

       const res = await fetch(
              `${BASE_URL}/inventory/top-sell?${query.toString()}`,
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
              throw new Error("Failed to fetch top selling products");
       }

       return res.json();
};