"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Bell, User, Building2, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth.store";
import { useSponsorStore } from "@/store/sponsor.store";
import Link from "next/link";

type EventStatus = "live" | "upcoming" | "ended" | "unknown";

interface SponsorHeaderProps {
  onOpenSidebar: () => void;
}

function getEventStatusBadge(status: EventStatus) {
  switch (status) {
    case "live":
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
          Event Live
        </Badge>
      );
    case "upcoming":
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
          Event Upcoming
        </Badge>
      );
    case "ended":
      return (
        <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/20">
          Event Ended
        </Badge>
      );
    default:
      return null;
  }
}

export function SponsorHeader({ onOpenSidebar }: SponsorHeaderProps) {
  const { user, logout, token } = useAuthStore();
  const { activeEventId } = useSponsorStore();
  const [eventStatus, setEventStatus] = useState<EventStatus>("unknown");

  // Fetch event details to determine status
  useEffect(() => {
    if (!activeEventId || !token) {
      setEventStatus("unknown");
      return;
    }

    const fetchEventStatus = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_EVENT_LIFECYCLE_URL || "http://localhost:8000/api/v1";
        const response = await fetch(
          `${API_BASE_URL}/events/${activeEventId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const event = await response.json();
          const now = new Date();
          const startDate = event.start_date ? new Date(event.start_date) : null;
          const endDate = event.end_date ? new Date(event.end_date) : null;

          if (startDate && endDate) {
            if (now < startDate) {
              setEventStatus("upcoming");
            } else if (now > endDate) {
              setEventStatus("ended");
            } else {
              setEventStatus("live");
            }
          } else if (startDate && now < startDate) {
            setEventStatus("upcoming");
          } else if (endDate && now > endDate) {
            setEventStatus("ended");
          } else {
            // If we have start but no end, and we're past start, assume live
            setEventStatus(startDate && now >= startDate ? "live" : "unknown");
          }
        }
      } catch (error) {
        console.error("Failed to fetch event status:", error);
        setEventStatus("unknown");
      }
    };

    fetchEventStatus();
  }, [activeEventId, token]);

  const fullName = user ? `${user.first_name} ${user.last_name}` : "";
  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "SP";

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onOpenSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        <div className="hidden items-center gap-2 sm:flex">
          {getEventStatusBadge(eventStatus)}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications - badge hidden until notification backend is implemented */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.imageUrl || undefined} alt={fullName || "User"} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{fullName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/sponsor/settings" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/sponsor/booth" className="flex items-center">
                <Building2 className="mr-2 h-4 w-4" />
                <span>Booth Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
