"use client";

import React from "react";
import { useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { CREATE_BLUEPRINT_MUTATION } from "@/graphql/blueprints.graphql";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";

interface SaveAsBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
}

const formSchema = z.object({
  name: z.string().min(3, "Blueprint name must be at least 3 characters."),
  description: z.string().optional(),
});

type BlueprintFormValues = z.infer<typeof formSchema>;

export const SaveAsBlueprintModal = ({
  isOpen,
  onClose,
  eventId,
  eventName,
}: SaveAsBlueprintModalProps) => {
  const form = useForm<BlueprintFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: `${eventName} Blueprint`, description: "" },
  });

  const [createBlueprint, { loading }] = useMutation(
    CREATE_BLUEPRINT_MUTATION,
    {
      onCompleted: (data) => {
        toast.success(
          `Blueprint "${data.createBlueprint.name}" created successfully!`
        );
        onClose();
      },
      onError: (error) =>
        toast.error("Failed to create blueprint", {
          description: error.message,
        }),
    }
  );

  const onSubmit = (values: BlueprintFormValues) => {
    createBlueprint({
      variables: {
        blueprintIn: {
          eventId: eventId,
          name: values.name,
          description: values.description,
        },
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Event as Blueprint</DialogTitle>
          <DialogDescription>
            This will save the structure and settings of "{eventName}" as a
            reusable template.
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
                  <FormLabel>Blueprint Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea className="resize-none" {...field} />
                  </FormControl>
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
                Save Blueprint
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
