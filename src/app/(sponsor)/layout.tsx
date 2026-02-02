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
  const { activeSponsorId, setActiveSponsor, setSponsors, clearSponsorContext, sponsors } = useSponsorStore();

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

    // Always fetch sponsors to validate context (even if activeSponsorId exists)
    // This prevents stale localStorage data from causing 404 errors
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
          // If we can't validate, clear any potentially stale context
          if (activeSponsorId) {
            clearSponsorContext();
          }
          setIsInitializing(false);
          return;
        }

        const sponsorsData = await res.json();

        // Update sponsors in store
        const mappedSponsors = sponsorsData.map((s: { id: string; event_id: string; company_name: string; company_logo_url?: string }) => ({
          id: s.id,
          eventId: s.event_id,
          companyName: s.company_name,
          companyLogoUrl: s.company_logo_url,
          role: null,
        }));
        setSponsors(mappedSponsors);

        if (sponsorsData.length === 0) {
          // No sponsors - clear any stale context and show empty state
          if (activeSponsorId) {
            console.log("Clearing stale sponsor context - user has no sponsor memberships");
            clearSponsorContext();
          }
          setIsInitializing(false);
        } else if (activeSponsorId) {
          // Validate that current activeSponsorId is still valid
          const isValidSponsor = sponsorsData.some((s: { id: string }) => s.id === activeSponsorId);
          if (!isValidSponsor) {
            console.log("Clearing stale sponsor context - activeSponsorId not found in user's sponsors");
            clearSponsorContext();
            // Auto-select if only one sponsor, otherwise redirect to selection
            if (sponsorsData.length === 1) {
              const sponsor = sponsorsData[0];
              setActiveSponsor(sponsor.id, sponsor.event_id, sponsor.company_name, null);
            } else {
              router.push("/sponsor/select-event");
              return;
            }
          }
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
  }, [token, activeSponsorId, pathname, router, setActiveSponsor, setSponsors, clearSponsorContext]);

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
