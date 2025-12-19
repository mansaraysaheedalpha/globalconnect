// src/lib/stripe.ts
import { loadStripe, Stripe } from '@stripe/stripe-js';

/**
 * Stripe instance singleton
 * Loads Stripe.js only once and reuses the instance
 */
let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      console.error('Stripe publishable key not configured');
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
}

/**
 * Format amount from cents to display string
 */
export function formatAmount(amountInCents: number, currency: string): string {
  const amount = amountInCents / 100;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format amount without currency symbol (for inputs)
 */
export function formatAmountPlain(amountInCents: number): string {
  return (amountInCents / 100).toFixed(2);
}

/**
 * Convert display amount to cents
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Currency symbols mapping
 */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'A$',
  NGN: '₦',
  GHS: 'GH₵',
  KES: 'KSh',
};

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency.toUpperCase()] || currency.toUpperCase();
}

/**
 * Supported currencies
 */
export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NGN', 'GHS', 'KES'] as const;
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

/**
 * Minimum amounts by currency (in cents)
 */
export const MINIMUM_AMOUNTS: Record<string, number> = {
  USD: 50,    // $0.50
  EUR: 50,    // €0.50
  GBP: 30,    // £0.30
  CAD: 50,    // CA$0.50
  AUD: 50,    // A$0.50
  NGN: 5000,  // ₦50.00
  GHS: 100,   // GH₵1.00
  KES: 5000,  // KSh50.00
};

/**
 * Get minimum amount for a currency
 */
export function getMinimumAmount(currency: string): number {
  return MINIMUM_AMOUNTS[currency.toUpperCase()] || 50;
}

/**
 * Validate amount is above minimum for currency
 */
export function isAmountValid(amountInCents: number, currency: string): boolean {
  return amountInCents >= getMinimumAmount(currency);
}
