// src/app/(sponsor)/layout.tsx
"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { SponsorSidebar } from "@/components/layout/SponsorSidebar";
import { SponsorHeader } from "@/components/layout/SponsorHeader";
import { ExpoStaffProvider } from "@/providers/expo-staff-provider";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useSponsorStore } from "@/store/sponsor.store";
import { useAuthStore } from "@/store/auth.store";

const API_BASE_URL = process.env.NEXT_PUBLIC_EVENT_LIFECYCLE_URL || "http://localhost:8000/api/v1";

export default function SponsorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { token } = useAuthStore();
  const { activeSponsorId, setActiveSponsor, setSponsors, sponsors } = useSponsorStore();

  // Initialize sponsor context on mount
  useEffect(() => {
    // Skip initialization on select-event page
    if (pathname === "/sponsor/select-event") {
      setIsInitializing(false);
      return;
    }

    // If no token, let AuthGuard handle it
    if (!token) {
      setIsInitializing(false);
      return;
    }

    // If already has active sponsor, skip initialization
    if (activeSponsorId) {
      setIsInitializing(false);
      return;
    }

    // Fetch sponsors and set context
    const initializeSponsorContext = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/sponsors/my-sponsors`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          console.error("Failed to fetch sponsors for context initialization");
          setIsInitializing(false);
          return;
        }

        const sponsorsData = await res.json();

        // Update sponsors in store
        setSponsors(sponsorsData.map((s: { id: string; event_id: string; company_name: string; company_logo_url?: string }) => ({
          id: s.id,
          eventId: s.event_id,
          companyName: s.company_name,
          companyLogoUrl: s.company_logo_url,
          role: null,
        })));

        if (sponsorsData.length === 0) {
          // No sponsors - stay on current page, will show empty state
          setIsInitializing(false);
        } else if (sponsorsData.length === 1) {
          // Single sponsor - auto-select
          const sponsor = sponsorsData[0];
          setActiveSponsor(sponsor.id, sponsor.event_id, sponsor.company_name, null);
          setIsInitializing(false);
        } else {
          // Multiple sponsors - redirect to selection page
          router.push("/sponsor/select-event");
        }
      } catch (error) {
        console.error("Error initializing sponsor context:", error);
        setIsInitializing(false);
      }
    };

    initializeSponsorContext();
  }, [token, activeSponsorId, pathname, router, setActiveSponsor, setSponsors]);

  // Show loading state while initializing
  if (isInitializing && pathname !== "/sponsor/select-event") {
    return (
      <AuthGuard>
        <div className="flex h-screen w-full items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <ExpoStaffProvider>
        <div className="flex h-screen w-full">
          <SponsorSidebar className="hidden lg:flex" />

          {/* Mobile sidebar */}
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetContent side="left" className="p-0">
              <SponsorSidebar className="w-full max-w-sm" />
            </SheetContent>
          </Sheet>
          <div className="flex flex-1 flex-col overflow-hidden">
            <SponsorHeader onOpenSidebar={() => setIsSidebarOpen(true)} />
            <main
              id="main-content"
              tabIndex={-1}
              className="flex-1 overflow-y-auto bg-muted/30 outline-none"
              role="main"
              aria-label="Sponsor portal content"
            >
              {children}
            </main>
          </div>
        </div>
      </ExpoStaffProvider>
    </AuthGuard>
  );
}
