// src/components/features/expo/SponsorDashboard.tsx
"use client";

import { useState } from "react";
import {
  Users,
  Video,
  MessageSquare,
  Download,
  MousePointerClick,
  UserCheck,
  Clock,
  TrendingUp,
  Phone,
  PhoneOff,
  Circle,
  Coffee,
  Loader2,
  Bell,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useExpoStaff } from "@/hooks/use-expo-staff";
import { useAuthStore } from "@/store/auth.store";
import { useMediaQuery } from "@/hooks/use-media-query";
import { BoothChat } from "./BoothChat";
import { BoothVideoCall } from "./BoothVideoCall";
import { StaffPresenceStatus } from "./types";

export interface SponsorDashboardProps {
  boothId: string;
  boothName: string;
  eventId: string;
  className?: string;
}

const STATUS_CONFIG: Record<
  StaffPresenceStatus,
  { icon: React.ReactNode; label: string; color: string }
> = {
  ONLINE: {
    icon: <Circle className="h-3 w-3 fill-green-500 text-green-500" />,
    label: "Online",
    color: "text-green-600",
  },
  AWAY: {
    icon: <Coffee className="h-3 w-3 text-yellow-500" />,
    label: "Away",
    color: "text-yellow-600",
  },
  BUSY: {
    icon: <Phone className="h-3 w-3 text-red-500" />,
    label: "Busy",
    color: "text-red-600",
  },
  OFFLINE: {
    icon: <Circle className="h-3 w-3 text-gray-400" />,
    label: "Offline",
    color: "text-gray-500",
  },
};

export function SponsorDashboard({
  boothId,
  boothName,
  eventId,
  className,
}: SponsorDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const {
    analytics,
    pendingVideoRequests,
    activeVideoSession,
    currentVisitors,
    recentLeads,
    myStatus,
    isConnected,
    isLoading,
    error,
    updateStatus,
    acceptVideoCall,
    declineVideoCall,
    endVideoCall,
    fetchAnalytics,
    clearError,
  } = useExpoStaff({ boothId, eventId });

  // Get user info for video call display name
  const { user } = useAuthStore();
  const staffDisplayName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.email || "Staff";

  // Format duration
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  // Format time ago
  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // Handle accept video
  const handleAcceptVideo = async (sessionId: string) => {
    await acceptVideoCall(sessionId);
  };

  // Handle decline video
  const handleDeclineVideo = async (sessionId: string) => {
    await declineVideoCall(sessionId, "Staff is currently unavailable");
  };

  const statusConfig = STATUS_CONFIG[myStatus];

  // Mobile Metric Card component
  const MobileMetricCard = ({ label, value, icon: Icon }: { label: string; value: number | string; icon?: React.ElementType }) => (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {Icon && <Icon className="h-4 w-4" />}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );

  // Mobile video request banner
  const MobileVideoRequestBanner = () => {
    if (pendingVideoRequests.length === 0) return null;
    const request = pendingVideoRequests[0];
    return (
      <div className="p-3 bg-primary/10 border-b border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Bell className="h-5 w-5 text-primary animate-pulse flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{request.attendeeName}</p>
              <p className="text-xs text-muted-foreground">wants to video call</p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="h-9 w-9 p-0"
              onClick={() => handleDeclineVideo(request.sessionId)}
            >
              <XCircle className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className="h-9"
              onClick={() => handleAcceptVideo(request.sessionId)}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Accept
            </Button>
          </div>
        </div>
        {pendingVideoRequests.length > 1 && (
          <p className="text-xs text-muted-foreground mt-2">
            +{pendingVideoRequests.length - 1} more request{pendingVideoRequests.length > 2 ? 's' : ''}
          </p>
        )}
      </div>
    );
  };

  // Mobile layout
  if (isMobile) {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        {/* Compact header */}
        <header className="flex items-center justify-between p-4 border-b">
          <div className="min-w-0 flex-1">
            <h1 className="font-bold truncate">{boothName}</h1>
            <p className="text-xs text-muted-foreground">Live Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            {!isConnected && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {/* Status toggle - prominent */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 h-9">
                  {statusConfig.icon}
                  <span className={cn("text-sm", statusConfig.color)}>{statusConfig.label}</span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => updateStatus("ONLINE")} className="min-h-[44px]">
                  <Circle className="h-3 w-3 fill-green-500 text-green-500 mr-2" />
                  Online
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus("AWAY")} className="min-h-[44px]">
                  <Coffee className="h-3 w-3 text-yellow-500 mr-2" />
                  Away
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus("BUSY")} className="min-h-[44px]">
                  <Phone className="h-3 w-3 text-red-500 mr-2" />
                  Busy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus("OFFLINE")} className="min-h-[44px]">
                  <Circle className="h-3 w-3 text-gray-400 mr-2" />
                  Offline
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Error alert */}
        {error && (
          <Alert variant="destructive" className="mx-4 mt-2">
            <AlertDescription className="flex items-center justify-between text-sm">
              <span className="truncate">{error}</span>
              <Button variant="ghost" size="sm" onClick={clearError} className="h-8 px-2">
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Video request banner - full width, urgent styling */}
        <MobileVideoRequestBanner />

        {/* Active video call */}
        {activeVideoSession && (
          <div className="p-4 border-b">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Video className="h-4 w-4 text-green-500" />
                  Video Call Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BoothVideoCall
                  session={activeVideoSession}
                  userName={staffDisplayName}
                  isStaff={true}
                  onEnd={endVideoCall}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Key metrics - 2x2 grid with large numbers */}
        <div className="grid grid-cols-2 gap-3 p-4">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Current Visitors</span>
            </div>
            <p className="text-2xl font-bold">{analytics?.currentVisitors ?? 0}</p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Total Visitors</span>
            </div>
            <p className="text-2xl font-bold">{analytics?.totalVisitors ?? 0}</p>
            <p className="text-xs text-muted-foreground">{analytics?.uniqueVisitors ?? 0} unique</p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <UserCheck className="h-4 w-4" />
              <span className="text-xs">Leads Captured</span>
            </div>
            <p className="text-2xl font-bold">{analytics?.totalLeads ?? 0}</p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Avg. Visit Time</span>
            </div>
            <p className="text-2xl font-bold">{formatDuration(analytics?.avgVisitDuration ?? 0)}</p>
          </div>
        </div>

        {/* Tabs for Overview/Chat/Leads/Visitors - full screen when active */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-4 h-12 grid grid-cols-4">
            <TabsTrigger value="overview" className="h-10 text-xs">
              Overview
            </TabsTrigger>
            <TabsTrigger value="chat" className="h-10 text-xs">
              <MessageSquare className="h-4 w-4 mr-1" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="leads" className="h-10 text-xs">
              Leads
              {recentLeads.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs h-5 px-1">
                  {recentLeads.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="visitors" className="h-10 text-xs">
              Visitors
            </TabsTrigger>
          </TabsList>

          {/* Tab content - flex-1 to fill remaining space */}
          <TabsContent value="overview" className="flex-1 min-h-0 m-0 p-4 pb-6 overflow-auto">
            <div className="space-y-4 pb-4">
              {/* Engagement metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border bg-card text-center">
                  <MessageSquare className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                  <p className="text-xl font-bold">{analytics?.totalChatMessages ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Chats</p>
                </div>
                <div className="p-3 rounded-lg border bg-card text-center">
                  <Video className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                  <p className="text-xl font-bold">{analytics?.completedVideoSessions ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Videos</p>
                </div>
                <div className="p-3 rounded-lg border bg-card text-center">
                  <Download className="h-5 w-5 mx-auto mb-1 text-green-500" />
                  <p className="text-xl font-bold">{analytics?.totalDownloads ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Downloads</p>
                </div>
                <div className="p-3 rounded-lg border bg-card text-center">
                  <MousePointerClick className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                  <p className="text-xl font-bold">{analytics?.totalCtaClicks ?? 0}</p>
                  <p className="text-xs text-muted-foreground">CTA Clicks</p>
                </div>
              </div>

              {/* Peak Visitors - only metric not in top grid */}
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Peak Visitors</span>
                </div>
                <p className="text-2xl font-bold">{analytics?.peakVisitors ?? 0}</p>
                <p className="text-xs text-muted-foreground">Maximum concurrent visitors</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="flex-1 min-h-0 m-0 mt-2">
            <BoothChat boothId={boothId} eventId={eventId} className="h-full" />
          </TabsContent>

          <TabsContent value="leads" className="flex-1 min-h-0 m-0 p-4 pb-6 overflow-auto">
            {recentLeads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No leads captured yet</p>
              </div>
            ) : (
              <div className="space-y-3 pb-4">
                {recentLeads.map((lead, index) => (
                  <div key={index} className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{lead.visitorName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(lead.capturedAt)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      {(lead.formData as any).email && <p>Email: {String((lead.formData as any).email)}</p>}
                      {(lead.formData as any).company && <p>Company: {String((lead.formData as any).company)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="visitors" className="flex-1 min-h-0 m-0 p-4 pb-6 overflow-auto">
            {currentVisitors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No visitors currently in booth</p>
              </div>
            ) : (
              <div className="space-y-2 pb-4">
                {currentVisitors.map((visitor) => (
                  <div
                    key={visitor.visitId}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {visitor.visitorName?.charAt(0) || "?"}
                      </div>
                      <span className="font-medium text-sm">{visitor.visitorName}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(visitor.enteredAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Desktop layout (existing)
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-xl font-bold">{boothName}</h1>
          <p className="text-sm text-muted-foreground">Sponsor Dashboard</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection status */}
          {!isConnected && (
            <Badge variant="secondary" className="gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Connecting...
            </Badge>
          )}

          {/* Status dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                {statusConfig.icon}
                <span className={statusConfig.color}>{statusConfig.label}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => updateStatus("ONLINE")}>
                <Circle className="h-3 w-3 fill-green-500 text-green-500 mr-2" />
                Online
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateStatus("AWAY")}>
                <Coffee className="h-3 w-3 text-yellow-500 mr-2" />
                Away
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateStatus("BUSY")}>
                <Phone className="h-3 w-3 text-red-500 mr-2" />
                Busy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateStatus("OFFLINE")}>
                <Circle className="h-3 w-3 text-gray-400 mr-2" />
                Offline
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Refresh button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchAnalytics}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Video call requests notification */}
      {pendingVideoRequests.length > 0 && (
        <div className="mx-4 mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-5 w-5 text-primary animate-pulse" />
            <span className="font-semibold">
              {pendingVideoRequests.length} Video Call Request
              {pendingVideoRequests.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-2">
            {pendingVideoRequests.slice(0, 3).map((request) => (
              <div
                key={request.sessionId}
                className="flex items-center justify-between p-2 bg-background rounded-lg"
              >
                <div>
                  <p className="font-medium">{request.attendeeName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTimeAgo(request.requestedAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeclineVideo(request.sessionId)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAcceptVideo(request.sessionId)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active video call */}
      {activeVideoSession && (
        <div className="m-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Video className="h-5 w-5 text-green-500" />
                Active Video Call
              </CardTitle>
              <CardDescription>
                With {activeVideoSession.attendeeName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BoothVideoCall
                session={activeVideoSession}
                userName={staffDisplayName}
                isStaff={true}
                onEnd={endVideoCall}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col min-h-0"
      >
        <TabsList className="mx-4 mt-4 flex-shrink-0">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chat">
            Chat
            <MessageSquare className="h-3 w-3 ml-1" />
          </TabsTrigger>
          <TabsTrigger value="leads">
            Leads
            {recentLeads.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {recentLeads.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="visitors">Visitors</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 min-h-0">
          {/* Overview Tab */}
          <TabsContent value="overview" className="p-4 pb-8 space-y-4 mt-0">
            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Current Visitors
                    </span>
                  </div>
                  <p className="text-2xl font-bold mt-1">
                    {analytics?.currentVisitors ?? 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Total Visitors
                    </span>
                  </div>
                  <p className="text-2xl font-bold mt-1">
                    {analytics?.totalVisitors ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.uniqueVisitors ?? 0} unique
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Leads Captured
                    </span>
                  </div>
                  <p className="text-2xl font-bold mt-1">
                    {analytics?.totalLeads ?? 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Avg. Visit Time
                    </span>
                  </div>
                  <p className="text-2xl font-bold mt-1">
                    {formatDuration(analytics?.avgVisitDuration ?? 0)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Engagement metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <MessageSquare className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold">
                      {analytics?.totalChatMessages ?? 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Chat Messages</p>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Video className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                    <p className="text-2xl font-bold">
                      {analytics?.completedVideoSessions ?? 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Video Calls</p>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Download className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold">
                      {analytics?.totalDownloads ?? 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Downloads</p>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <MousePointerClick className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                    <p className="text-2xl font-bold">
                      {analytics?.totalCtaClicks ?? 0}
                    </p>
                    <p className="text-sm text-muted-foreground">CTA Clicks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Peak Visitors - only metric not in top grid */}
            <Card className="border-2 border-primary">
              <CardHeader className="bg-primary/5">
                <CardTitle className="text-lg">Peak Visitors</CardTitle>
                <CardDescription>Highest number of simultaneous visitors</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-4 rounded-full bg-primary/10">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-4xl font-bold">{analytics?.peakVisitors ?? 0}</p>
                    <p className="text-sm text-muted-foreground mt-1">Maximum concurrent visitors</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="mt-0 h-[500px]">
            <BoothChat boothId={boothId} eventId={eventId} />
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="p-4 mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Leads</CardTitle>
                <CardDescription>
                  Contact information captured from booth visitors
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentLeads.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No leads captured yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentLeads.map((lead, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg border bg-card"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{lead.visitorName}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(lead.capturedAt)}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {lead.formData.email ? (
                            <p>Email: {String(lead.formData.email)}</p>
                          ) : null}
                          {lead.formData.company ? (
                            <p>Company: {String(lead.formData.company)}</p>
                          ) : null}
                          {lead.formData.interests ? (
                            <p>Interests: {String(lead.formData.interests)}</p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visitors Tab */}
          <TabsContent value="visitors" className="p-4 mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Visitors</CardTitle>
                <CardDescription>
                  People currently viewing your booth
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentVisitors.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No visitors currently in booth
                  </p>
                ) : (
                  <div className="space-y-2">
                    {currentVisitors.map((visitor) => (
                      <div
                        key={visitor.visitId}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                            {visitor.visitorName?.charAt(0) || "?"}
                          </div>
                          <span className="font-medium">{visitor.visitorName}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatTimeAgo(visitor.enteredAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
