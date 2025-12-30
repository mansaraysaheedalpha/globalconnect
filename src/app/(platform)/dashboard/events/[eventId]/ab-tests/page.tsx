// src/app/(platform)/dashboard/events/[eventId]/ab-tests/page.tsx
"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Beaker,
  Plus,
  Play,
  Pause,
  BarChart3,
  Trophy,
  Users,
  TrendingUp
} from "lucide-react";
import { ABTestList } from "./_components/ab-test-list";
import { ABTestResults } from "./_components/ab-test-results";
import { CreateABTestDialog } from "./_components/create-ab-test-dialog";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function ABTestsPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-4 md:p-6 max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Beaker className="h-8 w-8 text-primary" />
            A/B Testing
          </h1>
          <p className="text-muted-foreground mt-2">
            Experiment with different offer prices, ad creatives, and messaging to optimize conversions.
          </p>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Test
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
            <Play className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tests</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">With conclusive results</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground mt-1">Across all tests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Lift</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+18.5%</div>
            <p className="text-xs text-muted-foreground mt-1">Winning variants</p>
          </CardContent>
        </Card>
      </div>

      {/* Test Management Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Tests</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <ABTestList
            eventId={eventId}
            status="ACTIVE"
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <ABTestList
            eventId={eventId}
            status="COMPLETED"
          />
        </TabsContent>

        <TabsContent value="drafts" className="mt-6">
          <ABTestList
            eventId={eventId}
            status="DRAFT"
          />
        </TabsContent>
      </Tabs>

      {/* Create Test Dialog */}
      <CreateABTestDialog
        eventId={eventId}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
      </div>
    </ErrorBoundary>
  );
}
