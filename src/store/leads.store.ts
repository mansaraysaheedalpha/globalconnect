// src/store/leads.store.ts
/**
 * Zustand store for lead management with optimistic updates.
 *
 * This store provides:
 * - Centralized lead state management across components
 * - Optimistic updates for instant UI feedback
 * - Rollback capability for failed operations
 * - Direct WebSocket event handling without refetching
 * - Proper intent-level stats tracking
 */

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  Lead,
  LeadStats,
  LeadUpdate,
  LeadCapturedEvent,
  LeadIntentUpdatedEvent,
} from "@/types/leads";

// Extended lead type with pending state for optimistic updates
interface PendingLead extends Lead {
  _pending?: boolean;
  _optimisticId?: string;
}

interface PendingUpdate {
  originalLead: Lead;
  update: Partial<Lead>;
}

interface LeadsState {
  // Data
  leads: PendingLead[];
  stats: LeadStats | null;
  sponsorId: string | null;

  // Loading states
  isLoading: boolean;
  isLoadingStats: boolean;

  // Pending operations for rollback
  pendingUpdates: Map<string, PendingUpdate>;

  // Actions - Data Management
  setLeads: (leads: Lead[]) => void;
  setStats: (stats: LeadStats) => void;
  setSponsorId: (sponsorId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setLoadingStats: (isLoadingStats: boolean) => void;
  clearStore: () => void;

  // Actions - Optimistic Updates
  optimisticAddLead: (lead: LeadCapturedEvent) => void;
  optimisticUpdateLead: (leadId: string, update: Partial<Lead>) => void;
  commitUpdate: (leadId: string) => void;
  rollbackUpdate: (leadId: string) => void;

  // Actions - Real-time Event Handlers
  handleLeadCaptured: (event: LeadCapturedEvent) => void;
  handleIntentUpdated: (event: LeadIntentUpdatedEvent) => void;
  handleStatsUpdated: (stats: LeadStats) => void;

  // Selectors
  getLeadById: (leadId: string) => Lead | undefined;
  getHotLeads: () => Lead[];
  getWarmLeads: () => Lead[];
  getColdLeads: () => Lead[];
}

export const useLeadsStore = create<LeadsState>()(
  immer((set, get) => ({
    // Initial state
    leads: [],
    stats: null,
    sponsorId: null,
    isLoading: true,
    isLoadingStats: true,
    pendingUpdates: new Map(),

    // ==========================================
    // Data Management Actions
    // ==========================================

    setLeads: (leads) =>
      set((state) => {
        state.leads = leads;
        state.isLoading = false;
      }),

    setStats: (stats) =>
      set((state) => {
        // Only update stats if we have valid data (don't overwrite with null/empty)
        if (stats && stats.total_leads !== undefined) {
          state.stats = stats;
          state.isLoadingStats = false;
        } else if (state.stats !== null) {
          // If we already have stats, just mark loading as done (keep old stats)
          state.isLoadingStats = false;
        }
        // If stats is null and we have no previous stats, keep loading true
        // to show skeleton instead of 0
      }),

    setSponsorId: (sponsorId) =>
      set((state) => {
        // Only clear data if sponsor ACTUALLY changes (not on initial set from null)
        const sponsorChanged = state.sponsorId !== null && state.sponsorId !== sponsorId;
        if (sponsorChanged) {
          // Clear data when sponsor changes to a different sponsor
          state.leads = [];
          state.stats = null;
          state.isLoading = true;
          state.isLoadingStats = true;
        }
        state.sponsorId = sponsorId;
      }),

    setLoading: (isLoading) =>
      set((state) => {
        state.isLoading = isLoading;
      }),

    setLoadingStats: (isLoadingStats) =>
      set((state) => {
        state.isLoadingStats = isLoadingStats;
      }),

    clearStore: () =>
      set((state) => {
        state.leads = [];
        state.stats = null;
        state.sponsorId = null;
        state.isLoading = true;
        state.isLoadingStats = true;
        state.pendingUpdates.clear();
      }),

    // ==========================================
    // Optimistic Update Actions
    // ==========================================

    optimisticAddLead: (event) =>
      set((state) => {
        // Create a pending lead from the event
        const newLead: PendingLead = {
          id: event.id,
          sponsor_id: state.sponsorId || "",
          event_id: "",
          user_id: event.user_id,
          user_name: event.user_name,
          user_email: event.user_email,
          user_company: event.user_company,
          user_title: event.user_title,
          intent_score: event.intent_score,
          intent_level: event.intent_level,
          first_interaction_at: event.created_at,
          last_interaction_at: event.created_at,
          interaction_count: 1,
          interactions: [
            {
              type: event.interaction_type,
              timestamp: event.created_at,
            },
          ],
          contact_requested: false,
          contact_notes: null,
          preferred_contact_method: null,
          follow_up_status: "new",
          follow_up_notes: null,
          followed_up_at: null,
          followed_up_by_user_id: null,
          tags: [],
          is_starred: false,
          is_archived: false,
          created_at: event.created_at,
          updated_at: event.created_at,
          _pending: true,
          _optimisticId: event.id,
        };

        // Add to beginning of list
        state.leads.unshift(newLead);

        // Optimistically update stats
        if (state.stats) {
          state.stats.total_leads += 1;
          state.stats[`${event.intent_level}_leads`] += 1;
        }
      }),

    optimisticUpdateLead: (leadId, update) =>
      set((state) => {
        const index = state.leads.findIndex((l) => l.id === leadId);
        if (index === -1) return;

        const lead = state.leads[index];

        // Store original for rollback
        state.pendingUpdates.set(leadId, {
          originalLead: { ...lead },
          update,
        });

        // Apply optimistic update
        Object.assign(state.leads[index], update, { _pending: true });
      }),

    commitUpdate: (leadId) =>
      set((state) => {
        state.pendingUpdates.delete(leadId);
        const lead = state.leads.find((l) => l.id === leadId);
        if (lead) {
          delete lead._pending;
        }
      }),

    rollbackUpdate: (leadId) =>
      set((state) => {
        const pending = state.pendingUpdates.get(leadId);
        if (!pending) return;

        const index = state.leads.findIndex((l) => l.id === leadId);
        if (index !== -1) {
          // Restore original lead
          state.leads[index] = pending.originalLead;
        }

        state.pendingUpdates.delete(leadId);
      }),

    // ==========================================
    // Real-time Event Handlers
    // ==========================================

    handleLeadCaptured: (event) =>
      set((state) => {
        // Check if lead already exists (might have been added optimistically)
        const existingIndex = state.leads.findIndex(
          (l) => l.id === event.id || l._optimisticId === event.id
        );

        if (existingIndex !== -1) {
          // Update existing lead with server data and remove pending flag
          const existing = state.leads[existingIndex];
          Object.assign(existing, {
            id: event.id,
            user_id: event.user_id,
            user_name: event.user_name,
            user_email: event.user_email,
            user_company: event.user_company,
            user_title: event.user_title,
            intent_score: event.intent_score,
            intent_level: event.intent_level,
            created_at: event.created_at,
            _pending: false,
            _optimisticId: undefined,
          });
        } else {
          // Add new lead from WebSocket event
          const newLead: PendingLead = {
            id: event.id,
            sponsor_id: state.sponsorId || "",
            event_id: "",
            user_id: event.user_id,
            user_name: event.user_name,
            user_email: event.user_email,
            user_company: event.user_company,
            user_title: event.user_title,
            intent_score: event.intent_score,
            intent_level: event.intent_level,
            first_interaction_at: event.created_at,
            last_interaction_at: event.created_at,
            interaction_count: 1,
            interactions: [
              {
                type: event.interaction_type,
                timestamp: event.created_at,
              },
            ],
            contact_requested: false,
            contact_notes: null,
            preferred_contact_method: null,
            follow_up_status: "new",
            follow_up_notes: null,
            followed_up_at: null,
            followed_up_by_user_id: null,
            tags: [],
            is_starred: false,
            is_archived: false,
            created_at: event.created_at,
            updated_at: event.created_at,
          };

          state.leads.unshift(newLead);

          // Update stats for new lead
          if (state.stats) {
            state.stats.total_leads += 1;
            state.stats[`${event.intent_level}_leads`] += 1;
          }
        }
      }),

    handleIntentUpdated: (event) =>
      set((state) => {
        const lead = state.leads.find((l) => l.id === event.lead_id);
        if (!lead) return;

        const oldLevel = lead.intent_level;
        const newLevel = event.intent_level;

        // Update lead
        lead.intent_score = event.intent_score;
        lead.intent_level = newLevel;
        lead.interaction_count = event.interaction_count;
        lead.last_interaction_at = new Date().toISOString();

        // Update stats if intent level changed
        if (state.stats && oldLevel !== newLevel) {
          state.stats[`${oldLevel}_leads`] = Math.max(
            0,
            state.stats[`${oldLevel}_leads`] - 1
          );
          state.stats[`${newLevel}_leads`] += 1;
        }
      }),

    handleStatsUpdated: (stats) =>
      set((state) => {
        // Only update if we receive valid stats data
        if (stats && stats.total_leads !== undefined) {
          state.stats = stats;
          state.isLoadingStats = false;
        } else if (state.stats !== null) {
          // Keep existing stats if new data is invalid
          state.isLoadingStats = false;
        }
      }),

    // ==========================================
    // Selectors
    // ==========================================

    getLeadById: (leadId) => {
      return get().leads.find((l) => l.id === leadId);
    },

    getHotLeads: () => {
      return get().leads.filter((l) => l.intent_level === "hot");
    },

    getWarmLeads: () => {
      return get().leads.filter((l) => l.intent_level === "warm");
    },

    getColdLeads: () => {
      return get().leads.filter((l) => l.intent_level === "cold");
    },
  }))
);

// Export helper to get state without hooks
export function getLeadsState() {
  return useLeadsStore.getState();
}

// Export helper to check if store has data for a sponsor
export function hasLeadsForSponsor(sponsorId: string): boolean {
  const state = useLeadsStore.getState();
  return state.sponsorId === sponsorId && state.leads.length > 0;
}
