import { apiClient } from "@/lib/apiClient";



export interface TerminalData {
    amount: number;
    payment_type: string;
    tip_amount: number;
    reference_id: string;
    original_reference_id: string;
    cart_items: [
        {
            id: number;
            name: string;
            quantity: number;
            price: number;
        }
    ]
}

interface TerminalResponse {
    status: string;
    data: {
        items: TerminalData[];
    }
}

export const getTerminals = () => apiClient.get<TerminalResponse>('/terminals');

export const getTerminalById = (id: number) => apiClient.get<TerminalData>(`/terminals/${id}`);

export const createTerminal = (terminal: Omit<TerminalData, 'id'>) => apiClient.post<TerminalData>('/terminals', terminal);

export const updateTerminal = (id: number, terminal: Partial<Omit<TerminalData, 'id'>>) => apiClient.put<TerminalData>(`/terminals/${id}`, terminal);

export const deleteTerminal = (id: number) => apiClient.delete(`/terminals/${id}`);