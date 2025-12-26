// src/app/(attendee)/layout.tsx
"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { AttendeeSidebar } from "@/components/layout/AttendeeSidebar";
import { AttendeeHeader } from "@/components/layout/AttendeeHeader";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function AttendeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      </div>
    </AuthGuard>
  );
}
