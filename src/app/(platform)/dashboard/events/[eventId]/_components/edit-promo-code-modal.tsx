
// src/app/(platform)/dashboard/events/[eventId]/_components/edit-promo-code-modal.tsx
"use client";

import React from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  UPDATE_PROMO_CODE_MUTATION,
  GET_EVENT_TICKET_TYPES_ADMIN_QUERY,
} from "@/graphql/payments.graphql";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader, Percent, DollarSign, Calendar, Ticket } from "lucide-react";

interface EditPromoCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  promoCode: any;
  eventId: string;
  onSuccess: () => void;
}

const formSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters"),
});

type PromoCodeFormValues = z.infer<typeof formSchema>;

export const EditPromoCodeModal = ({
  isOpen,
  onClose,
  promoCode,
  onSuccess,
}: EditPromoCodeModalProps) => {
  const { data: ticketTypesData } = useQuery(
    GET_EVENT_TICKET_TYPES_ADMIN_QUERY,
    {
      variables: { eventId: promoCode?.eventId },
      skip: !promoCode?.eventId || !isOpen,
    }
  );

  const ticketTypes = ticketTypesData?.eventTicketTypesAdmin || [];

  const form = useForm<PromoCodeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  const [updatePromoCode, { loading }] = useMutation(
    UPDATE_PROMO_CODE_MUTATION,
    {
      onCompleted: () => {
        toast.success("Promo code updated successfully!");
        onSuccess();
      },
      onError: (error) => {
        toast.error("Failed to update promo code", {
          description: error.message,
        });
      },
    }
  );

  const onSubmit = (values: PromoCodeFormValues) => {
    
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Promo Code</DialogTitle>
          <DialogDescription>
            Update the details of this promo code.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., SUMMER20"
                      className="font-mono uppercase"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Letters, numbers, dashes, and underscores only
                  </FormDescription>
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