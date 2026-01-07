# Environment Variables Setup Guide

This guide explains how to obtain all the required environment variables for GlobalConnect.

---

## Table of Contents

1. [NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY](#1-stripe-publishable-key)
2. [NEXT_PUBLIC_SOCKET_URL & NEXT_PUBLIC_REALTIME_URL](#2-socket--realtime-urls)
3. [Backend Service URLs](#3-backend-service-urls)
4. [Summary Checklist](#4-summary-checklist)
5. [GitHub Secrets Setup](#5-github-secrets-setup) ⭐

---

## 1. Stripe Publishable Key

### What is it?
The Stripe publishable key is a client-safe API key that identifies your Stripe account when making requests from the frontend. It starts with `pk_test_` (test mode) or `pk_live_` (production mode).

### Steps to Get Your Stripe Key

#### Step 1: Create a Stripe Account
1. Go to [https://stripe.com](https://stripe.com)
2. Click **"Start now"** or **"Sign in"**
3. Complete the registration process

#### Step 2: Access the Dashboard
1. After logging in, you'll be in the Stripe Dashboard
2. Look at the top-right corner - you'll see a toggle for **"Test mode"**

#### Step 3: Get Your API Keys
1. In the Dashboard, click on **"Developers"** in the left sidebar
2. Click on **"API keys"**
3. You'll see two keys:
   - **Publishable key**: `pk_test_xxxxxxxxxxxx` (this is what you need)
   - **Secret key**: `sk_test_xxxxxxxxxxxx` (for backend only - DO NOT expose this)

#### Step 4: Copy the Publishable Key
1. Click the **"Reveal test key"** button next to the Publishable key
2. Copy the key that starts with `pk_test_`
3. Paste it as your `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` value

#### For Production (Live Mode)
1. Toggle OFF **"Test mode"** in the top-right corner
2. You'll need to complete Stripe's verification process
3. Once verified, go to **Developers > API keys**
4. Copy the live publishable key (starts with `pk_live_`)

### Example
```env
# Test mode
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123DEF456...

# Production mode (after verification)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51ABC123DEF456...
```

### Important Notes
- **Never expose your Secret Key** (`sk_...`) in frontend code
- Test mode keys only work with test card numbers
- Live mode requires completing Stripe's business verification

---

## 2. Socket / Realtime URLs

### What are these?
These are the URLs pointing to your Socket.io real-time server that handles:
- Live chat
- Real-time polls
- Q&A sessions
- Live notifications
- Dashboard updates
- Reactions

### How to Determine Your URLs

These URLs depend on **where you deploy your real-time backend service**.

#### If Using the Same Server for Everything
```env
# Your backend is at https://api.yourdomain.com
NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com
NEXT_PUBLIC_REALTIME_URL=https://api.yourdomain.com/events
```

#### If Using Separate Microservices
```env
# Real-time service deployed separately
NEXT_PUBLIC_SOCKET_URL=https://realtime.yourdomain.com
NEXT_PUBLIC_REALTIME_URL=https://realtime.yourdomain.com/events
```

#### Common Deployment Platforms

**Railway:**
```env
NEXT_PUBLIC_SOCKET_URL=https://your-realtime-service.up.railway.app
NEXT_PUBLIC_REALTIME_URL=https://your-realtime-service.up.railway.app/events
```

**Render:**
```env
NEXT_PUBLIC_SOCKET_URL=https://your-realtime-service.onrender.com
NEXT_PUBLIC_REALTIME_URL=https://your-realtime-service.onrender.com/events
```

**DigitalOcean App Platform:**
```env
NEXT_PUBLIC_SOCKET_URL=https://your-realtime-service-xxxxx.ondigitalocean.app
NEXT_PUBLIC_REALTIME_URL=https://your-realtime-service-xxxxx.ondigitalocean.app/events
```

**AWS (ECS/EC2 with Load Balancer):**
```env
NEXT_PUBLIC_SOCKET_URL=https://realtime.yourdomain.com
NEXT_PUBLIC_REALTIME_URL=https://realtime.yourdomain.com/events
```

**Fly.io:**
```env
NEXT_PUBLIC_SOCKET_URL=https://your-realtime-service.fly.dev
NEXT_PUBLIC_REALTIME_URL=https://your-realtime-service.fly.dev/events
```

### The Difference Between SOCKET_URL and REALTIME_URL

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_SOCKET_URL` | Base Socket.io server URL | `https://realtime.example.com` |
| `NEXT_PUBLIC_REALTIME_URL` | Socket.io with namespace | `https://realtime.example.com/events` |

The `/events` namespace is used in your codebase for event-specific real-time features.

---

## 3. Backend Service URLs

### NEXT_PUBLIC_API_URL (GraphQL)
Your main GraphQL API endpoint.

```env
# Example deployments
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/graphql
NEXT_PUBLIC_API_URL=https://your-api.up.railway.app/graphql
NEXT_PUBLIC_API_URL=https://your-api.onrender.com/graphql
```

### NEXT_PUBLIC_API_BASE_URL (REST API)
Your REST API base URL for non-GraphQL operations.

```env
# Usually the same server, different path
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_BASE_URL=https://your-api.up.railway.app
```

### NEXT_PUBLIC_EVENT_SERVICE_URL
Event service for image uploads (if separate microservice).

```env
# If same as REST API
NEXT_PUBLIC_EVENT_SERVICE_URL=https://api.yourdomain.com/api/v1

# If separate service
NEXT_PUBLIC_EVENT_SERVICE_URL=https://event-service.yourdomain.com/api/v1
```

### NEXT_PUBLIC_AGENT_SERVICE_URL
AI Engagement Conductor service URL.

```env
# Your AI agent service
NEXT_PUBLIC_AGENT_SERVICE_URL=https://agent.yourdomain.com
NEXT_PUBLIC_AGENT_SERVICE_URL=https://your-agent-service.up.railway.app
```

### NEXT_PUBLIC_APP_URL
Your frontend application URL (the Vercel deployment URL).

```env
# Vercel deployment
NEXT_PUBLIC_APP_URL=https://globalconnect.vercel.app

# Custom domain
NEXT_PUBLIC_APP_URL=https://www.yourdomain.com
```

---

## 4. Summary Checklist

### Before Deploying to Vercel

- [ ] **Stripe Account Created** at [stripe.com](https://stripe.com)
- [ ] **Stripe Publishable Key** copied from Dashboard > Developers > API Keys
- [ ] **Backend Services Deployed** to your chosen platform
- [ ] **All URLs Collected** from your deployment platform dashboards

### Environment Variables Checklist

| Variable | Source | Example |
|----------|--------|---------|
| `NEXT_PUBLIC_API_URL` | Your GraphQL backend URL | `https://api.example.com/graphql` |
| `NEXT_PUBLIC_API_BASE_URL` | Your REST backend URL | `https://api.example.com` |
| `NEXT_PUBLIC_EVENT_SERVICE_URL` | Your event service URL | `https://api.example.com/api/v1` |
| `NEXT_PUBLIC_REALTIME_URL` | Your Socket.io URL + namespace | `https://realtime.example.com/events` |
| `NEXT_PUBLIC_SOCKET_URL` | Your Socket.io base URL | `https://realtime.example.com` |
| `NEXT_PUBLIC_AGENT_SERVICE_URL` | Your AI agent service URL | `https://agent.example.com` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard | `pk_live_xxxxx` |
| `NEXT_PUBLIC_APP_URL` | Your Vercel/frontend URL | `https://yourapp.vercel.app` |
| `NEXT_PUBLIC_APP_ENV` | Always `production` | `production` |

---

## Troubleshooting

### Stripe Key Not Working
- Make sure you're using the **Publishable** key, not the Secret key
- Check if you're in Test mode vs Live mode
- Ensure the key starts with `pk_`

### WebSocket Connection Failing
- Verify your real-time server supports WebSocket connections
- Check CORS settings on your backend allow your frontend domain
- Ensure the URL uses `https://` not `http://` in production

### API Calls Failing
- Verify your backend is running and accessible
- Check CORS configuration allows requests from your Vercel domain
- Ensure URLs don't have trailing slashes

---

## 5. GitHub Secrets Setup

### Why GitHub Secrets?

GitHub Secrets are **required** for your CI/CD pipeline to work correctly. Here's why:

#### 1. **CI Pipeline Builds Your App**
When you push code to GitHub, the CI workflow (`.github/workflows/ci.yml`) automatically:
- Runs linting checks
- Runs TypeScript type checking
- **Builds the production application**

The build step needs your environment variables to compile correctly. Without them, the build will fail or produce a broken app.

#### 2. **Secrets Keep Your Config Secure**
- GitHub Secrets are **encrypted** and never exposed in logs
- They're only available to your repository's workflows
- Unlike committing `.env` files (which is dangerous), secrets are safe

#### 3. **Consistency Across Environments**
- Same variables used in CI as in Vercel
- Catches configuration errors before deployment
- Ensures your production build is tested with real values

---

### How to Add GitHub Secrets

#### Step 1: Navigate to Repository Settings
1. Go to your GitHub repository
2. Click **Settings** tab (top right)
3. In the left sidebar, click **Secrets and variables**
4. Click **Actions**

#### Step 2: Add Each Secret
1. Click **New repository secret**
2. Enter the **Name** (exactly as shown below)
3. Enter the **Value** (your actual URL or key)
4. Click **Add secret**

#### Step 3: Repeat for All Secrets

---

### Required GitHub Secrets

Add **all 8** of these secrets to your repository:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `NEXT_PUBLIC_API_URL` | GraphQL API endpoint | `https://api.yourdomain.com/graphql` |
| `NEXT_PUBLIC_API_BASE_URL` | REST API base URL | `https://api.yourdomain.com` |
| `NEXT_PUBLIC_EVENT_SERVICE_URL` | Event/image upload service | `https://api.yourdomain.com/api/v1` |
| `NEXT_PUBLIC_REALTIME_URL` | Socket.io with namespace | `https://realtime.yourdomain.com/events` |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.io base URL | `https://realtime.yourdomain.com` |
| `NEXT_PUBLIC_AGENT_SERVICE_URL` | AI engagement service | `https://agent.yourdomain.com` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_live_xxxxxxxxxxxxx` |
| `NEXT_PUBLIC_APP_URL` | Your frontend URL | `https://yourapp.vercel.app` |

> **Note:** `NEXT_PUBLIC_APP_ENV` is automatically set to `production` in the workflow, so you don't need to add it as a secret.

---

### Visual Guide

```
GitHub Repository
    │
    ├── Settings
    │       │
    │       └── Secrets and variables
    │               │
    │               └── Actions
    │                       │
    │                       ├── NEXT_PUBLIC_API_URL
    │                       ├── NEXT_PUBLIC_API_BASE_URL
    │                       ├── NEXT_PUBLIC_EVENT_SERVICE_URL
    │                       ├── NEXT_PUBLIC_REALTIME_URL
    │                       ├── NEXT_PUBLIC_SOCKET_URL
    │                       ├── NEXT_PUBLIC_AGENT_SERVICE_URL
    │                       ├── NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    │                       └── NEXT_PUBLIC_APP_URL
```

---

### Verifying Secrets Are Working

After adding secrets, push a commit to trigger the CI workflow:

```bash
git add .
git commit -m "test: trigger CI workflow"
git push
```

Then check:
1. Go to **Actions** tab in your repository
2. Click on the latest workflow run
3. Check that the **Build** job passes

If the build fails with "missing environment variable" errors, double-check:
- Secret names are spelled exactly right (case-sensitive)
- No extra spaces in values
- All 8 secrets are added

---

### GitHub Secrets vs Vercel Environment Variables

You need to add variables in **both places**:

| Platform | Purpose | When Used |
|----------|---------|-----------|
| **GitHub Secrets** | CI/CD pipeline | On every push/PR for testing builds |
| **Vercel Environment Variables** | Production deployment | When Vercel builds and deploys your app |

They should have the **same values** to ensure consistency.

---

### Security Best Practices

1. **Never commit `.env` files** with real values to Git
2. **Use different keys for test vs production** (e.g., `pk_test_` vs `pk_live_` for Stripe)
3. **Rotate secrets periodically** if they might be compromised
4. **Limit repository access** to trusted team members only
5. **Use environment-specific secrets** if you have staging environments

---

## Need Help?

1. **Stripe Documentation**: [https://stripe.com/docs](https://stripe.com/docs)
2. **Socket.io Documentation**: [https://socket.io/docs](https://socket.io/docs)
3. **Vercel Environment Variables**: [https://vercel.com/docs/environment-variables](https://vercel.com/docs/environment-variables)
4. **GitHub Encrypted Secrets**: [https://docs.github.com/en/actions/security-guides/encrypted-secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
