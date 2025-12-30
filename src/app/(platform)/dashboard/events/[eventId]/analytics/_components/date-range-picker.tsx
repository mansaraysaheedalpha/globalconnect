// src/app/(platform)/dashboard/events/[eventId]/analytics/_components/date-range-picker.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "lucide-react";
import { format, addDays, startOfMonth, endOfMonth, startOfYear, subDays } from "date-fns";
import { cn } from "@/lib/utils";

interface DateRange {
  from: string;
  to: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const presets = [
    {
      label: "Last 7 days",
      getValue: () => ({
        from: format(addDays(new Date(), -7), "yyyy-MM-dd"),
        to: format(new Date(), "yyyy-MM-dd"),
      }),
    },
    {
      label: "Last 30 days",
      getValue: () => ({
        from: format(addDays(new Date(), -30), "yyyy-MM-dd"),
        to: format(new Date(), "yyyy-MM-dd"),
      }),
    },
    {
      label: "Last 90 days",
      getValue: () => ({
        from: format(addDays(new Date(), -90), "yyyy-MM-dd"),
        to: format(new Date(), "yyyy-MM-dd"),
      }),
    },
    {
      label: "This month",
      getValue: () => ({
        from: format(startOfMonth(new Date()), "yyyy-MM-dd"),
        to: format(endOfMonth(new Date()), "yyyy-MM-dd"),
      }),
    },
    {
      label: "This year",
      getValue: () => ({
        from: format(startOfYear(new Date()), "yyyy-MM-dd"),
        to: format(new Date(), "yyyy-MM-dd"),
      }),
    },
  ];

  const handlePresetClick = (preset: typeof presets[0]) => {
    const newRange = preset.getValue();
    onChange(newRange);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    const fromDate = new Date(value.from);
    const toDate = new Date(value.to);
    return `${format(fromDate, "MMM d, yyyy")} - ${format(toDate, "MMM d, yyyy")}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal min-w-[260px]",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {value ? getDisplayText() : <span>Pick a date range</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="p-3 space-y-2">
          <div className="text-sm font-medium mb-2">Quick select</div>
          {presets.map((preset) => (
            <Button
              key={preset.label}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handlePresetClick(preset)}
            >
              {preset.label}
            </Button>
          ))}
          <div className="border-t pt-2 mt-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">From</label>
                <input
                  type="date"
                  value={value.from}
                  onChange={(e) =>
                    onChange({ ...value, from: e.target.value })
                  }
                  className="w-full px-2 py-1 text-sm border rounded"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">To</label>
                <input
                  type="date"
                  value={value.to}
                  onChange={(e) => onChange({ ...value, to: e.target.value })}
                  className="w-full px-2 py-1 text-sm border rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
