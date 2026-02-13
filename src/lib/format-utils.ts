// src/lib/format-utils.ts

/**
 * Format a value stored in cents to a currency display string.
 * Uses Intl.NumberFormat for locale-aware formatting.
 *
 * @param cents - Amount in cents (e.g., 9999 = $99.99)
 * @param currency - ISO 4217 currency code (default: "USD")
 * @returns Formatted currency string (e.g., "$99.99")
 */
export function formatCurrency(cents: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/**
 * Convert cents to a dollar amount (number).
 * Use this when you need the numeric value, not a formatted string
 * (e.g., for chart data or calculations).
 *
 * @param cents - Amount in cents
 * @returns Amount in dollars
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Format a percentage value with consistent decimal places.
 *
 * @param value - The percentage value (e.g., 5.678)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string (e.g., "5.7%")
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
