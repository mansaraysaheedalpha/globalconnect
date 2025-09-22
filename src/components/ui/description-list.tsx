import * as React from "react";
import { cn } from "@/lib/utils";

const DescriptionList = React.forwardRef<
  HTMLDListElement,
  React.HTMLAttributes<HTMLDListElement>
>(({ className, ...props }, ref) => (
  <dl
    ref={ref}
    className={cn("grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3", className)}
    {...props}
  />
));
DescriptionList.displayName = "DescriptionList";

const DescriptionTerm = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <dt
    ref={ref}
    className={cn("font-medium text-gray-900", className)}
    {...props}
  />
));
DescriptionTerm.displayName = "DescriptionTerm";

const DescriptionDetails = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <dd
    ref={ref}
    className={cn("sm:col-span-2 text-gray-700", className)}
    {...props}
  />
));
DescriptionDetails.displayName = "DescriptionDetails";

export { DescriptionList, DescriptionTerm, DescriptionDetails };
