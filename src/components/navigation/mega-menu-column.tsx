// src/components/navigation/mega-menu-column.tsx
"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { MenuColumn } from "./solutions-menu-data";
import { MegaMenuGroupComponent } from "./mega-menu-group";
import { cn } from "@/lib/utils";

interface MegaMenuColumnProps {
  column: MenuColumn;
  onItemClick?: () => void;
  isLast?: boolean;
}

export function MegaMenuColumnComponent({ column, onItemClick, isLast }: MegaMenuColumnProps) {
  return (
    <div
      className={cn(
        "flex flex-col p-4 sm:p-5 lg:p-6 transition-colors duration-200 bg-background",
        "hover:bg-muted/30"
      )}
    >
      {/* Column Header - sticky */}
      <div className="mb-3 sm:mb-4 pb-2 border-b border-border/30 shrink-0">
        <h2 className="text-sm sm:text-base font-semibold text-foreground mb-0.5 leading-tight">
          {column.title}
        </h2>
        <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2">
          {column.subtitle}
        </p>
      </div>

      {/* Groups - scrollable area */}
      <div className="flex-1 space-y-4 sm:space-y-5 overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent min-h-0">
        {column.groups.map((group, index) => (
          <MegaMenuGroupComponent
            key={`${group.title}-${index}`}
            group={group}
            onItemClick={onItemClick}
          />
        ))}
      </div>

      {/* CTA - sticky at bottom */}
      <div className="mt-3 sm:mt-4 pt-3 border-t border-border/50 bg-background shrink-0">
        <Link
          href={column.cta.href}
          onClick={onItemClick}
          className="group inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <span className="truncate">{column.cta.text}</span>
          <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
