// src/app/(attendee)/attendee/notifications/page.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">Stay updated on your events</p>
      </div>

      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">No Notifications</h3>
          <p className="text-muted-foreground mt-2">
            You'll see event updates and announcements here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
