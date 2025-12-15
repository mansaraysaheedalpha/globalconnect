// src/components/layout/AttendeeSidebar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  LayoutGrid,
  CalendarDays,
  Ticket,
  Bell,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

export function AttendeeSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const navLinks = [
    {
      href: "/attendee",
      label: "My Events",
      icon: CalendarDays,
      exact: true,
    },
    {
      href: "/attendee/tickets",
      label: "My Tickets",
      icon: Ticket,
    },
    {
      href: "/attendee/notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      href: "/attendee/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="dark w-64 flex-shrink-0 bg-background text-foreground border-r border-border/50 p-4 flex flex-col">
      <div className="mb-8 p-2">
        <Link href="/attendee" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="GlobalConnect Logo"
            width={36}
            height={36}
          />
          <span className="text-xl font-bold text-foreground">
            GlobalConnect
          </span>
        </Link>
      </div>

      {/* User Info */}
      <div className="mb-6 px-3 py-3 rounded-lg bg-white/5">
        <p className="text-sm font-medium text-foreground">
          {user?.first_name} {user?.last_name}
        </p>
        <p className="text-xs text-muted-foreground">{user?.email}</p>
      </div>

      <nav className="flex flex-col gap-2 flex-grow">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-foreground/70 transition-all hover:text-foreground hover:bg-white/5",
                isActive &&
                  "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 border-t border-white/10 pt-4">
        <Link
          href="/events"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground/70 transition-all hover:text-foreground hover:bg-white/5"
        >
          <ExternalLink className="h-5 w-5" />
          Browse Events
        </Link>
        <Button
          className="w-full justify-start gap-3"
          variant="ghost"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
