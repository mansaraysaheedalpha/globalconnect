# Backend Security Requirements for Production

This document outlines the backend changes required for a fully secure production deployment of Event Dynamics.

## 1. HttpOnly Cookie Authentication (Critical)

### Current State
- JWT tokens are stored in `localStorage` on the frontend
- This is vulnerable to XSS attacks

### Required Backend Changes

#### 1.1 Login Endpoint
```typescript
// Instead of returning token in response body:
// res.json({ token, user })

// Set token as httpOnly cookie:
res.cookie('access_token', token, {
  httpOnly: true,        // JavaScript cannot access
  secure: true,          // HTTPS only
  sameSite: 'lax',       // CSRF protection
  maxAge: 15 * 60 * 1000, // 15 minutes
  path: '/',
});

res.cookie('refresh_token', refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/auth/refresh', // Only sent to refresh endpoint
});

res.json({ user }); // Token NOT in response body
```

#### 1.2 Token Refresh Endpoint
```typescript
// POST /api/auth/refresh
app.post('/api/auth/refresh', (req, res) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token' });
  }

  // Verify and issue new access token
  const newAccessToken = issueAccessToken(refreshToken);

  res.cookie('access_token', newAccessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
    path: '/',
  });

  res.json({ success: true });
});
```

#### 1.3 Logout Endpoint
```typescript
// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  // Clear cookies
  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/api/auth/refresh' });

  // Optionally: invalidate refresh token in database

  res.json({ success: true });
});
```

#### 1.4 GraphQL Middleware
```typescript
// Extract token from cookie instead of Authorization header
const getTokenFromRequest = (req) => {
  // First try httpOnly cookie
  if (req.cookies?.access_token) {
    return req.cookies.access_token;
  }

  // Fallback to Authorization header (for mobile apps, etc.)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
};
```

---

## 2. CSRF Protection (High Priority)

### Required Backend Changes

#### 2.1 CSRF Token Generation
```typescript
import crypto from 'crypto';

// Generate CSRF token on login
const csrfToken = crypto.randomBytes(32).toString('hex');

// Store in session or return with login response
res.cookie('csrf_token', csrfToken, {
  httpOnly: false, // Needs to be readable by JavaScript
  secure: true,
  sameSite: 'strict',
});
```

#### 2.2 CSRF Validation Middleware
```typescript
const validateCsrf = (req, res, next) => {
  // Skip for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies.csrf_token;
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ error: 'CSRF validation failed' });
  }

  next();
};

// Apply to all GraphQL mutations
app.use('/graphql', validateCsrf);
```

---

## 3. Rate Limiting (High Priority)

### Required Implementation

```typescript
import rateLimit from 'express-rate-limit';

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { error: 'Too many requests, please try again later' },
});

// Strict limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  message: { error: 'Too many login attempts, please try again later' },
});

// GraphQL mutation rate limit
const mutationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 mutations per minute
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/graphql', mutationLimiter);
```

---

## 4. Security Headers (Already Implemented in Frontend)

The frontend now sets these headers, but they can also be set at the backend/proxy level:

```typescript
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // HSTS - enable in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  next();
});
```

---

## 5. CORS Configuration

```typescript
const corsOptions = {
  origin: [
    'https://your-production-domain.com',
    process.env.NODE_ENV === 'development' && 'http://localhost:3000',
  ].filter(Boolean),
  credentials: true, // Required for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
};

app.use(cors(corsOptions));
```

---

## 6. Input Validation & Sanitization

```typescript
import { z } from 'zod';
import xss from 'xss';

// GraphQL input validation
const loginInputSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

// Sanitize user input
const sanitizeInput = (input: string): string => {
  return xss(input.trim());
};

// Apply in resolvers
const resolvers = {
  Mutation: {
    login: async (_, { input }) => {
      const validated = loginInputSchema.parse(input);
      const sanitized = {
        email: sanitizeInput(validated.email),
        password: validated.password, // Don't sanitize passwords
      };
      // ... rest of login logic
    },
  },
};
```

---

## 7. Error Handling

```typescript
// Never expose internal errors to clients
const errorHandler = (err, req, res, next) => {
  console.error('Internal error:', err);

  // Log full error for debugging
  logger.error({
    message: err.message,
    stack: err.stack,
    userId: req.user?.id,
    path: req.path,
  });

  // Return generic error to client
  res.status(500).json({
    error: 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
  });
};

// GraphQL error formatting
const formatError = (error) => {
  // Log full error
  console.error('GraphQL error:', error);

  // Return sanitized error
  return {
    message: error.message.includes('INTERNAL')
      ? 'An unexpected error occurred'
      : error.message,
    extensions: {
      code: error.extensions?.code || 'UNKNOWN_ERROR',
    },
  };
};
```

---

## 8. Database Security

```typescript
// Always use parameterized queries (if using raw SQL)
const user = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email] // Never concatenate user input
);

// For ORMs like Prisma, use their built-in escaping
const user = await prisma.user.findUnique({
  where: { email }, // Prisma handles escaping
});
```

---

## 9. WebSocket Security

```typescript
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const decoded = verifyToken(token);
    socket.userId = decoded.userId;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

// Rate limit socket events
const socketRateLimit = new Map();

socket.on('message', (data) => {
  const key = socket.userId;
  const now = Date.now();
  const windowMs = 1000; // 1 second
  const maxRequests = 10;

  if (!socketRateLimit.has(key)) {
    socketRateLimit.set(key, []);
  }

  const requests = socketRateLimit.get(key).filter(t => now - t < windowMs);

  if (requests.length >= maxRequests) {
    return socket.emit('error', { message: 'Rate limit exceeded' });
  }

  requests.push(now);
  socketRateLimit.set(key, requests);

  // Process message...
});
```

---

## 10. Environment Variables

Required environment variables for production:

```env
# Required
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
JWT_SECRET=<64-character-random-string>
JWT_REFRESH_SECRET=<64-character-random-string>

# Security
CORS_ORIGINS=https://your-domain.com
COOKIE_DOMAIN=your-domain.com
SESSION_SECRET=<64-character-random-string>

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Stripe (if using)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
```

---

## Implementation Priority

1. **Critical (Before Production)**
   - [ ] HttpOnly cookie authentication
   - [ ] CSRF protection
   - [ ] Rate limiting on auth endpoints

2. **High (Before Public Launch)**
   - [ ] General rate limiting
   - [ ] Input validation
   - [ ] Error sanitization
   - [ ] CORS configuration

3. **Medium (Ongoing)**
   - [ ] WebSocket rate limiting
   - [ ] Audit logging
   - [ ] Security monitoring

---

## Testing Checklist

- [ ] Verify cookies are httpOnly and Secure
- [ ] Test CSRF protection blocks cross-site requests
- [ ] Verify rate limiting triggers correctly
- [ ] Test authentication flow end-to-end
- [ ] Verify tokens cannot be accessed via JavaScript
- [ ] Test token refresh works correctly
- [ ] Verify logout clears all tokens
