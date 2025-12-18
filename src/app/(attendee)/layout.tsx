// src/app/(attendee)/layout.tsx
"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { AttendeeSidebar } from "@/components/layout/AttendeeSidebar";
import { AttendeeHeader } from "@/components/layout/AttendeeHeader";

export default function AttendeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen w-full">
        <AttendeeSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AttendeeHeader />
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
      </div>
    </AuthGuard>
  );
}
