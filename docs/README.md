# GlobalConnect Documentation

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Status](https://img.shields.io/badge/status-production-green)
![Platform](https://img.shields.io/badge/platform-web-lightgrey)

**GlobalConnect** is a comprehensive, enterprise-grade event management platform that enables organizations to create, manage, and scale virtual and hybrid events with advanced engagement features, real-time interactions, and powerful monetization capabilities.

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [Platform Overview](./01-PLATFORM-OVERVIEW.md) | High-level architecture, capabilities, and features |
| [Quick Start Guide](./02-QUICK-START.md) | Get running locally in 10 minutes |
| [System Architecture](./architecture/01-SYSTEM-ARCHITECTURE.md) | Technical architecture deep-dive |
| [Environment Setup](./ENVIRONMENT_SETUP.md) | Environment variables & deployment configuration |
| [Security Requirements](./SECURITY_BACKEND_REQUIREMENTS.md) | Backend security implementation guide |

---

## Platform Overview

GlobalConnect is an all-in-one event management solution built for modern organizations:

- **Scalability** - Handle events from 10 to 100,000+ attendees
- **Real-Time** - WebSocket-powered live interactions across all features
- **Monetization** - Built-in ads, offers, tickets, and waitlist management
- **Analytics** - Comprehensive insights and data-driven decision making
- **Enterprise Security** - Advanced access controls and data protection

---

## Core Features

### Event Management
- Multi-format events (virtual, hybrid, in-person)
- Flexible scheduling with multi-day, multi-track support
- Session management with speaker profiles
- Drag-and-drop agenda builder
- Custom branding and themes

### Attendee Engagement
- **Live Polls** - Real-time audience polling with instant results
- **Q&A** - Live questions with upvoting and moderation
- **Chat** - Session-level and direct messaging
- **Reactions** - Emoji reactions for live engagement
- **Gamification** - Points, badges, and leaderboards

### Monetization
- Multi-tier ticketing with promo codes
- Flash sales and exclusive offers
- Banner advertising with targeting
- Sponsorship tiers and benefits
- Waitlist management with automated offers
- Stripe payment processing

### Real-Time Features
- Sub-100ms latency updates via WebSocket
- Live dashboard metrics
- Push notifications
- Presence indicators

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.x | React framework (App Router) |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| Apollo Client | 3.x | GraphQL client |
| Socket.IO Client | 4.x | WebSocket client |
| TailwindCSS | 3.x | Styling |
| Zustand | 4.x | State management |

### Backend Services
- **GraphQL API** - Apollo Gateway with federation
- **Event Service** - Python/FastAPI
- **Real-Time Service** - Node.js/NestJS with Socket.IO
- **AI Agent Service** - Python engagement conductor

### Infrastructure
- PostgreSQL 14+ (Database)
- Redis 7+ (Cache & Pub/Sub)
- AWS S3 (Media storage)
- Vercel (Frontend deployment)

---

## Quick Start

### Prerequisites
```bash
Node.js 20+
pnpm 8+
```

### Installation
```bash
# Clone repository
git clone https://github.com/yourorg/globalconnect.git
cd globalconnect

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
pnpm dev
```

### Access Points
- **Frontend**: http://localhost:3000
- **GraphQL API**: Configured via `NEXT_PUBLIC_API_URL`
- **Real-Time**: Configured via `NEXT_PUBLIC_REALTIME_URL`

For detailed setup instructions, see the [Quick Start Guide](./02-QUICK-START.md).

---

## Environment Configuration

### Required Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | GraphQL API endpoint |
| `NEXT_PUBLIC_API_BASE_URL` | REST API base URL |
| `NEXT_PUBLIC_EVENT_SERVICE_URL` | Event service for uploads |
| `NEXT_PUBLIC_REALTIME_URL` | Socket.IO server URL |
| `NEXT_PUBLIC_SOCKET_URL` | Socket base URL |
| `NEXT_PUBLIC_AGENT_SERVICE_URL` | AI agent service URL |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `NEXT_PUBLIC_APP_URL` | Your frontend URL |
| `NEXT_PUBLIC_APP_ENV` | Environment (production) |

For detailed configuration and obtaining API keys, see [Environment Setup](./ENVIRONMENT_SETUP.md).

---

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel Dashboard
3. Deploy

### CI/CD Pipeline

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that:
- Runs linting and type checking
- Builds the production application
- Runs security audits

Add your environment variables as GitHub Secrets for CI to work correctly.

---

## Security

### Implemented (Frontend)
- Security headers (CSP, HSTS, X-Frame-Options)
- Input sanitization
- CSRF protection utilities
- Token expiration validation
- Server-side route protection (middleware)

### Required (Backend)
See [Security Requirements](./SECURITY_BACKEND_REQUIREMENTS.md) for:
- HttpOnly cookie authentication
- Rate limiting
- CORS configuration
- WebSocket security

---

## Project Structure

```
globalconnect/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (platform)/         # Organizer dashboard routes
│   │   ├── (attendee)/         # Attendee portal routes
│   │   ├── (public)/           # Public routes
│   │   └── auth/               # Authentication routes
│   ├── components/             # React components
│   │   ├── ui/                 # Base UI components (shadcn)
│   │   └── features/           # Feature-specific components
│   ├── graphql/                # GraphQL queries/mutations
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility libraries
│   ├── store/                  # Zustand state management
│   └── types/                  # TypeScript types
├── docs/                       # Documentation
├── public/                     # Static assets
└── .github/workflows/          # CI/CD configuration
```

---

## Performance Targets

| Metric | Target |
|--------|--------|
| API Response (p95) | < 200ms |
| WebSocket Latency | < 100ms |
| Page Load Time | < 2s |
| Time to Interactive | < 3s |

---

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Support

- **Issues**: [GitHub Issues](https://github.com/yourorg/globalconnect/issues)
- **Documentation**: This folder
- **Email**: support@globalconnect.com

---

**Last Updated:** January 2026
**Version:** 2.0.0
**Status:** Production Ready
