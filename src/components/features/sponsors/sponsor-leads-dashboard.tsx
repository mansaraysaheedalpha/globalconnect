// src/components/features/sponsors/sponsor-leads-dashboard.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Users,
  Flame,
  Thermometer,
  Snowflake,
  Search,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { useSponsors } from "@/hooks/use-sponsors";
import { LeadCard } from "./lead-card";
import { Lead, getIntentLevel } from "@/types/sponsor";
import { cn } from "@/lib/utils";

interface SponsorLeadsDashboardProps {
  eventId: string;
  onContactLead?: (lead: Lead) => void;
}

export function SponsorLeadsDashboard({
  eventId,
  onContactLead,
}: SponsorLeadsDashboardProps) {
  const {
    leads,
    hotLeads,
    totalLeads,
    isConnected,
    isJoined,
    isLoading,
    error,
    joinLeadStream,
    clearError,
  } = useSponsors({ eventId });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Filter leads by search query
  const filteredLeads = leads.filter((lead) =>
    lead.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by intent level
  const hotLeadsList = filteredLeads.filter(
    (l) => getIntentLevel(l.intentScore) === "hot"
  );
  const warmLeadsList = filteredLeads.filter(
    (l) => getIntentLevel(l.intentScore) === "warm"
  );
  const coldLeadsList = filteredLeads.filter(
    (l) => getIntentLevel(l.intentScore) === "cold"
  );

  // Get leads for current tab
  const getLeadsForTab = () => {
    switch (activeTab) {
      case "hot":
        return hotLeadsList;
      case "warm":
        return warmLeadsList;
      case "cold":
        return coldLeadsList;
      default:
        return filteredLeads;
    }
  };

  const displayLeads = getLeadsForTab();

  return (
    <div className="space-y-6">
      {/* Header with Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Lead Capture Dashboard
              </CardTitle>
              <CardDescription>
                Real-time leads from your sponsor booth and content
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-600 border-green-200"
                >
                  <Wifi className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-600 border-red-200"
                >
                  <WifiOff className="h-3 w-3 mr-1" />
                  Disconnected
                </Badge>
              )}
              {!isJoined && isConnected && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={joinLeadStream}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={cn("h-4 w-4 mr-1", isLoading && "animate-spin")}
                  />
                  Connect
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{totalLeads}</p>
                <p className="text-xs text-muted-foreground">Total Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {hotLeadsList.length}
                </p>
                <p className="text-xs text-muted-foreground">Hot Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {warmLeadsList.length}
                </p>
                <p className="text-xs text-muted-foreground">Warm Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Snowflake className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {coldLeadsList.length}
                </p>
                <p className="text-xs text-muted-foreground">Cold Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Tabs */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="hot" className="text-red-600">
                  Hot
                </TabsTrigger>
                <TabsTrigger value="warm" className="text-yellow-600">
                  Warm
                </TabsTrigger>
                <TabsTrigger value="cold" className="text-blue-600">
                  Cold
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {displayLeads.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Leads Yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {isJoined
                  ? "Leads will appear here in real-time as attendees interact with your content."
                  : "Connect to the lead stream to start receiving leads."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displayLeads.map((lead) => (
                <LeadCard
                  key={lead.userId}
                  lead={lead}
                  onContact={onContactLead}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
