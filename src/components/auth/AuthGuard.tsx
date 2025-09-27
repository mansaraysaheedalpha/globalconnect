// src/components/auth/AuthGuard.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter, usePathname } from "next/navigation";
import { Loader } from "@/components/ui/loader";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, onboardingToken, orgId } = useAuthStore((state) => ({
    token: state.token,
    onboardingToken: state.onboardingToken,
    orgId: state.orgId,
  }));
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

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

    // Rule 3: If there IS a main token but the user has no organization,
    // they should be creating one. This is an edge case recovery.
    if (token && !orgId && !pathname.startsWith("/onboarding")) {
      console.log(
        "[AuthGuard] Token exists but no Org ID. Redirecting to create one."
      );
      router.push("/onboarding/create-organization");
      return;
    }
  }, [isClient, token, onboardingToken, orgId, router, pathname]);

  // The loading state should cover all checks before rendering the children.
  // It should wait for the client, and for one of the tokens to be definitively present.
  const isLoading = !isClient || (!token && !onboardingToken);

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
