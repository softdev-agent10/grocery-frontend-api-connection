const BASE_URL = process.env.NEXT_PUBLIC_API_URI;

export const getCategories = async ({ branchId, token }: any) => {
  const res = await fetch(
    `${BASE_URL}/inventory/categories?branch_id=${branchId}`,
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
    throw new Error("Failed to fetch categories");
  }

  return res.json();
};

export const createCategories = async ({
  branchId,
  token,
  data
}: {
  branchId: number;
  token: string;
  data: any;
}) => {
  const res = await fetch(
    `${BASE_URL}/inventory/categories?branch_id=${branchId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to create categories");
  }

  return res.json();
};

// updateCategory
export const updateCategory = async ({
  branchId,
  token,
  data
}: {
  branchId: number;
  token: string;
  data: any;
}) => {
  // /api/v1/inventory/categories/{category_id}
  const res = await fetch(
    `${BASE_URL}/inventory/categories/${data.id}?branch_id=${branchId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to update category");
  }

  return res.json();
};
