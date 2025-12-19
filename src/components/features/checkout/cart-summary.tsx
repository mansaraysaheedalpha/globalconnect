// src/components/features/checkout/cart-summary.tsx
'use client';

import { CartItem, Order } from '@/types/payment.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Ticket, Tag, X, Loader2, ArrowRight, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatAmount } from '@/lib/stripe';

interface CartSummaryProps {
  cart: CartItem[];
  cartTotal: number;
  cartCurrency: string;
  cartTotalFormatted: string;
  onRemoveFromCart: (ticketTypeId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  isLoading?: boolean;
  disabled?: boolean;

  // Promo code (optional)
  promoCode?: string;
  promoCodeApplied?: boolean;
  isApplyingPromo?: boolean;
  promoError?: string | null;
  onPromoCodeChange?: (code: string) => void;
  onApplyPromoCode?: () => void;
  onRemovePromoCode?: () => void;

  // Order (when checkout session exists)
  order?: Order | null;
}

export function CartSummary({
  cart,
  cartTotal,
  cartCurrency,
  cartTotalFormatted,
  onRemoveFromCart,
  onClearCart,
  onProceedToCheckout,
  isLoading,
  disabled,
  promoCode,
  promoCodeApplied,
  isApplyingPromo,
  promoError,
  onPromoCodeChange,
  onApplyPromoCode,
  onRemovePromoCode,
  order,
}: CartSummaryProps) {
  const isEmpty = cart.length === 0;
  const hasPromoCode = promoCodeApplied && order?.promoCode;

  // Use order values if available (more accurate after promo applied)
  const displaySubtotal = order?.subtotal?.formatted || cartTotalFormatted;
  const displayDiscount = order?.discountAmount?.formatted;
  const displayTotal = order?.totalAmount?.formatted || cartTotalFormatted;
  const displayTotalAmount = order?.totalAmount?.amount || cartTotal;
  const isFreeOrder = displayTotalAmount === 0;

  if (isEmpty) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">Your cart is empty</p>
          <p className="text-sm text-muted-foreground">
            Select tickets above to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Order Summary
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearCart}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-3">
          {cart.map((item) => (
            <div
              key={item.ticketTypeId}
              className="flex items-start justify-between gap-2"
            >
              <div className="flex items-start gap-2">
                <Ticket className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{item.ticketType.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} × {item.ticketType.price.formatted}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {formatAmount(
                    item.ticketType.price.amount * item.quantity,
                    item.ticketType.price.currency
                  )}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemoveFromCart(item.ticketTypeId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Promo Code Section */}
        {onPromoCodeChange && onApplyPromoCode && (
          <div className="space-y-2">
            <Label htmlFor="promo-code" className="text-sm">
              Promo Code
            </Label>
            {hasPromoCode ? (
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    {order?.promoCode?.code}
                  </span>
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                    Applied
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemovePromoCode}
                  className="h-7 px-2 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  id="promo-code"
                  placeholder="Enter code"
                  value={promoCode}
                  onChange={(e) => onPromoCodeChange(e.target.value.toUpperCase())}
                  className="uppercase"
                />
                <Button
                  variant="outline"
                  onClick={onApplyPromoCode}
                  disabled={!promoCode?.trim() || isApplyingPromo}
                >
                  {isApplyingPromo ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Apply'
                  )}
                </Button>
              </div>
            )}
            {promoError && (
              <p className="text-xs text-destructive">{promoError}</p>
            )}
          </div>
        )}

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{displaySubtotal}</span>
          </div>

          {hasPromoCode && displayDiscount && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-{displayDiscount}</span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span className={cn(isFreeOrder && 'text-green-600')}>
              {isFreeOrder ? 'Free' : displayTotal}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={onProceedToCheckout}
          disabled={disabled || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {isFreeOrder ? 'Complete Registration' : 'Proceed to Checkout'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
