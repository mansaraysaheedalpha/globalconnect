// src/types/heatmap.ts

/**
 * Activity levels for heatmap zones
 */
export type ActivityLevel = "low" | "medium" | "high" | "critical";

/**
 * Session heat data from the backend
 */
export interface SessionHeatData {
  heat: number;
  chatVelocity: number;
  qnaVelocity: number;
}

/**
 * Raw heatmap data from the server (from heatmap.service.ts getHeatmapData)
 */
export interface HeatmapServerData {
  sessionHeat: Record<string, SessionHeatData>;
  updatedAt: string;
}

/**
 * Zone information for the heatmap display
 */
export interface HeatmapZone {
  zoneId: string;
  zoneName: string;
  activityLevel: ActivityLevel;
  attendeeCount: number;
  heatScore: number;
  chatVelocity: number;
  qnaVelocity: number;
}

/**
 * Processed heatmap data for the frontend
 */
export interface HeatmapData {
  zones: HeatmapZone[];
  totalAttendees: number;
  totalCapacity?: number;
  overallActivityLevel: ActivityLevel;
  updatedAt: string;
}

/**
 * State for the useHeatmap hook
 */
export interface HeatmapState {
  data: HeatmapData | null;
  isConnected: boolean;
  isJoined: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Response from server for heatmap operations
 */
export interface HeatmapResponse {
  success: boolean;
  error?: string;
}

/**
 * Configuration for activity level thresholds
 */
export interface ActivityThresholds {
  low: number;
  medium: number;
  high: number;
}

/**
 * Helper function to determine activity level from heat score
 */
export function getActivityLevel(
  heatScore: number,
  thresholds: ActivityThresholds = { low: 10, medium: 30, high: 60 }
): ActivityLevel {
  if (heatScore >= thresholds.high) return "critical";
  if (heatScore >= thresholds.medium) return "high";
  if (heatScore >= thresholds.low) return "medium";
  return "low";
}

/**
 * Activity level colors for styling
 */
export const ACTIVITY_LEVEL_COLORS: Record<ActivityLevel, string> = {
  low: "green",
  medium: "yellow",
  high: "orange",
  critical: "red",
};

/**
 * Activity level labels for display
 */
export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  low: "Low Activity",
  medium: "Moderate Activity",
  high: "High Activity",
  critical: "Very High Activity",
};
