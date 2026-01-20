// src/components/features/breakout/types.ts

export type BreakoutRoomStatus = 'WAITING' | 'ACTIVE' | 'CLOSING' | 'CLOSED';
export type BreakoutParticipantRole = 'FACILITATOR' | 'PARTICIPANT';

export interface BreakoutUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export interface BreakoutParticipant {
  id: string;
  userId: string;
  role: BreakoutParticipantRole;
  joinedAt: string;
  leftAt: string | null;
  user: BreakoutUser;
}

export interface BreakoutRoom {
  id: string;
  name: string;
  topic: string | null;
  sessionId: string;
  eventId: string;
  maxParticipants: number;
  durationMinutes: number;
  autoAssign: boolean;
  status: BreakoutRoomStatus;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  videoRoomId: string | null;
  videoRoomUrl: string | null;
  creator: BreakoutUser;
  facilitator: BreakoutUser | null;
  participants?: BreakoutParticipant[];
  _count: {
    participants: number;
  };
}

export interface CreateBreakoutRoomData {
  sessionId: string;
  eventId: string;
  name: string;
  topic?: string;
  maxParticipants?: number;
  durationMinutes?: number;
  autoAssign?: boolean;
  facilitatorId?: string;
  idempotencyKey?: string;
}

// Segment types
export type MatchOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'in'
  | 'notIn'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'exists'
  | 'regex';

// Single condition for matching
export interface MatchCondition {
  field: string;
  operator: MatchOperator;
  value: string | string[] | number | boolean;
}

// Compound criteria with AND/OR logic
export interface MatchCriteria {
  // For backward compatibility: single condition
  field?: string;
  operator?: MatchOperator;
  value?: string | string[] | number | boolean;
  // Compound conditions
  all?: MatchCondition[]; // AND - all conditions must match
  any?: MatchCondition[]; // OR - at least one condition must match
}

export interface BreakoutSegment {
  id: string;
  sessionId: string;
  eventId: string;
  name: string;
  description: string | null;
  color: string | null;
  matchCriteria: MatchCriteria | null;
  priority: number;
  creatorId: string;
  creator: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
  assignmentRules?: SegmentRule[];
  _count: {
    members: number;
    assignmentRules: number;
  };
}

export interface SegmentRule {
  segmentId: string;
  roomId: string;
  maxFromSegment: number | null;
  room: {
    id: string;
    name: string;
  };
}

export interface SegmentMember {
  segmentId: string;
  userId: string;
  isAutoAssigned: boolean;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

export type AssignmentStatus = 'PENDING' | 'NOTIFIED' | 'CONFIRMED' | 'JOINED' | 'DECLINED';

export interface RoomAssignment {
  sessionId: string;
  eventId: string;
  userId: string;
  roomId: string;
  segmentId: string | null;
  status: AssignmentStatus;
  notifiedAt: string | null;
  room: {
    id: string;
    name: string;
    topic: string | null;
    status: BreakoutRoomStatus;
    durationMinutes: number;
    facilitator: {
      id: string;
      firstName: string | null;
      lastName: string | null;
    } | null;
    _count: {
      participants: number;
    };
  };
}

export interface CreateSegmentData {
  sessionId: string;
  eventId: string;
  name: string;
  description?: string;
  color?: string;
  matchCriteria?: MatchCriteria;
  priority?: number;
}
