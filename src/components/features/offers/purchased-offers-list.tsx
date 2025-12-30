// src/components/features/offers/purchased-offers-list.tsx
"use client";

import React from "react";
import { useQuery } from "@apollo/client";
import { GET_MY_PURCHASED_OFFERS_QUERY } from "@/graphql/monetization.graphql";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingBag,
  Download,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

interface PurchasedOffersListProps {
  eventId: string;
  variant?: "default" | "compact";
}

export const PurchasedOffersList = ({
  eventId,
  variant = "default",
}: PurchasedOffersListProps) => {
  const { data, loading, error, refetch } = useQuery(
    GET_MY_PURCHASED_OFFERS_QUERY,
    {
      variables: { eventId },
      fetchPolicy: "cache-and-network",
    }
  );

  const getFulfillmentStatusBadge = (status: string) => {
    switch (status) {
      case "FULFILLED":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Fulfilled
          </Badge>
        );
      case "PROCESSING":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="outline">
            <Package className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case "REFUNDED":
        return (
          <Badge variant="secondary">
            <XCircle className="h-3 w-3 mr-1" />
            Refunded
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFulfillmentTypeIcon = (type: string) => {
    switch (type) {
      case "DIGITAL":
        return <Download className="h-5 w-5" />;
      case "PHYSICAL":
        return <Package className="h-5 w-5" />;
      case "SERVICE":
        return <CheckCircle className="h-5 w-5" />;
      case "TICKET":
        return <ShoppingBag className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Skeleton className="h-20 w-20 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold">Failed to load purchases</h3>
          <p className="text-muted-foreground text-center max-w-sm mb-4">
            {error.message}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const purchases = data?.myPurchasedOffers || [];

  if (purchases.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">No purchases yet</h3>
          <p className="text-muted-foreground text-center max-w-xs">
            Your purchased offers and upgrades will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <div className="space-y-2">
        {purchases.map((purchase: any) => (
          <Card key={purchase.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {purchase.offer.imageUrl && (
                    <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={purchase.offer.imageUrl}
                        alt={purchase.offer.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-sm">
                      {purchase.offer.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      ${purchase.totalPrice.toFixed(2)} • Qty: {purchase.quantity}
                    </p>
                  </div>
                </div>
                {getFulfillmentStatusBadge(purchase.fulfillmentStatus)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {purchases.map((purchase: any) => (
        <Card key={purchase.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                {purchase.offer.imageUrl && (
                  <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={purchase.offer.imageUrl}
                      alt={purchase.offer.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <CardTitle className="text-lg mb-1">
                    {purchase.offer.title}
                  </CardTitle>
                  <CardDescription>
                    {purchase.offer.description}
                  </CardDescription>
                </div>
              </div>
              {getFulfillmentStatusBadge(purchase.fulfillmentStatus)}
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {/* Quantity */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Quantity</p>
                <p className="font-semibold">{purchase.quantity}</p>
              </div>

              {/* Price */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Price</p>
                <p className="font-semibold">
                  ${purchase.totalPrice.toFixed(2)} {purchase.currency}
                </p>
              </div>

              {/* Purchase Date */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Purchased On
                </p>
                <p className="font-semibold">
                  {format(new Date(purchase.purchasedAt), "MMM d, yyyy")}
                </p>
              </div>

              {/* Fulfillment Type */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Type</p>
                <div className="flex items-center gap-2">
                  {getFulfillmentTypeIcon(purchase.fulfillmentType)}
                  <span className="font-semibold capitalize">
                    {purchase.fulfillmentType?.toLowerCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Fulfillment Details */}
            {purchase.fulfillmentStatus === "FULFILLED" && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                {/* Digital Content */}
                {purchase.digitalContent && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Download className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="font-semibold text-green-900 dark:text-green-100">
                        Digital Content Ready
                      </span>
                    </div>

                    {purchase.digitalContent.accessCode && (
                      <div>
                        <p className="text-xs text-green-800 dark:text-green-200 mb-1">
                          Access Code:
                        </p>
                        <code className="px-3 py-2 bg-white dark:bg-gray-900 rounded border text-sm font-mono">
                          {purchase.digitalContent.accessCode}
                        </code>
                      </div>
                    )}

                    {purchase.digitalContent.downloadUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        asChild
                      >
                        <a
                          href={purchase.digitalContent.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Content
                        </a>
                      </Button>
                    )}
                  </div>
                )}

                {/* Physical Tracking */}
                {purchase.trackingNumber && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="font-semibold text-green-900 dark:text-green-100">
                        Shipped
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-green-800 dark:text-green-200 mb-1">
                        Tracking Number:
                      </p>
                      <code className="px-3 py-2 bg-white dark:bg-gray-900 rounded border text-sm font-mono">
                        {purchase.trackingNumber}
                      </code>
                    </div>
                  </div>
                )}

                {purchase.fulfilledAt && (
                  <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                    Fulfilled on {format(new Date(purchase.fulfilledAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                )}
              </div>
            )}

            {/* Processing Status */}
            {purchase.fulfillmentStatus === "PROCESSING" && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-900 dark:text-blue-100">
                    Your order is being processed. You'll receive a notification when it's ready.
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
