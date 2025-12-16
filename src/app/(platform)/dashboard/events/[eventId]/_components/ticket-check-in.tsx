// src/app/(platform)/dashboard/events/[eventId]/_components/ticket-check-in.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  useTicketValidation,
  ValidationResult,
} from "@/hooks/use-ticket-validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Loader,
  CheckCircle2,
  XCircle,
  ScanLine,
  RotateCcw,
  Clock,
  Ticket,
} from "lucide-react";

interface TicketCheckInProps {
  eventId: string;
}

const ticketSchema = z.object({
  ticketCode: z
    .string()
    .min(1, "Ticket code is required")
    .regex(
      /^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{2}$/i,
      "Invalid ticket format. Expected: XXX-XXX-XX"
    ),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

interface CheckInHistoryItem {
  ticketCode: string;
  isValid: boolean;
  timestamp: string;
  errorReason: string | null;
}

export const TicketCheckIn = ({ eventId }: TicketCheckInProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInHistoryItem[]>(
    []
  );

  const { loading, lastResult, validateTicket, reset, isValidTicketFormat } =
    useTicketValidation();

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      ticketCode: "",
    },
  });

  // Callback ref to combine react-hook-form ref with our local ref
  const setInputRef = useCallback(
    (element: HTMLInputElement | null) => {
      inputRef.current = element;
    },
    []
  );

  // Focus input on mount and after each validation
  useEffect(() => {
    inputRef.current?.focus();
  }, [lastResult]);

  // Handle form submission
  const onSubmit = async (values: TicketFormValues) => {
    const formattedCode = values.ticketCode.toUpperCase().trim();

    if (!isValidTicketFormat(formattedCode)) {
      toast.error("Invalid ticket format", {
        description: "Please enter a valid ticket code (XXX-XXX-XX)",
      });
      return;
    }

    const result = await validateTicket(eventId, formattedCode);

    // Add to history
    setRecentCheckIns((prev) => [
      {
        ticketCode: result.ticketCode,
        isValid: result.isValid,
        timestamp: result.validatedAt,
        errorReason: result.errorReason,
      },
      ...prev.slice(0, 9), // Keep last 10
    ]);

    // Show toast notification
    if (result.isValid) {
      toast.success("Check-in successful!", {
        description: `Ticket ${result.ticketCode} validated`,
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });
    } else {
      toast.error("Check-in failed", {
        description: result.errorReason || "Unknown error",
        icon: <XCircle className="h-4 w-4 text-red-500" />,
      });
    }

    // Clear input for next scan
    form.reset();
    inputRef.current?.focus();
  };

  // Handle input change for auto-formatting
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");

    // Auto-add dashes at correct positions
    if (value.length === 3 && !value.includes("-")) {
      value = value + "-";
    } else if (value.length === 7 && value.split("-").length === 2) {
      value = value + "-";
    }

    // Limit to max length (10 chars: XXX-XXX-XX)
    if (value.length <= 10) {
      onChange(value);
    }
  };

  const handleReset = () => {
    reset();
    form.reset();
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-6">
      {/* Check-in Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5" />
            Ticket Check-In
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="ticketCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ticket Code</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          {...field}
                          ref={(e) => {
                            field.ref(e);
                            setInputRef(e);
                          }}
                          placeholder="XXX-XXX-XX"
                          className="font-mono text-lg tracking-wider"
                          autoComplete="off"
                          autoFocus
                          onChange={(e) =>
                            handleInputChange(e, field.onChange)
                          }
                        />
                        <Button type="submit" disabled={loading}>
                          {loading ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <Ticket className="h-4 w-4" />
                          )}
                          <span className="ml-2">Validate</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          {/* Last Result Display */}
          {lastResult && (
            <div
              className={`mt-4 p-4 rounded-lg border-2 ${
                lastResult.isValid
                  ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                  : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
              }`}
            >
              <div className="flex items-center gap-3">
                {lastResult.isValid ? (
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-500" />
                )}
                <div>
                  <p
                    className={`font-semibold text-lg ${
                      lastResult.isValid ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                    }`}
                  >
                    {lastResult.isValid
                      ? "Check-in Successful!"
                      : "Check-in Failed"}
                  </p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {lastResult.ticketCode}
                  </p>
                  {lastResult.errorReason && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {lastResult.errorReason}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="mt-2"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Check-ins History */}
      {recentCheckIns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Recent Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentCheckIns.map((item, index) => (
                <div
                  key={`${item.ticketCode}-${item.timestamp}-${index}`}
                  className={`flex items-center justify-between p-2 rounded-md ${
                    item.isValid
                      ? "bg-green-50 dark:bg-green-900/20"
                      : "bg-red-50 dark:bg-red-900/20"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item.isValid ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-mono text-sm">{item.ticketCode}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(item.timestamp), "HH:mm:ss")}
                    </span>
                    {item.errorReason && (
                      <p className="text-xs text-red-500 truncate max-w-[150px]">
                        {item.errorReason}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
