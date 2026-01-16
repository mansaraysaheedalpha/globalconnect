# Quick Start Guide

Get Event Dynamics running on your local machine in **10 minutes** or less.

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
```bash
✅ Node.js 18+ (LTS recommended)
✅ Python 3.11+
✅ PostgreSQL 14+
✅ Redis 7+
✅ Git
```

### Recommended Tools
```bash
📦 Docker & Docker Compose (for simplified setup)
📦 VS Code with recommended extensions
📦 Postman or GraphQL Playground
📦 pgAdmin or DBeaver (database GUI)
```

### Check Your Installation
```bash
# Node.js
node --version  # Should show v18+ or v20+

# Python
python --version  # Should show 3.11+

# PostgreSQL
psql --version  # Should show 14+

# Redis
redis-cli --version  # Should show 7+

# Docker (optional but recommended)
docker --version
docker-compose --version
```

---

## Option 1: Docker Setup (Recommended)

**Fastest way to get started** - Everything runs in containers.

### Step 1: Clone Repository
```bash
git clone https://github.com/yourorg/globalconnect.git
cd globalconnect
```

### Step 2: Configure Environment
```bash
# Copy environment template
cp .env.example .env.local

# Edit the file with your settings
# Required: Database URL, Redis URL, API keys
nano .env.local  # or use your favorite editor
```

### Step 3: Start All Services
```bash
# Start everything with one command
docker-compose up -d

# This will start:
# - PostgreSQL database
# - Redis cache
# - Frontend (Next.js)
# - Apollo Gateway
# - Event Lifecycle Service
# - User & Org Service
# - Real-Time Service
```

### Step 4: Initialize Database
```bash
# Run migrations
docker-compose exec event-service python manage.py migrate

# Seed sample data (optional)
docker-compose exec event-service python manage.py seed
```

### Step 5: Access the Application
```bash
# Frontend
open http://localhost:3000

# GraphQL Playground
open http://localhost:4000/graphql

# Admin Dashboard
open http://localhost:3000/admin
```

### Quick Health Check
```bash
# Check all services are running
docker-compose ps

# View logs
docker-compose logs -f

# Check a specific service
docker-compose logs -f frontend
```

**🎉 That's it! You're running Event Dynamics locally.**

---

## Option 2: Manual Setup

For developers who prefer granular control or don't use Docker.

### Step 1: Clone & Setup

```bash
# Clone repository
git clone https://github.com/yourorg/globalconnect.git
cd globalconnect

# Create environment files
cp .env.example .env.local
```

### Step 2: Database Setup

```bash
# Create PostgreSQL database
createdb globalconnect

# Create Redis database (usually runs on default port 6379)
redis-server --daemonize yes

# Update .env.local with your database URLs
```

### Step 3: Backend Services

#### Event Lifecycle Service (Python)
```bash
cd backend/event-lifecycle-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment
cp .env.example .env

# Run migrations
alembic upgrade head

# Seed data (optional)
python scripts/seed.py

# Start service
uvicorn app.main:app --reload --port 8001
```

#### User & Organization Service (Node.js)
```bash
cd backend/user-and-org-service

# Install dependencies
npm install

# Copy environment
cp .env.example .env

# Run migrations
npm run migrate

# Start service
npm run dev
```

#### Real-Time Service (Node.js)
```bash
cd backend/real-time-service

# Install dependencies
npm install

# Copy environment
cp .env.example .env

# Start service
npm run dev
```

#### Apollo Gateway
```bash
cd backend/apollo-gateway

# Install dependencies
npm install

# Copy environment
cp .env.example .env

# Start gateway
npm run dev
```

### Step 4: Frontend

```bash
cd globalconnect  # Return to root

# Install dependencies
npm install

# Copy environment
cp .env.example .env.local

# Start development server
npm run dev
```

### Step 5: Verify Installation

```bash
# Check all services are running
# Backend Services:
# - Event Service: http://localhost:8001
# - User Service: http://localhost:8002
# - Real-Time: http://localhost:3002
# - Apollo Gateway: http://localhost:4000

# Frontend:
# - Next.js: http://localhost:3000

# Access the application
open http://localhost:3000
```

---

## Quick Tour

### 1. Create Your First Event

```bash
# Navigate to the dashboard
open http://localhost:3000/dashboard

# Click "Create Event"
# Fill in:
# - Event name: "My First Event"
# - Date: Tomorrow
# - Type: Virtual
# - Click "Create"
```

### 2. Add a Session

```bash
# In your event dashboard
# Click "Add Session"
# Fill in:
# - Title: "Opening Keynote"
# - Start time: Event start time
# - Duration: 1 hour
# - Click "Create Session"
```

### 3. Enable Features

```bash
# In session settings:
# ✅ Enable Polls
# ✅ Enable Q&A
# ✅ Enable Chat
# ✅ Enable Reactions
# Click "Save"
```

### 4. Test Real-Time Features

```bash
# Open two browser windows
# Window 1: Organizer view
open http://localhost:3000/dashboard/events/[eventId]

# Window 2: Attendee view
open http://localhost:3000/attendee/events/[eventId]

# In organizer view: Create a poll
# In attendee view: See poll appear instantly!
```

---

## Common Tasks

### Create Sample Data

```bash
# Using Docker
docker-compose exec event-service python scripts/seed.py

# Manual
cd backend/event-lifecycle-service
python scripts/seed.py

# This creates:
# - 5 sample events
# - 20 sessions
# - 100 users
# - Sample tickets, polls, Q&A
```

### Reset Database

```bash
# Using Docker
docker-compose down -v
docker-compose up -d
docker-compose exec event-service python manage.py migrate

# Manual
dropdb globalconnect
createdb globalconnect
cd backend/event-lifecycle-service
alembic upgrade head
```

### View Logs

```bash
# Docker - All services
docker-compose logs -f

# Docker - Specific service
docker-compose logs -f frontend
docker-compose logs -f event-service

# Manual - Check service terminals
```

### Run Tests

```bash
# Frontend tests
npm test

# Backend tests (Python)
cd backend/event-lifecycle-service
pytest

# Backend tests (Node)
cd backend/user-and-org-service
npm test

# E2E tests
npm run test:e2e
```

---

## Environment Variables

### Essential Frontend Variables (.env.local)

```env
# API Endpoints
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
NEXT_PUBLIC_SOCKET_URL=http://localhost:3002
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Stripe (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx

# Optional
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Essential Backend Variables (.env)

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/globalconnect

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT Secret
JWT_SECRET=your-super-secret-key-change-in-production

# API Keys
CLERK_API_KEY=sk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
OPENAI_API_KEY=sk-xxxxx

# Service URLs
USER_SERVICE_URL=http://localhost:8002
EVENT_SERVICE_URL=http://localhost:8001
REALTIME_SERVICE_URL=http://localhost:3002
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000  # Frontend
lsof -i :4000  # Apollo Gateway
lsof -i :8001  # Event Service

# Kill process
kill -9 [PID]

# Or change port in .env
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
pg_isready

# Start PostgreSQL
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
# Windows: Start PostgreSQL service

# Check connection
psql -U postgres -d globalconnect
```

### Redis Connection Failed

```bash
# Check Redis is running
redis-cli ping  # Should return "PONG"

# Start Redis
# macOS: brew services start redis
# Linux: sudo systemctl start redis
# Windows: redis-server
```

### Module Not Found

```bash
# Frontend
rm -rf node_modules package-lock.json
npm install

# Backend (Python)
cd backend/event-lifecycle-service
pip install -r requirements.txt

# Backend (Node)
cd backend/user-and-org-service
rm -rf node_modules package-lock.json
npm install
```

### GraphQL Errors

```bash
# Check Apollo Gateway is running
curl http://localhost:4000/graphql

# Check backend services are healthy
curl http://localhost:8001/health
curl http://localhost:8002/health

# View Gateway logs
docker-compose logs gateway
```

### WebSocket Not Connecting

```bash
# Check Real-Time service
curl http://localhost:3002/health

# Check CORS configuration in .env
# Ensure NEXT_PUBLIC_SOCKET_URL is correct

# Test WebSocket connection
wscat -c ws://localhost:3002
```

---

## Next Steps

### 🎓 Learn the Platform
1. Read the [Platform Overview](./01-PLATFORM-OVERVIEW.md)
2. Explore [Feature Documentation](./features/)
3. Review [Architecture Guide](./architecture/01-SYSTEM-ARCHITECTURE.md)

### 👨‍💻 Start Developing
1. Review [Development Setup](./development/01-DEV-SETUP.md)
2. Read [Code Structure](./development/02-CODE-STRUCTURE.md)
3. Check [Contributing Guidelines](./development/08-CONTRIBUTING.md)

### 🚀 Deploy to Production
1. Read [Deployment Guide](./operations/01-DEPLOYMENT.md)
2. Configure [Infrastructure](./operations/02-INFRASTRUCTURE.md)
3. Set up [Monitoring](./operations/05-MONITORING.md)

### 📖 Explore APIs
1. Browse [GraphQL API](./api/01-GRAPHQL-API.md)
2. Test [REST Endpoints](./api/02-REST-API.md)
3. Learn [WebSocket Events](./api/03-WEBSOCKET-EVENTS.md)

---

## Get Help

### Documentation
- 📚 [Full Documentation](./README.md)
- 💡 [FAQ](./FAQ.md)
- 🐛 [Troubleshooting Guide](./operations/10-TROUBLESHOOTING.md)

### Community
- 💬 [Discord Community](https://discord.gg/globalconnect)
- 📧 Email: support@globalconnect.com
- 🎫 [GitHub Issues](https://github.com/yourorg/globalconnect/issues)

### Resources
- 🎥 [Video Tutorials](https://training.globalconnect.com)
- 📝 [Blog Posts](https://blog.globalconnect.com)
- 🔧 [Sample Projects](https://github.com/globalconnect/examples)

---

## Congratulations! 🎉

You now have Event Dynamics running locally. Time to build amazing events!

**Pro Tip:** Join our Discord community to connect with other developers and get real-time help.

---

**Last Updated:** January 3, 2026
**Difficulty:** Beginner
**Time Required:** 10-15 minutes
