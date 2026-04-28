import { redirect } from 'next/dist/server/api-utils'
import React from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {


  return (
    <div>

      {children}
    </div>
  )
}
