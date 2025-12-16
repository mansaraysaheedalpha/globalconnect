"use client";

import * as React from "react";
import { Check, ChevronsUpDown, User, Clock, Loader } from "lucide-react";
import { useQuery } from "@apollo/client";
import { GET_ORGANIZATION_SPEAKERS_QUERY } from "@/graphql/speakers.graphql";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "./skeleton";
import { Switch } from "./switch";
import { Label } from "./label";
import {
  useSpeakerAvailability,
  AvailableSpeaker,
} from "@/hooks/use-speaker-availability";

type Speaker = {
  id: string;
  name: string;
};

interface SpeakerMultiSelectProps {
  selectedSpeakerIds: string[];
  onChange: (speakerIds: string[]) => void;
  // Optional props for availability filtering
  organizationId?: string;
  sessionStartTime?: Date;
  sessionEndTime?: Date;
}

export function SpeakerMultiSelect({
  selectedSpeakerIds,
  onChange,
  organizationId,
  sessionStartTime,
  sessionEndTime,
}: SpeakerMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [showOnlyAvailable, setShowOnlyAvailable] = React.useState(false);
  const { data, loading } = useQuery(GET_ORGANIZATION_SPEAKERS_QUERY);

  // Speaker availability hook
  const {
    speakers: availableSpeakers,
    loading: loadingAvailability,
    fetchAvailableSpeakers,
  } = useSpeakerAvailability({
    organizationId: organizationId || "",
  });

  // Track available speaker IDs for filtering
  const availableSpeakerIds = React.useMemo(
    () => new Set(availableSpeakers.map((s: AvailableSpeaker) => s.id)),
    [availableSpeakers]
  );

  // Fetch availability when times change and feature is enabled
  React.useEffect(() => {
    if (
      showOnlyAvailable &&
      organizationId &&
      sessionStartTime &&
      sessionEndTime
    ) {
      fetchAvailableSpeakers({
        startTime: sessionStartTime,
        endTime: sessionEndTime,
      });
    }
  }, [
    showOnlyAvailable,
    organizationId,
    sessionStartTime,
    sessionEndTime,
    fetchAvailableSpeakers,
  ]);

  const allSpeakers = data?.organizationSpeakers || [];

  // Filter speakers based on availability if enabled
  const speakers = React.useMemo(() => {
    if (!showOnlyAvailable || availableSpeakerIds.size === 0) {
      return allSpeakers;
    }
    return allSpeakers.filter((s: Speaker) => availableSpeakerIds.has(s.id));
  }, [allSpeakers, showOnlyAvailable, availableSpeakerIds]);

  const canFilterByAvailability =
    organizationId && sessionStartTime && sessionEndTime;

  const handleSelect = (speakerId: string) => {
    const isSelected = selectedSpeakerIds.includes(speakerId);
    if (isSelected) {
      onChange(selectedSpeakerIds.filter((id) => id !== speakerId));
    } else {
      onChange([...selectedSpeakerIds, speakerId]);
    }
  };

  interface SelectedSpeaker extends Speaker {}

  // Use allSpeakers for selected display (so we show names even if filtered out)
  const selectedSpeakers: SelectedSpeaker[] = allSpeakers.filter((s: Speaker) =>
    selectedSpeakerIds.includes(s.id)
  );

  if (loading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto"
          >
            <div className="flex flex-wrap gap-2">
              {selectedSpeakers.length > 0 ? (
                selectedSpeakers.map((s) => (
                  <div
                    key={s.id}
                    className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-sm flex items-center"
                  >
                    <User className="h-3 w-3 mr-1" />
                    {s.name}
                  </div>
                ))
              ) : (
                <span className="text-muted-foreground">Select speakers...</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Search speakers..." />
            {/* Availability filter toggle */}
            {canFilterByAvailability && (
              <div className="flex items-center gap-2 px-3 py-2 border-b">
                <Switch
                  id="availability-filter"
                  checked={showOnlyAvailable}
                  onCheckedChange={setShowOnlyAvailable}
                  disabled={loadingAvailability}
                />
                <Label
                  htmlFor="availability-filter"
                  className="text-sm cursor-pointer flex items-center gap-1"
                >
                  <Clock className="h-3 w-3" />
                  Show only available
                  {loadingAvailability && (
                    <Loader className="h-3 w-3 animate-spin ml-1" />
                  )}
                </Label>
              </div>
            )}
            <CommandList>
              <CommandEmpty>
                {showOnlyAvailable
                  ? "No available speakers found for this time slot."
                  : "No speakers found."}
              </CommandEmpty>
              <CommandGroup>
                {speakers.map((speaker: Speaker) => {
                  const isAvailable =
                    !showOnlyAvailable || availableSpeakerIds.has(speaker.id);
                  return (
                    <CommandItem
                      key={speaker.id}
                      value={speaker.name}
                      onSelect={() => {
                        handleSelect(speaker.id);
                      }}
                      className={cn(!isAvailable && "opacity-50")}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedSpeakerIds.includes(speaker.id)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <span className="flex-1">{speaker.name}</span>
                      {showOnlyAvailable && isAvailable && (
                        <span className="text-xs text-green-600 ml-2">
                          Available
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {/* Availability info text */}
      {canFilterByAvailability && showOnlyAvailable && (
        <p className="text-xs text-muted-foreground">
          Showing speakers available from{" "}
          {sessionStartTime?.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          to{" "}
          {sessionEndTime?.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}
    </div>
  );
}
