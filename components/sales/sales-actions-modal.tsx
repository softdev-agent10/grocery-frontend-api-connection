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

interface SalesActionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: React.ReactNode
  children?: React.ReactNode
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  className?: string
}

export function SalesActionsDialog({
  open,
  onOpenChange,
  title,
  children,
  onSubmit,
  className,
}: SalesActionsDialogProps) {


  if (title === "Calculator" || title === "Discount") {
    return(
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-fit p-0 border-0 bg-transparent shadow-none overflow-visible">
          <DialogTitle className="hidden">{title}</DialogTitle>
          {children}
        </DialogContent>
      </Dialog>
    )
  }

  if (title === "Miscellaneous") {
    return(
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl p-0 border-0 bg-transparent shadow-none overflow-visible">
          <DialogTitle className="hidden">{title}</DialogTitle>
          {children}
        </DialogContent>
      </Dialog>
    )
  }

  return (

    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-1/2", className)}>
        <form onSubmit={onSubmit} className="w-full">
          <DialogHeader className="flex flex-row justify-between px-4 py-3 mt-3 rounded-md" style={{ background: "linear-gradient(135deg, #2563eb 0%, #3b4fcf 55%, #4338ca 100%)" }}>
            {title && <DialogTitle className="uppercase text-4xl font-bold text-white">{title}</DialogTitle>}
            <Search className="size-10 text-white" />
          </DialogHeader>
          {children}
          <DialogFooter>
            <DialogClose asChild>
              <Button className="md:text-xl md:px-5 md:py-5" variant="outline">Cancel</Button>
            </DialogClose>
            <Button className="md:text-xl md:px-5 md:py-5" type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
