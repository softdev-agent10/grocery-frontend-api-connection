import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Component that visually hides its children while keeping them accessible to screen readers.
 * Uses Tailwind's `sr-only` utility class.
 */
const VisuallyHidden = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        "absolute border-0 w-px h-px p-0 -m-px overflow-hidden clip-rect-0 whitespace-nowrap sr-only",
        className
      )}
      {...props}
    />
  )
})
VisuallyHidden.displayName = "VisuallyHidden"

export { VisuallyHidden }
