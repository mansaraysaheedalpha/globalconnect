import React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://eventdynamics.io';
const SITE_NAME = 'Event Dynamics';

// Type definitions for event data
export interface EventForSchema {
  id: string;
  name: string;
  description: string | null;
  bannerUrl: string | null;
  startDate?: string | Date;
  endDate?: string | Date;
  startTime?: string | Date; // Kept for backwards compatibility
  endTime?: string | Date;   // Kept for backwards compatibility
  organizer: {
    id?: string;
    name: string | null;
    email: string;
  };
  tickets?: TicketForSchema[];
}

export interface TicketForSchema {
  id: string;
  name: string;
  price: number;
  quantity?: number | null;
}

/**
 * Organization schema for Event Dynamics
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'The ultimate event management platform for in-person, virtual, and hybrid conferences, expos, and networking.',
    sameAs: [
      'https://twitter.com/eventdynamics',
      'https://linkedin.com/company/eventdynamics',
      'https://facebook.com/eventdynamics',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@eventdynamics.com',
    },
  };
}

/**
 * WebSite schema with search action
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/events?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * WebPage schema for general pages
 */
export function generateWebPageSchema(config: {
  title: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: config.title,
    description: config.description,
    url: config.url,
    ...(config.datePublished && { datePublished: config.datePublished }),
    ...(config.dateModified && { dateModified: config.dateModified }),
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/**
 * BreadcrumbList schema for navigation
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Event schema for individual events
 */
export function generateEventSchema(event: EventForSchema) {
  const eventUrl = `${SITE_URL}/events/${event.id}`;

  // Determine event status
  let eventStatus = 'https://schema.org/EventScheduled';
  const now = new Date();
  // Support both startDate/endDate (new) and startTime/endTime (legacy) field names
  const startDateRaw = event.startDate || event.startTime;
  const endDateRaw = event.endDate || event.endTime;
  const startDate = startDateRaw ? (typeof startDateRaw === 'string' ? new Date(startDateRaw) : startDateRaw) : null;
  const endDate = endDateRaw ? (typeof endDateRaw === 'string' ? new Date(endDateRaw) : endDateRaw) : null;

  if (endDate && endDate < now) {
    eventStatus = 'https://schema.org/EventCompleted';
  } else if (startDate && startDate < now && (!endDate || endDate > now)) {
    eventStatus = 'https://schema.org/EventMovedOnline'; // Ongoing
  }

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description || 'Join us for this virtual event',
    url: eventUrl,
    eventStatus,
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    location: {
      '@type': 'VirtualLocation',
      url: eventUrl,
    },
    image: event.bannerUrl ? [event.bannerUrl] : [`${SITE_URL}/og-default.png`],
    organizer: {
      '@type': 'Organization',
      name: event.organizer.name || event.organizer.email,
      url: SITE_URL,
    },
  };

  // Add start date if available
  if (startDate) {
    schema.startDate = startDate.toISOString();
  }

  // Add end date if available
  if (endDate) {
    schema.endDate = endDate.toISOString();
  }

  // Add ticket offers if available
  if (event.tickets && event.tickets.length > 0) {
    schema.offers = event.tickets.map((ticket) => ({
      '@type': 'Offer',
      name: ticket.name,
      price: ticket.price,
      priceCurrency: 'USD',
      availability: ticket.quantity && ticket.quantity > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/SoldOut',
      url: `${eventUrl}/checkout?ticketId=${ticket.id}`,
      validFrom: startDate?.toISOString(),
    }));
  }

  return schema;
}

/**
 * ItemList schema for event listings
 */
export function generateEventListSchema(events: EventForSchema[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: events.map((event, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/events/${event.id}`,
      name: event.name,
    })),
  };
}

/**
 * Render JSON-LD script tag
 */
export function renderJsonLd(schema: any) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Combine multiple schemas into one script tag
 */
export function combineSchemas(...schemas: any[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': schemas,
  };
}
