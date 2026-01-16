// src/components/features/checkout/payment-form.tsx
'use client';

import { useState, FormEvent } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { Order } from '@/types/payment.types';

interface PaymentFormProps {
  order: Order;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  returnUrl: string;
}

export function PaymentForm({
  order,
  onPaymentSuccess,
  onPaymentError,
  returnUrl,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
          receipt_email: order.customerEmail,
        },
        redirect: 'if_required',
      });

      if (error) {
        // Show error to the customer
        const message =
          error.type === 'card_error' || error.type === 'validation_error'
            ? error.message || 'Payment failed'
            : 'An unexpected error occurred. Please try again.';

        setPaymentError(message);
        onPaymentError(message);
      } else if (paymentIntent) {
        // Payment succeeded
        if (paymentIntent.status === 'succeeded') {
          setPaymentSuccess(true);
          onPaymentSuccess(paymentIntent.id);
        } else if (paymentIntent.status === 'requires_action') {
          // 3D Secure or other authentication required
          // Stripe.js will handle the redirect
          setPaymentError('Additional authentication required. Please follow the instructions.');
        } else {
          setPaymentError(`Payment status: ${paymentIntent.status}. Please try again.`);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      setPaymentError(message);
      onPaymentError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/30">
        <CardContent className="py-8 text-center">
          <CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-4" />
          <h3 className="text-xl font-semibold text-green-700 dark:text-green-400 mb-2">
            Payment Successful!
          </h3>
          <p className="text-muted-foreground">
            Your order has been confirmed. Redirecting...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Payment Details</CardTitle>
        </div>
        <CardDescription>
          Enter your card information to complete the purchase
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Stripe Payment Element */}
          <div className="p-4 border rounded-lg bg-background">
            <PaymentElement
              options={{
                layout: {
                  type: 'tabs',
                  defaultCollapsed: false,
                },
                business: {
                  name: 'Event Dynamics',
                },
              }}
            />
          </div>

          {/* Error Message */}
          {paymentError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{paymentError}</AlertDescription>
            </Alert>
          )}

          {/* Order Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order</span>
              <span className="font-medium">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {order.items.reduce((sum, item) => sum + item.quantity, 0)} ticket(s)
              </span>
              <span className="font-semibold text-lg">
                {order.totalAmount.formatted}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!stripe || !elements || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Pay {order.totalAmount.formatted}
              </>
            )}
          </Button>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Payments are secure and encrypted</span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
