/**
 * Calendar Links Utility
 *
 * Generates calendar links for Google Calendar, Outlook, Yahoo,
 * and ICS file downloads for session events.
 */

import { clientEnv } from './env';

/**
 * Represents a calendar event with all necessary details
 */
export interface CalendarEvent {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  url?: string;
}

/**
 * Format a date for Google Calendar URL (YYYYMMDDTHHmmssZ format)
 */
function formatGoogleDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Format a date for Yahoo Calendar URL
 */
function formatYahooDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Calculate duration in hours and minutes for Yahoo Calendar
 */
function formatYahooDuration(startTime: Date, endTime: Date): string {
  const durationMs = endTime.getTime() - startTime.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}`;
}

/**
 * Truncate text to a maximum length, adding ellipsis if needed
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Generate a Google Calendar URL for the event
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: truncateText(event.title, 200),
    dates: `${formatGoogleDate(event.startTime)}/${formatGoogleDate(event.endTime)}`,
    details: truncateText(event.description, 2000),
    location: event.location || 'Virtual Event',
  });

  // Google Calendar doesn't have a standard sprop for URL, but we include in details
  if (event.url) {
    const detailsWithUrl = `Join: ${event.url}\n\n${event.description}`;
    params.set('details', truncateText(detailsWithUrl, 2000));
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate an Outlook (Live/Web) Calendar URL for the event
 */
export function generateOutlookUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: truncateText(event.title, 255),
    startdt: event.startTime.toISOString(),
    enddt: event.endTime.toISOString(),
    body: truncateText(event.description, 2000),
    location: event.location || 'Virtual Event',
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate an Outlook 365 Calendar URL for the event
 */
export function generateOutlook365Url(event: CalendarEvent): string {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: truncateText(event.title, 255),
    startdt: event.startTime.toISOString(),
    enddt: event.endTime.toISOString(),
    body: truncateText(event.description, 2000),
    location: event.location || 'Virtual Event',
  });

  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate a Yahoo Calendar URL for the event
 */
export function generateYahooCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    v: '60',
    title: truncateText(event.title, 200),
    st: formatYahooDate(event.startTime),
    dur: formatYahooDuration(event.startTime, event.endTime),
    desc: truncateText(event.description, 2000),
    in_loc: event.location || 'Virtual Event',
  });

  return `https://calendar.yahoo.com/?${params.toString()}`;
}

/**
 * Generate an Apple Calendar URL (webcal protocol)
 * This opens the native calendar app on Apple devices
 */
export function generateAppleCalendarUrl(sessionId: string, token?: string): string {
  const apiUrl = clientEnv.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  const icsUrl = `${apiUrl}/api/v1/calendar/sessions/${sessionId}/calendar.ics`;
  const urlWithToken = token ? `${icsUrl}?token=${encodeURIComponent(token)}` : icsUrl;

  // Replace http/https with webcal protocol
  return urlWithToken.replace(/^https?:/, 'webcal:');
}

/**
 * Generate a direct ICS download URL for a session
 */
export function generateIcsDownloadUrl(sessionId: string, token?: string): string {
  const apiUrl = clientEnv.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  const base = `${apiUrl}/api/v1/calendar/sessions/${sessionId}/calendar.ics`;
  return token ? `${base}?token=${encodeURIComponent(token)}` : base;
}

/**
 * Generate a direct ICS download URL for an entire event
 */
export function generateEventIcsDownloadUrl(eventId: string, userId?: string): string {
  const apiUrl = clientEnv.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  const base = `${apiUrl}/api/v1/calendar/events/${eventId}/calendar.ics`;
  return userId ? `${base}?userId=${encodeURIComponent(userId)}` : base;
}

/**
 * Build a CalendarEvent from session data
 */
export function buildCalendarEvent(
  session: {
    id: string;
    title: string;
    description?: string;
    startTime: Date | string;
    endTime: Date | string;
    eventName: string;
  },
  joinUrl?: string
): CalendarEvent {
  const startTime = session.startTime instanceof Date
    ? session.startTime
    : new Date(session.startTime);

  const endTime = session.endTime instanceof Date
    ? session.endTime
    : new Date(session.endTime);

  const baseDescription = session.description || '';
  const description = joinUrl
    ? `Join: ${joinUrl}\n\n${baseDescription}`.trim()
    : baseDescription;

  return {
    title: `${session.title} - ${session.eventName}`,
    description,
    startTime,
    endTime,
    location: 'Virtual Event',
    url: joinUrl,
  };
}
