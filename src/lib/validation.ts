// src/lib/validation.ts

/**
 * Input validation utilities
 *
 * Provides functions for validating user input such as emails, URLs, etc.
 */

/**
 * Validate a single email address
 *
 * @example
 * validateEmail("user@example.com") // true
 * validateEmail("invalid-email") // false
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate a comma-separated list of email addresses
 *
 * @example
 * validateEmailList("user1@example.com, user2@example.com")
 * // Returns: { valid: true, emails: ["user1@example.com", "user2@example.com"], invalid: [] }
 *
 * validateEmailList("user1@example.com, invalid-email")
 * // Returns: { valid: false, emails: ["user1@example.com", "invalid-email"], invalid: ["invalid-email"] }
 */
export function validateEmailList(emailString: string): {
  valid: boolean;
  emails: string[];
  invalid: string[];
} {
  if (!emailString || typeof emailString !== 'string') {
    return { valid: false, emails: [], invalid: [] };
  }

  // Split by comma and trim each email
  const emails = emailString
    .split(',')
    .map((e) => e.trim())
    .filter((e) => e.length > 0);

  // If no emails found, return invalid
  if (emails.length === 0) {
    return { valid: false, emails: [], invalid: [] };
  }

  // Find invalid emails
  const invalid = emails.filter((email) => !validateEmail(email));

  return {
    valid: invalid.length === 0,
    emails,
    invalid,
  };
}

/**
 * Validate a URL
 *
 * @example
 * validateUrl("https://example.com") // true
 * validateUrl("not-a-url") // false
 */
export function validateUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Validate a date string (YYYY-MM-DD format)
 *
 * @example
 * validateDateString("2025-01-01") // true
 * validateDateString("2025-13-01") // false (invalid month)
 */
export function validateDateString(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Validate a date range
 *
 * Ensures:
 * - Both dates are valid
 * - 'from' date is before or equal to 'to' date
 *
 * @example
 * validateDateRange("2025-01-01", "2025-12-31") // true
 * validateDateRange("2025-12-31", "2025-01-01") // false (reversed)
 */
export function validateDateRange(from: string, to: string): {
  valid: boolean;
  error?: string;
} {
  if (!validateDateString(from)) {
    return { valid: false, error: 'Invalid "from" date' };
  }

  if (!validateDateString(to)) {
    return { valid: false, error: 'Invalid "to" date' };
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (fromDate > toDate) {
    return { valid: false, error: '"From" date must be before or equal to "to" date' };
  }

  return { valid: true };
}
