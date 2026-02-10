// src/lib/socket-event-queue.ts
//
// Lightweight queue for socket events created while offline.
// Unlike GraphQL mutations (replayed via Apollo client.mutate()),
// socket events are replayed via socket.emit() after reconnect + room join.
// Uses the existing syncMeta store in IndexedDB.

import { getItem, storeItem } from "./offline-storage";

export interface QueuedSocketEvent {
  id: string;
  event: string; // e.g. "chat.message.send", "qa.question.ask"
  payload: unknown;
  sessionId: string;
  idempotencyKey: string;
  optimisticId: string; // Matches the optimistic UI item
  createdAt: string;
}

interface SocketQueue {
  id: string; // syncMeta key: `socket_queue_{feature}_{sessionId}`
  events: QueuedSocketEvent[];
}

function queueKey(feature: string, sessionId: string): string {
  return `socket_queue_${feature}_${sessionId}`;
}

/**
 * Add a socket event to the offline queue.
 */
export async function queueSocketEvent(
  feature: string,
  sessionId: string,
  event: QueuedSocketEvent
): Promise<void> {
  const key = queueKey(feature, sessionId);
  const existing = await getItem<SocketQueue>("syncMeta", key);
  const events = existing?.events || [];
  events.push(event);
  await storeItem("syncMeta", { id: key, events });
}

/**
 * Get all pending socket events for a feature + session, ordered by creation time.
 */
export async function getPendingSocketEvents(
  feature: string,
  sessionId: string
): Promise<QueuedSocketEvent[]> {
  const key = queueKey(feature, sessionId);
  const queue = await getItem<SocketQueue>("syncMeta", key);
  if (!queue?.events?.length) return [];
  return [...queue.events].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

/**
 * Remove a single event from the queue (after successful emit or failure).
 */
export async function removeSocketEvent(
  feature: string,
  sessionId: string,
  eventId: string
): Promise<void> {
  const key = queueKey(feature, sessionId);
  const existing = await getItem<SocketQueue>("syncMeta", key);
  if (!existing?.events?.length) return;
  const filtered = existing.events.filter((e) => e.id !== eventId);
  await storeItem("syncMeta", { id: key, events: filtered });
}

/**
 * Clear the entire queue for a feature + session.
 */
export async function clearSocketQueue(
  feature: string,
  sessionId: string
): Promise<void> {
  const key = queueKey(feature, sessionId);
  await storeItem("syncMeta", { id: key, events: [] });
}
