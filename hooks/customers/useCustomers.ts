// hooks/useCustomers.ts
import { useState, useEffect, useCallback } from "react";
import { getCustomers, createCustomer, updateCustomer, Customer } from "@/app/services/tools/service.customer";
import { useNotification } from "@/hooks/useNotification";

export function useCustomers() {
    const { showNotification } = useNotification();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCustomers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getCustomers();
            if (response.status === "success" && response.data?.items) {
                setCustomers(response.data.items);
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to fetch customers";
            setError(msg);
            showNotification(msg, "error");
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const addCustomer = useCallback(async (data: any) => {
        try {
            const response = await createCustomer({
                name: data.name,
                phone_number: data.phone,
                email: data.email,
                address: data.address,
                point: 0,
                is_active: data.status === "active",
            });
            if (response.status === "success") {
                setCustomers(prev => [response.data, ...prev]);
                showNotification(`Customer "${data.name}" created successfully!`, "success");
                return true;
            }
        } catch (err) {
            showNotification(err instanceof Error ? err.message : "Creation failed", "error");
            return false;
        }
    }, [showNotification]);

    const updateCustomerById = useCallback(async (id: string, data: Partial<Customer>) => {
        try {
            const response = await updateCustomer(id, data);
            if (response.status === "success") {
                setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...response.data } : c));
                showNotification(`Customer updated successfully!`, "success");
                return true;
            }
        } catch (err) {
            showNotification(err instanceof Error ? err.message : "Update failed", "error");
            return false;
        }
    }, [showNotification]);

    // Bulk delete not implemented, but could be added

    return {
        customers,
        isLoading,
        error,
        fetchCustomers,
        addCustomer,
        updateCustomerById,
    };
}