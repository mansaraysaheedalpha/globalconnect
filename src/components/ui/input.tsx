import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  variant?: "default" | "filled" | "ghost";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    const variants = {
      default: "border-input bg-transparent dark:bg-input/30",
      filled: "border-transparent bg-muted/50 hover:bg-muted/70 focus:bg-background",
      ghost: "border-transparent bg-transparent hover:bg-muted/50 focus:bg-muted/30",
    };

    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          // Base styles
          "flex h-11 w-full min-w-0 rounded-lg border px-3.5 py-2.5 text-base shadow-sm",
          "transition-all duration-200 outline-none",
          // File input styles
          "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
          // Placeholder & selection
          "placeholder:text-muted-foreground/70",
          "selection:bg-primary selection:text-primary-foreground",
          // Focus state with premium glow
          "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
          // Invalid state
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          // Disabled state
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30",
          // Variant
          variants[variant],
          // Responsive
          "text-base md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
