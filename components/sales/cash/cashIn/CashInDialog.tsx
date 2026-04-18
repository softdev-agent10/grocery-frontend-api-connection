"use client";

// import CashInForm from "./CashInForm";
// import { SalesActionsDialog } from "@/components/shared/SalesActionsDialog";
import { createCashIn } from "@/app/services/tools/service.tools-cash";
import { SalesActionsDialog } from "../../sales-actions-modal";
import CashInForm from "./cash-in-form";

export default function CashInDialog({ open, onOpenChange }: any) {

  return (
    <SalesActionsDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Cash In"
      onSubmit={async (formData) => {

        const payload = {
          amount: Number(formData.get("amount")),
          note: formData.get("note"),
          device_id: "1234567890",
        };

        const branchId = Number(localStorage.getItem("branch_id"));

        await createCashIn({
          data: payload,
          branchId,
          token: "123456",
        });

      }}
    >
      <CashInForm />
    </SalesActionsDialog>
  );
}