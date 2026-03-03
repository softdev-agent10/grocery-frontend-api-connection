import SalesNavbar from '@/components/sales/sales-navbar'
import { TooltipProvider } from '@/components/ui/tooltip'
import React from 'react'

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
