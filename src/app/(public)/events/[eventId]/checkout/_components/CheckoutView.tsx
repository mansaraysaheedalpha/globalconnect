// src/app/(public)/events/[eventId]/checkout/_components/CheckoutView.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { GET_PUBLIC_EVENT_DETAILS_QUERY } from '@/graphql/public.graphql';
import { useCheckout } from '@/hooks/use-checkout';
import { useAuthStore } from '@/store/auth.store';
import { StripeCheckoutProvider } from '@/components/providers/stripe-provider';
import {
  TicketSelector,
  CartSummary,
  PaymentForm,
  GuestCheckoutForm,
} from '@/components/features/checkout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Clock,
  Ticket,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

type CheckoutStep = 'tickets' | 'details' | 'payment' | 'confirmation';

export function CheckoutView({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const isAuthenticated = !!token && !!user;

  const [step, setStep] = useState<CheckoutStep>('tickets');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Fetch event details
  const {
    data: eventData,
    loading: eventLoading,
    error: eventError,
  } = useQuery(GET_PUBLIC_EVENT_DETAILS_QUERY, {
    variables: { eventId },
    skip: !eventId,
  });

  // Checkout hook
  const {
    ticketTypes,
    ticketTypesLoading,
    cart,
    cartTotal,
    cartCurrency,
    cartTotalFormatted,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    checkoutSession,
    order,
    paymentIntent,
    isCreatingCheckout,
    checkoutError,
    createCheckout,
    cancelCheckout,
    promoCode,
    promoCodeApplied,
    isApplyingPromo,
    promoError,
    setPromoCode,
    applyPromoCode,
    removePromoCode,
  } = useCheckout({ eventId });

  const event = eventData?.event;
  const isFreeOrder = cartTotal === 0 || (order?.totalAmount?.amount ?? 0) === 0;

  // Handle step transitions
  const handleProceedToCheckout = async () => {
    if (cart.length === 0) return;

    if (isAuthenticated) {
      // Logged-in user - create checkout directly
      const session = await createCheckout();
      if (session) {
        // Check if free using the returned session data (not stale state)
        const orderTotal = session.order?.totalAmount?.amount ?? 0;
        if (orderTotal === 0) {
          // Free order - go straight to confirmation
          setStep('confirmation');
        } else {
          // Paid order - go to payment
          setStep('payment');
        }
      }
    } else {
      // Guest - need contact info first
      setStep('details');
    }
  };

  const handleGuestSubmit = async (guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  }) => {
    const session = await createCheckout(guestInfo);
    if (session) {
      // Check if free using the returned session data (not stale state)
      const orderTotal = session.order?.totalAmount?.amount ?? 0;
      if (orderTotal === 0) {
        setStep('confirmation');
      } else {
        setStep('payment');
      }
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    // Payment succeeded - redirect to confirmation
    router.push(`/events/${eventId}/checkout/confirmation?order=${order?.orderNumber}`);
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
  };

  const handleBackToTickets = async () => {
    if (checkoutSession) {
      await cancelCheckout();
    }
    setStep('tickets');
    setPaymentError(null);
  };

  // Loading state
  if (eventLoading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-40 rounded-lg" />
              <Skeleton className="h-40 rounded-lg" />
            </div>
            <Skeleton className="h-80 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (eventError || !event) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Event Not Found</h2>
            <p className="text-muted-foreground mb-4">
              This event may not exist or is no longer available.
            </p>
            <Button asChild>
              <Link href="/events">Browse Events</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Free order confirmation (skip payment)
  if (step === 'confirmation' && isFreeOrder && order) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container max-w-2xl mx-auto px-4 py-12">
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/30">
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-6" />
              <h1 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
                Registration Complete!
              </h1>
              <p className="text-muted-foreground mb-6">
                You're all set for <span className="font-medium">{event.name}</span>
              </p>
              <div className="bg-white dark:bg-background rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                <p className="text-xl font-mono font-bold">{order.orderNumber}</p>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                A confirmation email has been sent to{' '}
                <span className="font-medium">{order.customerEmail}</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link href={`/attendee/events/${eventId}`}>View My Ticket</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/events">Browse More Events</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-40">
        <div className="container max-w-6xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={step === 'tickets' ? () => router.back() : handleBackToTickets}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {step === 'tickets' ? 'Back to Event' : 'Back to Tickets'}
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              <span className="font-semibold">Checkout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Event Info Banner */}
        <Card className="mb-8">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold mb-1">{event.name}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    {format(parseISO(event.startDate), 'EEE, MMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(parseISO(event.startDate), 'h:mm a')}
                  </span>
                  {event.venue?.name && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.venue.name}
                    </span>
                  )}
                </div>
              </div>
              <Badge variant="outline" className="self-start">
                {step === 'tickets' && 'Select Tickets'}
                {step === 'details' && 'Your Details'}
                {step === 'payment' && 'Payment'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Step: Select Tickets */}
        {step === 'tickets' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="h-5 w-5" />
                    Select Tickets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TicketSelector
                    ticketTypes={ticketTypes}
                    cart={cart}
                    onAddToCart={addToCart}
                    onUpdateQuantity={updateQuantity}
                    onRemoveFromCart={removeFromCart}
                    isLoading={ticketTypesLoading}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <CartSummary
                  cart={cart}
                  cartTotal={cartTotal}
                  cartCurrency={cartCurrency}
                  cartTotalFormatted={cartTotalFormatted}
                  onRemoveFromCart={removeFromCart}
                  onClearCart={clearCart}
                  onProceedToCheckout={handleProceedToCheckout}
                  isLoading={isCreatingCheckout}
                  disabled={cart.length === 0}
                />

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Secure checkout powered by Stripe</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step: Guest Details */}
        {step === 'details' && !isAuthenticated && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <GuestCheckoutForm
                onSubmit={handleGuestSubmit}
                isLoading={isCreatingCheckout}
                error={checkoutError}
              />
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <CartSummary
                  cart={cart}
                  cartTotal={cartTotal}
                  cartCurrency={cartCurrency}
                  cartTotalFormatted={cartTotalFormatted}
                  onRemoveFromCart={removeFromCart}
                  onClearCart={clearCart}
                  onProceedToCheckout={() => {}}
                  disabled={true}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step: Payment */}
        {step === 'payment' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {order && (
                <div className="lg:hidden mb-4 flex items-center justify-between rounded-lg border bg-card p-3 shadow-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-lg font-semibold">{order.totalAmount?.formatted}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Secure payment
                  </Badge>
                </div>
              )}

              {paymentError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{paymentError}</AlertDescription>
                </Alert>
              )}

              {checkoutError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{checkoutError}</AlertDescription>
                </Alert>
              )}

              <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-sm">
                {order && paymentIntent ? (
                  <StripeCheckoutProvider clientSecret={paymentIntent.clientSecret}>
                    <PaymentForm
                      order={order}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentError={handlePaymentError}
                      returnUrl={`${window.location.origin}/events/${eventId}/checkout/confirmation?order=${order.orderNumber}`}
                    />
                  </StripeCheckoutProvider>
                ) : !checkoutError ? (
                  <div className="py-8 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Payment Setup Failed</h3>
                    <p className="text-muted-foreground mb-4">
                      Unable to initialize payment. Please try again.
                    </p>
                    <Button onClick={handleBackToTickets}>
                      Back to Tickets
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <CartSummary
                  cart={cart}
                  cartTotal={cartTotal}
                  cartCurrency={cartCurrency}
                  cartTotalFormatted={cartTotalFormatted}
                  onRemoveFromCart={removeFromCart}
                  onClearCart={clearCart}
                  onProceedToCheckout={() => {}}
                  order={order}
                  promoCode={promoCode}
                  promoCodeApplied={promoCodeApplied}
                  isApplyingPromo={isApplyingPromo}
                  promoError={promoError}
                  onPromoCodeChange={setPromoCode}
                  onApplyPromoCode={applyPromoCode}
                  onRemovePromoCode={removePromoCode}
                  disabled={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky cart summary */}
      {step === 'tickets' && cart.length > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-semibold">{cartTotalFormatted}</p>
            </div>
            <Button
              className="h-11 px-4"
              onClick={handleProceedToCheckout}
              disabled={cart.length === 0 || isCreatingCheckout}
            >
              {isCreatingCheckout ? "Preparing..." : "Continue"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
