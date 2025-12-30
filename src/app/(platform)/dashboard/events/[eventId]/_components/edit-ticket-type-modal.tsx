
// src/app/(platform)/dashboard/events/[eventId]/_components/edit-ticket-type-modal.tsx
"use client";

import React from "react";
import { useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { UPDATE_TICKET_TYPE_MUTATION } from "@/graphql/payments.graphql";
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
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";
import { Loader, DollarSign, Calendar } from "lucide-react";

interface EditTicketTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketType: any;
  onSuccess: () => void;
}

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
});

type TicketTypeFormValues = z.infer<typeof formSchema>;

export const EditTicketTypeModal = ({
  isOpen,
  onClose,
  ticketType,
  onSuccess,
}: EditTicketTypeModalProps) => {
  const form = useForm<TicketTypeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const [updateTicketType, { loading }] = useMutation(
    UPDATE_TICKET_TYPE_MUTATION,
    {
      onCompleted: () => {
        toast.success("Ticket type updated successfully!");
        onSuccess();
      },
      onError: (error) => {
        toast.error("Failed to update ticket type", {
          description: error.message,
        });
      },
    }
  );

  const onSubmit = (values: TicketTypeFormValues) => {
    
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Ticket Type</DialogTitle>
          <DialogDescription>
            Update the details of this ticket type.
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
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., General Admission" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
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