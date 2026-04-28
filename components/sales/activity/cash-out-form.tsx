"use client";

import { useMemo, useState } from "react";
import { Button } from "@base-ui/react";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import {
  createCashOut,
  validateCashOut,
} from "@/app/services/tools/service.tools-cash";
import { apiClient } from "@/lib/apiClient";

export default function CashOutForm() {
  const [amount, setAmount] = useState<number | "">("");
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const context = useMemo(() => apiClient.getContext(), []);
  const deviceId = context.branchId;
  const merchantId = context.merchantId;
  const branchId = context.branchId;

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    const validationError = validateCashOut(Number(amount));
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


      const res = await createCashOut(payload);

      // console.log("CashOut Success:", res);
      setSuccess("Cash out successful!");

      setAmount("");
      setNote("");
      setQuantity(1);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("CashOut Error:", err);
      setError(err instanceof Error ? err.message : "Failed to process cash out");
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
        placeholder="Cash Out Amount"
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