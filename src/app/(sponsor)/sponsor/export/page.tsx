// src/app/(sponsor)/sponsor/export/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  FileDown,
  FileSpreadsheet,
  FileText,
  Download,
  Filter,
  Inbox,
  AlertCircle,
  RefreshCw,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { useSponsorStore } from "@/store/sponsor.store";

interface Lead {
  id: string;
  user_name: string | null;
  user_email: string | null;
  user_company: string | null;
  user_title: string | null;
  intent_level: "hot" | "warm" | "cold";
  intent_score: number;
  interaction_count: number;
  contact_requested: boolean;
  follow_up_status: string;
  tags: string[];
  first_interaction_at: string;
  last_interaction_at: string;
}

export default function ExportPage() {
  const { token } = useAuthStore();
  const { activeSponsorId, activeSponsorName } = useSponsorStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [exportFormat, setExportFormat] = useState("csv");
  const [intentFilter, setIntentFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFields, setSelectedFields] = useState({
    name: true,
    email: true,
    company: true,
    title: true,
    intentScore: true,
    intentLevel: true,
    interactions: true,
    contactRequested: true,
    followUpStatus: true,
    tags: true,
    firstInteraction: true,
    lastInteraction: true,
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_EVENT_LIFECYCLE_URL || "http://localhost:8000/api/v1";

  // Fetch leads for export
  const fetchLeads = useCallback(async () => {
    if (!token || !activeSponsorId) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (intentFilter !== "all") {
        params.append("intent_level", intentFilter);
      }
      params.append("limit", "1000"); // Get more leads for export

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

  const handleExport = async () => {
    if (leads.length === 0) {
      toast.error("No leads to export");
      return;
    }

    setIsExporting(true);

    try {
      // Build export data based on selected fields
      const exportData = leads.map((lead) => {
        const row: Record<string, unknown> = {};
        if (selectedFields.name) row.name = lead.user_name || "";
        if (selectedFields.email) row.email = lead.user_email || "";
        if (selectedFields.company) row.company = lead.user_company || "";
        if (selectedFields.title) row.title = lead.user_title || "";
        if (selectedFields.intentScore) row.intent_score = lead.intent_score;
        if (selectedFields.intentLevel) row.intent_level = lead.intent_level;
        if (selectedFields.interactions) row.interaction_count = lead.interaction_count;
        if (selectedFields.contactRequested) row.contact_requested = lead.contact_requested;
        if (selectedFields.followUpStatus) row.follow_up_status = lead.follow_up_status;
        if (selectedFields.tags) row.tags = lead.tags?.join(", ") || "";
        if (selectedFields.firstInteraction) row.first_interaction = lead.first_interaction_at;
        if (selectedFields.lastInteraction) row.last_interaction = lead.last_interaction_at;
        return row;
      });

      let content: string;
      let mimeType: string;
      let extension: string;

      if (exportFormat === "csv") {
        const headers = Object.keys(exportData[0] || {});
        const csvRows = [
          headers.join(","),
          ...exportData.map((row) =>
            headers
              .map((h) => {
                const val = String(row[h] || "");
                return val.includes(",") ? `"${val}"` : val;
              })
              .join(",")
          ),
        ];
        content = csvRows.join("\n");
        mimeType = "text/csv";
        extension = "csv";
      } else if (exportFormat === "json") {
        content = JSON.stringify(exportData, null, 2);
        mimeType = "application/json";
        extension = "json";
      } else {
        // For xlsx, we'd need a library - fallback to CSV for now
        const headers = Object.keys(exportData[0] || {});
        const csvRows = [
          headers.join(","),
          ...exportData.map((row) =>
            headers
              .map((h) => {
                const val = String(row[h] || "");
                return val.includes(",") ? `"${val}"` : val;
              })
              .join(",")
          ),
        ];
        content = csvRows.join("\n");
        mimeType = "text/csv";
        extension = "csv";
        toast.info("Excel export requires additional setup. Downloading as CSV.");
      }

      // Trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-export-${new Date().toISOString().split("T")[0]}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${leads.length} leads successfully`);
    } catch (err) {
      toast.error("Failed to export leads");
    } finally {
      setIsExporting(false);
    }
  };

  const toggleField = (field: keyof typeof selectedFields) => {
    setSelectedFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const selectedCount = Object.values(selectedFields).filter(Boolean).length;

  // Filter leads count for display
  const filteredLeadsCount = leads.length;

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error</h3>
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

  if (!activeSponsorId && !isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Sponsor Selected</h3>
            <p className="text-sm text-muted-foreground max-w-sm text-center">
              Please select a sponsor event to export leads.
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
          <h1 className="text-2xl font-bold">Export Leads</h1>
          <p className="text-muted-foreground">
            {activeSponsorName
              ? `Download lead data for ${activeSponsorName}`
              : "Download your lead data in various formats"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileDown className="h-5 w-5" />
              Export Options
            </CardTitle>
            <CardDescription>
              Choose your export format and filters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      CSV (.csv)
                    </div>
                  </SelectItem>
                  <SelectItem value="xlsx">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel (.xlsx)
                    </div>
                  </SelectItem>
                  <SelectItem value="json">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      JSON (.json)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Filter by Intent</Label>
              <Select value={intentFilter} onValueChange={setIntentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leads</SelectItem>
                  <SelectItem value="hot">Hot Leads Only</SelectItem>
                  <SelectItem value="warm">Warm Leads Only</SelectItem>
                  <SelectItem value="cold">Cold Leads Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Button
                  className="w-full"
                  onClick={handleExport}
                  disabled={isExporting || selectedCount === 0 || filteredLeadsCount === 0}
                >
                  {isExporting ? (
                    <>Exporting...</>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export {filteredLeadsCount} Leads ({selectedCount} Fields)
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Field Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Select Fields
            </CardTitle>
            <CardDescription>
              Choose which fields to include in your export
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(selectedFields).map(([field, checked]) => (
                <div key={field} className="flex items-center space-x-2">
                  <Checkbox
                    id={field}
                    checked={checked}
                    onCheckedChange={() => toggleField(field as keyof typeof selectedFields)}
                  />
                  <Label htmlFor={field} className="text-sm capitalize cursor-pointer">
                    {field.replace(/([A-Z])/g, " $1").trim()}
                  </Label>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t flex justify-between text-sm text-muted-foreground">
              <span>{selectedCount} fields selected</span>
              <button
                className="text-primary hover:underline"
                onClick={() =>
                  setSelectedFields(
                    Object.fromEntries(
                      Object.keys(selectedFields).map((k) => [k, true])
                    ) as typeof selectedFields
                  )
                }
              >
                Select All
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Info */}
      <Card>
        <CardHeader>
          <CardTitle>Export Preview</CardTitle>
          <CardDescription>Summary of your export</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : filteredLeadsCount === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Inbox className="h-8 w-8 mx-auto opacity-50 mb-2" />
              <p className="text-sm font-medium">No leads to export</p>
              <p className="text-xs mt-1">
                {intentFilter !== "all"
                  ? `No ${intentFilter} leads found. Try changing the filter.`
                  : "Capture some leads first to export them."}
              </p>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total leads to export:</span>
                <span className="font-medium">{filteredLeadsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fields included:</span>
                <span className="font-medium">{selectedCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Export format:</span>
                <span className="font-medium">{exportFormat.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Intent filter:</span>
                <span className="font-medium capitalize">{intentFilter}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
