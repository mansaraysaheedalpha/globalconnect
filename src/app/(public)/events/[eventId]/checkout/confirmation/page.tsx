
// src/app/(public)/events/[eventId]/checkout/confirmation/page.tsx
'use client';

import { useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { GET_ORDER_BY_NUMBER_QUERY } from '@/graphql/payments.graphql';
import { GET_PUBLIC_EVENT_DETAILS_QUERY } from '@/graphql/public.graphql';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  AlertCircle,
  Ticket,
  Calendar,
  MapPin,
  Clock,
  Mail,
  Share2,
  ArrowRight,
  PartyPopper,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Order, OrderItem, OrderStatus } from '@/types/payment.types';
import confetti from 'canvas-confetti';

export default function ConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const eventId = params.eventId as string;
  const orderNumber = searchParams.get('order');

  // Fetch order details
  const { data, loading, error } = useQuery(GET_ORDER_BY_NUMBER_QUERY, {
    variables: { orderNumber },
    skip: !orderNumber,
    pollInterval: 5000, // Poll for status updates
  });

  const order = data?.orderByNumber || null;

  // Fetch event details using eventId from order or URL params
  const orderEventId = order?.eventId || eventId;
  const { data: eventData } = useQuery(GET_PUBLIC_EVENT_DETAILS_QUERY, {
    variables: { eventId: orderEventId },
    skip: !orderEventId,
  });

  const event = eventData?.event || null;

  // Celebrate on successful payment
  useEffect(() => {
    if (order?.status === OrderStatus.COMPLETED) {
      // Fire confetti
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#0f172a', '#3b82f6', '#22c55e'],
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#0f172a', '#3b82f6', '#22c55e'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [order?.status]);

  // No order number
  if (!orderNumber) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Order Found</h2>
            <p className="text-muted-foreground mb-4">
              We couldn't find an order to display.
            </p>
            <Button asChild>
              <Link href="/events">Browse Events</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loading && !order) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container max-w-2xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  // Order not found
  if (error || !order) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
            <p className="text-muted-foreground mb-4">
              We couldn't find order {orderNumber}.
            </p>
            <Button asChild>
              <Link href="/events">Browse Events</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCompleted = order.status === OrderStatus.COMPLETED;
  const isPending = order.status === OrderStatus.PENDING || order.status === OrderStatus.PROCESSING;
  const isFailed = order.status === OrderStatus.CANCELLED || order.status === OrderStatus.EXPIRED;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container max-w-2xl mx-auto px-4 py-12">
        {/* Success Header */}
        {isCompleted && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-2">
              You're all set!
            </h1>
            <p className="text-muted-foreground">
              Your tickets have been confirmed
            </p>
          </div>
        )}

        {/* Pending Header */}
        {isPending && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
              <Clock className="h-10 w-10 text-yellow-600 animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold text-yellow-700 dark:text-yellow-400 mb-2">
              Processing Payment
            </h1>
            <p className="text-muted-foreground">
              Please wait while we confirm your payment...
            </p>
          </div>
        )}

        {/* Failed Header */}
        {isFailed && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-red-700 dark:text-red-400 mb-2">
              Order {order.status === OrderStatus.CANCELLED ? 'Cancelled' : 'Expired'}
            </h1>
            <p className="text-muted-foreground">
              This order is no longer active
            </p>
          </div>
        )}

        {/* Order Card */}
        <Card className="overflow-hidden">
          {/* Order Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm opacity-80 mb-1">Order Number</p>
                <p className="text-2xl font-mono font-bold">{order.orderNumber}</p>
              </div>
              <Badge
                variant={isCompleted ? 'secondary' : isPending ? 'outline' : 'destructive'}
                className={isCompleted ? 'bg-green-500 text-white' : ''}
              >
                {order.status}
              </Badge>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Event Details */}
            <div>
              <h2 className="text-lg font-semibold mb-3">{event?.name || 'Event'}</h2>
              {event && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(parseISO(event.startDate), 'EEEE, MMMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {format(parseISO(event.startDate), 'h:mm a')} -{' '}
                      {format(parseISO(event.endDate), 'h:mm a')}
                    </span>
                  </div>
                  {event.venue?.name && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{event.venue.name}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Ticket Details */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Tickets
              </h3>
              <div className="space-y-3">
                {order.items.map((item: OrderItem) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-muted-foreground" />
                      <span>{item.ticketTypeName}</span>
                      <Badge variant="outline" className="ml-1">
                        x{item.quantity}
                      </Badge>
                    </div>
                    <span className="font-medium">{item.totalPrice.formatted}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Order Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{order.subtotal.formatted}</span>
              </div>
              {order.discountAmount && order.discountAmount.amount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount Applied</span>
                  <span>-{order.discountAmount.formatted}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{order.totalAmount.formatted}</span>
              </div>
            </div>

            {/* Confirmation Email */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Confirmation Email</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {isCompleted
                  ? `A confirmation email with your tickets has been sent to ${order.customerEmail}`
                  : `Once confirmed, we'll send your tickets to ${order.customerEmail}`}
              </p>
            </div>

            {/* Actions */}
            {isCompleted && (
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button asChild className="flex-1">
                  <Link href={`/attendee/events/${order.eventId || eventId}`}>
                    <Ticket className="h-4 w-4 mr-2" />
                    View My Tickets
                  </Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/events">
                    Browse More Events
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}

            {isFailed && (
              <Button asChild className="w-full">
                <Link href={`/events/${eventId}/checkout`}>
                  Try Again
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Share Section */}
        {isCompleted && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-muted-foreground mb-4">
              <PartyPopper className="h-5 w-5" />
              <span>Excited about the event?</span>
            </div>
            <div className="flex justify-center gap-3">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share Event
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}