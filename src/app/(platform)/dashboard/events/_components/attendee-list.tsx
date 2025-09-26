//src/app/(platform)/events/_components/attendee-list.tsx
"use client";

import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Attendee = {
  id: string;
  status: string;
  ticketCode: string;
  checkedInAt?: string | null;
  guestEmail?: string | null;
  guestName?: string | null;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
};

interface AttendeeListProps {
  attendees: Attendee[];
}

export const AttendeeList = ({ attendees }: AttendeeListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAttendees = useMemo(() => {
    if (!searchTerm) return attendees;
    return attendees.filter((attendee) => {
      const name = attendee.user
        ? `${attendee.user.first_name} ${attendee.user.last_name}`
        : attendee.guestName || "";
      const email = attendee.user
        ? attendee.user.email
        : attendee.guestEmail || "";
      return (
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [attendees, searchTerm]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "checked_in":
        return "default";
      case "confirmed":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">{attendees.length} Attendees</h3>
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Attendee</TableHead>
              <TableHead>Ticket Code</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAttendees.length > 0 ? (
              filteredAttendees.map((attendee) => {
                const name = attendee.user
                  ? `${attendee.user.first_name} ${attendee.user.last_name}`
                  : attendee.guestName;
                const email = attendee.user
                  ? attendee.user.email
                  : attendee.guestEmail;
                return (
                  <TableRow key={attendee.id}>
                    <TableCell>
                      {/* --- THIS IS THE FIX --- */}
                      {/* Removed icons and added explicit fallback text */}
                      <div className="font-medium">
                        {name || "Name not available"}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {email || "Email not available"}
                      </div>
                      {/* -------------------- */}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {attendee.ticketCode}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusVariant(attendee.status)}
                        className="capitalize"
                      >
                        {attendee.status.replace("_", " ")}
                      </Badge>
                      {attendee.checkedInAt && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {format(new Date(attendee.checkedInAt), "p")}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No attendees found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
