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
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h3 className="text-xl font-semibold">{attendees.length} Attendees</h3>
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm w-full sm:w-auto"
        />
      </div>
      {/* Mobile cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredAttendees.length > 0 ? (
          filteredAttendees.map((attendee) => {
            const name = attendee.user
              ? `${attendee.user.first_name} ${attendee.user.last_name}`
              : attendee.guestName;
            const email = attendee.user ? attendee.user.email : attendee.guestEmail;
            return (
              <Card key={attendee.id} className="border shadow-sm">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{name || "Name not available"}</div>
                      <div className="text-sm text-muted-foreground">
                        {email || "Email not available"}
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(attendee.status)} className="capitalize">
                      {attendee.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Ticket</span>
                    <span className="font-mono">{attendee.ticketCode}</span>
                  </div>
                  {attendee.checkedInAt && (
                    <div className="text-xs text-muted-foreground">
                      Checked in at {format(new Date(attendee.checkedInAt), "p")}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="p-4 text-center text-sm text-muted-foreground">
              No attendees found.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block border rounded-lg">
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
                      <div className="font-medium">
                        {name || "Name not available"}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {email || "Email not available"}
                      </div>
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
