# Session RSVP Integration Guide

This guide shows how to integrate Session RSVP functionality into your event platform.

## Components Created

### 1. **SessionRsvpButton** Component
Location: `src/components/features/sessions/SessionRsvpButton.tsx`

A reusable button component that handles:
- RSVP to session (with capacity checking)
- Cancel RSVP (with confirmation dialog)
- Capacity display (e.g., "47/50 seats")
- Loading states
- Success/error toast notifications

**Props:**
```typescript
{
  sessionId: string;          // Required
  eventId?: string;
  isRsvped?: boolean;         // Current RSVP status
  currentCapacity?: number;   // Current attendee count
  maxCapacity?: number | null;// Max capacity (null = unlimited)
  className?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  onRsvpChange?: (isRsvped: boolean) => void;
}
```

### 2. **My Schedule Page**
Location: `src/app/(platform)/events/[id]/my-schedule/page.tsx`

Displays all sessions the user has RSVPed for:
- Grouped by date (Today, Tomorrow, etc.)
- Shows session details (time, speakers, type)
- Inline cancel RSVP functionality
- Empty state with link to agenda

## Integration into Existing Components

### Option 1: Add to Live Agenda Session Cards

**File**: `src/components/features/agenda/live-agenda.tsx`

**Step 1**: Import the component
```typescript
import { SessionRsvpButton } from "@/components/features/sessions/SessionRsvpButton";
```

**Step 2**: Extend AgendaSession interface to include RSVP data
```typescript
// In use-agenda-updates.ts or types file
export interface AgendaSession {
  id: string;
  title: string;
  // ... existing fields ...

  // Add RSVP fields:
  userRsvpStatus?: "CONFIRMED" | "CANCELLED" | null;
  currentCapacity?: number;
  maxCapacity?: number | null;
}
```

**Step 3**: Add button to SessionCard component (around line 200-250)
```tsx
const SessionCard = ({ session, eventId, isRecentlyUpdated, onClick }) => {
  // ... existing code ...

  return (
    <Card>
      <CardHeader>
        {/* ... existing title, time, location ... */}
      </CardHeader>
      <CardContent>
        {/* ... existing description ... */}

        {/* Add RSVP button */}
        <div className="mt-4 flex items-center justify-between">
          {/* Existing buttons/info */}

          {session.maxCapacity !== undefined && (
            <SessionRsvpButton
              sessionId={session.id}
              eventId={eventId}
              isRsvped={session.userRsvpStatus === "CONFIRMED"}
              currentCapacity={session.currentCapacity}
              maxCapacity={session.maxCapacity}
              size="sm"
              onRsvpChange={(isRsvped) => {
                // Optionally refetch agenda to update counts
              }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
```

### Option 2: Add to Session Detail Modal/Page

If you have a session detail view:

```tsx
import { SessionRsvpButton } from "@/components/features/sessions/SessionRsvpButton";

function SessionDetailView({ session, eventId }) {
  return (
    <div>
      {/* Session details */}

      <div className="mt-6">
        <SessionRsvpButton
          sessionId={session.id}
          eventId={eventId}
          isRsvped={session.userRsvpStatus === "CONFIRMED"}
          currentCapacity={session.currentCapacity}
          maxCapacity={session.maxCapacity}
          variant="default"
          size="lg"
          className="w-full"
        />
      </div>
    </div>
  );
}
```

## GraphQL Queries Update

To get RSVP data in your agenda queries, update them to include:

```graphql
query GetEventAgenda($eventId: ID!) {
  publicSessionsByEvent(eventId: $eventId) {
    id
    title
    startTime
    endTime
    # ... other fields ...

    # Add these fields:
    currentCapacity
    maxCapacity
    userRsvpStatus  # "CONFIRMED", "CANCELLED", or null
  }
}
```

**Backend**: You'll need to add these fields to your GraphQL schema's Session type.

## Navigation Integration

Add "My Schedule" link to your navigation menu:

```tsx
// In your event navigation
<Link href={`/events/${eventId}/my-schedule`}>
  <Calendar className="h-4 w-4 mr-2" />
  My Schedule
</Link>
```

## Features Implemented

✅ **Capacity Management**
- Real-time capacity display (X/Y seats)
- Full session detection
- Atomic capacity checking (race condition prevention)

✅ **User Experience**
- Confirmation dialog before cancelling RSVP
- Success/error toast notifications
- Loading states during mutations
- Disabled states when full

✅ **Performance**
- Rate limiting (5 requests/min per user)
- Optimistic UI updates
- Cache updates after mutations

✅ **Edge Cases Handled**
- Session full → direct to waitlist
- Concurrent RSVPs → database locking
- Network errors → retry with user feedback
- Already RSVPed → idempotent responses

## Backend Endpoints

The component uses these GraphQL mutations:

1. **RSVP to Session**
   ```graphql
   mutation RsvpToSession($input: RsvpToSessionInput!) {
     rsvpToSession(input: $input) {
       success
       message
       rsvp {
         id
         sessionId
         userId
         status
       }
     }
   }
   ```

2. **Cancel RSVP**
   ```graphql
   mutation CancelSessionRsvp($input: CancelSessionRsvpInput!) {
     cancelSessionRsvp(input: $input) {
       success
       message
     }
   }
   ```

3. **Get My Schedule**
   ```graphql
   query GetMySchedule($eventId: ID!) {
     mySchedule(eventId: $eventId) {
       rsvpId
       sessionId
       title
       startTime
       endTime
       sessionType
       speakers
       rsvpStatus
     }
   }
   ```

All mutations include:
- Authentication requirement
- Rate limiting (5 req/min)
- Capacity enforcement
- Waitlist auto-offer on cancellation

## Testing

To test the integration:

1. **RSVP Flow**:
   - Browse agenda
   - Click RSVP on a session
   - Verify capacity decrements
   - Check "My Schedule" page

2. **Cancel Flow**:
   - Go to "My Schedule"
   - Click "RSVPed" button
   - Confirm cancellation
   - Verify removed from schedule

3. **Full Session**:
   - RSVP until capacity reached
   - Verify button shows "Full"
   - Verify new users see "Join Waitlist" message

4. **Edge Cases**:
   - Spam clicking RSVP (rate limit test)
   - Multiple users RSVPing simultaneously
   - Network interruption during RSVP

## Styling Customization

The component uses Tailwind + shadcn/ui. Customize via:

```tsx
<SessionRsvpButton
  variant="outline"  // Button variant
  size="lg"          // Button size
  className="custom-class"  // Additional styles
/>
```

States are color-coded:
- **Not RSVPed**: Default button style
- **RSVPed**: Green background (`bg-green-50`)
- **Full**: Disabled with X icon
- **Loading**: Spinner animation

## Future Enhancements

Potential improvements:
- Email reminders before session starts
- Calendar export (.ics file)
- Conflict detection (overlapping sessions)
- Waitlist integration UI
- Mobile app notifications
