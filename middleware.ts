// middleware.ts
// Server-side route protection middleware
// This runs BEFORE any page renders, providing true security
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/attendee',
  '/speakers',
  '/venues',
  '/team',
  '/settings',
  '/security',
  '/checkout',
];

// Routes that require organization membership (organizer routes)
const organizerRoutes = [
  '/dashboard',
  '/speakers',
  '/venues',
  '/team',
];

// Public routes that authenticated users should be redirected away from
const authRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie (preferred) or check for auth-storage in cookies
  // Note: In production, tokens should be in httpOnly cookies set by backend
  const token = request.cookies.get('token')?.value;

  // For now, we also check localStorage-synced cookie (set by client)
  // This is a bridge solution until backend implements httpOnly cookies
  const authStorage = request.cookies.get('auth-storage')?.value;
  let hasToken = !!token;
  let hasOrgId = false;

  // Parse auth-storage if present (Zustand persisted state)
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      hasToken = hasToken || !!parsed?.state?.token;
      hasOrgId = !!parsed?.state?.orgId;
    } catch {
      // Invalid JSON, ignore
    }
  }

  // Check if current path matches any protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  const isOrganizerRoute = organizerRoutes.some(route =>
    pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !hasToken) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth routes
  if (isAuthRoute && hasToken) {
    // Redirect to appropriate dashboard based on org membership
    const redirectUrl = hasOrgId ? '/dashboard' : '/attendee';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Redirect attendees (no orgId) away from organizer routes
  if (isOrganizerRoute && hasToken && !hasOrgId) {
    return NextResponse.redirect(new URL('/attendee', request.url));
  }

  // Add security headers to all responses
  const response = NextResponse.next();

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // XSS Protection (legacy browsers)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  return response;
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - API routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
