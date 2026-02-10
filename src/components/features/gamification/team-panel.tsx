// Team management panel for attendees to create, join, and leave teams
"use client";

import { useState } from "react";
import { useTeams, Team } from "@/hooks/use-teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  Plus,
  LogOut,
  Crown,
  Loader2,
  AlertCircle,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

interface TeamPanelProps {
  sessionId: string;
}

export const TeamPanel = ({ sessionId }: TeamPanelProps) => {
  const {
    teams,
    currentTeam,
    isInTeam,
    isLoading,
    isConnected,
    error,
    currentUserId,
    createTeam,
    joinTeam,
    leaveTeam,
    clearError,
  } = useTeams({ sessionId });

  const [teamName, setTeamName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return;
    const result = await createTeam(teamName.trim());
    if (result.success) {
      toast.success(`Team "${teamName.trim()}" created!`);
      setTeamName("");
      setIsCreating(false);
    } else {
      toast.error(result.error || "Failed to create team");
    }
  };

  const handleJoinTeam = async (teamId: string, teamNameStr: string) => {
    const result = await joinTeam(teamId);
    if (result.success) {
      toast.success(`Joined team "${teamNameStr}"`);
    } else {
      toast.error(result.error || "Failed to join team");
    }
  };

  const handleLeaveTeam = async () => {
    if (!currentTeam) return;
    const name = currentTeam.name;
    const result = await leaveTeam();
    if (result.success) {
      toast.success(`Left team "${name}"`);
    } else {
      toast.error(result.error || "Failed to leave team");
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 p-4 text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Connecting...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 text-red-600 bg-red-50 dark:bg-red-950/20 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <Button variant="ghost" size="sm" onClick={clearError} className="h-6 px-2 text-xs">
            Dismiss
          </Button>
        </div>
      )}

      {/* Current Team */}
      {isInTeam && currentTeam && (
        <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-900 dark:text-green-100">
                {currentTeam.name}
              </span>
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                Your Team
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLeaveTeam}
              disabled={isLoading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 gap-1"
            >
              <LogOut className="h-4 w-4" />
              Leave
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentTeam.members.map((member) => (
              <div
                key={member.userId}
                className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-gray-800 rounded-full text-sm border"
              >
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[10px]">
                    {member.user?.firstName?.charAt(0) || "?"}
                    {member.user?.lastName?.charAt(0) || ""}
                  </AvatarFallback>
                </Avatar>
                <span>
                  {member.user
                    ? `${member.user.firstName} ${member.user.lastName}`
                    : "Member"}
                </span>
                {member.userId === currentTeam.creatorId && (
                  <Crown className="h-3 w-3 text-yellow-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Team */}
      {!isInTeam && (
        <div className="space-y-3">
          {isCreating ? (
            <div className="flex gap-2">
              <Input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name..."
                maxLength={100}
                onKeyDown={(e) => e.key === "Enter" && handleCreateTeam()}
                autoFocus
              />
              <Button
                onClick={handleCreateTeam}
                disabled={!teamName.trim() || isLoading}
                size="sm"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setIsCreating(false); setTeamName(""); }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsCreating(true)}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Create a Team
            </Button>
          )}
        </div>
      )}

      {/* Available Teams to Join */}
      {!isInTeam && teams.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Available Teams ({teams.length})
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {teams.map((team) => (
              <TeamRow
                key={team.id}
                team={team}
                onJoin={handleJoinTeam}
                isLoading={isLoading}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isInTeam && teams.length === 0 && !isCreating && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No teams yet. Be the first to create one!
        </p>
      )}
    </div>
  );
};

const TeamRow = ({
  team,
  onJoin,
  isLoading,
  currentUserId,
}: {
  team: Team;
  onJoin: (teamId: string, name: string) => void;
  isLoading: boolean;
  currentUserId?: string;
}) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="font-medium truncate">{team.name}</span>
          <Badge variant="secondary" className="text-xs flex-shrink-0">
            {team.members.length} {team.members.length === 1 ? "member" : "members"}
          </Badge>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onJoin(team.id, team.name)}
        disabled={isLoading}
        className="ml-2 gap-1 flex-shrink-0"
      >
        <UserPlus className="h-3.5 w-3.5" />
        Join
      </Button>
    </div>
  );
};
