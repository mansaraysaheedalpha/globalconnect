// src/components/navigation/solutions-mega-menu.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { solutionsMenuData, megaMenuBanner } from "./solutions-menu-data";
import { MegaMenuColumnComponent } from "./mega-menu-column";

interface SolutionsMegaMenuProps {
  isScrolled: boolean;
  currentPath: string;
}

export function SolutionsMegaMenu({ isScrolled, currentPath }: SolutionsMegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isActive = currentPath.startsWith("/solutions");

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    clearCloseTimeout();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    // Small delay to allow moving to dropdown
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 100);
  };

  const handleMenuMouseEnter = () => {
    clearCloseTimeout();
  };

  const handleMenuMouseLeave = () => {
    setIsOpen(false);
  };

  const handleClose = () => {
    clearCloseTimeout();
    setIsOpen(false);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => clearCloseTimeout();
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg",
          "flex items-center gap-1 group",
          isScrolled
            ? "text-muted-foreground hover:text-foreground hover:bg-muted"
            : "text-white/90 hover:text-white hover:bg-white/10",
          (isActive || isOpen) && (isScrolled ? "text-foreground bg-muted" : "text-white bg-white/10")
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        Solutions
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop - click to close */}
          <div
            className="fixed inset-0 z-[100]"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Invisible bridge to connect trigger to menu - must be above backdrop */}
          <div
            className="fixed left-0 right-0 h-24 z-[105]"
            style={{ top: "56px" }}
          />

          {/* Menu Content */}
          <div
            className={cn(
              "fixed left-0 right-0 z-[110]",
              "origin-top animate-mega-menu-enter"
            )}
            style={{ top: isScrolled ? "72px" : "88px" }}
            onMouseEnter={handleMenuMouseEnter}
            onMouseLeave={handleMenuMouseLeave}
          >
            <div className="container mx-auto px-3 sm:px-4 md:px-6">
              <div
                className={cn(
                  "bg-background border border-border/50 rounded-lg sm:rounded-xl shadow-2xl",
                  "max-h-[calc(100vh-100px)] sm:max-h-[calc(100vh-120px)] flex flex-col"
                )}
              >
                {/* Columns Grid - scrollable */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px md:gap-0 md:divide-x divide-border/50 overflow-y-auto flex-1 max-h-[calc(100vh-180px)] sm:max-h-[calc(100vh-200px)]">
                  {solutionsMenuData.map((column, index) => (
                    <MegaMenuColumnComponent
                      key={column.title}
                      column={column}
                      onItemClick={handleClose}
                      isLast={index === solutionsMenuData.length - 1}
                    />
                  ))}
                </div>

                {/* Bottom Banner */}
                <div className="border-t border-border/50 bg-gradient-to-r from-primary/10 to-background shrink-0">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 lg:p-6">
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/20 text-lg sm:text-xl shrink-0">
                        {megaMenuBanner.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-foreground leading-tight">
                          {megaMenuBanner.title}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {megaMenuBanner.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      className="shrink-0 w-full sm:w-auto text-xs sm:text-sm"
                      onClick={handleClose}
                    >
                      <a href={megaMenuBanner.buttonHref}>
                        {megaMenuBanner.buttonText}
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
