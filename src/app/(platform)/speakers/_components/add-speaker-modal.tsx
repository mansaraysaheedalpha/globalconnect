// src/app/(platform)/dashboard/speakers/_components/add-speaker-modal.tsx
"use client";

import React from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  GET_ORGANIZATION_SPEAKERS_QUERY,
  CREATE_SPEAKER_MUTATION,
} from "@/graphql/speakers.graphql";
import { TEAM_DATA_QUERY } from "@/components/features/Auth/auth.graphql";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader, Link2 } from "lucide-react";

type Speaker = {
  id: string;
  name: string;
  bio?: string | null;
  expertise?: string[] | null;
  userId?: string | null;
  __typename?: string;
};
type SpeakersQueryData = { organizationSpeakers: Speaker[] };

type TeamMember = {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  role: {
    id: string;
    name: string;
  };
};

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  bio: z.string().optional(),
  expertise: z.string().optional(),
  userId: z.string().optional(),
});

type SpeakerFormValues = z.infer<typeof formSchema>;

interface AddSpeakerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddSpeakerModal = ({ isOpen, onClose }: AddSpeakerModalProps) => {
  const form = useForm<SpeakerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", bio: "", expertise: "", userId: "" },
  });

  // Fetch team members for the user linking dropdown
  const { data: teamData } = useQuery(TEAM_DATA_QUERY, {
    fetchPolicy: "cache-first",
  });

  const teamMembers: TeamMember[] = teamData?.organizationMembers || [];

  // Separate SPEAKER role members from others for better UX
  const speakerRoleMembers = teamMembers.filter((m) => m.role.name === "SPEAKER");
  const otherMembers = teamMembers.filter((m) => m.role.name !== "SPEAKER");

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
          // Only include userId if a team member is selected (not "none")
          userId: values.userId && values.userId !== "none" ? values.userId : null,
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
            Add a new speaker to your organization&apos;s directory. This makes them
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
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    Link to Platform Account (Optional)
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team member (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">
                        <span className="text-muted-foreground">No account link (external speaker)</span>
                      </SelectItem>
                      {speakerRoleMembers.length > 0 && (
                        <SelectGroup>
                          <SelectLabel className="text-xs text-primary font-semibold">
                            Team Members with SPEAKER Role (Recommended)
                          </SelectLabel>
                          {speakerRoleMembers.map((member) => (
                            <SelectItem key={member.user.id} value={member.user.id}>
                              <div className="flex items-center gap-2">
                                <span>
                                  {member.user.first_name} {member.user.last_name}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                  ({member.user.email})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                      {otherMembers.length > 0 && (
                        <SelectGroup>
                          <SelectLabel className="text-xs text-muted-foreground">
                            Other Team Members
                          </SelectLabel>
                          {otherMembers.map((member) => (
                            <SelectItem key={member.user.id} value={member.user.id}>
                              <div className="flex items-center gap-2">
                                <span>
                                  {member.user.first_name} {member.user.last_name}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                  ({member.role.name})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    If this speaker is also a team member, link their accounts so they can:
                    receive backchannel messages, and control their own presentations.
                    External speakers (not on your team) don&apos;t need linking.
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
