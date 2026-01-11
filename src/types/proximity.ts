// src/types/proximity.ts

/**
 * User info for a nearby attendee
 */
export interface NearbyUser {
  id: string;
  name: string;
  avatarUrl?: string;
  distance?: number; // Distance in meters (from advanced AI matching)
  sharedInterests?: string[]; // Common interests (from advanced AI matching)
}

/**
 * Simple roster update from backend
 */
export interface SimpleRosterUpdate {
  nearbyUserIds: string[];
}

/**
 * Advanced roster update from AI service
 */
export interface AdvancedRosterUpdate {
  userId: string;
  nearbyUsers: {
    user: {
      id: string;
      name: string;
      avatarUrl?: string;
    };
    distance: number;
    sharedInterests: string[];
  }[];
}

/**
 * Union type for roster updates (can be either simple or advanced)
 */
export type RosterUpdate = SimpleRosterUpdate | AdvancedRosterUpdate;

/**
 * Incoming ping from another user
 */
export interface ProximityPing {
  fromUser: {
    id: string;
    name: string;
  };
  message: string;
  receivedAt: string; // ISO timestamp (added client-side)
}

/**
 * Location coordinates for updates
 */
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Payload for sending location update to server
 */
export interface LocationUpdatePayload extends LocationCoordinates {
  idempotencyKey: string;
}

/**
 * Payload for sending a ping to another user
 */
export interface ProximityPingPayload {
  targetUserId: string;
  message?: string;
  idempotencyKey: string;
}

/**
 * Response from server for proximity operations
 */
export interface ProximityResponse {
  success: boolean;
  error?: string;
}

/**
 * State for the useProximity hook
 */
export interface ProximityState {
  nearbyUsers: NearbyUser[];
  receivedPings: ProximityPing[];
  isTracking: boolean;
  isConnected: boolean;
  isJoined: boolean;
  error: string | null;
  locationPermission: 'granted' | 'denied' | 'prompt' | 'unavailable';
  lastLocation: LocationCoordinates | null;
}

/**
 * Type guard to check if roster update is advanced format
 */
export function isAdvancedRosterUpdate(
  update: RosterUpdate
): update is AdvancedRosterUpdate {
  return 'nearbyUsers' in update && Array.isArray(update.nearbyUsers);
}
