
// src/components/features/checkout/ticket-selector.tsx
'use client';

import { useState } from 'react';
import { TicketType, CartItem } from '@/types/payment.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, ShoppingCart, Ticket, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO, isPast, isFuture } from 'date-fns';

interface TicketSelectorProps {
  ticketTypes: TicketType[];
  cart: CartItem[];
  onAddToCart: (ticketType: TicketType, quantity?: number) => void;
  onUpdateQuantity: (ticketTypeId: string, quantity: number) => void;
  onRemoveFromCart: (ticketTypeId: string) => void;
  isLoading?: boolean;
}

export function TicketSelector({
  ticketTypes,
  cart,
  onAddToCart,
  onUpdateQuantity,
  onRemoveFromCart,
  isLoading,
}: TicketSelectorProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-2/3 mt-2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (ticketTypes.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No tickets available for this event.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {ticketTypes.map((ticketType) => {
        const cartItem = cart.find((item) => item.ticketTypeId === ticketType.id);
        const quantity = cartItem?.quantity || 0;

        return (
          <TicketTypeCard
            key={ticketType.id}
            ticketType={ticketType}
            quantity={quantity}
            onAdd={() => onAddToCart(ticketType, 1)}
            onIncrement={() => onUpdateQuantity(ticketType.id, quantity + 1)}
            onDecrement={() => {
              if (quantity <= 1) {
                onRemoveFromCart(ticketType.id);
              } else {
                onUpdateQuantity(ticketType.id, quantity - 1);
              }
            }}
          />
        );
      })}
    </div>
  );
}

interface TicketTypeCardProps {
  ticketType: TicketType;
  quantity: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

function TicketTypeCard({
  ticketType,
  quantity,
  onAdd,
  onIncrement,
  onDecrement,
}: TicketTypeCardProps) {
  const {
    name,
    description,
    price,
    quantityAvailable,
    quantityTotal,
    minPerOrder,
    maxPerOrder,
    salesStartAt,
    salesEndAt,
    isOnSale,
  } = ticketType;

  // Determine availability status
  const isSoldOut = quantityTotal !== null && (quantityAvailable ?? 0) <= 0;
  const isLimitedStock = quantityTotal !== null && (quantityAvailable ?? 0) <= 10;
  const salesNotStarted = salesStartAt && isFuture(parseISO(salesStartAt));
  const salesEnded = salesEndAt && isPast(parseISO(salesEndAt));
  const isAvailable = isOnSale && !isSoldOut && !salesNotStarted && !salesEnded;
  const isFree = price.amount === 0;

  // Check if user can add more
  const canAddMore = quantity < maxPerOrder && (quantityAvailable === null || quantity < (quantityAvailable ?? Infinity));

  return (
    <Card
      className={cn(
        'transition-all',
        !isAvailable && 'opacity-60',
        quantity > 0 && 'ring-2 ring-primary'
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg">{name}</CardTitle>
              {isFree && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Free
                </Badge>
              )}
              {isSoldOut && (
                <Badge variant="destructive">Sold Out</Badge>
              )}
              {!isSoldOut && isLimitedStock && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  Only {quantityAvailable} left
                </Badge>
              )}
              {salesNotStarted && (
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  Sales start {format(parseISO(salesStartAt!), 'MMM d')}
                </Badge>
              )}
              {salesEnded && (
                <Badge variant="secondary">Sales ended</Badge>
              )}
            </div>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">
              {isFree ? 'Free' : price.formatted}
            </p>
            {minPerOrder > 1 && (
              <p className="text-xs text-muted-foreground">Min {minPerOrder} per order</p>
            )}
            {maxPerOrder < 10 && (
              <p className="text-xs text-muted-foreground">Max {maxPerOrder} per order</p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isAvailable ? (
          quantity === 0 ? (
            <Button
              onClick={onAdd}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {isFree ? 'Register' : 'Add to Cart'}
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onDecrement}
                  className="h-9 w-9"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium text-lg">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onIncrement}
                  disabled={!canAddMore}
                  className="h-9 w-9"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Subtotal: <span className="font-medium text-foreground">
                  {isFree ? 'Free' : `${price.currency} ${((price.amount * quantity) / 100).toFixed(2)}`}
                </span>
              </div>
            </div>
          )
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">
              {isSoldOut
                ? 'This ticket type is sold out'
                : salesNotStarted
                ? `Sales begin ${format(parseISO(salesStartAt!), 'MMMM d, yyyy')}`
                : salesEnded
                ? 'Sales have ended for this ticket type'
                : 'Not currently available'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}