# Frontend Architecture Explained for Backend Developer

> **IMPORTANT**: This document explains exactly how the frontend works so the backend can implement the correct resolvers. Please read this FULLY before implementing any fixes.

---

## The Two Separate Systems

GlobalConnect has **TWO COMPLETELY DIFFERENT** portals that access events:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GLOBALCONNECT ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                     ORGANIZER / PLATFORM PORTAL                       │   │
│  │                                                                        │   │
│  │  URL: /dashboard/events/[eventId]                                      │   │
│  │  WHO: Event organizers (people who CREATE events)                      │   │
│  │  AUTH: Requires organizer JWT token with orgId                         │   │
│  │                                                                        │   │
│  │  GraphQL Queries:                                                      │   │
│  │  ├─ event(id: $id) → Only returns events OWNED by this organizer       │   │
│  │  └─ sessionsByEvent(eventId) → Sessions for organizer's event          │   │
│  │                                                                        │   │
│  │  Access Control: Must be owner/member of the organization              │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│                                    VS                                        │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        ATTENDEE PORTAL                                │   │
│  │                                                                        │   │
│  │  URL: /attendee/events/[eventId]                                       │   │
│  │  WHO: Event attendees (people who REGISTER for events)                 │   │
│  │  AUTH: Requires attendee JWT token (NO orgId)                          │   │
│  │                                                                        │   │
│  │  GraphQL Queries:                                                      │   │
│  │  ├─ event(id: $id) → Returns event if PUBLIC                           │   │
│  │  ├─ myRegistrationForEvent(eventId) → Returns user's registration      │   │
│  │  └─ publicSessionsByEvent(eventId) → Public sessions for event         │   │
│  │                                                                        │   │
│  │  Access Control: Event must be PUBLIC, user viewing registration       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## The Attendee Flow (THIS IS WHERE THE BUG IS)

### Step 1: User Registers for an Event

**Route:** `/events/[eventId]` (Public page)

**GraphQL Query Used:**
```graphql
query GetPublicEventDetails($eventId: ID!) {
  event(id: $eventId) {        # ← Must return event if isPublic = true
    id
    name
    description
    startDate
    endDate
    imageUrl
    venue { id, name }
  }
  publicSessionsByEvent(eventId: $eventId) {  # ← Public sessions
    id
    title
    startTime
    endTime
    speakers { id, name }
  }
}
```

**Then user registers:**
```graphql
mutation CreateRegistration($registrationIn: RegistrationCreateInput!, $eventId: String!) {
  createRegistration(registrationIn: $registrationIn, eventId: $eventId) {
    id
    status
    ticketCode
  }
}
```

---

### Step 2: User Views Their Registered Event (THIS IS FAILING!)

**Route:** `/attendee/events/[eventId]`

**GraphQL Query Used:**
```graphql
query GetAttendeeEventDetails($eventId: ID!) {
  # 1. Check if user is registered for this event
  myRegistrationForEvent(eventId: $eventId) {
    id
    status
    ticketCode
    checkedInAt
  }

  # 2. Get event details (MUST WORK FOR ANY PUBLIC EVENT)
  event(id: $eventId) {
    id
    name
    description
    startDate
    endDate
    status
    imageUrl
    venue {
      id
      name
      address
    }
  }

  # 3. Get public sessions for the event
  publicSessionsByEvent(eventId: $eventId) {
    id
    title
    startTime
    endTime
    status
    chatEnabled
    qaEnabled
    pollsEnabled
    chatOpen
    qaOpen
    pollsOpen
    speakers { id, name }
  }
}
```

---

## THE BUG: Backend Returning "Event Not Found"

### What's Happening

1. Attendee registered for event `evt_123`
2. Attendee goes to `/attendee/events/evt_123`
3. Frontend calls `GET_ATTENDEE_EVENT_DETAILS_QUERY`
4. **Backend returns null for `event(id: "evt_123")`**
5. Frontend shows "Event Not Found"

### Why It's Happening (WRONG Backend Implementation)

The backend `event` resolver is probably doing this:

```typescript
// ❌ WRONG - Only returns events owned by the requesting user's organization
async event(id: string, context: any) {
  const orgId = context.user.orgId;  // ← Attendees don't have orgId!

  return await db.event.findFirst({
    where: {
      id: id,
      organizationId: orgId  // ← This filters out the event!
    }
  });
}
```

**Problem:** Attendees don't have an `orgId` in their JWT. Their JWT looks like:
```json
{
  "sub": "user_123",
  "email": "attendee@example.com"
  // NO orgId field!
}
```

Organizers have an `orgId` in their JWT:
```json
{
  "sub": "user_456",
  "email": "organizer@example.com",
  "orgId": "org_789"
}
```

---

## THE FIX: How `event` Query Should Work

```typescript
// ✅ CORRECT - Returns event if user has access
async event(id: string, context: any) {
  const userId = context.user.sub;
  const orgId = context.user.orgId;  // May be undefined for attendees

  // Find the event first
  const event = await db.event.findUnique({
    where: { id: id }
  });

  if (!event) {
    return null;  // Event doesn't exist
  }

  // ACCESS CONTROL LOGIC:

  // 1. If user is the organizer (has orgId matching event's organization)
  if (orgId && event.organizationId === orgId) {
    return event;  // Organizer can see their own events
  }

  // 2. If event is PUBLIC, anyone can see it (including attendees)
  if (event.isPublic) {
    return event;  // Public event, return it
  }

  // 3. If user is registered for this event, they can see it
  const registration = await db.registration.findFirst({
    where: {
      eventId: id,
      userId: userId,
      status: { in: ['confirmed', 'checked_in'] }
    }
  });

  if (registration) {
    return event;  // User is registered, return event
  }

  // 4. No access
  return null;
}
```

---

## The Three GraphQL Queries Explained

### 1. `event(id: ID!)`

**Purpose:** Get details of a single event

**Who calls it:**
- Public pages (`/events/[eventId]`)
- Attendee pages (`/attendee/events/[eventId]`)
- Organizer dashboard (`/dashboard/events/[eventId]`)

**Access Control:**
```typescript
Should return event if:
  ├─ Event is PUBLIC (isPublic = true)
  ├─ OR User is organizer of the event (user.orgId === event.organizationId)
  └─ OR User is registered for the event
```

### 2. `myRegistrationForEvent(eventId: ID!)`

**Purpose:** Check if the current user is registered for this event

**Who calls it:**
- Attendee pages ONLY

**Access Control:**
```typescript
// Returns registration where:
return await db.registration.findFirst({
  where: {
    eventId: eventId,
    userId: context.user.sub,  // Current user's ID from JWT
  }
});
```

### 3. `publicSessionsByEvent(eventId: ID!)`

**Purpose:** Get sessions for a public event

**Who calls it:**
- Public pages
- Attendee pages

**Access Control:**
```typescript
// Should return sessions if:
// 1. The event exists
// 2. The event is PUBLIC OR the user is registered for it

const event = await db.event.findUnique({ where: { id: eventId } });

if (!event) return [];

// Check access
const hasAccess = event.isPublic || await userIsRegistered(eventId, userId);

if (!hasAccess) return [];

return await db.session.findMany({
  where: { eventId: eventId }
});
```

---

## Complete User Flow Diagrams

### Attendee Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ATTENDEE USER JOURNEY                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. BROWSE PUBLIC EVENTS                                                     │
│     ─────────────────────────────────────────────────────────────────────   │
│     URL: /events                                                             │
│     Query: publicEvents { ... }                                              │
│     Auth: Not required                                                       │
│                                                                              │
│          │                                                                   │
│          ▼                                                                   │
│                                                                              │
│  2. VIEW EVENT DETAILS (PUBLIC)                                              │
│     ─────────────────────────────────────────────────────────────────────   │
│     URL: /events/[eventId]                                                   │
│     Query: event(id) + publicSessionsByEvent(eventId)                        │
│     Auth: Not required (event must be isPublic = true)                       │
│                                                                              │
│          │                                                                   │
│          ▼                                                                   │
│                                                                              │
│  3. REGISTER FOR EVENT                                                       │
│     ─────────────────────────────────────────────────────────────────────   │
│     Mutation: createRegistration(registrationIn, eventId)                    │
│     Auth: Required (attendee creates account or logs in)                     │
│     Result: Registration created with ticketCode                             │
│                                                                              │
│          │                                                                   │
│          ▼                                                                   │
│                                                                              │
│  4. VIEW MY REGISTERED EVENTS                                                │
│     ─────────────────────────────────────────────────────────────────────   │
│     URL: /attendee                                                           │
│     Query: myRegistrations { id, status, ticketCode, event { ... } }         │
│     Auth: Required (attendee JWT)                                            │
│                                                                              │
│          │                                                                   │
│          ▼                                                                   │
│                                                                              │
│  5. VIEW SPECIFIC EVENT DETAILS (AS ATTENDEE)  ◀── THIS IS WHERE BUG IS!    │
│     ─────────────────────────────────────────────────────────────────────   │
│     URL: /attendee/events/[eventId]                                          │
│     Query: myRegistrationForEvent(eventId)                                   │
│             + event(id)              ◀── MUST RETURN EVENT!                  │
│             + publicSessionsByEvent(eventId)                                 │
│     Auth: Required (attendee JWT)                                            │
│                                                                              │
│          │                                                                   │
│          ▼                                                                   │
│                                                                              │
│  6. INTERACT WITH SESSION (CHAT, Q&A, POLLS)                                 │
│     ─────────────────────────────────────────────────────────────────────   │
│     WebSocket: session.join({ sessionId, eventId })                          │
│     Auth: Required (attendee JWT)                                            │
│     Validation: Must be registered for the event                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Organizer Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ORGANIZER USER JOURNEY                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. LOGIN AS ORGANIZER                                                       │
│     ─────────────────────────────────────────────────────────────────────   │
│     JWT contains: { sub: "user_id", orgId: "org_id" }                        │
│                                                                              │
│          │                                                                   │
│          ▼                                                                   │
│                                                                              │
│  2. VIEW ORGANIZATION'S EVENTS                                               │
│     ─────────────────────────────────────────────────────────────────────   │
│     URL: /dashboard/events                                                   │
│     Query: eventsByOrganization { ... }                                      │
│     Filter: WHERE organizationId = jwt.orgId                                 │
│                                                                              │
│          │                                                                   │
│          ▼                                                                   │
│                                                                              │
│  3. VIEW/MANAGE SPECIFIC EVENT                                               │
│     ─────────────────────────────────────────────────────────────────────   │
│     URL: /dashboard/events/[eventId]                                         │
│     Query: event(id) + sessionsByEvent(eventId)                              │
│     Filter: event.organizationId must match jwt.orgId                        │
│                                                                              │
│          │                                                                   │
│          ▼                                                                   │
│                                                                              │
│  4. MANAGE SESSIONS, ATTENDEES, LIVE DASHBOARD                               │
│     ─────────────────────────────────────────────────────────────────────   │
│     Full control over event                                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## JWT Token Differences

### Attendee JWT (NO orgId)

```json
{
  "sub": "user_abc123",
  "email": "john@attendee.com",
  "first_name": "John",
  "last_name": "Doe",
  "iat": 1702656000,
  "exp": 1702742400
}
```

### Organizer JWT (HAS orgId)

```json
{
  "sub": "user_xyz789",
  "email": "admin@company.com",
  "first_name": "Admin",
  "last_name": "User",
  "orgId": "org_company123",
  "iat": 1702656000,
  "exp": 1702742400
}
```

---

## Backend Resolver Requirements

### `event(id: ID!)` Resolver - FIXED VERSION

```typescript
@Query(() => Event, { nullable: true })
async event(
  @Arg('id') id: string,
  @Ctx() context: Context
): Promise<Event | null> {
  const userId = context.user?.sub;
  const orgId = context.user?.orgId;  // May be undefined!

  // 1. Find the event
  const event = await this.eventRepository.findOne({
    where: { id }
  });

  if (!event) {
    return null;
  }

  // 2. Check access

  // Organizer access: user's org owns the event
  if (orgId && event.organizationId === orgId) {
    return event;
  }

  // Public access: event is public
  if (event.isPublic) {
    return event;
  }

  // Registered attendee access
  if (userId) {
    const registration = await this.registrationRepository.findOne({
      where: {
        eventId: id,
        userId: userId,
        status: In(['confirmed', 'checked_in'])
      }
    });

    if (registration) {
      return event;
    }
  }

  // No access
  return null;
}
```

### `myRegistrationForEvent(eventId: ID!)` Resolver

```typescript
@Query(() => Registration, { nullable: true })
async myRegistrationForEvent(
  @Arg('eventId') eventId: string,
  @Ctx() context: Context
): Promise<Registration | null> {
  const userId = context.user?.sub;

  if (!userId) {
    return null;  // Not authenticated
  }

  return await this.registrationRepository.findOne({
    where: {
      eventId: eventId,
      userId: userId
    }
  });
}
```

### `publicSessionsByEvent(eventId: ID!)` Resolver

```typescript
@Query(() => [Session])
async publicSessionsByEvent(
  @Arg('eventId') eventId: string,
  @Ctx() context: Context
): Promise<Session[]> {
  const userId = context.user?.sub;

  // 1. Find the event
  const event = await this.eventRepository.findOne({
    where: { id: eventId }
  });

  if (!event) {
    return [];
  }

  // 2. Check if user can access this event's sessions
  let hasAccess = event.isPublic;

  if (!hasAccess && userId) {
    const registration = await this.registrationRepository.findOne({
      where: {
        eventId: eventId,
        userId: userId,
        status: In(['confirmed', 'checked_in'])
      }
    });
    hasAccess = !!registration;
  }

  if (!hasAccess) {
    return [];
  }

  // 3. Return sessions
  return await this.sessionRepository.find({
    where: { eventId: eventId },
    relations: ['speakers']
  });
}
```

---

## Summary of the Bug

| Issue | Current Behavior | Expected Behavior |
|-------|------------------|-------------------|
| `event(id)` query | Returns null for attendees because it checks `orgId` | Should return event if PUBLIC or user is registered |
| Attendee views `/attendee/events/[eventId]` | Shows "Event Not Found" | Should show event details with sessions |

## Quick Fix Checklist

- [ ] `event(id)` resolver returns event if `isPublic = true`
- [ ] `event(id)` resolver returns event if user is registered (even without orgId)
- [ ] `myRegistrationForEvent(eventId)` works for attendees
- [ ] `publicSessionsByEvent(eventId)` works for attendees

---

## Test Cases

### Test 1: Attendee Views Registered Event

```
Given: User "john@attendee.com" is registered for event "evt_123"
When: User calls GET_ATTENDEE_EVENT_DETAILS_QUERY with eventId="evt_123"
Then:
  - event(id) returns the event details
  - myRegistrationForEvent(eventId) returns the registration
  - publicSessionsByEvent(eventId) returns the sessions
```

### Test 2: Attendee Views Unregistered Public Event

```
Given: Event "evt_456" is public (isPublic = true)
And: User "jane@attendee.com" is NOT registered
When: User calls event(id: "evt_456")
Then: Event details are returned (because it's public)
```

### Test 3: Organizer Views Own Event

```
Given: User has orgId="org_789"
And: Event "evt_789" belongs to organization "org_789"
When: User calls event(id: "evt_789")
Then: Event details are returned (because user owns it)
```

---

*Please share this document with your backend developer. The issue is clear: the `event` query is filtering by `orgId` which attendees don't have.*
