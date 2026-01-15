// src/types/huddle.ts

export type HuddleStatus =
  | "FORMING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type HuddleType =
  | "PROBLEM_BASED"
  | "SESSION_BASED"
  | "PROXIMITY_BASED"
  | "MANUAL";

export type HuddleParticipantStatus =
  | "INVITED"
  | "ACCEPTED"
  | "DECLINED"
  | "ATTENDED"
  | "NO_SHOW";

export interface HuddleInvitation {
  huddleId: string;
  topic: string;
  problemStatement: string | null;
  description: string | null;
  locationName: string | null;
  locationDetails: string | null;
  scheduledAt: Date | string;
  duration: number;
  currentParticipants: number;
  maxParticipants: number;
  confirmedAttendees: HuddleAttendee[];
}

export interface HuddleAttendee {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl?: string | null;
}

export interface Huddle {
  id: string;
  topic: string;
  problemStatement: string | null;
  description: string | null;
  eventId: string;
  sessionId: string | null;
  locationName: string | null;
  locationDetails: string | null;
  scheduledAt: Date | string;
  duration: number;
  status: HuddleStatus;
  huddleType: HuddleType;
  minParticipants: number;
  maxParticipants: number;
  currentParticipants: number;
  createdById: string | null;
}

export interface UserHuddle extends Huddle {
  myStatus: HuddleParticipantStatus;
}

export interface HuddleParticipantJoined {
  huddleId: string;
  userId: string;
  userName?: string;
  totalConfirmed: number;
}

export interface HuddleParticipantLeft {
  huddleId: string;
  userId: string;
  totalConfirmed: number;
}

export interface HuddleConfirmed {
  huddleId: string;
}

export interface HuddleCancelled {
  huddleId: string;
  reason: string;
}

export interface HuddleResponseError {
  huddleId: string;
  error: string;
  huddleFull?: boolean;
  message?: string;
}

export const formatAttendeeName = (attendee: HuddleAttendee): string => {
  if (attendee.firstName && attendee.lastName) {
    return `${attendee.firstName} ${attendee.lastName}`;
  }
  if (attendee.firstName) {
    return attendee.firstName;
  }
  return "Anonymous";
};

export const getAttendeeInitials = (attendee: HuddleAttendee): string => {
  const firstName = attendee.firstName || "";
  const lastName = attendee.lastName || "";
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "??";
};

export const getHuddleStatusLabel = (status: HuddleStatus): string => {
  switch (status) {
    case "FORMING":
      return "Forming";
    case "CONFIRMED":
      return "Confirmed";
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
};

export const getHuddleTypeLabel = (type: HuddleType): string => {
  switch (type) {
    case "PROBLEM_BASED":
      return "Problem Discussion";
    case "SESSION_BASED":
      return "Post-Session Discussion";
    case "PROXIMITY_BASED":
      return "Impromptu Meetup";
    case "MANUAL":
      return "Custom Huddle";
    default:
      return type;
  }
};
