"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex w-full max-w-full items-center justify-start rounded-lg p-1 gap-1",
        // Mobile-first: taller for touch, shorter on desktop
        "h-11 sm:h-10",
        // Smooth horizontal scroll with momentum
        "overflow-x-auto scrollbar-hide scroll-smooth",
        // Hide scrollbar but keep functionality
        "-mx-1 px-1 sm:mx-0 sm:px-0",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // Base styles
        "inline-flex items-center justify-center gap-1.5 rounded-md border border-transparent font-medium whitespace-nowrap transition-all",
        // Mobile-first sizing: larger touch targets on mobile
        "h-9 sm:h-8 min-w-max px-3 sm:px-3 py-2 sm:py-1.5",
        // Typography: slightly larger on mobile for readability
        "text-sm",
        // Colors
        "text-foreground dark:text-muted-foreground",
        // Active state
        "data-[state=active]:bg-background data-[state=active]:shadow-sm",
        "dark:data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30",
        // Focus states
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:outline-1",
        // Touch feedback
        "active:scale-[0.98] touch-manipulation",
        // Disabled state
        "disabled:pointer-events-none disabled:opacity-50",
        // SVG handling
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
