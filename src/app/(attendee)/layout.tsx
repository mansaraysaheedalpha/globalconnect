// src/app/(attendee)/layout.tsx
"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import { usePathname } from "next/navigation";
import { GET_EVENT_ATTENDEES_QUERY } from "@/graphql/registrations.graphql";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AttendeeSidebar } from "@/components/layout/AttendeeSidebar";
import { AttendeeHeader } from "@/components/layout/AttendeeHeader";
import { FloatingDMButton } from "@/components/features/dm";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function AttendeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Extract eventId from pathname if on an event page
  const eventIdMatch = pathname.match(/\/attendee\/events\/([^/]+)/);
  const eventId = eventIdMatch ? eventIdMatch[1] : undefined;

  // Fetch event attendees for DM functionality (only when on an event page)
  const { data: attendeesData } = useQuery(GET_EVENT_ATTENDEES_QUERY, {
    variables: { eventId: eventId || "" },
    skip: !eventId,
  });

  const availableUsers = useMemo(() => {
    if (!attendeesData?.eventAttendees) return [];

    return attendeesData.eventAttendees
      .filter((reg: any) => reg.user) // Only users with accounts
      .map((reg: any) => ({
        id: reg.user.id,
        firstName: reg.user.first_name,
        lastName: reg.user.last_name,
        avatar: reg.user.imageUrl
      }));
  }, [attendeesData]);

  return (
    <AuthGuard>
      <div className="flex h-screen w-full">
        <AttendeeSidebar className="hidden lg:flex" />

        {/* Mobile sidebar */}
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetContent side="left" className="p-0">
            <AttendeeSidebar className="w-full max-w-sm" />
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 flex-col overflow-hidden">
          <AttendeeHeader onOpenSidebar={() => setIsSidebarOpen(true)} />
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 overflow-y-auto bg-muted/30 outline-none"
            role="main"
            aria-label="Main content"
          >
            {children}
          </main>
        </div>

        {/* Floating DM Button - only show when on event pages */}
        {eventId && (
          <FloatingDMButton
            eventId={eventId}
            availableUsers={availableUsers}
            position="bottom-right"
          />
        )}
      </div>
    </AuthGuard>
  );
}
