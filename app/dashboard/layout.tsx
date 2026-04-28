// "use client";

// import { DashboardShell } from "@/components/DashboardShell";

// interface DashboardLayoutProps {
//   children: React.ReactNode;
// }


// export default function DashboardLayout({ children }: DashboardLayoutProps) {
//   return <DashboardShell>{children}</DashboardShell>;
// }


// for active authentication comment out bellow code and uncomment above code
"use client";

import { DashboardShell } from "@/components/DashboardShell";
import { useAuth } from "@/hooks/useAuth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div className="p-6">Checking login...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <DashboardShell>{children}</DashboardShell>;
}