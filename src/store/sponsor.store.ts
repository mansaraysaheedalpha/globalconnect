// src/store/sponsor.store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface SponsorMembership {
  id: string;
  eventId: string;
  companyName: string;
  companyLogoUrl?: string | null;
  role: string | null;
}

interface SponsorState {
  // Current active sponsor context
  activeSponsorId: string | null;
  activeEventId: string | null;
  activeSponsorName: string | null;
  activeRole: string | null;

  // All sponsors the user represents
  sponsors: SponsorMembership[];

  // Actions
  setActiveSponsor: (sponsorId: string, eventId: string, sponsorName: string, role: string | null) => void;
  setSponsors: (sponsors: SponsorMembership[]) => void;
  clearSponsorContext: () => void;
  hasMultipleSponsors: () => boolean;
}

/**
 * Sync sponsor state to cookie for middleware access
 */
function syncSponsorToCookie(state: { activeSponsorId: string | null; activeEventId: string | null }) {
  if (typeof document === 'undefined') return;

  const sponsorData = JSON.stringify({
    state: {
      activeSponsorId: state.activeSponsorId,
      activeEventId: state.activeEventId,
    },
  });

  if (state.activeSponsorId) {
    document.cookie = `sponsor-storage=${encodeURIComponent(sponsorData)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  } else {
    document.cookie = 'sponsor-storage=; path=/; max-age=0; SameSite=Lax';
  }
}

/**
 * Clear sponsor cookie
 */
function clearSponsorCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = 'sponsor-storage=; path=/; max-age=0; SameSite=Lax';
}

export const useSponsorStore = create<SponsorState>()(
  persist(
    (set, get) => ({
      activeSponsorId: null,
      activeEventId: null,
      activeSponsorName: null,
      activeRole: null,
      sponsors: [],

      setActiveSponsor: (sponsorId, eventId, sponsorName, role) => {
        set({
          activeSponsorId: sponsorId,
          activeEventId: eventId,
          activeSponsorName: sponsorName,
          activeRole: role,
        });
        syncSponsorToCookie({ activeSponsorId: sponsorId, activeEventId: eventId });
      },

      setSponsors: (sponsors) => {
        set({ sponsors });

        // If there's only one sponsor and no active context, auto-select it
        const state = get();
        if (sponsors.length === 1 && !state.activeSponsorId) {
          const sponsor = sponsors[0];
          set({
            activeSponsorId: sponsor.id,
            activeEventId: sponsor.eventId,
            activeSponsorName: sponsor.companyName,
            activeRole: sponsor.role,
          });
          syncSponsorToCookie({ activeSponsorId: sponsor.id, activeEventId: sponsor.eventId });
        }
      },

      clearSponsorContext: () => {
        set({
          activeSponsorId: null,
          activeEventId: null,
          activeSponsorName: null,
          activeRole: null,
          sponsors: [],
        });
        clearSponsorCookie();
      },

      hasMultipleSponsors: () => {
        return get().sponsors.length > 1;
      },
    }),
    {
      name: "sponsor-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeSponsorId: state.activeSponsorId,
        activeEventId: state.activeEventId,
        activeSponsorName: state.activeSponsorName,
        activeRole: state.activeRole,
        sponsors: state.sponsors,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.activeSponsorId) {
          syncSponsorToCookie({
            activeSponsorId: state.activeSponsorId,
            activeEventId: state.activeEventId,
          });
        }
      },
    }
  )
);

// Export helper to get sponsor state without hooks
export function getSponsorState() {
  return useSponsorStore.getState();
}

// Export helper to check if user has active sponsor context
export function hasActiveSponsor(): boolean {
  const state = useSponsorStore.getState();
  return !!state.activeSponsorId;
}

// Export helper to get active sponsor ID
export function getActiveSponsorId(): string | null {
  return useSponsorStore.getState().activeSponsorId;
}

// Export helper to get active event ID
export function getActiveEventId(): string | null {
  return useSponsorStore.getState().activeEventId;
}
