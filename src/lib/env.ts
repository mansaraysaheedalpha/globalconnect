// src/lib/env.ts
/**
 * Environment Variable Validation
 *
 * This module validates all required environment variables at build/runtime.
 * It provides type-safe access to environment variables and fails fast
 * if required variables are missing.
 */

import { z } from 'zod';

/**
 * Schema for client-side environment variables (NEXT_PUBLIC_*)
 * These are exposed to the browser
 */
const clientEnvSchema = z.object({
  // API Configuration
  NEXT_PUBLIC_API_URL: z
    .string()
    .url('NEXT_PUBLIC_API_URL must be a valid URL')
    .default('http://localhost:4000/graphql'),

  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .url('NEXT_PUBLIC_API_BASE_URL must be a valid URL')
    .default('http://localhost:8000'),

  NEXT_PUBLIC_EVENT_SERVICE_URL: z
    .string()
    .url('NEXT_PUBLIC_EVENT_SERVICE_URL must be a valid URL')
    .optional(),

  // Real-time Configuration
  NEXT_PUBLIC_REALTIME_URL: z
    .string()
    .url('NEXT_PUBLIC_REALTIME_URL must be a valid URL')
    .default('http://localhost:3002/events'),

  NEXT_PUBLIC_SOCKET_URL: z
    .string()
    .url('NEXT_PUBLIC_SOCKET_URL must be a valid URL')
    .optional(),

  // AI Agent Configuration
  NEXT_PUBLIC_AGENT_SERVICE_URL: z
    .string()
    .url('NEXT_PUBLIC_AGENT_SERVICE_URL must be a valid URL')
    .optional(),

  // Stripe Configuration
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
    .string()
    .refine(
      (val) => val.startsWith('pk_test_') || val.startsWith('pk_live_'),
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with pk_test_ or pk_live_'
    )
    .optional(),

  // Gateway API URL (for REST calls through Apollo Gateway)
  NEXT_PUBLIC_GATEWAY_API_URL: z
    .string()
    .url('NEXT_PUBLIC_GATEWAY_API_URL must be a valid URL')
    .optional(),

  // App Configuration
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url('NEXT_PUBLIC_APP_URL must be a valid URL')
    .optional(),

  NEXT_PUBLIC_APP_ENV: z
    .enum(['development', 'staging', 'production'])
    .default('development'),
});

/**
 * Schema for server-side environment variables
 * These are NOT exposed to the browser
 */
const serverEnvSchema = z.object({
  // Node environment
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
});

/**
 * Parse and validate client environment variables
 */
function getClientEnv() {
  // Only run validation on client or during build
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    // During SSR in production, we trust the env is valid
    return process.env as unknown as z.infer<typeof clientEnvSchema>;
  }

  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_EVENT_SERVICE_URL: process.env.NEXT_PUBLIC_EVENT_SERVICE_URL,
    NEXT_PUBLIC_REALTIME_URL: process.env.NEXT_PUBLIC_REALTIME_URL,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
    NEXT_PUBLIC_AGENT_SERVICE_URL: process.env.NEXT_PUBLIC_AGENT_SERVICE_URL,
    NEXT_PUBLIC_GATEWAY_API_URL: process.env.NEXT_PUBLIC_GATEWAY_API_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  });

  if (!parsed.success) {
    console.error(
      '❌ Invalid environment variables:',
      parsed.error.flatten().fieldErrors
    );

    // In development, throw to alert developers
    if (process.env.NODE_ENV === 'development') {
      throw new Error(
        `Invalid environment variables: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`
      );
    }
  }

  return parsed.data!;
}

/**
 * Parse and validate server environment variables
 */
function getServerEnv() {
  // Only validate on server
  if (typeof window !== 'undefined') {
    throw new Error('Server environment variables accessed on client');
  }

  const parsed = serverEnvSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!parsed.success) {
    console.error(
      '❌ Invalid server environment variables:',
      parsed.error.flatten().fieldErrors
    );

    throw new Error(
      `Invalid server environment variables: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`
    );
  }

  return parsed.data;
}

/**
 * Client-safe environment variables
 * Use this throughout the app for type-safe env access
 */
export const clientEnv = getClientEnv();

/**
 * Server-only environment variables
 * Only use this in server components, API routes, or middleware
 */
export const serverEnv = typeof window === 'undefined' ? getServerEnv() : null;

/**
 * Type exports for use in other files
 */
export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Helper to check if we're in production
 */
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Helper to check if we're in development
 */
export const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Helper to get the API URL with fallback
 */
export function getApiUrl(): string {
  return clientEnv.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';
}

/**
 * Helper to get the realtime URL with fallback
 */
export function getRealtimeUrl(): string {
  return clientEnv.NEXT_PUBLIC_REALTIME_URL || 'http://localhost:3002/events';
}

/**
 * Helper to get the socket URL with fallback
 */
export function getSocketUrl(): string {
  return clientEnv.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002';
}

/**
 * Helper to get the agent service URL with fallback
 */
export function getAgentServiceUrl(): string {
  return clientEnv.NEXT_PUBLIC_AGENT_SERVICE_URL || 'http://localhost:8003';
}

/**
 * Helper to get the gateway API URL (for REST calls through Apollo Gateway)
 * Falls back to event service URL or localhost
 */
export function getGatewayApiUrl(): string {
  return (
    clientEnv.NEXT_PUBLIC_GATEWAY_API_URL ||
    clientEnv.NEXT_PUBLIC_EVENT_SERVICE_URL ||
    'http://localhost:8000/api/v1'
  );
}
