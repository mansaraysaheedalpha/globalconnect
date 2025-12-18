// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  LayoutGrid,
  Users,
  Settings,
  PlusCircle,
  CalendarDays,
  MapPin,
  Mic2,
  BookOpen,
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
      icon: LayoutGrid,
    },
    {
      href: "/dashboard/events",
      label: "Events",
      icon: CalendarDays,
    },
    {
      href: "/speakers",
      label: "Speakers",
      icon: Mic2,
    },
    {
      href: "/venues",
      label: "Venues",
      icon: MapPin,
    },
    {
      href: "/dashboard/blueprints",
      label: "Blueprints",
      icon: BookOpen,
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
    <aside
      className="dark w-64 flex-shrink-0 bg-background text-foreground border-r border-border/50 p-4 flex flex-col"
      role="complementary"
      aria-label="Organizer sidebar navigation"
    >
      <div className="mb-8 p-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
          aria-label="GlobalConnect - Go to dashboard"
        >
          <Image
            src="/logo.png"
            alt=""
            width={36}
            height={36}
            aria-hidden="true"
          />
          <span className="text-xl font-bold text-foreground">
            GlobalConnect
          </span>
        </Link>
      </div>

      <nav
        className="flex flex-col gap-2 flex-grow"
        role="navigation"
        aria-label="Main navigation"
      >
        <ul className="flex flex-col gap-1" role="list">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/dashboard"
                ? pathname === link.href
                : pathname.startsWith(link.href);

            return (
              <li key={link.href} role="listitem">
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-foreground/70 transition-all hover:text-foreground hover:bg-white/5",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isActive &&
                      "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className="mt-auto border-t border-white/10 pt-4"
        role="region"
        aria-label="Organization actions"
      >
        <Button
          className="w-full justify-start gap-3"
          variant="secondary"
          onClick={onOpenCreateOrgModal}
          aria-label="Create a new organization"
        >
          <PlusCircle className="h-5 w-5" aria-hidden="true" />
          Create Organization
        </Button>
      </div>
    </aside>
  );
}
