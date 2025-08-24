// src/store/auth.store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { jwtDecode } from "jwt-decode"; // We already installed this

interface User {
  id: string;
  email: string;
  first_name: string;
}

// Define the shape of our JWT payload again for use here
interface JwtPayload {
  orgId: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  orgId: string | null; // <-- ADD THIS NEW PROPERTY
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      orgId: null, // <-- INITIALIZE THE NEW PROPERTY

      // --- UPDATE THE `setAuth` FUNCTION ---
      setAuth: (token, user) => {
        // Decode the token to extract the orgId
        const decodedPayload = jwtDecode<JwtPayload>(token);
        const orgId = decodedPayload.orgId;

        // Set all auth-related state at once
        set({ token, user, orgId });
      },

      // --- UPDATE THE `logout` FUNCTION ---
      logout: () => set({ token: null, user: null, orgId: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
