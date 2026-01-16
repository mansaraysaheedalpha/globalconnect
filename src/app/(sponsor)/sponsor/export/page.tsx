// src/app/(sponsor)/sponsor/export/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ExportPage() {
  const { toast } = useToast();
  const [exportFormat, setExportFormat] = useState("csv");
  const [intentFilter, setIntentFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFields, setSelectedFields] = useState({
    name: true,
    email: true,
    company: true,
    title: true,
    intentLevel: true,
    intentScore: true,
    interactions: true,
    notes: true,
    capturedAt: true,
    followUpStatus: true,
  });

  const handleExport = async () => {
    setIsExporting(true);
    // Simulate export
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsExporting(false);
    toast({
      title: "Export complete",
      description: "Your leads have been exported successfully.",
    });
  };

  const toggleField = (field: keyof typeof selectedFields) => {
    setSelectedFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const fieldLabels: Record<keyof typeof selectedFields, string> = {
    name: "Full Name",
    email: "Email Address",
    company: "Company",
    title: "Job Title",
    intentLevel: "Intent Level",
    intentScore: "Intent Score",
    interactions: "Interaction History",
    notes: "Notes",
    capturedAt: "Capture Date/Time",
    followUpStatus: "Follow-up Status",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Export Leads</h1>
        <p className="text-muted-foreground">
          Download your captured leads for use in your CRM or other tools
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Export Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Format Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Export Format</CardTitle>
              <CardDescription>
                Choose the file format for your export
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    exportFormat === "csv"
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50"
                  }`}
                  onClick={() => setExportFormat("csv")}
                >
                  <FileSpreadsheet className="h-8 w-8 mb-2 text-green-600" />
                  <p className="font-medium">CSV</p>
                  <p className="text-xs text-muted-foreground">
                    Compatible with Excel, Google Sheets
                  </p>
                </div>
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    exportFormat === "xlsx"
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50"
                  }`}
                  onClick={() => setExportFormat("xlsx")}
                >
                  <FileSpreadsheet className="h-8 w-8 mb-2 text-blue-600" />
                  <p className="font-medium">Excel</p>
                  <p className="text-xs text-muted-foreground">
                    Native Excel format (.xlsx)
                  </p>
                </div>
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    exportFormat === "json"
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50"
                  }`}
                  onClick={() => setExportFormat("json")}
                >
                  <FileText className="h-8 w-8 mb-2 text-orange-600" />
                  <p className="font-medium">JSON</p>
                  <p className="text-xs text-muted-foreground">
                    For developers and APIs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Field Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Fields</CardTitle>
              <CardDescription>
                Choose which fields to include in your export
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {Object.entries(fieldLabels).map(([field, label]) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      id={field}
                      checked={selectedFields[field as keyof typeof selectedFields]}
                      onCheckedChange={() =>
                        toggleField(field as keyof typeof selectedFields)
                      }
                    />
                    <Label
                      htmlFor={field}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filter Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
              <CardDescription>
                Filter which leads to include in the export
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Intent Level</Label>
                <Select value={intentFilter} onValueChange={setIntentFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Leads</SelectItem>
                    <SelectItem value="hot">Hot Leads Only</SelectItem>
                    <SelectItem value="warm">Warm Leads Only</SelectItem>
                    <SelectItem value="cold">Cold Leads Only</SelectItem>
                    <SelectItem value="hot-warm">Hot & Warm Leads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary & Export */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Leads</span>
                <span className="font-medium">147</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">After Filters</span>
                <span className="font-medium">
                  {intentFilter === "all"
                    ? "147"
                    : intentFilter === "hot"
                    ? "23"
                    : intentFilter === "warm"
                    ? "58"
                    : intentFilter === "cold"
                    ? "66"
                    : "81"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fields Selected</span>
                <span className="font-medium">
                  {Object.values(selectedFields).filter(Boolean).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Format</span>
                <span className="font-medium uppercase">{exportFormat}</span>
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full"
            size="lg"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Download className="mr-2 h-4 w-4 animate-bounce" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Export Leads
              </>
            )}
          </Button>

          {/* Recent Exports */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Exports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>leads_2024-01-15.csv</span>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>leads_2024-01-14.xlsx</span>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
