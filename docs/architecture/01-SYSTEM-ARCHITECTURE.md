# System Architecture

## Table of Contents
- [Overview](#overview)
- [Architecture Principles](#architecture-principles)
- [High-Level Architecture](#high-level-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Data Layer](#data-layer)
- [Communication Patterns](#communication-patterns)
- [Scalability](#scalability)
- [Security Architecture](#security-architecture)
- [Monitoring & Observability](#monitoring--observability)

---

## Overview

Event Dynamics follows a **cloud-native, microservices architecture** designed for:
- **High Availability** (99.9% uptime SLA)
- **Horizontal Scalability** (100,000+ concurrent users)
- **Real-Time Performance** (< 100ms latency)
- **Global Distribution** (Multi-region deployment)
- **Developer Productivity** (Modular, testable, maintainable)

---

## Architecture Principles

### 1. Microservices First
Each domain (events, users, monetization) is an independent service with its own database, enabling:
- Independent deployment
- Technology diversity
- Fault isolation
- Team autonomy

### 2. API-First Design
All functionality exposed through well-defined APIs:
- **GraphQL** for flexible data querying
- **REST** for simple operations
- **WebSocket** for real-time updates
- **gRPC** for inter-service communication

### 3. Event-Driven Architecture
Asynchronous communication via events:
- **Message Queues** (Redis, RabbitMQ)
- **Event Streaming** (Kafka for high-volume)
- **WebSocket** for client updates
- **Webhooks** for external integrations

### 4. Database Per Service
Each microservice owns its data:
- **PostgreSQL** for relational data
- **Redis** for caching and queues
- **Elasticsearch** for search
- **S3** for blob storage

### 5. Stateless Services
All services are stateless for easy scaling:
- Session data in Redis
- User context in JWT tokens
- No server-side session affinity
- Horizontal scaling without limits

### 6. Defense in Depth
Multiple layers of security:
- **Network** - VPC, security groups
- **Application** - Authentication, authorization
- **Data** - Encryption at rest and in transit
- **API** - Rate limiting, input validation

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT TIER                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Web App    │  │  Mobile App  │  │   Admin UI   │              │
│  │  (Next.js)   │  │ (React Native│  │  (Next.js)   │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
└─────────┼──────────────────┼──────────────────┼────────────────────┘
          │                  │                  │
          │  HTTPS/WSS       │                  │
          │                  │                  │
┌─────────┼──────────────────┼──────────────────┼────────────────────┐
│         │        EDGE & GATEWAY TIER          │                     │
│  ┌──────┴───────┐   ┌──────────────┐   ┌────┴──────┐              │
│  │ CloudFront   │   │   WAF & DDoS │   │   Load    │              │
│  │     CDN      │   │  Protection  │   │  Balancer │              │
│  └──────┬───────┘   └──────┬───────┘   └────┬──────┘              │
│         │                  │                 │                      │
│  ┌──────┴──────────────────┴─────────────────┴──────┐              │
│  │          Apollo Gateway (GraphQL Federation)      │              │
│  │                  + API Gateway                    │              │
│  └──────┬────────────────────────────────────┬──────┘              │
│         │                                     │                      │
│  ┌──────┴───────┐                    ┌───────┴──────┐              │
│  │  Real-Time   │                    │   REST API   │              │
│  │   Gateway    │                    │    Gateway   │              │
│  │ (Socket.IO)  │                    │    (Nginx)   │              │
│  └──────┬───────┘                    └───────┬──────┘              │
└─────────┼──────────────────────────────────────┼────────────────────┘
          │                                     │
          │  Internal Network                   │
          │                                     │
┌─────────┼─────────────────────────────────────┼────────────────────┐
│         │         SERVICE TIER                │                     │
│  ┌──────┴───────┐   ┌────────────┐   ┌──────┴──────┐              │
│  │  Real-Time   │   │   Event    │   │    User     │              │
│  │   Service    │   │ Lifecycle  │   │   & Org     │              │
│  │   (NestJS)   │   │  Service   │   │  Service    │              │
│  │              │   │  (Python)  │   │  (NestJS)   │              │
│  └──────┬───────┘   └─────┬──────┘   └──────┬──────┘              │
│         │                 │                  │                      │
│  ┌──────┴───────┐   ┌─────┴──────┐   ┌──────┴──────┐              │
│  │ Monetization │   │  Oracle AI │   │ Notification│              │
│  │   Service    │   │   Service  │   │   Service   │              │
│  │   (Python)   │   │  (Python)  │   │   (Node)    │              │
│  └──────┬───────┘   └─────┬──────┘   └──────┬──────┘              │
└─────────┼───────────────────┼──────────────────┼────────────────────┘
          │                   │                  │
          │  Database Connections                │
          │                   │                  │
┌─────────┼───────────────────┼──────────────────┼────────────────────┐
│         │         DATA & CACHE TIER           │                     │
│  ┌──────┴──────────────┐   ┌─────────────────┴──────┐              │
│  │   PostgreSQL        │   │       Redis            │              │
│  │   (Primary +        │   │   (Cache + Queue       │              │
│  │    Replicas)        │   │    + Pub/Sub)          │              │
│  └──────┬──────────────┘   └─────────────────┬──────┘              │
│         │                                     │                      │
│  ┌──────┴──────────────┐   ┌─────────────────┴──────┐              │
│  │  Elasticsearch      │   │    S3 / Object         │              │
│  │  (Search & Logs)    │   │      Storage           │              │
│  └─────────────────────┘   └────────────────────────┘              │
│                                                                      │
│  ┌───────────────────────────────────────────────────┐              │
│  │      Message Queue (RabbitMQ / Kafka)             │              │
│  └───────────────────────────────────────────────────┘              │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Technology Stack
```
Next.js 14 (App Router)
├── React 18 (UI Components)
├── TypeScript 5 (Type Safety)
├── Apollo Client (GraphQL)
├── Socket.IO Client (WebSocket)
├── Zustand (State Management)
├── TailwindCSS (Styling)
└── shadcn/ui (Component Library)
```

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (platform)/        # Platform routes (organizer)
│   │   └── dashboard/
│   ├── (attendee)/        # Attendee routes
│   │   └── attendee/
│   └── (auth)/            # Authentication routes
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── features/         # Feature components
│   └── layouts/          # Layout components
├── graphql/              # GraphQL queries/mutations
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── socket.ts         # WebSocket client
│   └── apollo.ts         # Apollo setup
├── store/                # Global state (Zustand)
├── types/                # TypeScript types
└── utils/                # Utility functions
```

### Data Flow
```
┌──────────────┐
│  React       │
│  Component   │
└──────┬───────┘
       │
       ├─────────► Apollo Client ────► GraphQL API
       │             (Queries)
       │
       ├─────────► Socket.IO ────────► Real-Time Updates
       │             (Events)
       │
       └─────────► Zustand ──────────► Local State
                    (State)
```

### State Management Strategy

#### Server State (Apollo Client)
- GraphQL queries and mutations
- Automatic caching
- Optimistic updates
- Real-time subscriptions

#### Global State (Zustand)
- Authentication state
- UI preferences
- Global notifications
- Feature flags

#### Local State (React Hooks)
- Component-specific state
- Form state
- UI toggles
- Temporary data

#### URL State (Next.js Router)
- Current page/route
- Query parameters
- Search filters
- Pagination

---

## Backend Architecture

### Service Breakdown

#### 1. Event Lifecycle Service (Python + FastAPI)
**Responsibilities:**
- Event CRUD operations
- Session management
- Agenda scheduling
- Ticket management
- Waitlist management
- Polls & Q&A
- Monetization (offers, ads)

**Technology:**
- FastAPI (Web Framework)
- Strawberry (GraphQL)
- SQLAlchemy (ORM)
- Alembic (Migrations)
- Celery (Background Jobs)
- PostgreSQL (Database)

**API Endpoints:**
```graphql
# Events
query events
query event(id: ID!)
mutation createEvent
mutation updateEvent
mutation deleteEvent

# Sessions
query sessionsByEvent(eventId: ID!)
mutation createSession
mutation updateSession

# Waitlist
query sessionWaitlist(sessionId: ID!)
mutation joinWaitlist
mutation sendWaitlistOffer

# Polls
mutation createPoll
mutation submitPollResponse
subscription pollResults
```

#### 2. User & Organization Service (Node.js + NestJS)
**Responsibilities:**
- User authentication
- User profiles
- Organization management
- Team management
- Permissions & roles
- Clerk integration

**Technology:**
- NestJS (Framework)
- TypeORM (ORM)
- Passport (Auth)
- PostgreSQL (Database)
- Redis (Cache)

**API Endpoints:**
```graphql
query me
query user(id: ID!)
query organization(id: ID!)
mutation updateProfile
mutation createOrganization
mutation inviteTeamMember
```

#### 3. Real-Time Service (Node.js + NestJS)
**Responsibilities:**
- WebSocket connections
- Real-time event broadcasting
- Presence tracking
- Chat messaging
- Notification delivery

**Technology:**
- NestJS (Framework)
- Socket.IO (WebSocket)
- Redis (Pub/Sub)
- Bull (Job Queue)

**WebSocket Events:**
```typescript
// Client → Server
socket.emit('join_room', roomId)
socket.emit('send_message', message)
socket.emit('submit_poll_response', response)

// Server → Client
socket.on('POLL_CREATED', handler)
socket.on('WAITLIST_OFFER', handler)
socket.on('MESSAGE_RECEIVED', handler)
socket.on('PRESENCE_UPDATE', handler)
```

#### 4. Oracle AI Service (Python + FastAPI)
**Responsibilities:**
- AI-powered recommendations
- Content moderation
- Sentiment analysis
- Auto-translation
- Smart scheduling

**Technology:**
- FastAPI (Framework)
- OpenAI API (LLM)
- LangChain (AI Orchestration)
- Pinecone (Vector DB)
- Celery (Background Jobs)

#### 5. Notification Service (Node.js + NestJS)
**Responsibilities:**
- Email delivery (SendGrid)
- SMS delivery (Twilio)
- Push notifications
- Notification preferences
- Delivery tracking

**Technology:**
- NestJS (Framework)
- SendGrid SDK
- Twilio SDK
- Firebase Admin SDK
- Bull (Job Queue)

---

## Data Layer

### PostgreSQL Schema Design

#### Multi-Tenancy Strategy
```sql
-- Organization-based partitioning
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  plan_tier VARCHAR(50),
  created_at TIMESTAMP
);

-- All tenant tables reference organization
CREATE TABLE events (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  name VARCHAR(255),
  -- ... other fields
  created_at TIMESTAMP
);

-- Row-Level Security for isolation
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY org_isolation_policy ON events
  USING (organization_id = current_setting('app.current_org_id')::uuid);
```

#### Key Tables
```
organizations
├── users
├── events
│   ├── sessions
│   │   ├── session_waitlist
│   │   ├── session_polls
│   │   ├── session_qa
│   │   └── session_chat
│   ├── tickets
│   ├── registrations
│   └── event_monetization
├── offers
└── advertisements
```

### Indexing Strategy

```sql
-- High-cardinality indexes
CREATE INDEX idx_events_org_date ON events(organization_id, start_date);
CREATE INDEX idx_sessions_event ON sessions(event_id, start_time);

-- Partial indexes for common queries
CREATE INDEX idx_active_events ON events(organization_id)
WHERE status = 'ACTIVE' AND deleted_at IS NULL;

-- GiST index for full-text search
CREATE INDEX idx_events_search ON events
USING gin(to_tsvector('english', name || ' ' || description));

-- B-tree index for foreign keys
CREATE INDEX idx_waitlist_session_user ON session_waitlist(session_id, user_id);
```

### Redis Usage Patterns

#### 1. Caching
```typescript
// Session data cache (TTL: 15 minutes)
redis.setex(`session:${sessionId}`, 900, JSON.stringify(sessionData));

// User profile cache (TTL: 30 minutes)
redis.setex(`user:${userId}`, 1800, JSON.stringify(userData));

// Event list cache (TTL: 5 minutes)
redis.setex(`events:org:${orgId}`, 300, JSON.stringify(events));
```

#### 2. Queues (Waitlist)
```typescript
// Priority queue using sorted sets
redis.zadd(`waitlist:${sessionId}:vip`, timestamp, userId);
redis.zadd(`waitlist:${sessionId}:standard`, timestamp, userId);

// Get next in line
const next = await redis.zpopmin(`waitlist:${sessionId}:vip`);
```

#### 3. Pub/Sub (Real-Time)
```typescript
// Publish event
redis.publish(`session:${sessionId}:updates`, JSON.stringify(event));

// Subscribe to events
redis.subscribe(`session:${sessionId}:updates`, (message) => {
  broadcast ToRoom(sessionId, message);
});
```

#### 4. Rate Limiting
```typescript
// Sliding window rate limiter
const key = `ratelimit:${userId}:${endpoint}`;
const count = await redis.incr(key);
if (count === 1) {
  await redis.expire(key, 60); // 60 seconds
}
if (count > 100) {
  throw new RateLimitError();
}
```

---

## Communication Patterns

### 1. GraphQL Federation

```
┌─────────────────────────────────────────┐
│         Apollo Gateway                  │
│  (Unified GraphQL Schema)              │
└────┬────────────────┬───────────────┬───┘
     │                │               │
     │                │               │
┌────▼────┐     ┌─────▼─────┐  ┌────▼────┐
│ Event   │     │   User    │  │  Org    │
│ Service │     │  Service  │  │ Service │
│         │     │           │  │         │
│ type Event  { │ type User { │ extend type Event {
│   id: ID      │   id: ID    │   organization: Org
│   name: String│   email     │ }
│ }             │ }           │
└───────────────┴─────────────┴───────────┘
```

### 2. Event-Driven Communication

```
┌─────────────┐
│   Service A │
│             │
│  Event:     │
│  "USER_     │
│   REGISTERED"│
└──────┬──────┘
       │
       │ Publish to Message Queue
       ▼
┌────────────────────────────┐
│    Message Broker          │
│    (RabbitMQ / Kafka)      │
└──────┬─────────────┬───────┘
       │             │
       │Subscribe    │Subscribe
       ▼             ▼
┌──────────┐   ┌──────────┐
│ Service B│   │ Service C│
│          │   │          │
│ Send     │   │ Create   │
│ Welcome  │   │ Profile  │
│ Email    │   │ Record   │
└──────────┘   └──────────┘
```

### 3. Request/Response (Synchronous)

```
Client ──REST/GraphQL──► API Gateway ──► Service
                                          │
                                          ▼
                                     Process Request
                                          │
                                          ▼
                                      Database
                                          │
                                          ▼
Client ◄──────Response────────────────────┘
```

### 4. WebSocket (Real-Time)

```
Client ──WebSocket──► Real-Time Service
  │                        │
  │                        ▼
  │                   Redis Pub/Sub
  │                        │
  │                        ├──► Broadcast to Room
  │                        │
  │ ◄──────Event───────────┘
  │
  ▼
Update UI
```

---

## Scalability

### Horizontal Scaling

#### Auto-Scaling Configuration
```yaml
# Kubernetes HorizontalPodAutoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: event-service
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: event-service
  minReplicas: 3
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

#### Load Balancing
```
                    ┌──────────────┐
                    │Load Balancer │
                    │   (ALB/NLB)  │
                    └──────┬───────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
    │Service  │       │Service  │       │Service  │
    │Pod 1    │       │Pod 2    │       │Pod 3    │
    └─────────┘       └─────────┘       └─────────┘
```

### Database Scaling

#### Read Replicas
```
┌─────────────┐
│   Primary   │ ◄──── All Writes
│  (Master)   │
└──────┬──────┘
       │ Replication
       ├──────────────────────┐
       │                      │
┌──────▼──────┐        ┌──────▼──────┐
│  Replica 1  │        │  Replica 2  │
│   (Read)    │        │   (Read)    │
└─────────────┘        └─────────────┘
       ▲                      ▲
       │                      │
       └──── Read Queries ────┘
```

#### Sharding (Future)
```
Shard by Organization ID

┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│  Shard 1       │  │  Shard 2       │  │  Shard 3       │
│  Orgs 1-1000   │  │  Orgs 1001-2000│  │  Orgs 2001-3000│
└────────────────┘  └────────────────┘  └────────────────┘
```

### Cache Layer

```
┌────────────┐
│   Client   │
└──────┬─────┘
       │
       ▼
┌──────────────────┐
│  CDN (CloudFront)│ ◄── Static Assets
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Redis Cache     │ ◄── API Responses
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   Database       │ ◄── Cache Miss
└──────────────────┘
```

---

## Security Architecture

### Defense Layers

```
┌─────────────────────────────────────────┐
│  Layer 1: Network Security              │
│  - VPC with private subnets             │
│  - Security groups                      │
│  - Network ACLs                         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Layer 2: Edge Security                 │
│  - WAF (Web Application Firewall)       │
│  - DDoS protection                      │
│  - Rate limiting                        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Layer 3: Application Security          │
│  - JWT authentication                   │
│  - RBAC authorization                   │
│  - Input validation                     │
│  - CSRF protection                      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Layer 4: Data Security                 │
│  - Encryption at rest (AES-256)         │
│  - Encryption in transit (TLS 1.3)      │
│  - Database encryption                  │
│  - Secret management (Vault)            │
└─────────────────────────────────────────┘
```

### Authentication Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │ 1. Login Request
     ▼
┌─────────────┐
│   Clerk     │
│   Auth      │
└────┬────────┘
     │ 2. Generate JWT
     ▼
┌──────────┐
│  Client  │ ──3. API Request (JWT in header)──►
└──────────┘                                     │
                                                 ▼
                                          ┌──────────────┐
                                          │ API Gateway  │
                                          └──────┬───────┘
                                                 │ 4. Verify JWT
                                                 ▼
                                          ┌──────────────┐
                                          │   Service    │
                                          └──────────────┘
```

---

## Monitoring & Observability

### Metrics Collection

```
┌────────────────────────────────────────┐
│         Application Metrics            │
│  - Request rate                        │
│  - Error rate                          │
│  - Response time (p50, p95, p99)       │
│  - Active connections                  │
└────────────┬───────────────────────────┘
             │
             ▼
      ┌──────────────┐
      │  Prometheus  │
      └──────┬───────┘
             │
             ▼
      ┌──────────────┐
      │   Grafana    │ ◄── Visualization
      └──────────────┘
```

### Logging

```
Applications ──► Structured Logs ──► Fluentd ──► Elasticsearch ──► Kibana
                 (JSON format)      (Collector) (Storage)      (Visualization)
```

### Distributed Tracing

```
Request ID: abc123

Frontend ──1──► Gateway ──2──► Service A ──3──► Database
                   │
                   └──4──► Service B ──5──► Cache

All spans tagged with abc123 for end-to-end tracing
```

### Alerting

```yaml
# Sample Alert Rule
- alert: HighErrorRate
  expr: |
    rate(http_requests_total{status=~"5.."}[5m])
    /
    rate(http_requests_total[5m])
    > 0.05
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "High error rate detected"
    description: "Error rate is {{ $value | humanizePercentage }}"
```

---

## Deployment Architecture

### Multi-Region Setup

```
                  ┌───────────────┐
                  │  Global DNS   │
                  │   (Route 53)  │
                  └───────┬───────┘
                          │
       ┌──────────────────┼──────────────────┐
       │                  │                  │
  ┌────▼─────┐      ┌─────▼────┐      ┌─────▼────┐
  │ US-East  │      │ EU-West  │      │ AP-South │
  │ Region   │      │ Region   │      │ Region   │
  └──────────┘      └──────────┘      └──────────┘

Each Region Contains:
- Kubernetes Cluster
- PostgreSQL (Primary + Replicas)
- Redis Cluster
- S3 Bucket
- Monitoring Stack
```

### CI/CD Pipeline

```
Developer ──► GitHub ──► GitHub Actions ──► Build & Test
                                               │
                                               ▼
                                           Docker Image
                                               │
                                               ▼
                                          Push to ECR
                                               │
                                               ▼
                                          ArgoCD Sync
                                               │
                                               ▼
                                       Deploy to Kubernetes
                                               │
                                               ▼
                                         Health Checks
                                               │
                                               ▼
                                           ✅ Live!
```

---

## Performance Optimization

### Caching Strategy
1. **CDN** - Static assets (HTML, CSS, JS, images)
2. **Redis** - API responses, user sessions
3. **Apollo Cache** - GraphQL query results
4. **Database** - Query result caching

### Database Optimization
1. **Indexes** - Appropriate B-tree and GiST indexes
2. **Connection Pooling** - PgBouncer (max 100 connections)
3. **Query Optimization** - EXPLAIN ANALYZE all slow queries
4. **Partitioning** - Time-based partitioning for large tables

### API Optimization
1. **DataLoader** - Batch and cache database requests
2. **GraphQL** - Query only needed fields
3. **Pagination** - Cursor-based pagination
4. **Compression** - Gzip/Brotli for API responses

---

## Conclusion

This architecture is designed to:
- ✅ Scale to millions of users
- ✅ Maintain sub-100ms response times
- ✅ Provide 99.9% uptime
- ✅ Enable rapid feature development
- ✅ Ensure data security and compliance

The modular, microservices approach allows for independent scaling, deployment, and technology choices while maintaining consistency through well-defined APIs and contracts.

---

**Document Version:** 1.0
**Last Updated:** January 3, 2026
**Next Review:** April 2026
**Maintained By:** Architecture Team
