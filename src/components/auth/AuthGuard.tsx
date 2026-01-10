// src/components/auth/AuthGuard.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter, usePathname } from "next/navigation";
import { Loader } from "@/components/ui/loader";
import { isTokenExpired, tokenNeedsRefresh, refreshToken } from "@/lib/token-refresh";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, onboardingToken, orgId, setAuth, logout } = useAuthStore((state) => ({
    token: state.token,
    onboardingToken: state.onboardingToken,
    orgId: state.orgId,
    setAuth: state.setAuth,
    logout: state.logout,
  }));
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle token refresh
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await refreshToken(
        (newToken, user) => {
          setAuth(newToken, {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: "",
          });
        },
        () => {
          logout();
          router.push("/auth/login");
        }
      );
    } catch (error) {
      console.error("[AuthGuard] Token refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, setAuth, logout, router]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check token expiration on mount and periodically
  useEffect(() => {
    if (!isClient || !token) return;

    // Check if token is completely expired
    if (isTokenExpired(token)) {
      console.log("[AuthGuard] Token is expired, attempting refresh...");
      handleRefresh();
      return;
    }

    // Check if token needs refresh soon
    if (tokenNeedsRefresh(token)) {
      console.log("[AuthGuard] Token needs refresh soon, refreshing...");
      handleRefresh();
    }

    // Set up periodic check (every 30 seconds)
    const interval = setInterval(() => {
      const currentToken = useAuthStore.getState().token;
      if (currentToken && tokenNeedsRefresh(currentToken)) {
        console.log("[AuthGuard] Periodic check: token needs refresh");
        handleRefresh();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isClient, token, handleRefresh]);

  useEffect(() => {
    if (!isClient) return;

    const isAttendeePath = pathname.startsWith("/attendee");
    const isOrganizerPath = pathname.startsWith("/dashboard") ||
                            pathname.startsWith("/speakers") ||
                            pathname.startsWith("/venues");

    // --- MAIN GUARD LOGIC ---
    // Rule 1: If the user has an onboarding token, they MUST be on the onboarding path.
    if (onboardingToken && !pathname.startsWith("/onboarding")) {
      console.log(
        "[AuthGuard] Onboarding token detected. Redirecting to onboarding."
      );
      router.push("/onboarding/create-organization");
      return;
    }

    // Rule 2: If there's no main token AND no onboarding token, redirect to login.
    if (!token && !onboardingToken) {
      console.log("[AuthGuard] No token found. Redirecting to login.");
      router.push("/auth/login");
      return;
    }

    // Rule 3: Handle users without an organization (attendees)
    if (token && !orgId && !pathname.startsWith("/onboarding")) {
      // Attendees can access attendee paths - no redirect needed
      if (isAttendeePath) {
        return;
      }

      // Attendees trying to access organizer paths should be redirected to attendee dashboard
      if (isOrganizerPath) {
        console.log(
          "[AuthGuard] Attendee trying to access organizer area. Redirecting to attendee dashboard."
        );
        router.push("/attendee");
        return;
      }
    }

    // Rule 4: Organizers with orgId can access any protected path
    // (No action needed, they pass through)
  }, [isClient, token, onboardingToken, orgId, router, pathname]);

  // The loading state should cover all checks before rendering the children.
  // It should wait for the client, and for one of the tokens to be definitively present.
  // Also show loading while refreshing an expired token.
  const isLoading = !isClient || (!token && !onboardingToken) || (isRefreshing && isTokenExpired(token));

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader className="h-8 w-8 text-primary" />
      </div>
    );
  }

  // If all checks pass, render the protected content.
  return <>{children}</>;
}
