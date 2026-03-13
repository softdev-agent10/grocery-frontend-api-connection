"use client"

import * as React from "react"
import { useState } from "react"
import { X, Delete, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PinPadProps {
  onSuccess: () => void
  onCancel: () => void
  correctPin: string
  title?: string
  description?: string
}

export function PinPad({
  onSuccess,
  onCancel,
  correctPin,
  title = "Enter PIN",
  description = "Please enter your security PIN to proceed"
}: PinPadProps) {
  const [pin, setPin] = useState("")
  const [error, setError] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleNumberClick = (e: React.MouseEvent, num: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (success) return
    setError(false)
    if (pin.length < correctPin.length) {
      const newPin = pin + num
      setPin(newPin)
      
      if (newPin.length === correctPin.length) {
        if (newPin === correctPin) {
          setSuccess(true)
          setTimeout(() => {
            onSuccess()
          }, 1000)
        } else {
          setError(true)
          setTimeout(() => setPin(""), 500)
        }
      }
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (success) return
    setPin(prev => prev.slice(0, -1))
    setError(false)
  }

  return (
    <div 
      className="bg-white rounded-3xl shadow-2xl py-6 px-8 w-full max-w-[420px] mx-auto overflow-hidden border border-gray-100"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="text-center mb-3">
        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight mb-0.5">{title}</h2>
        <p className="text-gray-400 text-xs font-medium">{description}</p>
      </div>

      <div className="flex justify-center gap-2.5 mb-4">
        {[...Array(correctPin.length)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "size-4 rounded-full border-2 transition-all duration-200",
              success ? "bg-emerald-500 border-emerald-500 scale-110" :
              error ? "bg-red-500 border-red-500 animate-bounce" :
              i < pin.length ? "bg-blue-600 border-blue-600 scale-110" : "border-gray-200 bg-gray-50"
            )}
          />
        ))}
      </div>

      {success ? (
        <div className="flex flex-col items-center justify-center py-6 animate-in fade-in zoom-in duration-300">
          <CheckCircle2 className="size-16 text-emerald-500 mb-3" />
          <p className="text-emerald-600 font-black uppercase tracking-widest text-sm">Access Granted</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 mb-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <Button
              key={num}
              variant="outline"
              onClick={(e) => handleNumberClick(e, num.toString())}
              className="h-12 rounded-2xl text-xl font-black text-gray-700 border-gray-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm active:scale-95"
            >
              {num}
            </Button>
          ))}
          <Button
            variant="ghost"
            onClick={onCancel}
            className="h-12 rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <X className="size-5" />
          </Button>
          <Button
            variant="outline"
            onClick={(e) => handleNumberClick(e, "0")}
            className="h-12 rounded-2xl text-xl font-black text-gray-700 border-gray-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm active:scale-95"
          >
            0
          </Button>
          <Button
            variant="ghost"
            onClick={handleDelete}
            className="h-12 rounded-2xl flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Delete className="size-5" />
          </Button>
        </div>
      )}

      <div className="text-center">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Secure Entry Required</p>
      </div>
    </div>
  )
}
