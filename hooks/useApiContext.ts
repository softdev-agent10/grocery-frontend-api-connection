/**
 * React Hook to manage API context (merchant_id, branch_id, token)
 * Automatically sets context in apiClient singleton
 */

import { useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from './useAuth'; // Your existing auth hook

export const useApiContext = (merchantId?: string, branchId?: string) => {
    const { token } = useAuth(); // Get token from your auth hook

    useEffect(() => {
        if (merchantId !== undefined && branchId && token) {
            apiClient.setContext(merchantId, branchId, token);
        }
    }, [merchantId, branchId, token]);

    return apiClient;
};

/**
 * Alternative: Set context at app level in layout or provider
 * 
 * // app/layout.tsx or app/providers/RootProvider.tsx
 * import { useApiContext } from '@/hooks/useApiContext';
 * 
 * function RootLayout() {
 *   useApiContext(9, 'default-branch-id');
 *   return <>{children}</>;
 * }
 */
