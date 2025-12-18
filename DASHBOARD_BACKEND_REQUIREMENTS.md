# Dashboard Backend Requirements

## Overview
The organizer dashboard currently displays hardcoded/placeholder data. This document specifies the GraphQL queries and backend logic needed to replace them with real-time data.

---

## Current Hardcoded Metrics (to be replaced)

| Metric | Current Value | Location |
|--------|---------------|----------|
| Total Attendees | "2,847" | dashboard/page.tsx:53 |
| Avg. Engagement | "78%" | dashboard/page.tsx:54 |
| Active Sessions | "24" | dashboard/page.tsx:55 |
| Weekly Attendance | [120, 180, 150, 220, 280, 190, 240] | dashboard/page.tsx:58-66 |
| Engagement Sparkline | [45, 52, 38, 65, 72, 58, 80, 75, 90, 85, 92, 88] | dashboard/page.tsx:68 |
| Q&A Participation | 67% | dashboard/page.tsx:146 |
| Poll Responses | 82% | dashboard/page.tsx:147 |
| Chat Activity | 45% | dashboard/page.tsx:148 |

---

## Required GraphQL Queries

### 1. Organization Dashboard Stats Query

```graphql
query GetOrganizationDashboardStats {
  organizationDashboardStats {
    # Total unique attendees across all organization events
    totalAttendees
    totalAttendeesChange  # % change from previous period (optional)

    # Currently active sessions (startTime <= now <= endTime)
    activeSessions
    activeSessionsChange

    # Average engagement rate across all events
    # Formula: (totalInteractions / totalPossibleInteractions) * 100
    avgEngagementRate
    avgEngagementChange

    # Total events count (already available via eventsByOrganization.totalCount)
    totalEvents
    totalEventsChange
  }
}
```

**Backend Logic:**
- `totalAttendees`: COUNT DISTINCT user_id FROM registrations WHERE event.organization_id = current_org AND status = 'REGISTERED'
- `activeSessions`: COUNT FROM sessions WHERE organization_id = current_org AND startTime <= NOW() AND endTime >= NOW()
- `avgEngagementRate`: Calculate from engagement_events table (see Engagement Tracking section)

---

### 2. Weekly Attendance Query

```graphql
query GetWeeklyAttendance($days: Int = 7) {
  weeklyAttendance(days: $days) {
    data {
      label       # "Mon", "Tue", etc.
      date        # ISO date string
      value       # Number of check-ins or registrations that day
    }
  }
}
```

**Backend Logic:**
- Return registrations/check-ins grouped by day for the last N days
- `value`: COUNT FROM registrations WHERE created_at >= (NOW - N days) GROUP BY DATE(created_at)

---

### 3. Engagement Trend Query (Sparkline Data)

```graphql
query GetEngagementTrend($periods: Int = 12) {
  engagementTrend(periods: $periods) {
    data {
      period      # Period identifier (e.g., "Week 1", or ISO date)
      value       # Engagement score for that period (0-100)
    }
  }
}
```

**Backend Logic:**
- Aggregate engagement events over configurable time periods
- Each period's value = (interactions in period / max possible interactions) * 100

---

### 4. Engagement Breakdown Query

```graphql
query GetEngagementBreakdown($eventId: ID) {
  engagementBreakdown(eventId: $eventId) {
    # Q&A participation: users who asked/voted on questions / total attendees
    qaParticipation
    qaParticipationCount      # Absolute number of users who participated
    qaTotal                   # Total possible participants

    # Poll responses: users who responded to polls / total attendees
    pollResponseRate
    pollResponseCount
    pollTotal

    # Chat activity: users who sent messages / total attendees
    chatActivityRate
    chatMessageCount
    chatParticipants
    chatTotal
  }
}
```

**Backend Logic:**
- If `eventId` is provided, scope to that event
- If `eventId` is null, aggregate across all organization events
- `qaParticipation`: (DISTINCT users with qa_events / total_attendees) * 100
- `pollResponseRate`: (DISTINCT users with poll_responses / total_attendees) * 100
- `chatActivityRate`: (DISTINCT users with chat_messages / total_attendees) * 100

---

## Required Database Tables/Collections

### 1. Engagement Events Table (if not exists)

```sql
CREATE TABLE engagement_events (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  event_id UUID NOT NULL,
  session_id UUID,
  user_id UUID NOT NULL,
  event_type ENUM('QA_QUESTION', 'QA_VOTE', 'POLL_RESPONSE', 'CHAT_MESSAGE', 'REACTION'),
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB  -- Additional data specific to event type
);

CREATE INDEX idx_engagement_org ON engagement_events(organization_id);
CREATE INDEX idx_engagement_event ON engagement_events(event_id);
CREATE INDEX idx_engagement_created ON engagement_events(created_at);
```

### 2. Update Existing Tables

Ensure these fields exist:
- `sessions.startTime` - DateTime
- `sessions.endTime` - DateTime
- `registrations.checked_in_at` - DateTime (for attendance tracking)
- `registrations.created_at` - DateTime (for registration date tracking)

---

## Real-time Updates (WebSocket)

For live dashboard updates, emit events on:

```typescript
// Event types to broadcast
interface DashboardUpdateEvent {
  type: 'ATTENDEE_REGISTERED' | 'ATTENDEE_CHECKED_IN' | 'SESSION_STARTED' |
        'SESSION_ENDED' | 'ENGAGEMENT_UPDATE';
  organizationId: string;
  data: {
    // Incremental update data
    totalAttendees?: number;
    activeSessions?: number;
    engagementRate?: number;
  };
}
```

**WebSocket Channel:** `organization:{orgId}:dashboard`

---

## API Response Examples

### organizationDashboardStats Response
```json
{
  "data": {
    "organizationDashboardStats": {
      "totalAttendees": 847,
      "totalAttendeesChange": 12,
      "activeSessions": 3,
      "activeSessionsChange": 1,
      "avgEngagementRate": 72.5,
      "avgEngagementChange": 5.2,
      "totalEvents": 15,
      "totalEventsChange": 2
    }
  }
}
```

### weeklyAttendance Response
```json
{
  "data": {
    "weeklyAttendance": {
      "data": [
        { "label": "Mon", "date": "2025-12-09", "value": 45 },
        { "label": "Tue", "date": "2025-12-10", "value": 62 },
        { "label": "Wed", "date": "2025-12-11", "value": 58 },
        { "label": "Thu", "date": "2025-12-12", "value": 71 },
        { "label": "Fri", "date": "2025-12-13", "value": 89 },
        { "label": "Sat", "date": "2025-12-14", "value": 34 },
        { "label": "Sun", "date": "2025-12-15", "value": 28 }
      ]
    }
  }
}
```

### engagementBreakdown Response
```json
{
  "data": {
    "engagementBreakdown": {
      "qaParticipation": 67,
      "qaParticipationCount": 234,
      "qaTotal": 349,
      "pollResponseRate": 82,
      "pollResponseCount": 286,
      "pollTotal": 349,
      "chatActivityRate": 45,
      "chatMessageCount": 1247,
      "chatParticipants": 157,
      "chatTotal": 349
    }
  }
}
```

---

## Implementation Priority

### Phase 1 (Critical - Needed Immediately)
1. `organizationDashboardStats` query - Core dashboard metrics
2. `weeklyAttendance` query - Attendance chart

### Phase 2 (Important)
3. `engagementBreakdown` query - Engagement metrics
4. `engagementTrend` query - Sparkline data

### Phase 3 (Enhancement)
5. WebSocket real-time updates
6. Historical comparison data (% change calculations)

---

## Notes for Backend Developer

1. **Authentication**: All queries should be scoped to the current user's active organization (from JWT token)

2. **Performance**:
   - Consider caching dashboard stats with 1-minute TTL
   - Use materialized views for complex aggregations
   - Index heavily queried columns

3. **Edge Cases**:
   - New organizations with no events should return 0s, not errors
   - Handle timezone differences for weekly attendance (use org timezone)

4. **Existing Infrastructure**:
   - Events already have `registrationsCount` field - can be reused
   - Sessions have `chatEnabled`, `qaEnabled`, `pollsEnabled` flags
   - Use existing `registrationsByEvent` resolver as reference

---

## Frontend Integration Points

Once backend is ready, frontend will:

1. Add GraphQL queries to `src/graphql/dashboard.graphql.ts`
2. Update `src/app/(platform)/dashboard/page.tsx` to use `useQuery` hooks
3. Add loading skeletons during data fetch
4. Implement WebSocket subscription for real-time updates

---

## Questions for Backend Team

1. Is there an existing engagement/analytics tracking system we should integrate with?
2. Should we track engagement at session level or event level granularity?
3. What's the preferred approach for historical data - store aggregates or compute on-demand?
4. Are there any rate limiting considerations for the dashboard stats endpoint?
