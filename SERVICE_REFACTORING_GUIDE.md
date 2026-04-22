# Service Refactoring Guide

## Key Improvements

### Before (Current)
```typescript
// ❌ REPETITIVE - Every service repeats this:
const BASE_URL = process.env.NEXT_PUBLIC_API_URI;

export const getTaxes = async ({
  branchId,
  token,
  page = 1,
  limit = 10,
}: {
  branchId: string;
  token: string;
  page?: number;
  limit?: number;
}): Promise<TaxResponse> => {
  const res = await fetch(
    `${BASE_URL}/inventory/taxes?merchant_id=9&branch_id=${branchId}&page=${page}&limit=${limit}`,
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
    throw new Error("Failed to fetch taxes");
  }

  return res.json();
};
```

**Issues:**
- ❌ Hardcoded `merchant_id=9` in every call
- ❌ Repeat token/header setup everywhere
- ❌ Manual error handling
- ❌ Duplicate pagination logic
- ❌ `branchId` and `token` passed to every function

---

### After (Refactored)
```typescript
// ✅ CLEAN - Set context once, use everywhere:
import { apiClient } from '@/lib/apiClient';
import { Tax, PaginatedResponse } from '@/lib/types/api.types';

export const getTaxes = (filters?: TaxFilter) =>
  apiClient.get<PaginatedResponse<Tax>>('/inventory/taxes', filters);

export const createTax = (data: TaxPayload) =>
  apiClient.post<SingleResponse<Tax>>('/inventory/taxes', data);
```

**Usage in Component:**
```typescript
import { useApiContext } from '@/hooks/useApiContext';
import { getTaxes } from '@/app/services/refactored.service';

function TaxManagement() {
  // Set context once - apiClient will use it for all requests
  useApiContext(9, userBranchId);

  const loadTaxes = async () => {
    // No need to pass merchant_id, branch_id, or token!
    const { data } = await getTaxes({ page: 1, limit: 10 });
    console.log(data.items);
  };
}
```

---

## Migration Checklist

### Step 1: Initialize API Context (One-time setup)
```typescript
// app/layout.tsx or app/providers/RootProvider.tsx
import { useApiContext } from '@/hooks/useApiContext';

export default function RootLayout() {
  // Set merchant_id, branch_id, and token globally
  useApiContext(9, 'main-branch');
  
  return <>{children}</>;
}
```

### Step 2: Refactor Each Service
Replace old pattern with new:

```typescript
// OLD ❌
export const updateTax = async ({
  taxId,
  branchId,
  token,
  data,
}: any) => {
  const res = await fetch(
    `${BASE_URL}/inventory/taxes/${taxId}?merchant_id=9&branch_id=${branchId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) throw new Error("Failed to update");
  return res.json();
};

// NEW ✅
export const updateTax = (id: number, data: Partial<TaxPayload>) =>
  apiClient.put<SingleResponse<Tax>>(`/inventory/taxes/${id}`, data);
```

### Step 3: Update Component Usage
```typescript
// OLD ❌
const result = await updateTax({
  taxId: 1,
  branchId: 'branch-123',
  token: 'token...',
  data: { name: 'New Tax', rate: 10 },
});

// NEW ✅
const result = await updateTax(1, {
  name: 'New Tax',
  rate: 10,
});
```

---

## Files to Create/Update

### New Infrastructure Files (Already Created ✅)
- `lib/apiClient.ts` - Generic HTTP client
- `lib/types/api.types.ts` - Reusable type definitions
- `hooks/useApiContext.ts` - React hook to set API context
- `app/services/refactored.service.ts` - Example refactored services

### Services to Update (Next Steps)
- [ ] `app/services/taxes/service.taxes.tsx`
- [ ] `app/services/fees/service.fees.ts`
- [ ] `app/services/categories/service.categories.tsx`
- [ ] `app/services/product/service.product.tsx`
- [ ] `app/services/brand/brand.service.ts`
- [ ] `app/services/units/units.service.tsx`
- [ ] `app/services/tools/serive.tools.tsx`

---

## Benefits

| Before | After |
|--------|-------|
| 300+ lines of repeated code | ~50 lines total |
| Manual error handling | Centralized error handling |
| Hardcoded merchant_id=9 | Configurable globally |
| Pass branchId to every call | Set once, use everywhere |
| Inconsistent response typing | Unified types |

---

## Example: Refactor Fees Service

**File:** `app/services/fees/service.fees.ts`

```typescript
import { apiClient } from '@/lib/apiClient';
import { Fee, PaginatedResponse, SingleResponse } from '@/lib/types/api.types';

export interface FeePayload {
  name: string;
  amount: number;
  is_percentage: boolean;
  is_active: boolean;
}

export interface FeeFilter {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
}

export const getFees = (filters?: FeeFilter) =>
  apiClient.get<PaginatedResponse<Fee>>('/inventory/fees', filters);

export const getFeeById = (id: number) =>
  apiClient.get<SingleResponse<Fee>>(`/inventory/fees/${id}`);

export const createFee = (data: FeePayload) =>
  apiClient.post<SingleResponse<Fee>>('/inventory/fees', data);

export const updateFee = (id: number, data: Partial<FeePayload>) =>
  apiClient.put<SingleResponse<Fee>>(`/inventory/fees/${id}`, data);

export const deleteFee = (id: number) =>
  apiClient.delete<{ status: string }>(`/inventory/fees/${id}`);
```

That's it! No more boilerplate.
