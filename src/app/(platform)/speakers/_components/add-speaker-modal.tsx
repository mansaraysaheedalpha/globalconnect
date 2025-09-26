// src/app/(platform)/dashboard/speakers/_components/add-speaker-modal.tsx
"use client";

import React from "react";
import { useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  GET_ORGANIZATION_SPEAKERS_QUERY,
  CREATE_SPEAKER_MUTATION,
} from "@/graphql/speakers.graphql";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";

type Speaker = {
  id: string;
  name: string;
  bio?: string | null;
  expertise?: string[] | null;
  __typename?: string;
};
type SpeakersQueryData = { organizationSpeakers: Speaker[] };

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  bio: z.string().optional(),
  expertise: z.string().optional(),
});

type SpeakerFormValues = z.infer<typeof formSchema>;

interface AddSpeakerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddSpeakerModal = ({ isOpen, onClose }: AddSpeakerModalProps) => {
  const form = useForm<SpeakerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", bio: "", expertise: "" },
  });

  const [createSpeaker, { loading }] = useMutation(CREATE_SPEAKER_MUTATION, {
    onCompleted: () => {
      toast.success("Speaker added successfully!");
      onClose();
      form.reset();
    },
    onError: (error) =>
      toast.error("Failed to add speaker", { description: error.message }),
    update(cache, { data: { createSpeaker } }) {
      const data = cache.readQuery<SpeakersQueryData>({
        query: GET_ORGANIZATION_SPEAKERS_QUERY,
      });
      if (data) {
        cache.writeQuery({
          query: GET_ORGANIZATION_SPEAKERS_QUERY,
          data: {
            organizationSpeakers: [...data.organizationSpeakers, createSpeaker],
          },
        });
      }
    },
  });

  const onSubmit = (values: SpeakerFormValues) => {
    createSpeaker({
      variables: {
        speakerIn: {
          name: values.name,
          bio: values.bio,
          expertise: values.expertise
            ? values.expertise.split(",").map((e) => e.trim())
            : [],
        },
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Speaker</DialogTitle>
          <DialogDescription>
            Add a new speaker to your organization's directory. This makes them
            available to be assigned to sessions.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Dr. Evelyn Reed" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio / Title</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Lead AI Researcher at Futura Corp."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expertise"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Areas of Expertise</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., AI, Machine Learning, NLP"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter tags separated by commas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Add Speaker
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
