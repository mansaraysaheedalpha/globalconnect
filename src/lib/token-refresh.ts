// src/lib/token-refresh.ts
/**
 * Token Refresh Service
 *
 * Handles automatic token refresh with:
 * - Background refresh before expiry
 * - Single refresh promise to prevent race conditions
 * - Graceful error handling
 */

import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  exp?: number;
  sub?: string;
}

interface RefreshResult {
  token: string;
  user: {
    id: string;
    email: string;
    first_name: string;
  };
}

// Singleton state
let refreshPromise: Promise<string> | null = null;
let refreshTimer: NodeJS.Timeout | null = null;
let isRefreshing = false;

// Configuration
const REFRESH_BUFFER_MS = 2 * 60 * 1000; // Refresh 2 minutes before expiry
const MIN_REFRESH_INTERVAL_MS = 30 * 1000; // Don't refresh more than once per 30 seconds
let lastRefreshTime = 0;

/**
 * Get the API URL for token refresh
 */
function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    console.warn("[TokenRefresh] NEXT_PUBLIC_API_URL not set, falling back to localhost");
    return "http://localhost:3001/graphql";
  }
  return url;
}

/**
 * Decode token and get expiry time
 */
export function getTokenExpiry(token: string): number | null {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.exp ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Check if token needs refresh (expires within buffer period)
 */
export function tokenNeedsRefresh(token: string | null): boolean {
  if (!token) return false;

  const expiry = getTokenExpiry(token);
  if (!expiry) return false;

  return Date.now() >= expiry - REFRESH_BUFFER_MS;
}

/**
 * Check if token is completely expired
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;

  const expiry = getTokenExpiry(token);
  if (!expiry) return false;

  return Date.now() >= expiry;
}

/**
 * Refresh the access token
 * Returns a promise that resolves to the new token
 * Uses a singleton pattern to prevent multiple concurrent refreshes
 */
export async function refreshToken(
  onSuccess: (token: string, user: RefreshResult["user"]) => void,
  onFailure: () => void
): Promise<string> {
  // Check if we just refreshed
  const now = Date.now();
  if (now - lastRefreshTime < MIN_REFRESH_INTERVAL_MS && !isRefreshing) {
    console.log("[TokenRefresh] Skipping refresh - recently refreshed");
    // Return existing token from store
    const { useAuthStore } = await import("@/store/auth.store");
    const currentToken = useAuthStore.getState().token;
    if (currentToken) return currentToken;
  }

  // If already refreshing, return the existing promise
  if (refreshPromise) {
    console.log("[TokenRefresh] Refresh already in progress, waiting...");
    return refreshPromise;
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      console.log("[TokenRefresh] Starting token refresh...");

      const response = await fetch(getApiUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Send httpOnly refresh token cookie
        body: JSON.stringify({
          query: `
            mutation RefreshToken {
              refreshToken {
                token
                user { id email first_name }
              }
            }
          `,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      if (responseData.errors) {
        const errorMessage = responseData.errors[0]?.message || "Failed to refresh token";
        throw new Error(errorMessage);
      }

      if (!responseData.data?.refreshToken?.token) {
        throw new Error("Invalid refresh token response");
      }

      const { token, user } = responseData.data.refreshToken as RefreshResult;

      console.log("[TokenRefresh] Token refreshed successfully");
      lastRefreshTime = Date.now();

      // Call success callback to update store
      onSuccess(token, user);

      // Schedule next refresh
      scheduleRefresh(token, onSuccess, onFailure);

      return token;
    } catch (error) {
      console.error("[TokenRefresh] Refresh failed:", error);

      // Only call failure callback for auth errors, not network errors
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (
        errorMessage.includes("401") ||
        errorMessage.includes("Unauthorized") ||
        errorMessage.includes("Invalid") ||
        errorMessage.includes("expired")
      ) {
        onFailure();
      }

      throw error;
    } finally {
      refreshPromise = null;
      isRefreshing = false;
    }
  })();

  return refreshPromise;
}

/**
 * Schedule a background token refresh
 */
export function scheduleRefresh(
  token: string,
  onSuccess: (token: string, user: RefreshResult["user"]) => void,
  onFailure: () => void
): void {
  // Clear any existing timer
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  const expiry = getTokenExpiry(token);
  if (!expiry) {
    console.log("[TokenRefresh] Cannot schedule refresh - no expiry in token");
    return;
  }

  // Calculate when to refresh (2 minutes before expiry)
  const refreshAt = expiry - REFRESH_BUFFER_MS;
  const delay = Math.max(refreshAt - Date.now(), MIN_REFRESH_INTERVAL_MS);

  console.log(`[TokenRefresh] Scheduled refresh in ${Math.round(delay / 1000)} seconds`);

  refreshTimer = setTimeout(() => {
    console.log("[TokenRefresh] Background refresh triggered");
    refreshToken(onSuccess, onFailure).catch((error) => {
      console.error("[TokenRefresh] Background refresh failed:", error);
    });
  }, delay);
}

/**
 * Cancel any scheduled refresh
 */
export function cancelScheduledRefresh(): void {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

/**
 * Initialize token refresh on app start
 * Call this when the app loads with an existing token
 */
export function initializeTokenRefresh(
  token: string | null,
  onSuccess: (token: string, user: RefreshResult["user"]) => void,
  onFailure: () => void
): void {
  if (!token) {
    console.log("[TokenRefresh] No token to initialize refresh for");
    return;
  }

  // Check if token needs immediate refresh
  if (tokenNeedsRefresh(token)) {
    console.log("[TokenRefresh] Token needs immediate refresh");
    refreshToken(onSuccess, onFailure).catch((error) => {
      console.error("[TokenRefresh] Initial refresh failed:", error);
    });
  } else {
    // Schedule future refresh
    scheduleRefresh(token, onSuccess, onFailure);
  }
}
