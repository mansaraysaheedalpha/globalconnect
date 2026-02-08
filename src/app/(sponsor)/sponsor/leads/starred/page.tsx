// src/app/(sponsor)/sponsor/leads/starred/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Star,
  Mail,
  Phone,
  MessageSquare,
  Building2,
  Briefcase,
  Clock,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useSponsorStore } from "@/store/sponsor.store";
import Link from "next/link";

interface StarredLead {
  id: string;
  user_name: string | null;
  user_email: string | null;
  user_company: string | null;
  user_title: string | null;
  intent_level: "hot" | "warm" | "cold";
  intent_score: number;
  follow_up_status: string;
  follow_up_notes: string | null;
  created_at: string;
  last_interaction_at: string;
  is_starred: boolean;
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

export default function StarredLeadsPage() {
  const { token } = useAuthStore();
  const { activeSponsorId, activeSponsorName } = useSponsorStore();
  const [leads, setLeads] = useState<StarredLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const API_BASE_URL = process.env.NEXT_PUBLIC_EVENT_LIFECYCLE_URL || "http://localhost:8000/api/v1";

  // Fetch starred leads for selected sponsor
  const fetchLeads = useCallback(async () => {
    if (!token || !activeSponsorId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch all leads and filter starred ones client-side
      // (API may not have direct starred filter, so we get all and filter)
      const response = await fetch(
        `${API_BASE_URL}/sponsors/sponsors/${activeSponsorId}/leads?limit=100`,
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
      // Filter to only starred leads
      const starredLeads = data.filter((lead: StarredLead) => lead.is_starred);
      setLeads(starredLeads);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leads");
    } finally {
      setIsLoading(false);
    }
  }, [token, activeSponsorId, API_BASE_URL]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Unstar a lead
  const unstarLead = async (leadId: string) => {
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
          body: JSON.stringify({ is_starred: false }),
        }
      );

      if (response.ok) {
        // Remove from local state
        setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
      }
    } catch {
      // Silently fail
    }
  };

  const filteredLeads = leads.filter(
    (lead) =>
      search === "" ||
      (lead.user_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (lead.user_company || "").toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading && leads.length === 0) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-80" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Starred Leads</h3>
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
              Please select a sponsor event to view starred leads.
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
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            Starred Leads
          </h1>
          <p className="text-muted-foreground">
            {activeSponsorName
              ? `${filteredLeads.length} priority leads for ${activeSponsorName}`
              : `${filteredLeads.length} priority lead${filteredLeads.length !== 1 ? "s" : ""} to follow up`}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search starred leads..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Lead Cards */}
      {filteredLeads.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredLeads.map((lead) => (
            <Card key={lead.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-semibold">
                      {(lead.user_name || "U").charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{lead.user_name || "Unknown"}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {lead.user_email || "No email"}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={getIntentBadgeClass(lead.intent_level)}
                    >
                      {lead.intent_level}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-yellow-500"
                      onClick={() => unstarLead(lead.id)}
                      title="Remove from starred"
                    >
                      <Star className="h-4 w-4 fill-current" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {lead.user_company || "—"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {lead.user_title || "—"}
                  </div>
                </div>

                {lead.follow_up_notes && (
                  <div className="p-3 rounded-lg bg-muted/50 text-sm">
                    <p className="font-medium text-xs text-muted-foreground mb-1">Notes</p>
                    <p>{lead.follow_up_notes}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    Captured {new Date(lead.created_at).toLocaleDateString()}
                  </span>
                  <span>|</span>
                  <span>
                    Score: <span className="font-medium">{lead.intent_score}</span>
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Phone className="mr-2 h-4 w-4" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Note
                  </Button>
                  <Button size="sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-yellow-50 flex items-center justify-center mb-4">
              <Star className="h-8 w-8 text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No starred leads</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
              {search
                ? "No starred leads match your search. Try adjusting your search terms."
                : "Star your most important leads from the All Leads page to quickly access them here for priority follow-up."}
            </p>
            {!search && (
              <Button variant="outline" asChild>
                <Link href="/sponsor/leads">
                  <Users className="mr-2 h-4 w-4" />
                  View All Leads
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
