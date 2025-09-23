"use client";

import * as React from "react";
import { Check, ChevronsUpDown, User } from "lucide-react";
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

type Speaker = {
  id: string;
  name: string;
};

interface SpeakerMultiSelectProps {
  selectedSpeakerIds: string[];
  onChange: (speakerIds: string[]) => void;
}

export function SpeakerMultiSelect({
  selectedSpeakerIds,
  onChange,
}: SpeakerMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const { data, loading } = useQuery(GET_ORGANIZATION_SPEAKERS_QUERY);

  const speakers = data?.organizationSpeakers || [];

  const handleSelect = (speakerId: string) => {
    const isSelected = selectedSpeakerIds.includes(speakerId);
    if (isSelected) {
      onChange(selectedSpeakerIds.filter((id) => id !== speakerId));
    } else {
      onChange([...selectedSpeakerIds, speakerId]);
    }
  };

  interface SelectedSpeaker extends Speaker {}

  const selectedSpeakers: SelectedSpeaker[] = speakers.filter((s: Speaker) =>
    selectedSpeakerIds.includes(s.id)
  );

  if (loading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
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
          <CommandList>
            <CommandEmpty>No speakers found.</CommandEmpty>
            <CommandGroup>
              {speakers.map((speaker: Speaker) => (
                <CommandItem
                  key={speaker.id}
                  value={speaker.name}
                  onSelect={() => {
                    handleSelect(speaker.id);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedSpeakerIds.includes(speaker.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {speaker.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
