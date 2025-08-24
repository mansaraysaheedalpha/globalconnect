// src/components/auth/AuthGuard.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { Loader, Spinner } from "@/components/ui/loader";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  // This new state tracks if we are on the client and the store has had a chance to rehydrate.
  const [isClient, setIsClient] = useState(false);

  // When the component mounts, we know we are on the client.
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // We wait until we're on the client before checking for the token.
    if (isClient && !token) {
      router.push("/auth/login");
    }
  }, [isClient, token, router]);

  // If we are not on the client yet OR there's no token, show a loading state.
  // This prevents a flash of the real content before the redirect can happen.
  if (!isClient || !token) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader className="h-8 w-8 text-primary" />
      </div>
    );
  }

  // If we are on the client AND a token exists, the user is authenticated. Render the page.
  return <>{children}</>;
}
