"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  LayoutDashboard,
  Users,
  Settings,
  PlusCircle,
  Calendar,
  MapPin,
  Mic,
} from "lucide-react";

export function Sidebar({
  onOpenCreateOrgModal,
}: {
  onOpenCreateOrgModal: () => void;
}) {
  const pathname = usePathname();

  const navLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/events",
      label: "Events",
      icon: Calendar,
    },
    {
      href: "/speakers",
      label: "Speakers",
      icon: Mic,
    },
    {
      href: "/venues",
      label: "Venues",
      icon: MapPin,
    },
    {
      href: "/team",
      label: "Team",
      icon: Users,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-secondary/30 border-r border-border p-4 flex flex-col">
      <div className="mb-8 p-2">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="GlobalConnect Logo"
            width={40}
            height={40}
          />
          <span className="text-xl font-bold">GlobalConnect</span>
        </Link>
      </div>

      <nav className="flex flex-col gap-2">
        {navLinks.map((link) => {
          const Icon = link.icon;

          // --- THIS IS THE FIX ---
          // Use an exact match for the dashboard, but startsWith for everything else.
          const isActive =
            link.href === "/dashboard"
              ? pathname === link.href
              : pathname.startsWith(link.href);
          // ---------------------

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive &&
                  "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <Button
          className="w-full justify-start gap-3"
          onClick={onOpenCreateOrgModal}
        >
          <PlusCircle className="h-4 w-4" />
          Create Organization
        </Button>
      </div>
    </aside>
  );
}
