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
        "flex flex-col h-full p-6 lg:p-7 transition-colors duration-200",
        "hover:bg-muted/30",
        !isLast && "border-r border-border/50"
      )}
    >
      {/* Column Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          {column.title}
        </h2>
        <p className="text-xs text-muted-foreground">
          {column.subtitle}
        </p>
      </div>

      {/* Groups */}
      <div className="flex-1 space-y-6 overflow-y-auto">
        {column.groups.map((group, index) => (
          <MegaMenuGroupComponent
            key={`${group.title}-${index}`}
            group={group}
            onItemClick={onItemClick}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="mt-6 pt-4 border-t border-border/50">
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
