// src/components/features/offers/offer-card.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Tag, TrendingUp, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useOfferTracking } from "@/hooks/use-offer-tracking";
import { useOfferCheckout } from "@/hooks/use-offer-checkout";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export interface Offer {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  offerType: string;
  imageUrl?: string;
  expiresAt?: string;
  inventory?: {
    total?: number;
    available: number;
    sold: number;
  };
  stripePriceId: string;
  placement: string;
  isActive: boolean;
}

interface OfferCardProps {
  offer: Offer;
  onPurchase?: (offerId: string) => void;
  onPurchaseSuccess?: () => void;
  onViewDetails?: (offerId: string) => void;
  loading?: boolean;
  className?: string;
  variant?: "default" | "compact" | "featured";
}

export const OfferCard = ({
  offer,
  onPurchase,
  onPurchaseSuccess,
  onViewDetails,
  loading = false,
  className = "",
  variant = "default",
}: OfferCardProps) => {
  // Analytics tracking
  const { elementRef, trackViewDetailsClick, trackPurchaseClick } = useOfferTracking({
    offerId: offer.id,
    placement: offer.placement,
    price: offer.price,
  });

  // Stripe checkout
  const { initiateCheckout, loading: checkoutLoading } = useOfferCheckout({
    onSuccess: () => {
      onPurchaseSuccess?.();
    },
  });

  const handlePurchase = () => {
    if (isSoldOut) {
      toast.error("This offer is sold out");
      return;
    }

    trackPurchaseClick();

    // If custom onPurchase callback provided, use it (for backward compatibility)
    if (onPurchase) {
      onPurchase(offer.id);
    } else {
      // Otherwise use Stripe checkout
      initiateCheckout(offer.id, 1);
    }
  };

  const isLoading = loading || checkoutLoading;

  const discountPercentage = offer.originalPrice
    ? Math.round(((offer.originalPrice - offer.price) / offer.originalPrice) * 100)
    : 0;

  const isLowStock =
    offer.inventory?.total &&
    offer.inventory.available < offer.inventory.total * 0.2;

  const isSoldOut = offer.inventory && offer.inventory.available <= 0;

  const isExpiringSoon =
    offer.expiresAt &&
    new Date(offer.expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000; // 24 hours

  const formatOfferType = (type: string) => {
    return type.replace(/_/g, " ");
  };

  if (variant === "compact") {
    return (
      <Card ref={elementRef as any} className={cn("hover:shadow-md transition-all duration-200", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {offer.imageUrl && (
              <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden">
                <Image
                  src={offer.imageUrl}
                  alt={offer.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate">{offer.title}</h4>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-bold">
                  ${offer.price.toFixed(2)}
                </span>
                {offer.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    ${offer.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            <Button
              onClick={handlePurchase}
              disabled={isLoading || isSoldOut}
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : isSoldOut ? (
                "Sold Out"
              ) : (
                "Buy"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      ref={elementRef as any}
      className={cn(
        "overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col",
        variant === "featured" && "border-primary border-2",
        isSoldOut && "opacity-60",
        className
      )}
    >
      {/* Image */}
      {offer.imageUrl && (
        <div className="relative w-full aspect-video bg-muted">
          <Image
            src={offer.imageUrl}
            alt={offer.title}
            fill
            className="object-cover"
          />
          {discountPercentage > 0 && (
            <Badge
              variant="destructive"
              className="absolute top-2 right-2 text-sm font-bold"
            >
              {discountPercentage}% OFF
            </Badge>
          )}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                SOLD OUT
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardHeader>
        {/* Type Badge */}
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="capitalize">
            {formatOfferType(offer.offerType)}
          </Badge>
          {variant === "featured" && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500">
              Featured
            </Badge>
          )}
        </div>

        {/* Title */}
        <CardTitle className={cn(variant === "featured" ? "text-xl" : "text-lg")}>
          {offer.title}
        </CardTitle>

        {/* Description */}
        <CardDescription className="line-clamp-2 mt-2">
          {offer.description || "No description provided."}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-bold">
            ${offer.price.toFixed(2)}
          </span>
          {offer.originalPrice && (
            <span className="text-lg text-muted-foreground line-through">
              ${offer.originalPrice.toFixed(2)}
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            {offer.currency}
          </span>
        </div>

        {/* Alerts */}
        <div className="space-y-2">
          {/* Low Stock Warning */}
          {isLowStock && !isSoldOut && (
            <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
              <AlertCircle className="h-4 w-4" />
              <span>
                Only {offer.inventory?.available} left in stock!
              </span>
            </div>
          )}

          {/* Expiring Soon */}
          {isExpiringSoon && !isSoldOut && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <Clock className="h-4 w-4" />
              <span>
                Expires {format(new Date(offer.expiresAt!), "MMM d 'at' h:mm a")}
              </span>
            </div>
          )}

          {/* Sold Count */}
          {offer.inventory && offer.inventory.sold > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>{offer.inventory.sold} sold</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t pt-4 flex gap-2">
        {onViewDetails && (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              trackViewDetailsClick();
              onViewDetails(offer.id);
            }}
            disabled={loading}
          >
            View Details
          </Button>
        )}
        <Button
          className={cn("flex-1", variant === "featured" && "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600")}
          onClick={handlePurchase}
          disabled={isLoading || isSoldOut}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </span>
          ) : isSoldOut ? (
            "Sold Out"
          ) : (
            <>
              <Tag className="h-4 w-4 mr-2" />
              Buy Now
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};