// src/lib/csrf.ts
/**
 * CSRF Protection Utilities
 *
 * Provides client-side CSRF token management for form submissions
 * and state-changing requests. Works in conjunction with backend
 * CSRF validation.
 */

import { safeStorage } from './safe-storage';

const CSRF_TOKEN_KEY = 'csrf-token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';

/**
 * Generate a cryptographically secure random token
 */
function generateToken(): string {
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  // Fallback for environments without crypto
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Get or create a CSRF token
 * Token is stored in sessionStorage and regenerated per session
 */
export function getCsrfToken(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  let token = sessionStorage.getItem(CSRF_TOKEN_KEY);

  if (!token) {
    token = generateToken();
    sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  }

  return token;
}

/**
 * Refresh the CSRF token
 * Call this after sensitive operations or on session refresh
 */
export function refreshCsrfToken(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const token = generateToken();
  sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  return token;
}

/**
 * Clear the CSRF token
 * Call this on logout
 */
export function clearCsrfToken(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(CSRF_TOKEN_KEY);
  }
}

/**
 * Get headers with CSRF token included
 * Use this for fetch requests to protected endpoints
 */
export function getCsrfHeaders(): Record<string, string> {
  return {
    [CSRF_HEADER_NAME]: getCsrfToken(),
  };
}

/**
 * Add CSRF token to a headers object
 */
export function addCsrfHeader(headers: Headers | Record<string, string>): void {
  const token = getCsrfToken();

  if (headers instanceof Headers) {
    headers.set(CSRF_HEADER_NAME, token);
  } else {
    headers[CSRF_HEADER_NAME] = token;
  }
}

/**
 * Create a hidden input element with CSRF token for forms
 * Use this when submitting traditional HTML forms
 */
export function createCsrfInput(): HTMLInputElement {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = '_csrf';
  input.value = getCsrfToken();
  return input;
}

/**
 * Validate that a request origin matches the expected origin
 * Additional layer of CSRF protection
 */
export function validateOrigin(requestOrigin: string | null): boolean {
  if (!requestOrigin) {
    return false;
  }

  const allowedOrigins = [
    typeof window !== 'undefined' ? window.location.origin : '',
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean);

  return allowedOrigins.includes(requestOrigin);
}

/**
 * CSRF token for Apollo Client
 * Add to Apollo Link context
 */
export function getApolloHeaders(): Record<string, string> {
  return {
    ...getCsrfHeaders(),
  };
}

/**
 * Double Submit Cookie Pattern
 * Set CSRF token as both cookie and header
 */
export function setDoubleSubmitCookie(): void {
  if (typeof document === 'undefined') {
    return;
  }

  const token = getCsrfToken();

  // Set cookie with SameSite=Strict for additional protection
  document.cookie = `csrf-token=${token}; path=/; SameSite=Strict; Secure`;
}

/**
 * Verify double submit cookie matches header
 * Note: This is primarily validated server-side
 */
export function verifyDoubleSubmit(cookieToken: string, headerToken: string): boolean {
  return cookieToken === headerToken && cookieToken.length > 0;
}

export { CSRF_HEADER_NAME };
