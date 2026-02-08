// src/app/(sponsor)/sponsor/leads/all/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  MoreHorizontal,
  Star,
  StarOff,
  Eye,
  Trash2,
  FileDown,
  MessageSquare,
  Users,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  XCircle,
  UserCheck,
  ArrowRightCircle,
  Building,
  Mail,
  Phone,
  Calendar,
  Activity,
  Tags,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useSponsorStore } from "@/store/sponsor.store";
import { format } from "date-fns";

interface Lead {
  id: string;
  user_name: string | null;
  user_email: string | null;
  user_company: string | null;
  user_title: string | null;
  intent_level: "hot" | "warm" | "cold";
  intent_score: number;
  follow_up_status: "new" | "contacted" | "qualified" | "not_interested" | "converted";
  follow_up_notes: string | null;
  is_starred: boolean;
  created_at: string;
  first_interaction_at: string | null;
  last_interaction_at: string | null;
  interaction_count: number;
  interactions: Array<{ type: string; timestamp: string; notes?: string }>;
  tags: string[];
  contact_requested: boolean;
  contact_notes: string | null;
}

type FollowUpStatus = "new" | "contacted" | "qualified" | "not_interested" | "converted";

function getIntentBadgeClass(intentLevel: string) {
  switch (intentLevel) {
    case "hot":
      return "bg-red-500/10 text-red-600 border-red-500/20";
    case "warm":
      return "bg-orange-500/10 text-orange-600 border-orange-500/20";
    case "cold":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    default:
      return "";
  }
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "new":
      return "bg-purple-500/10 text-purple-600 border-purple-500/20";
    case "contacted":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "qualified":
      return "bg-green-500/10 text-green-600 border-green-500/20";
    case "not_interested":
      return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    case "converted":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    default:
      return "";
  }
}

export default function AllLeadsPage() {
  const searchParams = useSearchParams();
  const initialIntent = searchParams.get("intent") || "all";
  const initialStatus = searchParams.get("status") || "all";

  const { token } = useAuthStore();
  const { activeSponsorId, activeSponsorName } = useSponsorStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [intentFilter, setIntentFilter] = useState(initialIntent);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  // Modal states
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [noteText, setNoteText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_EVENT_LIFECYCLE_URL || "http://localhost:8000/api/v1";

  // Fetch leads for selected sponsor
  const fetchLeads = useCallback(async () => {
    if (!token || !activeSponsorId) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (intentFilter !== "all") {
        params.append("intent_level", intentFilter);
      }
      params.append("limit", "100");

      const response = await fetch(
        `${API_BASE_URL}/sponsors/sponsors/${activeSponsorId}/leads?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch leads");
      }

      const data = await response.json();
      setLeads(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leads");
    } finally {
      setIsLoading(false);
    }
  }, [token, activeSponsorId, intentFilter, API_BASE_URL]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Toggle star status
  const toggleStar = async (leadId: string, currentStarred: boolean) => {
    if (!token || !activeSponsorId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/sponsors/sponsors/${activeSponsorId}/leads/${leadId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_starred: !currentStarred }),
        }
      );

      if (response.ok) {
        setLeads((prev) =>
          prev.map((lead) =>
            lead.id === leadId ? { ...lead, is_starred: !currentStarred } : lead
          )
        );
      }
    } catch {
      // Silently fail - could add toast notification
    }
  };

  // Update lead status
  const updateLeadStatus = async (leadId: string, newStatus: FollowUpStatus) => {
    if (!token || !activeSponsorId) return;

    setIsUpdating(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/sponsors/sponsors/${activeSponsorId}/leads/${leadId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ follow_up_status: newStatus }),
        }
      );

      if (response.ok) {
        setLeads((prev) =>
          prev.map((lead) =>
            lead.id === leadId ? { ...lead, follow_up_status: newStatus } : lead
          )
        );
      }
    } catch {
      // Could add toast notification
    } finally {
      setIsUpdating(false);
    }
  };

  // Add note to lead
  const addNoteToLead = async () => {
    if (!token || !activeSponsorId || !selectedLead || !noteText.trim()) return;

    setIsUpdating(true);
    try {
      // Append new note to existing notes
      const existingNotes = selectedLead.follow_up_notes || "";
      const timestamp = format(new Date(), "MMM d, yyyy h:mm a");
      const newNotes = existingNotes
        ? `${existingNotes}\n\n[${timestamp}]\n${noteText.trim()}`
        : `[${timestamp}]\n${noteText.trim()}`;

      const response = await fetch(
        `${API_BASE_URL}/sponsors/sponsors/${activeSponsorId}/leads/${selectedLead.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ follow_up_notes: newNotes }),
        }
      );

      if (response.ok) {
        setLeads((prev) =>
          prev.map((lead) =>
            lead.id === selectedLead.id ? { ...lead, follow_up_notes: newNotes } : lead
          )
        );
        setNoteModalOpen(false);
        setNoteText("");
        setSelectedLead(null);
      }
    } catch {
      // Could add toast notification
    } finally {
      setIsUpdating(false);
    }
  };

  // Archive lead
  const archiveLead = async () => {
    if (!token || !activeSponsorId || !selectedLead) return;

    setIsUpdating(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/sponsors/sponsors/${activeSponsorId}/leads/${selectedLead.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_archived: true }),
        }
      );

      if (response.ok) {
        // Remove from local state
        setLeads((prev) => prev.filter((lead) => lead.id !== selectedLead.id));
        setArchiveModalOpen(false);
        setSelectedLead(null);
      }
    } catch {
      // Could add toast notification
    } finally {
      setIsUpdating(false);
    }
  };

  // Open modals with selected lead
  const openDetailsModal = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailsModalOpen(true);
  };

  const openNoteModal = (lead: Lead) => {
    setSelectedLead(lead);
    setNoteText("");
    setNoteModalOpen(true);
  };

  const openArchiveModal = (lead: Lead) => {
    setSelectedLead(lead);
    setArchiveModalOpen(true);
  };

  // Filter leads by search query and status
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      search === "" ||
      (lead.user_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (lead.user_email || "").toLowerCase().includes(search.toLowerCase()) ||
      (lead.user_company || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || lead.follow_up_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map((l) => l.id));
    }
  };

  const toggleSelectLead = (id: string) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  if (isLoading && leads.length === 0) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-40" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Leads</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchLeads} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show empty state if no active sponsor
  if (!activeSponsorId && !isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Sponsor Selected</h3>
            <p className="text-sm text-muted-foreground max-w-sm text-center">
              Please select a sponsor event to view leads.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Leads</h1>
          <p className="text-muted-foreground">
            {activeSponsorName ? `${filteredLeads.length} leads for ${activeSponsorName}` : `${filteredLeads.length} lead${filteredLeads.length !== 1 ? "s" : ""} total`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
          {selectedLeads.length > 0 && (
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Email Selected ({selectedLeads.length})
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or company..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={intentFilter} onValueChange={setIntentFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Intent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Intent</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="warm">Warm</SelectItem>
                  <SelectItem value="cold">Cold</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="not_interested">Not Interested</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        {filteredLeads.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Leads Found</h3>
            <p className="text-sm text-muted-foreground max-w-sm text-center">
              {search || intentFilter !== "all" || statusFilter !== "all"
                ? "No leads match your current filters. Try adjusting your search criteria."
                : "Leads will appear here as attendees interact with your sponsor content."}
            </p>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedLeads.length === filteredLeads.length &&
                      filteredLeads.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-12"></TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Intent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Captured</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedLeads.includes(lead.id)}
                      onCheckedChange={() => toggleSelectLead(lead.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={lead.is_starred ? "text-yellow-500" : ""}
                      onClick={() => toggleStar(lead.id, lead.is_starred)}
                    >
                      {lead.is_starred ? (
                        <Star className="h-4 w-4 fill-current" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{lead.user_name || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">
                        {lead.user_email || "No email"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{lead.user_company || "—"}</p>
                      <p className="text-sm text-muted-foreground">
                        {lead.user_title || "—"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getIntentBadgeClass(lead.intent_level)}
                    >
                      {lead.intent_level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusBadgeClass(lead.follow_up_status)}
                    >
                      {lead.follow_up_status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full ${
                            lead.intent_score >= 70
                              ? "bg-red-500"
                              : lead.intent_score >= 40
                              ? "bg-orange-500"
                              : "bg-blue-500"
                          }`}
                          style={{ width: `${lead.intent_score}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {lead.intent_score}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDetailsModal(lead)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <ArrowRightCircle className="mr-2 h-4 w-4" />
                            Change Status
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem
                                onClick={() => updateLeadStatus(lead.id, "contacted")}
                                disabled={lead.follow_up_status === "contacted"}
                              >
                                <UserCheck className="mr-2 h-4 w-4 text-blue-500" />
                                Mark Contacted
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateLeadStatus(lead.id, "converted")}
                                disabled={lead.follow_up_status === "converted"}
                              >
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                Mark Converted
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateLeadStatus(lead.id, "not_interested")}
                                disabled={lead.follow_up_status === "not_interested"}
                              >
                                <XCircle className="mr-2 h-4 w-4 text-gray-500" />
                                Mark Not Interested
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => updateLeadStatus(lead.id, "new")}
                                disabled={lead.follow_up_status === "new"}
                              >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Reset to New
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuItem onClick={() => openNoteModal(lead)}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Add Note
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => openArchiveModal(lead)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Archive Lead
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
      </Card>

      {/* View Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>
              Full information about this lead
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedLead.user_name || "Unknown"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {selectedLead.user_email || "No email"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-medium flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {selectedLead.user_company || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-medium">{selectedLead.user_title || "—"}</p>
                </div>
              </div>

              {/* Intent & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Intent Level</p>
                  <Badge variant="outline" className={getIntentBadgeClass(selectedLead.intent_level)}>
                    {selectedLead.intent_level}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Intent Score</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full ${
                          selectedLead.intent_score >= 70
                            ? "bg-red-500"
                            : selectedLead.intent_score >= 40
                            ? "bg-orange-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${selectedLead.intent_score}%` }}
                      />
                    </div>
                    <span className="font-medium">{selectedLead.intent_score}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline" className={getStatusBadgeClass(selectedLead.follow_up_status)}>
                    {selectedLead.follow_up_status.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    First Interaction
                  </p>
                  <p className="font-medium">
                    {selectedLead.first_interaction_at
                      ? format(new Date(selectedLead.first_interaction_at), "MMM d, yyyy h:mm a")
                      : "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Last Interaction
                  </p>
                  <p className="font-medium">
                    {selectedLead.last_interaction_at
                      ? format(new Date(selectedLead.last_interaction_at), "MMM d, yyyy h:mm a")
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Interaction Count & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Interactions</p>
                  <p className="font-medium">{selectedLead.interaction_count}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Tags className="h-4 w-4" />
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedLead.tags?.length > 0 ? (
                      selectedLead.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">No tags</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedLead.follow_up_notes && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <div className="p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                    {selectedLead.follow_up_notes}
                  </div>
                </div>
              )}

              {/* Contact Request */}
              {selectedLead.contact_requested && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800">Contact Requested</p>
                  {selectedLead.contact_notes && (
                    <p className="text-sm text-yellow-700 mt-1">{selectedLead.contact_notes}</p>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setDetailsModalOpen(false);
              if (selectedLead) openNoteModal(selectedLead);
            }}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Modal */}
      <Dialog open={noteModalOpen} onOpenChange={setNoteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add a follow-up note for {selectedLead?.user_name || "this lead"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter your note here..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={4}
            />
            {selectedLead?.follow_up_notes && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Previous Notes</p>
                <div className="p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {selectedLead.follow_up_notes}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addNoteToLead} disabled={!noteText.trim() || isUpdating}>
              {isUpdating ? "Saving..." : "Save Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation Modal */}
      <Dialog open={archiveModalOpen} onOpenChange={setArchiveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Lead</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive this lead? This will remove them from your active leads list.
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="py-4">
              <p className="font-medium">{selectedLead.user_name || "Unknown"}</p>
              <p className="text-sm text-muted-foreground">{selectedLead.user_email}</p>
              <p className="text-sm text-muted-foreground">{selectedLead.user_company}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={archiveLead} disabled={isUpdating}>
              {isUpdating ? "Archiving..." : "Archive Lead"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
