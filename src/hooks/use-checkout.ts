// src/hooks/use-checkout.ts
'use client';

import { useState, useCallback, useMemo } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  GET_EVENT_TICKET_TYPES_QUERY,
  CREATE_CHECKOUT_SESSION_MUTATION,
  APPLY_PROMO_CODE_MUTATION,
  REMOVE_PROMO_CODE_MUTATION,
  CANCEL_ORDER_MUTATION,
} from '@/graphql/payments.graphql';
import {
  TicketType,
  CartItem,
  CheckoutSession,
  Order,
  PaymentIntent,
} from '@/types/payment.types';
import { useAuthStore } from '@/store/auth.store';
import { formatAmount } from '@/lib/stripe';

interface UseCheckoutOptions {
  eventId: string;
}

interface UseCheckoutReturn {
  // Ticket types
  ticketTypes: TicketType[];
  ticketTypesLoading: boolean;
  ticketTypesError?: Error;

  // Cart state
  cart: CartItem[];
  cartTotal: number;
  cartCurrency: string;
  cartTotalFormatted: string;

  // Cart actions
  addToCart: (ticketType: TicketType, quantity?: number) => void;
  removeFromCart: (ticketTypeId: string) => void;
  updateQuantity: (ticketTypeId: string, quantity: number) => void;
  clearCart: () => void;

  // Checkout state
  checkoutSession: CheckoutSession | null;
  order: Order | null;
  paymentIntent: PaymentIntent | null;
  isCreatingCheckout: boolean;
  checkoutError: string | null;

  // Checkout actions
  createCheckout: (guestInfo?: GuestInfo) => Promise<CheckoutSession | null>;
  cancelCheckout: () => Promise<void>;

  // Promo code
  promoCode: string;
  promoCodeApplied: boolean;
  isApplyingPromo: boolean;
  promoError: string | null;
  setPromoCode: (code: string) => void;
  applyPromoCode: () => Promise<void>;
  removePromoCode: () => Promise<void>;
}

interface GuestInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export function useCheckout({ eventId }: UseCheckoutOptions): UseCheckoutReturn {
  const { user } = useAuthStore();

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);

  // Checkout state
  const [checkoutSession, setCheckoutSession] = useState<CheckoutSession | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeApplied, setPromoCodeApplied] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Fetch ticket types
  const {
    data: ticketTypesData,
    loading: ticketTypesLoading,
    error: ticketTypesError,
  } = useQuery(GET_EVENT_TICKET_TYPES_QUERY, {
    variables: { eventId },
    skip: !eventId,
  });

  const ticketTypes: TicketType[] = useMemo(() => {
    return ticketTypesData?.eventTicketTypes || [];
  }, [ticketTypesData]);

  // Mutations
  const [createCheckoutSession, { loading: isCreatingCheckout }] = useMutation(
    CREATE_CHECKOUT_SESSION_MUTATION
  );

  const [applyPromoMutation, { loading: isApplyingPromo }] = useMutation(
    APPLY_PROMO_CODE_MUTATION
  );

  const [removePromoMutation] = useMutation(REMOVE_PROMO_CODE_MUTATION);

  const [cancelOrderMutation] = useMutation(CANCEL_ORDER_MUTATION);

  // Calculate cart totals
  const { cartTotal, cartCurrency, cartTotalFormatted } = useMemo(() => {
    if (cart.length === 0) {
      return { cartTotal: 0, cartCurrency: 'USD', cartTotalFormatted: '$0.00' };
    }

    const currency = cart[0]?.ticketType.price.currency || 'USD';
    const total = cart.reduce((sum, item) => {
      return sum + item.ticketType.price.amount * item.quantity;
    }, 0);

    return {
      cartTotal: total,
      cartCurrency: currency,
      cartTotalFormatted: formatAmount(total, currency),
    };
  }, [cart]);

  // Cart actions
  const addToCart = useCallback((ticketType: TicketType, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.ticketTypeId === ticketType.id);

      if (existing) {
        // Update quantity, respecting max limit
        const newQuantity = Math.min(
          existing.quantity + quantity,
          ticketType.maxPerOrder
        );
        return prev.map((item) =>
          item.ticketTypeId === ticketType.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      // Add new item
      return [
        ...prev,
        {
          ticketTypeId: ticketType.id,
          ticketType,
          quantity: Math.min(quantity, ticketType.maxPerOrder),
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((ticketTypeId: string) => {
    setCart((prev) => prev.filter((item) => item.ticketTypeId !== ticketTypeId));
  }, []);

  const updateQuantity = useCallback((ticketTypeId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(ticketTypeId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.ticketTypeId !== ticketTypeId) return item;

        const maxQuantity = item.ticketType.maxPerOrder;
        const minQuantity = item.ticketType.minPerOrder;
        const validQuantity = Math.max(minQuantity, Math.min(quantity, maxQuantity));

        return { ...item, quantity: validQuantity };
      })
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    setCheckoutSession(null);
    setCheckoutError(null);
    setPromoCode('');
    setPromoCodeApplied(false);
    setPromoError(null);
  }, []);

  // Create checkout session
  const createCheckout = useCallback(
    async (guestInfo?: GuestInfo): Promise<CheckoutSession | null> => {
      if (cart.length === 0) {
        setCheckoutError('Your cart is empty');
        return null;
      }

      setCheckoutError(null);

      try {
        const input = {
          eventId,
          items: cart.map((item) => ({
            ticketTypeId: item.ticketTypeId,
            quantity: item.quantity,
          })),
          promoCode: promoCodeApplied ? promoCode : undefined,
          // Guest info (only if not logged in)
          ...(guestInfo && !user
            ? {
                guestEmail: guestInfo.email,
                guestFirstName: guestInfo.firstName,
                guestLastName: guestInfo.lastName,
                guestPhone: guestInfo.phone,
              }
            : {}),
        };

        const { data } = await createCheckoutSession({
          variables: { input },
        });

        if (data?.createCheckoutSession) {
          setCheckoutSession(data.createCheckoutSession);
          return data.createCheckoutSession;
        }

        return null;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create checkout';
        setCheckoutError(message);
        return null;
      }
    },
    [cart, eventId, promoCode, promoCodeApplied, user, createCheckoutSession]
  );

  // Cancel checkout
  const cancelCheckout = useCallback(async () => {
    if (!checkoutSession?.order?.id) return;

    try {
      await cancelOrderMutation({
        variables: { orderId: checkoutSession.order.id },
      });
      setCheckoutSession(null);
    } catch (error) {
      console.error('Failed to cancel order:', error);
    }
  }, [checkoutSession, cancelOrderMutation]);

  // Apply promo code
  const applyPromoCodeAction = useCallback(async () => {
    if (!checkoutSession?.order?.id || !promoCode.trim()) {
      setPromoError('Enter a promo code');
      return;
    }

    setPromoError(null);

    try {
      const { data } = await applyPromoMutation({
        variables: {
          orderId: checkoutSession.order.id,
          promoCode: promoCode.trim().toUpperCase(),
        },
      });

      if (data?.applyPromoCode) {
        setPromoCodeApplied(true);
        // Update order in checkout session
        setCheckoutSession((prev) =>
          prev
            ? {
                ...prev,
                order: {
                  ...prev.order,
                  ...data.applyPromoCode,
                },
              }
            : null
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid promo code';
      setPromoError(message);
    }
  }, [checkoutSession, promoCode, applyPromoMutation]);

  // Remove promo code
  const removePromoCodeAction = useCallback(async () => {
    if (!checkoutSession?.order?.id) return;

    try {
      const { data } = await removePromoMutation({
        variables: { orderId: checkoutSession.order.id },
      });

      if (data?.removePromoCode) {
        setPromoCode('');
        setPromoCodeApplied(false);
        setPromoError(null);
        // Update order in checkout session
        setCheckoutSession((prev) =>
          prev
            ? {
                ...prev,
                order: {
                  ...prev.order,
                  ...data.removePromoCode,
                },
              }
            : null
        );
      }
    } catch (error) {
      console.error('Failed to remove promo code:', error);
    }
  }, [checkoutSession, removePromoMutation]);

  return {
    // Ticket types
    ticketTypes,
    ticketTypesLoading,
    ticketTypesError: ticketTypesError as Error | undefined,

    // Cart state
    cart,
    cartTotal,
    cartCurrency,
    cartTotalFormatted,

    // Cart actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,

    // Checkout state
    checkoutSession,
    order: checkoutSession?.order || null,
    paymentIntent: checkoutSession?.paymentIntent || null,
    isCreatingCheckout,
    checkoutError,

    // Checkout actions
    createCheckout,
    cancelCheckout,

    // Promo code
    promoCode,
    promoCodeApplied,
    isApplyingPromo,
    promoError,
    setPromoCode,
    applyPromoCode: applyPromoCodeAction,
    removePromoCode: removePromoCodeAction,
  };
}
