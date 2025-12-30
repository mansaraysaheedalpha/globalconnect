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
      if (storedAssignment && config.variants.includes(storedAssignment)) {
        const index = config.variants.indexOf(storedAssignment);
        setVariant(storedAssignment);
        setVariantIndex(index);
        return;
      }

      // Assign new variant
      const assignedVariant = selectVariant(
        user?.id || getSessionId(),
        config.testId,
        config.variants,
        config.weights
      );

      const index = config.variants.indexOf(assignedVariant);
      setVariant(assignedVariant);
      setVariantIndex(index);

      // Persist assignment
      const stored = safeStorage.setItem(storageKey, assignedVariant);
      if (!stored) {
        logger.warn("Failed to persist A/B test assignment to localStorage", {
          testId: config.testId,
          variant: assignedVariant,
        });
      }

      // Track assignment event
      trackABTestAssignment(config.testId, assignedVariant, index);
    };

    assignVariant();
  }, [config.testId, config.variants, config.weights, user?.id]);

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
 */
function getSessionId(): string {
  const storageKey = "ab_session_id";
  let sessionId = safeStorage.getItem(storageKey);

  if (!sessionId) {
    sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    safeStorage.setItem(storageKey, sessionId);
  }

  return sessionId;
}

/**
 * Track A/B test assignment
 * Sends assignment data to analytics backend
 */
function trackABTestAssignment(testId: string, variant: string, variantIndex: number) {
  const assignmentData = {
    testId,
    variant,
    variantIndex,
    timestamp: new Date().toISOString(),
  };

  // Log in development
  logger.info("A/B Test Assignment", assignmentData);

  // Send to analytics backend
  if (typeof window !== 'undefined') {
    fetch("/api/v1/analytics/ab-test/assignment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assignmentData),
    }).catch((error) => {
      logger.error("Failed to track A/B test assignment", error, assignmentData);
    });
  }
}

/**
 * Hook to track A/B test conversion events
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
    logger.info("A/B Test Conversion", conversionData);

    // Send to analytics backend
    if (typeof window !== 'undefined') {
      fetch("/api/v1/analytics/ab-test/conversion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(conversionData),
      }).catch((error) => {
        logger.error("Failed to track A/B test conversion", error, conversionData);
      });
    }
  }, []);
}
