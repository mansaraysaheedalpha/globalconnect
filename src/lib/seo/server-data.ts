import { cache } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/graphql';

// GraphQL query for event details
const GET_EVENT_QUERY = `
  query GetEvent($eventId: ID!) {
    event(id: $eventId) {
      id
      name
      description
      bannerUrl
      startDate
      endDate
      updatedAt
      organizer {
        id
        name
        email
      }
    }
  }
`;

// GraphQL query for published events
const GET_PUBLISHED_EVENTS_QUERY = `
  query GetPublishedEvents {
    publicEvents(limit: 1000, offset: 0) {
      events {
        id
        name
        description
        bannerUrl
        startDate
        endDate
        updatedAt
      }
    }
  }
`;

export interface Event {
  id: string;
  name: string;
  description: string | null;
  bannerUrl: string | null;
  startDate?: string;
  endDate?: string;
  startTime?: string; // Kept for backwards compatibility
  endTime?: string;   // Kept for backwards compatibility
  updatedAt: string;
  organizer: {
    id: string;
    name: string | null;
    email: string;
  };
  tickets?: any[];
}

interface PublicEvent {
  id: string;
  name: string;
  description: string | null;
  bannerUrl: string | null;
  startDate: string;
  endDate: string;
  updatedAt: string;
}

/**
 * Fetch event by ID for SEO (cached for multiple metadata calls)
 */
export const getEventForSEO = cache(async (eventId: string): Promise<Event | null> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: GET_EVENT_QUERY,
        variables: { eventId },
      }),
      next: {
        revalidate: 60, // Revalidate every 60 seconds
      },
    });

    const { data, errors } = await response.json();

    if (errors || !data?.event) {
      console.error('Error fetching event for SEO:', errors);
      return null;
    }

    // Transform to match expected format
    const event = data.event;
    return {
      ...event,
      tickets: [], // Add empty tickets array for now
    };
  } catch (error) {
    console.error('Error fetching event for SEO:', error);
    return null;
  }
});

/**
 * Fetch published events for SEO (used in sitemap and event list)
 */
export const getPublishedEventsForSEO = cache(async (): Promise<PublicEvent[]> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: GET_PUBLISHED_EVENTS_QUERY,
      }),
      next: {
        revalidate: 300, // Revalidate every 5 minutes
      },
    });

    const { data, errors } = await response.json();

    if (errors || !data?.publicEvents?.events) {
      console.error('Error fetching published events for SEO:', errors);
      return [];
    }

    return data.publicEvents.events;
  } catch (error) {
    console.error('Error fetching published events for SEO:', error);
    return [];
  }
});

/**
 * Fetch event with minimal data for metadata generation
 */
export const getEventMetadata = cache(async (eventId: string) => {
  // Reuse the same query, just extract minimal fields needed
  return getEventForSEO(eventId);
});

/**
 * Check if event exists (for 404 handling)
 */
export const eventExists = cache(async (eventId: string): Promise<boolean> => {
  const event = await getEventForSEO(eventId);
  return event !== null;
});
