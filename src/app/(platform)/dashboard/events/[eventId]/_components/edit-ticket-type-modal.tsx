// src/app/(platform)/dashboard/events/[eventId]/_components/edit-ticket-type-modal.tsx
"use client";

import React, { useEffect } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader, DollarSign, Ticket, Calendar, AlertTriangle, EyeOff } from "lucide-react";

interface TicketType {
  id: string;
  name: string;
  description: string | null;
  price: {
    amount: number;
    currency: string;
    formatted: string;
  };
  quantityTotal: number | null;
  quantityAvailable: number | null;
  quantitySold: number;
  quantityReserved: number;
  minPerOrder: number;
  maxPerOrder: number;
  salesStartAt: string | null;
  salesEndAt: string | null;
  isActive: boolean;
  isHidden: boolean;
  isOnSale: boolean;
  sortOrder: number;
  revenue: {
    amount: number;
    currency: string;
    formatted: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface EditTicketTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketType: TicketType;
  onSuccess: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  priceAmount: z.coerce
    .number()
    .min(0, "Price cannot be negative")
    .max(999999, "Price is too high"),
  currency: z.string().default("USD"),
  quantityTotal: z.coerce
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .optional()
    .nullable(),
  unlimitedQuantity: z.boolean().default(false),
  minPerOrder: z.coerce.number().int().min(1, "Minimum must be at least 1").default(1),
  maxPerOrder: z.coerce.number().int().min(1, "Maximum must be at least 1").default(10),
  salesStartAt: z.date().optional().nullable(),
  salesEndAt: z.date().optional().nullable(),
  isActive: z.boolean().default(true),
  isHidden: z.boolean().default(false),
});

type TicketTypeFormValues = z.infer<typeof formSchema>;

export const EditTicketTypeModal = ({
  isOpen,
  onClose,
  ticketType,
  onSuccess,
}: EditTicketTypeModalProps) => {
  const hasSales = ticketType.quantitySold > 0;

  const form = useForm<TicketTypeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: ticketType.name,
      description: ticketType.description || "",
      priceAmount: ticketType.price.amount / 100, // Convert from cents
      currency: ticketType.price.currency,
      quantityTotal: ticketType.quantityTotal,
      unlimitedQuantity: ticketType.quantityTotal === null,
      minPerOrder: ticketType.minPerOrder,
      maxPerOrder: ticketType.maxPerOrder,
      salesStartAt: ticketType.salesStartAt ? new Date(ticketType.salesStartAt) : null,
      salesEndAt: ticketType.salesEndAt ? new Date(ticketType.salesEndAt) : null,
      isActive: ticketType.isActive,
      isHidden: ticketType.isHidden ?? false,
    },
  });

  // Reset form when ticketType changes
  useEffect(() => {
    form.reset({
      name: ticketType.name,
      description: ticketType.description || "",
      priceAmount: ticketType.price.amount / 100,
      currency: ticketType.price.currency,
      quantityTotal: ticketType.quantityTotal,
      unlimitedQuantity: ticketType.quantityTotal === null,
      minPerOrder: ticketType.minPerOrder,
      maxPerOrder: ticketType.maxPerOrder,
      salesStartAt: ticketType.salesStartAt ? new Date(ticketType.salesStartAt) : null,
      salesEndAt: ticketType.salesEndAt ? new Date(ticketType.salesEndAt) : null,
      isActive: ticketType.isActive,
      isHidden: ticketType.isHidden ?? false,
    });
  }, [ticketType, form]);

  const [updateTicketType, { loading }] = useMutation(UPDATE_TICKET_TYPE_MUTATION, {
    onCompleted: () => {
      toast.success("Ticket type updated successfully!");
      onSuccess();
    },
    onError: (error) => {
      toast.error("Failed to update ticket type", {
        description: error.message,
      });
    },
  });

  const onSubmit = (values: TicketTypeFormValues) => {
    // Validate min/max per order
    if (values.maxPerOrder < values.minPerOrder) {
      form.setError("maxPerOrder", {
        message: "Maximum must be greater than or equal to minimum",
      });
      return;
    }

    // Validate sales dates
    if (values.salesStartAt && values.salesEndAt && values.salesStartAt >= values.salesEndAt) {
      form.setError("salesEndAt", {
        message: "End date must be after start date",
      });
      return;
    }

    // Validate quantity if there are sales
    if (hasSales && !values.unlimitedQuantity && values.quantityTotal) {
      if (values.quantityTotal < ticketType.quantitySold) {
        form.setError("quantityTotal", {
          message: `Quantity cannot be less than sold tickets (${ticketType.quantitySold})`,
        });
        return;
      }
    }

    updateTicketType({
      variables: {
        id: ticketType.id,
        input: {
          name: values.name,
          description: values.description || null,
          // Only allow price change if no sales
          ...(hasSales
            ? {}
            : {
                price: Math.round(values.priceAmount * 100),
              }),
          quantityTotal: values.unlimitedQuantity ? null : values.quantityTotal,
          minPerOrder: values.minPerOrder,
          maxPerOrder: values.maxPerOrder,
          salesStartAt: values.salesStartAt?.toISOString() || null,
          salesEndAt: values.salesEndAt?.toISOString() || null,
          isActive: values.isActive,
          isHidden: values.isHidden,
        },
      },
    });
  };

  const unlimitedQuantity = form.watch("unlimitedQuantity");
  const priceAmount = form.watch("priceAmount");
  const isFree = priceAmount === 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Ticket Type</DialogTitle>
          <DialogDescription>Update ticket type settings.</DialogDescription>
        </DialogHeader>

        {hasSales && (
          <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-sm">
              This ticket type has {ticketType.quantitySold} sales. Price and currency
              cannot be changed.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., General Admission, VIP, Early Bird" {...field} />
                  </FormControl>
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
                      placeholder="Describe what's included with this ticket..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priceAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="pl-8"
                          disabled={hasSales}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      {isFree ? "This is a free ticket" : ""}
                      {hasSales ? "Cannot change (has sales)" : ""}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:opacity-50"
                        disabled={hasSales}
                        {...field}
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="NGN">NGN (₦)</option>
                        <option value="GHS">GHS (₵)</option>
                        <option value="KES">KES (KSh)</option>
                        <option value="ZAR">ZAR (R)</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Sales Info (Read Only) */}
            {hasSales && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="font-medium mb-1">Sales Summary</p>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  <div>Sold: {ticketType.quantitySold}</div>
                  <div>Reserved: {ticketType.quantityReserved}</div>
                  <div>Revenue: {ticketType.revenue.formatted}</div>
                  <div>
                    Available:{" "}
                    {ticketType.quantityAvailable === null
                      ? "Unlimited"
                      : ticketType.quantityAvailable}
                  </div>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="unlimitedQuantity"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-muted-foreground" />
                      <FormLabel className="font-normal cursor-pointer">
                        Unlimited Quantity
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {!unlimitedQuantity && (
                <FormField
                  control={form.control}
                  name="quantityTotal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Quantity Available</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={hasSales ? ticketType.quantitySold : 1}
                          placeholder="100"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      {hasSales && (
                        <FormDescription>
                          Minimum: {ticketType.quantitySold} (sold tickets)
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Order Limits */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minPerOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Per Order</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxPerOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Per Order</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Sales Window */}
            <div className="space-y-3 pt-2 border-t">
              <p className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Sales Window (Optional)
              </p>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="salesStartAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Sales Start</FormLabel>
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
                  name="salesEndAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Sales End</FormLabel>
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

            {/* Visibility Options */}
            <div className="space-y-3 pt-2 border-t">
              <p className="text-sm font-medium">Visibility Settings</p>
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel className="font-normal cursor-pointer">Active</FormLabel>
                      <FormDescription className="text-xs">
                        Inactive tickets cannot be purchased
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isHidden"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <FormLabel className="font-normal cursor-pointer">Hidden</FormLabel>
                        <FormDescription className="text-xs">
                          Hidden tickets are not shown publicly
                        </FormDescription>
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

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
