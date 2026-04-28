/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { useNotification } from "@/hooks/useNotification";
import { Notification } from "@/components/Notification";
import {
  addItem,
  updateItemQty,
  updateItem,
  removeItem,
  setCustomer,
  setTaxPercent,
  setDiscount,
  setTaxFree,
  cancelSale,
  holdSale,
  resumeSale,
  deleteHeldSale,
  addToHistory,
  setSelectedCategory,
  setSearchQuery,
  setKeyInput,
  HeldSale,
  refundOrder,
} from "./sales-slice";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  ClockFading,
  Coffee,
  CookingPot,
  Download,
  Gift,
  History,
  IdCard,
  Upload,
  User,
  X,
  PauseCircle,
  CirclePlus,
  Search,
  Printer,
  LogOut,
  Box,
  ArrowLeft,
  ShoppingCart,
} from "lucide-react";
import { SalesActionsDialog } from "@/components/sales/sales-actions-modal";
import { processCardPayment } from "@/app/services/terminal/terminal.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CartItem, { CartItemType } from "@/components/sales/cart-items";
import PaymentKeypad from "@/components/sales/payment-keypad";
import { Input } from "@/components/ui/input";
import BarcodeScanner from "@/components/sales/barcode-scanner";
import CashPaymentModal from "@/components/sales/cash-payment-modal";
import Invoice from "@/components/sales/invoice";
import OrderHistory, { Order } from "@/components/sales/activity/order-history";
import CardPaymentModal from "@/components/sales/card-payment-modal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { cn } from "@/lib/utils";

import {
  Product,
  Category,
  CATEGORIES,
  PRODUCTS,
  getPromotionIcon,
} from "./sales-data";
import {
  fetchCategoriesApi,
  fetchProductsByCategoryApi,
  fetchPromotionsApi,
} from "./sales-api";
import {
  calculateSubtotal,
  calculateTaxAmount,
  calculateDiscountAmount,
  calculateTotal,
  findProductByBarcode,
  getFilteredProducts,
} from "./sales-handlers";
import { renderSalesModalContent } from "./sales-modals";
import {
  createOrder,
  createOrderItems,
  createOrderPayments
} from "@/app/services/orders/service.orders";
import { apiClient } from "@/lib/apiClient";
// import { USBDevice } from "electron";
import { p } from "framer-motion/client";
import { WorkstationModal } from "@/components/workstation-modal";
import { workstationPayment } from "@/app/services/workstation/service.workstation";



export default function SalesPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const cartItemsEndRef = useRef<HTMLDivElement>(null);

  const {
    items,
    customer,
    taxPercent,
    discountValue,
    discountType,
    isTaxFree,
    history,
    heldSales,
    selectedCategory,
    searchQuery,
  } = useAppSelector((state) => state.sales);

  useEffect(() => {
    if (cartItemsEndRef.current) {
      cartItemsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [items.length]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);

  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const { notification, showNotification } = useNotification();
  const [cashPaymentOpen, setCashPaymentOpen] = useState(false);
  const [cardPaymentOpen, setCardPaymentOpen] = useState(false);
  const [cashGiven, setCashGiven] = useState(0);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalType, setModalType] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);
  const [keypadResetKey, setKeypadResetKey] = useState(0);
  const [printRequested, setPrintRequested] = useState(false);
  const [isBasketOnlyPrint, setIsBasketOnlyPrint] = useState(false);
  const [reprintOrder, setReprintOrder] = useState<Order | null>(null);
  const [editingItem, setEditingItem] = useState<CartItemType | null>(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [viewMode, setViewMode] = useState<"categories" | "promotions">("categories");
  const [promotionFilterType, setPromotionFilterType] = useState<"all" | "buynget">("all");
  // const [usbDevice, setUsbDevice] = useState<USBDevice | null>(null);
  // const [selectedPrinter, setSelectedPrinter] = useState<USBDevice | null>(null);


  // For workstation selection and context
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [showWorkstationModal, setShowWorkstationModal] = useState(false);

  const subtotal = calculateSubtotal(items);
  const taxAmount = calculateTaxAmount(subtotal, taxPercent, isTaxFree);
  const discountAmount = calculateDiscountAmount(
    subtotal,
    discountType,
    discountValue
  );
  const total = calculateTotal(subtotal, taxAmount, discountAmount);

  const filteredProducts = getFilteredProducts(products, selectedCategory, searchQuery);

  const handleApplyDiscount = (type: "percentage" | "flat", val: number) => {
    dispatch(setDiscount({ type, value: val }));
    setModalOpen(false);
  };

  const handleCancelDiscount = () => {
    dispatch(setDiscount({ type: "percentage", value: 0 }));
    setModalOpen(false);
  };

  const handleCancelSale = () => {
    dispatch(cancelSale());
    setKeypadResetKey((prev) => prev + 1);
  };

  const handleHoldSale = () => {
    if (items.length === 0) return;

    const newHeldSale = {
      id: uuidv4(),
      items: [...items],
      customer,
      taxPercent,
      isTaxFree,
      discountValue,
      discountType,
      heldAt: new Date().toISOString(),
    };

    dispatch(holdSale(newHeldSale));
    setKeypadResetKey((prev) => prev + 1);
  };

  const handleResumeSale = (heldSale: HeldSale) => {
    dispatch(resumeSale(heldSale.id));
    setModalOpen(false);
  };

  const fetchProductsByCategory = async (categoryId: number) => {
    setIsLoadingProducts(true);

    try {
      const data = await fetchProductsByCategoryApi(categoryId);
      setProducts(data);
    } catch (error: any) {
      console.error("Fetch Products Error:", error.message);
      showNotification(error.message, "error");
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchCategories = async () => {
    setIsLoadingCategories(true);

    try {
      const data = await fetchCategoriesApi();
      setCategories(data);
    } catch (error: any) {
      console.error("Fetch Categories Error:", error.message);
      showNotification(error.message, "error");
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchPromotions = async () => {
    setIsLoadingPromotions(true);

    try {
      const data = await fetchPromotionsApi();
      setPromotions(data);
    } catch (error: any) {
      console.error("Fetch Promotions Error:", error.message);
      showNotification(error.message, "error");
      setPromotions([]);
    } finally {
      setIsLoadingPromotions(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchPromotions();
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedWorkstation');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.device_id) {
          setSelectedDeviceId(parsed.device_id);
          setShowWorkstationModal(false);
          return;
        }
      } catch (err) {
        console.error('Failed to parse stored workstation', err);
      }
    }
    setShowWorkstationModal(true);
  }, []);

  const handleSelectWorkstation = (deviceId: string, workstationId: number) => {
    sessionStorage.setItem('selectedWorkstation', JSON.stringify({ device_id: deviceId, workstation_id: workstationId }));
    setSelectedDeviceId(deviceId);
    setShowWorkstationModal(false);
  };

  const handleSkipWorkstation = () => {
    // Optionally store a flag that user skipped
    sessionStorage.setItem('workstationSkipped', 'true');
    setSelectedDeviceId(null);   // or keep null, meaning no workstation
    setShowWorkstationModal(false);
  };

  const handleDeleteHeldSale = (id: string) => {
    dispatch(deleteHeldSale(id));
  };

  const handleHistoryReprint = (order: Order) => {
    showNotification(`Re-printing receipt for ${order.id}...`, "success");
    setReprintOrder(order);
    setIsBasketOnlyPrint(false);
    setPrintRequested(true);

    setTimeout(() => {
      window.print();
      setPrintRequested(false);
      setReprintOrder(null);
    }, 500);
  };

  const handleHistoryRefund = (order: Order) => {
    dispatch(refundOrder(order.id));
    showNotification(`Refund processed successfully for Order ${order.id}`, "success");
  };

  async function handleAction(type: string, data?: any) {

    // TODO: Check workstation is selected or not 
    if (!selectedDeviceId) {
      setShowWorkstationModal(true);
      showNotification("Please select a workstation first", "error");
      return;
    }

    // First check if it's a category
    const apiCategory = categories.find((cat) => cat.name === type);
    if (apiCategory) {
      dispatch(setSelectedCategory(type));
      await fetchProductsByCategory(apiCategory.id);
      return;
    }

    if (CATEGORIES.find((c) => c.name === type)) {
      dispatch(setSelectedCategory(type));
      setProducts(PRODUCTS.filter((p) => p.category === type));
      return;
    }

    if (type === "Cash") {
      if (items.length === 0) {
        showNotification("Cart is empty! Add products before payment.", "error");
        return;
      }
      setCashGiven(data?.cashGiven || 0);
      setCashPaymentOpen(true);
      return;
    }

    if (type === "Tax Free") {
      dispatch(setTaxFree(!isTaxFree));
      if (!isTaxFree) {
        showNotification("Tax Free mode enabled", "success");
      } else {
        showNotification("Tax Free mode disabled", "success");
      }
      return;
    }

    if (type === "Print Basket") {
      handlePrintBasket();
      return;
    }

    if (type === "Credit Card") {
      if (items.length === 0) {
        showNotification("Cart is empty! Add products before payment.", "error");
        return;
      }
      setCardPaymentOpen(true);
      return;
    }

    if (type === "Refund") {
      setModalTitle("Refund Transaction");
      setModalType("Refund");
      setModalOpen(true);
      return;
    }

    if (type === "Clock In" || type === "Take Break" || type === "Meal Break") {
      const attendanceType =
        type === "Clock In" ? "in" : type === "Take Break" ? "break" : "meal";
      setModalTitle("Attendance");
      setModalType("Attendance");
      setModalData(attendanceType);
      setModalOpen(true);
      return;
    }

    if (type === "Other") {
      setModalTitle("Other Payments");
      setModalType("PaymentOther");
      setModalOpen(true);
      return;
    }

    if (type === "Buy N Get N") {
      setPromotionFilterType("buynget");
      setViewMode("promotions");
      setModalOpen(false);
      return;
    }

    if (type === "Promotions") {
      setPromotionFilterType("all");
      setViewMode("promotions");
      setModalOpen(false);
      return;
    }

    if (type === "Item Pricing") {
      setModalTitle("Item Pricing");
      setModalType("Item Pricing");
      setModalOpen(true);
      return;
    }

    setModalTitle(type);
    setModalType(type);
    setModalOpen(true);
  }

  const handlePrintBasket = () => {
    if (items.length === 0) {
      showNotification("Cart is empty!", "error");
      return;
    }

    setIsBasketOnlyPrint(true);
    setPrintRequested(true);

    setTimeout(() => {
      window.print();
      setPrintRequested(false);
      setIsBasketOnlyPrint(false);
    }, 300);
  };


  // const handleProcessAndPrint = async (paymentType: string) => {
  //   if (items.length === 0) {
  //     showNotification("Cart is empty!", "error");
  //     return;
  //   }

  //   try {

  //     const normalizedPaymentType = paymentType.toLowerCase();

  //     console.log(`Processing payment of type: ${normalizedPaymentType}`);

  //     console.log("Items to be processed:", items);

  //     if (normalizedPaymentType === "cash") {
  //       console.log("Processing cash payment with amount:", total);
  //     } else if (normalizedPaymentType === "card") {
  //       // Simulate card processing delay
  //       const workstation_id = sessionStorage.getItem('selectedWorkstation') ? JSON.parse(sessionStorage.getItem('selectedWorkstation') as string).workstation_id : null;
  //       console.log("Selected workstation ID:", workstation_id);
  //       const response = await workstationPayment(workstation_id, {
  //         amount: total,
  //         payment_type: paymentType,
  //         tip_amount: 0,
  //         reference_id: `${uuidv4()}`,
  //         original_reference_id: `${uuidv4()}`,
  //         cart_items: items.map(item => ({
  //           product_id: Number(item.id),   // ensure number
  //           quantity: item.qty,
  //           price: item.price,
  //           name: item.name
  //         }))
  //       });
  //     }

  //     setPrintRequested(true);
  //     setTimeout(() => {
  //       window.print();
  //       setCashPaymentOpen(false);
  //       dispatch(cancelSale());
  //       setPrintRequested(false);
  //     }, 300);

  //   } catch (error) {
  //     console.error("PROCESS ERROR:", error);
  //     showNotification("Payment failed!", "error");
  //   }
  // };
  const handleProcessAndPrint = async (paymentType: string) => {
    if (items.length === 0) {
      showNotification("Cart is empty!", "error");
      return;
    }


    try {
      if (paymentType === "sale") {


        const workstation_id = sessionStorage.getItem('selectedWorkstation') ? JSON.parse(sessionStorage.getItem('selectedWorkstation') as string).workstation_id : null;
        // console.log("Selected workstation ID:", workstation_id);
        const response = await workstationPayment(workstation_id, {
          amount: total,
          payment_type: paymentType,
          tip_amount: 0,
          reference_id: `${uuidv4()}`,
          original_reference_id: `${uuidv4()}`,
          cart_items: items.map(item => ({
            product_id: Number(item.id),   // ensure number
            quantity: item.qty,
            price: item.price,
            name: item.name
          }))
        });

        if (response.status == "success") {
          const context = apiClient.getContext();
          const branchId = context.branchId;
          // console.log("Context:", context);


          const normalizedPaymentType = paymentType.toLowerCase();
          // CREATE ORDER
          const orderRes = await createOrder({
            total_amount: Number(total.toFixed(2)),
            cash_received: Number(cashGiven.toFixed(2)),
            change_given: Number((cashGiven - total).toFixed(2)),
            transaction_type: normalizedPaymentType,
            user_role: "cashier",
            terminals: {},
            customer_id: customer?.id ?? null,
            customer_name: customer?.name ?? null,
            customer_phone: customer?.phone_number,
            customer_email: customer?.email ?? null,
          });

          const orderId = orderRes?.data?.id;
          if (!orderId) {
            throw new Error("Order ID not returned");
          }

          // CREATE ORDER ITEMS
          const itemsRes = await createOrderItems({
            order_id: orderId,
            branch_id: branchId,
            items: items.map((item) => ({
              product_id: Number(item.id),
              product_name: item.name,
              quantity: item.qty,
              price: Number(item.price.toFixed(2)),
            })),
          });

          // CREATE PAYMENT
          const paymentRes = await createOrderPayments({
            order_id: orderId,
            branch_id: branchId,
            customer_id: customer?.id ?? null,
            customer_name: customer?.name ?? null,
            customer_phone: customer?.phone_number,
            customer_email: customer?.email ?? null,
            payments: [
              {
                method: normalizedPaymentType,
                amount: Number(total.toFixed(2)),
              },
            ],
          });

          dispatch(
            addToHistory({
              id: orderId,
              date: new Date().toISOString(),
              customer: customer?.name || "Guest",
              items: [...items],
              subtotal,
              tax: taxAmount,
              discount: discountAmount,
              total,
              paymentMethod: paymentType,
              cashGiven,
              change: cashGiven - total,
            })
          );

          setPrintRequested(true);
          setTimeout(() => {
            window.print();
            setCashPaymentOpen(false);
            dispatch(cancelSale());
            setPrintRequested(false);
          }, 300);
        } else {
          throw new Error("Card payment failed at workstation");
        }

      } else {

        // console.log("===== PROCESS START =====");
        const context = apiClient.getContext();
        const branchId = context.branchId;
        // console.log("Context:", context);

        const normalizedPaymentType = paymentType.toLowerCase();
        // CREATE ORDER
        const orderRes = await createOrder({
          total_amount: Number(total.toFixed(2)),
          cash_received: Number(cashGiven.toFixed(2)),
          change_given: Number((cashGiven - total).toFixed(2)),
          transaction_type: normalizedPaymentType,
          user_role: "cashier",
          terminals: {},
          customer_id: customer?.id ?? null,
          customer_name: customer?.name ?? null,
          customer_phone: customer?.phone_number,
          customer_email: customer?.email ?? null,
        });

        const orderId = orderRes?.data?.id;
        if (!orderId) {
          throw new Error("Order ID not returned");
        }
        // CREATE ORDER ITEMS
        const itemsRes = await createOrderItems({
          order_id: orderId,
          branch_id: branchId,
          items: items.map((item) => ({
            product_id: Number(item.id),
            product_name: item.name,
            quantity: item.qty,
            price: Number(item.price.toFixed(2)),
          })),
        });
        // CREATE PAYMENT
        const paymentRes = await createOrderPayments({
          order_id: orderId,
          branch_id: branchId,
          customer_id: customer?.id ?? null,
          customer_name: customer?.name ?? null,
          customer_phone: customer?.phone_number,
          customer_email: customer?.email ?? null,
          payments: [
            {
              method: normalizedPaymentType,
              amount: Number(total.toFixed(2)),
            },
          ],
        });

        dispatch(
          addToHistory({
            id: orderId,
            date: new Date().toISOString(),
            customer: customer?.name || "Guest",
            items: [...items],
            subtotal,
            tax: taxAmount,
            discount: discountAmount,
            total,
            paymentMethod: paymentType,
            cashGiven,
            change: cashGiven - total,
          })
        );

        setPrintRequested(true);
        setTimeout(() => {
          window.print();
          setCashPaymentOpen(false);
          dispatch(cancelSale());
          setPrintRequested(false);
        }, 300);
      }



    } catch (error) {
      console.error("PROCESS ERROR:", error);
      showNotification("Payment failed!", "error");
    }
  };



  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      showNotification("Product out of stock!", "error");
      return;
    }

    const currentQty = items.find((i) => i.id === product.id)?.qty || 0;
    if (currentQty >= product.stock) {
      showNotification(`Max stock reached! Available: ${product.stock}`, "error");
      return;
    }

    dispatch(
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        qty: 1,
        stock: product.stock,
        promotion: product.promotion,
      })
    );

    localStorage.setItem("cartProducts", JSON.stringify(items));
  };

  const handleUpdateQuantity = (id: string, qty: number) => {
    const item = items.find((i) => i.id === id);
    if (item && qty > item.stock) {
      showNotification(`Insufficient stock! Available: ${item.stock}`, "error");
      return;
    }

    dispatch(updateItemQty({ id, qty }));
  };

  const handleDelete = (id: string) => {
    dispatch(removeItem(id));
  };

  const handleBarcodeScan = (barcode: string) => {
    const product = findProductByBarcode(barcode);

    if (product) {
      handleAddToCart(product);
      showNotification(`Added ${product.name} to cart`, "success");
    } else {
      // console.log(`Product with barcode ${barcode} not found`);
      showNotification(`Product with barcode ${barcode} not found`, "error");
    }
  };

  return (
    <>
      <BarcodeScanner onScan={handleBarcodeScan} />

      {notification && <Notification message={notification.message} type={notification.type} />}

      <div className="w-full h-[calc(100vh-80px)] overflow-hidden p-2">
        <div className="w-full h-full grid grid-cols-1 lg:grid-cols-3 gap-1 overflow-hidden">
          <div className="p-2 rounded overflow-auto">
            <div className="grid grid-cols-1 grid-rows-5 gap-2 h-full">
              <div className="row-span-full p-2 w-full border border-gray-200 shadow rounded overflow-hidden">
                <div className="hidden xl:flex text-lg font-semibold uppercase border-b pb-1 px-3">
                  <div className="flex-1">Name</div>
                  <div className="w-44 text-center">Qty</div>
                  <div className="w-36 text-right">Price</div>
                  <div className="w-10"></div>
                </div>

                <div
                  className={cn(
                    "mt-2 h-[calc(100%-1rem)] xl:h-[calc(100%-3rem)] custom-scrollbar",
                    items.length > 0 ? "space-y-3 overflow-y-auto" : "overflow-hidden"
                  )}
                >
                  {items.length > 0 ? (
                    items.map((item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        onDelete={handleDelete}
                        onUpdate={handleUpdateQuantity}
                        onEdit={(item) => {
                          setEditingItem(item);
                          handleAction("Item Pricing");
                        }}
                      />
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center px-4 text-center">
                      <div className="bg-gray-50 rounded-full p-6 mb-4">
                        <ShoppingCart className="size-12 text-gray-300" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h3>
                      <p className="text-gray-500 max-w-50">
                        Scan a barcode or select products to start a sale
                      </p>
                    </div>
                  )}
                  <div ref={cartItemsEndRef} />
                </div>
              </div>

              <div className="row-span-2">
                {customer && (
                  <div className="bg-gray-600 shadow-md rounded-xl p-2 w-full mx-auto">
                    <h4 className="text-white text-lg sm:text-xl font-bold mb-1">
                      Membership Information
                    </h4>

                    <div className="space-y-1 text-sm sm:text-base">
                      <p className="wrap-break-word text-white">
                        <span className="font-medium">Name:</span>{" "}
                        {customer?.name || "No Customer Selected"}
                      </p>
                      <p className="wrap-break-word text-white">
                        <span className="font-medium">Contact:</span>{" "}
                        {customer?.phone_number || "No Customer Selected"}
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-gray-600 shadow-md rounded-xl p-2 w-full mt-2 mx-auto">
                  <div className="space-y-2 text-sm sm:text-base text-white">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Subtotal</span>
                      <span className="font-semibold">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Tax(%)</span>
                      <span className="font-semibold">
                        {isTaxFree ? "Free" : `${taxPercent.toFixed(2)}%`}
                      </span>
                    </div>
                    {discountValue > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          Discount {discountType === "percentage" ? "(%)" : "($)"}
                        </span>
                        <span className="font-semibold">
                          {discountType === "flat"
                            ? `$${discountValue.toFixed(2)}`
                            : `${discountValue}%`}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-white/20 pt-2 flex items-center justify-between">
                      <span className="text-xl font-bold">Total</span>
                      <span className="text-2xl font-extrabold">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Button
                    type="button"
                    aria-label="Cancel"
                    size="lg"
                    variant="outline"
                    className="flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-500 text-white rounded-lg px-4 py-2 text-base md:text-lg w-full border-0"
                    onClick={handleCancelSale}
                  >
                    <X className="size-6 md:size-7 text-red-400" />
                    <span>Cancel</span>
                  </Button>

                  <Button
                    type="button"
                    aria-label="Hold"
                    size="lg"
                    variant="outline"
                    className="flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-500 text-white rounded-lg px-4 py-2 text-base md:text-lg w-full border-0"
                    onClick={handleHoldSale}
                  >
                    <PauseCircle className="size-6 md:size-7 text-yellow-300" />
                    <span>Hold</span>
                  </Button>

                  <Button
                    type="button"
                    aria-label="Recent Holds"
                    size="lg"
                    variant="outline"
                    className="relative flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-500 text-white rounded-lg px-4 py-2 text-base md:text-lg w-full border-0"
                    onClick={() => handleAction("Recent Holds")}
                  >
                    <History className="size-6 md:size-7 text-yellow-300" />
                    <span>Recent</span>
                    {heldSales.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full">
                        {heldSales.length}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-2 rounded lg:col-span-2 overflow-hidden">
            <div className="grid grid-rows-2 xl:grid-rows-[1fr_auto] gap-2 h-full">
              <div className="bg-white p-2 sm:p-3 rounded flex flex-col overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 mb-1 sm:mb-2 shrink-0">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 pointer-events-none" />
                    <Input
                      placeholder="Search products or scan barcode..."
                      className="w-full h-8 sm:h-10 md:h-12 pl-10 border-2 border-gray-400 focus:border-blue-500 focus:ring-0 text-sm sm:text-base rounded-xl"
                      value={searchQuery}
                      onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                    />
                  </div>

                  <Button
                    variant="outline"
                    className="h-8 sm:h-10 md:h-12 border-2 border-gray-400 hover:bg-gray-100 px-3 sm:px-4 rounded-xl shrink-0 flex items-center justify-center"
                    onClick={() => handleAction("Quick Sell")}
                  >
                    <CirclePlus className="size-5" />
                    <span className="hidden sm:inline text-sm font-semibold">Quick Sell</span>
                    <span className="sm:hidden text-xs font-semibold">Sell</span>
                  </Button>
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar">
                  {!(selectedCategory || searchQuery) ? (
                    <>
                      <div className="flex gap-2 mb-3 sticky top-0 bg-white z-10 pb-2 px-1">
                        {viewMode === "promotions" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 sm:h-10 flex items-center gap-2 hover:bg-gray-100 px-2 sm:px-3"
                            onClick={() => {
                              setViewMode("categories");
                            }}
                          >
                            <ArrowLeft className="size-5" />
                            <span className="text-sm font-semibold">Back</span>
                          </Button>
                        )}
                      </div>

                      {viewMode === "categories" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 xl:mt-2 gap-4">
                          {isLoadingCategories ? (
                            <>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                                <div key={i} className="animate-pulse">
                                  <div className="flex items-center p-4 bg-gray-200 rounded-2xl h-32"></div>
                                </div>
                              ))}
                            </>
                          ) : categories.length > 0 ? (
                            categories.map((cat) => (
                              <div
                                key={cat.id}
                                onClick={() => handleAction(cat.name)}
                                className="flex items-center p-4 bg-black/80 rounded-2xl hover:bg-gray-900 transition-all cursor-pointer shadow-lg group border border-gray-800"
                              >
                                <div className="bg-white rounded-xl p-4 flex items-center justify-center shrink-0 mr-4 transition-transform group-hover:scale-105">
                                  {cat.icon ? (
                                    cat.icon
                                  ) : (
                                    <span className="text-black font-bold text-sm">
                                      {cat.name?.slice(0, 2).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-lg xl:text-xl font-bold text-white leading-tight break-words">
                                    {cat.name}
                                  </span>
                                  <span className="text-[12px] xl:text-[13px] font-medium text-gray-400 mt-1 uppercase tracking-wide">
                                    {cat.count} In Stock
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-full text-center py-10">
                              <p className="text-gray-500">No categories available</p>
                              <button
                                onClick={fetchCategories}
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
                              >
                                Retry
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {viewMode === "promotions" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 xl:mt-2 gap-4">
                          {isLoadingPromotions ? (
                            <>
                              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="animate-pulse">
                                  <div className="flex items-center p-4 bg-gray-200 rounded-2xl h-32"></div>
                                </div>
                              ))}
                            </>
                          ) : promotions.filter(
                            (p) => promotionFilterType === "all" || p.type === "Buy N Get"
                          ).length > 0 ? (
                            promotions
                              .filter(
                                (p) => promotionFilterType === "all" || p.type === "Buy N Get"
                              )
                              .map((promo) => (
                                <div
                                  key={promo.id}
                                  onClick={() => {
                                    showNotification(`Applied promotion: ${promo.name}`, "success");
                                  }}
                                  className="flex items-center p-4 bg-black/80 rounded-2xl hover:bg-gray-900 transition-all cursor-pointer shadow-lg group border border-gray-800"
                                >
                                  <div className="bg-white rounded-xl p-4 flex items-center justify-center shrink-0 mr-4 transition-transform group-hover:scale-105">
                                    {getPromotionIcon(promo.type)}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-lg xl:text-xl font-bold text-white leading-tight break-words">
                                      {promo.name}
                                    </span>
                                    <span className="text-[12px] xl:text-[13px] font-medium text-white/80 mt-1 uppercase tracking-wide">
                                      {promo.discount}
                                    </span>
                                  </div>
                                </div>
                              ))
                          ) : (
                            <div className="col-span-full text-center py-10">
                              <p className="text-gray-500">No promotions available</p>
                              <button
                                onClick={fetchPromotions}
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
                              >
                                Retry
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1 sm:mb-2 -mt-1 sticky top-0 bg-white z-10 py-0.5 sm:py-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 sm:h-10 flex items-center gap-2 hover:bg-gray-100 px-2 sm:px-3"
                          onClick={() => {
                            dispatch(setSelectedCategory(null));
                            dispatch(setSearchQuery(""));
                          }}
                        >
                          <ArrowLeft className="size-5" />
                          <span className="text-sm font-semibold">Back</span>
                        </Button>

                        <h3 className="text-sm sm:text-md xl:text-2xl font-bold text-gray-800 truncate px-2">
                          {searchQuery ? `Search: ${searchQuery}` : selectedCategory}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-5 gap-3">
                        {filteredProducts.map((product) => {
                          const currentQty = items.find((i) => i.id === product.id)?.qty || 0;

                          return (
                            <div
                              key={product.id}
                              onClick={() => handleAddToCart(product)}
                              className={`flex bg-white border-2 rounded-xl p-2 hover:shadow-md transition-all cursor-pointer group relative items-center gap-3 ${currentQty >= product.stock
                                ? "border-red-200"
                                : "border-gray-100 hover:border-blue-500"
                                }`}
                            >
                              <div className="size-16 sm:size-20 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-50 relative">
                                <div className="absolute -top-1 -left-1 bg-gray-100 text-gray-600 text-[8px] px-1 py-0.5 rounded-md font-bold border border-gray-200 z-10">
                                  {product.stock}
                                </div>

                                {currentQty > 0 && (
                                  <div
                                    className={`absolute -top-2 -right-2 text-white size-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm z-10 ${currentQty >= product.stock ? "bg-red-500" : "bg-blue-600"
                                      }`}
                                  >
                                    {currentQty}
                                  </div>
                                )}

                                <div className="scale-100">
                                  {product.icon || (
                                    <ShoppingCart className="size-8 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col flex-1 min-w-0 text-left">
                                <span className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-2 leading-tight mb-1">
                                  {product.name}
                                </span>
                                <span className="text-sm sm:text-base font-extrabold text-blue-600">
                                  ${product.price.toFixed(2)}
                                </span>
                              </div>

                              {currentQty >= product.stock && (
                                <div className="absolute inset-0 bg-white/40 rounded-xl flex items-center justify-center pointer-events-none z-20">
                                  <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm">
                                    Out of stock
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {filteredProducts.length === 0 && (
                        <div className="text-center py-10">
                          <p className="text-gray-500 text-lg">
                            No products found matching your search.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-200 grid grid-cols-1 md:grid-cols-2 gap-2 rounded xl:overflow-visible overflow-auto">
                <div className="flex flex-col justify-between p-2 rounded h-full">
                  <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-full h-full border border-black"
                      aria-label="Customer"
                      onClick={() => handleAction("Customer")}
                    >
                      <div className="flex flex-col justify-center p-4 items-center">
                        <User className="size-6 md:size-8 xl:size-10" />
                        <p className="text-md">Customer</p>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className="w-full h-full border border-black"
                      aria-label="Membership Card Lookup"
                      onClick={() => handleAction("Membership Card Lookup")}
                    >
                      <div className="flex flex-col justify-center p-4 items-center">
                        <IdCard className="size-6 md:size-8 xl:size-10" />
                        <p className="text-md">Membership</p>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className="w-full h-full border border-black"
                      aria-label="Calculator"
                      onClick={() => handleAction("Calculator")}
                    >
                      <div className="flex flex-col justify-center p-4 items-center">
                        <Calculator className="size-6 md:size-8 xl:size-10" />
                        <p className="text-md">Calculator</p>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className="w-full h-full border border-black"
                      aria-label="CashIn"
                      onClick={() => handleAction("CashIn")}
                    >
                      <div className="flex flex-col justify-center p-4 items-center">
                        <Download className="size-6 md:size-8 xl:size-10" />
                        <p className="text-md">Cash In</p>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className="w-full h-full border border-black"
                      aria-label="CashOut"
                      onClick={() => handleAction("CashOut")}
                    >
                      <div className="flex flex-col justify-center p-4 items-center">
                        <Upload className="size-6 md:size-8 xl:size-10" />
                        <p className="text-md">Cash Out</p>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className="w-full h-full border border-black"
                      aria-label="History"
                      onClick={() => handleAction("History")}
                    >
                      <div className="flex flex-col justify-center p-4 items-center">
                        <History className="size-6 md:size-8 xl:size-10" />
                        <p className="text-md">History</p>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className="w-full h-full border border-black"
                      aria-label="Print Basket"
                      onClick={() => handleAction("Print Basket")}
                    >
                      <div className="flex flex-col justify-center p-4 items-center">
                        <Printer className="size-6 md:size-8 xl:size-10" />
                        <p className="text-md">Print Basket</p>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className="w-full h-full border border-black"
                      aria-label="Buy N Get N"
                      onClick={() => handleAction("Buy N Get N")}
                    >
                      <div className="flex flex-col justify p-4-center items-center">
                        <Box className="size-6 md:size-8 xl:size-10" />
                        <p className="text-md">Buy N Get N</p>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className="w-full h-full border border-black"
                      aria-label="Promotions"
                      onClick={() => handleAction("Promotions")}
                    >
                      <div className="flex flex-col justify-center p-4 items-center">
                        <Gift className="size-6 md:size-8 xl:size-10" />
                        <p className="text-md">Promotions</p>
                      </div>
                    </Button>
                  </div>

                  <div className="mt-2 flex flex-col md:flex-row gap-2 justify-between items-center bg-gray-400 px-2 py-2 md:py-1 rounded">
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="flex items-center space-x-2 md:space-x-3 cursor-pointer hover:bg-white/10 p-1 rounded-lg transition-colors">
                          <Avatar className="border-2 border-amber-300 size-6 md:size-8 xl:size-10">
                            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs xl:text-lg font-medium text-white">John Doe</p>
                            <p className="text-xs text-gray-200">Cashier</p>
                          </div>
                        </div>
                      </PopoverTrigger>

                      <PopoverContent
                        className="w-56 p-2 rounded-2xl shadow-2xl border-0 bg-white"
                        align="start"
                        side="top"
                      >
                        <div className="space-y-1">
                          <button
                            onClick={() => handleAction("Working Hours")}
                            className="w-full flex items-center gap-3 px-3 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                          >
                            <History className="size-4 text-blue-600" />
                            Working History
                          </button>

                          <div className="h-px bg-gray-100 my-1" />

                          <button
                            onClick={() => setLogoutConfirmOpen(true)}
                            className="w-full flex items-center gap-3 px-3 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <LogOut className="size-4" />
                            Logout
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-6 md:size-8 xl:size-10 flex items-center justify-center rounded-full border-2 border-amber-300 p-0"
                        aria-label="Clock In"
                        onClick={() => handleAction("Clock In")}
                      >
                        <ClockFading className="size-10" />
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        className="size-6 md:size-8 xl:size-10 flex items-center justify-center rounded-full border-2 border-amber-300 p-0"
                        aria-label="Take Break"
                        onClick={() => handleAction("Take Break")}
                      >
                        <Coffee className="size-10" />
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        className="size-6 md:size-8 xl:size-10 flex items-center justify-center rounded-full border-2 border-amber-300 p-0"
                        aria-label="Meal Break"
                        onClick={() => handleAction("Meal Break")}
                      >
                        <CookingPot className="size-10" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <PaymentKeypad
                    key={keypadResetKey}
                    subtotal={subtotal}
                    total={total}
                    hasItems={items.length > 0}
                    onSetDiscount={(val: number) =>
                      dispatch(setDiscount({ type: "percentage", value: val }))
                    }
                    onSetTax={(val: number) => dispatch(setTaxPercent(val))}
                    onAction={handleAction}
                    showNotification={showNotification}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CashPaymentModal
        open={items.length > 0 ? cashPaymentOpen : false}
        onOpenChange={setCashPaymentOpen}
        items={items}
        total={total}
        cashGiven={cashGiven}
        discountAmount={reprintOrder?.discount || discountAmount}
        onProcess={() => handleProcessAndPrint("Cash")}
      />

      <CardPaymentModal
        open={items.length > 0 ? cardPaymentOpen : false}
        onOpenChange={setCardPaymentOpen}
        items={items}
        discountAmount={reprintOrder?.discount || discountAmount}
        total={total}
        cashGiven={cashGiven}
        onProcess={() => handleProcessAndPrint("sale")}
        isLoading={isProcessingPayment}
      />

      <SalesActionsDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={modalTitle}
        showFooter={
          modalTitle !== "Recent Holds" &&
          modalTitle !== "History" &&
          modalTitle !== "Item Pricing" &&
          modalTitle !== "Working Hours" &&
          modalTitle !== "Attendance" &&
          modalTitle !== "Other Payments" &&
          modalTitle !== "Refund Transaction" &&
          modalTitle !== "Promotions" &&
          modalTitle !== "All Promotions"
        }
        showHeader={
          modalTitle !== "History" &&
          modalTitle !== "Item Pricing" &&
          modalTitle !== "Working Hours" &&
          modalTitle !== "Attendance" &&
          modalTitle !== "Other Payments" &&
          modalTitle !== "Refund Transaction"
        }
        className={
          modalTitle === "History" ||
            modalTitle === "Working Hours" ||
            modalTitle === "Other Payments" ||
            modalTitle === "Refund Transaction" ||
            modalTitle === "Attendance" ||
            modalTitle === "Promotions" ||
            modalTitle === "All Promotions"
            ? "w-[90%] sm:w-[70%] max-w-[90%] sm:max-w-[70%] h-[90%] sm:h-[80%] max-h-[90%] sm:max-h-[80%] p-0 overflow-hidden"
            : ""
        }
        onSubmit={(e) => {
          e.preventDefault();
          setModalOpen(false);
        }}
      >
        {renderSalesModalContent({
          modalType,
          modalData,
          customer,
          dispatch,
          setCustomerAction: setCustomer,
          setKeyInputAction: setKeyInput,
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
          updateItemAction: updateItem,
          removeItemAction: removeItem,
          addItemAction: addItem,
          heldSales,
          handleResumeSale,
          handleDeleteHeldSale,
        })}
      </SalesActionsDialog>

      <ConfirmationDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        variant="destructive"
        title="Confirm Logout"
        description="Are you sure you want to log out of the POS system? Any unsaved transaction progress may be lost."
        confirmText="Logout"
        onConfirm={() => {
          localStorage.removeItem("token");
          router.push("/login");
        }}
      />

      {printRequested && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none" }}>
          <style>{`
            @page { size: 80mm auto; margin: 0; }
            @media print {
              body * { visibility: hidden; }
              #pos-invoice, #pos-invoice * { visibility: visible; }
              #pos-invoice { position: fixed; left: 0; top: 0; }
            }
          `}</style>

          <Invoice
            items={reprintOrder ? reprintOrder.items : items}
            subtotal={reprintOrder ? reprintOrder.subtotal : subtotal}
            taxAmount={reprintOrder ? reprintOrder.tax : taxAmount}
            discountAmount={reprintOrder ? reprintOrder.discount : discountAmount}
            total={reprintOrder ? reprintOrder.total : total}
            cashGiven={reprintOrder ? reprintOrder.cashGiven : cashGiven}
            change={reprintOrder ? reprintOrder.change : cashGiven - total}
            customerName={reprintOrder ? reprintOrder.customer : customer?.name}
            date={reprintOrder ? reprintOrder.date : new Date()}
            isBasketOnly={isBasketOnlyPrint}
          />
        </div>
      )}

      {
        showWorkstationModal && (
          <WorkstationModal
            onSkip={handleSkipWorkstation}
            open={showWorkstationModal}
            onSelect={handleSelectWorkstation}
          />
        )
      }
    </>
  );
}
