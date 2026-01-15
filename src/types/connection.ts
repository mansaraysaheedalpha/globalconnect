// src/types/connection.ts

/**
 * Connection type enum matching backend
 */
export type ConnectionType =
  | "PROXIMITY_PING"
  | "DM_INITIATED"
  | "SESSION_QA"
  | "MANUAL_EXCHANGE";

/**
 * Connection strength - calculated based on activity
 */
export type ConnectionStrength = "WEAK" | "MODERATE" | "STRONG";

/**
 * Outcome type enum for connection outcomes
 */
export type OutcomeType =
  | "MEETING_HELD"
  | "JOB_REFERRAL"
  | "PARTNERSHIP"
  | "SALE_DEAL"
  | "MENTORSHIP"
  | "OTHER";

/**
 * Activity types for connection activity tracking
 */
export type ConnectionActivityType =
  | "INITIAL_CONNECT"
  | "DM_SENT"
  | "DM_RECEIVED"
  | "HUDDLE_TOGETHER"
  | "FOLLOW_UP_SENT"
  | "FOLLOW_UP_OPENED"
  | "FOLLOW_UP_REPLIED"
  | "MEETING_SCHEDULED"
  | "MEETING_HELD"
  | "OUTCOME_REPORTED"
  | "LINKEDIN_CONNECTED";

/**
 * Follow-up tone options for AI generation
 */
export type FollowUpTone = "professional" | "friendly" | "casual";

/**
 * Context type for connection context
 */
export type ContextType =
  | "SHARED_SESSION"
  | "SHARED_INTEREST"
  | "MUTUAL_CONNECTION"
  | "SAME_COMPANY_SIZE"
  | "SAME_INDUSTRY"
  | "QA_INTERACTION";

/**
 * User reference for connection
 */
export interface ConnectionUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatarUrl: string | null;
}

/**
 * Connection context item
 */
export interface ConnectionContext {
  id: string;
  contextType: ContextType;
  contextValue: string;
}

/**
 * Connection activity record
 */
export interface ConnectionActivity {
  id: string;
  createdAt: string;
  activityType: ConnectionActivityType;
  description: string | null;
  initiatorId: string | null;
}

/**
 * Full connection with user details and context
 */
export interface Connection {
  id: string;
  userAId: string;
  userBId: string;
  eventId: string;
  connectedAt: string;
  connectionType: ConnectionType;
  initialMessage: string | null;
  strength: ConnectionStrength;
  lastInteractionAt: string | null;
  interactionCount: number;
  followUpSentAt: string | null;
  followUpOpenedAt: string | null;
  followUpRepliedAt: string | null;
  followUpMessage: string | null;
  meetingScheduled: boolean;
  meetingDate: string | null;
  outcomeType: OutcomeType | null;
  outcomeNotes: string | null;
  outcomeReportedAt: string | null;
  userA: ConnectionUser;
  userB: ConnectionUser;
  contexts: ConnectionContext[];
  activities?: ConnectionActivity[];
}

/**
 * AI-generated follow-up suggestion
 */
export interface FollowUpSuggestion {
  connectionId: string;
  suggestedSubject: string;
  suggestedMessage: string;
  talkingPoints: string[];
  contextUsed: string[];
}

/**
 * Strength distribution for analytics
 */
export interface StrengthDistribution {
  WEAK: number;
  MODERATE: number;
  STRONG: number;
}

/**
 * DTO for creating a connection
 */
export interface CreateConnectionDto {
  userAId: string;
  userBId: string;
  eventId: string;
  connectionType?: ConnectionType;
  initialMessage?: string;
}

/**
 * DTO for reporting an outcome
 */
export interface ReportOutcomeDto {
  outcomeType: OutcomeType;
  outcomeNotes?: string;
  meetingScheduled?: boolean;
  meetingDate?: string;
}

/**
 * Event networking statistics
 */
export interface EventNetworkingStats {
  totalConnections: number;
  uniqueNetworkers: number;
  followUpsSent: number;
  followUpRate: number;
  meetingsScheduled: number;
  reportedOutcomes: number;
  connectionsByType: Record<string, number>;
  topConnectors: Array<{
    userId: string;
    name: string;
    connectionCount: number;
  }>;
}

/**
 * User networking statistics
 */
export interface UserNetworkingStats {
  totalConnections: number;
  eventCount: number;
  followUpRate: number;
  outcomeRate: number;
  connectionsByEvent: Array<{
    eventId: string;
    count: number;
  }>;
}

/**
 * Get the "other" user from a connection (the one that isn't the current user)
 */
export function getOtherUser(
  connection: Connection,
  currentUserId: string
): ConnectionUser {
  return connection.userAId === currentUserId
    ? connection.userB
    : connection.userA;
}

/**
 * Format user's full name
 */
export function formatUserName(user: ConnectionUser): string {
  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || "Unknown User";
}

/**
 * Get user initials for avatar fallback
 */
export function getUserInitials(user: ConnectionUser): string {
  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "??";
}

/**
 * Get human-readable strength label
 */
export function getStrengthLabel(strength: ConnectionStrength): string {
  switch (strength) {
    case "WEAK":
      return "New Connection";
    case "MODERATE":
      return "Growing";
    case "STRONG":
      return "Strong Connection";
    default:
      return strength;
  }
}

/**
 * Get color class for strength indicator
 */
export function getStrengthColor(strength: ConnectionStrength): string {
  switch (strength) {
    case "WEAK":
      return "text-gray-500";
    case "MODERATE":
      return "text-yellow-500";
    case "STRONG":
      return "text-green-500";
    default:
      return "text-gray-500";
  }
}

/**
 * Get background color class for strength badge
 */
export function getStrengthBgColor(strength: ConnectionStrength): string {
  switch (strength) {
    case "WEAK":
      return "bg-gray-100";
    case "MODERATE":
      return "bg-yellow-100";
    case "STRONG":
      return "bg-green-100";
    default:
      return "bg-gray-100";
  }
}

/**
 * Get human-readable connection type label
 */
export function getConnectionTypeLabel(type: ConnectionType): string {
  switch (type) {
    case "PROXIMITY_PING":
      return "Met Nearby";
    case "DM_INITIATED":
      return "Started Chat";
    case "SESSION_QA":
      return "Q&A Exchange";
    case "MANUAL_EXCHANGE":
      return "Exchanged Info";
    default:
      return type;
  }
}

/**
 * Get human-readable activity label
 */
export function getActivityLabel(type: ConnectionActivityType): string {
  switch (type) {
    case "INITIAL_CONNECT":
      return "Connected";
    case "DM_SENT":
      return "Sent message";
    case "DM_RECEIVED":
      return "Received message";
    case "HUDDLE_TOGETHER":
      return "Attended huddle together";
    case "FOLLOW_UP_SENT":
      return "Sent follow-up";
    case "FOLLOW_UP_OPENED":
      return "Opened follow-up";
    case "FOLLOW_UP_REPLIED":
      return "Replied to follow-up";
    case "MEETING_SCHEDULED":
      return "Scheduled meeting";
    case "MEETING_HELD":
      return "Had meeting";
    case "OUTCOME_REPORTED":
      return "Reported outcome";
    case "LINKEDIN_CONNECTED":
      return "Connected on LinkedIn";
    default:
      return type;
  }
}

/**
 * Format relative time (e.g., "2h ago", "3d ago")
 */
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins <= 1 ? "Just now" : `${diffMins}m ago`;
    }
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}
