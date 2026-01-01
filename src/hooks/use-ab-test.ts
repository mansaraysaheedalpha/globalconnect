// src/hooks/use-ab-test.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import { safeStorage } from "@/lib/safe-storage";
import { logger } from "@/lib/logger";

interface ABTestConfig {
  testId: string;
  variants: string[];
  weights?: number[]; // Optional weights for each variant (default: equal distribution)
}

interface ABTestResult {
  variant: string;
  variantIndex: number;
  isControlGroup: boolean; // First variant is always control
}

/**
 * A/B Testing Hook
 *
 * Assigns users to test variants consistently and tracks their assignment.
 *
 * Features:
 * - Consistent variant assignment (same user always gets same variant)
 * - Weighted distribution support
 * - Local storage persistence
 * - Analytics event tracking
 *
 * @example
 * const { variant, isControlGroup } = useABTest({
 *   testId: "offer-price-test",
 *   variants: ["control", "discount-20", "discount-30"],
 *   weights: [0.4, 0.3, 0.3] // 40% control, 30% each for variants
 * });
 */
export function useABTest(config: ABTestConfig): ABTestResult {
  const { user } = useAuthStore();
  const [variant, setVariant] = useState<string>(config.variants[0]);
  const [variantIndex, setVariantIndex] = useState<number>(0);

  // Assign variant based on user ID or session
  useEffect(() => {
    const assignVariant = () => {
      const storageKey = `ab_test_${config.testId}`;

      // Check if user already has an assignment
      const storedAssignment = safeStorage.getItem(storageKey);

      // EDGE CASE: Variant removal - Check if stored variant still exists in config
      if (storedAssignment && config.variants.includes(storedAssignment)) {
        const index = config.variants.indexOf(storedAssignment);
        setVariant(storedAssignment);
        setVariantIndex(index);
        logger.info("A/B Test: Using existing assignment", {
          testId: config.testId,
          variant: storedAssignment,
          source: "localStorage",
        });
        return;
      }

      // EDGE CASE: Variant was removed or first assignment
      if (storedAssignment && !config.variants.includes(storedAssignment)) {
        logger.info("A/B Test: Stored variant no longer exists, reassigning", {
          testId: config.testId,
          oldVariant: storedAssignment,
          availableVariants: config.variants,
        });
      }

      // Get consistent identifier (user ID or session ID)
      const identifier = user?.id || getSessionId();

      // Assign new variant using deterministic hash
      const assignedVariant = selectVariant(
        identifier,
        config.testId,
        config.variants,
        config.weights
      );

      const index = config.variants.indexOf(assignedVariant);
      setVariant(assignedVariant);
      setVariantIndex(index);

      // EDGE CASE: Private browsing mode - Persist assignment (may fail in private mode)
      const stored = safeStorage.setItem(storageKey, assignedVariant);
      if (!stored) {
        logger.warn("A/B Test: Failed to persist assignment (private browsing?)", {
          testId: config.testId,
          variant: assignedVariant,
          identifier,
        });
      } else {
        logger.info("A/B Test: New assignment persisted", {
          testId: config.testId,
          variant: assignedVariant,
          identifier,
        });
      }

      // Track assignment event
      trackABTestAssignment(config.testId, assignedVariant, index, identifier);
    };

    assignVariant();
    // NOTE: Deliberately excluding config.variants and config.weights from deps
    // to avoid re-assignment when parent components re-render with new array instances
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.testId, user?.id]);

  return {
    variant,
    variantIndex,
    isControlGroup: variantIndex === 0,
  };
}

/**
 * Select variant using deterministic hashing for consistent assignment
 */
function selectVariant(
  userId: string,
  testId: string,
  variants: string[],
  weights?: number[]
): string {
  // Create deterministic hash from user ID + test ID
  const hash = hashString(userId + testId);

  // Normalize weights or use equal distribution
  const normalizedWeights = weights && weights.length === variants.length
    ? weights
    : variants.map(() => 1 / variants.length);

  // Calculate cumulative weights
  let cumulative = 0;
  const cumulativeWeights = normalizedWeights.map((weight) => {
    cumulative += weight;
    return cumulative;
  });

  // Select variant based on hash
  const randomValue = (hash % 1000) / 1000; // Convert to 0-1 range
  const variantIndex = cumulativeWeights.findIndex((cw) => randomValue < cw);

  return variants[variantIndex >= 0 ? variantIndex : 0];
}

/**
 * Simple string hashing function (DJB2 algorithm)
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

/**
 * Get or create anonymous session ID
 * Handles private browsing mode by falling back to in-memory storage
 */
let inMemorySessionId: string | null = null;

export function getSessionId(): string {
  const storageKey = "ab_session_id";
  let sessionId = safeStorage.getItem(storageKey);

  if (!sessionId) {
    // Try to use in-memory session ID first (for private browsing)
    if (inMemorySessionId) {
      return inMemorySessionId;
    }

    // Generate new session ID
    sessionId = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    // Try to persist to localStorage
    const stored = safeStorage.setItem(storageKey, sessionId);

    // EDGE CASE: Private browsing mode - Store in memory as fallback
    if (!stored) {
      inMemorySessionId = sessionId;
      logger.info("A/B Test: Using in-memory session ID (private browsing mode)", {
        sessionId,
      });
    }
  }

  return sessionId;
}

/**
 * Track A/B test assignment
 * Sends assignment data to analytics backend
 *
 * NOTE: This now uses the A/B Test Tracker for backend integration.
 * Event tracking is handled by lib/ab-test-tracker.ts
 */
function trackABTestAssignment(
  testId: string,
  variant: string,
  variantIndex: number,
  identifier: string
) {
  const assignmentData = {
    testId,
    variant,
    variantIndex,
    userId: identifier,
    timestamp: new Date().toISOString(),
  };

  // Log in development
  logger.info("A/B Test Assignment", assignmentData);

  // NOTE: Actual event tracking should be done in component using useABTestTracker()
  // This function now only logs the assignment. Components should track "variant_view"
  // events using the tracker when they render the variant.
}

/**
 * Hook to track A/B test conversion events
 *
 * @deprecated Use useABTestTracker() from lib/ab-test-tracker.ts instead
 *
 * This hook is kept for backward compatibility but now just logs the conversion.
 * For proper backend tracking, use the new tracker:
 *
 * @example
 * import { useABTestTracker } from '@/lib/ab-test-tracker';
 *
 * const { trackConversion } = useABTestTracker();
 * trackConversion(testId, eventId, sessionToken, variantId, goalValue, userId);
 */
export function useABTestConversion() {
  return useCallback((testId: string, variant: string, conversionValue?: number) => {
    const conversionData = {
      testId,
      variant,
      conversionValue,
      timestamp: new Date().toISOString(),
    };

    // Log in development
    logger.info("A/B Test Conversion (DEPRECATED - use useABTestTracker)", conversionData);
    logger.warn("useABTestConversion is deprecated. Use useABTestTracker() for backend integration.");
  }, []);
}
