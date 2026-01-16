// src/graphql/attendee.graphql.ts
import { gql } from "@apollo/client";

// Get all events the current user is registered for (attendee dashboard)
export const GET_MY_REGISTRATIONS_QUERY = gql`
  query GetMyRegistrations {
    myRegistrations {
      id
      status
      ticketCode
      checkedInAt
      event {
        id
        name
        description
        startDate
        endDate
        status
        imageUrl
        venue {
          id
          name
          address
        }
      }
    }
  }
`;

// Check if current user is registered for a specific event
export const GET_MY_REGISTRATION_FOR_EVENT_QUERY = gql`
  query GetMyRegistrationForEvent($eventId: ID!) {
    myRegistrationForEvent(eventId: $eventId) {
      id
      status
      ticketCode
      checkedInAt
      event {
        id
        name
        status
      }
    }
  }
`;

// Get attendee event details with sessions (includes session status and virtual fields)
export const GET_ATTENDEE_EVENT_DETAILS_QUERY = gql`
  query GetAttendeeEventDetails($eventId: ID!) {
    myRegistrationForEvent(eventId: $eventId) {
      id
      status
      ticketCode
      checkedInAt
    }
    event(id: $eventId) {
      id
      name
      description
      startDate
      endDate
      status
      imageUrl
      organizationId
      eventType
      virtualSettings
      venue {
        id
        name
        address
      }
    }
    publicSessionsByEvent(eventId: $eventId) {
      id
      title
      startTime
      endTime
      status
      chatEnabled
      qaEnabled
      pollsEnabled
      chatOpen
      qaOpen
      pollsOpen
      sessionType
      streamingUrl
      recordingUrl
      broadcastOnly
      virtualRoomId
      speakers {
        id
        name
      }
    }
  }
`;
