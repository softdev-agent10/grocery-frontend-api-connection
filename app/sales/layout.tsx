import SalesNavbar from '@/components/sales/sales-navbar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Metadata } from 'next';
import React from 'react'


export const metadata: Metadata = {
  title: "OneBalance - Sales",
  description: "Modern POS system for smart grocery stores",
};


export default function SalesPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TooltipProvider>
        <SalesNavbar />
        {children}
      </TooltipProvider>
    </div>
  )
}
