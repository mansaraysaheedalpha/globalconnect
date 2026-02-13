// src/components/features/waitlist/waitlist-management-table.tsx
"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
import { Input } from "@/components/ui/input";
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
  Search,
  ChevronLeft,
  ChevronRight,
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

const PAGE_SIZE = 25;

interface WaitlistManagementTableProps {
  sessionId: string;
  sessionTitle?: string;
}

interface WaitlistUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
}

interface WaitlistEntry {
  id: string;
  position: number;
  userId: string;
  user?: WaitlistUser;
  sessionId: string;
  status: "WAITING" | "OFFERED" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "LEFT";
  priorityTier: "VIP" | "PREMIUM" | "STANDARD";
  joinedAt: string;
  offerSentAt?: string;
  offerExpiresAt?: string;
  offerRespondedAt?: string;
  leftAt?: string;
}

export function WaitlistManagementTable({ sessionId, sessionTitle }: WaitlistManagementTableProps) {
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);
  const [bulkOfferCount, setBulkOfferCount] = useState(5);
  const { token } = useAuthStore();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Search/filter state
  const [searchQuery, setSearchQuery] = useState("");

  // Socket connection status for reconnection indicator
  const [socketConnected, setSocketConnected] = useState(true);

  // Debounced refetch refs
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingChangesRef = useRef(0);

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
      const offerData = data.sendWaitlistOffer;
      toast.success("Waitlist offer sent", {
        description: offerData?.offerExpiresAt
          ? `Offer will expire at ${new Date(offerData.offerExpiresAt).toLocaleTimeString()}`
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
      const result = data.bulkSendWaitlistOffers;
      toast.success(`Sent ${result?.offersSent || 0} offers`, {
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

  // Debounced refetch: batches all WebSocket events within a 1-second window
  const debouncedRefetch = useCallback(() => {
    pendingChangesRef.current += 1;

    if (debounceTimerRef.current === null) {
      // First event in this batch window: set a 1-second timer
      debounceTimerRef.current = setTimeout(() => {
        const changeCount = pendingChangesRef.current;
        pendingChangesRef.current = 0;
        debounceTimerRef.current = null;

        refetch();
        toast.info(`Waitlist updated (${changeCount} change${changeCount !== 1 ? "s" : ""})`, {
          duration: 3000,
        });
      }, 1000);
    }
    // If timer already running, just increment counter (done above)
  }, [refetch]);

  // WebSocket integration for real-time updates with error handling
  useEffect(() => {
    if (!token || !sessionId) return;

    logger.info("[WaitlistManagement] Initializing WebSocket for real-time updates", { sessionId });

    const socket = initializeSocket(token);

    // Join organizer room for this session's waitlist updates
    const roomName = `session:${sessionId}:waitlist:organizer`;

    // Error handling for join_room
    socket.emit("join_room", roomName, (error: any) => {
      if (error) {
        logger.error("[WaitlistManagement] Failed to join room", error, { roomName });
      } else {
        logger.info("[WaitlistManagement] Joined organizer room", { roomName });
      }
    });

    // Listen for waitlist updates (debounced)
    const handleWaitlistUpdate = (data: any) => {
      logger.info("[WaitlistManagement] Received waitlist update", data);
      debouncedRefetch();
    };

    // Socket connection status handlers
    const handleDisconnect = (reason: string) => {
      logger.info("[WaitlistManagement] Socket disconnected", { reason });
      setSocketConnected(false);
    };

    const handleConnect = () => {
      logger.info("[WaitlistManagement] Socket reconnected, rejoining room");
      setSocketConnected(true);
      // Rejoin the room on reconnect
      socket.emit("join_room", roomName, (error: any) => {
        if (error) {
          logger.error("[WaitlistManagement] Failed to rejoin room after reconnect", error, { roomName });
        }
      });
      // Fresh refetch after reconnect
      refetch();
    };

    // Listen for specific waitlist events
    socket.on("WAITLIST_UPDATED", handleWaitlistUpdate);
    socket.on("WAITLIST_POSITION_CHANGED", handleWaitlistUpdate);
    socket.on("WAITLIST_ENTRY_ADDED", handleWaitlistUpdate);
    socket.on("WAITLIST_ENTRY_REMOVED", handleWaitlistUpdate);
    socket.on("WAITLIST_OFFER_SENT", handleWaitlistUpdate);

    // Socket connection lifecycle events
    socket.on("disconnect", handleDisconnect);
    socket.on("connect", handleConnect);

    // Cleanup on unmount: remove each specific handler to prevent stacking
    return () => {
      logger.info("[WaitlistManagement] Cleaning up WebSocket listeners", { sessionId });
      socket.off("WAITLIST_UPDATED", handleWaitlistUpdate);
      socket.off("WAITLIST_POSITION_CHANGED", handleWaitlistUpdate);
      socket.off("WAITLIST_ENTRY_ADDED", handleWaitlistUpdate);
      socket.off("WAITLIST_ENTRY_REMOVED", handleWaitlistUpdate);
      socket.off("WAITLIST_OFFER_SENT", handleWaitlistUpdate);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect", handleConnect);
      socket.emit("leave_room", roomName);

      // Clear debounce timer
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
        pendingChangesRef.current = 0;
      }
    };
  }, [token, sessionId, refetch, debouncedRefetch]);

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

  const waitlist: WaitlistEntry[] = data?.sessionWaitlist || [];

  // Filter entries by search query (name or email)
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return waitlist;
    const query = searchQuery.toLowerCase().trim();
    return waitlist.filter((entry) => {
      const firstName = (entry.user?.firstName || "").toLowerCase();
      const lastName = (entry.user?.lastName || "").toLowerCase();
      const email = (entry.user?.email || "").toLowerCase();
      const fullName = `${firstName} ${lastName}`;
      return (
        firstName.includes(query) ||
        lastName.includes(query) ||
        fullName.includes(query) ||
        email.includes(query)
      );
    });
  }, [waitlist, searchQuery]);

  // Pagination calculations
  const totalEntries = filteredEntries.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / PAGE_SIZE));
  // Clamp currentPage if data changed (e.g. from a refetch) and page is now out of range
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalEntries);
  const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

  // Reset to page 1 when search query changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleRemove = (entry: WaitlistEntry) => {
    setSelectedEntry(entry);
    setRemoveDialogOpen(true);
  };

  const confirmRemove = () => {
    if (!selectedEntry) return;

    removeFromWaitlist({
      variables: {
        input: {
          sessionId: sessionId,
          userId: selectedEntry.userId,
        },
      },
    });
  };

  const handleSendOffer = (entry: WaitlistEntry) => {
    sendOffer({
      variables: {
        input: {
          sessionId: sessionId,
          userId: entry.userId,
        },
      },
    });
  };

  const handleBulkSendOffers = () => {
    // M-FE3: Validate count is within reasonable bounds
    const clampedCount = Math.max(1, Math.min(bulkOfferCount, 50));
    bulkSendOffers({
      variables: {
        input: {
          sessionId: sessionId,
          count: clampedCount,
        },
      },
    });
  };

  const getStatusBadge = (status: WaitlistEntry["status"]) => {
    switch (status) {
      case "WAITING":
        return <Badge variant="secondary" role="status" aria-label="Status: Waiting">Waiting</Badge>;
      case "OFFERED":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20" role="status" aria-label="Status: Offer Sent">Offer Sent</Badge>;
      case "ACCEPTED":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20" role="status" aria-label="Status: Accepted">Accepted</Badge>;
      case "DECLINED":
        return <Badge variant="outline" className="text-red-600" role="status" aria-label="Status: Declined">Declined</Badge>;
      case "EXPIRED":
        return <Badge variant="outline" className="text-muted-foreground" role="status" aria-label="Status: Expired">Expired</Badge>;
      case "LEFT":
        return <Badge variant="outline" className="text-muted-foreground" role="status" aria-label="Status: Left">Left</Badge>;
      default:
        return <Badge variant="outline" role="status">{status}</Badge>;
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
              {sessionTitle && <CardDescription className="truncate max-w-xs sm:max-w-md md:max-w-lg">{sessionTitle}</CardDescription>}
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
          {/* Reconnecting indicator */}
          {!socketConnected && (
            <div className="flex items-center gap-2 text-sm text-yellow-600 mb-3 px-1" role="status" aria-live="assertive">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              <span>Reconnecting...</span>
            </div>
          )}

          {waitlist.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No one on the waitlist</h3>
              <p className="text-sm text-muted-foreground">
                When the session fills up, attendees will be added to the waitlist.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Search filter */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by name or email..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                  aria-label="Filter waitlist entries by name or email"
                />
              </div>

              <div className="rounded-md border" role="region" aria-label="Waitlist entries" aria-live="polite">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12" scope="col">#</TableHead>
                      <TableHead scope="col">Attendee</TableHead>
                      <TableHead scope="col">Status</TableHead>
                      <TableHead scope="col">Joined</TableHead>
                      <TableHead className="text-right" scope="col">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          No entries match your search.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedEntries.map((entry) => {
                        // Get user display info with fallbacks
                        const firstName = entry.user?.firstName || "User";
                        const lastName = entry.user?.lastName || entry.userId.slice(0, 8);
                        const email = entry.user?.email || "";
                        const imageUrl = entry.user?.imageUrl;
                        const initials = `${firstName[0] || "U"}${lastName[0] || ""}`.toUpperCase();

                        return (
                          <TableRow key={entry.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <span>{entry.position}</span>
                                {entry.priorityTier !== "STANDARD" && (
                                  <Badge variant="outline" className="text-xs">
                                    {entry.priorityTier}
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
                                    {email || `ID: ${entry.userId.slice(0, 8)}...`}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {getStatusBadge(entry.status)}
                                {entry.offerSentAt && (
                                  <p className="text-xs text-muted-foreground">
                                    Sent {formatSafeDate(entry.offerSentAt)}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                {formatSafeDate(entry.joinedAt)}
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
                                    aria-label={`Send offer to ${firstName} ${lastName}`}
                                  >
                                    <Send className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                                    Send Offer
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemove(entry)}
                                  disabled={removing}
                                  aria-label={`Remove ${firstName} ${lastName} from waitlist`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination controls */}
              {totalEntries > 0 && (
                <div className="flex items-center justify-between px-1 pt-2">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{endIndex} of {totalEntries}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={safePage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      aria-label="Go to previous page"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
                      Prev
                    </Button>
                    <span className="text-sm text-muted-foreground" aria-current="page">
                      Page {safePage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={safePage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      aria-label="Go to next page"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              )}
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
                {selectedEntry?.user?.firstName || "User"}{" "}
                {selectedEntry?.user?.lastName || selectedEntry?.userId.slice(0, 8)}
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
