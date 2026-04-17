const BASE_URL = process.env.NEXT_PUBLIC_API_URI;

/**
 * Get all available terminals
 */
export const getTerminals = async ({ token }: { token: string }) => {
    const res = await fetch(`${BASE_URL}/api/v1/terminals/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch terminals");
    }

    return res.json();
};

/**
 * Create a new terminal
 */
export const createTerminal = async (
    {
        workstation_id,

        branch_id,
        processor_id,
        terminal_name,
        is_active,
    }: {
        workstation_id: number;
        branch_id: number;
        processor_id: number;
        terminal_name: string;
        is_active: boolean;
    },
    { token }: { token: string }
) => {
    const res = await fetch(`${BASE_URL}/api/v1/terminals/create/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            workstation_id,
            branch_id,
            processor_id,
            terminal_name,
            is_active,
        }),
        cache: "no-store",
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.detail || "Failed to create terminal");
    }

    return res.json();
};

/**
 * Process card payment through terminal (FAKE API for testing)
 * Simulates 5-10 second delay and random success/failure
 */
export const processCardPayment = async (
    {
        amount,
        terminal_id,
        order_id,
    }: {
        amount: number;
        terminal_id: number;
        order_id: string;
    },
    { token }: { token: string }
) => {
    // Simulate API delay: 5-10 seconds
    const delay = Math.random() * 5000 + 5000; // 5000-10000ms
    await new Promise(resolve => setTimeout(resolve, delay));

    // Randomly succeed or fail (70% success, 30% failure)
    const isSuccess = Math.random() > 0.3;

    if (!isSuccess) {
        throw new Error("Card payment declined. Please try another card or payment method.");
    }

    // Return fake successful response
    return {
        status: "success",
        message: "Payment processed successfully",
        data: {
            order_id,
            amount,
            terminal_id,
            transaction_id: `TXN-${Date.now()}`,
            card_last4: "4242",
            auth_code: "AUTH123456",
            timestamp: new Date().toISOString(),
        },
    };
};
