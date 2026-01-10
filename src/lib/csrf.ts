// src/lib/csrf.ts
/**
 * CSRF Protection Utilities
 *
 * Uses double-submit cookie pattern:
 * - Backend sets csrf_token cookie
 * - Frontend reads cookie and sends in x-csrf-token header
 * - Backend validates cookie matches header
 */

// Must match backend constants in csrf.middleware.ts
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Get CSRF token from the cookie set by the backend
 * Uses double-submit cookie pattern - read cookie and send in header
 */
export function getCsrfToken(): string {
  if (typeof document === 'undefined') {
    return '';
  }

  // Read the CSRF token from the cookie set by the backend
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === CSRF_COOKIE_NAME) {
      return value || '';
    }
  }

  return '';
}

/**
 * Clear the CSRF token cookie on logout
 */
export function clearCsrfToken(): void {
  if (typeof document !== 'undefined') {
    document.cookie = `${CSRF_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

/**
 * Get headers with CSRF token included
 * Use this for fetch requests to protected endpoints
 */
export function getCsrfHeaders(): Record<string, string> {
  const token = getCsrfToken();
  if (!token) {
    return {};
  }
  return {
    [CSRF_HEADER_NAME]: token,
  };
}

/**
 * Add CSRF token to a headers object
 */
export function addCsrfHeader(headers: Headers | Record<string, string>): void {
  const token = getCsrfToken();
  if (!token) return;

  if (headers instanceof Headers) {
    headers.set(CSRF_HEADER_NAME, token);
  } else {
    headers[CSRF_HEADER_NAME] = token;
  }
}

/**
 * CSRF headers for Apollo Client
 */
export function getApolloHeaders(): Record<string, string> {
  return getCsrfHeaders();
}

export { CSRF_HEADER_NAME };
