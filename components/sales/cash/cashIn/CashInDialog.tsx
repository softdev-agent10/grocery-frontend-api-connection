"use client";

// import CashInForm from "./CashInForm";
// import { SalesActionsDialog } from "@/components/shared/SalesActionsDialog";
import { CashInPayload, createCashIn } from "@/app/services/tools/service.tools-cash";
import { SalesActionsDialog } from "../../sales-actions-modal";
import CashInForm from "../../activity/cash-in-form";
// import CashInForm from "./cash-in-form";

export default function CashInDialog({ open, onOpenChange }: any) {

  return (
    <SalesActionsDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Cash In"
      onSubmit={async (e) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        const payload = {
          amount: Number(formData.get("amount")),
          note: formData.get("note"),
          quantity: Number(formData.get("quantity")),
          device_id: "1234567890",
        } as any;

        const branchId = Number(localStorage.getItem("branch_id"));

        await createCashIn(payload);
      }}
    >
      <CashInForm />
    </SalesActionsDialog>
  );
}