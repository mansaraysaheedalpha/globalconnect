// src/app/(sponsor)/sponsor/leads/all/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "@/components/ui/dropdown-menu";
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
  Mail,
  Eye,
  Trash2,
  FileDown,
  Phone,
  MessageSquare,
  Users,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

interface Lead {
  id: string;
  user_name: string | null;
  user_email: string | null;
  user_company: string | null;
  user_title: string | null;
  intent_level: "hot" | "warm" | "cold";
  intent_score: number;
  follow_up_status: "new" | "contacted" | "qualified" | "not_interested" | "converted";
  is_starred: boolean;
  created_at: string;
  interaction_count: number;
  tags: string[];
}

interface Sponsor {
  id: string;
  company_name: string;
}

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
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [selectedSponsorId, setSelectedSponsorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [intentFilter, setIntentFilter] = useState(initialIntent);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  // Fetch user's sponsors
  useEffect(() => {
    const fetchSponsors = async () => {
      if (!token) return;

      try {
        const response = await fetch(`${apiUrl}/my-sponsors`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch sponsors");
        }

        const data = await response.json();
        setSponsors(data);
        if (data.length > 0) {
          setSelectedSponsorId(data[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load sponsors");
      }
    };

    fetchSponsors();
  }, [token, apiUrl]);

  // Fetch leads for selected sponsor
  const fetchLeads = useCallback(async () => {
    if (!token || !selectedSponsorId) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (intentFilter !== "all") {
        params.append("intent_level", intentFilter);
      }
      params.append("limit", "100");

      const response = await fetch(
        `${apiUrl}/sponsors/${selectedSponsorId}/leads?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
  }, [token, selectedSponsorId, intentFilter, apiUrl]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Toggle star status
  const toggleStar = async (leadId: string, currentStarred: boolean) => {
    if (!token || !selectedSponsorId) return;

    try {
      const response = await fetch(
        `${apiUrl}/sponsors/${selectedSponsorId}/leads/${leadId}`,
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
      <div className="p-6 space-y-6">
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
      <div className="p-6">
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

  if (sponsors.length === 0 && !isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Sponsor Access</h3>
            <p className="text-sm text-muted-foreground max-w-sm text-center">
              You are not currently associated with any sponsors. Please contact your event organizer if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Leads</h1>
          <p className="text-muted-foreground">
            {filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <div className="flex gap-2">
          {sponsors.length > 1 && (
            <Select value={selectedSponsorId || ""} onValueChange={setSelectedSponsorId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Sponsor" />
              </SelectTrigger>
              <SelectContent>
                {sponsors.map((sponsor) => (
                  <SelectItem key={sponsor.id} value={sponsor.id}>
                    {sponsor.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Phone className="mr-2 h-4 w-4" />
                          Call
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Add Note
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
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
        )}
      </Card>
    </div>
  );
}
