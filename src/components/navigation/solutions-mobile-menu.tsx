// src/components/navigation/solutions-mobile-menu.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { solutionsMenuData } from "./solutions-menu-data";
import { MegaMenuItemComponent } from "./mega-menu-item";

interface SolutionsMobileMenuProps {
  onNavigate: () => void;
  currentPath: string;
}

export function SolutionsMobileMenu({ onNavigate, currentPath }: SolutionsMobileMenuProps) {
  const [expandedColumn, setExpandedColumn] = useState<string | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const isActive = currentPath.startsWith("/solutions");

  const toggleColumn = (columnTitle: string) => {
    setExpandedColumn(expandedColumn === columnTitle ? null : columnTitle);
    setExpandedGroup(null);
  };

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroup(expandedGroup === groupTitle ? null : groupTitle);
  };

  return (
    <div className="space-y-1">
      {/* Main Solutions Link */}
      <button
        onClick={() => toggleColumn("main")}
        className={cn(
          "flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors",
          "text-muted-foreground hover:text-foreground hover:bg-muted",
          isActive && "text-foreground bg-muted"
        )}
      >
        <span>Solutions</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            expandedColumn === "main" && "rotate-180"
          )}
        />
      </button>

      {/* Expandable Columns */}
      {expandedColumn === "main" && (
        <div className="pl-4 space-y-1 animate-slide-down">
          {solutionsMenuData.map((column) => (
            <div key={column.title} className="space-y-1">
              {/* Column Header */}
              <button
                onClick={() => toggleColumn(column.title)}
                className={cn(
                  "flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  "text-foreground hover:bg-muted/50",
                  expandedColumn === column.title && "bg-muted/50"
                )}
              >
                <div className="text-left">
                  <div className="font-semibold">{column.title}</div>
                  <div className="text-xs text-muted-foreground">{column.subtitle}</div>
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform",
                    expandedColumn === column.title && "rotate-90"
                  )}
                />
              </button>

              {/* Groups */}
              {expandedColumn === column.title && (
                <div className="pl-4 space-y-2 py-2 animate-slide-down">
                  {column.groups.map((group) => (
                    <div key={group.title} className="space-y-1">
                      {/* Group Header */}
                      <button
                        onClick={() => toggleGroup(group.title)}
                        className={cn(
                          "flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
                          "text-muted-foreground hover:text-foreground uppercase tracking-wider",
                          expandedGroup === group.title && "text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span>{group.title}</span>
                          {group.badge && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-primary/20 text-primary normal-case">
                              {group.badge}
                            </span>
                          )}
                        </div>
                        <ChevronRight
                          className={cn(
                            "h-3 w-3 shrink-0 transition-transform",
                            expandedGroup === group.title && "rotate-90"
                          )}
                        />
                      </button>

                      {/* Items */}
                      {expandedGroup === group.title && (
                        <div className="space-y-1 animate-slide-down">
                          {group.items.map((item) => (
                            <MegaMenuItemComponent
                              key={item.href}
                              item={item}
                              onClick={onNavigate}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Column CTA */}
                  <div className="pt-2 mt-2 border-t border-border/50">
                    <Link
                      href={column.cta.href}
                      onClick={onNavigate}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                    >
                      {column.cta.text}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
