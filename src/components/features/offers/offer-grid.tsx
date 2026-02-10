// src/components/features/offers/offer-grid.tsx
"use client";

import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { useOfflineQuery } from "@/hooks/use-offline-query";
import { GET_ACTIVE_OFFERS_QUERY, PURCHASE_OFFER_MUTATION } from "@/graphql/monetization.graphql";
import { OfferCard, Offer } from "./offer-card";
import { OfferModal } from "./offer-modal";
import { Loader2, ShoppingBag, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface OfferGridProps {
  eventId: string;
  sessionId?: string;
  placement: "CHECKOUT" | "POST_PURCHASE" | "IN_EVENT" | "EMAIL";
  variant?: "default" | "compact" | "featured";
  limit?: number;
  className?: string;
}

export const OfferGrid = ({
  eventId,
  sessionId,
  placement,
  variant = "default",
  limit,
  className = "",
}: OfferGridProps) => {
  const router = useRouter();
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [purchasingOfferId, setPurchasingOfferId] = useState<string | null>(null);

  // Fetch active offers
  const { data, loading, error, refetch } = useOfflineQuery(GET_ACTIVE_OFFERS_QUERY, {
    variables: {
      eventId,
      sessionId,
      placement,
    },
    offlineKey: `offers-${eventId}-${placement}`,
  });

  // Purchase offer mutation
  const [purchaseOffer] = useMutation(PURCHASE_OFFER_MUTATION, {
    onCompleted: (data) => {
      const { stripeCheckoutUrl, order } = data.purchaseOffer;

      if (order.totalAmount.amount === 0) {
        // Free offer
        toast.success("Offer claimed successfully!");
        refetch();
      } else {
        // Redirect to Stripe checkout
        window.location.href = stripeCheckoutUrl;
      }
    },
    onError: (error) => {
      toast.error("Failed to purchase offer", {
        description: error.message,
      });
      setPurchasingOfferId(null);
    },
  });

  const handlePurchase = async (offerId: string) => {
    setPurchasingOfferId(offerId);
    try {
      await purchaseOffer({
        variables: {
          offerId,
          quantity: 1,
        },
      });
    } catch (error) {
      // Error handled in onError
    }
  };

  const handleViewDetails = (offerId: string) => {
    const offer = offers.find((o: Offer) => o.id === offerId);
    if (offer) {
      setSelectedOffer(offer);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold">Failed to load offers</h3>
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

  const offers: Offer[] = data?.activeOffers || [];
  const displayedOffers = limit ? offers.slice(0, limit) : offers;

  if (offers.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">No offers available</h3>
          <p className="text-muted-foreground text-center max-w-xs">
            Check back later for exclusive deals and upgrades.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div
        className={`grid gap-4 ${
          variant === "compact"
            ? "grid-cols-1"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        } ${className}`}
      >
        {displayedOffers.map((offer: Offer, index: number) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            onPurchase={handlePurchase}
            onViewDetails={handleViewDetails}
            loading={purchasingOfferId === offer.id}
            variant={index === 0 && variant === "featured" ? "featured" : variant}
          />
        ))}
      </div>

      {/* Offer Detail Modal */}
      {selectedOffer && (
        <OfferModal
          offer={selectedOffer}
          open={!!selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onPurchase={handlePurchase}
          purchasing={purchasingOfferId === selectedOffer.id}
        />
      )}
    </>
  );
};