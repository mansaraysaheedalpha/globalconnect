// src/app/(sponsor)/sponsor/leads/starred/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import { useState } from "react";

interface StarredLead {
  id: string;
  name: string;
  email: string;
  company: string;
  title: string;
  intentLevel: "hot" | "warm" | "cold";
  intentScore: number;
  followUpStatus: string;
  notes: string;
  capturedAt: string;
  lastActivity: string;
}

const mockStarredLeads: StarredLead[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@techcorp.com",
    company: "TechCorp Inc.",
    title: "VP of Engineering",
    intentLevel: "hot",
    intentScore: 85,
    followUpStatus: "new",
    notes: "Interested in enterprise plan. Requested demo for next week.",
    capturedAt: "2024-01-15T10:30:00Z",
    lastActivity: "2024-01-15T14:20:00Z",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@startupxyz.io",
    company: "StartupXYZ",
    title: "CTO",
    intentLevel: "hot",
    intentScore: 78,
    followUpStatus: "contacted",
    notes: "Evaluating solutions for Q2 rollout. Budget approved.",
    capturedAt: "2024-01-15T11:15:00Z",
    lastActivity: "2024-01-16T09:00:00Z",
  },
];

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
  const [search, setSearch] = useState("");

  const filteredLeads = mockStarredLeads.filter(
    (lead) =>
      search === "" ||
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            Starred Leads
          </h1>
          <p className="text-muted-foreground">
            {filteredLeads.length} priority leads to follow up
          </p>
        </div>
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

      {/* Lead Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-semibold">
                    {lead.name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{lead.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {lead.email}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={getIntentBadgeClass(lead.intentLevel)}
                  >
                    {lead.intentLevel}
                  </Badge>
                  <Button variant="ghost" size="icon" className="text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {lead.company}
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {lead.title}
                </div>
              </div>

              {lead.notes && (
                <div className="p-3 rounded-lg bg-muted/50 text-sm">
                  <p className="font-medium text-xs text-muted-foreground mb-1">Notes</p>
                  <p>{lead.notes}</p>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  Captured {new Date(lead.capturedAt).toLocaleDateString()}
                </span>
                <span>|</span>
                <span>
                  Score: <span className="font-medium">{lead.intentScore}</span>
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

      {filteredLeads.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Star className="h-12 w-12 mx-auto opacity-50" />
              <p className="mt-4 font-medium">No starred leads</p>
              <p className="text-sm">
                Star your most important leads to see them here
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
