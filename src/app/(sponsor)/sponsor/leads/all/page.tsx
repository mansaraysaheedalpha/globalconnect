// src/app/(sponsor)/sponsor/leads/all/page.tsx
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  title: string;
  intentLevel: "hot" | "warm" | "cold";
  intentScore: number;
  followUpStatus: "new" | "contacted" | "qualified" | "not_interested" | "converted";
  isStarred: boolean;
  capturedAt: string;
  interactions: number;
  tags: string[];
}

// Mock data
const mockLeads: Lead[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@techcorp.com",
    company: "TechCorp Inc.",
    title: "VP of Engineering",
    intentLevel: "hot",
    intentScore: 85,
    followUpStatus: "new",
    isStarred: true,
    capturedAt: "2024-01-15T10:30:00Z",
    interactions: 4,
    tags: ["enterprise", "decision-maker"],
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
    isStarred: true,
    capturedAt: "2024-01-15T11:15:00Z",
    interactions: 3,
    tags: ["startup", "technical"],
  },
  {
    id: "3",
    name: "Emily Davis",
    email: "emily.d@enterprise.co",
    company: "Enterprise Co.",
    title: "Product Manager",
    intentLevel: "warm",
    intentScore: 55,
    followUpStatus: "new",
    isStarred: false,
    capturedAt: "2024-01-15T12:00:00Z",
    interactions: 2,
    tags: ["product"],
  },
  {
    id: "4",
    name: "James Wilson",
    email: "jwilson@innovlabs.com",
    company: "Innovation Labs",
    title: "Developer",
    intentLevel: "cold",
    intentScore: 25,
    followUpStatus: "new",
    isStarred: false,
    capturedAt: "2024-01-15T13:30:00Z",
    interactions: 1,
    tags: ["developer"],
  },
  {
    id: "5",
    name: "Lisa Anderson",
    email: "lisa@digitalagency.com",
    company: "Digital Agency",
    title: "Director of Marketing",
    intentLevel: "warm",
    intentScore: 62,
    followUpStatus: "qualified",
    isStarred: false,
    capturedAt: "2024-01-15T14:45:00Z",
    interactions: 3,
    tags: ["marketing", "agency"],
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

  const [search, setSearch] = useState("");
  const [intentFilter, setIntentFilter] = useState(initialIntent);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  // Filter leads
  const filteredLeads = mockLeads.filter((lead) => {
    const matchesSearch =
      search === "" ||
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.company.toLowerCase().includes(search.toLowerCase());

    const matchesIntent =
      intentFilter === "all" || lead.intentLevel === intentFilter;

    const matchesStatus =
      statusFilter === "all" || lead.followUpStatus === statusFilter;

    return matchesSearch && matchesIntent && matchesStatus;
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Leads</h1>
          <p className="text-muted-foreground">
            {filteredLeads.length} leads total
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
                    className={lead.isStarred ? "text-yellow-500" : ""}
                  >
                    {lead.isStarred ? (
                      <Star className="h-4 w-4 fill-current" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">{lead.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{lead.company}</p>
                    <p className="text-sm text-muted-foreground">{lead.title}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getIntentBadgeClass(lead.intentLevel)}
                  >
                    {lead.intentLevel}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getStatusBadgeClass(lead.followUpStatus)}
                  >
                    {lead.followUpStatus.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full ${
                          lead.intentScore >= 70
                            ? "bg-red-500"
                            : lead.intentScore >= 40
                            ? "bg-orange-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${lead.intentScore}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {lead.intentScore}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(lead.capturedAt).toLocaleDateString()}
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
      </Card>
    </div>
  );
}
