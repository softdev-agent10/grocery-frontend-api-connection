import { apiClient } from '@/lib/apiClient';

// Types
export interface Customer {
    is_active: unknown;
    id: number | string;
    name: string;
    phone_number?: string;
    email?: string;
    address?: string;
}

export interface CustomerFormData {
    name: string;
    contact: string;
    email: string;
    address: string;
}

// API Functions - Using the correct endpoint from your original code
export const getCustomers = (filters?: { page?: number; limit?: number; search?: string }) => {
    // Use 'customer' endpoint as in your original working code
    return apiClient.get<{ status: string; data: { items: Customer[] } }>('/tools/customer', filters);
};

export const createCustomer = (data: Partial<Customer>) => {
    // Use 'customer' endpoint as in your original working code
    return apiClient.post<{ status: string; data: Customer }>('/tools/customer', data);
};

// Helper Functions
export const validateCustomer = (formData: CustomerFormData): string | null => {
    if (!formData.name.trim() || formData.name.trim().length < 2) {
        return "Name must be at least 2 characters";
    }
    
    if (!formData.contact.trim()) {
        return "Contact number is required";
    }
    
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(formData.contact)) {
        return "Enter a valid Bangladeshi phone number (01XXXXXXXXX)";
    }
    
    if (formData.email && !/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/.test(formData.email)) {
        return "Invalid email address";
    }
    
    return null;
};