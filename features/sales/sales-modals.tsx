/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import CustomerModal from "@/components/sales/activity/customer-modal";
import CalculatorUI from "@/components/sales/calculator";
import MembershipModal from "@/components/sales/activity/membership-modal";
import LoyaltyModal from "@/components/sales/loyalty-modal";
import GiftCardModal from "@/components/sales/giftcard-modal";
import CashInForm from "@/components/sales/activity/cash-in-form";
import CashOutForm from "@/components/sales/activity/cash-out-form";
import DiscountModal from "@/components/sales/discount-modal";
import QuickAddModal from "@/components/sales/quick-add-modal";
import OrderHistory from "@/components/sales/activity/order-history";
import ItemPricingModal from "@/components/sales/item-pricing-modal";
import WorkingHourReport from "@/components/sales/working-hour-report";
import PaymentOtherModal from "@/components/sales/payment-other-modal";
import RefundModal from "@/components/sales/refund-modal";
import AttendanceModal from "@/components/sales/attendance-modal";
import { Trash } from "lucide-react";

type RenderSalesModalContentProps = {
  modalType: string | null;
  modalData: any;
  customer: any;
  dispatch: any;
  setCustomerAction: any;
  setKeyInputAction: any;
  setModalOpen: (value: boolean) => void;
  handleApplyDiscount: (type: "percentage" | "flat", val: number) => void;
  handleCancelDiscount: () => void;
  discountType: "percentage" | "flat";
  discountValue: number;
  history: any[];
  handleHistoryRefund: (order: any) => void;
  handleHistoryReprint: (order: any) => void;
  editingItem: any;
  setEditingItem: (item: any) => void;
  updateItemAction: any;
  removeItemAction: any;
  addItemAction: any;
  heldSales: any[];
  handleResumeSale: (sale: any) => void;
  handleDeleteHeldSale: (id: string) => void;
};

export const renderSalesModalContent = ({
  modalType,
  modalData,
  customer,
  dispatch,
  setCustomerAction,
  setKeyInputAction,
  setModalOpen,
  handleApplyDiscount,
  handleCancelDiscount,
  discountType,
  discountValue,
  history,
  handleHistoryRefund,
  handleHistoryReprint,
  editingItem,
  setEditingItem,
  updateItemAction,
  removeItemAction,
  addItemAction,
  heldSales,
  handleResumeSale,
  handleDeleteHeldSale,
}: RenderSalesModalContentProps) => {
  switch (modalType) {
    case "Customer":
      return (
        <CustomerModal
          customer={customer}
          setCustomer={(c: { name: string; contact: string } | null) =>
            dispatch(setCustomerAction(c))
          }
        />
      );

    case "Attendance":
      return (
        <AttendanceModal
          onClose={() => setModalOpen(false)}
          initialType={modalData || "in"}
        />
      );

    case "PaymentOther":
      return <PaymentOtherModal onClose={() => setModalOpen(false)} />;

    case "Membership Card Lookup":
      return <MembershipModal />;

    case "Loyalty Card Lookup":
      return <LoyaltyModal />;

    case "Find Gift Card":
      return <GiftCardModal />;

    case "Calculator":
      return (
        <CalculatorUI
          onCopy={(val) => {
            dispatch(setKeyInputAction(val));
            setModalOpen(false);
          }}
        />
      );

    case "CashIn":
      return <CashInForm />;

    case "CashOut":
      return <CashOutForm />;

    case "Discount":
      return (
        <DiscountModal
          initialType={discountType}
          initialValue={discountValue}
          onConfirm={handleApplyDiscount}
          onCancel={handleCancelDiscount}
        />
      );

    case "Quick Sell":
      return (
        <QuickAddModal
          onConfirm={(newItems: any[]) => {
            newItems.forEach((item) => dispatch(addItemAction(item)));
            setModalOpen(false);
          }}
          onCancel={() => setModalOpen(false)}
        />
      );

    case "Refund":
      return (
        <RefundModal
          refundOrders={history}
          onRefund={handleHistoryRefund}
          onClose={() => setModalOpen(false)}
        />
      );

    case "History":
      return (
        <OrderHistory
          ordersHistory={history}
          onClose={() => setModalOpen(false)}
          onReprint={handleHistoryReprint}
          onRefund={handleHistoryRefund}
        />
      );

    case "Working Hours":
      return <WorkingHourReport onClose={() => setModalOpen(false)} />;

    case "Item Pricing":
      if (!editingItem) return null;
      return (
        <ItemPricingModal
          item={editingItem}
          onSave={(id, updates) => {
            dispatch(updateItemAction({ id, updates }));
            setModalOpen(false);
            setEditingItem(null);
          }}
          onRemove={(id) => {
            dispatch(removeItemAction(id));
            setModalOpen(false);
            setEditingItem(null);
          }}
          onCancel={() => {
            setModalOpen(false);
            setEditingItem(null);
          }}
        />
      );

    case "Recent Holds":
      return (
        <div className="space-y-4 p-4">
          {heldSales.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No held sales found.</p>
          ) : (
            <div className="max-h-100 overflow-y-auto space-y-2">
              {heldSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-bold">{sale.customer?.name || "Guest"}</p>
                    <p className="text-sm text-gray-500">
                      {sale.items.length} Products • $
                      {sale.items.reduce(
                        (sum: number, item: any) => sum + item.price * item.qty,
                        0
                      ).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(sale.heldAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" onClick={() => handleResumeSale(sale)}>
                      Resume
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteHeldSale(sale.id)}
                    >
                      <Trash className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className="space-y-2">
          <p>
            Here you can put any form or information related to{" "}
            <strong>{modalType}</strong>.
          </p>
          <input
            type="text"
            placeholder={`Enter ${modalType} details...`}
            className="w-full border p-2 rounded"
          />
        </div>
      );
  }
};