// src/app/(platform)/dashboard/events/[eventId]/sponsors/page.tsx
"use client";

import { useParams } from "next/navigation";
import { SponsorLeadsDashboard } from "@/components/features/sponsors/sponsor-leads-dashboard";

export default function SponsorsPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Sponsor Leads</h1>
        <p className="text-muted-foreground">
          Track and manage leads captured from sponsor interactions
        </p>
      </div>

      <SponsorLeadsDashboard eventId={eventId} />
    </div>
  );
}
