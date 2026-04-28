// TODO: http://192.168.0.184:40000/api/v1/workstations?branch_id=1234567890&merchant_id=9

import { apiClient } from '@/lib/apiClient';
import { Product } from '@/lib/redux/slices/productsSlice';
import { SingleResponse } from '@/lib/types/api.types';
import { i } from 'framer-motion/client';



export interface WorkstationData {
    id: number,
    branch_id: number,
    device_id: string,
    register_name: string,
    merchant_name: string,
    merchant_contact: string,
    merchant_email: string,
    merchant_address: string,
    merchant_city: string,
    merchant_country: string,
    ip_address: string | null,
    os_info: string | null,
    browser_info: string | null,
    is_active: boolean,
    is_blocked: boolean,
    failed_login_attempts: number,
    last_failed_login: string | null,
    last_login_time: string | null,
    last_logout_time: string | null,
    created_at: string,
    updated_at: string
}

interface HistoryPreviewItem {
    register_name: string,
    merchant_name: string,
    is_active: boolean,
    is_blocked: boolean,
    last_login_time: string | null,
    created_at: string
}

interface Workstation {
    status: string,
    data: {
        items: [
            WorkstationData
        ],
        history_preview: [
            HistoryPreviewItem
        ]
    }

};

interface CartItem {
    product_id: number,
    quantity: number,
    price: number,
    name?: string
}

interface WorkstationPayment {
    amount: number,
    payment_type: string,
    tip_amount: number,
    reference_id: string,
    original_reference_id: string,
    cart_items: CartItem[]
}




export const getWorkstations = () => apiClient.get<Workstation>('/workstations');

export const workstationPayment = (workstationId: string, data: WorkstationPayment) =>
    apiClient.post<SingleResponse<WorkstationPayment>>(`/workstations/${workstationId}/payment`, data);
