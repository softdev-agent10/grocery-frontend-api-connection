import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"
import { VisuallyHidden } from "@/components/ui/visually-hidden"

interface SalesActionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: React.ReactNode
  children?: React.ReactNode
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  className?: string
  showFooter?: boolean
  showHeader?: boolean
}

export function SalesActionsDialog({
  open,
  onOpenChange,
  title,
  children,
  onSubmit,
  className,
  showFooter = true,
  showHeader = true,
}: SalesActionsDialogProps) {


  if (title === "Calculator" || title === "Discount") {
    return(
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn("sm:max-w-fit p-0 border-0 bg-transparent shadow-none overflow-visible", className)} showCloseButton={true}>
          <VisuallyHidden>
            <DialogTitle>{title}</DialogTitle>
          </VisuallyHidden>
          {children}
        </DialogContent>
      </Dialog>
    )
  }

  if (title === "Item Pricing" || title === "Quick Sell" || title === "Working Hours") {
    return(
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn("sm:max-w-fit p-0 border-0 bg-transparent shadow-none overflow-visible flex flex-col", className)} showCloseButton={false}>
          <VisuallyHidden>
            <DialogTitle>{title}</DialogTitle>
          </VisuallyHidden>
          {children}
        </DialogContent>
      </Dialog>
    )
  }

  return (

    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-1/2 flex flex-col", className)} showCloseButton={showHeader}>
        <form onSubmit={onSubmit || ((e) => e.preventDefault())} className="w-full flex flex-col h-full">
          {!showHeader && title && (
            <VisuallyHidden>
              <DialogTitle>{title}</DialogTitle>
            </VisuallyHidden>
          )}
          {showHeader && (
            <DialogHeader className="flex flex-row justify-between items-center px-4 py-3 mt-3 rounded-md" style={{ background: "linear-gradient(135deg, #2563eb 0%, #3b4fcf 55%, #4338ca 100%)" }}>
              {title && <DialogTitle className="uppercase text-2xl xl:text-4xl font-bold text-white">{title}</DialogTitle>}
              <Search className="size-10 text-white" />
            </DialogHeader>
          )}
          {children}
          {showFooter && (
            <DialogFooter>
              <DialogClose asChild>
                <Button className="md:text-xl md:px-5 md:py-5" variant="outline">Cancel</Button>
              </DialogClose>
              <Button className="md:text-xl md:px-5 md:py-5" type="submit">Save</Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
