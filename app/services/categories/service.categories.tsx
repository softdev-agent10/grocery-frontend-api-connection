import { apiClient } from '@/lib/apiClient';
import { Category, PaginatedResponse, SingleResponse } from '@/lib/types/api.types';

<<<<<<< HEAD
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
=======
/**
 * Category filter options
 */
export interface CategoryFilter {
  page?: number;
  limit?: number;
  search?: string;
}
>>>>>>> origin/feature/fixRerenderCart

/**
 * Category payload for create/update
 */
export interface CategoryPayload {
  name: string;
  description?: string;
  tax_id?: number;
  fee_id?: number;
  category_image?: string;
  is_active?: boolean;
}

/**
 * Get all categories (departments)
 */
export const getCategories = (filters?: CategoryFilter) =>
  apiClient.get<PaginatedResponse<Category>>('/inventory/departments', filters);

/**
 * Create a new category
 */
export const createCategory = (data: CategoryPayload) =>
  apiClient.post<SingleResponse<Category>>('/inventory/departments', data);

/**
 * Update an existing category
 */
export const updateCategory = (id: number, data: Partial<CategoryPayload>) =>
  apiClient.patch<SingleResponse<Category>>(`/inventory/departments/${id}`, data);

<<<<<<< HEAD
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
=======
/**
 * Delete a category
 */
export const deleteCategory = (id: number) =>
  apiClient.delete<{ status: string }>(`/inventory/departments/${id}`);
>>>>>>> origin/feature/fixRerenderCart
