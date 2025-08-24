// src/components/layout/Header.tsx
"use client";

import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { OrganizationSwitcher } from "./OrganizationSwitcher"; // Import the new component
import { LOGOUT_MUTATION } from "../features/Auth/auth.graphql";
import { useMutation } from "@apollo/client";

export function Header() {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.logout);
  const router = useRouter();

  const [logoutUser] = useMutation(LOGOUT_MUTATION, {
    onCompleted: () => {
      clearAuth(); // Clear frontend state
      router.push("/auth/login"); // Redirect
    },
    // Optional: handle errors if logout fails
    onError: () => {
      // Fallback: still clear local state and redirect
      clearAuth();
      router.push("/auth/login");
    },
  });
  const handleLogout = () => {
    logoutUser();
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-secondary/30 px-6">
      <div>
        {/* We can place the switcher on the left */}
        <OrganizationSwitcher />
      </div>
      {user ? (
        <div className="flex items-center gap-4">
          <span>Welcome, {user.first_name}</span>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </header>
  );
}
