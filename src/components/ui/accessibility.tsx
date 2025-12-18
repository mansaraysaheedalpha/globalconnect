// src/components/ui/accessibility.tsx
// Accessibility utilities and components for WCAG 2.1 AA compliance
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { cn } from "@/lib/utils";

// ============================================
// Screen Reader Only Content
// ============================================

interface SrOnlyProps {
  children: React.ReactNode;
  className?: string;
}

export function SrOnly({ children, className }: SrOnlyProps) {
  return (
    <span
      className={cn(
        "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0",
        "[clip:rect(0,0,0,0)]",
        className
      )}
    >
      {children}
    </span>
  );
}

// ============================================
// Skip Link for Keyboard Navigation
// ============================================

interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
}

export function SkipLink({
  href = "#main-content",
  children = "Skip to main content",
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "fixed top-0 left-0 z-[9999] p-4 bg-primary text-primary-foreground font-medium",
        "transform -translate-y-full focus:translate-y-0 transition-transform duration-200",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      )}
    >
      {children}
    </a>
  );
}

// ============================================
// Live Region for Announcements
// ============================================

interface LiveRegionContextType {
  announce: (message: string, priority?: "polite" | "assertive") => void;
}

const LiveRegionContext = createContext<LiveRegionContextType | null>(null);

export function LiveRegionProvider({ children }: { children: React.ReactNode }) {
  const [politeMessage, setPoliteMessage] = useState("");
  const [assertiveMessage, setAssertiveMessage] = useState("");

  const announce = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      if (priority === "assertive") {
        setAssertiveMessage("");
        setTimeout(() => setAssertiveMessage(message), 50);
      } else {
        setPoliteMessage("");
        setTimeout(() => setPoliteMessage(message), 50);
      }
    },
    []
  );

  return (
    <LiveRegionContext.Provider value={{ announce }}>
      {children}
      {/* Polite live region */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      {/* Assertive live region */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </LiveRegionContext.Provider>
  );
}

export function useAnnounce() {
  const context = useContext(LiveRegionContext);
  if (!context) {
    // Return a no-op function if not in provider
    return {
      announce: (message: string, priority?: "polite" | "assertive") => {
        console.warn("useAnnounce called outside of LiveRegionProvider");
      },
    };
  }
  return context;
}

// ============================================
// Focus Management
// ============================================

export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive]);

  return containerRef;
}

export function useFocusReturn() {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;

    return () => {
      previousFocusRef.current?.focus();
    };
  }, []);
}

// ============================================
// Keyboard Navigation Hook
// ============================================

interface UseKeyboardNavigationOptions {
  items: HTMLElement[];
  orientation?: "horizontal" | "vertical" | "both";
  loop?: boolean;
  onSelect?: (index: number) => void;
}

export function useKeyboardNavigation({
  items,
  orientation = "vertical",
  loop = true,
  onSelect,
}: UseKeyboardNavigationOptions) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const nextKeys =
        orientation === "horizontal"
          ? ["ArrowRight"]
          : orientation === "vertical"
          ? ["ArrowDown"]
          : ["ArrowRight", "ArrowDown"];

      const prevKeys =
        orientation === "horizontal"
          ? ["ArrowLeft"]
          : orientation === "vertical"
          ? ["ArrowUp"]
          : ["ArrowLeft", "ArrowUp"];

      let newIndex = activeIndex;

      if (nextKeys.includes(e.key)) {
        e.preventDefault();
        newIndex = activeIndex + 1;
        if (newIndex >= items.length) {
          newIndex = loop ? 0 : items.length - 1;
        }
      } else if (prevKeys.includes(e.key)) {
        e.preventDefault();
        newIndex = activeIndex - 1;
        if (newIndex < 0) {
          newIndex = loop ? items.length - 1 : 0;
        }
      } else if (e.key === "Home") {
        e.preventDefault();
        newIndex = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        newIndex = items.length - 1;
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect?.(activeIndex);
        return;
      }

      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
        items[newIndex]?.focus();
      }
    },
    [activeIndex, items, orientation, loop, onSelect]
  );

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
    getItemProps: (index: number) => ({
      tabIndex: index === activeIndex ? 0 : -1,
      "aria-selected": index === activeIndex,
      onKeyDown: handleKeyDown,
      onFocus: () => setActiveIndex(index),
    }),
  };
}

// ============================================
// Accessible Loading State
// ============================================

interface AccessibleLoadingProps {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function AccessibleLoading({
  isLoading,
  loadingText = "Loading...",
  children,
}: AccessibleLoadingProps) {
  return (
    <div aria-busy={isLoading} aria-live="polite">
      {isLoading && <SrOnly>{loadingText}</SrOnly>}
      {children}
    </div>
  );
}

// ============================================
// Accessible Icon Button
// ============================================

interface AccessibleIconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  showTooltip?: boolean;
}

export const AccessibleIconButton = React.forwardRef<
  HTMLButtonElement,
  AccessibleIconButtonProps
>(({ icon, label, showTooltip = true, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={showTooltip ? label : undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-md",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {icon}
      <SrOnly>{label}</SrOnly>
    </button>
  );
});
AccessibleIconButton.displayName = "AccessibleIconButton";

// ============================================
// Focus Visible Ring
// ============================================

export const focusRingClasses =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

// ============================================
// Reduced Motion Hook
// ============================================

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

// ============================================
// Color Contrast Helper
// ============================================

export function getContrastColor(bgColor: string): "black" | "white" {
  // Remove # if present
  const hex = bgColor.replace("#", "");

  // Convert to RGB
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? "black" : "white";
}

// ============================================
// Accessible Form Field Wrapper
// ============================================

interface AccessibleFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function AccessibleField({
  id,
  label,
  error,
  hint,
  required,
  children,
  className,
}: AccessibleFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="text-sm font-medium leading-none">
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-hidden="true">
            *
          </span>
        )}
        {required && <SrOnly>(required)</SrOnly>}
      </label>

      {hint && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}

      {React.isValidElement(children) &&
        React.cloneElement(children as React.ReactElement<any>, {
          id,
          "aria-describedby": describedBy,
          "aria-invalid": !!error,
          "aria-required": required,
        })}

      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================
// Accessible Table
// ============================================

interface AccessibleTableProps {
  caption: string;
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export function AccessibleTable({
  caption,
  headers,
  children,
  className,
}: AccessibleTableProps) {
  return (
    <div className={cn("overflow-x-auto", className)} role="region" tabIndex={0}>
      <table className="w-full border-collapse">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="text-left p-3 font-medium border-b"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

// ============================================
// Accessible Progress
// ============================================

interface AccessibleProgressProps {
  value: number;
  max?: number;
  label: string;
  showValue?: boolean;
  className?: string;
}

export function AccessibleProgress({
  value,
  max = 100,
  label,
  showValue = true,
  className,
}: AccessibleProgressProps) {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        {showValue && <span>{percentage}%</span>}
      </div>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className="h-2 w-full bg-muted rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============================================
// Main Content Landmark
// ============================================

export function MainContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main id="main-content" tabIndex={-1} className={cn("outline-none", className)}>
      {children}
    </main>
  );
}
