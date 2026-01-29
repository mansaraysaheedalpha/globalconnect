// src/types/leads.ts
// Enterprise-grade lead type definitions matching SponsorLeadResponse schema

export interface LeadInteraction {
  type: string;
  timestamp: string;
  duration_seconds?: number;
  content_name?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface Lead {
  id: string;
  sponsor_id: string;
  event_id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  user_company: string | null;
  user_title: string | null;
  intent_score: number;
  intent_level: "hot" | "warm" | "cold";
  first_interaction_at: string;
  last_interaction_at: string;
  interaction_count: number;
  interactions: LeadInteraction[];
  contact_requested: boolean;
  contact_notes: string | null;
  preferred_contact_method: string | null;
  follow_up_status: "new" | "contacted" | "qualified" | "not_interested" | "converted";
  follow_up_notes: string | null;
  followed_up_at: string | null;
  followed_up_by_user_id: string | null;
  tags: string[];
  is_starred: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadStats {
  total_leads: number;
  hot_leads: number;
  warm_leads: number;
  cold_leads: number;
  leads_contacted: number;
  leads_converted: number;
  conversion_rate: number;
  avg_intent_score: number;
}

export interface UseLeadsOptions {
  sponsorId: string;
  enabled?: boolean;
  limit?: number;
  intentLevel?: "hot" | "warm" | "cold";
  autoRefreshInterval?: number;
}

export interface UseLeadsReturn {
  // Data
  leads: Lead[];
  stats: LeadStats | null;

  // Loading states
  isLoading: boolean;
  isLoadingStats: boolean;
  isFetchingNextPage: boolean;

  // Error states
  error: Error | null;
  statsError: Error | null;

  // Pagination
  hasNextPage: boolean;
  fetchNextPage: () => void;

  // Actions
  refetch: () => void;
  updateLead: (leadId: string, update: LeadUpdate) => Promise<Lead>;

  // Real-time status
  isRealTimeConnected: boolean;
  lastUpdated: Date | null;
}

export interface LeadUpdate {
  follow_up_status?: "new" | "contacted" | "qualified" | "not_interested" | "converted";
  follow_up_notes?: string;
  tags?: string[];
  is_starred?: boolean;
  contact_notes?: string;
}

// WebSocket event payloads
export interface LeadCapturedEvent {
  id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  user_company: string | null;
  user_title: string | null;
  intent_score: number;
  intent_level: "hot" | "warm" | "cold";
  interaction_type: string;
  created_at: string;
}

export interface LeadIntentUpdatedEvent {
  lead_id: string;
  intent_score: number;
  intent_level: "hot" | "warm" | "cold";
  interaction_count: number;
}

// Timeline data types for analytics charts
export interface LeadTimelineDataPoint {
  date: string; // ISO date string (YYYY-MM-DD)
  total: number;
  hot: number;
  warm: number;
  cold: number;
}

export interface LeadTimelineResponse {
  data: LeadTimelineDataPoint[];
  period: "daily" | "hourly";
  total_leads: number;
}

export interface EngagementDataPoint {
  hour: number; // 0-23
  interaction_count: number;
  unique_visitors: number;
  avg_duration_seconds: number | null;
}

export interface EngagementTimelineResponse {
  data: EngagementDataPoint[];
  peak_hour: number;
  total_interactions: number;
}
