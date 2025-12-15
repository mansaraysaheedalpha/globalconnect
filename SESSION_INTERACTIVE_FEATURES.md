# Session Interactive Features - Backend Requirements

## Overview

This document outlines the backend changes required to support per-session control of interactive features (Chat and Q&A).

## Database Changes

### Session Model

Add two new boolean fields to the `Session` model:

```prisma
model Session {
  // ... existing fields ...

  chatEnabled Boolean @default(true)  // Whether session chat is enabled
  qaEnabled   Boolean @default(true)  // Whether session Q&A is enabled

  // ... existing relations ...
}
```

### Migration

```sql
ALTER TABLE "Session" ADD COLUMN "chatEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Session" ADD COLUMN "qaEnabled" BOOLEAN NOT NULL DEFAULT true;
```

## GraphQL Schema Changes

### Session Type

```graphql
type SessionType {
  # ... existing fields ...
  chatEnabled: Boolean!
  qaEnabled: Boolean!
}
```

### Session Create Input

```graphql
input SessionCreateInput {
  eventId: ID!
  title: String!
  sessionDate: String!
  startTime: String!
  endTime: String!
  speakerIds: [String!]
  chatEnabled: Boolean = true   # Optional, defaults to true
  qaEnabled: Boolean = true     # Optional, defaults to true
}
```

### Session Update Input

```graphql
input SessionUpdateInput {
  title: String
  startTime: DateTime
  endTime: DateTime
  speakerIds: [String!]
  chatEnabled: Boolean          # Optional
  qaEnabled: Boolean            # Optional
}
```

## Real-Time Service Changes

### WebSocket Connection Validation

When a user attempts to join a session for Chat or Q&A, validate that the feature is enabled:

```typescript
// In content.gateway.ts (session.join handler)
@SubscribeMessage('session.join')
async handleSessionJoin(client: Socket, payload: { sessionId: string; eventId?: string }) {
  const session = await this.sessionService.findById(payload.sessionId);

  if (!session) {
    return { success: false, error: { message: 'Session not found', statusCode: 404 } };
  }

  // Existing registration check for attendees...

  // The session data (including chatEnabled/qaEnabled) should be available
  // for the frontend to decide which features to display
}
```

### Chat Gateway

```typescript
// In chat.gateway.ts
@SubscribeMessage('chat.message.send')
async handleSendMessage(client: Socket, payload: ChatMessagePayload) {
  const session = await this.sessionService.findById(payload.sessionId);

  if (!session.chatEnabled) {
    return {
      success: false,
      error: {
        message: 'Chat is not enabled for this session',
        statusCode: 403
      }
    };
  }

  // ... existing logic ...
}
```

### Q&A Gateway

```typescript
// In qna.gateway.ts
@SubscribeMessage('qa.question.ask')
async handleAskQuestion(client: Socket, payload: QuestionPayload) {
  const session = await this.sessionService.findById(payload.sessionId);

  if (!session.qaEnabled) {
    return {
      success: false,
      error: {
        message: 'Q&A is not enabled for this session',
        statusCode: 403
      }
    };
  }

  // ... existing logic ...
}
```

## Frontend Integration

The frontend has been updated to:

1. **GraphQL Queries**: Request `chatEnabled` and `qaEnabled` fields for sessions
2. **Conditional Rendering**: Only show Chat/Q&A buttons when the respective feature is enabled
3. **Add/Edit Session Modals**: Include toggle switches for enabling/disabling Chat and Q&A
4. **Backwards Compatibility**: Default to `true` when fields are undefined (for existing sessions)

### Updated Queries

```graphql
# GET_SESSIONS_BY_EVENT_QUERY
query GetSessionsByEvent($eventId: ID!) {
  sessionsByEvent(eventId: $eventId) {
    id
    title
    startTime
    endTime
    chatEnabled    # NEW
    qaEnabled      # NEW
    speakers {
      id
      name
    }
  }
}

# publicSessionsByEvent (for attendees)
query GetAttendeeEventDetails($eventId: ID!) {
  # ...
  publicSessionsByEvent(eventId: $eventId) {
    id
    title
    startTime
    endTime
    status
    chatEnabled    # NEW
    qaEnabled      # NEW
    speakers {
      id
      name
    }
  }
}
```

### Frontend Components Updated

- `src/app/(attendee)/attendee/events/[eventId]/page.tsx` - Attendee event page
- `src/app/(platform)/dashboard/events/[eventId]/_components/session-item.tsx` - Organizer session item
- `src/app/(platform)/dashboard/events/[eventId]/_components/session-list.tsx` - Session list types
- `src/app/(platform)/dashboard/events/_components/add-session-modal.tsx` - Add session modal
- `src/app/(platform)/dashboard/events/_components/edit-session-modal.tsx` - Edit session modal
- `src/graphql/events.graphql.ts` - GraphQL queries
- `src/graphql/attendee.graphql.ts` - Attendee GraphQL queries

## Testing Checklist

- [ ] Create a session with Chat disabled - verify Chat button doesn't appear
- [ ] Create a session with Q&A disabled - verify Q&A button doesn't appear
- [ ] Create a session with both disabled - verify neither button appears
- [ ] Edit an existing session to disable Chat - verify Chat button disappears
- [ ] Edit an existing session to disable Q&A - verify Q&A button disappears
- [ ] Existing sessions (before migration) should show both Chat and Q&A (default true)
- [ ] WebSocket: Attempting to send a chat message to a chat-disabled session returns 403
- [ ] WebSocket: Attempting to ask a question in a Q&A-disabled session returns 403

---

# PART 2: Runtime Open/Close Control

## Overview

In addition to the feature toggles (`chatEnabled`/`qaEnabled`), we need **runtime controls** that let organizers/speakers open and close Chat/Q&A during a live session.

**Problem:** Currently, when a feature is enabled, it's always accessible. Attendees can chat before the session starts or ask questions when the speaker isn't ready.

**Solution:** Add `chatOpen` and `qaOpen` boolean fields that organizers/speakers can toggle in real-time.

## Difference Between Enable and Open

| Field | Purpose | When Set | Who Sets |
|-------|---------|----------|----------|
| `chatEnabled` | Can this session have chat at all? | Session creation/edit | Organizer |
| `chatOpen` | Is chat accepting messages RIGHT NOW? | During live event | Organizer/Speaker |
| `qaEnabled` | Can this session have Q&A at all? | Session creation/edit | Organizer |
| `qaOpen` | Is Q&A accepting questions RIGHT NOW? | During live event | Organizer/Speaker |

## Database Changes

### Session Model Update

```prisma
model Session {
  // ... existing fields ...

  // Feature toggles (configured in session settings)
  chatEnabled Boolean @default(true)
  qaEnabled   Boolean @default(true)

  // Runtime state (controlled live by organizer/speaker)
  chatOpen    Boolean @default(false)  // NEW
  qaOpen      Boolean @default(false)  // NEW
}
```

### Migration

```sql
ALTER TABLE "Session" ADD COLUMN "chatOpen" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Session" ADD COLUMN "qaOpen" BOOLEAN NOT NULL DEFAULT false;
```

## GraphQL Schema Changes

### Updated Session Type

```graphql
type SessionType {
  # ... existing fields ...
  chatEnabled: Boolean!
  qaEnabled: Boolean!
  chatOpen: Boolean!      # NEW
  qaOpen: Boolean!        # NEW
}
```

### New Mutations

```graphql
type Mutation {
  # Toggle chat open/close for a session (runtime control)
  toggleSessionChat(sessionId: ID!, open: Boolean!): Session!

  # Toggle Q&A open/close for a session (runtime control)
  toggleSessionQA(sessionId: ID!, open: Boolean!): Session!
}
```

### Authorization

Only organizers (users with orgId matching event's organizationId) or session speakers can toggle:

```typescript
async toggleSessionChat(sessionId: string, open: boolean, user: User) {
  const session = await this.getSessionWithEventAndSpeakers(sessionId);

  // Authorization check
  const isOrganizer = user.orgId && user.orgId === session.event.organizationId;
  const isSpeaker = session.speakers.some(s => s.userId === user.id);

  if (!isOrganizer && !isSpeaker) {
    throw new ForbiddenException('Only organizers or speakers can control chat');
  }

  // Ensure feature is enabled
  if (!session.chatEnabled) {
    throw new BadRequestException('Chat is not enabled for this session');
  }

  return this.prisma.session.update({
    where: { id: sessionId },
    data: { chatOpen: open }
  });
}
```

## Real-Time Service Changes

### Broadcast Status Changes

When an organizer toggles chat/Q&A, broadcast to all connected clients in that session:

```typescript
// After successful toggle, emit to all clients in session room
this.server.to(`session:${sessionId}`).emit('chat.status.changed', {
  sessionId,
  isOpen: open,
  message: open ? 'Chat is now open!' : 'Chat has been closed'
});

this.server.to(`session:${sessionId}`).emit('qa.status.changed', {
  sessionId,
  isOpen: open,
  message: open ? 'Q&A is now open!' : 'Q&A has been closed'
});
```

### Validate Before Accepting Messages/Questions

Update the existing handlers to check BOTH enabled AND open:

```typescript
// In chat.gateway.ts - handleSendMessage
async handleSendMessage(client: Socket, payload: ChatMessagePayload) {
  const session = await this.sessionService.findById(payload.sessionId);

  // Check if feature is enabled
  if (!session.chatEnabled) {
    return {
      success: false,
      error: { message: 'Chat is not enabled for this session', statusCode: 403 }
    };
  }

  // Check if feature is currently open
  if (!session.chatOpen) {
    return {
      success: false,
      error: { message: 'Chat is not open yet', statusCode: 403 }
    };
  }

  // Proceed with existing logic...
}

// In qna.gateway.ts - handleAskQuestion
async handleAskQuestion(client: Socket, payload: QuestionPayload) {
  const session = await this.sessionService.findById(payload.sessionId);

  if (!session.qaEnabled) {
    return {
      success: false,
      error: { message: 'Q&A is not enabled for this session', statusCode: 403 }
    };
  }

  if (!session.qaOpen) {
    return {
      success: false,
      error: { message: 'Q&A is not open yet', statusCode: 403 }
    };
  }

  // Proceed with existing logic...
}
```

### Include Status in session.join Response

When a user joins a session, include the current open/closed status:

```typescript
// In session.join handler
callback({
  success: true,
  session: {
    id: session.id,
    chatEnabled: session.chatEnabled,
    chatOpen: session.chatOpen,
    qaEnabled: session.qaEnabled,
    qaOpen: session.qaOpen,
  }
});
```

## Frontend Integration

### Updated GraphQL Queries

```graphql
# GET_SESSIONS_BY_EVENT_QUERY
query GetSessionsByEvent($eventId: ID!) {
  sessionsByEvent(eventId: $eventId) {
    id
    title
    startTime
    endTime
    chatEnabled
    qaEnabled
    chatOpen      # NEW
    qaOpen        # NEW
    speakers { id name }
  }
}

# GET_ATTENDEE_EVENT_DETAILS_QUERY
query GetAttendeeEventDetails($eventId: ID!) {
  publicSessionsByEvent(eventId: $eventId) {
    id
    title
    startTime
    endTime
    status
    chatEnabled
    qaEnabled
    chatOpen      # NEW
    qaOpen        # NEW
    speakers { id name }
  }
}
```

### New Mutations

```graphql
mutation ToggleSessionChat($sessionId: ID!, $open: Boolean!) {
  toggleSessionChat(sessionId: $sessionId, open: $open) {
    id
    chatOpen
  }
}

mutation ToggleSessionQA($sessionId: ID!, $open: Boolean!) {
  toggleSessionQA(sessionId: $sessionId, open: $open) {
    id
    qaOpen
  }
}
```

### Frontend Components to Update

1. **SessionChat** - Show disabled input with message when `chatOpen: false`
2. **SessionQA** - Show disabled input with message when `qaOpen: false`
3. **Live Dashboard** - Add toggle buttons for organizers to open/close
4. **Hooks (use-session-chat, use-session-qa)** - Listen for status change events

### UI States for Attendees

```
┌─────────────────────────────────────────────────────────────┐
│ STATE 1: Feature Disabled (chatEnabled: false)              │
│                                                             │
│   💬 Chat                                                   │
│   "Chat is not available for this session"                  │
│   [No input shown]                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ STATE 2: Enabled but Closed (chatEnabled: true, chatOpen: false) │
│                                                             │
│   💬 Chat                                                   │
│   "Waiting for host to open chat..."                        │
│   ┌─────────────────────────────────────────────┐          │
│   │ Type a message... (disabled)                │ 🔒       │
│   └─────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ STATE 3: Open (chatEnabled: true, chatOpen: true)           │
│                                                             │
│   💬 Chat  🟢 Live                                          │
│   [Messages appear here...]                                 │
│   ┌─────────────────────────────────────────────┐          │
│   │ Type a message...                           │ ➤        │
│   └─────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### UI for Organizers (Live Dashboard)

```
┌─────────────────────────────────────────────────────────────┐
│ Session: "Keynote: Future of AI"                     [LIVE] │
│                                                             │
│  ┌────────────────────┐    ┌────────────────────┐          │
│  │ 💬 Chat            │    │ ❓ Q&A             │          │
│  │                    │    │                    │          │
│  │ Status: Closed 🔴  │    │ Status: Closed 🔴  │          │
│  │ [ Open Chat ]      │    │ [ Open Q&A ]       │          │
│  └────────────────────┘    └────────────────────┘          │
│                                                             │
│  When opened:                                               │
│  ┌────────────────────┐    ┌────────────────────┐          │
│  │ 💬 Chat            │    │ ❓ Q&A             │          │
│  │                    │    │                    │          │
│  │ Status: Open 🟢    │    │ Status: Open 🟢    │          │
│  │ [ Close Chat ]     │    │ [ Close Q&A ]      │          │
│  └────────────────────┘    └────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## Testing Checklist - Runtime Controls

### Backend
- [ ] `toggleSessionChat` works for organizers
- [ ] `toggleSessionChat` works for session speakers
- [ ] `toggleSessionChat` returns 403 for attendees
- [ ] `toggleSessionQA` works for organizers
- [ ] `toggleSessionQA` works for session speakers
- [ ] `toggleSessionQA` returns 403 for attendees
- [ ] Cannot toggle if feature is disabled (chatEnabled: false)
- [ ] Chat message rejected when chatOpen: false
- [ ] Q&A question rejected when qaOpen: false
- [ ] Status change broadcasts to all session participants

### Frontend
- [ ] Attendee sees "Waiting for host..." when chatOpen: false
- [ ] Attendee sees "Waiting for host..." when qaOpen: false
- [ ] Attendee input is disabled when feature is closed
- [ ] Attendee receives real-time update when organizer opens feature
- [ ] Organizer sees toggle controls in live dashboard
- [ ] Speaker sees toggle controls for their sessions
- [ ] Toggle reflects immediately (optimistic update)
- [ ] Toast notification when status changes

## Future Considerations

1. **Auto-open on LIVE**: Option to automatically open chat/Q&A when session status becomes "LIVE"
2. **Scheduled open/close**: Set specific times for features to auto-open/close
3. **Chat cooldown**: Rate limit messages per user
4. **Moderator role**: Additional role between organizer and attendee
