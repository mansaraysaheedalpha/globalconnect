// src/app/(platform)/dashboard/events/[eventId]/_components/create-promo-code-modal.tsx
"use client";

import React from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  CREATE_PROMO_CODE_MUTATION,
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

interface CreatePromoCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onSuccess: () => void;
}

const formSchema = z.object({
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code is too long")
    .regex(/^[A-Z0-9_-]+$/i, "Code can only contain letters, numbers, dashes, and underscores")
    .transform((val) => val.toUpperCase()),
  description: z.string().max(200, "Description is too long").optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discountValue: z.coerce.number().min(0.01, "Discount must be greater than 0"),
  currency: z.string().default("USD"),
  applicableTicketTypeIds: z.array(z.string()).default([]),
  maxUses: z.coerce.number().int().min(1, "Must be at least 1").optional().nullable(),
  unlimitedUses: z.boolean().default(true),
  maxUsesPerUser: z.coerce.number().int().min(1, "Must be at least 1").default(1),
  validFrom: z.date().optional().nullable(),
  validUntil: z.date().optional().nullable(),
  minimumOrderAmount: z.coerce.number().min(0).optional().nullable(),
  minimumTickets: z.coerce.number().int().min(1).optional().nullable(),
  isActive: z.boolean().default(true),
});

type PromoCodeFormValues = z.infer<typeof formSchema>;

export const CreatePromoCodeModal = ({
  isOpen,
  onClose,
  eventId,
  onSuccess,
}: CreatePromoCodeModalProps) => {
  // Fetch ticket types for the dropdown
  const { data: ticketTypesData } = useQuery(GET_EVENT_TICKET_TYPES_ADMIN_QUERY, {
    variables: { eventId },
    skip: !eventId || !isOpen,
  });

  const ticketTypes = ticketTypesData?.eventTicketTypesAdmin || [];

  const form = useForm<PromoCodeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: 10,
      currency: "USD",
      applicableTicketTypeIds: [],
      maxUses: 100,
      unlimitedUses: true,
      maxUsesPerUser: 1,
      validFrom: null,
      validUntil: null,
      minimumOrderAmount: null,
      minimumTickets: null,
      isActive: true,
    },
  });

  const [createPromoCode, { loading }] = useMutation(CREATE_PROMO_CODE_MUTATION, {
    onCompleted: () => {
      toast.success("Promo code created successfully!");
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      toast.error("Failed to create promo code", {
        description: error.message,
      });
    },
  });

  const onSubmit = (values: PromoCodeFormValues) => {
    // Validate percentage discount
    if (values.discountType === "PERCENTAGE" && values.discountValue > 100) {
      form.setError("discountValue", {
        message: "Percentage cannot exceed 100%",
      });
      return;
    }

    // Validate validity dates
    if (values.validFrom && values.validUntil && values.validFrom >= values.validUntil) {
      form.setError("validUntil", {
        message: "End date must be after start date",
      });
      return;
    }

    createPromoCode({
      variables: {
        input: {
          eventId,
          code: values.code,
          description: values.description || null,
          discountType: values.discountType,
          discountValue:
            values.discountType === "PERCENTAGE"
              ? values.discountValue
              : Math.round(values.discountValue * 100), // Convert to cents for fixed amount
          currency: values.currency,
          applicableTicketTypeIds:
            values.applicableTicketTypeIds.length > 0
              ? values.applicableTicketTypeIds
              : null,
          maxUses: values.unlimitedUses ? null : values.maxUses,
          maxUsesPerUser: values.maxUsesPerUser,
          validFrom: values.validFrom?.toISOString() || null,
          validUntil: values.validUntil?.toISOString() || null,
          minimumOrderAmount: values.minimumOrderAmount
            ? Math.round(values.minimumOrderAmount * 100)
            : null,
          minimumTickets: values.minimumTickets || null,
          isActive: values.isActive,
        },
      },
    });
  };

  const discountType = form.watch("discountType");
  const unlimitedUses = form.watch("unlimitedUses");

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setValue("code", code);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Promo Code</DialogTitle>
          <DialogDescription>
            Create a new discount code for your event.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* Code */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code *</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="e.g., SUMMER20"
                        className="font-mono uppercase"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateRandomCode}
                    >
                      Generate
                    </Button>
                  </div>
                  <FormDescription>
                    Letters, numbers, dashes, and underscores only
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Internal note about this promo code..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Discount Type and Value */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">
                          <div className="flex items-center gap-2">
                            <Percent className="h-4 w-4" />
                            Percentage
                          </div>
                        </SelectItem>
                        <SelectItem value="FIXED_AMOUNT">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Fixed Amount
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discountValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {discountType === "PERCENTAGE" ? "Percentage *" : "Amount *"}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        {discountType === "PERCENTAGE" ? (
                          <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        ) : (
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        )}
                        <Input
                          type="number"
                          step={discountType === "PERCENTAGE" ? "1" : "0.01"}
                          min="0"
                          max={discountType === "PERCENTAGE" ? "100" : undefined}
                          placeholder={discountType === "PERCENTAGE" ? "10" : "5.00"}
                          className={discountType === "FIXED_AMOUNT" ? "pl-8" : ""}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Applicable Ticket Types */}
            {ticketTypes.length > 0 && (
              <FormField
                control={form.control}
                name="applicableTicketTypeIds"
                render={() => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-muted-foreground" />
                      Applicable Ticket Types
                    </FormLabel>
                    <FormDescription>
                      Leave empty to apply to all ticket types
                    </FormDescription>
                    <div className="space-y-2 mt-2">
                      {ticketTypes.map((ticketType: { id: string; name: string }) => (
                        <FormField
                          key={ticketType.id}
                          control={form.control}
                          name="applicableTicketTypeIds"
                          render={({ field }) => (
                            <FormItem
                              key={ticketType.id}
                              className="flex items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(ticketType.id)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    if (checked) {
                                      field.onChange([...current, ticketType.id]);
                                    } else {
                                      field.onChange(
                                        current.filter((id) => id !== ticketType.id)
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {ticketType.name}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Usage Limits */}
            <div className="space-y-3 pt-2 border-t">
              <p className="text-sm font-medium">Usage Limits</p>
              <FormField
                control={form.control}
                name="unlimitedUses"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <FormLabel className="font-normal cursor-pointer">
                      Unlimited Uses
                    </FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {!unlimitedUses && (
                <FormField
                  control={form.control}
                  name="maxUses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Total Uses</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="100"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="maxUsesPerUser"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Uses Per User</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Validity Period */}
            <div className="space-y-3 pt-2 border-t">
              <p className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Validity Period (Optional)
              </p>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="validFrom"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Valid From</FormLabel>
                      <DatePicker
                        date={field.value ?? undefined}
                        setDate={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="validUntil"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Valid Until</FormLabel>
                      <DatePicker
                        date={field.value ?? undefined}
                        setDate={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Minimum Requirements */}
            <div className="space-y-3 pt-2 border-t">
              <p className="text-sm font-medium">Minimum Requirements (Optional)</p>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minimumOrderAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Order Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="pl-8"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="minimumTickets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Tickets</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="1"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Active Toggle */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel className="font-normal cursor-pointer">Active</FormLabel>
                    <FormDescription className="text-xs">
                      Inactive codes cannot be used
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Create Promo Code
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
