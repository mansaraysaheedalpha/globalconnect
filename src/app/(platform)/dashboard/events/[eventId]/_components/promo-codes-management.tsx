// src/app/(platform)/dashboard/events/[eventId]/_components/promo-codes-management.tsx
"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { toast } from "sonner";
import {
  GET_EVENT_PROMO_CODES_QUERY,
  DELETE_PROMO_CODE_MUTATION,
  DEACTIVATE_PROMO_CODE_MUTATION,
} from "@/graphql/payments.graphql";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Tag,
  Copy,
  Percent,
  DollarSign,
  Calendar,
  Users,
  Loader,
  PowerOff,
  Check,
} from "lucide-react";
import { CreatePromoCodeModal } from "./create-promo-code-modal";
import { EditPromoCodeModal } from "./edit-promo-code-modal";

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

interface PromoCodesManagementProps {
  eventId: string;
}

export const PromoCodesManagement = ({ eventId }: PromoCodesManagementProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);
  const [deletingPromoCode, setDeletingPromoCode] = useState<PromoCode | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Fetch promo codes
  const {
    data: promoCodesData,
    loading: promoCodesLoading,
    refetch: refetchPromoCodes,
  } = useQuery(GET_EVENT_PROMO_CODES_QUERY, {
    variables: { eventId },
    skip: !eventId,
  });

  // Delete mutation
  const [deletePromoCode, { loading: deleting }] = useMutation(
    DELETE_PROMO_CODE_MUTATION,
    {
      onCompleted: () => {
        toast.success("Promo code deleted successfully");
        setDeletingPromoCode(null);
        refetchPromoCodes();
      },
      onError: (error) => {
        toast.error("Failed to delete promo code", {
          description: error.message,
        });
      },
    }
  );

  // Deactivate mutation
  const [deactivatePromoCode, { loading: deactivating }] = useMutation(
    DEACTIVATE_PROMO_CODE_MUTATION,
    {
      onCompleted: () => {
        toast.success("Promo code deactivated");
        refetchPromoCodes();
      },
      onError: (error) => {
        toast.error("Failed to deactivate promo code", {
          description: error.message,
        });
      },
    }
  );

  const promoCodes: PromoCode[] = promoCodesData?.eventPromoCodes || [];

  const handleDelete = (promoCode: PromoCode) => {
    if (promoCode.currentUses > 0) {
      toast.error("Cannot delete promo code that has been used. Deactivate it instead.");
      return;
    }
    setDeletingPromoCode(promoCode);
  };

  const confirmDelete = () => {
    if (deletingPromoCode) {
      deletePromoCode({ variables: { id: deletingPromoCode.id } });
    }
  };

  const handleDeactivate = (promoCode: PromoCode) => {
    deactivatePromoCode({ variables: { id: promoCode.id } });
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success("Code copied to clipboard");
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Manage Promo Codes</h3>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Promo Code
        </Button>
      </div>

      {/* Promo Codes List */}
      {promoCodesLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : promoCodes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Promo Codes Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create promo codes to offer discounts to your attendees.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Promo Code
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {promoCodes.map((promoCode) => (
            <PromoCodeCard
              key={promoCode.id}
              promoCode={promoCode}
              onEdit={() => setEditingPromoCode(promoCode)}
              onDelete={() => handleDelete(promoCode)}
              onDeactivate={() => handleDeactivate(promoCode)}
              onCopy={() => handleCopyCode(promoCode.code)}
              isCopied={copiedCode === promoCode.code}
              isDeactivating={deactivating}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreatePromoCodeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        eventId={eventId}
        onSuccess={() => {
          refetchPromoCodes();
          setIsCreateModalOpen(false);
        }}
      />

      {/* Edit Modal */}
      {editingPromoCode && (
        <EditPromoCodeModal
          isOpen={!!editingPromoCode}
          onClose={() => setEditingPromoCode(null)}
          promoCode={editingPromoCode}
          eventId={eventId}
          onSuccess={() => {
            refetchPromoCodes();
            setEditingPromoCode(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingPromoCode}
        onOpenChange={() => setDeletingPromoCode(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Promo Code</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingPromoCode?.code}"? This action
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

// Promo Code Card Component
interface PromoCodeCardProps {
  promoCode: PromoCode;
  onEdit: () => void;
  onDelete: () => void;
  onDeactivate: () => void;
  onCopy: () => void;
  isCopied: boolean;
  isDeactivating: boolean;
}

const PromoCodeCard = ({
  promoCode,
  onEdit,
  onDelete,
  onDeactivate,
  onCopy,
  isCopied,
  isDeactivating,
}: PromoCodeCardProps) => {
  const isPercentage = promoCode.discountType === "PERCENTAGE";
  const hasUnlimitedUses = promoCode.maxUses === null;

  return (
    <Card className={!promoCode.isActive ? "opacity-60" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            {/* Header Row */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={onCopy}
                className="font-mono font-semibold text-base bg-muted px-2 py-1 rounded hover:bg-muted/80 transition-colors flex items-center gap-2"
              >
                {promoCode.code}
                {isCopied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3 text-muted-foreground" />
                )}
              </button>
              {!promoCode.isActive && (
                <Badge variant="secondary">Inactive</Badge>
              )}
              {promoCode.isCurrentlyValid && promoCode.isActive && (
                <Badge variant="default" className="bg-green-600">
                  Valid
                </Badge>
              )}
              {!promoCode.isCurrentlyValid && promoCode.isActive && (
                <Badge variant="outline">Expired</Badge>
              )}
            </div>

            {/* Description */}
            {promoCode.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {promoCode.description}
              </p>
            )}

            {/* Stats Row */}
            <div className="flex items-center gap-4 text-sm flex-wrap">
              {/* Discount */}
              <div className="flex items-center gap-1">
                {isPercentage ? (
                  <Percent className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">{promoCode.discountFormatted}</span>
              </div>

              {/* Usage */}
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  {promoCode.currentUses}
                  {hasUnlimitedUses ? (
                    " uses (unlimited)"
                  ) : (
                    <span className="text-muted-foreground">
                      {" "}
                      / {promoCode.maxUses}
                    </span>
                  )}
                </span>
              </div>

              {/* Validity Period */}
              {(promoCode.validFrom || promoCode.validUntil) && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {promoCode.validFrom &&
                      new Date(promoCode.validFrom).toLocaleDateString()}
                    {promoCode.validFrom && promoCode.validUntil && " - "}
                    {promoCode.validUntil &&
                      new Date(promoCode.validUntil).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Applicable Ticket Types */}
            {promoCode.applicableTicketTypes.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">Applies to:</span>
                {promoCode.applicableTicketTypes.map((tt) => (
                  <Badge key={tt.id} variant="outline" className="text-xs">
                    {tt.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Minimum Requirements */}
            {(promoCode.minimumOrderAmount || promoCode.minimumTickets) && (
              <div className="text-xs text-muted-foreground">
                {promoCode.minimumOrderAmount && (
                  <span>Min order: {promoCode.minimumOrderAmount.formatted}</span>
                )}
                {promoCode.minimumOrderAmount && promoCode.minimumTickets && " • "}
                {promoCode.minimumTickets && (
                  <span>Min tickets: {promoCode.minimumTickets}</span>
                )}
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
              <DropdownMenuItem onClick={onCopy}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {promoCode.isActive && (
                <DropdownMenuItem onClick={onDeactivate} disabled={isDeactivating}>
                  <PowerOff className="h-4 w-4 mr-2" />
                  Deactivate
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
                disabled={promoCode.currentUses > 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
                {promoCode.currentUses > 0 && (
                  <span className="ml-2 text-xs">(has uses)</span>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};
