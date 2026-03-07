import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Wrench,
  Settings,
  HelpCircle,
  Eye,
  Layers,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  Box,
  Tag,
  DollarSign,
  Shield,
  ArrowDownCircle,
  ArrowUpCircle,
  Users,
  Gift,
  Heart,
  CreditCard,
  Megaphone,
  Inbox,
  History,
  LockOpen,
  LucideIcon,
} from "lucide-react";

// ============================================================================
// NAVIGATION STRUCTURE
// ============================================================================

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  matcher?: "exact" | "prefix";
}

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    matcher: "exact",
  },
  {
    label: "Sales",
    icon: ShoppingBag,
    href: "/sales",
    matcher: "exact",
  },
];

export const INVENTORY_ITEMS: NavItem[] = [
  {
    label: "View Product",
    icon: Eye,
    href: "/dashboard/inventory/view-product",
    matcher: "prefix",
  },
  {
    label: "Categories",
    icon: Layers,
    href: "/dashboard/inventory/categories",
    matcher: "prefix",
  },
  {
    label: "Top Selling",
    icon: TrendingUp,
    href: "/dashboard/inventory/top-selling",
    matcher: "prefix",
  },
  {
    label: "Out of Stocks",
    icon: AlertTriangle,
    href: "/dashboard/inventory/out-of-stocks",
    matcher: "prefix",
  },
  {
    label: "Low Stocks",
    icon: AlertCircle,
    href: "/dashboard/inventory/low-stocks",
    matcher: "prefix",
  },
  {
    label: "Units",
    icon: Box,
    href: "/dashboard/inventory/units",
    matcher: "prefix",
  },
  {
    label: "Brands",
    icon: Tag,
    href: "/dashboard/inventory/brands",
    matcher: "prefix",
  },
  {
    label: "Tax Fee",
    icon: DollarSign,
    href: "/dashboard/inventory/tax-fee",
    matcher: "prefix",
  },
  {
    label: "Warranties",
    icon: Shield,
    href: "/dashboard/inventory/warranties",
    matcher: "prefix",
  },
];

// TOOLS SECTION: Cash Drawer moved to top, followed by other tools
export const TOOLS_ITEMS: NavItem[] = [
  {
    label: "Cash Drawer",
    icon: DollarSign,
    href: "/dashboard/tools/cash-drawer",
    matcher: "prefix",
  },
  {
    label: "Customer Accounts",
    icon: Users,
    href: "/dashboard/tools/customer-accounts",
    matcher: "prefix",
  },
  {
    label: "Membership Card",
    icon: CreditCard,
    href: "/dashboard/tools/membership-card",
    matcher: "prefix",
  },
  {
    label: "Promotion",
    icon: Megaphone,
    href: "/dashboard/tools/promotion",
    matcher: "prefix",
  },
];

// ============================================================================
// CASH DRAWER CONFIGURATION
// ============================================================================

export interface CashDrawerTab {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const CASH_DRAWER_TABS: CashDrawerTab[] = [
  { id: "all", label: "All Transactions", icon: History },
  { id: "in", label: "Cash In", icon: ArrowDownCircle },
  { id: "out", label: "Cash Out", icon: ArrowUpCircle },
  { id: "open", label: "Open Drawer", icon: LockOpen },
];

export type TransactionType = "in" | "out" | "open";
export type UserRole = "Admin" | "Manager" | "Employee" | "Customer";

// ============================================================================
// STYLE MAPPINGS - Premium SaaS Aesthetic (Zinc-900 / Indigo-600)
// ============================================================================

/**
 * Role-based badge color scheme
 * Admin: Indigo (Primary brand color)
 * Manager: Amber (Authority)
 * Employee: Zinc (Neutral)
 * Customer: Blue (Secondary)
 */
export const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  Admin: "bg-indigo-100 text-indigo-700 border-indigo-200",
  Manager: "bg-amber-100 text-amber-700 border-amber-200",
  Employee: "bg-zinc-100 text-zinc-700 border-zinc-200",
  Customer: "bg-blue-100 text-blue-700 border-blue-200",
};

/**
 * Transaction amount color scheme
 * Cash In: Green (Positive)
 * Cash Out: Red (Negative)
 * Open: Zinc (Neutral)
 */
export const AMOUNT_STYLES: Record<TransactionType, string> = {
  in: "text-green-600 font-semibold",
  out: "text-red-600 font-semibold",
  open: "text-zinc-600 font-semibold",
};

/**
 * Transaction type icon colors for visual distinction
 */
export const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  in: "text-green-600 bg-green-50",
  out: "text-red-600 bg-red-50",
  open: "text-blue-600 bg-blue-50",
};

// ============================================================================
// BOTTOM NAVIGATION
// ============================================================================

export const SETTINGS_LINK: NavItem = {
  label: "Settings",
  icon: Settings,
  href: "/dashboard/settings",
  matcher: "prefix",
};

export const HELP_LINK: NavItem = {
  label: "Help",
  icon: HelpCircle,
  href: "/dashboard/help",
  matcher: "prefix",
};

// ============================================================================
// RESPONSIVE BREAKPOINTS
// ============================================================================

export const BREAKPOINTS = {
  VOLCORA: 220, // Volcora Customer Display width (220x1440)
  MOBILE: 640, // Tailwind sm
  NEST_HUB: 1024, // Tailwind lg
  DESKTOP: 1920, // Full desktop
} as const;

/**
 * Minimum touch target size for accessibility (Nest Hub & mobile)
 */
export const MIN_TOUCH_TARGET = 44; // pixels
