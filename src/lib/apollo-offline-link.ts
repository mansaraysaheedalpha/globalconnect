// src/lib/apollo-offline-link.ts
/**
 * Offline-Aware Apollo Link
 *
 * Intercepts GraphQL operations when the client is offline:
 * - Queries: Serves from Apollo's InMemoryCache (which is persisted to IndexedDB)
 * - Mutations: Queues to IndexedDB for replay when connectivity returns
 *
 * This link should be placed BEFORE the httpLink in the Apollo link chain.
 */

import {
  ApolloLink,
  Observable,
  Operation,
  FetchResult,
  NextLink,
} from "@apollo/client";
import { v4 as uuidv4 } from "uuid";
import { print } from "graphql";
import { queueMutation } from "./offline-storage";

// Mutations that are safe to queue offline (non-destructive, idempotent-friendly)
const QUEUEABLE_MUTATIONS = new Set([
  // Session participation
  "JoinVirtualSession",
  "LeaveVirtualSession",
  // Attendee interactions
  "SendChatMessage",
  "SubmitQuestion",
  "VoteOnPoll",
  "SendReaction",
]);

export class OfflineLink extends ApolloLink {
  request(operation: Operation, forward: NextLink): Observable<FetchResult> | null {
    // If online, pass through normally
    if (navigator.onLine) {
      return forward(operation);
    }

    const definition = operation.query.definitions[0];
    if (!definition || definition.kind !== "OperationDefinition") {
      return forward(operation);
    }

    const isQuery = definition.operation === "query";
    const isMutation = definition.operation === "mutation";
    const operationName = operation.operationName || "Unknown";

    // QUERIES when offline: Let Apollo try to serve from cache.
    // The cache is persisted to IndexedDB, so it contains previously fetched data.
    // If the cache doesn't have the data, Apollo will return a network error,
    // which is handled gracefully by the error link.
    if (isQuery) {
      // Force cache-only fetch policy when offline
      operation.setContext({
        ...operation.getContext(),
        fetchPolicy: "cache-only",
      });

      // Return an observable that reads from cache
      return new Observable<FetchResult>((observer) => {
        // Let the forward chain handle it - the httpLink will fail,
        // but if we have cache data, Apollo Client will still return it
        // based on the errorPolicy: "all" setting
        const subscription = forward(operation).subscribe({
          next: (result) => observer.next(result),
          error: () => {
            // Network error when offline — return empty result
            // Apollo's cache will still be checked by the component
            observer.next({ data: null, errors: [] });
            observer.complete();
          },
          complete: () => observer.complete(),
        });

        return () => subscription.unsubscribe();
      });
    }

    // MUTATIONS when offline: Queue for later replay
    if (isMutation && QUEUEABLE_MUTATIONS.has(operationName)) {
      return new Observable<FetchResult>((observer) => {
        const mutationId = uuidv4();
        const idempotencyKey = `${operationName}_${uuidv4()}`;

        queueMutation({
          id: mutationId,
          operationName,
          query: print(operation.query),
          variables: JSON.stringify(operation.variables || {}),
          maxRetries: 3,
          createdAt: new Date().toISOString(),
          optimisticResponse: null,
          idempotencyKey,
        })
          .then(() => {
            // Return a synthetic success response so the UI can show optimistic feedback
            observer.next({
              data: {
                __offline_queued: true,
                __mutation_id: mutationId,
                __operation: operationName,
              },
            });
            observer.complete();
          })
          .catch((error) => {
            observer.error(error);
          });
      });
    }

    // Non-queueable mutations when offline: Return a clear error
    if (isMutation) {
      return new Observable<FetchResult>((observer) => {
        observer.next({
          data: null,
          errors: [
            {
              message: `You're offline. "${operationName}" will be available when you reconnect.`,
              extensions: { code: "OFFLINE" },
            },
          ] as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        });
        observer.complete();
      });
    }

    // Subscriptions or unknown — pass through (will fail naturally)
    return forward(operation);
  }
}
