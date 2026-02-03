// src/components/navigation/mega-menu-item.tsx
"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { MenuItem } from "./solutions-menu-data";

interface MegaMenuItemProps {
  item: MenuItem;
  onClick?: () => void;
}

export function MegaMenuItemComponent({ item, onClick }: MegaMenuItemProps) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group block rounded-lg p-3 transition-all duration-200",
        "hover:bg-muted/50 focus:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                item.isAI && "text-primary",
                item.isHighlight && "text-emerald-600 dark:text-emerald-400",
                !item.isAI && !item.isHighlight && "text-foreground group-hover:text-primary"
              )}
            >
              {item.name}
            </span>
            {item.isAI && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-primary/20 text-primary">
                AI
              </span>
            )}
            {item.isNew && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-500/20 text-blue-600 dark:text-blue-400">
                NEW
              </span>
            )}
            {item.isPopular && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-orange-500/20 text-orange-600 dark:text-orange-400">
                POPULAR
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2">
            {item.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
