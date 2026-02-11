// src/lib/network-connectivity.ts
/**
 * Non-React network connectivity detector with lie-fi protection.
 * Can be used in Apollo Links and other non-React contexts.
 *
 * "Lie-fi" = connected to a network (navigator.onLine === true) but no
 * actual internet access. Common on captive portals, flaky 2G, and
 * congested event-venue wifi.
 */

const MAX_CONSECUTIVE_FAILURES = 2;

interface ConnectivityState {
  isOnline: boolean;
  lastSuccessfulFetch: number;
  consecutiveFailures: number;
}

const state: ConnectivityState = {
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  lastSuccessfulFetch: Date.now(), // optimistic on cold start
  consecutiveFailures: 0,
};

// Listen to browser online/offline events
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    state.isOnline = true;
    state.consecutiveFailures = 0;
  });

  window.addEventListener("offline", () => {
    state.isOnline = false;
  });
}

/** Call after a successful network fetch. */
export function recordSuccessfulFetch(): void {
  state.lastSuccessfulFetch = Date.now();
  state.consecutiveFailures = 0;
}

/** Call after a failed network fetch. */
export function recordFailedFetch(): void {
  state.consecutiveFailures++;
}

/**
 * Returns `true` only when we're reasonably confident the device has
 * internet access.
 *
 * Returns `false` if:
 *  - `navigator.onLine` is false, OR
 *  - We've seen ≥ 2 consecutive fetch failures (lie-fi heuristic).
 */
export function isActuallyOnline(): boolean {
  if (!state.isOnline) return false;
  if (state.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) return false;
  return true;
}
