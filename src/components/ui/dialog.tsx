"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "duration-300",
        className
      )}
      {...props}
    />
  )
}

type DialogContentProps = React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
  size?: "sm" | "default" | "lg" | "xl" | "full"
  position?: "center" | "top"
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  size = "default",
  position = "center",
  ...props
}: DialogContentProps) {
  const sizes = {
    sm: "sm:max-w-sm",
    default: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-4xl",
    full: "sm:max-w-[calc(100vw-4rem)] sm:max-h-[calc(100vh-4rem)]",
  }

  const positions = {
    center: "top-[50%] translate-y-[-50%]",
    top: "top-[5%] sm:top-[10%] translate-y-0",
  }

  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          // Base styles
          "fixed left-[50%] z-50 grid w-full translate-x-[-50%] gap-4",
          "bg-background border shadow-elevation-3 rounded-xl",
          // Mobile: full screen with rounded top
          "max-w-full max-h-[90vh] overflow-y-auto",
          "rounded-t-2xl rounded-b-none sm:rounded-xl",
          // Desktop: centered with max width
          "p-4 sm:p-6",
          sizes[size],
          positions[position],
          // Animations
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2",
          position === "center" && "data-[state=closed]:slide-out-to-top-[2%] data-[state=open]:slide-in-from-top-[2%]",
          position === "top" && "data-[state=closed]:slide-out-to-top-[5%] data-[state=open]:slide-in-from-top-[5%]",
          "duration-300 ease-out",
          className
        )}
        {...props}
      >
        {/* Mobile drag handle indicator */}
        <div className="sm:hidden w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto -mt-1 mb-2" />

        {children}

        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className={cn(
              "absolute top-3 right-3 sm:top-4 sm:right-4",
              "h-10 w-10 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-muted transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:pointer-events-none",
              "[&_svg]:h-4 [&_svg]:w-4"
            )}
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex flex-col gap-1.5 text-center sm:text-left",
        // Account for close button - more padding on mobile due to larger button
        "pr-12 sm:pr-10",
        "min-w-0",
        className
      )}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        "pt-4 mt-2 border-t border-border/50",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "text-base sm:text-lg font-semibold leading-tight tracking-tight",
        // Prevent overflow - wrap on multiple lines if needed
        "break-words",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

// Premium Dialog Body with scroll shadow
function DialogBody({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-body"
      className={cn(
        "flex-1 overflow-y-auto py-2",
        "-mx-4 px-4 sm:-mx-6 sm:px-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Icon wrapper for dialog headers
function DialogIcon({
  className,
  variant = "default",
  children,
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "default" | "success" | "warning" | "destructive" | "info"
}) {
  const variants = {
    default: "bg-primary/10 text-primary",
    success: "bg-green-500/10 text-green-600",
    warning: "bg-yellow-500/10 text-yellow-600",
    destructive: "bg-destructive/10 text-destructive",
    info: "bg-blue-500/10 text-blue-600",
  }

  return (
    <div
      data-slot="dialog-icon"
      className={cn(
        "mx-auto sm:mx-0 mb-4 w-12 h-12 rounded-full flex items-center justify-center",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogIcon,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}