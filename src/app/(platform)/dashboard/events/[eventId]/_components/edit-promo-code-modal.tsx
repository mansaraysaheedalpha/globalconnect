// src/app/(platform)/dashboard/events/[eventId]/_components/edit-promo-code-modal.tsx
"use client";

import React, { useEffect } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader, Percent, DollarSign, Calendar, Ticket, AlertTriangle } from "lucide-react";

interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  discountFormatted: string;
  applicableTicketTypes: Array<{
    id: string;
    name: string;
  }>;
  maxUses: number | null;
  maxUsesPerUser: number;
  currentUses: number;
  remainingUses: number | null;
  validFrom: string | null;
  validUntil: string | null;
  isCurrentlyValid: boolean;
  minimumOrderAmount: {
    amount: number;
    formatted: string;
  } | null;
  minimumTickets: number | null;
  isActive: boolean;
  createdAt: string;
}

interface EditPromoCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  promoCode: PromoCode;
  eventId: string;
  onSuccess: () => void;
}

const formSchema = z.object({
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

export const EditPromoCodeModal = ({
  isOpen,
  onClose,
  promoCode,
  eventId,
  onSuccess,
}: EditPromoCodeModalProps) => {
  const hasUses = promoCode.currentUses > 0;

  // Fetch ticket types for the dropdown
  const { data: ticketTypesData } = useQuery(GET_EVENT_TICKET_TYPES_ADMIN_QUERY, {
    variables: { eventId },
    skip: !eventId || !isOpen,
  });

  const ticketTypes = ticketTypesData?.eventTicketTypesAdmin || [];

  const form = useForm<PromoCodeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: promoCode.description || "",
      discountType: promoCode.discountType,
      discountValue:
        promoCode.discountType === "PERCENTAGE"
          ? promoCode.discountValue
          : promoCode.discountValue / 100,
      currency: "USD",
      applicableTicketTypeIds: promoCode.applicableTicketTypes.map((t) => t.id),
      maxUses: promoCode.maxUses,
      unlimitedUses: promoCode.maxUses === null,
      maxUsesPerUser: promoCode.maxUsesPerUser,
      validFrom: promoCode.validFrom ? new Date(promoCode.validFrom) : null,
      validUntil: promoCode.validUntil ? new Date(promoCode.validUntil) : null,
      minimumOrderAmount: promoCode.minimumOrderAmount
        ? promoCode.minimumOrderAmount.amount / 100
        : null,
      minimumTickets: promoCode.minimumTickets,
      isActive: promoCode.isActive,
    },
  });

  // Reset form when promoCode changes
  useEffect(() => {
    form.reset({
      description: promoCode.description || "",
      discountType: promoCode.discountType,
      discountValue:
        promoCode.discountType === "PERCENTAGE"
          ? promoCode.discountValue
          : promoCode.discountValue / 100,
      currency: "USD",
      applicableTicketTypeIds: promoCode.applicableTicketTypes.map((t) => t.id),
      maxUses: promoCode.maxUses,
      unlimitedUses: promoCode.maxUses === null,
      maxUsesPerUser: promoCode.maxUsesPerUser,
      validFrom: promoCode.validFrom ? new Date(promoCode.validFrom) : null,
      validUntil: promoCode.validUntil ? new Date(promoCode.validUntil) : null,
      minimumOrderAmount: promoCode.minimumOrderAmount
        ? promoCode.minimumOrderAmount.amount / 100
        : null,
      minimumTickets: promoCode.minimumTickets,
      isActive: promoCode.isActive,
    });
  }, [promoCode, form]);

  const [updatePromoCode, { loading }] = useMutation(UPDATE_PROMO_CODE_MUTATION, {
    onCompleted: () => {
      toast.success("Promo code updated successfully!");
      onSuccess();
    },
    onError: (error) => {
      toast.error("Failed to update promo code", {
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

    // Validate max uses if code has been used
    if (hasUses && !values.unlimitedUses && values.maxUses) {
      if (values.maxUses < promoCode.currentUses) {
        form.setError("maxUses", {
          message: `Cannot be less than current uses (${promoCode.currentUses})`,
        });
        return;
      }
    }

    updatePromoCode({
      variables: {
        id: promoCode.id,
        input: {
          description: values.description || null,
          // Only allow discount changes if no uses
          ...(hasUses
            ? {}
            : {
                discountType: values.discountType,
                discountValue:
                  values.discountType === "PERCENTAGE"
                    ? values.discountValue
                    : Math.round(values.discountValue * 100),
              }),
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Promo Code</DialogTitle>
          <DialogDescription>
            Update settings for <span className="font-mono font-bold">{promoCode.code}</span>
          </DialogDescription>
        </DialogHeader>

        {hasUses && (
          <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-sm">
              This code has been used {promoCode.currentUses} times. Discount type and value
              cannot be changed.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* Code (Read Only) */}
            <div>
              <FormLabel>Code</FormLabel>
              <Input
                value={promoCode.code}
                disabled
                className="font-mono bg-muted"
              />
              <FormDescription>Code cannot be changed</FormDescription>
            </div>

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
                    <FormLabel>Discount Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={hasUses}
                    >
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
                      {discountType === "PERCENTAGE" ? "Percentage" : "Amount"}
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
                          disabled={hasUses}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    {hasUses && (
                      <FormDescription>Cannot change (has uses)</FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Usage Stats (Read Only) */}
            {hasUses && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="font-medium mb-1">Usage Summary</p>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  <div>Used: {promoCode.currentUses} times</div>
                  <div>
                    Remaining:{" "}
                    {promoCode.remainingUses === null
                      ? "Unlimited"
                      : promoCode.remainingUses}
                  </div>
                </div>
              </div>
            )}

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
                          min={hasUses ? promoCode.currentUses : 1}
                          placeholder="100"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      {hasUses && (
                        <FormDescription>
                          Minimum: {promoCode.currentUses} (current uses)
                        </FormDescription>
                      )}
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
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
