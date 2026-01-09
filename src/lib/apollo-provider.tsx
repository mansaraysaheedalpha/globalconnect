// src/lib/apollo-provider.tsx
"use client";
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

let refreshTokenPromise: Promise<string> | null = null;

const getNewToken = (): Promise<string> => {
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  refreshTokenPromise = (async () => {
    try {
      console.log("Attempting to refresh token...");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
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
        throw new Error(
          responseData.errors[0].message || "Failed to refresh token"
        );
      }

      if (!responseData.data?.refreshToken) {
        throw new Error("Invalid refresh token response structure");
      }

      const { token, user } = responseData.data.refreshToken;

      if (!token) {
        throw new Error("No token received from refresh");
      }

      console.log("Token refreshed successfully");
      useAuthStore.getState().setAuth(token, user);
      return token;
    } catch (e) {
      console.error("Refresh token failed:", e);
      useAuthStore.getState().logout();

      // Use router instead of direct window.location for better Next.js compatibility
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
      throw e;
    } finally {
      refreshTokenPromise = null;
    }
  })();

  return refreshTokenPromise;
};

const httpLink = createHttpLink({
  uri: API_URL,
  credentials: "include", // Ensure cookies are sent
});

const authLink = setContext(async (_, { headers }) => {
  // Get both tokens from the store
  const authState = useAuthStore.getState();
  let { token } = authState;
  const { onboardingToken, isTokenExpired } = authState;

  // Proactively refresh token if it's about to expire (within 60 seconds)
  if (token && isTokenExpired()) {
    console.log("[Apollo Auth] Token is expiring soon, proactively refreshing...");
    try {
      token = await getNewToken();
    } catch (error) {
      console.error("[Apollo Auth] Proactive token refresh failed:", error);
      // Continue with expired token, the error handler will catch the 401
    }
  }

  // Prioritize the main token, but fall back to the onboarding token
  const tokenToUse = token || onboardingToken;

  return {
    headers: {
      ...headers,
      authorization: tokenToUse ? `Bearer ${tokenToUse}` : "",
    },
  };
});

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    // Handle network errors
    if (networkError) {
      console.error("Network error:", networkError);

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
                console.error(
                  "Token refresh failed in network error handler:",
                  error
                );
                observer.error(error);
              });
          });
        }
      }
    }

    // Handle GraphQL errors
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        console.error("GraphQL error:", err);

        const hasRetried = operation.getContext().hasRetried;

        if (
          err.extensions?.code === "UNAUTHORIZED" &&
          operation.operationName !== "Login" &&
          !hasRetried
        ) {
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
                console.error(
                  "Token refresh failed in GraphQL error handler:",
                  error
                );
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

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  return <Provider client={client}>{children}</Provider>;
}
