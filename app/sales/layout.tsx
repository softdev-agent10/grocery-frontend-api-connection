// import SalesNavbar from '@/components/sales/sales-navbar'
// import { TooltipProvider } from '@/components/ui/tooltip'
// import { Metadata } from 'next';
// import React from 'react'


// export const metadata: Metadata = {
//   title: "OneBalance - Sales",
//   description: "Modern POS system for smart grocery stores",
// };


// export default function SalesPageLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <TooltipProvider>
//         <SalesNavbar />
//         {children}
//       </TooltipProvider>
//     </div>
//   )
// }

// for active authentication comment out bellow code and uncomment above code
"use client";

import SalesNavbar from "@/components/sales/sales-navbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import React from "react";
import { useAuth } from "@/hooks/useAuth";

export default function SalesPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div className="p-6">Checking login...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TooltipProvider>
        <SalesNavbar />
        {children}
      </TooltipProvider>
    </div>
  );
}