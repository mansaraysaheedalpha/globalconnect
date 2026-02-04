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
        "flex flex-col p-5 lg:p-6 transition-colors duration-200",
        "hover:bg-muted/30",
        !isLast && "border-r border-border/50"
      )}
    >
      {/* Column Header - sticky */}
      <div className="mb-4 pb-2 border-b border-border/30">
        <h2 className="text-base font-semibold text-foreground mb-0.5">
          {column.title}
        </h2>
        <p className="text-xs text-muted-foreground">
          {column.subtitle}
        </p>
      </div>

      {/* Groups - scrollable area */}
      <div className="flex-1 space-y-5 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {column.groups.map((group, index) => (
          <MegaMenuGroupComponent
            key={`${group.title}-${index}`}
            group={group}
            onItemClick={onItemClick}
          />
        ))}
      </div>

      {/* CTA - sticky at bottom */}
      <div className="mt-4 pt-3 border-t border-border/50 bg-background">
        <Link
          href={column.cta.href}
          onClick={onItemClick}
          className="group inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {column.cta.text}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
