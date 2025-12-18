# Presentation Control System - Backend Requirements

## Overview

This document describes how the frontend implements real-time presentation control and synchronization between organizers and attendees. The backend must implement the WebSocket events exactly as specified for the system to work correctly.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ORGANIZER (Presenter)                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  PresentationViewer Component                                    │    │
│  │  - Displays slides from REST API                                 │    │
│  │  - Controls: Next, Prev, Go To Slide, Start, Stop               │    │
│  │  - Uses usePresentationControl(sessionId, eventId, canControl=TRUE) │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ WebSocket Events
                                    │ (content.control)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              BACKEND SERVER                              │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  WebSocket Handler                                               │    │
│  │  - Receives: session.join, content.control, content.request_state│    │
│  │  - Broadcasts: slide.update to ALL users in session room         │    │
│  │  - Stores: Current slide state in Redis/memory                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ WebSocket Events
                                    │ (slide.update broadcast)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           ATTENDEE (Viewer)                              │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  AttendeePresentation Component                                  │    │
│  │  - Uses usePresentationControl(sessionId, eventId, canControl=FALSE)│
│  │  - Listens for slide.update events                               │    │
│  │  - Displays slides via SlideViewer component                     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Types

### SlideState (CRITICAL - Must match exactly)

```typescript
interface SlideState {
  currentSlide: number;    // 1-indexed (starts at 1, NOT 0)
  totalSlides: number;     // Total number of slides
  isActive: boolean;       // true = presentation is live, false = ended/not started
  slideUrls?: string[];    // Array of slide image URLs
}
```

### ContentAction

```typescript
type ContentAction = "START" | "STOP" | "NEXT_SLIDE" | "PREV_SLIDE" | "GO_TO_SLIDE";
```

---

## WebSocket Connection Flow

### 1. Client Connects

```
Frontend → Backend: Connect to WebSocket
URL: ${NEXT_PUBLIC_REALTIME_URL} (e.g., http://localhost:3002/events)
Auth: { token: "Bearer <jwt_token>" }
Query: { sessionId: "sess_xxx", eventId: "evt_xxx" }
Transport: websocket
```

### 2. Backend Acknowledges Connection

```
Backend → Frontend: emit("connectionAcknowledged")
```

### 3. Client Joins Session Room

```
Frontend → Backend: emit("session.join", { sessionId, eventId }, callback)

Backend Response (callback):
{
  success: true
}
// OR
{
  success: false,
  error: { message: "Error description" }
}
```

### 4. Client Requests Current State

```
Frontend → Backend: emit("content.request_state", { sessionId }, callback)

Backend Response (callback):
{
  success: true,
  state: {
    currentSlide: 1,        // 1-indexed!
    totalSlides: 10,
    isActive: true,         // or false if not started
    slideUrls: ["url1", "url2", ...]
  }
}
// OR if no active presentation:
{
  success: true,
  state: null
}
```

---

## Control Events (Organizer → Backend)

### Event: `content.control`

This is the main event for controlling the presentation.

**Payload:**
```typescript
{
  sessionId: string;
  action: "START" | "STOP" | "NEXT_SLIDE" | "PREV_SLIDE" | "GO_TO_SLIDE";
  targetSlide?: number;  // Only for GO_TO_SLIDE action
}
```

---

## Backend Handler Requirements

### ACTION: START

**When organizer clicks "Present Live":**

```typescript
// 1. Get presentation data from database
const presentation = await db.presentations.findOne({ session_id: sessionId });

if (!presentation) {
  return callback({ success: false, error: "No presentation found for this session" });
}

// 2. Create initial state - CRITICAL: currentSlide MUST be 1, not 0!
const newState: SlideState = {
  currentSlide: 1,           // ← MUST BE 1, NOT 0!
  totalSlides: presentation.slide_urls.length,
  isActive: true,            // ← MUST BE TRUE!
  slideUrls: presentation.slide_urls
};

// 3. Store state in Redis/memory
await redis.set(`presentation:${sessionId}`, JSON.stringify(newState));

// 4. BROADCAST to ALL users in the session room - THIS IS CRITICAL!
io.to(`session:${sessionId}`).emit("slide.update", newState);

// 5. Return success to organizer
callback({ success: true, newState });
```

### ACTION: STOP

**When organizer clicks "End Live":**

```typescript
// 1. Get current state
const stateJson = await redis.get(`presentation:${sessionId}`);
const currentState = JSON.parse(stateJson);

// 2. Update state to inactive
const newState: SlideState = {
  ...currentState,
  isActive: false            // ← MUST BE FALSE!
};

// 3. Store updated state
await redis.set(`presentation:${sessionId}`, JSON.stringify(newState));

// 4. BROADCAST to ALL users in the session room - THIS IS CRITICAL!
io.to(`session:${sessionId}`).emit("slide.update", newState);

// 5. Return success to organizer
callback({ success: true, newState });
```

### ACTION: NEXT_SLIDE

**When organizer clicks "Next":**

```typescript
// 1. Get current state
const stateJson = await redis.get(`presentation:${sessionId}`);
const currentState = JSON.parse(stateJson);

// 2. Validate and increment
if (currentState.currentSlide >= currentState.totalSlides) {
  return callback({ success: false, error: "Already at last slide" });
}

const newState: SlideState = {
  ...currentState,
  currentSlide: currentState.currentSlide + 1
};

// 3. Store updated state
await redis.set(`presentation:${sessionId}`, JSON.stringify(newState));

// 4. BROADCAST to ALL users in the session room - THIS IS CRITICAL!
io.to(`session:${sessionId}`).emit("slide.update", newState);

// 5. Return success to organizer
callback({ success: true, newState });
```

### ACTION: PREV_SLIDE

**When organizer clicks "Previous":**

```typescript
// 1. Get current state
const stateJson = await redis.get(`presentation:${sessionId}`);
const currentState = JSON.parse(stateJson);

// 2. Validate and decrement
if (currentState.currentSlide <= 1) {
  return callback({ success: false, error: "Already at first slide" });
}

const newState: SlideState = {
  ...currentState,
  currentSlide: currentState.currentSlide - 1
};

// 3. Store updated state
await redis.set(`presentation:${sessionId}`, JSON.stringify(newState));

// 4. BROADCAST to ALL users in the session room - THIS IS CRITICAL!
io.to(`session:${sessionId}`).emit("slide.update", newState);

// 5. Return success to organizer
callback({ success: true, newState });
```

### ACTION: GO_TO_SLIDE

**When organizer selects a specific slide:**

```typescript
// 1. Get current state
const stateJson = await redis.get(`presentation:${sessionId}`);
const currentState = JSON.parse(stateJson);

// 2. Validate targetSlide
const targetSlide = payload.targetSlide;
if (targetSlide < 1 || targetSlide > currentState.totalSlides) {
  return callback({ success: false, error: "Invalid slide number" });
}

const newState: SlideState = {
  ...currentState,
  currentSlide: targetSlide
};

// 3. Store updated state
await redis.set(`presentation:${sessionId}`, JSON.stringify(newState));

// 4. BROADCAST to ALL users in the session room - THIS IS CRITICAL!
io.to(`session:${sessionId}`).emit("slide.update", newState);

// 5. Return success to organizer
callback({ success: true, newState });
```

---

## Frontend SlideViewer Behavior

The SlideViewer component displays based on `slideState`:

```typescript
// If no slideState OR isActive is false → Shows waiting message
if (!slideState || !slideState.isActive) {
  return "Waiting for presentation to start...";
  // OR if slideState exists but isActive is false:
  return "Presentation has ended";
}

// If slideState exists AND isActive is true → Shows the slide
// Gets slide URL using: slideUrls[currentSlide - 1]  (converts 1-indexed to 0-indexed array access)
const currentSlideUrl = slideUrls[slideState.currentSlide - 1];
```

---

## Common Issues and Fixes

### Issue 1: Attendee shows "Waiting for presentation" even when live

**Cause:** `isActive` is `false` or `undefined` in the broadcast

**Fix:** Ensure `isActive: true` is set when handling START action

### Issue 2: Attendee shows "Slide 0"

**Cause:** `currentSlide` is `0` instead of `1`

**Fix:** Always initialize `currentSlide` to `1` (1-indexed, not 0-indexed)

### Issue 3: Attendee doesn't update when organizer changes slides

**Cause:** `slide.update` event not being broadcast to room

**Fix:** Always call `io.to(room).emit("slide.update", newState)` for EVERY action

### Issue 4: Attendee still shows slides after "End Live"

**Cause:** `isActive: false` not being broadcast

**Fix:** Broadcast `slide.update` with `isActive: false` on STOP action

### Issue 5: Next/Prev clicks don't update attendee view immediately

**Cause:** Only returning response to organizer, not broadcasting to room

**Fix:** MUST broadcast `slide.update` to room on every control action

---

## Complete Backend Handler Example

```typescript
socket.on("content.control", async (payload, callback) => {
  const { sessionId, action, targetSlide } = payload;

  // Get user from socket auth
  const user = socket.user;

  // Verify user has permission to control (organizer/speaker check)
  const canControl = await checkUserCanControl(user.id, sessionId);
  if (!canControl) {
    return callback({ success: false, error: "Not authorized to control presentation" });
  }

  try {
    let newState: SlideState;

    switch (action) {
      case "START": {
        // Get presentation from database
        const presentation = await db.presentations.findOne({ session_id: sessionId });
        if (!presentation || !presentation.slide_urls?.length) {
          return callback({ success: false, error: "No presentation found for this session" });
        }

        newState = {
          currentSlide: 1,  // MUST be 1!
          totalSlides: presentation.slide_urls.length,
          isActive: true,   // MUST be true!
          slideUrls: presentation.slide_urls
        };
        break;
      }

      case "STOP": {
        const currentState = await getSessionState(sessionId);
        if (!currentState) {
          return callback({ success: false, error: "No active presentation" });
        }
        newState = { ...currentState, isActive: false };
        break;
      }

      case "NEXT_SLIDE": {
        const currentState = await getSessionState(sessionId);
        if (!currentState || !currentState.isActive) {
          return callback({ success: false, error: "Presentation not active" });
        }
        if (currentState.currentSlide >= currentState.totalSlides) {
          return callback({ success: false, error: "Already at last slide" });
        }
        newState = { ...currentState, currentSlide: currentState.currentSlide + 1 };
        break;
      }

      case "PREV_SLIDE": {
        const currentState = await getSessionState(sessionId);
        if (!currentState || !currentState.isActive) {
          return callback({ success: false, error: "Presentation not active" });
        }
        if (currentState.currentSlide <= 1) {
          return callback({ success: false, error: "Already at first slide" });
        }
        newState = { ...currentState, currentSlide: currentState.currentSlide - 1 };
        break;
      }

      case "GO_TO_SLIDE": {
        const currentState = await getSessionState(sessionId);
        if (!currentState || !currentState.isActive) {
          return callback({ success: false, error: "Presentation not active" });
        }
        if (targetSlide < 1 || targetSlide > currentState.totalSlides) {
          return callback({ success: false, error: "Invalid slide number" });
        }
        newState = { ...currentState, currentSlide: targetSlide };
        break;
      }

      default:
        return callback({ success: false, error: "Unknown action" });
    }

    // Store the new state
    await saveSessionState(sessionId, newState);

    // ═══════════════════════════════════════════════════════════════════
    // CRITICAL: BROADCAST TO ALL USERS IN THE SESSION ROOM
    // This is what makes attendees see the updates!
    // ═══════════════════════════════════════════════════════════════════
    io.to(`session:${sessionId}`).emit("slide.update", newState);

    // Return success to the organizer
    callback({ success: true, newState });

  } catch (error) {
    console.error("content.control error:", error);
    callback({ success: false, error: "Internal server error" });
  }
});
```

---

## Event: `content.request_state`

Called when a client joins to get current presentation state.

```typescript
socket.on("content.request_state", async (payload, callback) => {
  const { sessionId } = payload;

  try {
    const state = await getSessionState(sessionId);
    callback({ success: true, state: state || null });
  } catch (error) {
    callback({ success: false, error: "Failed to get state" });
  }
});
```

---

## Event: `session.join`

Called when a client wants to join a session room.

```typescript
socket.on("session.join", async (payload, callback) => {
  const { sessionId, eventId } = payload;

  try {
    // Join the socket room
    socket.join(`session:${sessionId}`);

    callback({ success: true });
  } catch (error) {
    callback({ success: false, error: { message: "Failed to join session" } });
  }
});
```

---

## Testing Checklist

- [ ] START action sets `currentSlide: 1` (not 0)
- [ ] START action sets `isActive: true`
- [ ] START action broadcasts `slide.update` to room
- [ ] STOP action sets `isActive: false`
- [ ] STOP action broadcasts `slide.update` to room
- [ ] NEXT_SLIDE increments `currentSlide`
- [ ] NEXT_SLIDE broadcasts `slide.update` to room
- [ ] PREV_SLIDE decrements `currentSlide`
- [ ] PREV_SLIDE broadcasts `slide.update` to room
- [ ] GO_TO_SLIDE sets correct `currentSlide`
- [ ] GO_TO_SLIDE broadcasts `slide.update` to room
- [ ] Attendee view updates immediately when organizer changes slides
- [ ] Attendee sees "Waiting..." when `isActive: false`
- [ ] Attendee sees slides when `isActive: true`
- [ ] Attendee shows correct slide number (not off by one)

---

## Summary

The key points for the backend:

1. **Always broadcast `slide.update`** to the session room for EVERY control action
2. **`currentSlide` must be 1-indexed** (starts at 1, not 0)
3. **`isActive` must be `true`** for slides to show on attendee view
4. **`isActive` must be `false`** when presentation ends
5. **Include `slideUrls`** in the state so attendees can display slides
6. **Broadcast goes to room**, not just callback response to organizer
