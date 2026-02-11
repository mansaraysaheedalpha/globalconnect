// src/store/auth.store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import { performLogoutCleanup } from "@/lib/cleanup-utils";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  imageUrl?: string | null;
  role?: "OWNER" | "ADMIN" | "MEMBER" | null;
}

interface JwtPayload {
  orgId: string;
  exp?: number;
}

interface AuthState {
  token: string | null;
  onboardingToken: string | null;
  user: User | null;
  orgId: string | null;
  isRefreshing: boolean;
  lastRefreshAttempt: number | null;

  setAuth: (token: string, user: User) => void;
  setOnboardingToken: (token: string | null) => void;
  logout: () => void;
  updateUser: (newUserData: Partial<User>) => void;
  isTokenExpired: () => boolean;
  setIsRefreshing: (isRefreshing: boolean) => void;
  getTokenExpiry: () => number | null;
}

/**
 * Sync auth state to cookie for middleware access
 * This is a bridge solution until backend implements httpOnly cookies
 */
function syncAuthToCookie(state: { token: string | null; orgId: string | null }) {
  if (typeof document === 'undefined') return;

  const authData = JSON.stringify({
    state: {
      token: state.token,
      orgId: state.orgId,
    },
  });

  if (state.token) {
    // Set cookie with SameSite=Lax for navigation requests
    // Max age of 7 days (same as typical refresh token)
    document.cookie = `auth-storage=${encodeURIComponent(authData)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  } else {
    // Clear cookie on logout
    document.cookie = 'auth-storage=; path=/; max-age=0; SameSite=Lax';
  }
}

/**
 * Clear auth cookie on logout
 */
function clearAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = 'auth-storage=; path=/; max-age=0; SameSite=Lax';
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      onboardingToken: null,
      user: null,
      orgId: null,
      isRefreshing: false,
      lastRefreshAttempt: null,

      updateUser: (newUserData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...newUserData } });
        }
      },

      setAuth: (token, user) => {
        try {
          const decodedPayload = jwtDecode<JwtPayload>(token);
          const orgId = decodedPayload.orgId || null;

          set({
            token,
            user,
            orgId,
            onboardingToken: null,
            isRefreshing: false,
            lastRefreshAttempt: Date.now()
          });

          // Sync to cookie for middleware
          syncAuthToCookie({ token, orgId });
        } catch (error) {
          // Invalid token - clear auth state
          console.error('Failed to decode token:', error);
          set({ token: null, user: null, orgId: null, onboardingToken: null, isRefreshing: false });
          clearAuthCookie();
        }
      },

      setOnboardingToken: (token) => set({ onboardingToken: token }),

      logout: () => {
        // Clear all offline caches/queues to prevent data leaking to the next user
        performLogoutCleanup().catch((e) =>
          console.error("[Auth] Logout cleanup failed:", e)
        );
        set({ token: null, user: null, orgId: null, onboardingToken: null, isRefreshing: false, lastRefreshAttempt: null });
        clearAuthCookie();
      },

      setIsRefreshing: (isRefreshing) => set({ isRefreshing }),

      getTokenExpiry: () => {
        const token = get().token;
        if (!token) return null;

        try {
          const decoded = jwtDecode<JwtPayload>(token);
          return decoded.exp ? decoded.exp * 1000 : null;
        } catch {
          return null;
        }
      },

      isTokenExpired: () => {
        const token = get().token;
        if (!token) return true;

        try {
          const decoded = jwtDecode<JwtPayload>(token);
          if (!decoded.exp) return false;

          // Check if token expires within next 60 seconds
          const expiresAt = decoded.exp * 1000;
          const bufferMs = 60 * 1000;
          return Date.now() >= expiresAt - bufferMs;
        } catch {
          return true;
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        orgId: state.orgId,
      }),
      // Sync to cookie when state is rehydrated from localStorage
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          syncAuthToCookie({ token: state.token, orgId: state.orgId });
        }
      },
    }
  )
);

// Export helper to check auth status without hooks (for non-React code)
export function getAuthState() {
  return useAuthStore.getState();
}

// Export helper to check if user is authenticated
export function isAuthenticated(): boolean {
  const state = useAuthStore.getState();
  return !!state.token && !state.isTokenExpired();
}

// Export helper to check if user is an organizer
export function isOrganizer(): boolean {
  const state = useAuthStore.getState();
  return !!state.token && !!state.orgId;
}
