// Challenge creator component for organizer dashboard
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Swords, Plus, Zap, Clock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChallengeTemplate } from "@/hooks/use-challenges";
import { toast } from "sonner";

interface ChallengeCreatorProps {
  templates: ChallengeTemplate[];
  onCreateChallenge: (data: {
    name: string;
    description?: string;
    type: string;
    durationMinutes: number;
    trackedReason?: string;
    rewardFirst?: number;
    rewardSecond?: number;
    rewardThird?: number;
  }) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

export const ChallengeCreator = ({
  templates,
  onCreateChallenge,
  isLoading,
}: ChallengeCreatorProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ChallengeTemplate | null>(null);
  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customDuration, setCustomDuration] = useState(10);
  const [showCustom, setShowCustom] = useState(false);

  const handleCreateFromTemplate = async (template: ChallengeTemplate) => {
    const result = await onCreateChallenge({
      name: template.name,
      description: template.description,
      type: template.type,
      durationMinutes: template.durationMinutes,
      trackedReason: template.trackedReason,
      rewardFirst: template.rewardFirst,
      rewardSecond: template.rewardSecond,
      rewardThird: template.rewardThird,
    });

    if (result.success) {
      toast.success(`Challenge "${template.name}" created!`);
    } else {
      toast.error(result.error || "Failed to create challenge");
    }
  };

  const handleCreateCustom = async () => {
    if (!customName.trim()) {
      toast.error("Challenge name is required");
      return;
    }

    const result = await onCreateChallenge({
      name: customName.trim(),
      description: customDescription.trim() || undefined,
      type: "POINTS_RACE",
      durationMinutes: customDuration,
    });

    if (result.success) {
      toast.success(`Challenge "${customName}" created!`);
      setCustomName("");
      setCustomDescription("");
      setCustomDuration(10);
      setShowCustom(false);
    } else {
      toast.error(result.error || "Failed to create challenge");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Challenge
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template buttons */}
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            Quick-start from a template:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {templates.map((template) => (
              <button
                key={template.key}
                onClick={() => handleCreateFromTemplate(template)}
                disabled={isLoading}
                className={cn(
                  "flex flex-col items-start gap-1 p-3 rounded-lg border text-left transition-colors",
                  "hover:bg-accent hover:border-accent-foreground/20",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-2 w-full">
                  <Swords className="h-3.5 w-3.5 text-purple-500" />
                  <span className="text-sm font-medium">{template.name}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {template.description}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {template.durationMinutes}m
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="h-3 w-3 text-yellow-500" />
                    {template.rewardFirst}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom challenge */}
        <div className="border-t pt-3">
          {!showCustom ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowCustom(true)}
            >
              <Zap className="h-3.5 w-3.5 mr-1.5" />
              Create Custom Challenge
            </Button>
          ) : (
            <div className="space-y-3">
              <div>
                <Label htmlFor="challenge-name" className="text-xs">Name</Label>
                <Input
                  id="challenge-name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Challenge name"
                  maxLength={200}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="challenge-desc" className="text-xs">Description (optional)</Label>
                <Textarea
                  id="challenge-desc"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="What should teams do?"
                  className="text-sm min-h-[60px]"
                />
              </div>
              <div>
                <Label htmlFor="challenge-duration" className="text-xs">Duration (minutes)</Label>
                <Input
                  id="challenge-duration"
                  type="number"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(Number(e.target.value))}
                  min={1}
                  max={120}
                  className="h-8 text-sm w-24"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleCreateCustom}
                  disabled={isLoading || !customName.trim()}
                >
                  Create
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowCustom(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
