// src/types/sponsor.ts

/**
 * Intent levels for lead scoring
 */
export type IntentLevel = "cold" | "warm" | "hot";

/**
 * Lead action types
 */
export type LeadAction =
  | "BOOTH_VISIT"
  | "CONTENT_DOWNLOADED"
  | "DEMO_REQUESTED"
  | "CONTACT_SHARED"
  | "SESSION_ATTENDED"
  | "AD_CLICKED";

/**
 * Lead user information
 */
export interface LeadUser {
  id: string;
  name: string;
}

/**
 * Individual lead data
 */
export interface Lead {
  userId: string;
  userName: string;
  action: LeadAction | string;
  intentScore: number;
  timestamp: string;
  actions: LeadActionEntry[];
}

/**
 * Lead action history entry
 */
export interface LeadActionEntry {
  action: string;
  timestamp: string;
}

/**
 * Lead captured event payload from server
 */
export interface LeadCapturedPayload {
  user: LeadUser;
  action: string;
  timestamp: string;
}

/**
 * Lead intent update event payload from server
 */
export interface LeadIntentUpdatePayload {
  leadUserId: string;
  intentScore: number;
  latestAction: string;
}

/**
 * State for the useSponsors hook
 */
export interface SponsorLeadsState {
  leads: Lead[];
  isConnected: boolean;
  isJoined: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Response from server for sponsor operations
 */
export interface SponsorResponse {
  success: boolean;
  error?: string;
}

/**
 * Helper function to determine intent level from score
 */
export function getIntentLevel(intentScore: number): IntentLevel {
  if (intentScore >= 70) return "hot";
  if (intentScore >= 40) return "warm";
  return "cold";
}

/**
 * Intent level colors for styling
 */
export const INTENT_LEVEL_COLORS: Record<IntentLevel, string> = {
  cold: "blue",
  warm: "yellow",
  hot: "red",
};

/**
 * Intent level labels for display
 */
export const INTENT_LEVEL_LABELS: Record<IntentLevel, string> = {
  cold: "Cold Lead",
  warm: "Warm Lead",
  hot: "Hot Lead",
};
