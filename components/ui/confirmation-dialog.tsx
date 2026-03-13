"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AlertCircle, HelpCircle, Info, CheckCircle2 } from "lucide-react"

export interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive" | "success" | "warning"
  isLoading?: boolean
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmationDialogProps) {
  
  const getIcon = () => {
    switch (variant) {
      case "destructive":
        return <AlertCircle className="size-12 text-red-500 mb-2" />
      case "warning":
        return <HelpCircle className="size-12 text-amber-500 mb-2" />
      case "success":
        return <CheckCircle2 className="size-12 text-emerald-500 mb-2" />
      default:
        return <Info className="size-12 text-blue-500 mb-2" />
    }
  }

  const getConfirmButtonVariant = () => {
    switch (variant) {
      case "destructive":
        return "destructive"
      default:
        return "default"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-[400px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="p-6 flex flex-col items-center text-center">
          {getIcon()}
          <DialogHeader className="space-y-2 sm:text-center">
            <DialogTitle className="text-xl font-bold text-gray-900">{title}</DialogTitle>
            <DialogDescription className="text-gray-500 font-medium">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <DialogFooter className="bg-gray-50 p-4 flex flex-row gap-3 justify-center border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1 rounded-xl font-bold h-11 border-gray-200 hover:bg-white hover:text-gray-700 transition-all"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={getConfirmButtonVariant()}
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
            disabled={isLoading}
            className={cn(
              "flex-1 rounded-xl font-bold h-11 transition-all",
              variant === "default" && "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
            )}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
