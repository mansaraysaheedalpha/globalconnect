"use client";

import { Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  generateGoogleCalendarUrl,
  generateOutlookUrl,
  generateOutlook365Url,
  generateYahooCalendarUrl,
  generateIcsDownloadUrl,
  buildCalendarEvent,
  type CalendarEvent,
} from "@/lib/calendar-links";

/**
 * Session data required for calendar event generation
 */
export interface SessionData {
  id: string;
  title: string;
  description?: string;
  startTime: Date | string;
  endTime: Date | string;
  eventName: string;
}

/**
 * Props for the AddToCalendarButton component
 */
interface AddToCalendarButtonProps {
  /** Session information for the calendar event */
  session: SessionData;
  /** Optional personalized join URL with magic link */
  joinUrl?: string;
  /** Optional magic link token (used if joinUrl not provided) */
  token?: string;
  /** Button variant style */
  variant?: "default" | "outline" | "ghost" | "secondary";
  /** Button size */
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm";
  /** Whether to show the label text */
  showLabel?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Callback when user adds to calendar */
  onAdd?: (provider: string) => void;
}

/**
 * Calendar provider icons as simple SVG components
 */
const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const OutlookIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 7.387v10.478c0 .23-.08.424-.238.576-.158.154-.352.23-.582.23h-8.547v-6.959l1.6 1.229c.102.086.224.127.363.127.14 0 .26-.041.363-.127l6.8-5.213c.055-.047.096-.085.125-.115v.774zm-.238-1.996c.158.152.238.346.238.576v.142l-7.443 5.702-2.323-1.783V3.832h8.947c.23 0 .424.077.581.23v.329zM13.167 21.5H1.333A1.33 1.33 0 010 20.167V3.833c0-.735.598-1.333 1.333-1.333h11.834c.735 0 1.333.598 1.333 1.333v16.334c0 .735-.598 1.333-1.333 1.333zM7.083 7.167c-2.573 0-4.667 2.093-4.667 4.666s2.094 4.667 4.667 4.667 4.667-2.094 4.667-4.667-2.094-4.666-4.667-4.666zm0 7.333c-1.471 0-2.667-1.196-2.667-2.667s1.196-2.666 2.667-2.666 2.667 1.195 2.667 2.666-1.196 2.667-2.667 2.667z" fill="#0078D4"/>
  </svg>
);

const YahooIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10.816 8.166L6.851 0H.746l5.652 12.453 5.419-4.287zm2.369 0L18.15 0h6.105l-5.652 12.453-5.418-4.287zm-2.369 6.917l-5.419-4.286L.746 24h6.105l5.652-12.917h-.687zm2.369 0l5.418-4.286L23.559 24h-6.105l-5.652-12.917h.687z" fill="#6001D2"/>
  </svg>
);

/**
 * A dropdown button component that allows users to add a session to various calendar services.
 *
 * Supports:
 * - Google Calendar (web link)
 * - Outlook.com (web link)
 * - Outlook 365 (web link)
 * - Yahoo Calendar (web link)
 * - ICS file download (works with Apple Calendar, desktop clients)
 */
export function AddToCalendarButton({
  session,
  joinUrl,
  token,
  variant = "outline",
  size = "sm",
  showLabel = true,
  className,
  onAdd,
}: AddToCalendarButtonProps) {
  // Build the calendar event data
  const calendarEvent: CalendarEvent = buildCalendarEvent(session, joinUrl);

  // Handle opening calendar link in new tab
  const handleCalendarClick = (provider: string, url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    onAdd?.(provider);
  };

  // Handle ICS download
  const handleIcsDownload = () => {
    const icsUrl = generateIcsDownloadUrl(session.id, token);
    window.open(icsUrl, "_blank", "noopener,noreferrer");
    onAdd?.("ics");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn("gap-2", className)}
        >
          <Calendar className="h-4 w-4" />
          {showLabel && size !== "icon" && size !== "icon-sm" && (
            <span>Add to Calendar</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={() =>
            handleCalendarClick("google", generateGoogleCalendarUrl(calendarEvent))
          }
          className="cursor-pointer"
        >
          <GoogleIcon />
          <span>Google Calendar</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() =>
            handleCalendarClick("outlook", generateOutlookUrl(calendarEvent))
          }
          className="cursor-pointer"
        >
          <OutlookIcon />
          <span>Outlook.com</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() =>
            handleCalendarClick("outlook365", generateOutlook365Url(calendarEvent))
          }
          className="cursor-pointer"
        >
          <OutlookIcon />
          <span>Outlook 365</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() =>
            handleCalendarClick("yahoo", generateYahooCalendarUrl(calendarEvent))
          }
          className="cursor-pointer"
        >
          <YahooIcon />
          <span>Yahoo Calendar</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleIcsDownload} className="cursor-pointer">
          <Download className="h-4 w-4" />
          <span>Download .ics file</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
