# Phase 1 & 2 Completion Roadmap - World-Class Production Standards

**Created**: December 31, 2025
**Status**: 🚧 **IN PROGRESS**
**Goal**: Complete Phase 1 (Core Functionality) and Phase 2 (Analytics) to production-ready, world-class standards

---

## Executive Summary

**Current State**:
- ✅ Phase 2 UI Complete - Analytics dashboard, A/B testing, reporting
- ✅ Phase 1 UI Complete - Offers, Ads, Waitlist management interfaces
- ✅ All Production Readiness Fixes Applied - Type safety, security, error handling
- ✅ Backend APIs Ready - FastAPI endpoints documented and implemented
- ✅ GraphQL Schema Defined - All queries and mutations specified

**Remaining Work**:
- ⚠️ Connect frontend to backend APIs (remove mock data)
- ⚠️ Integrate Stripe payment flow
- ⚠️ Connect real-time Socket.io for waitlist
- ⚠️ End-to-end testing and polish

**Timeline**: 3-4 days for full implementation and testing

---

## Phase 1.1: Connect Offers to Backend APIs ⏱️ 6-8 hours

### Current State Analysis

**Files to Update**:
1. `src/app/(platform)/dashboard/events/[eventId]/monetization/upsells.tsx` - Organizer management
2. `src/components/features/offers/offer-card.tsx` - Display component
3. `src/components/features/offers/offer-modal.tsx` - Detail modal
4. `src/components/features/offers/purchased-offers-list.tsx` - Purchase history
5. `src/hooks/use-offer-tracking.ts` - Analytics tracking

### Implementation Tasks

#### Task 1.1.1: Update Organizer Offers Management
**File**: `src/app/(platform)/dashboard/events/[eventId]/monetization/upsells.tsx`

**Current Issues**:
- Uses `GET_EVENT_MONETIZATION_QUERY` which is correct ✅
- `CREATE_OFFER_MUTATION` and `DELETE_OFFER_MUTATION` are defined ✅
- Need to add UPDATE functionality
- Need to add real-time inventory updates

**Changes Needed**:
```typescript
// Add UPDATE mutation usage
const [updateOffer, { loading: updating }] = useMutation(UPDATE_OFFER_MUTATION);

// Add optimistic updates for better UX
const handleCreateOffer = async (offerData) => {
  try {
    const result = await createOffer({
      variables: { offerIn: offerData },
      optimisticResponse: {
        createOffer: {
          __typename: "Offer",
          id: "temp-id",
          ...offerData,
        },
      },
      update: (cache, { data }) => {
        // Update cache to show new offer immediately
      },
    });

    if (result.data?.createOffer?.id) {
      toast.success("Offer created successfully!");
      setCreateDialogOpen(false);
    }
  } catch (error) {
    logger.error("Failed to create offer", error);
    toast.error("Failed to create offer. Please try again.");
  }
};

// Add real-time inventory monitoring
useEffect(() => {
  // Poll inventory status every 30 seconds for active offers
  const interval = setInterval(() => {
    if (!loading && data?.eventOffers) {
      refetch();
    }
  }, 30000);

  return () => clearInterval(interval);
}, [loading, data, refetch]);
```

**Acceptance Criteria**:
- ✅ Create offer calls backend and updates immediately
- ✅ Update offer works with optimistic UI
- ✅ Delete offer shows confirmation and updates list
- ✅ Inventory updates in real-time
- ✅ Error handling with user-friendly messages

---

#### Task 1.1.2: Connect Attendee Offer Views
**File**: `src/components/features/offers/offer-grid.tsx` (create if doesn't exist)

**Implementation**:
```typescript
"use client";

import { useQuery } from "@apollo/client";
import { GET_ACTIVE_OFFERS_QUERY } from "@/graphql/monetization.graphql";
import { OfferCard } from "./offer-card";
import { Skeleton } from "@/components/ui/skeleton";
import { logger } from "@/lib/logger";

interface OfferGridProps {
  eventId: string;
  sessionId?: string;
  placement: "CHECKOUT" | "POST_PURCHASE" | "IN_EVENT" | "EMAIL";
  className?: string;
}

export function OfferGrid({ eventId, sessionId, placement, className }: OfferGridProps) {
  const { data, loading, error, refetch } = useQuery(GET_ACTIVE_OFFERS_QUERY, {
    variables: { eventId, sessionId, placement },
    pollInterval: 60000, // Refresh every minute for inventory updates
    onError: (err) => {
      logger.error("Failed to load offers", err, { eventId, placement });
    },
  });

  if (loading) {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Unable to load offers. Please try again later.</p>
        <Button variant="outline" onClick={() => refetch()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const offers = data?.activeOffers || [];

  if (offers.length === 0) {
    return null; // Silently hide if no offers
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {offers.map((offer) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          onPurchaseSuccess={() => refetch()}
        />
      ))}
    </div>
  );
}
```

**Acceptance Criteria**:
- ✅ Shows offers based on placement (CHECKOUT, IN_EVENT, etc.)
- ✅ Filters by session if sessionId provided
- ✅ Auto-refreshes to show inventory updates
- ✅ Graceful loading and error states

---

#### Task 1.1.3: Implement Purchase History
**File**: `src/components/features/offers/purchased-offers-list.tsx`

**Current State**: File exists, needs backend connection

**Changes**:
```typescript
import { useQuery } from "@apollo/client";
import { GET_MY_PURCHASED_OFFERS_QUERY } from "@/graphql/monetization.graphql";

export function PurchasedOffersList({ eventId }: { eventId: string }) {
  const { data, loading, error } = useQuery(GET_MY_PURCHASED_OFFERS_QUERY, {
    variables: { eventId },
    fetchPolicy: "cache-and-network",
  });

  // Component implementation with digital content access
  // Show download URLs, access codes, tracking numbers
  // Display fulfillment status with progress indicators
}
```

**Acceptance Criteria**:
- ✅ Shows all user's purchased offers
- ✅ Displays fulfillment status (PENDING, FULFILLED, etc.)
- ✅ Provides download links for digital content
- ✅ Shows access codes and tracking numbers

---

## Phase 1.2: Integrate Stripe Payment Flow ⏱️ 8-10 hours

### Task 1.2.1: Create Stripe Checkout Hook
**File**: `src/hooks/use-offer-checkout.ts` (NEW)

**Implementation**:
```typescript
"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { PURCHASE_OFFER_MUTATION } from "@/graphql/monetization.graphql";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { useRouter } from "next/navigation";

interface UseOfferCheckoutOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useOfferCheckout(options?: UseOfferCheckoutOptions) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [purchaseOffer] = useMutation(PURCHASE_OFFER_MUTATION);

  const initiateCheckout = async (offerId: string, quantity: number = 1) => {
    setLoading(true);

    try {
      const result = await purchaseOffer({
        variables: { offerId, quantity },
      });

      const checkoutUrl = result.data?.purchaseOffer?.stripeCheckoutUrl;

      if (checkoutUrl) {
        // Track checkout initiation
        logger.info("Stripe checkout initiated", {
          offerId,
          quantity,
          checkoutSessionId: result.data.purchaseOffer.checkoutSessionId,
        });

        // Redirect to Stripe Checkout
        window.location.href = checkoutUrl;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      logger.error("Failed to initiate checkout", error, { offerId, quantity });
      toast.error("Unable to process checkout. Please try again.");
      options?.onError?.(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoading(false);
    }
  };

  return {
    initiateCheckout,
    loading,
  };
}
```

**Acceptance Criteria**:
- ✅ Creates Stripe Checkout Session
- ✅ Redirects to Stripe hosted checkout
- ✅ Tracks analytics events
- ✅ Handles errors gracefully

---

### Task 1.2.2: Add Stripe to OfferCard
**File**: `src/components/features/offers/offer-card.tsx`

**Updates**:
```typescript
import { useOfferCheckout } from "@/hooks/use-offer-checkout";
import { Loader2 } from "lucide-react";

export function OfferCard({ offer, onPurchaseSuccess }: OfferCardProps) {
  const { initiateCheckout, loading } = useOfferCheckout({
    onSuccess: onPurchaseSuccess,
  });

  const handlePurchase = () => {
    if (offer.inventory && offer.inventory.available <= 0) {
      toast.error("This offer is sold out");
      return;
    }

    initiateCheckout(offer.id);
  };

  const isAvailable = !offer.inventory || offer.inventory.available > 0;
  const isSoldOut = offer.inventory && offer.inventory.available === 0;

  return (
    <Card>
      {/* ... existing UI ... */}
      <CardFooter>
        <Button
          onClick={handlePurchase}
          disabled={loading || isSoldOut}
          className="w-full"
        >
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isSoldOut ? (
            "Sold Out"
          ) : (
            `Purchase for ${offer.currency} ${offer.price.toFixed(2)}`
          )}
        </Button>

        {offer.inventory && offer.inventory.available <= 5 && offer.inventory.available > 0 && (
          <p className="text-xs text-orange-600 mt-2">
            Only {offer.inventory.available} left!
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
```

**Acceptance Criteria**:
- ✅ Purchase button initiates Stripe checkout
- ✅ Loading state during checkout creation
- ✅ Sold out handling
- ✅ Low inventory warning

---

### Task 1.2.3: Create Checkout Success/Cancel Pages
**Files**:
- `src/app/(platform)/checkout/success/page.tsx` (NEW)
- `src/app/(platform)/checkout/cancel/page.tsx` (NEW)

**Success Page**:
```typescript
"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";
import Confetti from "react-confetti";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      logger.info("Checkout completed successfully", { sessionId });
      // Track conversion event
    }
  }, [sessionId]);

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Confetti recycle={false} numberOfPieces={500} />

      <div className="text-center space-y-6">
        <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto" />

        <h1 className="text-4xl font-bold">Purchase Successful!</h1>

        <p className="text-lg text-muted-foreground">
          Thank you for your purchase. Your order has been confirmed.
        </p>

        <div className="space-x-4">
          <Button onClick={() => router.push("/attendee/my-offers")}>
            View My Purchases
          </Button>
          <Button variant="outline" onClick={() => router.push("/events")}>
            Back to Events
          </Button>
        </div>
      </div>
    </div>
  );
}
```

**Acceptance Criteria**:
- ✅ Success page shows confirmation with confetti
- ✅ Cancel page allows retry
- ✅ Links to purchase history
- ✅ Tracks conversion events

---

## Phase 1.3: Connect Ads to Backend (Serving & Tracking) ⏱️ 4-6 hours

### Task 1.3.1: Update Ad Container for Real Serving
**File**: `src/components/features/ads/ad-container.tsx`

**Current State**: Already uses `GET_ADS_FOR_CONTEXT_QUERY` ✅

**Enhancements Needed**:
```typescript
// Add session token for anonymous tracking
const [sessionToken] = useState(() => {
  // Generate or retrieve from localStorage
  const stored = safeStorage.getItem("ad_session_token");
  if (stored) return stored;

  const newToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  safeStorage.setItem("ad_session_token", newToken);
  return newToken;
});

// Update query to include session token
const { data, loading, error } = useQuery(GET_ADS_FOR_CONTEXT_QUERY, {
  variables: {
    eventId,
    sessionId,
    placement,
    limit: limit * 3,
  },
  context: {
    headers: {
      "X-Session-Token": sessionToken,
    },
  },
  fetchPolicy: "cache-and-network",
});
```

**Acceptance Criteria**:
- ✅ Fetches ads from backend with proper placement
- ✅ Includes session token for frequency capping
- ✅ Respects rotation interval
- ✅ Handles empty ad list gracefully

---

### Task 1.3.2: Implement Click Tracking
**File**: `src/components/features/ads/banner-ad.tsx` & `video-ad.tsx`

**Add Click Handler**:
```typescript
const [trackClick] = useMutation(TRACK_AD_CLICK_MUTATION);

const handleClick = async (e: React.MouseEvent) => {
  e.preventDefault();

  try {
    const result = await trackClick({
      variables: {
        adId: ad.id,
        sessionContext: window.location.pathname,
      },
    });

    const redirectUrl = result.data?.trackAdClick?.redirectUrl || ad.clickUrl;

    // Open in new tab
    window.open(redirectUrl, "_blank", "noopener,noreferrer");

    logger.info("Ad click tracked", { adId: ad.id });
  } catch (error) {
    logger.error("Failed to track ad click", error, { adId: ad.id });
    // Still allow click even if tracking fails
    window.open(ad.clickUrl, "_blank", "noopener,noreferrer");
  }
};
```

**Acceptance Criteria**:
- ✅ Click tracking fires on ad click
- ✅ Opens ad in new tab
- ✅ Tracks context (current page)
- ✅ Graceful degradation if tracking fails

---

## Phase 1.4: Connect Waitlist to Socket.io Real-time ⏱️ 8-10 hours

### Task 1.4.1: Set Up Socket.io Client
**File**: `src/lib/socket.ts` (NEW)

**Implementation**:
```typescript
import { io, Socket } from "socket.io-client";
import { logger } from "./logger";

let socket: Socket | null = null;

export function initializeSocket(userId: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3002";

  socket = io(socketUrl, {
    auth: {
      userId,
    },
    transports: ["websocket", "polling"],
    reconnectionDelay: 1000,
    reconnection: true,
    reconnectionAttempts: 10,
  });

  socket.on("connect", () => {
    logger.info("Socket.io connected", { userId, socketId: socket?.id });
    socket?.emit("join", `user:${userId}`);
  });

  socket.on("disconnect", (reason) => {
    logger.warn("Socket.io disconnected", { reason });
  });

  socket.on("error", (error) => {
    logger.error("Socket.io error", error);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
```

**Acceptance Criteria**:
- ✅ Connects to Socket.io server
- ✅ Authenticates with user ID
- ✅ Joins user-specific room
- ✅ Auto-reconnects on disconnect

---

### Task 1.4.2: Create Waitlist Hook with Real-time
**File**: `src/hooks/use-session-waitlist.ts`

**Major Updates**:
```typescript
import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { initializeSocket, getSocket } from "@/lib/socket";
import { useAuth } from "@/hooks/use-auth";

export function useSessionWaitlist(sessionId: string) {
  const { user } = useAuth();
  const [position, setPosition] = useState<number | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [estimatedWait, setEstimatedWait] = useState<number | null>(null);
  const [offerData, setOfferData] = useState<WaitlistOffer | null>(null);

  // Initialize Socket.io
  useEffect(() => {
    if (!user?.id) return;

    const socket = initializeSocket(user.id);

    // Listen for position updates
    socket.on("WAITLIST_POSITION_UPDATE", (data: {
      session_id: string;
      position: number;
      total: number;
      estimated_wait_minutes: number;
    }) => {
      if (data.session_id === sessionId) {
        setPosition(data.position);
        setTotal(data.total);
        setEstimatedWait(data.estimated_wait_minutes);
        logger.info("Waitlist position updated", data);
      }
    });

    // Listen for spot offers
    socket.on("WAITLIST_OFFER", (data: {
      title: string;
      message: string;
      join_token: string;
      expires_at: string;
      session_id: string;
    }) => {
      if (data.session_id === sessionId) {
        setOfferData(data);
        // Show modal automatically
        logger.info("Waitlist offer received", data);
      }
    });

    // Listen for offer expiration
    socket.on("WAITLIST_OFFER_EXPIRED", (data: {
      message: string;
      session_id: string;
    }) => {
      if (data.session_id === sessionId) {
        setOfferData(null);
        toast.info(data.message);
      }
    });

    return () => {
      socket.off("WAITLIST_POSITION_UPDATE");
      socket.off("WAITLIST_OFFER");
      socket.off("WAITLIST_OFFER_EXPIRED");
    };
  }, [user?.id, sessionId]);

  // ... rest of implementation
}
```

**Acceptance Criteria**:
- ✅ Real-time position updates via Socket.io
- ✅ Receives and displays spot offers
- ✅ 5-minute countdown timer for offers
- ✅ Auto-refreshes position on changes

---

## Phase 2.1: Connect Analytics Dashboard to Backend ⏱️ 4-6 hours

### Task 2.1.1: Update Analytics Page with Real Data
**File**: `src/app/(platform)/dashboard/events/[eventId]/analytics/page.tsx`

**Current State**: Uses `GET_MONETIZATION_ANALYTICS_QUERY` ✅

**Enhancements**:
```typescript
const [dateRange, setDateRange] = useState({
  from: subDays(new Date(), 30),
  to: new Date(),
});

const { data, loading, error, refetch } = useQuery(
  GET_MONETIZATION_ANALYTICS_QUERY,
  {
    variables: {
      eventId,
      dateFrom: format(dateRange.from, "yyyy-MM-dd"),
      dateTo: format(dateRange.to, "yyyy-MM-dd"),
    },
    pollInterval: 300000, // Refresh every 5 minutes
    fetchPolicy: "cache-and-network",
  }
);

// Add manual refresh button
const handleRefresh = () => {
  toast.promise(refetch(), {
    loading: "Refreshing analytics...",
    success: "Analytics updated!",
    error: "Failed to refresh analytics",
  });
};
```

**Acceptance Criteria**:
- ✅ Fetches real analytics data from backend
- ✅ Date range filtering works
- ✅ Auto-refreshes every 5 minutes
- ✅ Manual refresh button
- ✅ Loading states for all sections

---

## Phase 2.2: Test & Polish A/B Testing Framework ⏱️ 3-4 hours

### Task 2.2.1: Verify A/B Test Assignment Logic
**File**: `src/hooks/use-ab-test.ts`

**Testing Checklist**:
- ✅ User assigned to consistent variant across sessions
- ✅ Variant distribution follows weight percentages
- ✅ Assignment persisted to localStorage (using safeStorage)
- ✅ Analytics tracking fires on assignment

**Edge Cases**:
- Private browsing mode (localStorage fails)
- Multiple tabs (consistent assignment)
- Variant removal (reassignment logic)

---

## Phase 2.3: Implement Analytics Event Tracking ⏱️ 6-8 hours

### Task 2.3.1: Create Universal Event Tracker
**File**: `src/lib/analytics-tracker.ts` (NEW)

**Implementation**:
```typescript
"use client";

import { useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { logger } from "./logger";

const TRACK_EVENTS_MUTATION = gql`
  mutation TrackEvents($events: [EventInput!]!) {
    trackEvents(events: $events) {
      status
      queued
    }
  }
`;

interface TrackingEvent {
  event_type: string;
  entity_type: "OFFER" | "AD" | "WAITLIST";
  entity_id: string;
  revenue_cents?: number;
  context?: Record<string, any>;
}

class AnalyticsTracker {
  private eventQueue: TrackingEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private mutationFn: any = null;

  initialize(mutationFn: any) {
    this.mutationFn = mutationFn;
    this.startFlushInterval();
  }

  track(event: TrackingEvent) {
    this.eventQueue.push({
      ...event,
      timestamp: new Date().toISOString(),
    });

    // Flush immediately if queue reaches 10 events
    if (this.eventQueue.length >= 10) {
      this.flush();
    }
  }

  private async flush() {
    if (this.eventQueue.length === 0 || !this.mutationFn) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await this.mutationFn({
        variables: { events: eventsToSend },
      });

      logger.info("Analytics events tracked", { count: eventsToSend.length });
    } catch (error) {
      logger.error("Failed to track analytics events", error);
      // Re-queue failed events
      this.eventQueue.unshift(...eventsToSend);
    }
  }

  private startFlushInterval() {
    // Flush every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000);
  }

  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush(); // Flush remaining events
  }
}

export const analyticsTracker = new AnalyticsTracker();

// Hook for components
export function useAnalyticsTracker() {
  const [trackEvents] = useMutation(TRACK_EVENTS_MUTATION);

  useEffect(() => {
    analyticsTracker.initialize(trackEvents);

    return () => {
      analyticsTracker.destroy();
    };
  }, [trackEvents]);

  return {
    trackOfferView: (offerId: string, context?: any) => {
      analyticsTracker.track({
        event_type: "OFFER_VIEW",
        entity_type: "OFFER",
        entity_id: offerId,
        context,
      });
    },
    trackOfferPurchase: (offerId: string, revenue: number, context?: any) => {
      analyticsTracker.track({
        event_type: "OFFER_PURCHASE",
        entity_type: "OFFER",
        entity_id: offerId,
        revenue_cents: Math.round(revenue * 100),
        context,
      });
    },
    // ... more tracking methods
  };
}
```

**Acceptance Criteria**:
- ✅ Tracks all monetization events
- ✅ Batches events (10 events or 30 seconds)
- ✅ Retries on failure
- ✅ Flushes on page unload

---

## Final Testing & Quality Assurance ⏱️ 8-10 hours

### Test Plan

#### E2E Test Scenarios:

1. **Offer Purchase Flow**:
   - ✅ View offers on event page
   - ✅ Click "Purchase" → Redirect to Stripe
   - ✅ Complete payment on Stripe
   - ✅ Redirect back to success page
   - ✅ See offer in purchase history
   - ✅ Access digital content

2. **Ad Display & Tracking**:
   - ✅ Ads display on event pages
   - ✅ Ads rotate after 30 seconds
   - ✅ Frequency cap prevents spam (max 3x)
   - ✅ Click tracking fires correctly
   - ✅ Analytics show impressions and clicks

3. **Waitlist Real-time**:
   - ✅ Join waitlist when session full
   - ✅ See real-time position updates
   - ✅ Receive offer notification (Socket.io)
   - ✅ Accept offer within 5 minutes
   - ✅ Join session successfully

4. **Analytics Dashboard**:
   - ✅ Revenue shows correct totals
   - ✅ Charts display data accurately
   - ✅ Date range filtering works
   - ✅ Export reports (CSV, PDF)
   - ✅ Scheduled reports create successfully

5. **A/B Testing**:
   - ✅ Variant assignment consistent
   - ✅ Results dashboard shows metrics
   - ✅ Winner declaration works

---

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Page Load Time | < 3s | ⏳ |
| API Response (offers) | < 500ms | ⏳ |
| API Response (ads) | < 200ms | ⏳ |
| Socket.io Latency | < 100ms | ⏳ |
| Analytics Dashboard | < 2s | ⏳ |
| Lighthouse Score | > 90 | ⏳ |

---

## Security Checklist

- [ ] All mutations require authentication
- [ ] Input validation on all forms
- [ ] XSS protection (already done ✅)
- [ ] CSRF protection via GraphQL
- [ ] Rate limiting on purchase attempts
- [ ] Stripe webhook verification
- [ ] Secure session tokens

---

## Mobile Responsiveness

- [ ] Offer cards work on mobile
- [ ] Checkout flow mobile-friendly
- [ ] Ads resize properly
- [ ] Analytics charts readable on mobile
- [ ] Waitlist modal mobile-optimized

---

## Browser Compatibility

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari
- [ ] Mobile Chrome

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Stripe keys (production)
- [ ] Socket.io URL configured
- [ ] Backend API URL set
- [ ] GraphQL endpoint verified
- [ ] Error monitoring (Sentry) active
- [ ] Analytics (if using GA/Mixpanel)

---

## Success Criteria

**Phase 1 Complete When**:
- ✅ Users can purchase offers via Stripe
- ✅ Ads display and track correctly
- ✅ Waitlist works with real-time updates
- ✅ All features work end-to-end

**Phase 2 Complete When**:
- ✅ Analytics show real data
- ✅ Reports export successfully
- ✅ A/B tests function correctly
- ✅ Performance targets met

---

## Timeline

| Phase | Task | Duration | Status |
|-------|------|----------|--------|
| 1.1 | Offers Backend Integration | 6-8h | 🟡 Pending |
| 1.2 | Stripe Payment Flow | 8-10h | 🟡 Pending |
| 1.3 | Ads Backend Integration | 4-6h | 🟡 Pending |
| 1.4 | Waitlist Socket.io | 8-10h | 🟡 Pending |
| 2.1 | Analytics Backend | 4-6h | 🟡 Pending |
| 2.2 | A/B Testing Polish | 3-4h | 🟡 Pending |
| 2.3 | Event Tracking | 6-8h | 🟡 Pending |
| Final | Testing & QA | 8-10h | 🟡 Pending |
| **Total** | | **47-62 hours** | |

**Estimated Completion**: 3-4 full work days

---

## Next Steps

1. ✅ Review and approve this roadmap
2. Start with Phase 1.1 (Offers Backend Integration)
3. Work sequentially through each phase
4. Test thoroughly after each phase
5. Deploy to staging environment
6. Final QA and production deployment

**Let's build a world-class monetization system! 🚀**