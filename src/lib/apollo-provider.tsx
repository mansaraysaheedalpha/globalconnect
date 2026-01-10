// src/lib/apollo-provider.tsx
"use client";
import { useEffect, useRef } from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider as Provider,
  createHttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { useAuthStore } from "@/store/auth.store";
import { Observable } from "@apollo/client/utilities";
import {
  refreshToken,
  tokenNeedsRefresh,
  isTokenExpired,
  initializeTokenRefresh,
  cancelScheduledRefresh,
} from "./token-refresh";
import { getCsrfHeaders } from "./csrf";

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
      console.error("[Apollo] Network error:", networkError);

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

const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]), // Keep this order
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
    },
    query: {
      errorPolicy: "all",
    },
  },
});

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
      <TokenRefreshInitializer />
      {children}
    </Provider>
  );
}
