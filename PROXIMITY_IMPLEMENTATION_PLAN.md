# Proximity Networking Feature - Frontend Implementation Plan

## Overview

Wire the existing backend proximity feature (real-time-service) to the globalconnect frontend, enabling attendees to discover and interact with nearby users at events.

## Backend Summary (Already Implemented)

The real-time-service has a fully functional proximity system:

**WebSocket Events:**
| Event | Direction | Purpose |
|-------|-----------|---------|
| `proximity.location.update` | Client → Server | Send user's GPS coordinates |
| `proximity.ping` | Client → Server | Send message to nearby user |
| `proximity.roster.updated` | Server → Client | Receive list of nearby users |
| `proximity.ping.received` | Server → Client | Receive ping from someone |

**Data Structures:**
```typescript
// Location Update (send)
{ latitude: number; longitude: number; idempotencyKey: string }

// Proximity Ping (send)
{ targetUserId: string; message?: string; idempotencyKey: string }

// Roster Update (receive)
{ nearbyUserIds: string[] }
// OR advanced format from AI service:
{ userId: string; nearbyUsers: [{ user: { id, name, avatarUrl }, distance, sharedInterests }] }

// Ping Received (receive)
{ fromUser: { id: string; name: string }; message: string }
```

---

## Implementation Tasks

### Task 1: Create Proximity Types
**File:** `src/types/proximity.ts`

Define TypeScript interfaces for:
- `NearbyUser` - user info with distance and shared interests
- `ProximityPing` - incoming ping structure
- `ProximityState` - hook state management
- `LocationUpdate` - GPS coordinates payload

### Task 2: Create `useProximity` Hook
**File:** `src/hooks/use-proximity.ts`

Following the pattern of `use-session-chat.ts`:
- Connect to `/events` namespace with auth token
- Send location updates periodically (every 10 seconds when active)
- Listen for `proximity.roster.updated` events
- Listen for `proximity.ping.received` events
- Expose methods: `updateLocation()`, `sendPing()`, `startTracking()`, `stopTracking()`
- Manage state: `nearbyUsers`, `receivedPings`, `isTracking`, `isConnected`, `error`
- Use Geolocation API with permission handling
- Generate UUID idempotency keys

### Task 3: Create Nearby Users Panel Component
**File:** `src/components/features/proximity/nearby-users-panel.tsx`

UI component showing:
- List of nearby attendees (avatar, name, distance if available)
- "Ping" button for each user
- Empty state when no one is nearby
- Loading state while fetching location
- Permission denied state

### Task 4: Create Proximity Ping Notification Component
**File:** `src/components/features/proximity/ping-notification.tsx`

Toast/notification component:
- Shows when receiving a ping from someone
- Displays sender name and message
- Auto-dismiss after 5 seconds
- Action button to view sender profile or reply

### Task 5: Create Floating Proximity Widget
**File:** `src/components/features/proximity/floating-proximity-widget.tsx`

Floating button/widget for the event page:
- Shows count of nearby users
- Expands to show nearby users panel
- Toggle button to enable/disable proximity tracking
- Visual indicator when tracking is active

### Task 6: Create Proximity Container Component
**File:** `src/components/features/proximity/proximity-container.tsx`

Orchestrator component that:
- Uses the `useProximity` hook
- Renders the floating widget
- Manages ping notifications queue
- Handles permission requests

### Task 7: Create Index Export
**File:** `src/components/features/proximity/index.ts`

Export all proximity components for clean imports.

### Task 8: Integrate with Attendee Event Page
**File:** `src/app/(attendee)/attendee/events/[eventId]/page.tsx`

Add to existing page:
- Import `ProximityContainer`
- Add component alongside other floating widgets
- Pass `eventId` for context

---

## File Structure

```
globalconnect/src/
├── types/
│   └── proximity.ts                    # Type definitions
├── hooks/
│   └── use-proximity.ts                # Real-time hook
└── components/features/proximity/
    ├── index.ts                        # Exports
    ├── nearby-users-panel.tsx          # User list UI
    ├── ping-notification.tsx           # Incoming ping toast
    ├── floating-proximity-widget.tsx   # Floating trigger button
    └── proximity-container.tsx         # Orchestrator
```

---

## Technical Considerations

1. **Geolocation Permissions**: Request only when user enables tracking, handle denied gracefully
2. **Battery/Data Usage**: 10-second update interval, stop when app is backgrounded
3. **Privacy**: Clear indicator when tracking is active, easy toggle to disable
4. **Optimistic Updates**: Show ping as sent immediately, handle failures gracefully
5. **Connection Recovery**: Auto-reconnect and resume tracking on connection loss

---

## Execution Order

1. Types (foundation)
2. Hook (core logic)
3. Nearby Users Panel (basic UI)
4. Ping Notification (basic UI)
5. Floating Widget (container UI)
6. Proximity Container (orchestration)
7. Index exports
8. Page integration
