"use client";
import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Banknote, Calculator, ClockFading, Coffee, CookingPot, CreditCard, Download, Gift, HandCoins, History, IdCard, Upload, User, X, PauseCircle, CirclePlus, Apple, Drumstick, Milk, Croissant, Wine, IceCream, Cookie, Home, Banana, Search } from "lucide-react";
import { SalesActionsDialog } from "@/components/sales/sales-actions-modal";
import CustomerModal from "@/components/sales/customer-modal";
import CalculatorUI from "@/components/sales/calculator";
import MembershipModal from "@/components/sales/membership-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CartItem, { CartItemType } from "@/components/sales/cart-items";
import PaymentKeypad from "@/components/sales/payment-keypad";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ShoppingCart, Beef, Fish, Sandwich, Cake, CupSoda, Trash, Pizza, Popsicle } from "lucide-react";
import BarcodeScanner from "@/components/sales/barcode-scanner";
import LoyaltyModal from "@/components/sales/loyalty-modal";
import GiftCardModal from "@/components/sales/giftcard-modal";
import CashInForm from "@/components/sales/cash-in-form";
import CashOutForm from "@/components/sales/cash-out-form";
import CashPaymentModal from "@/components/sales/cash-payment-modal";
import { getInvoiceHtml } from "@/components/sales/invoice";
import DiscountModal from "@/components/sales/discount-modal";
import QuickAddModal from "@/components/sales/quick-add-modal";

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    stock: number;
    barcode?: string;
    icon?: ReactNode;
    image?: string;
    promotion?: string;
}

const CATEGORIES = [
    { name: "Produce & Floral", icon: <Apple className="size-8 text-green-600" />, count: "10,000+" },
    { name: "Meat & Seafood", icon: <Drumstick className="size-8 text-red-600" />, count: "5,000+" },
    { name: "Dairy & Eggs", icon: <Milk className="size-8 text-blue-600" />, count: "3,500+" },
    { name: "Bakery & Bread", icon: <Croissant className="size-8 text-amber-600" />, count: "2,000+" },
    { name: "Beverages", icon: <Wine className="size-8 text-purple-600" />, count: "4,500+" },
    { name: "Frozen Foods", icon: <IceCream className="size-8 text-cyan-500" />, count: "6,000+" },
    { name: "Snacks & Candy", icon: <Cookie className="size-8 text-yellow-700" />, count: "8,000+" },
    { name: "Household", icon: <Home className="size-8 text-gray-600" />, count: "12,000+" },
];

const PRODUCTS: Product[] = [
    { id: "p1", name: "Red Apple", price: 1.5, category: "Produce & Floral", stock: 50, promotion: "b2g1", icon: <Apple className="size-8 text-red-500" />, barcode: "111" },
    { id: "p2", name: "Banana", price: 0.8, category: "Produce & Floral", stock: 100, icon: <Banana className="size-8 text-yellow-500" />, barcode: "222" },
    { id: "p3", name: "Chicken Breast", price: 5.99, category: "Meat & Seafood", stock: 20, icon: <Beef className="size-8 text-red-400" />, barcode: "333" },
    { id: "p4", name: "Salmon Fillet", price: 12.99, category: "Meat & Seafood", stock: 15, icon: <Fish className="size-8 text-blue-400" />, barcode: "444" },
    { id: "p5", name: "Milk 1L", price: 2.5, category: "Dairy & Eggs", stock: 30, promotion: "b2g1", icon: <Milk className="size-8 text-blue-500" />, barcode: "555" },
    { id: "p6", name: "Large Eggs 12ct", price: 3.99, category: "Dairy & Eggs", stock: 40, icon: <Milk className="size-8 text-amber-500" />, barcode: "666" },
    { id: "p7", name: "Whole Wheat Bread", price: 3.5, category: "Bakery & Bread", stock: 25, icon: <Croissant className="size-8 text-amber-700" />, barcode: "777" },
    { id: "p8", name: "Chocolate Cake", price: 15.0, category: "Bakery & Bread", stock: 10, icon: <Cake className="size-8 text-pink-500" />, barcode: "888" },
    { id: "p9", name: "Coca Cola 500ml", price: 1.5, category: "Beverages", stock: 60, promotion: "b2g1", icon: <Wine className="size-8 text-red-600" />, barcode: "8941152014595" },
    { id: "p10", name: "Orange Juice", price: 3.0, category: "Beverages", stock: 45, icon: <Wine className="size-8 text-orange-500" />, barcode: "000" },
    { id: "p11", name: "Frozen Pizza", price: 8.99, category: "Frozen Foods", stock: 12, icon: <Pizza className="size-8 text-amber-600" />, barcode: "101" },
    { id: "p12", name: "Vanilla Ice Cream", price: 6.5, category: "Frozen Foods", stock: 18, icon: <Popsicle className="size-8 text-cyan-400" />, barcode: "102" },
    { id: "p13", name: "Potato Chips", price: 2.0, category: "Snacks & Candy", stock: 80, icon: <Cookie className="size-8 text-yellow-600" />, barcode: "103" },
    { id: "p14", name: "Chocolate Bar", price: 1.2, category: "Snacks & Candy", stock: 150, icon: <Cookie className="size-8 text-amber-900" />, barcode: "104" },
    { id: "p15", name: "Paper Towels", price: 4.5, category: "Household", stock: 35, icon: <Trash className="size-8 text-gray-400" />, barcode: "105" },
    { id: "p16", name: "Dish Soap", price: 3.0, category: "Household", stock: 28, icon: <CupSoda className="size-8 text-blue-300" />, barcode: "106" },
];

export default function SalesPage() {
    const [modalOpen, setModalOpen] = useState(false);
    const [cashPaymentOpen, setCashPaymentOpen] = useState(false);
    const [cashGiven, setCashGiven] = useState(0);
    const [modalTitle, setModalTitle] = useState<ReactNode>(null);
    const [modalContent, setModalContent] = useState<ReactNode>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [items, setItems] = useState<CartItemType[]>([]);
    const [customer, setCustomer] = useState<{ name: string; contact: string } | null>(null);
    const [taxPercent, setTaxPercent] = useState(0);
    const [discountValue, setDiscountValue] = useState(0);
    const [discountType, setDiscountType] = useState<"percentage" | "flat">("percentage");
    const [keypadResetKey, setKeypadResetKey] = useState(0);

    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const taxAmount = (subtotal * taxPercent) / 100;
    const discountAmount = 
        discountType === "percentage" 
            ? (subtotal * discountValue) / 100 
            : discountValue;
    const total = Math.max(0, subtotal + taxAmount - discountAmount);

    const handleApplyDiscount = (type: "percentage" | "flat", val: number) => {
        setDiscountType(type);
        setDiscountValue(val);
        setModalOpen(false);
    };

    const handleCancelDiscount = () => {
        setDiscountValue(0);
        setDiscountType("percentage");
        setModalOpen(false);
    };

    function handleAction(type: string, data?: any) {
        // If it's a category, just set it
        if (CATEGORIES.find(c => c.name === type)) {
            setSelectedCategory(type);
            return;
        }

        if (type === "Cash") {
            setCashGiven(data?.cashGiven || 0);
            setCashPaymentOpen(true);
            return;
        }

        // customize title and content based on type
        setModalTitle(`${type}`);
        switch (type) {
            case "Customer":
                setModalContent(<CustomerModal customer={customer} setCustomer={setCustomer} />);
                break;
            case "Membership Card Lookup":
                setModalContent(<MembershipModal />);
                break
            case "Loyalty Card Lookup":
                setModalContent(<LoyaltyModal />);
                break
            case "Find Gift Card":
                setModalContent(<GiftCardModal />)
                break
            case "Calculator":
                setModalContent(<CalculatorUI />)
                break
            case "CashIn":
                setModalContent(<CashInForm />)
                break
            case "CashOut":
                setModalContent(<CashOutForm />)
                break
            case "Discount":
                setModalContent(
                    <DiscountModal 
                        initialType={discountType}
                        initialValue={discountValue}
                        onConfirm={handleApplyDiscount}
                        onCancel={handleCancelDiscount}
                    />
                );
                break
            case "Miscellaneous":
                setModalContent(
                    <QuickAddModal 
                        onConfirm={(newItems) => {
                            setItems(prev => [...prev, ...newItems]);
                            setModalOpen(false);
                        }}
                        onCancel={() => setModalOpen(false)}
                    />
                );
                break

            default:
                setModalContent(
                    <div className="space-y-2">
                        <p>Here you can put any form or information related to <strong>{type}</strong>.</p>
                        <input
                            type="text"
                            placeholder={`Enter ${type} details...`}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                );
                break;
        }
        setModalOpen(true);
    }

    const handleProcessAndPrint = () => {
        const invoiceContent = getInvoiceHtml({
            items,
            subtotal,
            taxAmount,
            discountAmount,
            total,
            cashGiven,
            change: cashGiven - total,
            customerName: customer?.name,
            date: new Date()
        });

        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (printWindow) {
            printWindow.document.write('<html><head><title>POS Invoice</title></head><body>');
            printWindow.document.write(invoiceContent);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }

        // Finalize transaction
        setCashPaymentOpen(false);
        setItems([]);
        setCustomer(null);
        setTaxPercent(0);
        setDiscountValue(0);
        setDiscountType("percentage");
        setKeypadResetKey(prev => prev + 1);
    };

    const handleAddToCart = (product: Product) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) {
                if (existing.qty >= product.stock) return prev;
                return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
            }
            if (product.stock <= 0) return prev;
            return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1, promotion: product.promotion }];
        });
    };

    const handleUpdateQuantity = (id: string, qty: number) => {
        const product = PRODUCTS.find(p => p.id === id);
        if (product && qty > product.stock) return;

        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, qty } : item))
        );
    };

    const handleDelete = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const handleBarcodeScan = (barcode: string) => {
        const product = PRODUCTS.find((p) => p.barcode === barcode);
        if (product) {
            handleAddToCart(product);
        } else {
            console.log(`Product with barcode ${barcode} not found`);
            // You could show a toast notification here
        }
    };

    const getProductQty = (productId: string) => {
        return items.find((i) => i.id === productId)?.qty || 0;
    };

    const filteredProducts = PRODUCTS.filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.barcode?.includes(searchQuery);

        if (searchQuery) return matchesSearch;
        if (selectedCategory) return p.category === selectedCategory;
        return false;
    });

    return (
        <>
            <BarcodeScanner onScan={handleBarcodeScan} />
            <div className="w-full h-[calc(100vh-80px)] overflow-hidden p-2">
                <div className="w-full h-full grid grid-cols-1 lg:grid-cols-3 gap-2 overflow-hidden">

                    {/* Left Panel */}
                    <div className=" p-2 rounded overflow-auto">
                        <div className="grid grid-cols-1 grid-rows-5 gap-2 h-full">
                            <div className="row-span-3 p-2 w-full border border-gray-200 shadow rounded overflow-hidden">
                                {/* header row mimicking table - hidden on narrow screens where items stack */}
                                <div className="hidden xl:flex text-lg font-semibold uppercase border-b pb-1 px-3">
                                    <div className="flex-1">Name</div>
                                    <div className="w-44 text-center">Qty</div>
                                    <div className="w-36 text-right">Price</div>
                                    <div className="w-10"></div>
                                </div>
                                <div className="space-y-3 mt-2 overflow-y-auto h-[calc(100%-1rem)] xl:h-[calc(100%-3rem)] custom-scrollbar">
                                    {items.length > 0 ? (
                                        items.map((item) => (
                                            <CartItem key={item.id} item={item} onDelete={handleDelete} onUpdate={handleUpdateQuantity} onDoubleTap={() => setModalOpen(true)} />
                                        ))
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center py-20 px-4 text-center">
                                            <div className="bg-gray-50 rounded-full p-6 mb-4">
                                                <ShoppingCart className="size-12 text-gray-300" strokeWidth={1.5} />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h3>
                                            <p className="text-gray-500 max-w-[200px]">Scan a barcode or select products to start a sale</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="row-span-2">
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
                                            {customer?.contact || "No Customer Selected"}
                                        </p>

                                        {/* <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <p>
                                                <span className="font-medium text-white">Membership:</span>{" "}
                                                <span className="px-2 py-1 text-xs sm:text-sm bg-yellow-100 text-yellow-700 rounded-md">
                                                    {customer?.membership || "N/A"}
                                                </span>
                                            </p>

                                            <p>
                                                <span className="font-medium text-white">Points:</span>{" "}
                                                <span className="font-semibold text-white">{customer?.points || 0}</span>
                                            </p>
                                        </div> */}
                                    </div>

                                </div>
                                <div className="bg-gray-600 shadow-md rounded-xl p-2 w-full mt-2 mx-auto">
                                    <div className="space-y-2 text-sm sm:text-base text-white">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Subtotal</span>
                                            <span className="font-semibold">${subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Tax(%)</span>
                                            <span className="font-semibold">{taxPercent.toFixed(2)}%</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Discount {discountType === "percentage" ? "(%)" : "($)"}</span>
                                            <span className="font-semibold">
                                                {discountType === "flat" ? `$${discountValue.toFixed(2)}` : `${discountValue}%`}
                                            </span>
                                        </div>
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
                                    >
                                        <History className="size-6 md:size-7 text-yellow-300" />
                                        <span>Recent</span>
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full">5</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="bg-blue-200 p-2 rounded lg:col-span-2 overflow-hidden">

                        <div className="grid grid-rows-2 gap-2 h-full">

                            <div className="bg-white p-3 sm:p-4 rounded flex flex-col overflow-hidden">
                                <div className="flex flex-col sm:flex-row gap-2 mb-4 shrink-0">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 pointer-events-none" />
                                        <Input
                                            placeholder="Search products or scan barcode..."
                                            className="w-full h-10 sm:h-12 pl-10 border-2 border-gray-400 focus:border-blue-500 focus:ring-0 text-base sm:text-lg rounded-xl"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        className="h-10 sm:h-12 border-2 border-gray-400 hover:bg-gray-100 px-4 rounded-xl shrink-0 flex items-center justify-center"
                                        onClick={() => handleAction('Miscellaneous')}
                                    >
                                        <CirclePlus className="size-5 sm:mr-2" />
                                        <span className="hidden sm:inline text-sm font-semibold">Miscellaneous</span>
                                        <span className="sm:hidden text-xs font-semibold">Misc</span>
                                    </Button>
                                </div>

                                <div className="flex-1 overflow-auto custom-scrollbar">
                                    {!(selectedCategory || searchQuery) ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {CATEGORIES.map((cat) => (
                                                <div
                                                    key={cat.name}
                                                    onClick={() => handleAction(cat.name)}
                                                    className="flex items-center p-4 bg-black/80 rounded-2xl hover:bg-gray-900 transition-all cursor-pointer shadow-lg group border border-gray-800"
                                                >
                                                    <div className="bg-white rounded-xl p-4 flex items-center justify-center shrink-0 mr-4 transition-transform group-hover:scale-105">
                                                        {cat.icon}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-xl xl:text-2xl font-bold text-white leading-tight break-words">
                                                            {cat.name}
                                                        </span>
                                                        <span className="text-xs xl:text-sm font-medium text-gray-400 mt-1 uppercase tracking-wide">
                                                            {cat.count} Items In Stock
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white z-10 py-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-10 flex items-center gap-2 hover:bg-gray-100 px-3"
                                                    onClick={() => {
                                                        setSelectedCategory(null);
                                                        setSearchQuery("");
                                                    }}
                                                >
                                                    <ArrowLeft className="size-5" />
                                                    <span className="text-sm font-semibold">Back</span>
                                                </Button>
                                                <h3 className="text-md xl:text-2xl font-bold text-gray-800 truncate px-2">
                                                    {searchQuery ? `Search: ${searchQuery}` : selectedCategory}
                                                </h3>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                                {filteredProducts.map((product) => {
                                                    const currentQty = items.find(i => i.id === product.id)?.qty || 0;
                                                    return (
                                                        <div
                                                            key={product.id}
                                                            onClick={() => handleAddToCart(product)}
                                                            className={`flex flex-col bg-white border-2 rounded-xl p-3 hover:shadow-md transition-all cursor-pointer group text-center relative ${currentQty >= product.stock ? "border-red-200" : "border-gray-100 hover:border-blue-500"}`}
                                                        >
                                                            <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-50 relative">
                                                                <div className="absolute top-1 left-1 bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-md font-medium border border-gray-200">
                                                                    Stock: {product.stock}
                                                                </div>
                                                                {currentQty > 0 && (
                                                                    <div className={`absolute -top-2 -right-2 text-white size-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${currentQty >= product.stock ? "bg-red-500" : "bg-blue-600"}`}>
                                                                        {currentQty}
                                                                    </div>
                                                                )}
                                                                <div className="scale-110">
                                                                    {product.icon || <ShoppingCart className="size-8 text-gray-300 group-hover:text-blue-500 transition-colors" />}
                                                                </div>
                                                            </div>
                                                            <span className="text-sm xl:text-base font-bold text-gray-800 line-clamp-2 mb-1 leading-tight">{product.name}</span>
                                                            <span className="text-base xl:text-lg font-extrabold text-blue-600">${product.price.toFixed(2)}</span>

                                                            {currentQty >= product.stock && (
                                                                <div className="absolute inset-0 bg-white/40 rounded-xl flex items-center justify-center pointer-events-none">
                                                                    <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">Out of stock</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {filteredProducts.length === 0 && (
                                                <div className="text-center py-10">
                                                    <p className="text-gray-500 text-lg">No products found matching your search.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded overflow-auto">
                                <div className="flex flex-col justify-between bg-green-200 p-2 rounded h-full">
                                    {/* icon grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="w-full h-full border border-black"
                                            aria-label="Customer"
                                            onClick={() => handleAction('Customer')}
                                        >
                                            <User className="size-14 xl:size-20" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="w-full h-full border border-black"
                                            aria-label="Membership Card Lookup"
                                            onClick={() => handleAction('Membership Card Lookup')}
                                        >
                                            <IdCard className="size-14 xl:size-20" />
                                        </Button>
                                        {/* <Button
                                            variant="outline"
                                            size="icon"
                                            className="w-full h-full border border-black"
                                            aria-label="Loyalty Card Lookup"
                                            onClick={() => handleAction('Loyalty Card Lookup')}
                                        >
                                            <HandCoins className="size-14 xl:size-20" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="w-full h-full border border-black"
                                            aria-label="Gift"
                                            onClick={() => handleAction('Find Gift Card')}
                                        >
                                            <Gift className="size-14 xl:size-20" />
                                        </Button> */}
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="w-full h-full border border-black"
                                            aria-label="Calculator"
                                            onClick={() => handleAction('Calculator')}
                                        >
                                            <Calculator className="size-14 xl:size-20" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="w-full h-full border border-black"
                                            aria-label="CashIn"
                                            onClick={() => handleAction('CashIn')}
                                        >
                                            <Download className="size-14 xl:size-20" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="w-full h-full border border-black"
                                            aria-label="CashOut"
                                            onClick={() => handleAction('CashOut')}
                                        >
                                            <Upload className="size-14 xl:size-20" />
                                        </Button>
                                        {/* <Button
                                            variant="outline"
                                            size="icon"
                                            className="w-full h-full border border-black"
                                            aria-label="Banknote"
                                            onClick={() => handleAction('Banknote')}
                                        >
                                            <Banknote className="size-14 xl:size-20" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="w-full h-full border border-black"
                                            aria-label="Credit Card"
                                            onClick={() => handleAction('Credit Card')}
                                        >
                                            <CreditCard className="size-14 xl:size-20" />
                                        </Button> */}
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="w-full h-full border border-black"
                                            aria-label="History"
                                            onClick={() => handleAction('History')}
                                        >
                                            <History className="size-14 xl:size-20" />
                                        </Button>
                                    </div>
                                    {/* footer section */}
                                    <div className="mt-2 flex flex-col md:flex-row gap-2 justify-between items-center bg-gray-400 px-2 py-2 md:py-1 rounded">
                                        <div className="flex items-center space-x-2 md:space-x-3">
                                            <Avatar className="border-2 border-amber-300 size-10 md:size-12 xl:size-16">
                                                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                                <AvatarFallback>CN</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-xs xl:text-lg font-medium">John Doe</p>
                                                <p className="text-xs text-gray-600">Cashier</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="size-10 md:size-12 xl:size-16 flex items-center justify-center rounded-full border-2 border-amber-300 p-0"
                                                aria-label="Recent-1"
                                                onClick={() => handleAction('Customer')}
                                            >
                                                <ClockFading className="size-10" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="size-10 md:size-12 xl:size-16 flex items-center justify-center rounded-full border-2 border-amber-300 p-0"
                                                aria-label="Recent-1"
                                                onClick={() => handleAction('Customer')}
                                            >
                                                <Coffee className="size-10" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="size-10 md:size-12 xl:size-16 flex items-center justify-center rounded-full border-2 border-amber-300 p-0"
                                                aria-label="Recent-1"
                                                onClick={() => handleAction('Customer')}
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
                                        onSetDiscount={setDiscountValue}
                                        onSetTax={setTaxPercent}
                                        onAction={handleAction}
                                    />
                                </div>
                            </div>

                        </div>

                    </div>

                </div>
            </div>

            {/* Cash Payment Modal */}
            <CashPaymentModal
                open={cashPaymentOpen}
                onOpenChange={setCashPaymentOpen}
                items={items}
                total={total}
                cashGiven={cashGiven}
                onProcess={handleProcessAndPrint}
            />

            {/* Dialog controlled externally */}
            <SalesActionsDialog
                open={modalOpen}
                onOpenChange={setModalOpen}
                title={modalTitle}
            >
                {modalContent}
            </SalesActionsDialog>
        </>
    )
}
