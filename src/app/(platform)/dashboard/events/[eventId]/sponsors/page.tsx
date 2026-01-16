// src/app/(platform)/dashboard/events/[eventId]/sponsors/page.tsx
"use client";

import { useParams } from "next/navigation";
import { SponsorManagement } from "@/components/features/sponsors/sponsor-management";
import { useAuthStore } from "@/store/auth.store";

export default function SponsorsPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { orgId } = useAuthStore();

  // Get organization ID from auth store
  const organizationId = orgId || "";

  return (
    <div className="p-6">
      <SponsorManagement eventId={eventId} organizationId={organizationId} />
    </div>
  );
}
