# Polls System - Frontend Implementation Plan

> **Document Version:** 1.0
> **Created:** December 2025
> **Status:** Ready for Implementation
> **Backend Reference:** `POLLS_BACKEND.md`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Integration Points](#3-integration-points)
4. [Implementation Phases](#4-implementation-phases)
5. [Detailed Task Breakdown](#5-detailed-task-breakdown)
6. [File Structure](#6-file-structure)
7. [Component Specifications](#7-component-specifications)
8. [Backend Clarifications Needed](#8-backend-clarifications-needed)
9. [Testing Strategy](#9-testing-strategy)

---

## 1. Executive Summary

### What We're Building
A real-time interactive polls system that allows:
- **Organizers/Speakers**: Create polls, view live results, close polls, run giveaways
- **Attendees**: Vote on active polls, see live results after voting
- **All Users**: See real-time vote count updates via WebSocket

### Key Features
1. Real-time poll creation and broadcasting
2. Live vote submission with instant result updates
3. One vote per user per poll (enforced by backend)
4. Poll closing with final results broadcast
5. Giveaway mode with random winner selection
6. Feature toggle (`pollsEnabled`) and runtime control (`pollsOpen`)

### Architecture Pattern
Following the existing Chat and Q&A implementation pattern:
- Custom React hook (`useSessionPolls`) for WebSocket state management
- Component (`SessionPolls`) for UI rendering
- GraphQL mutations for feature toggle control
- Optimistic updates for instant UI feedback

---

## 2. Architecture Overview

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        ORGANIZER VIEW                            │
├─────────────────────────────────────────────────────────────────┤
│  SessionItem Component                                           │
│  ├─ Toggle: pollsEnabled (session config)                       │
│  ├─ Toggle: pollsOpen (runtime control via Socket)              │
│  └─ Sheet Panel: SessionPolls (full polls management)           │
│      ├─ CreatePollForm (organizer only)                         │
│      ├─ ActivePoll (live voting + results)                      │
│      ├─ PollCard (results display)                              │
│      ├─ ClosePoll action                                        │
│      └─ Giveaway modal                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ WebSocket (Socket.io)
                              │ Namespace: /events
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     REAL-TIME SERVICE                            │
│                   (NestJS + Socket.io)                           │
├─────────────────────────────────────────────────────────────────┤
│  Events:                                                         │
│  ← poll.create         → poll.opened                            │
│  ← poll.vote.submit    → poll.results.updated                   │
│  ← poll.manage         → poll.closed                            │
│  ← poll.giveaway.start → poll.giveaway.winner                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ WebSocket (Socket.io)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        ATTENDEE VIEW                             │
├─────────────────────────────────────────────────────────────────┤
│  SessionCard Component                                           │
│  └─ Sheet Panel: SessionPolls (voting only)                     │
│      ├─ ActivePoll (vote buttons)                               │
│      ├─ Results (after voting)                                  │
│      └─ Giveaway winner announcement                            │
└─────────────────────────────────────────────────────────────────┘
```

### State Management

```typescript
interface PollsState {
  polls: Map<string, Poll>;           // All polls by ID
  userVotes: Map<string, string>;     // pollId -> optionId (current user's votes)
  activePollId: string | null;        // Currently displayed poll
  isConnected: boolean;               // Socket connection status
  isJoined: boolean;                  // Session room joined
  error: string | null;               // Error messages
  accessDenied: boolean;              // 403 - not registered
  pollsOpen: boolean;                 // Runtime state from server
  latestGiveaway: GiveawayResult | null;  // Most recent giveaway result
}
```

---

## 3. Integration Points

### 3.1 GraphQL Schema Updates (Backend Required)

**Session Model Extensions:**
```graphql
type Session {
  # ... existing fields
  pollsEnabled: Boolean!    # Feature toggle (set at session creation)
  pollsOpen: Boolean!       # Runtime toggle (organizer controls during event)
}

input SessionCreateInput {
  # ... existing fields
  pollsEnabled: Boolean     # Default: true
}

input SessionUpdateInput {
  # ... existing fields
  pollsEnabled: Boolean
}
```

**New Mutation:**
```graphql
type Mutation {
  toggleSessionPolls(id: String!, open: Boolean!): Session!
}
```

### 3.2 Files to Modify

| File | Changes |
|------|---------|
| `src/graphql/events.graphql.ts` | Add `pollsEnabled`, `pollsOpen` to queries; add `TOGGLE_SESSION_POLLS_MUTATION` |
| `src/app/(platform)/dashboard/events/[eventId]/_components/session-item.tsx` | Add Polls toggle and Sheet panel |
| `src/app/(platform)/dashboard/events/_components/add-session-modal.tsx` | Add `pollsEnabled` checkbox |
| `src/app/(platform)/dashboard/events/_components/edit-session-modal.tsx` | Add `pollsEnabled` checkbox |
| `src/app/(attendee)/attendee/events/[eventId]/page.tsx` | Add Polls button and Sheet in SessionCard |
| `src/graphql/attendee.graphql.ts` | Add `pollsEnabled`, `pollsOpen` to session query |
| `src/hooks/use-live-dashboard.ts` | Already tracks `totalVotes` - verify it works with polls |

### 3.3 New Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/use-session-polls.ts` | WebSocket hook for polls state management |
| `src/app/(platform)/dashboard/events/[eventId]/_components/session-polls.tsx` | Main polls component (organizer + attendee views) |
| `src/types/polls.ts` | TypeScript interfaces for polls (optional, can be in hook) |

---

## 4. Implementation Phases

### Phase 1: Core Infrastructure (Foundation)
1. Create TypeScript interfaces
2. Implement `useSessionPolls` hook
3. Add GraphQL mutations for polls toggle

### Phase 2: Organizer Experience
1. Create `SessionPolls` component with organizer features
2. Integrate into `SessionItem` component
3. Add poll creation form
4. Add poll management controls (close, giveaway)

### Phase 3: Attendee Experience
1. Add voting UI for attendees
2. Integrate into attendee `SessionCard`
3. Show live results after voting
4. Giveaway winner announcement modal

### Phase 4: Polish & Edge Cases
1. Error handling improvements
2. Loading states and skeletons
3. Empty states
4. Accessibility improvements

---

## 5. Detailed Task Breakdown

### Phase 1: Core Infrastructure

#### Task 1.1: Create `useSessionPolls` Hook
**File:** `src/hooks/use-session-polls.ts`

**Responsibilities:**
- WebSocket connection management (same pattern as `useSessionChat`)
- Listen for poll events: `poll.opened`, `poll.results.updated`, `poll.closed`, `poll.giveaway.winner`
- Emit poll actions: `poll.create`, `poll.vote.submit`, `poll.manage`, `poll.giveaway.start`
- State management for polls, user votes, loading states
- Optimistic updates for instant feedback

**API:**
```typescript
export function useSessionPolls(sessionId: string, eventId: string, initialPollsOpen?: boolean) {
  return {
    // State
    polls: Map<string, Poll>,
    activePolls: Poll[],
    closedPolls: Poll[],
    userVotes: Map<string, string>,
    isConnected: boolean,
    isJoined: boolean,
    error: string | null,
    accessDenied: boolean,
    pollsOpen: boolean,
    latestGiveaway: GiveawayResult | null,
    currentUserId: string | undefined,

    // Actions (for organizers)
    createPoll: (question: string, options: string[]) => Promise<boolean>,
    closePoll: (pollId: string) => Promise<boolean>,
    startGiveaway: (pollId: string, winningOptionId: string, prize: string) => Promise<GiveawayResult['winner']>,

    // Actions (for attendees)
    submitVote: (pollId: string, optionId: string) => Promise<boolean>,

    // Utilities
    hasVoted: (pollId: string) => boolean,
    getUserVote: (pollId: string) => string | undefined,
    clearError: () => void,
    clearGiveaway: () => void,
  };
}
```

#### Task 1.2: Add GraphQL Mutations
**File:** `src/graphql/events.graphql.ts`

**Changes:**
```typescript
// Update GET_SESSIONS_BY_EVENT_QUERY to include polls fields
export const GET_SESSIONS_BY_EVENT_QUERY = gql`
  query GetSessionsByEvent($eventId: ID!) {
    sessionsByEvent(eventId: $eventId) {
      id
      title
      startTime
      endTime
      chatEnabled
      qaEnabled
      pollsEnabled    # ADD
      chatOpen
      qaOpen
      pollsOpen       # ADD
      speakers { id name }
    }
  }
`;

// Add toggle mutation
export const TOGGLE_SESSION_POLLS_MUTATION = gql`
  mutation ToggleSessionPolls($id: String!, $open: Boolean!) {
    toggleSessionPolls(id: $id, open: $open) {
      id
      pollsOpen
    }
  }
`;
```

---

### Phase 2: Organizer Experience

#### Task 2.1: Create `SessionPolls` Component
**File:** `src/app/(platform)/dashboard/events/[eventId]/_components/session-polls.tsx`

**Features:**
- **Organizer View:**
  - Create Poll form (question + options)
  - Active polls list with live results
  - Close poll button
  - Giveaway trigger button
  - View closed polls with final results

- **Attendee View:**
  - Active poll with vote buttons
  - Results display (after voting or poll closed)
  - "Waiting for poll..." when no active poll

**Component Structure:**
```tsx
interface SessionPollsProps {
  sessionId: string;
  eventId: string;
  isOrganizer?: boolean;
  isSpeaker?: boolean;
  className?: string;
  initialPollsOpen?: boolean;
}

export function SessionPolls({ ... }: SessionPollsProps) {
  const {
    polls,
    activePolls,
    closedPolls,
    createPoll,
    submitVote,
    closePoll,
    startGiveaway,
    hasVoted,
    ...
  } = useSessionPolls(sessionId, eventId, initialPollsOpen);

  const canCreate = isOrganizer || isSpeaker;
  const canManage = isOrganizer;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Create Poll Form - organizers/speakers only */}
      {canCreate && pollsOpen && <CreatePollForm onSubmit={createPoll} />}

      {/* Active Polls */}
      {activePolls.map(poll => (
        <PollCard
          key={poll.id}
          poll={poll}
          userVotedOptionId={getUserVote(poll.id)}
          onVote={submitVote}
          onClose={canManage ? closePoll : undefined}
          onGiveaway={canManage ? startGiveaway : undefined}
          canManage={canManage}
        />
      ))}

      {/* Closed Polls (collapsible) */}
      {closedPolls.length > 0 && (
        <ClosedPollsSection polls={closedPolls} />
      )}

      {/* Giveaway Winner Modal */}
      {latestGiveaway && (
        <GiveawayWinnerModal result={latestGiveaway} onClose={clearGiveaway} />
      )}
    </div>
  );
}
```

#### Task 2.2: Create Poll Form Component
**Sub-component of SessionPolls**

**Features:**
- Question input (max 500 chars)
- Options list (min 2, max 10)
- Add/remove option buttons
- Submit button with loading state
- Validation feedback

#### Task 2.3: Poll Card Component
**Sub-component of SessionPolls**

**Features:**
- Question display
- Options as buttons (votable) or progress bars (results)
- Vote counts and percentages
- User's selection highlighted
- Close poll button (organizer)
- Giveaway button (organizer, after close)
- Active/Closed badge

#### Task 2.4: Integrate into SessionItem
**File:** `src/app/(platform)/dashboard/events/[eventId]/_components/session-item.tsx`

**Changes:**
- Add `pollsEnabled` check
- Add Polls button with Lock/Unlock icon
- Add Sheet panel with `SessionPolls` component
- Add polls toggle switch in sheet header
- Wire up `TOGGLE_SESSION_POLLS_MUTATION`

---

### Phase 3: Attendee Experience

#### Task 3.1: Update Attendee SessionCard
**File:** `src/app/(attendee)/attendee/events/[eventId]/page.tsx`

**Changes:**
- Add polls button (similar to Chat/Q&A)
- Show Lock/Unlock status based on `pollsOpen`
- Add Sheet with `SessionPolls` (isOrganizer=false)

#### Task 3.2: Giveaway Winner Modal
**Sub-component of SessionPolls**

**Features:**
- Confetti/celebration animation (optional)
- Winner name display
- Prize display
- "No winner" state (if no one voted for winning option)
- Close button

---

### Phase 4: Session Creation/Edit Modals

#### Task 4.1: Add Polls Toggle to Add Session Modal
**File:** `src/app/(platform)/dashboard/events/_components/add-session-modal.tsx`

**Changes:**
- Add checkbox: "Enable Polls"
- Default: checked (true)
- Include `pollsEnabled` in mutation variables

#### Task 4.2: Add Polls Toggle to Edit Session Modal
**File:** `src/app/(platform)/dashboard/events/_components/edit-session-modal.tsx`

**Changes:**
- Add checkbox: "Enable Polls"
- Pre-populate from session data
- Include `pollsEnabled` in mutation variables

---

## 6. File Structure

```
src/
├── hooks/
│   ├── use-session-chat.ts       # Existing
│   ├── use-session-qa.ts         # Existing
│   └── use-session-polls.ts      # NEW - Polls WebSocket hook
│
├── graphql/
│   ├── events.graphql.ts         # MODIFY - Add polls fields & mutations
│   └── attendee.graphql.ts       # MODIFY - Add polls fields to session query
│
├── app/
│   ├── (platform)/
│   │   └── dashboard/
│   │       └── events/
│   │           ├── [eventId]/
│   │           │   └── _components/
│   │           │       ├── session-item.tsx      # MODIFY - Add Polls Sheet
│   │           │       ├── session-chat.tsx      # Existing
│   │           │       ├── session-qa.tsx        # Existing
│   │           │       └── session-polls.tsx     # NEW - Polls component
│   │           └── _components/
│   │               ├── add-session-modal.tsx     # MODIFY - Add pollsEnabled
│   │               └── edit-session-modal.tsx    # MODIFY - Add pollsEnabled
│   │
│   └── (attendee)/
│       └── attendee/
│           └── events/
│               └── [eventId]/
│                   └── page.tsx                  # MODIFY - Add Polls in SessionCard
```

---

## 7. Component Specifications

### 7.1 PollCard Component

```tsx
interface PollCardProps {
  poll: Poll;
  userVotedOptionId: string | null;
  onVote: (pollId: string, optionId: string) => Promise<boolean>;
  onClose?: (pollId: string) => Promise<boolean>;
  onGiveaway?: (pollId: string, winningOptionId: string, prize: string) => Promise<any>;
  isVoting?: boolean;
  canManage: boolean;
}
```

**UI States:**
1. **Voting Mode** (active poll, user hasn't voted):
   - Options as clickable buttons
   - No percentages shown

2. **Results Mode** (user voted OR poll closed):
   - Options as progress bars
   - Show vote count and percentage
   - Highlight user's selection with checkmark

3. **Closed Mode:**
   - "Closed" badge
   - Final results
   - Giveaway button (if organizer)

### 7.2 CreatePollForm Component

```tsx
interface CreatePollFormProps {
  onSubmit: (question: string, options: string[]) => Promise<boolean>;
  isSubmitting?: boolean;
}
```

**Validation Rules:**
- Question: 1-500 characters, required
- Options: 2-10 items, each 1-200 characters
- At least 2 non-empty options required

### 7.3 GiveawayModal Component

```tsx
interface GiveawayModalProps {
  result: GiveawayResult;
  onClose: () => void;
}
```

**States:**
1. **Winner Selected:** Show winner name, prize, celebration
2. **No Winner:** "No one voted for the winning option" message

---

## 8. Backend Clarifications Needed

Before implementation, please confirm with the backend developer:

### 8.1 GraphQL Schema
- [ ] Is `toggleSessionPolls` mutation available?
- [ ] Are `pollsEnabled` and `pollsOpen` fields on Session type?
- [ ] What are the default values for `pollsEnabled`/`pollsOpen`?

### 8.2 Permissions
- [ ] Who has `poll:create` permission? (Organizers only? Speakers too?)
- [ ] Who has `poll:manage` permission? (Organizers only?)
- [ ] Can speakers create polls in their own sessions?

### 8.3 Poll History
- [ ] Is there a `poll.history` event sent after `session.join`? (Similar to `chat.history`)
- [ ] How do we get existing polls when joining a session?

### 8.4 Poll Status Events
- [ ] Is there a `poll.status.changed` event when organizer toggles `pollsOpen`?
- [ ] What's the event name and payload structure?

### 8.5 Giveaway
- [ ] Can giveaway be run on an active poll, or must it be closed first?
- [ ] Can multiple giveaways be run on the same poll?

### 8.6 Session Join Response
- [ ] Does `session.join` callback include `pollsOpen` status?
  ```typescript
  // Expected:
  { success: true, session: { chatOpen, qaOpen, pollsOpen } }
  ```

---

## 9. Testing Strategy

### 9.1 Unit Tests
- `useSessionPolls` hook state management
- Poll validation logic
- Vote percentage calculations

### 9.2 Integration Tests
- WebSocket event handling
- Optimistic update rollbacks
- Error state handling

### 9.3 E2E Test Scenarios
1. **Organizer creates poll** -> Attendees see it immediately
2. **Attendee votes** -> Results update for everyone
3. **Organizer closes poll** -> Voting disabled, final results shown
4. **Giveaway run** -> Winner announced to all
5. **Access denied** -> Non-registered user can't vote
6. **Reconnection** -> State restored after disconnect

### 9.4 Edge Cases to Test
- Voting on already closed poll (should fail gracefully)
- Creating poll when polls are closed (should be prevented)
- Double-click vote prevention (idempotency)
- Network failure during vote submission (rollback)
- Very long question/option text (truncation)
- Maximum options (10) handling

---

## Appendix A: TypeScript Interfaces

```typescript
// Request DTOs
interface PollOptionInput {
  text: string;
}

interface CreatePollRequest {
  question: string;
  options: PollOptionInput[];
  idempotencyKey: string;
}

interface SubmitVoteRequest {
  pollId: string;
  optionId: string;
  idempotencyKey: string;
}

interface ManagePollRequest {
  pollId: string;
  action: 'close';
  idempotencyKey: string;
}

interface StartGiveawayRequest {
  pollId: string;
  winningOptionId: string;
  prize: string;
  idempotencyKey: string;
}

// Response Types
interface PollCreator {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

interface PollOption {
  id: string;
  text: string;
  pollId: string;
  voteCount?: number;
}

interface Poll {
  id: string;
  question: string;
  isActive: boolean;
  createdAt: string;
  expiresAt: string | null;
  creatorId: string;
  sessionId: string;
  options: PollOption[];
  totalVotes?: number;
  creator?: PollCreator;
}

interface PollResultEnvelope {
  poll: Poll;
  userVotedForOptionId: string | null;
}

interface GiveawayResult {
  pollId: string;
  winner: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  prize: string;
}

interface SocketResponse<T = void> {
  success: boolean;
  pollId?: string;
  error?: string;
  finalStatus?: string;
  winner?: T;
}
```

---

## Appendix B: Socket Events Quick Reference

| Direction | Event | Purpose |
|-----------|-------|---------|
| Client → Server | `poll.create` | Create new poll |
| Client → Server | `poll.vote.submit` | Submit vote |
| Client → Server | `poll.manage` | Close poll |
| Client → Server | `poll.giveaway.start` | Start giveaway |
| Server → Client | `poll.opened` | New poll created |
| Server → Client | `poll.results.updated` | Vote submitted |
| Server → Client | `poll.closed` | Poll closed |
| Server → Client | `poll.giveaway.winner` | Winner selected |
| Server → Client | `poll.history` | Existing polls (TBC) |
| Server → Client | `poll.status.changed` | pollsOpen toggled (TBC) |

---

## Ready to Implement

Once the backend clarifications in Section 8 are resolved, implementation can begin with Phase 1 (Core Infrastructure).

**Estimated Implementation:**
- Phase 1: Core Infrastructure - Hook + GraphQL
- Phase 2: Organizer Experience - Full CRUD
- Phase 3: Attendee Experience - Voting + Results
- Phase 4: Polish - Error handling, loading states

**Dependencies:**
- Backend: GraphQL schema updates for `pollsEnabled`/`pollsOpen`
- Backend: WebSocket events as documented in `POLLS_BACKEND.md`
