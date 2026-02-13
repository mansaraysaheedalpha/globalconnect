// src/app/(platform)/dashboard/events/[eventId]/analytics/_components/scheduled-reports.tsx
"use client";

import React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface ScheduledReportsProps {
  eventId: string;
}

export function ScheduledReports({ eventId }: ScheduledReportsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription className="mt-1">
                Automated report delivery via email — daily, weekly, or monthly
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary">Coming Soon</Badge>
        </div>
      </CardHeader>
    </Card>
  );
}
