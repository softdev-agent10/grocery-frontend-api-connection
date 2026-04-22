const BASE_URL = process.env.NEXT_PUBLIC_API_URI;

export const getCategories = async ({  merchant_id,branchId, token }: any) => {
  const res = await fetch(
    `${BASE_URL}/inventory/departments?merchant_id=${merchant_id}&branch_id=${branchId}`,   
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  // // Log the actual response
  // console.log("Response status:", res.status);
  // console.log("Response status text:", res.statusText);

  // Get the actual error message from API
  // const responseText = await res.text();
  // console.log("Response body:", responseText);


  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  return res.json();
};

//  GET PRODUCTS BY CATEGORY
export const getProductsByCategory = async ({
  merchant_id,
  branchId,
  categoryId,
  token,
}: {
  merchant_id: number;
  branchId: number;
  categoryId: number;
  token: string;
}) => {
  const res = await fetch(
    `${BASE_URL}/inventory/products?merchant_id=${merchant_id}&branch_id=${branchId}&departments_id=${categoryId}`,
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
    throw new Error("Failed to fetch products");
  }

  return res.json();
};
export const createCategories = async ({
  merchant_id,
  branchId,
  token,
  data
}: {
  merchant_id: number;
  branchId: string;
  token: string;
  data: unknown;
}) => {
  const res = await fetch(
    `${BASE_URL}/inventory/departments?merchant_id=${merchant_id}&branch_id=${branchId}`,
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
    merchant_id,
  branchId,
  token,
  data
}: {  
  merchant_id: number;
  branchId: string;
  token: string;
  data: unknown;
}) => {
  // /api/v1/inventory/categories/{category_id}
  const res = await fetch(
    `${BASE_URL}/inventory/departments?merchant_id=${merchant_id}&branch_id=${branchId}`,
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
