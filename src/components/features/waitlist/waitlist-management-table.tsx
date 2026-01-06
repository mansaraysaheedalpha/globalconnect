// src/components/features/waitlist/waitlist-management-table.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQuery } from "@apollo/client";
import {
  GET_SESSION_WAITLIST_QUERY,
  REMOVE_FROM_WAITLIST_MUTATION,
  SEND_WAITLIST_OFFER_MUTATION,
  BULK_SEND_WAITLIST_OFFERS_MUTATION,
} from "@/graphql/monetization.graphql";
import {
  Loader2,
  Users,
  Clock,
  Send,
  Trash2,
  Mail,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { initializeSocket, getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/auth.store";
import { logger } from "@/lib/logger";

// Utility function for safe date formatting
const formatSafeDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Invalid date';
  }
};

interface WaitlistManagementTableProps {
  sessionId: string;
  sessionTitle?: string;
}

// Backend returns snake_case fields
interface WaitlistUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  image_url?: string;
}

interface WaitlistEntry {
  id: string;
  position: number;
  user_id: string;
  user?: WaitlistUser;
  session_id: string;
  status: "WAITING" | "OFFERED" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "LEFT";
  priority_tier: "VIP" | "PREMIUM" | "STANDARD";
  joined_at: string;
  offer_sent_at?: string;
  offer_expires_at?: string;
  offer_responded_at?: string;
  left_at?: string;
}

export function WaitlistManagementTable({ sessionId, sessionTitle }: WaitlistManagementTableProps) {
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);
  const [bulkOfferCount, setBulkOfferCount] = useState(5);
  const { token } = useAuthStore();

  const { data, loading, refetch } = useQuery(GET_SESSION_WAITLIST_QUERY, {
    variables: { sessionId },
    skip: !sessionId,
    // No polling needed - backend pushes updates via WebSocket events
  });

  const [removeFromWaitlist, { loading: removing }] = useMutation(REMOVE_FROM_WAITLIST_MUTATION, {
    onCompleted: () => {
      toast.success("Removed from waitlist");
      setRemoveDialogOpen(false);
      setSelectedEntry(null);
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to remove from waitlist", {
        description: error.message,
      });
    },
  });

  const [sendOffer, { loading: sendingOffer }] = useMutation(SEND_WAITLIST_OFFER_MUTATION, {
    onCompleted: (data) => {
      const offerData = data.send_waitlist_offer;
      toast.success("Waitlist offer sent", {
        description: offerData?.offer_expires_at
          ? `Offer will expire at ${new Date(offerData.offer_expires_at).toLocaleTimeString()}`
          : undefined,
      });
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to send offer", {
        description: error.message,
      });
    },
  });

  const [bulkSendOffers, { loading: sendingBulk }] = useMutation(BULK_SEND_WAITLIST_OFFERS_MUTATION, {
    onCompleted: (data) => {
      const result = data.bulk_send_waitlist_offers;
      toast.success(`Sent ${result?.offers_sent || 0} offers`, {
        description: result?.message,
      });
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to send bulk offers", {
        description: error.message,
      });
    },
  });

  // WebSocket integration for real-time updates
  useEffect(() => {
    if (!token || !sessionId) return;

    logger.info("[WaitlistManagement] Initializing WebSocket for real-time updates", { sessionId });

    const socket = initializeSocket(token);

    // Join organizer room for this session's waitlist updates
    const roomName = `session:${sessionId}:waitlist:organizer`;
    socket.emit("join_room", roomName);
    logger.info("[WaitlistManagement] Joined organizer room", { roomName });

    // Listen for waitlist updates
    const handleWaitlistUpdate = (data: any) => {
      logger.info("[WaitlistManagement] Received waitlist update", data);
      // Refetch data when waitlist changes
      refetch();
      toast.info("Waitlist updated", {
        description: "The waitlist has been updated with new changes",
        duration: 3000,
      });
    };

    // Listen for specific events
    socket.on("WAITLIST_UPDATED", handleWaitlistUpdate);
    socket.on("WAITLIST_POSITION_CHANGED", handleWaitlistUpdate);
    socket.on("WAITLIST_ENTRY_ADDED", handleWaitlistUpdate);
    socket.on("WAITLIST_ENTRY_REMOVED", handleWaitlistUpdate);
    socket.on("WAITLIST_OFFER_SENT", handleWaitlistUpdate);

    // Cleanup on unmount
    return () => {
      logger.info("[WaitlistManagement] Cleaning up WebSocket listeners", { sessionId });
      socket.off("WAITLIST_UPDATED", handleWaitlistUpdate);
      socket.off("WAITLIST_POSITION_CHANGED", handleWaitlistUpdate);
      socket.off("WAITLIST_ENTRY_ADDED", handleWaitlistUpdate);
      socket.off("WAITLIST_ENTRY_REMOVED", handleWaitlistUpdate);
      socket.off("WAITLIST_OFFER_SENT", handleWaitlistUpdate);
      socket.emit("leave_room", roomName);
    };
  }, [token, sessionId, refetch]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Waitlist Management
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Backend uses snake_case: session_waitlist
  const waitlist: WaitlistEntry[] = data?.session_waitlist || [];

  const handleRemove = (entry: WaitlistEntry) => {
    setSelectedEntry(entry);
    setRemoveDialogOpen(true);
  };

  const confirmRemove = () => {
    if (!selectedEntry) return;

    removeFromWaitlist({
      variables: {
        input: {
          session_id: sessionId,
          user_id: selectedEntry.user_id,
        },
      },
    });
  };

  const handleSendOffer = (entry: WaitlistEntry) => {
    sendOffer({
      variables: {
        input: {
          session_id: sessionId,
          user_id: entry.user_id,
        },
      },
    });
  };

  const handleBulkSendOffers = () => {
    bulkSendOffers({
      variables: {
        input: {
          session_id: sessionId,
          count: bulkOfferCount,
        },
      },
    });
  };

  const getStatusBadge = (status: WaitlistEntry["status"]) => {
    switch (status) {
      case "WAITING":
        return <Badge variant="secondary">Waiting</Badge>;
      case "OFFERED":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Offer Sent</Badge>;
      case "ACCEPTED":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Accepted</Badge>;
      case "DECLINED":
        return <Badge variant="outline" className="text-red-600">Declined</Badge>;
      case "EXPIRED":
        return <Badge variant="outline" className="text-muted-foreground">Expired</Badge>;
      case "LEFT":
        return <Badge variant="outline" className="text-muted-foreground">Left</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const waitingEntries = waitlist.filter((e) => e.status === "WAITING");

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Waitlist Management
                <Badge variant="outline" className="ml-2">
                  Real-time
                </Badge>
              </CardTitle>
              {sessionTitle && <CardDescription>{sessionTitle}</CardDescription>}
            </div>

            {waitingEntries.length > 0 && (
              <Button
                onClick={handleBulkSendOffers}
                disabled={sendingBulk}
                size="sm"
              >
                {sendingBulk ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Send Next {Math.min(bulkOfferCount, waitingEntries.length)} Offers
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {waitlist.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No one on the waitlist</h3>
              <p className="text-sm text-muted-foreground">
                When the session fills up, attendees will be added to the waitlist.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Attendee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waitlist.map((entry) => {
                    // Get user display info with fallbacks
                    const firstName = entry.user?.first_name || "User";
                    const lastName = entry.user?.last_name || entry.user_id.slice(0, 8);
                    const email = entry.user?.email || "";
                    const imageUrl = entry.user?.image_url;
                    const initials = `${firstName[0] || "U"}${lastName[0] || ""}`.toUpperCase();

                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span>{entry.position}</span>
                            {entry.priority_tier !== "STANDARD" && (
                              <Badge variant="outline" className="text-xs">
                                {entry.priority_tier}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              {imageUrl && <AvatarImage src={imageUrl} alt={`${firstName} ${lastName}`} />}
                              <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {firstName} {lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {email || `ID: ${entry.user_id.slice(0, 8)}...`}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {getStatusBadge(entry.status)}
                            {entry.offer_sent_at && (
                              <p className="text-xs text-muted-foreground">
                                Sent {formatSafeDate(entry.offer_sent_at)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {formatSafeDate(entry.joined_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {entry.status === "WAITING" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendOffer(entry)}
                                disabled={sendingOffer}
                              >
                                <Send className="h-3.5 w-3.5 mr-1.5" />
                                Send Offer
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemove(entry)}
                              disabled={removing}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Confirmation Dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove from Waitlist</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <strong>
                {selectedEntry?.user?.first_name || "User"}{" "}
                {selectedEntry?.user?.last_name || selectedEntry?.user_id.slice(0, 8)}
              </strong>{" "}
              from the waitlist? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveDialogOpen(false)}
              disabled={removing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRemove}
              disabled={removing}
            >
              {removing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
