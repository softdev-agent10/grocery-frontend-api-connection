import { ReactNode } from "react";
import {
  Apple,
  Banana,
  Beef,
  Box,
  Cookie,
  Croissant,
  Fish,
  Gift,
  Home,
  IceCream,
  Milk,
  ShoppingCart,
  Drumstick,
  Wine,
  Cake,
  Pizza,
  Popsicle,
  Trash,
  CupSoda,
} from "lucide-react";

export interface Product {
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

export interface Category {
  id: number;
  name: string;
  description: string;
  count: string;
  product_count: number;
  is_active: boolean;
  taxes: any[];
  fees: any[];
  icon?: ReactNode;
}

export const CATEGORIES = [
  { name: "Produce & Floral", icon: <Apple className="size-8 text-green-600" />, count: "10,000+" },
  { name: "Meat & Seafood", icon: <Drumstick className="size-8 text-red-600" />, count: "5,000+" },
  { name: "Dairy & Eggs", icon: <Milk className="size-8 text-blue-600" />, count: "3,500+" },
  { name: "Bakery & Bread", icon: <Croissant className="size-8 text-amber-600" />, count: "2,000+" },
  { name: "Beverages", icon: <Wine className="size-8 text-purple-600" />, count: "4,500+" },
  { name: "Frozen Foods", icon: <IceCream className="size-8 text-cyan-500" />, count: "6,000+" },
  { name: "Snacks & Candy", icon: <Cookie className="size-8 text-yellow-700" />, count: "8,000+" },
  { name: "Household", icon: <Home className="size-8 text-gray-600" />, count: "12,000+" },
];

export const PRODUCTS: Product[] = [
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

export const getCategoryIcon = (categoryName: string) => {
  const iconMap: Record<string, ReactNode> = {
    "Produce & Floral": <Apple className="size-8 text-green-600" />,
    "Meat & Seafood": <Drumstick className="size-8 text-red-600" />,
    "Dairy & Eggs": <Milk className="size-8 text-blue-600" />,
    "Bakery & Bread": <Croissant className="size-8 text-amber-600" />,
    "Beverages": <Wine className="size-8 text-purple-600" />,
    "Frozen Foods": <IceCream className="size-8 text-cyan-500" />,
    "Snacks & Candy": <Cookie className="size-8 text-yellow-700" />,
    "Household": <Home className="size-8 text-gray-600" />,
  };

  return iconMap[categoryName] || <ShoppingCart className="size-8 text-gray-400" />;
};

export const getProductIcon = (productName: string) => {
  const lowerName = productName.toLowerCase();

  if (lowerName.includes("apple")) return <Apple className="size-8 text-red-500" />;
  if (lowerName.includes("banana")) return <Banana className="size-8 text-yellow-500" />;
  if (lowerName.includes("chicken")) return <Beef className="size-8 text-red-400" />;
  if (lowerName.includes("salmon") || lowerName.includes("fish")) return <Fish className="size-8 text-blue-400" />;
  if (lowerName.includes("milk")) return <Milk className="size-8 text-blue-500" />;

  return <ShoppingCart className="size-8 text-gray-400" />;
};

export const getPromotionIcon = (promotionType: string) => {
  if (promotionType === "Buy N Get") {
    return <Box className="size-8 text-blue-500" />;
  }

  if (promotionType === "Bundle") {
    return <Gift className="size-8 text-blue-500" />;
  }

  return <Box className="size-8 text-gray-400" />;
};