"use client";

import { useState, useEffect } from "react";
import { createCashIn, validateCashIn } from "@/app/services/tools/service.tools-cash";
import { apiClient } from "@/lib/apiClient";
import { Button, Input } from "@base-ui/react";
import { Textarea } from "../ui/textarea";


export default function CashInForm() {
    const [amount, setAmount] = useState<number | "">("");
    const [note, setNote] = useState("");
    const [quantity, setQuantity] = useState<number>(1);
    const [deviceId] = useState("511020165504577");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Initialize ApiClient with your merchant context
    useEffect(() => {
        // Set your actual merchant context here
        apiClient.setContext("1", "511020165504577", "your-token-here");
    }, []);

    const handleSubmit = async () => {
        // Clear previous messages
        setError(null);
        setSuccess(null);

        // Validate amount
        const validationError = validateCashIn(Number(amount));
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                amount: Number(amount),
                note: note.trim() || undefined,
                quantity: quantity,
                device_id: deviceId,
            };
            console.log("Submitting Cash In:", payload);
            
            const res = await createCashIn(payload);
            
            console.log("CashIn Success:", res);
            setSuccess("Cash in successful!");
            
            // Reset form on success
            setAmount("");
            setNote("");
            setQuantity(1);
            
            // Auto-clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
            
        } catch (err) {
            console.error("CashIn Error:", err);
            setError(err instanceof Error ? err.message : "Failed to process cash in");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col mt-5">
            {error && (
                <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded text-green-600 text-sm">
                    {success}
                </div>
            )}

            <Input
                placeholder="Cash In Amount"
                type="number"
                step="0.01"
                className="mb-4 md:h-12"
                value={amount}
                onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                disabled={isLoading}
            />

            <Textarea
                placeholder="Notes (optional)"
                className="mb-4 md:h-32"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isLoading}
            />

            <Button
                onClick={handleSubmit}
                className="bg-black text-white py-2 rounded-md w-34"
                disabled={isLoading}
            >
                {isLoading ? "Processing..." : "Submit"}
            </Button>
        </div>
    );
}