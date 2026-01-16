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
import { toast } from "sonner";

export default function ExportPage() {
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

  const handleExport = async () => {
    setIsExporting(true);
    // Simulate export
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsExporting(false);
    toast.success("Your leads have been exported successfully.");
  };

  const toggleField = (field: keyof typeof selectedFields) => {
    setSelectedFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const selectedCount = Object.values(selectedFields).filter(Boolean).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Export Leads</h1>
        <p className="text-muted-foreground">
          Download your lead data in various formats
        </p>
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
              <Button
                className="w-full"
                onClick={handleExport}
                disabled={isExporting || selectedCount === 0}
              >
                {isExporting ? (
                  <>Exporting...</>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export {selectedCount} Fields
                  </>
                )}
              </Button>
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

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Exports</CardTitle>
          <CardDescription>Your export history from this event</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: "Jan 15, 2024", format: "CSV", records: 127, status: "completed" },
              { date: "Jan 14, 2024", format: "Excel", records: 98, status: "completed" },
              { date: "Jan 12, 2024", format: "CSV", records: 45, status: "completed" },
            ].map((export_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{export_.format} Export</p>
                    <p className="text-sm text-muted-foreground">
                      {export_.date} • {export_.records} records
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
