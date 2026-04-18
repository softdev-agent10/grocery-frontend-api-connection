"use client";

import { useState } from "react";
import { createCashIn } from "@/app/services/tools/service.tools-cash";
import { Button, Input } from "@base-ui/react";
import { Textarea } from "../ui/textarea";

export default function CashInForm() {
  const [amount, setAmount] = useState<number | "">("");
  const [note, setNote] = useState("");

  const handleSubmit = async () => {
    try {
      const token = "123456"; // replace with real auth

      // TODO IMPORTANT: get real branchId (NOT hardcoded)
      const branchId = Number(localStorage.getItem("branch_id"));

      if (!branchId) {
        throw new Error("Branch ID not found");
      }

      const payload = {
        amount: Number(amount),
        note,
        device_id: "1234567890",
      };

      const res = await createCashIn({
        data: payload,
        branchId,
        token,
      });

      console.log("CashIn Success:", res);
    } catch (error) {
      console.error("CashIn Error:", error);
    }
  };

  return (
    <div className="flex flex-col mt-5">

      <Input
        placeholder="Cash In Amount"
        type="number"
        step="0.01"
        className="mb-4 md:h-12"
        value={amount}
        onChange={(e) => setAmount(e.target.value as any)}
      />

      <Textarea
        placeholder="Notes"
        className="mb-4 md:h-32"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

{/* create by agent10 */}
      <Button
        onClick={handleSubmit}
        className="bg-black text-white py-2 rounded-md w-34 "
      >
        Submit
      </Button>
    </div>
  );
}
