// src/types/incident.types.ts

/**
 * Incident type categories matching backend IncidentType enum
 */
export enum IncidentType {
  HARASSMENT = "HARASSMENT",
  MEDICAL = "MEDICAL",
  TECHNICAL = "TECHNICAL",
  SECURITY = "SECURITY",
  ACCESSIBILITY = "ACCESSIBILITY",
}

/**
 * Incident severity levels matching backend IncidentSeverity enum
 */
export enum IncidentSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

/**
 * Incident status for lifecycle tracking matching backend IncidentStatus enum
 */
export enum IncidentStatus {
  REPORTED = "REPORTED",
  ACKNOWLEDGED = "ACKNOWLEDGED",
  INVESTIGATING = "INVESTIGATING",
  RESOLVED = "RESOLVED",
}

/**
 * Status values that admins can update to (excludes REPORTED which is initial state)
 */
export enum IncidentUpdateStatus {
  ACKNOWLEDGED = "ACKNOWLEDGED",
  INVESTIGATING = "INVESTIGATING",
  RESOLVED = "RESOLVED",
}

/**
 * Lightweight representation of the user who reported an incident
 */
export interface IncidentReporter {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

/**
 * Lightweight representation of the admin assigned to an incident
 */
export interface IncidentAssignee {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

/**
 * Full incident object returned from the backend
 */
export interface Incident {
  id: string;
  createdAt: string;
  updatedAt: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  details: string;
  reporterId: string;
  organizationId: string;
  eventId: string;
  sessionId: string;
  assigneeId: string | null;
  resolutionNotes: string | null;
  reporter: IncidentReporter;
  assignee?: IncidentAssignee | null;
}

/**
 * Payload for reporting a new incident
 */
export interface ReportIncidentPayload {
  type: IncidentType;
  severity: IncidentSeverity;
  details: string;
  idempotencyKey: string;
}

/**
 * Payload for updating an incident status
 */
export interface UpdateIncidentPayload {
  incidentId: string;
  status: IncidentUpdateStatus;
  resolutionNotes?: string;
  idempotencyKey: string;
}

/**
 * Response from incident.report WebSocket event
 */
export interface ReportIncidentResponse {
  success: boolean;
  message?: string;
  incidentId?: string;
  error?: string;
}

/**
 * Response from incident.update_status WebSocket event
 */
export interface UpdateIncidentResponse {
  success: boolean;
  incidentId?: string;
  error?: string;
}

/**
 * Response from incidents.join WebSocket event
 */
export interface JoinIncidentsResponse {
  success: boolean;
  error?: string;
}

/**
 * Human-readable labels for incident types
 */
export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  [IncidentType.HARASSMENT]: "Harassment",
  [IncidentType.MEDICAL]: "Medical Emergency",
  [IncidentType.TECHNICAL]: "Technical Issue",
  [IncidentType.SECURITY]: "Security Concern",
  [IncidentType.ACCESSIBILITY]: "Accessibility Issue",
};

/**
 * Human-readable labels for incident severity levels
 */
export const INCIDENT_SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  [IncidentSeverity.LOW]: "Low",
  [IncidentSeverity.MEDIUM]: "Medium",
  [IncidentSeverity.HIGH]: "High",
  [IncidentSeverity.CRITICAL]: "Critical",
};

/**
 * Human-readable labels for incident status
 */
export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  [IncidentStatus.REPORTED]: "Reported",
  [IncidentStatus.ACKNOWLEDGED]: "Acknowledged",
  [IncidentStatus.INVESTIGATING]: "Investigating",
  [IncidentStatus.RESOLVED]: "Resolved",
};

/**
 * Descriptions for incident types to help users select the right category
 */
export const INCIDENT_TYPE_DESCRIPTIONS: Record<IncidentType, string> = {
  [IncidentType.HARASSMENT]:
    "Report inappropriate behavior, bullying, or harassment",
  [IncidentType.MEDICAL]:
    "Medical emergency requiring immediate assistance",
  [IncidentType.TECHNICAL]:
    "Technical problems with audio, video, or platform features",
  [IncidentType.SECURITY]:
    "Security concerns including unauthorized access or threats",
  [IncidentType.ACCESSIBILITY]:
    "Issues with accessibility features or accommodations",
};

/**
 * Color mappings for severity levels (for UI badges)
 */
export const INCIDENT_SEVERITY_COLORS: Record<
  IncidentSeverity,
  { bg: string; text: string; border: string }
> = {
  [IncidentSeverity.LOW]: {
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700",
  },
  [IncidentSeverity.MEDIUM]: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-400",
    border: "border-yellow-200 dark:border-yellow-800",
  },
  [IncidentSeverity.HIGH]: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-800",
  },
  [IncidentSeverity.CRITICAL]: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
  },
};

/**
 * Color mappings for status (for UI badges)
 */
export const INCIDENT_STATUS_COLORS: Record<
  IncidentStatus,
  { bg: string; text: string; border: string }
> = {
  [IncidentStatus.REPORTED]: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
  },
  [IncidentStatus.ACKNOWLEDGED]: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800",
  },
  [IncidentStatus.INVESTIGATING]: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
  },
  [IncidentStatus.RESOLVED]: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
  },
};

/**
 * Icons for incident types (Lucide icon names)
 */
export const INCIDENT_TYPE_ICONS: Record<IncidentType, string> = {
  [IncidentType.HARASSMENT]: "ShieldAlert",
  [IncidentType.MEDICAL]: "Heart",
  [IncidentType.TECHNICAL]: "Wrench",
  [IncidentType.SECURITY]: "Lock",
  [IncidentType.ACCESSIBILITY]: "Accessibility",
};
