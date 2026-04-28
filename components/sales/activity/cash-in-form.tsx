"use client";

import { useMemo, useState } from "react";
import { createCashIn, validateCashIn } from "@/app/services/tools/service.tools-cash";
import { apiClient } from "@/lib/apiClient";
import { Button, Input } from "@base-ui/react";
import { Textarea } from "../../ui/textarea";
import { de } from "date-fns/locale";

function CashInForm() {
    const [amount, setAmount] = useState<number | "">("");
    const [note, setNote] = useState("");
    const [quantity, setQuantity] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Read current context directly from apiClient
    const context = useMemo(() => apiClient.getContext(), []);
    const deviceId = context.branchId;
    const merchantId = context.merchantId;
    const branchId = context.branchId;

    const handleSubmit = async () => {
        setError(null);
        setSuccess(null);

        const validationError = validateCashIn(Number(amount));
        if (validationError) {
            setError(validationError);
            return;
        }

        if (!merchantId || !branchId) {
            setError("Merchant ID or Branch ID is missing in apiClient context");
            return;
        }

        if (!deviceId) {
            setError("Device ID is missing");
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                amount: Number(amount),
                note: note.trim() || undefined,
                quantity,
                device_id: deviceId,
            };



            const res = await createCashIn(payload);

            // console.log("CashIn Success:", res);
            setSuccess("Cash in successful!");

            setAmount("");
            setNote("");
            setQuantity(1);

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
                <div className="mb-4 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-600">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 rounded border border-green-200 bg-green-50 p-2 text-sm text-green-600">
                    {success}
                </div>
            )}

            <Input
                placeholder="Cash In Amount"
                type="number"
                step="0.01"
                className="mb-4 md:h-12"
                value={amount}
                onChange={(e) =>
                    setAmount(e.target.value === "" ? "" : Number(e.target.value))
                }
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
                className="w-34 rounded-md bg-black py-2 text-white"
                disabled={isLoading}
            >
                {isLoading ? "Processing..." : "Submit"}
            </Button>
        </div>
    );
}

export default CashInForm;