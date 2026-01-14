// src/app/(platform)/dashboard/speakers/_components/edit-speaker-modal.tsx
"use client";

import React, { useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { UPDATE_SPEAKER_MUTATION } from "@/graphql/speakers.graphql";
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
};

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

interface EditSpeakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  speaker: Speaker;
}

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  bio: z.string().optional(),
  expertise: z.string().optional(),
  userId: z.string().optional(),
});

type SpeakerFormValues = z.infer<typeof formSchema>;

export const EditSpeakerModal = ({
  isOpen,
  onClose,
  speaker,
}: EditSpeakerModalProps) => {
  const form = useForm<SpeakerFormValues>({
    resolver: zodResolver(formSchema),
  });

  // Fetch team members for the user linking dropdown
  const { data: teamData } = useQuery(TEAM_DATA_QUERY, {
    fetchPolicy: "cache-first",
  });

  const teamMembers: TeamMember[] = teamData?.organizationMembers || [];

  // Separate SPEAKER role members from others for better UX
  const speakerRoleMembers = teamMembers.filter((m) => m.role.name === "SPEAKER");
  const otherMembers = teamMembers.filter((m) => m.role.name !== "SPEAKER");

  // Find the linked team member's name for display
  const linkedMember = teamMembers.find((m) => m.user.id === speaker.userId);

  useEffect(() => {
    if (speaker) {
      form.reset({
        name: speaker.name,
        bio: speaker.bio || "",
        expertise: speaker.expertise?.join(", ") || "",
        userId: speaker.userId || "none",
      });
    }
  }, [speaker, form]);

  const [updateSpeaker, { loading }] = useMutation(UPDATE_SPEAKER_MUTATION, {
    onCompleted: () => {
      toast.success("Speaker updated successfully!");
      onClose();
    },
    onError: (error) =>
      toast.error("Failed to update speaker", { description: error.message }),
  });

  const onSubmit = (values: SpeakerFormValues) => {
    updateSpeaker({
      variables: {
        id: speaker.id,
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
          <DialogTitle>Edit Speaker</DialogTitle>
          <DialogDescription>
            Make changes to {speaker.name}&apos;s profile.
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
                    <Input {...field} />
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
                    <Textarea className="resize-none" {...field} />
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
                    <Input {...field} />
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
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team member (optional)">
                          {field.value && field.value !== "none" && linkedMember
                            ? `${linkedMember.user.first_name} ${linkedMember.user.last_name}`
                            : field.value === "none"
                            ? "No account link (external speaker)"
                            : "Select a team member (optional)"}
                        </SelectValue>
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
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
