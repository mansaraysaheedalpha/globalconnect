# Giveaway System - Backend Requirements

## Vision & Overview

The giveaway system enhances event engagement by rewarding attendees who participate in polls. There are **two giveaway modes**:

### Mode 1: Single Poll Giveaway (Current - Needs Enhancement)
- Organizer creates a poll with a "correct" answer (or any poll)
- Attendees vote
- Organizer closes poll and runs giveaway
- **Random winner selected from voters of the winning option**
- Winner receives congratulations modal + email

### Mode 2: Multi-Poll Quiz Giveaway (New Feature)
- Organizer creates multiple polls (e.g., 5 quiz questions) for a session
- Each poll has a **correct answer** marked
- Attendees vote on all polls
- At session end, organizer can run a "Quiz Giveaway"
- **Winners are attendees who got X or more correct** (configurable threshold)
- All qualifying winners receive congratulations + email

---

## Current Problem

The giveaway winner currently shows as **"Guest User"** because:
1. Votes are stored anonymously (just incrementing counters)
2. Backend doesn't return voter identity with giveaway response
3. No email notification system exists

---

## Database Schema Changes

### 1. Poll Votes Table (New or Enhanced)

```sql
CREATE TABLE poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,

  -- Voter Identity (REQUIRED for giveaways)
  user_id UUID REFERENCES users(id),           -- For authenticated users
  attendee_id UUID REFERENCES attendees(id),   -- For registered attendees

  -- Fallback for anonymous (but giveaway won't work)
  guest_name VARCHAR(255),
  guest_email VARCHAR(255),

  -- Metadata
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,                              -- For fraud prevention

  -- Constraints
  UNIQUE(poll_id, user_id),                     -- One vote per user per poll
  UNIQUE(poll_id, attendee_id),                 -- One vote per attendee per poll

  -- At least one identifier required
  CONSTRAINT voter_identity CHECK (
    user_id IS NOT NULL OR
    attendee_id IS NOT NULL OR
    (guest_name IS NOT NULL AND guest_email IS NOT NULL)
  )
);

CREATE INDEX idx_poll_votes_poll_id ON poll_votes(poll_id);
CREATE INDEX idx_poll_votes_option_id ON poll_votes(option_id);
CREATE INDEX idx_poll_votes_user_id ON poll_votes(user_id);
CREATE INDEX idx_poll_votes_attendee_id ON poll_votes(attendee_id);
```

### 2. Polls Table Enhancement

```sql
ALTER TABLE polls ADD COLUMN IF NOT EXISTS correct_option_id UUID REFERENCES poll_options(id);
ALTER TABLE polls ADD COLUMN IF NOT EXISTS is_quiz BOOLEAN DEFAULT FALSE;
ALTER TABLE polls ADD COLUMN IF NOT EXISTS giveaway_enabled BOOLEAN DEFAULT FALSE;
```

### 3. Giveaway Winners Table (New)

```sql
CREATE TABLE giveaway_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Context
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  poll_id UUID REFERENCES polls(id),            -- NULL for quiz giveaways

  -- Winner Identity
  user_id UUID REFERENCES users(id),
  attendee_id UUID REFERENCES attendees(id),
  winner_name VARCHAR(255) NOT NULL,
  winner_email VARCHAR(255) NOT NULL,

  -- Giveaway Details
  giveaway_type VARCHAR(50) NOT NULL,           -- 'single_poll' | 'quiz_score'
  winning_option_text VARCHAR(500),             -- For single poll
  quiz_score INTEGER,                           -- For quiz (e.g., 4 out of 5)
  quiz_total INTEGER,                           -- Total quiz questions

  -- Prize Details
  prize_title VARCHAR(255),
  prize_description TEXT,
  prize_type VARCHAR(50),                       -- 'physical' | 'virtual' | 'voucher'
  prize_value DECIMAL(10,2),

  -- Claim Information
  claim_instructions TEXT,
  claim_location VARCHAR(500),                  -- For physical prizes
  claim_deadline TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  claim_status VARCHAR(50) DEFAULT 'pending',   -- 'pending' | 'claimed' | 'expired'

  -- Notification Status
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  notification_error TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)          -- Organizer who ran giveaway
);

CREATE INDEX idx_giveaway_winners_session ON giveaway_winners(session_id);
CREATE INDEX idx_giveaway_winners_event ON giveaway_winners(event_id);
CREATE INDEX idx_giveaway_winners_user ON giveaway_winners(user_id);
CREATE INDEX idx_giveaway_winners_attendee ON giveaway_winners(attendee_id);
```

### 4. Session Quiz Settings Table (New)

```sql
CREATE TABLE session_quiz_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,

  -- Quiz Configuration
  quiz_enabled BOOLEAN DEFAULT FALSE,
  passing_score INTEGER DEFAULT 3,              -- Minimum correct answers to win
  total_questions INTEGER,                      -- Auto-calculated from polls

  -- Prize Configuration
  prize_title VARCHAR(255),
  prize_description TEXT,
  prize_type VARCHAR(50) DEFAULT 'virtual',
  prize_value DECIMAL(10,2),
  claim_instructions TEXT,
  claim_location VARCHAR(500),
  claim_deadline_hours INTEGER DEFAULT 72,      -- Hours after giveaway to claim

  -- Limits
  max_winners INTEGER,                          -- NULL = unlimited

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(session_id)
);
```

---

## API Endpoints

### 1. Vote on Poll (Enhanced)

```
POST /api/polls/:pollId/vote
```

**Request Body:**
```json
{
  "optionId": "uuid",
  "voterInfo": {
    "userId": "uuid",           // If authenticated
    "attendeeId": "uuid",       // If registered attendee
    "name": "John Doe",         // Fallback for guests
    "email": "john@example.com" // Required for giveaway eligibility
  }
}
```

**Response:**
```json
{
  "success": true,
  "vote": {
    "id": "uuid",
    "pollId": "uuid",
    "optionId": "uuid",
    "votedAt": "2025-01-15T10:30:00Z",
    "isCorrect": true           // If poll has correct_option_id
  }
}
```

### 2. Run Single Poll Giveaway (Enhanced)

```
POST /api/polls/:pollId/giveaway
```

**Request Body:**
```json
{
  "winningOptionId": "uuid",
  "prize": {
    "title": "Amazon Gift Card",
    "description": "$50 Amazon Gift Card",
    "type": "virtual",          // 'physical' | 'virtual' | 'voucher'
    "value": 50.00,
    "claimInstructions": "You will receive the code via email within 24 hours",
    "claimLocation": null,      // For physical: "Conference Room A, Table 3"
    "claimDeadlineHours": 72
  },
  "sendEmail": true
}
```

**Response:**
```json
{
  "success": true,
  "winner": {
    "id": "uuid",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "optionText": "Option B",
    "prize": {
      "title": "Amazon Gift Card",
      "description": "$50 Amazon Gift Card",
      "type": "virtual",
      "claimInstructions": "You will receive the code via email within 24 hours"
    }
  },
  "totalEligibleVoters": 45,
  "emailSent": true
}
```

### 3. Configure Quiz Giveaway (New)

```
POST /api/sessions/:sessionId/quiz-settings
```

**Request Body:**
```json
{
  "quizEnabled": true,
  "passingScore": 3,            // Minimum correct answers to win
  "prize": {
    "title": "Event Swag Bag",
    "description": "Exclusive conference merchandise pack",
    "type": "physical",
    "value": 75.00,
    "claimInstructions": "Present this email at the registration desk",
    "claimLocation": "Registration Desk, Hall B",
    "claimDeadlineHours": 24
  },
  "maxWinners": 10              // Optional limit
}
```

### 4. Run Quiz Giveaway (New)

```
POST /api/sessions/:sessionId/quiz-giveaway
```

**Request Body:**
```json
{
  "sendEmails": true
}
```

**Response:**
```json
{
  "success": true,
  "quizStats": {
    "totalPolls": 5,
    "totalParticipants": 120,
    "passingScore": 3,
    "scoreDistribution": {
      "5": 12,    // 12 people got all 5 correct
      "4": 28,    // 28 people got 4 correct
      "3": 35,    // 35 people got 3 correct
      "2": 25,
      "1": 15,
      "0": 5
    }
  },
  "winners": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "score": 5,
      "totalQuestions": 5,
      "percentage": 100
    },
    {
      "id": "uuid",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "score": 4,
      "totalQuestions": 5,
      "percentage": 80
    }
    // ... more winners
  ],
  "totalWinners": 75,
  "emailsSent": 75,
  "emailsFailed": 0
}
```

### 5. Get Session Quiz Leaderboard (New)

```
GET /api/sessions/:sessionId/quiz-leaderboard
```

**Response:**
```json
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "name": "John Doe",
      "score": 5,
      "totalQuestions": 5,
      "percentage": 100,
      "completedAt": "2025-01-15T10:45:00Z"
    },
    // ... sorted by score desc, then by completion time asc
  ],
  "totalParticipants": 120,
  "quizComplete": true          // All polls closed
}
```

### 6. Get Giveaway Winners (Organizer)

```
GET /api/sessions/:sessionId/giveaway-winners
GET /api/events/:eventId/giveaway-winners
```

**Response:**
```json
{
  "success": true,
  "winners": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "giveawayType": "quiz_score",
      "score": 5,
      "prize": {
        "title": "Event Swag Bag",
        "type": "physical"
      },
      "claimStatus": "pending",
      "emailSent": true,
      "createdAt": "2025-01-15T11:00:00Z"
    }
  ],
  "pagination": {
    "total": 75,
    "page": 1,
    "pageSize": 20
  }
}
```

### 7. Mark Prize as Claimed (Organizer)

```
PATCH /api/giveaway-winners/:winnerId/claim
```

**Request Body:**
```json
{
  "claimStatus": "claimed",
  "notes": "Picked up at registration desk"
}
```

### 8. Resend Winner Email (Organizer)

```
POST /api/giveaway-winners/:winnerId/resend-email
```

### 9. Export Winners (Organizer)

```
GET /api/sessions/:sessionId/giveaway-winners/export?format=csv
```

---

## WebSocket Events

### Existing Events (Enhanced)

#### `poll.vote` (Client → Server)
```json
{
  "pollId": "uuid",
  "optionId": "uuid",
  "voterInfo": {
    "userId": "uuid",
    "attendeeId": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### `poll.giveaway.winner` (Server → All Clients)
```json
{
  "pollId": "uuid",
  "winner": {
    "name": "Jane Smith",
    "optionText": "Option B",
    "prize": {
      "title": "Amazon Gift Card",
      "type": "virtual"
    }
  },
  "isCurrentUser": false        // true for the winner's client
}
```

### New Events

#### `quiz.giveaway.results` (Server → All Clients)
```json
{
  "sessionId": "uuid",
  "stats": {
    "totalPolls": 5,
    "passingScore": 3,
    "totalWinners": 75,
    "totalParticipants": 120
  },
  "currentUserResult": {
    "isWinner": true,
    "score": 4,
    "totalQuestions": 5,
    "prize": {
      "title": "Event Swag Bag",
      "type": "physical",
      "claimInstructions": "Present this email at the registration desk",
      "claimLocation": "Registration Desk, Hall B"
    }
  }
}
```

#### `quiz.leaderboard.update` (Server → All Clients)
```json
{
  "sessionId": "uuid",
  "topScorers": [
    { "name": "John D.", "score": 5, "rank": 1 },
    { "name": "Jane S.", "score": 4, "rank": 2 },
    // Top 5 only for privacy
  ],
  "currentUserRank": 12,
  "currentUserScore": 3
}
```

---

## Email Templates

### 1. Single Poll Giveaway Winner

**Subject:** 🎉 Congratulations! You won a giveaway at [Event Name]!

```html
<h1>🎉 You're a Winner!</h1>

<p>Hi {{winner.name}},</p>

<p>Congratulations! You've won a giveaway during <strong>{{session.title}}</strong>
at <strong>{{event.name}}</strong>!</p>

<div class="prize-card">
  <h2>🎁 Your Prize</h2>
  <h3>{{prize.title}}</h3>
  <p>{{prize.description}}</p>
  {{#if prize.value}}
  <p><strong>Value:</strong> ${{prize.value}}</p>
  {{/if}}
</div>

<div class="claim-info">
  <h2>📋 How to Claim</h2>
  <p>{{prize.claimInstructions}}</p>

  {{#if prize.claimLocation}}
  <p><strong>📍 Location:</strong> {{prize.claimLocation}}</p>
  {{/if}}

  {{#if prize.claimDeadline}}
  <p><strong>⏰ Claim by:</strong> {{formatDate prize.claimDeadline}}</p>
  {{/if}}
</div>

<div class="poll-info">
  <h3>Poll Details</h3>
  <p><strong>Question:</strong> {{poll.question}}</p>
  <p><strong>Your Answer:</strong> {{winner.optionText}}</p>
</div>

<p>Questions? Contact the event organizer at {{organizer.email}}</p>

<footer>
  <p>This email was sent by GlobalConnect Events Platform</p>
</footer>
```

### 2. Quiz Giveaway Winner

**Subject:** 🏆 Quiz Champion! You qualified for a prize at [Event Name]!

```html
<h1>🏆 Quiz Champion!</h1>

<p>Hi {{winner.name}},</p>

<p>Amazing job! You scored <strong>{{winner.score}}/{{quiz.totalQuestions}}</strong>
({{winner.percentage}}%) on the quiz during <strong>{{session.title}}</strong>!</p>

<div class="score-card">
  <h2>📊 Your Score</h2>
  <div class="score">{{winner.score}} / {{quiz.totalQuestions}}</div>
  <p>Passing Score: {{quiz.passingScore}}</p>
  <p>Your Rank: #{{winner.rank}} of {{quiz.totalParticipants}}</p>
</div>

<div class="prize-card">
  <h2>🎁 Your Prize</h2>
  <h3>{{prize.title}}</h3>
  <p>{{prize.description}}</p>
</div>

<div class="claim-info">
  <h2>📋 How to Claim</h2>
  <p>{{prize.claimInstructions}}</p>

  {{#if prize.claimLocation}}
  <p><strong>📍 Location:</strong> {{prize.claimLocation}}</p>
  {{/if}}

  {{#if prize.claimDeadline}}
  <p><strong>⏰ Claim by:</strong> {{formatDate prize.claimDeadline}}</p>
  {{/if}}
</div>
```

---

## Implementation Priority

### Phase 1: Core Giveaway Fix (Required)
1. ✅ Create `poll_votes` table with voter identity
2. ✅ Update vote endpoint to store voter info
3. ✅ Update giveaway endpoint to return winner details
4. ✅ Add `giveaway_winners` table
5. ✅ Basic email sending for winners

### Phase 2: Quiz Giveaway (New Feature)
1. Add `correct_option_id` to polls
2. Add `is_quiz` boolean to polls
3. Create `session_quiz_settings` table
4. Quiz leaderboard calculation
5. Quiz giveaway endpoint
6. Bulk email sending for quiz winners

### Phase 3: Organizer Tools
1. Winners management dashboard API
2. Export winners endpoint
3. Mark as claimed endpoint
4. Resend email endpoint

---

## Frontend Implementation Status

The following frontend components are **already implemented** and waiting for backend support:

### ✅ Completed Frontend Features

1. **Enhanced Prize Configuration Dialog**
   - Prize title, description, value
   - Prize type (physical/virtual/voucher)
   - Claim instructions and location
   - Claim deadline hours
   - Email notification toggle

2. **Enhanced Giveaway Winner Modal**
   - Shows prize details with icons
   - Displays claim instructions
   - Shows pickup location for physical prizes
   - Displays claim deadline
   - Shows email sent confirmation
   - Different view for winner vs non-winner

3. **Quiz Mode Poll Creation**
   - Toggle to enable quiz mode
   - Mark correct answer with visual indicator
   - Validation to ensure correct answer is selected
   - "Quiz" badge on quiz polls

4. **Quiz Poll Display**
   - "Quiz" badge indicator
   - Correct answer highlighted in green after voting/closing
   - "Correct" badge on the right answer

5. **Quiz Giveaway Result Modal**
   - Shows user's score and rank
   - Displays prize details for winners
   - Shows quiz statistics (total polls, winners, participants)
   - Different view for qualifying vs non-qualifying scores

### WebSocket Events Frontend Listens For

```typescript
// Single poll giveaway winner
socket.on("poll.giveaway.winner", (result: GiveawayResult) => {
  // Shows GiveawayWinnerModal
});

// Quiz giveaway results (all attendees)
socket.on("quiz.giveaway.results", (result: QuizGiveawayResult) => {
  // Shows QuizGiveawayResultModal
});
```

### WebSocket Events Frontend Emits

```typescript
// Create poll (enhanced with quiz support)
socket.emit("poll.create", {
  question: string,
  options: [{ text: string, isCorrect?: boolean }],
  isQuiz?: boolean,
  correctOptionIndex?: number,
  idempotencyKey: string
});

// Start giveaway (enhanced with prize config)
socket.emit("poll.giveaway.start", {
  pollId: string,
  winningOptionId: string,
  prize: {
    title: string,
    description?: string,
    type: "physical" | "virtual" | "voucher",
    value?: number,
    claimInstructions?: string,
    claimLocation?: string,
    claimDeadlineHours?: number
  },
  sendEmail: boolean,
  idempotencyKey: string
});
```

### Expected Response Formats

```typescript
// poll.giveaway.winner event payload (PUBLIC BROADCAST)
// Note: email is intentionally EXCLUDED from public broadcast for privacy
interface GiveawayResult {
  pollId: string;
  winner: {
    id: string;
    name: string;           // Computed: firstName+lastName OR email prefix (e.g., "john" from john@example.com)
    firstName: string | null;
    lastName: string | null;
    // email is NOT included in public broadcast for privacy
    optionText?: string;
  } | null;
  prize: PrizeConfig;       // Full prize object
  totalEligibleVoters?: number;
  emailSent?: boolean;
}

// quiz.giveaway.results event payload
interface QuizGiveawayResult {
  sessionId: string;
  stats: {
    totalPolls: number;
    passingScore: number;
    totalWinners: number;
    totalParticipants: number;
    scoreDistribution: Record<number, number>;
  };
  currentUserResult?: {
    isWinner: boolean;
    score: number;
    totalQuestions: number;
    rank: number;
    prize?: PrizeConfig;
  };
  winners?: QuizScoreResult[];
}
```

---

## Security Considerations

1. **Vote Integrity**
   - One vote per user/attendee per poll (DB constraint)
   - IP tracking for fraud detection
   - Rate limiting on vote endpoints

2. **Privacy**
   - Leaderboard shows first name + last initial only
   - Full details only visible to organizers
   - Email addresses never exposed to other attendees

3. **Giveaway Fairness**
   - Random selection uses cryptographically secure randomness
   - Audit log for all giveaway operations
   - Winners table provides full traceability

---

## Frontend Already Implemented

The frontend components are ready and waiting for these backend changes:
- `GiveawayWinnerModal` - Shows winner celebration
- `SessionPolls` - Has giveaway button and flow
- `useSessionPolls` - Has `startGiveaway` function

The frontend just needs the backend to return actual winner data instead of "Guest User".
