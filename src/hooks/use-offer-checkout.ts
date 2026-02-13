"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { PURCHASE_OFFER_MUTATION } from "@/graphql/monetization.graphql";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

interface UseOfferCheckoutOptions {
  onSuccess?: (checkoutUrl: string) => void;
  onError?: (error: Error) => void;
}

interface CheckoutResult {
  checkoutSessionId: string;
  stripeCheckoutUrl: string;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: {
      amount: number;
      currency: string;
    };
  };
}

export function useOfferCheckout(options?: UseOfferCheckoutOptions) {
  const [loading, setLoading] = useState(false);

  const [purchaseOffer] = useMutation<{
    purchaseOffer: CheckoutResult;
  }>(PURCHASE_OFFER_MUTATION);

  const initiateCheckout = async (offerId: string, quantity: number = 1) => {
    if (quantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    setLoading(true);

    try {
      logger.info("Initiating checkout", { offerId, quantity });

      const result = await purchaseOffer({
        variables: { offerId, quantity },
      });

      const checkoutUrl = result.data?.purchaseOffer?.stripeCheckoutUrl;
      const checkoutSessionId = result.data?.purchaseOffer?.checkoutSessionId;
      const orderInfo = result.data?.purchaseOffer?.order;

      if (!checkoutUrl) {
        throw new Error("No checkout URL returned from server");
      }

      logger.info("Stripe checkout session created", {
        offerId,
        quantity,
        checkoutSessionId,
      });

      // F3: Preserve checkout state before redirect so we can restore on return
      try {
        sessionStorage.setItem(
          "pendingCheckout",
          JSON.stringify({
            offerId,
            quantity,
            checkoutSessionId,
            orderId: orderInfo?.id,
            orderNumber: orderInfo?.orderNumber,
            timestamp: Date.now(),
          })
        );
      } catch {
        // sessionStorage may be unavailable in some contexts
      }

      // Call success callback if provided
      options?.onSuccess?.(checkoutUrl);

      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      logger.error("Failed to initiate checkout", error, {
        offerId,
        quantity,
      });

      toast.error(`Unable to process checkout: ${errorMessage}`);

      options?.onError?.(
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    initiateCheckout,
    loading,
  };
}