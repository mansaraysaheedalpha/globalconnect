// src/components/providers/stripe-provider.tsx
'use client';

import { Elements } from '@stripe/react-stripe-js';
import { Stripe, StripeElementsOptions } from '@stripe/stripe-js';
import { getStripe } from '@/lib/stripe';
import { useEffect, useState, ReactNode } from 'react';

interface StripeProviderProps {
  children: ReactNode;
}

/**
 * Base Stripe provider - wraps app with Stripe context
 * Use this at the layout level for pages that need Stripe
 */
export function StripeProvider({ children }: StripeProviderProps) {
  const [stripe, setStripe] = useState<Stripe | null>(null);

  useEffect(() => {
    getStripe().then(setStripe);
  }, []);

  if (!stripe) {
    return <>{children}</>;
  }

  return (
    <Elements stripe={stripe}>
      {children}
    </Elements>
  );
}

interface StripeCheckoutProviderProps {
  clientSecret: string;
  children: ReactNode;
}

/**
 * Stripe provider with client secret for checkout
 * Use this to wrap the payment form component
 */
export function StripeCheckoutProvider({
  clientSecret,
  children
}: StripeCheckoutProviderProps) {
  const [stripe, setStripe] = useState<Stripe | null>(null);

  useEffect(() => {
    getStripe().then(setStripe);
  }, []);

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0f172a',
        colorBackground: '#ffffff',
        colorText: '#1e293b',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
        fontSizeBase: '14px',
      },
      rules: {
        '.Input': {
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        },
        '.Input:focus': {
          border: '1px solid #0f172a',
          boxShadow: '0 0 0 1px #0f172a',
        },
        '.Input--invalid': {
          border: '1px solid #ef4444',
        },
        '.Label': {
          fontWeight: '500',
          color: '#374151',
          marginBottom: '6px',
        },
        '.Error': {
          color: '#ef4444',
          fontSize: '12px',
          marginTop: '4px',
        },
      },
    },
    loader: 'auto',
  };

  if (!stripe || !clientSecret) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Elements stripe={stripe} options={options}>
      {children}
    </Elements>
  );
}
