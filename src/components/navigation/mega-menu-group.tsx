// src/components/navigation/mega-menu-group.tsx
"use client";

import type { MenuGroup } from "./solutions-menu-data";
import { MegaMenuItemComponent } from "./mega-menu-item";

interface MegaMenuGroupProps {
  group: MenuGroup;
  onItemClick?: () => void;
}

export function MegaMenuGroupComponent({ group, onItemClick }: MegaMenuGroupProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          {group.title}
        </h3>
        {group.badge && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium bg-primary/20 text-primary">
            {group.badge}
          </span>
        )}
      </div>
      <div className="space-y-1">
        {group.items.map((item) => (
          <MegaMenuItemComponent key={item.href} item={item} onClick={onItemClick} />
        ))}
      </div>
    </div>
  );
}
