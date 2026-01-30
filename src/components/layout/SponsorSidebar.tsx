"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  QrCode,
  BarChart3,
  MessageSquare,
  Settings,
  Building2,
  FileDown,
  Star,
  ChevronDown,
  RefreshCw,
  Radio,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSponsorStore } from "@/store/sponsor.store";
import { useExpoStaffContext } from "@/providers/expo-staff-provider";

interface SponsorSidebarProps {
  className?: string;
}

const getNavItems = (boothId: string | null, isLive: boolean) => [
  {
    label: "Dashboard",
    href: "/sponsor",
    icon: LayoutDashboard,
  },
  {
    label: "Lead Capture",
    href: "/sponsor/leads",
    icon: QrCode,
    badge: "Live",
  },
  {
    label: "All Leads",
    href: "/sponsor/leads/all",
    icon: Users,
  },
  {
    label: "Starred Leads",
    href: "/sponsor/leads/starred",
    icon: Star,
  },
  {
    label: "Analytics",
    href: "/sponsor/analytics",
    icon: BarChart3,
  },
  {
    label: "Export Data",
    href: "/sponsor/export",
    icon: FileDown,
  },
  {
    label: "Messages",
    href: "/sponsor/messages",
    icon: MessageSquare,
  },
  {
    label: "Booth Settings",
    href: "/sponsor/booth",
    icon: Building2,
  },
  // Show Booth Dashboard only if booth exists
  ...(boothId ? [{
    label: "Booth Dashboard",
    href: "/sponsor/booth/live",
    icon: Radio,
    showLiveIndicator: true,
    isLive,
  }] : []),
  {
    label: "Settings",
    href: "/sponsor/settings",
    icon: Settings,
  },
];

export function SponsorSidebar({ className }: SponsorSidebarProps) {
  const pathname = usePathname();
  const { activeSponsorName, sponsors } = useSponsorStore();
  const { boothId, isLive } = useExpoStaffContext();
  const hasMultipleSponsors = sponsors.length > 1;

  console.log("[SponsorSidebar] Context values:", { boothId, isLive });

  const navItems = getNavItems(boothId, isLive);

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r bg-background",
        className
      )}
    >
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/sponsor" className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">Sponsor Portal</span>
        </Link>
      </div>

      {/* Current sponsor info */}
      {activeSponsorName && (
        <div className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Current Sponsor</p>
              <p className="font-medium truncate">{activeSponsorName}</p>
            </div>
            {hasMultipleSponsors && (
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 h-8 w-8 p-0"
                asChild
              >
                <Link href="/sponsor/select-event" title="Switch Event">
                  <RefreshCw className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          // Special handling to prevent parent routes from being active on child routes
          let isActive: boolean;
          if (item.href === "/sponsor/booth") {
            // Booth Settings should only be active on exact match or non-live booth pages
            isActive = pathname === "/sponsor/booth" ||
                      (pathname.startsWith("/sponsor/booth") && !pathname.startsWith("/sponsor/booth/live"));
          } else if (item.href === "/sponsor/booth/live") {
            // Booth Dashboard should be active on exact match or any /booth/live/* pages
            isActive = pathname === "/sponsor/booth/live" || pathname.startsWith("/sponsor/booth/live");
          } else if (item.href === "/sponsor/leads") {
            // Lead Capture should only be active on exact match (not /starred or /all)
            isActive = pathname === "/sponsor/leads";
          } else {
            // Default matching logic for other routes
            isActive = pathname === item.href ||
                      (item.href !== "/sponsor" && pathname.startsWith(item.href));
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge
                  variant={isActive ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {item.badge}
                </Badge>
              )}
              {(item as { showLiveIndicator?: boolean; isLive?: boolean }).showLiveIndicator && (
                <div className="flex items-center gap-1">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      (item as { isLive?: boolean }).isLive
                        ? "bg-green-500 animate-pulse"
                        : "bg-gray-400"
                    )}
                  />
                  {(item as { isLive?: boolean }).isLive && (
                    <span className="text-xs text-green-500">Live</span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="rounded-lg bg-muted p-4">
          <h4 className="text-sm font-semibold">Need Help?</h4>
          <p className="mt-1 text-xs text-muted-foreground">
            Contact the event organizer for assistance with your sponsor booth.
          </p>
        </div>
      </div>
    </aside>
  );
}
