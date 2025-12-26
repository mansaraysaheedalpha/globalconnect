// src/app/(platform)/dashboard/events/[eventId]/_components/ticket-management.tsx
"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { toast } from "sonner";
import {
  GET_EVENT_TICKET_TYPES_ADMIN_QUERY,
  GET_EVENT_TICKET_SUMMARY_QUERY,
  DELETE_TICKET_TYPE_MUTATION,
  DUPLICATE_TICKET_TYPE_MUTATION,
} from "@/graphql/payments.graphql";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Ticket,
  DollarSign,
  TrendingUp,
  Tag,
  Calendar,
  Loader,
} from "lucide-react";
import { CreateTicketTypeModal } from "./create-ticket-type-modal";
import { EditTicketTypeModal } from "./edit-ticket-type-modal";
import { PromoCodesManagement } from "./promo-codes-management";

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

interface TicketSummary {
  eventId: string;
  totalTicketTypes: number;
  totalCapacity: number;
  totalSold: number;
  totalRevenue: {
    amount: number;
    currency: string;
    formatted: string;
  };
  ticketTypeStats: Array<{
    ticketTypeId: string;
    ticketTypeName: string;
    quantitySold: number;
    quantityAvailable: number;
    revenue: {
      amount: number;
      currency: string;
      formatted: string;
    };
    percentageSold: number;
  }>;
  salesToday: number;
  salesThisWeek: number;
  salesThisMonth: number;
  revenueToday: { formatted: string };
  revenueThisWeek: { formatted: string };
  revenueThisMonth: { formatted: string };
}

interface TicketManagementProps {
  eventId: string;
}

export const TicketManagement = ({ eventId }: TicketManagementProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTicketType, setEditingTicketType] = useState<TicketType | null>(null);
  const [deletingTicketType, setDeletingTicketType] = useState<TicketType | null>(null);

  // Fetch ticket types
  const {
    data: ticketTypesData,
    loading: ticketTypesLoading,
    refetch: refetchTicketTypes,
  } = useQuery(GET_EVENT_TICKET_TYPES_ADMIN_QUERY, {
    variables: { eventId },
    skip: !eventId,
    fetchPolicy: "cache-and-network",
  });

  // Fetch ticket summary
  const { data: summaryData, loading: summaryLoading, refetch: refetchSummary } = useQuery(
    GET_EVENT_TICKET_SUMMARY_QUERY,
    {
      variables: { eventId },
      skip: !eventId,
      fetchPolicy: "cache-and-network",
    }
  );

  // Refetch both queries
  const refetchAll = () => {
    refetchTicketTypes();
    refetchSummary();
  };

  // Delete mutation
  const [deleteTicketType, { loading: deleting }] = useMutation(
    DELETE_TICKET_TYPE_MUTATION,
    {
      onCompleted: () => {
        toast.success("Ticket type deleted successfully");
        setDeletingTicketType(null);
        refetchAll();
      },
      onError: (error) => {
        toast.error("Failed to delete ticket type", {
          description: error.message,
        });
      },
    }
  );

  // Duplicate mutation
  const [duplicateTicketType, { loading: duplicating }] = useMutation(
    DUPLICATE_TICKET_TYPE_MUTATION,
    {
      onCompleted: () => {
        toast.success("Ticket type duplicated successfully");
        refetchAll();
      },
      onError: (error) => {
        toast.error("Failed to duplicate ticket type", {
          description: error.message,
        });
      },
    }
  );

  const ticketTypes: TicketType[] = ticketTypesData?.eventTicketTypesAdmin || [];
  const summary: TicketSummary | null = summaryData?.eventTicketSummary || null;

  const handleDelete = (ticketType: TicketType) => {
    if (ticketType.quantitySold > 0) {
      toast.error("Cannot delete ticket type with existing sales");
      return;
    }
    setDeletingTicketType(ticketType);
  };

  const confirmDelete = () => {
    if (deletingTicketType) {
      deleteTicketType({ variables: { id: deletingTicketType.id } });
    }
  };

  const handleDuplicate = (ticketType: TicketType) => {
    duplicateTicketType({ variables: { id: ticketType.id } });
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Ticket className="h-4 w-4" />
                  <span className="text-sm">Ticket Types</span>
                </div>
                <p className="text-2xl font-bold">
                  {summary?.totalTicketTypes || ticketTypes.length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Tickets Sold</span>
                </div>
                <p className="text-2xl font-bold">{summary?.totalSold || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Total Revenue</span>
                </div>
                <p className="text-2xl font-bold">
                  {summary?.totalRevenue?.formatted || "$0.00"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Today's Sales</span>
                </div>
                <p className="text-2xl font-bold">{summary?.salesToday || 0}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Tabs for Ticket Types and Promo Codes */}
      <Tabs defaultValue="ticket-types">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="ticket-types">Ticket Types</TabsTrigger>
            <TabsTrigger value="promo-codes">Promo Codes</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="ticket-types" className="mt-0">
          {/* Ticket Types Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Manage Ticket Types</h3>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Ticket Type
            </Button>
          </div>

          {/* Ticket Types List */}
          {ticketTypesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : ticketTypes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Ticket Types Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first ticket type to start selling tickets for this event.
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Ticket Type
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {ticketTypes
                .slice()
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((ticketType) => (
                  <TicketTypeCard
                    key={ticketType.id}
                    ticketType={ticketType}
                    onEdit={() => setEditingTicketType(ticketType)}
                    onDuplicate={() => handleDuplicate(ticketType)}
                    onDelete={() => handleDelete(ticketType)}
                    isDuplicating={duplicating}
                  />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="promo-codes" className="mt-0">
          <PromoCodesManagement eventId={eventId} />
        </TabsContent>
      </Tabs>

      {/* Create Modal */}
      <CreateTicketTypeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        eventId={eventId}
        onSuccess={() => {
          refetchAll();
          setIsCreateModalOpen(false);
        }}
      />

      {/* Edit Modal */}
      {editingTicketType && (
        <EditTicketTypeModal
          isOpen={!!editingTicketType}
          onClose={() => setEditingTicketType(null)}
          ticketType={editingTicketType}
          onSuccess={() => {
            refetchAll();
            setEditingTicketType(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingTicketType}
        onOpenChange={() => setDeletingTicketType(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ticket Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingTicketType?.name}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Ticket Type Card Component
interface TicketTypeCardProps {
  ticketType: TicketType;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  isDuplicating: boolean;
}

const TicketTypeCard = ({
  ticketType,
  onEdit,
  onDuplicate,
  onDelete,
  isDuplicating,
}: TicketTypeCardProps) => {
  const isFree = ticketType.price.amount === 0;
  const hasUnlimitedQuantity = ticketType.quantityTotal === null;
  const soldPercentage = hasUnlimitedQuantity
    ? 0
    : ticketType.quantityTotal
    ? Math.round((ticketType.quantitySold / ticketType.quantityTotal) * 100)
    : 0;

  return (
    <Card className={!ticketType.isActive ? "opacity-60" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            {/* Header Row */}
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-base">{ticketType.name}</h4>
              {!ticketType.isActive && (
                <Badge variant="secondary">Inactive</Badge>
              )}
              {ticketType.isHidden && (
                <Badge variant="outline">Hidden</Badge>
              )}
              {ticketType.isOnSale && (
                <Badge variant="default" className="bg-green-600">
                  On Sale
                </Badge>
              )}
            </div>

            {/* Description */}
            {ticketType.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {ticketType.description}
              </p>
            )}

            {/* Stats Row */}
            <div className="flex items-center gap-4 text-sm">
              {/* Price */}
              <div className="flex items-center gap-1">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {isFree ? "Free" : ticketType.price.formatted}
                </span>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-1">
                <Ticket className="h-4 w-4 text-muted-foreground" />
                <span>
                  {ticketType.quantitySold}
                  {hasUnlimitedQuantity ? (
                    " sold (unlimited)"
                  ) : (
                    <span className="text-muted-foreground">
                      {" "}
                      / {ticketType.quantityTotal} ({soldPercentage}%)
                    </span>
                  )}
                </span>
              </div>

              {/* Revenue */}
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>{ticketType.revenue.formatted}</span>
              </div>
            </div>

            {/* Progress Bar */}
            {!hasUnlimitedQuantity && ticketType.quantityTotal && (
              <div className="w-full max-w-xs bg-muted rounded-full h-2 mt-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(soldPercentage, 100)}%` }}
                />
              </div>
            )}

            {/* Sales Window */}
            {(ticketType.salesStartAt || ticketType.salesEndAt) && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>
                  {ticketType.salesStartAt &&
                    new Date(ticketType.salesStartAt).toLocaleDateString()}
                  {ticketType.salesStartAt && ticketType.salesEndAt && " - "}
                  {ticketType.salesEndAt &&
                    new Date(ticketType.salesEndAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate} disabled={isDuplicating}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
                disabled={ticketType.quantitySold > 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
                {ticketType.quantitySold > 0 && (
                  <span className="ml-2 text-xs">(has sales)</span>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};
