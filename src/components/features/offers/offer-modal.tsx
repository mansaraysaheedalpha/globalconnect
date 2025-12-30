// src/components/features/offers/offer-modal.tsx
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Tag, TrendingUp, AlertCircle, Package, Sparkles } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { Offer } from "./offer-card";

interface OfferModalProps {
  offer: Offer;
  open: boolean;
  onClose: () => void;
  onPurchase: (offerId: string) => void;
  purchasing?: boolean;
}

export const OfferModal = ({
  offer,
  open,
  onClose,
  onPurchase,
  purchasing = false,
}: OfferModalProps) => {
  const discountPercentage = offer.originalPrice
    ? Math.round(((offer.originalPrice - offer.price) / offer.originalPrice) * 100)
    : 0;

  const isLowStock =
    offer.inventory?.total &&
    offer.inventory.available < offer.inventory.total * 0.2;

  const isSoldOut = offer.inventory && offer.inventory.available <= 0;

  const isExpiringSoon =
    offer.expiresAt &&
    new Date(offer.expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000;

  const formatOfferType = (type: string) => {
    return type.replace(/_/g, " ");
  };

  const getOfferTypeIcon = (type: string) => {
    switch (type) {
      case "TICKET_UPGRADE":
        return <Sparkles className="h-5 w-5" />;
      case "MERCHANDISE":
        return <Package className="h-5 w-5" />;
      case "EXCLUSIVE_CONTENT":
        return <Tag className="h-5 w-5" />;
      default:
        return <Tag className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {/* Image */}
          {offer.imageUrl && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted mb-4 -mt-6 -mx-6">
              <Image
                src={offer.imageUrl}
                alt={offer.title}
                fill
                className="object-cover"
              />
              {discountPercentage > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute top-4 right-4 text-base font-bold px-3 py-1"
                >
                  {discountPercentage}% OFF
                </Badge>
              )}
            </div>
          )}

          {/* Type Badge */}
          <div className="flex items-center gap-2 mb-2">
            {getOfferTypeIcon(offer.offerType)}
            <Badge variant="outline" className="capitalize text-sm">
              {formatOfferType(offer.offerType)}
            </Badge>
          </div>

          <DialogTitle className="text-2xl">{offer.title}</DialogTitle>

          <DialogDescription className="text-base mt-2">
            {offer.description || "No description provided."}
          </DialogDescription>
        </DialogHeader>

        {/* Price Section */}
        <div className="py-4">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-4xl font-bold">
              ${offer.price.toFixed(2)}
            </span>
            {offer.originalPrice && (
              <>
                <span className="text-xl text-muted-foreground line-through">
                  ${offer.originalPrice.toFixed(2)}
                </span>
                <Badge variant="secondary" className="text-sm">
                  Save ${(offer.originalPrice - offer.price).toFixed(2)}
                </Badge>
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{offer.currency}</p>
        </div>

        <Separator />

        {/* Details Section */}
        <div className="space-y-3 py-4">
          {/* Inventory Status */}
          {offer.inventory && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Availability</span>
              </div>
              <div className="text-right">
                {isSoldOut ? (
                  <Badge variant="destructive">Sold Out</Badge>
                ) : isLowStock ? (
                  <span className="text-orange-600 dark:text-orange-400 font-semibold">
                    Only {offer.inventory.available} left!
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    {offer.inventory.total
                      ? `${offer.inventory.available} / ${offer.inventory.total} available`
                      : `${offer.inventory.available} available`}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Sold Count */}
          {offer.inventory && offer.inventory.sold > 0 && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Popularity</span>
              </div>
              <span className="text-muted-foreground">
                {offer.inventory.sold} people purchased this
              </span>
            </div>
          )}

          {/* Expiration */}
          {offer.expiresAt && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Valid Until</span>
              </div>
              <span
                className={
                  isExpiringSoon
                    ? "text-red-600 dark:text-red-400 font-semibold"
                    : "text-muted-foreground"
                }
              >
                {format(new Date(offer.expiresAt), "MMM d, yyyy 'at' h:mm a")}
              </span>
            </div>
          )}
        </div>

        {/* Warnings */}
        {(isExpiringSoon || isLowStock) && !isSoldOut && (
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                  Limited Time Offer
                </h4>
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  {isExpiringSoon &&
                    "This offer expires soon! Don't miss out on this exclusive deal. "}
                  {isLowStock &&
                    "Only a few left in stock. Get yours before it's gone!"}
                </p>
              </div>
            </div>
          </div>
        )}

        <Separator />

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Maybe Later
          </Button>
          <Button
            onClick={() => onPurchase(offer.id)}
            disabled={purchasing || isSoldOut}
            className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
          >
            {purchasing ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Processing...
              </span>
            ) : isSoldOut ? (
              "Sold Out"
            ) : (
              <>
                <Tag className="h-4 w-4 mr-2" />
                Buy Now for ${offer.price.toFixed(2)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
