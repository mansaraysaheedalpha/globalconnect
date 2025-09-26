// src/app/(public)/events/[eventId]/_components/sticky-registration-card.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarDaysIcon,
  MapPinIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";

interface StickyRegistrationCardProps {
  startDate: string;
  venueName?: string | null;
  onRegisterClick: () => void;
}

export const StickyRegistrationCard = ({
  startDate,
  venueName,
  onRegisterClick,
}: StickyRegistrationCardProps) => {
  const formattedDate = new Date(startDate).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <aside className="sticky top-24">
      <Card className="shadow-lg dark:bg-card">
        <CardContent className="p-6">
          <Button size="lg" className="w-full" onClick={onRegisterClick}>
            <TicketIcon className="h-5 w-5 mr-2" />
            Register Now
          </Button>
          <ul className="mt-6 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <CalendarDaysIcon className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div>
                <span className="font-semibold">Date & Time</span>
                <p className="text-muted-foreground">{formattedDate}</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <MapPinIcon className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div>
                <span className="font-semibold">Location</span>
                <p className="text-muted-foreground">
                  {venueName || "To be confirmed"}
                </p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </aside>
  );
};
