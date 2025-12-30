// src/app/(platform)/dashboard/events/[eventId]/analytics/_components/scheduled-reports.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Clock, Mail, MoreVertical, Pause, Play, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { validateEmailList } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface ScheduledReport {
  id: string;
  name: string;
  frequency: "daily" | "weekly" | "monthly";
  format: "csv" | "excel" | "pdf";
  recipients: string[];
  sections: string[];
  nextRun: string;
  isActive: boolean;
  createdAt: string;
}

interface ScheduledReportsProps {
  eventId: string;
}

export function ScheduledReports({ eventId }: ScheduledReportsProps) {
  const [reports, setReports] = useState<ScheduledReport[]>([
    {
      id: "1",
      name: "Weekly Revenue Report",
      frequency: "weekly",
      format: "pdf",
      recipients: ["organizer@event.com"],
      sections: ["revenue", "offers", "ads"],
      nextRun: "2025-01-06",
      isActive: true,
      createdAt: "2024-12-01",
    },
    {
      id: "2",
      name: "Daily Performance Metrics",
      frequency: "daily",
      format: "excel",
      recipients: ["analytics@event.com", "manager@event.com"],
      sections: ["offers", "funnel"],
      nextRun: "2025-01-01",
      isActive: true,
      createdAt: "2024-11-15",
    },
    {
      id: "3",
      name: "Monthly Summary",
      frequency: "monthly",
      format: "pdf",
      recipients: ["team@event.com"],
      sections: ["revenue", "offers", "ads", "waitlist", "funnel", "abtests"],
      nextRun: "2025-02-01",
      isActive: false,
      createdAt: "2024-10-20",
    },
  ]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    name: "",
    frequency: "weekly" as const,
    format: "pdf" as const,
    recipients: "",
  });
  const [emailValidationError, setEmailValidationError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<ScheduledReport | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = async () => {
    // Validate email recipients
    const validation = validateEmailList(newReport.recipients);

    if (!validation.valid) {
      const errorMsg = validation.invalid.length > 0
        ? `Invalid email addresses: ${validation.invalid.join(', ')}`
        : "Please enter at least one email address";
      setEmailValidationError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setCreating(true);

    try {
      // Simulate API call - replace with actual mutation when backend is ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      const report: ScheduledReport = {
        id: Date.now().toString(),
        name: newReport.name,
        frequency: newReport.frequency,
        format: newReport.format,
        recipients: validation.emails,
        sections: ["revenue", "offers"],
        nextRun: getNextRunDate(newReport.frequency),
        isActive: true,
        createdAt: new Date().toISOString().split("T")[0],
      };

      setReports([...reports, report]);
      toast.success("Scheduled report created successfully");
      setCreateDialogOpen(false);
      setNewReport({ name: "", frequency: "weekly", format: "pdf", recipients: "" });
      setEmailValidationError(null);
    } catch (error) {
      toast.error("Failed to create scheduled report");
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = (id: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const handleDeleteClick = (report: ScheduledReport) => {
    setReportToDelete(report);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reportToDelete) return;

    setDeleting(true);

    try {
      // Simulate API call - replace with actual mutation when backend is ready
      await new Promise(resolve => setTimeout(resolve, 500));

      setReports((prev) => prev.filter((r) => r.id !== reportToDelete.id));
      toast.success("Scheduled report deleted");
      setReportToDelete(null);
      setDeleteConfirmOpen(false);
    } catch (error) {
      toast.error("Failed to delete scheduled report");
    } finally {
      setDeleting(false);
    }
  };

  const getNextRunDate = (frequency: "daily" | "weekly" | "monthly"): string => {
    const now = new Date();
    switch (frequency) {
      case "daily":
        now.setDate(now.getDate() + 1);
        break;
      case "weekly":
        now.setDate(now.getDate() + 7);
        break;
      case "monthly":
        now.setMonth(now.getMonth() + 1);
        break;
    }
    return now.toISOString().split("T")[0];
  };

  const getFrequencyBadge = (frequency: string) => {
    const colors = {
      daily: "bg-blue-500",
      weekly: "bg-purple-500",
      monthly: "bg-green-500",
    };
    return (
      <Badge className={colors[frequency as keyof typeof colors]}>
        {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Scheduled Reports</CardTitle>
            <CardDescription>
              Automatically send analytics reports to your team on a recurring schedule
            </CardDescription>
          </div>
          <Dialog
            open={createDialogOpen}
            onOpenChange={(open) => {
              setCreateDialogOpen(open);
              if (!open) {
                setEmailValidationError(null);
                setNewReport({ name: "", frequency: "weekly", format: "pdf", recipients: "" });
              }
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Schedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Scheduled Report</DialogTitle>
                <DialogDescription>
                  Set up automatic report delivery on a recurring schedule
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Report Name</Label>
                  <Input
                    id="name"
                    value={newReport.name}
                    onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                    placeholder="e.g., Weekly Revenue Report"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={newReport.frequency}
                    onValueChange={(value: any) => setNewReport({ ...newReport, frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly (every Monday)</SelectItem>
                      <SelectItem value="monthly">Monthly (1st of month)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="format">Export Format</Label>
                  <Select
                    value={newReport.format}
                    onValueChange={(value: any) => setNewReport({ ...newReport, format: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="excel">Excel (XLSX)</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipients">Recipients (comma-separated emails)</Label>
                  <Input
                    id="recipients"
                    type="email"
                    value={newReport.recipients}
                    onChange={(e) => {
                      setNewReport({ ...newReport, recipients: e.target.value });
                      setEmailValidationError(null);
                    }}
                    placeholder="email1@example.com, email2@example.com"
                    className={cn(emailValidationError && "border-red-500 focus-visible:ring-red-500")}
                  />
                  {emailValidationError && (
                    <p className="text-sm text-red-500">{emailValidationError}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!newReport.name || !newReport.recipients || creating}
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Schedule"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No scheduled reports yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first scheduled report to automate analytics delivery
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.name}</TableCell>
                  <TableCell>{getFrequencyBadge(report.frequency)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.format.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{report.recipients.length}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {report.nextRun}
                    </div>
                  </TableCell>
                  <TableCell>
                    {report.isActive ? (
                      <Badge className="bg-green-500">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Paused</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toggleActive(report.id)}>
                          {report.isActive ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Resume
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(report)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          if (!deleting) {
            setDeleteConfirmOpen(open);
          }
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Scheduled Report?"
        description={`Are you sure you want to delete "${reportToDelete?.name}"? This action cannot be undone and the scheduled report will be permanently removed.`}
        confirmText={deleting ? "Deleting..." : "Delete"}
        variant="destructive"
      />
    </Card>
  );
}
