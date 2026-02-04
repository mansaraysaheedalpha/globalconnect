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

  const isActive = currentPath.startsWith("/solutions");

  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

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
          {/* Invisible bridge to connect trigger to menu */}
          <div
            className="absolute left-0 right-0 h-4"
            style={{ top: "100%" }}
          />

          {/* Backdrop - click to close */}
          <div
            className="fixed inset-0 z-[45]"
            onClick={handleClose}
            onMouseEnter={handleMouseLeave}
            aria-hidden="true"
          />

          {/* Menu Content */}
          <div
            className={cn(
              "fixed left-0 right-0 z-[55]",
              "origin-top animate-mega-menu-enter"
            )}
            style={{ top: isScrolled ? "72px" : "88px" }}
          >
            <div className="container mx-auto px-4 md:px-6">
              <div
                className={cn(
                  "bg-background border border-border/50 rounded-xl shadow-2xl",
                  "max-h-[calc(100vh-140px)] flex flex-col"
                )}
              >
                {/* Columns Grid - scrollable */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 overflow-y-auto flex-1 max-h-[calc(100vh-220px)]">
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
                <div className="border-t border-border/50 bg-gradient-to-r from-primary/10 to-background">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 lg:p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 text-xl">
                        {megaMenuBanner.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">
                          {megaMenuBanner.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {megaMenuBanner.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      className="shrink-0"
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
