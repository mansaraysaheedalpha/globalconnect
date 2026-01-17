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
