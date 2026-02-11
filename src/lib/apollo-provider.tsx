// src/lib/apollo-provider.tsx
"use client";
import { useEffect, useRef } from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider as Provider,
  createHttpLink,
  from,
  NormalizedCacheObject,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { useAuthStore } from "@/store/auth.store";
import { Observable } from "@apollo/client/utilities";
import {
  refreshToken,
  tokenNeedsRefresh,
  initializeTokenRefresh,
  cancelScheduledRefresh,
} from "./token-refresh";
import { getCsrfHeaders } from "./csrf";
import { restoreCache, setupCachePersistence, clearPersistedCache } from "./apollo-cache-persist";
import { OfflineLink } from "./apollo-offline-link";
import { initSyncManager } from "./sync-manager";
import { storeSyncMeta, getSyncMeta, getAllItems, storeItems } from "./offline-storage";
import { recordSuccessfulFetch, recordFailedFetch } from "./network-connectivity";
import { gql } from "@apollo/client";

// --- 1. Type-Safe Environment Variable with validation ---
const getApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    console.warn("NEXT_PUBLIC_API_URL not set, falling back to localhost");
    return "http://localhost:3001/graphql";
  }
  return url;
};

const API_URL = getApiUrl();

// Track if we're currently refreshing to prevent multiple concurrent refreshes
let isRefreshingToken = false;
let pendingRefreshPromise: Promise<string> | null = null;

/**
 * Get a new token, handling concurrent refresh requests
 */
const getNewToken = async (): Promise<string> => {
  if (pendingRefreshPromise) {
    return pendingRefreshPromise;
  }

  if (isRefreshingToken) {
    // Wait a bit and check again
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (pendingRefreshPromise) {
      return pendingRefreshPromise;
    }
  }

  isRefreshingToken = true;

  pendingRefreshPromise = refreshToken(
    // onSuccess
    (token, user) => {
      useAuthStore.getState().setAuth(token, {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: "",
      });
    },
    // onFailure
    () => {
      console.log("[Apollo] Token refresh failed, logging out...");
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }
  ).finally(() => {
    isRefreshingToken = false;
    pendingRefreshPromise = null;
  });

  return pendingRefreshPromise;
};

const httpLink = createHttpLink({
  uri: API_URL,
  credentials: "include", // Ensure cookies are sent
  // Track fetch success/failure for lie-fi detection (network-connectivity.ts)
  fetch: async (uri, options) => {
    try {
      const response = await fetch(uri, options);
      if (response.ok) recordSuccessfulFetch();
      else recordFailedFetch();
      return response;
    } catch (error) {
      recordFailedFetch();
      throw error;
    }
  },
});

const authLink = setContext(async (_, { headers }) => {
  // Get auth state
  const authState = useAuthStore.getState();
  let { token } = authState;
  const { onboardingToken } = authState;

  // Proactively refresh token if it's about to expire
  if (token && tokenNeedsRefresh(token)) {
    console.log("[Apollo Auth] Token needs refresh, refreshing proactively...");
    try {
      token = await getNewToken();
    } catch (error) {
      console.error("[Apollo Auth] Proactive token refresh failed:", error);
      // Continue with the current token, error link will handle 401
    }
  }

  // Prioritize the main token, but fall back to the onboarding token
  const tokenToUse = token || onboardingToken;

  return {
    headers: {
      ...headers,
      ...getCsrfHeaders(), // Include CSRF token for double-submit cookie pattern
      authorization: tokenToUse ? `Bearer ${tokenToUse}` : "",
    },
  };
});

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    // Handle network errors
    if (networkError) {
      // Don't log network errors when offline — that's expected
      if (navigator.onLine) {
        console.error("[Apollo] Network error:", networkError);
      }

      // Check if it's a network error with status 401
      if ("statusCode" in networkError && networkError.statusCode === 401) {
        const hasRetried = operation.getContext().hasRetried;
        if (!hasRetried) {
          return new Observable((observer) => {
            getNewToken()
              .then((newAccessToken) => {
                operation.setContext(({ headers = {} }) => ({
                  headers: {
                    ...headers,
                    authorization: `Bearer ${newAccessToken}`,
                  },
                  hasRetried: true,
                }));

                const subscriber = {
                  next: observer.next.bind(observer),
                  error: observer.error.bind(observer),
                  complete: observer.complete.bind(observer),
                };

                // Forward the operation with new token
                forward(operation).subscribe(subscriber);
              })
              .catch((error) => {
                console.error("[Apollo] Token refresh failed:", error);
                observer.error(error);
              });
          });
        }
      }
    }

    // Handle GraphQL errors
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        // Only log non-auth errors to avoid noise
        if (err.extensions?.code !== "UNAUTHORIZED") {
          console.error("[Apollo] GraphQL error:", err);
        }

        const hasRetried = operation.getContext().hasRetried;

        // Check for various auth error patterns
        const isAuthError =
          err.extensions?.code === "UNAUTHORIZED" ||
          err.message?.toLowerCase().includes("unauthorized") ||
          err.message?.toLowerCase().includes("not authenticated") ||
          err.message?.toLowerCase().includes("jwt") ||
          err.message?.toLowerCase().includes("token");

        if (
          isAuthError &&
          operation.operationName !== "Login" &&
          operation.operationName !== "RefreshToken" &&
          !hasRetried
        ) {
          console.log("[Apollo] Auth error detected, attempting token refresh...");

          return new Observable((observer) => {
            getNewToken()
              .then((newAccessToken) => {
                operation.setContext(({ headers = {} }) => ({
                  headers: {
                    ...headers,
                    authorization: `Bearer ${newAccessToken}`,
                  },
                  hasRetried: true,
                }));

                const subscriber = {
                  next: observer.next.bind(observer),
                  error: observer.error.bind(observer),
                  complete: observer.complete.bind(observer),
                };

                // Forward the operation with new token
                const subscription = forward(operation).subscribe(subscriber);

                // Handle subscription cleanup
                return () => subscription.unsubscribe();
              })
              .catch((error) => {
                console.error("[Apollo] Token refresh failed:", error);
                observer.error(error);
              });
          });
        }
      }
    }
  }
);

// --- Cache with persistence support ---
const cache = new InMemoryCache({
  typePolicies: {
    Event: { keyFields: ["id"] },
    Registration: { keyFields: ["id"] },
    Session: { keyFields: ["id"] },
    Speaker: { keyFields: ["id"] },
    Venue: { keyFields: ["id"] },
    User: { keyFields: ["id"] },
    PublicEvent: { keyFields: ["id"] },
    Query: {
      fields: {
        events: {
          merge(_existing, incoming) {
            return incoming;
          },
        },
        publicEvents: {
          merge(_existing, incoming) {
            return incoming;
          },
        },
      },
    },
  },
});

// --- Offline link: intercepts when offline ---
const offlineLink = new OfflineLink();

// Build the link chain: error -> auth -> offline -> http
const client = new ApolloClient({
  link: from([errorLink, authLink, offlineLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
      // Return cached data even when network request fails
      returnPartialData: true,
    },
    query: {
      errorPolicy: "all",
    },
  },
});

// ---------------------------------------------------------------------------
// Periodic Sync helpers (Issue #7 — merge SW-refreshed data into Apollo cache)
// ---------------------------------------------------------------------------

const PERIODIC_SYNC_QUERY = gql`
  query PeriodicSyncCache {
    myRegisteredEvents {
      id title description startDate endDate status imageUrl
      venue { id name address city }
    }
  }
`;

const STALE_THRESHOLD_MS = 12 * 60 * 60 * 1000; // 12 hours

/** Merge event data that the SW stored in IndexedDB into Apollo cache. */
async function mergePeriodicSyncData(apolloCache: InMemoryCache): Promise<void> {
  try {
    const lastSync = await getSyncMeta<number>("periodic_sync_last");
    if (!lastSync) return;
    if (Date.now() - lastSync > STALE_THRESHOLD_MS) return; // too old

    const events = await getAllItems<{ id: string }>("events");
    if (events.length === 0) return;

    apolloCache.writeQuery({
      query: PERIODIC_SYNC_QUERY,
      data: { myRegisteredEvents: events },
    });
  } catch (e) {
    console.warn("[Apollo] Failed to merge periodic sync data:", e);
  }
}

/**
 * Visibility-based refresh — fallback for browsers without Periodic Background Sync.
 * When the app becomes visible and data is stale, fetch fresh events. (Issue #12)
 */
async function refreshOnVisibility(): Promise<void> {
  if (document.visibilityState !== "visible" || !navigator.onLine) return;

  const token = useAuthStore.getState().token;
  if (!token) return;

  const lastSync = await getSyncMeta<number>("periodic_sync_last").catch(() => null);
  if (lastSync && Date.now() - lastSync < STALE_THRESHOLD_MS) return;

  try {
    const { data } = await client.query({
      query: PERIODIC_SYNC_QUERY,
      fetchPolicy: "network-only",
    });

    if (data?.myRegisteredEvents) {
      await storeItems("events", data.myRegisteredEvents);
      await storeSyncMeta("periodic_sync_last", Date.now());
    }
  } catch {
    // Best effort — will retry on next visibility change
  }
}

// ---------------------------------------------------------------------------
// Cache Persistence Initializer
// ---------------------------------------------------------------------------

/**
 * Restores the cache from IndexedDB on mount and sets up auto-persistence.
 * Also handles token storage for the SW, periodic sync registration, and
 * visibility-based refresh.
 */
function CachePersistenceInitializer() {
  useEffect(() => {
    let cancelled = false;
    let cleanupPersist: (() => void) | null = null;

    // Restore cache, then set up auto-persistence + merge SW periodic sync data
    restoreCache(cache).then(() => {
      if (!cancelled) {
        cleanupPersist = setupCachePersistence(cache);
        mergePeriodicSyncData(cache);
      }
    });

    // Initialize the sync manager to replay mutations when online
    const cleanupSync = initSyncManager(client as ApolloClient<NormalizedCacheObject>);

    // Store API URL in IndexedDB for Background Sync (SW needs it)
    storeSyncMeta("bg_sync_api_url", API_URL);

    // Keep auth token AND EXPIRY in IndexedDB so the SW can check validity
    const unsubAuth = useAuthStore.subscribe((state) => {
      if (state.token) {
        storeSyncMeta("bg_sync_auth_token", state.token);
        const expiry = state.getTokenExpiry?.() ?? 0;
        storeSyncMeta("bg_sync_token_expiry", expiry);
      }
    });
    // Store immediately
    const authState = useAuthStore.getState();
    if (authState.token) {
      storeSyncMeta("bg_sync_auth_token", authState.token);
      storeSyncMeta("bg_sync_token_expiry", authState.getTokenExpiry?.() ?? 0);
    }

    // Register Periodic Background Sync (Chrome 80+)
    if ("serviceWorker" in navigator && "periodicSync" in ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(async (reg) => {
        try {
          await (reg as any).periodicSync.register("refresh-event-data", {
            minInterval: STALE_THRESHOLD_MS,
          });
        } catch {
          // Periodic sync not granted or not supported
        }
      });
    }

    // Fallback: visibility-change-based refresh for Safari / Firefox (Issue #12)
    document.addEventListener("visibilitychange", refreshOnVisibility);

    return () => {
      cancelled = true;
      cleanupPersist?.();
      cleanupSync();
      unsubAuth();
      document.removeEventListener("visibilitychange", refreshOnVisibility);
    };
  }, []);

  return null;
}

/**
 * Token Refresh Initializer Component
 * Runs once on mount to set up background token refresh
 */
function TokenRefreshInitializer() {
  const initialized = useRef(false);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    // Only initialize once
    if (initialized.current) return;
    initialized.current = true;

    if (token) {
      console.log("[TokenRefresh] Initializing background token refresh...");
      initializeTokenRefresh(
        token,
        // onSuccess
        (newToken, user) => {
          useAuthStore.getState().setAuth(newToken, {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: "",
          });
        },
        // onFailure
        () => {
          console.log("[TokenRefresh] Background refresh failed, logging out...");
          useAuthStore.getState().logout();
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login";
          }
        }
      );
    }

    // Cleanup on unmount
    return () => {
      cancelScheduledRefresh();
    };
  }, []); // Empty deps - only run once on mount

  // Re-initialize when token changes (e.g., after login)
  useEffect(() => {
    if (token && initialized.current) {
      initializeTokenRefresh(
        token,
        (newToken, user) => {
          useAuthStore.getState().setAuth(newToken, {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: "",
          });
        },
        () => {
          useAuthStore.getState().logout();
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login";
          }
        }
      );
    }
  }, [token]);

  return null;
}

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider client={client}>
      <CachePersistenceInitializer />
      <TokenRefreshInitializer />
      {children}
    </Provider>
  );
}

// Export for use by sync manager and other utilities
export { client as apolloClient, clearPersistedCache };
