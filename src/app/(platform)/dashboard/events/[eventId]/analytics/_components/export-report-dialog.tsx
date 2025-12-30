// src/app/(platform)/dashboard/events/[eventId]/analytics/_components/export-report-dialog.tsx
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileSpreadsheet, FileText, File, Loader2 } from "lucide-react";
import { useExportAnalytics } from "@/hooks/use-export-analytics";
import { toast } from "sonner";
import type { MonetizationAnalytics } from "@/types/analytics";

interface ExportReportDialogProps {
  eventId: string;
  dateRange: { from: string; to: string };
  trigger?: React.ReactNode;
  analyticsData?: MonetizationAnalytics;
}

type ExportFormat = "csv" | "excel" | "pdf";

interface ExportSection {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export function ExportReportDialog({ eventId, dateRange, trigger, analyticsData }: ExportReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("Monetization Analytics Report");
  const [format, setFormat] = useState<ExportFormat>("pdf");

  const { exportData, exporting, error: exportError } = useExportAnalytics(analyticsData);

  const [sections, setSections] = useState<ExportSection[]>([
    {
      id: "revenue",
      label: "Revenue Overview",
      description: "Total revenue, revenue by source, and daily trends",
      enabled: true,
    },
    {
      id: "offers",
      label: "Offer Performance",
      description: "Offer views, purchases, conversion rates, and top performers",
      enabled: true,
    },
    {
      id: "ads",
      label: "Ad Campaign Analytics",
      description: "Impressions, clicks, CTR, and ad performance metrics",
      enabled: true,
    },
    {
      id: "waitlist",
      label: "Waitlist Metrics",
      description: "Joins, offers, acceptance rates, and wait times",
      enabled: false,
    },
    {
      id: "funnel",
      label: "Conversion Funnel",
      description: "User journey from views to purchases with drop-off rates",
      enabled: false,
    },
    {
      id: "abtests",
      label: "A/B Test Results",
      description: "Active tests, variants, and statistical significance",
      enabled: false,
    },
  ]);

  const toggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, enabled: !section.enabled } : section
      )
    );
  };

  const handleExport = async () => {
    const enabledSections = sections.filter((s) => s.enabled).map((s) => s.id);

    if (enabledSections.length === 0) {
      toast.error("Please select at least one section to export");
      return;
    }

    const result = await exportData({
      format,
      title: reportTitle,
      sections: enabledSections,
      dateRange,
    });

    if (result.success) {
      toast.success(`Report exported successfully as ${format.toUpperCase()}`);
      setOpen(false);
    } else {
      toast.error(`Failed to export report: ${result.error || "Unknown error"}`);
    }
  };

  const getFormatIcon = (fmt: ExportFormat) => {
    switch (fmt) {
      case "csv":
        return <FileText className="h-4 w-4" />;
      case "excel":
        return <FileSpreadsheet className="h-4 w-4" />;
      case "pdf":
        return <File className="h-4 w-4" />;
    }
  };

  const selectedCount = sections.filter((s) => s.enabled).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Analytics Report</DialogTitle>
          <DialogDescription>
            Generate a comprehensive analytics report for the selected date range ({dateRange.from} to{" "}
            {dateRange.to})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Report Title */}
          <div className="space-y-2">
            <Label htmlFor="report-title">Report Title</Label>
            <Input
              id="report-title"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder="Enter report title"
            />
          </div>

          {/* Export Format */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant={format === "csv" ? "default" : "outline"}
                className="flex flex-col h-auto py-4"
                onClick={() => setFormat("csv")}
              >
                <FileText className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">CSV</span>
                <span className="text-xs text-muted-foreground">Spreadsheet data</span>
              </Button>
              <Button
                type="button"
                variant={format === "excel" ? "default" : "outline"}
                className="flex flex-col h-auto py-4"
                onClick={() => setFormat("excel")}
              >
                <FileSpreadsheet className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">Excel</span>
                <span className="text-xs text-muted-foreground">XLSX with charts</span>
              </Button>
              <Button
                type="button"
                variant={format === "pdf" ? "default" : "outline"}
                className="flex flex-col h-auto py-4"
                onClick={() => setFormat("pdf")}
              >
                <File className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">PDF</span>
                <span className="text-xs text-muted-foreground">Print-ready report</span>
              </Button>
            </div>
          </div>

          {/* Sections to Include */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Sections to Include</Label>
              <Badge variant="secondary">
                {selectedCount} of {sections.length} selected
              </Badge>
            </div>
            <div className="space-y-3 border rounded-lg p-4">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={section.id}
                    checked={section.enabled}
                    onCheckedChange={() => toggleSection(section.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor={section.id}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {section.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{section.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Info */}
          <div className="p-4 bg-muted/50 rounded-lg border">
            <h4 className="text-sm font-semibold mb-2">Export Summary</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Format: {format.toUpperCase()}</p>
              <p>Date Range: {dateRange.from} to {dateRange.to}</p>
              <p>Sections: {selectedCount > 0 ? sections.filter((s) => s.enabled).map((s) => s.label).join(", ") : "None selected"}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={exporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting || selectedCount === 0}>
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                {getFormatIcon(format)}
                <span className="ml-2">Export {format.toUpperCase()}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
