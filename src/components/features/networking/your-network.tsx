// src/components/features/networking/your-network.tsx
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Loader } from "@/components/ui/loader";
import {
  Connection,
  ConnectionStrength,
  StrengthDistribution,
  getOtherUser,
  formatUserName,
  getUserInitials,
  getStrengthLabel,
  getStrengthColor,
  getStrengthBgColor,
  getConnectionTypeLabel,
  getActivityLabel,
  formatTimeAgo,
} from "@/types/connection";
import {
  Users,
  Search,
  Filter,
  TrendingUp,
  MessageSquare,
  Calendar,
  ExternalLink,
  Mail,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface YourNetworkProps {
  connections: Connection[];
  strengthDistribution: StrengthDistribution;
  currentUserId: string;
  onSendMessage: (connectionId: string) => void;
  onScheduleMeeting: (connectionId: string) => void;
  onSendFollowUp: (connectionId: string) => void;
  onViewProfile: (userId: string) => void;
  isLoading?: boolean;
}

type SortOption = "recent" | "strength" | "name" | "interactions";
type FilterStrength = "all" | ConnectionStrength;

export function YourNetwork({
  connections,
  strengthDistribution,
  currentUserId,
  onSendMessage,
  onScheduleMeeting,
  onSendFollowUp,
  onViewProfile,
  isLoading = false,
}: YourNetworkProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [filterStrength, setFilterStrength] = useState<FilterStrength>("all");
  const [activeTab, setActiveTab] = useState("all");

  const totalConnections =
    strengthDistribution.WEAK +
    strengthDistribution.MODERATE +
    strengthDistribution.STRONG;

  const filteredConnections = useMemo(() => {
    let result = [...connections];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((conn) => {
        const otherUser = getOtherUser(conn, currentUserId);
        const name = formatUserName(otherUser).toLowerCase();
        const email = otherUser.email.toLowerCase();
        return name.includes(query) || email.includes(query);
      });
    }

    // Strength filter
    if (filterStrength !== "all") {
      result = result.filter((conn) => conn.strength === filterStrength);
    }

    // Tab filter
    if (activeTab === "pending") {
      result = result.filter((conn) => !conn.followUpSentAt);
    } else if (activeTab === "strong") {
      result = result.filter((conn) => conn.strength === "STRONG");
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return (
            new Date(b.lastInteractionAt || b.connectedAt).getTime() -
            new Date(a.lastInteractionAt || a.connectedAt).getTime()
          );
        case "strength": {
          const strengthOrder = { STRONG: 3, MODERATE: 2, WEAK: 1 };
          return strengthOrder[b.strength] - strengthOrder[a.strength];
        }
        case "name": {
          const nameA = formatUserName(getOtherUser(a, currentUserId));
          const nameB = formatUserName(getOtherUser(b, currentUserId));
          return nameA.localeCompare(nameB);
        }
        case "interactions":
          return b.interactionCount - a.interactionCount;
        default:
          return 0;
      }
    });

    return result;
  }, [connections, searchQuery, filterStrength, sortBy, activeTab, currentUserId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalConnections}</p>
                <p className="text-sm text-muted-foreground">
                  Total Connections
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {strengthDistribution.STRONG}
                </p>
                <p className="text-sm text-muted-foreground">
                  Strong Connections
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {strengthDistribution.MODERATE}
                </p>
                <p className="text-sm text-muted-foreground">Growing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Mail className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {connections.filter((c) => !c.followUpSentAt).length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Pending Follow-ups
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strength Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Connection Strength Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm w-24 text-green-600">Strong</span>
              <Progress
                value={
                  totalConnections > 0
                    ? (strengthDistribution.STRONG / totalConnections) * 100
                    : 0
                }
                className="flex-1 h-2"
              />
              <span className="text-sm text-muted-foreground w-10 text-right">
                {strengthDistribution.STRONG}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm w-24 text-yellow-600">Growing</span>
              <Progress
                value={
                  totalConnections > 0
                    ? (strengthDistribution.MODERATE / totalConnections) * 100
                    : 0
                }
                className="flex-1 h-2"
              />
              <span className="text-sm text-muted-foreground w-10 text-right">
                {strengthDistribution.MODERATE}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm w-24 text-gray-500">New</span>
              <Progress
                value={
                  totalConnections > 0
                    ? (strengthDistribution.WEAK / totalConnections) * 100
                    : 0
                }
                className="flex-1 h-2"
              />
              <span className="text-sm text-muted-foreground w-10 text-right">
                {strengthDistribution.WEAK}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connections List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Your Connections</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[180px] md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search connections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={filterStrength}
                onValueChange={(v) => setFilterStrength(v as FilterStrength)}
              >
                <SelectTrigger className="w-[120px] sm:w-[130px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="STRONG">Strong</SelectItem>
                  <SelectItem value="MODERATE">Growing</SelectItem>
                  <SelectItem value="WEAK">New</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sortBy}
                onValueChange={(v) => setSortBy(v as SortOption)}
              >
                <SelectTrigger className="w-[120px] sm:w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="interactions">Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                All ({connections.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({connections.filter((c) => !c.followUpSentAt).length})
              </TabsTrigger>
              <TabsTrigger value="strong">
                Strong ({strengthDistribution.STRONG})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {filteredConnections.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No connections found matching your criteria.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredConnections.map((connection) => (
                    <ConnectionCard
                      key={connection.id}
                      connection={connection}
                      currentUserId={currentUserId}
                      onSendMessage={() => onSendMessage(connection.id)}
                      onScheduleMeeting={() => onScheduleMeeting(connection.id)}
                      onSendFollowUp={() => onSendFollowUp(connection.id)}
                      onViewProfile={() =>
                        onViewProfile(
                          getOtherUser(connection, currentUserId).id
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface ConnectionCardProps {
  connection: Connection;
  currentUserId: string;
  onSendMessage: () => void;
  onScheduleMeeting: () => void;
  onSendFollowUp: () => void;
  onViewProfile: () => void;
}

function ConnectionCard({
  connection,
  currentUserId,
  onSendMessage,
  onScheduleMeeting,
  onSendFollowUp,
  onViewProfile,
}: ConnectionCardProps) {
  const otherUser = getOtherUser(connection, currentUserId);
  const lastActivity = connection.activities?.[0];

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-4">
        <Avatar
          className="h-12 w-12 cursor-pointer"
          onClick={onViewProfile}
        >
          <AvatarImage src={otherUser.avatarUrl || undefined} />
          <AvatarFallback>{getUserInitials(otherUser)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <p
              className="font-medium cursor-pointer hover:underline"
              onClick={onViewProfile}
            >
              {formatUserName(otherUser)}
            </p>
            <Badge
              variant="outline"
              className={`${getStrengthBgColor(connection.strength)} ${getStrengthColor(connection.strength)} text-xs`}
            >
              {getStrengthLabel(connection.strength)}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            <span>{getConnectionTypeLabel(connection.connectionType)}</span>
            <span>•</span>
            <span>
              {formatTimeAgo(
                connection.lastInteractionAt || connection.connectedAt
              )}
            </span>
            {connection.interactionCount > 1 && (
              <>
                <span>•</span>
                <span>{connection.interactionCount} interactions</span>
              </>
            )}
          </div>
          {lastActivity && (
            <p className="text-xs text-muted-foreground mt-1">
              Last: {getActivityLabel(lastActivity.activityType)}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!connection.followUpSentAt && (
          <Button variant="outline" size="sm" onClick={onSendFollowUp}>
            <Mail className="h-4 w-4 mr-1" />
            Follow-up
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onSendMessage}>
          <MessageSquare className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onViewProfile}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onScheduleMeeting}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Meeting
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSendMessage}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default YourNetwork;
