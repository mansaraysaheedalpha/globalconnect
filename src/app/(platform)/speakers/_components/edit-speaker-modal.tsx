"use client";

import React, { useEffect } from "react";
import { useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { UPDATE_SPEAKER_MUTATION } from "@/graphql/speakers.graphql";
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

  useEffect(() => {
    if (speaker) {
      form.reset({
        name: speaker.name,
        bio: speaker.bio || "",
        expertise: speaker.expertise?.join(", ") || "",
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
            Make changes to {speaker.name}'s profile.
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
