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
        <div className="pl-2 space-y-1.5 animate-in slide-in-from-top-2 duration-200">
          {solutionsMenuData.map((column) => (
            <div key={column.title} className="space-y-1">
              {/* Column Header */}
              <button
                onClick={() => toggleColumn(column.title)}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                  "text-foreground hover:bg-muted/70",
                  expandedColumn === column.title && "bg-muted/70"
                )}
              >
                <div className="text-left flex-1 mr-2">
                  <div className="font-semibold text-sm leading-tight">{column.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{column.subtitle}</div>
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
                <div className="pl-2 space-y-1.5 py-1 animate-in slide-in-from-top-2 duration-200">
                  {column.groups.map((group) => (
                    <div key={group.title} className="space-y-1">
                      {/* Group Header */}
                      <button
                        onClick={() => toggleGroup(group.title)}
                        className={cn(
                          "flex items-center justify-between w-full px-2.5 py-2 rounded-md text-[11px] font-semibold transition-colors",
                          "text-muted-foreground hover:text-foreground hover:bg-muted/50 uppercase tracking-wide",
                          expandedGroup === group.title && "text-foreground bg-muted/50"
                        )}
                      >
                        <div className="flex items-center gap-1.5 flex-1 mr-2">
                          <span className="truncate">{group.title}</span>
                          {group.badge && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-primary/20 text-primary normal-case shrink-0">
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
                        <div className="space-y-0.5 pl-1 animate-in slide-in-from-top-2 duration-200">
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
                  <div className="pt-2 mt-1.5 border-t border-border/50">
                    <Link
                      href={column.cta.href}
                      onClick={onNavigate}
                      className="flex items-center justify-between px-2.5 py-2.5 rounded-md text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                    >
                      <span className="truncate">{column.cta.text}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 ml-2" />
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
