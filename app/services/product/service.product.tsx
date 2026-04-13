const BASE_URL = process.env.NEXT_PUBLIC_API_URI;

type ProductCategory = {
  id: number;
  name: string;
};

type ProductBrand = {
  id: number;
  name: string;
};

type ProductUnit = {
  id: number;
  name: string;
};

type ProductData = {
  id: number;
  name: string;
  selling_price: string | number;
  quantity: number;
  category: ProductCategory;
  brand: ProductBrand;
  unit: ProductUnit;
  plu: string | null;
  upc: string;
  description?: string;
  buying_price: string | number;
  custom_price?: string | number;
  quantity_alert: number;
  discount?: string | number;
  age_verification?: boolean;
  ebt_eligible?: boolean;
  sold_by_weight?: boolean;
  is_refundable?: boolean;
  warranty_period?: string;
  warranty_description?: string;
  manufacturer_date?: string;
  expiration_date?: string;
  is_available: boolean;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
};

type ProductsResponse = {
  status: string;
  data: {
    items: ProductData[];
    total?: number;
    page?: number;
    per_page?: number;
  };
  metadata?: any;
};

type ProductResponse = {
  status: string;
  data: ProductData;
  metadata?: any;
};

export const getProducts = async ({ branchId, token, page = 1, per_page = 100 }: any): Promise<ProductsResponse> => {
  const res = await fetch(
    `${BASE_URL}/inventory/products?branch_id=${branchId}&page=${page}&per_page=${per_page}`,
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

export const getProductById = async ({ branchId, token, productId }: any): Promise<ProductResponse> => {
  const res = await fetch(
    `${BASE_URL}/inventory/products/${productId}?branch_id=${branchId}`,
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
    throw new Error("Failed to fetch product details");
  }

  return res.json();
};

export const createProduct = async ({
  branchId,
  token,
  data
}: {
  branchId: string;
  token: string;
  data: Partial<ProductData>;
}): Promise<ProductResponse> => {
  try {
    const response = await fetch(
      `${BASE_URL}/inventory/products/?branch_id=${branchId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          branch_id: branchId,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("API Error Response:", errorData);
      console.error("Status:", response.status);
      throw new Error(`Failed to create product: ${response.status} - ${errorData}`);
    }

    console.log("Response from createProduct:", response);

    return await response.json();
  } catch (error) {
    console.error("Create product error:", error);
    throw error;
  }
};

export const updateProduct = async ({
  branchId,
  token,
  productId,
  data
}: {
  branchId: string;
  token: string;
  productId: number;
  data: Partial<ProductData>;
}): Promise<ProductResponse> => {
  try {
    const response = await fetch(
      `${BASE_URL}/inventory/products/${productId}?branch_id=${branchId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          branch_id: branchId,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("API Error Response:", errorData);
      console.error("Status:", response.status);
      throw new Error(`Failed to update product: ${response.status} - ${errorData}`);
    }

    console.log("Response from updateProduct:", response);

    return await response.json();
  } catch (error) {
    console.error("Update product error:", error);
    throw error;
  }
};

export const deleteProduct = async ({
  branchId,
  token,
  productId
}: {
  branchId: string;
  token: string;
  productId: number;
}): Promise<ProductResponse> => {
  try {
    const response = await fetch(
      `${BASE_URL}/inventory/products/${productId}?branch_id=${branchId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          branch_id: branchId,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete product");
    }

    return await response.json();
  } catch (error) {
    console.error("Delete product error:", error);
    throw error;
  }
};

/**
 * Helper function to transform API response to form data
 * Used for populating form fields when editing a product
 */
export const transformProductToFormData = (product: ProductData): any => {
  return {
    name: product.name,
    category_id: product.category.id,
    brand_id: product.brand.id,
    unit_id: product.unit.id,
    upc_code: product.upc,
    plu_code: product.plu,
    description: product.description || "",
    buying_price: product.buying_price,
    selling_price: product.selling_price,
    custom_price: product.custom_price || 0,
    quantity: product.quantity,
    quantity_alert: product.quantity_alert,
    discount: product.discount || 0,
    age_verification: product.age_verification || false,
    ebt_eligible: product.ebt_eligible || false,
    sold_by_weight: product.sold_by_weight || false,
    is_refundable: product.is_refundable || false,
    warranty_period: product.warranty_period || "",
    warranty_description: product.warranty_description || "",
    manufacturer_date: product.manufacturer_date ? new Date(product.manufacturer_date) : new Date(),
    expiration_date: product.expiration_date ? new Date(product.expiration_date) : new Date(),
    image_url: product.image_url || "",
    is_available: product.is_available,
  };
};

// Export types for use in other files
export type { ProductData, ProductCategory, ProductBrand, ProductUnit, ProductsResponse, ProductResponse };