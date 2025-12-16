// src/components/layout/AttendeeHeader.tsx
"use client";

import { useAuthStore } from "@/store/auth.store";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "../ui/user-avatar";
import Link from "next/link";
import { ExternalLink, Settings, LogOut } from "lucide-react";
import { NotificationBellOnly } from "@/components/features/notifications/notifications-container";

export function AttendeeHeader() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Extract eventId from pathname if on an event page
  const eventIdMatch = pathname.match(/\/attendee\/events\/([^/]+)/);
  const eventId = eventIdMatch ? eventIdMatch[1] : undefined;

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  // Get page title based on pathname
  const getPageTitle = () => {
    if (pathname === "/attendee") return "My Events";
    if (pathname === "/attendee/tickets") return "My Tickets";
    if (pathname === "/attendee/notifications") return "Notifications";
    if (pathname === "/attendee/settings") return "Settings";
    if (pathname.includes("/attendee/events/")) return "Event Details";
    return "Attendee Portal";
  };

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      <div className="font-semibold text-lg">
        {getPageTitle()}
      </div>

      {user && (
        <div className="flex items-center gap-2">
          {/* Notifications Bell - with eventId if on event page */}
          <NotificationBellOnly eventId={eventId} />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3">
                <UserAvatar
                  firstName={user.first_name}
                  lastName={user.last_name}
                  imageUrl={user.imageUrl}
                />
                <span className="text-sm font-medium hidden md:block">
                  {user.first_name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                {user.first_name} {user.last_name}
                <p className="text-xs font-normal text-muted-foreground">
                  {user.email}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/attendee/settings">
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
              </Link>
              <Link href="/events" target="_blank" rel="noopener noreferrer">
                <DropdownMenuItem>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Browse Events
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </header>
  );
}
