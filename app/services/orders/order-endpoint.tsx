import {
  createOrder,
  createOrderItems,
  createOrderPayments,
} from "@/app/services/orders/service.orders";
import { apiClient } from "@/lib/apiClient";

async function handleCheckout(items: any[], total: number, cashGiven: number) {
  try {
    const context = apiClient.getContext();
    const branchId = context.branchId;

    if (!branchId) {
      throw new Error("Branch ID missing");
    }

    if (!items.length) {
      throw new Error("Cart is empty");
    }

    if (cashGiven < total) {
      throw new Error("Cash received is less than total amount");
    }

    // 1) create order
    const orderRes = await createOrder({
      total_amount: total,
      cash_received: cashGiven,
      change_given: Number((cashGiven - total).toFixed(2)),
      transaction_type: "cash",
      user_role: "cashier",
      reference_id: null as any,
      terminals: {},
    });

    // console.log("createOrder response:", orderRes);

    const orderId = orderRes?.data?.id;
    if (!orderId) {
      throw new Error("Order ID not returned from createOrder");
    }

    // 2) create order items
    const orderItemsPayload = {
      branch_id: branchId,
      order_id: orderId,
      items: items.map((item) => ({
        product_id: item.product_id ?? item.id ?? null,
        product_name: item.name,
        quantity: item.qty,
        price: item.price,
        promotion_type: item.promotion_type ?? null,
        promotion_source_id: item.promotion_source_id ?? null,
        promotion_snapshot: item.promotion_snapshot ?? null,
      })),
    };

    const itemsRes = await createOrderItems(orderItemsPayload);
    // console.log("createOrderItems response:", itemsRes);

    // 3) create order payments
    const paymentsRes = await createOrderPayments({
      order_id: orderId,
      branch_id: branchId,
      payments: [
        {
          method: "cash",
          amount: total,
        },
      ],
    });

    // console.log("createOrderPayments response:", paymentsRes);

    return {
      order: orderRes,
      items: itemsRes,
      payments: paymentsRes,
    };
  } catch (error) {
    console.error("Checkout failed:", error);
    throw error;
  }
}