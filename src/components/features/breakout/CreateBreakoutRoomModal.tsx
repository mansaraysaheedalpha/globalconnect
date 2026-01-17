// src/components/features/breakout/CreateBreakoutRoomModal.tsx
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader } from "lucide-react";
import { CreateBreakoutRoomData } from "./types";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  topic: z.string().max(500).optional(),
  maxParticipants: z.number().min(2).max(50),
  durationMinutes: z.number().min(5).max(120),
  autoAssign: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateBreakoutRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  eventId: string;
  onSubmit: (data: CreateBreakoutRoomData) => Promise<void>;
  isSubmitting?: boolean;
}

export function CreateBreakoutRoomModal({
  isOpen,
  onClose,
  sessionId,
  eventId,
  onSubmit,
  isSubmitting = false,
}: CreateBreakoutRoomModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      topic: "",
      maxParticipants: 8,
      durationMinutes: 15,
      autoAssign: false,
    },
  });

  const handleSubmit = async (values: FormValues) => {
    await onSubmit({
      sessionId,
      eventId,
      name: values.name,
      topic: values.topic || undefined,
      maxParticipants: values.maxParticipants,
      durationMinutes: values.durationMinutes,
      autoAssign: values.autoAssign,
      idempotencyKey: uuidv4(),
    });
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Breakout Room</DialogTitle>
          <DialogDescription>
            Create a breakout room for small-group discussions during the session.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Group Discussion 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What will this group discuss?"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maxParticipants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Participants</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(parseInt(v))}
                      defaultValue={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[4, 6, 8, 10, 12, 15, 20, 25, 30, 50].map((num) => (
                          <SelectItem key={num} value={String(num)}>
                            {num} people
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(parseInt(v))}
                      defaultValue={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[5, 10, 15, 20, 30, 45, 60, 90, 120].map((num) => (
                          <SelectItem key={num} value={String(num)}>
                            {num} minutes
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="autoAssign"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Auto-Assign Participants</FormLabel>
                    <FormDescription>
                      Automatically assign attendees to this room
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Create Room
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
