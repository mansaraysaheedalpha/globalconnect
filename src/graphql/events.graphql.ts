import { gql } from "@apollo/client";

export const CREATE_EVENT_MUTATION = gql`
  mutation CreateEvent($eventIn: EventCreateInput!) {
    createEvent(eventIn: $eventIn) {
      id
      name
      status
      startDate
    }
  }
`;

export const GET_EVENT_BY_ID_QUERY = gql`
  query GetEventById($id: ID!) {
    event(id: $id) {
      id
      organizationId
      ownerId
      name
      description
      status
      startDate
      endDate
      isPublic
      imageUrl
      registrationsCount
      venue {
        id
        name
        address
      }
    }
  }
`;

export const ARCHIVE_EVENT_MUTATION = gql`
  mutation ArchiveEvent($id: String!) {
    archiveEvent(id: $id) {
      id
      isArchived
    }
  }
`;

export const UPDATE_EVENT_MUTATION = gql`
  mutation UpdateEvent($id: String!, $eventIn: EventUpdateInput!) {
    updateEvent(id: $id, eventIn: $eventIn) {
      id
      name
      description
      startDate
      endDate
      status
      isPublic
    }
  }
`;

// --- ADD THIS NEW MUTATION ---
export const RESTORE_EVENT_MUTATION = gql`
  mutation RestoreEvent($id: String!) {
    restoreEvent(id: $id) {
      id
      isArchived
    }
  }
`;

export const GET_ARCHIVED_EVENTS_COUNT_QUERY = gql`
  query GetArchivedEventsCount($status: String) {
    eventsByOrganization(status: $status) {
      totalCount
    }
  }
`;

export const GET_SESSIONS_BY_EVENT_QUERY = gql`
  query GetSessionsByEvent($eventId: ID!) {
    sessionsByEvent(eventId: $eventId) {
      id
      title
      startTime
      endTime
      speakers {
        id
        name
      }
    }
  }
`;

export const CREATE_SESSION_MUTATION = gql`
  mutation CreateSession($sessionIn: SessionCreateInput!) {
    createSession(sessionIn: $sessionIn) {
      id
      title
      startTime
      endTime
      speakers {
        id
        name
      }
    }
  }
`;

export const UPDATE_SESSION_MUTATION = gql`
  mutation UpdateSession($id: String!, $sessionIn: SessionUpdateInput!) {
    updateSession(id: $id, sessionIn: $sessionIn) {
      id
      title
      startTime
      endTime
      speakers {
        id
        name
      }
    }
  }
`;

export const ARCHIVE_SESSION_MUTATION = gql`
  mutation ArchiveSession($id: String!) {
    archiveSession(id: $id) {
      id
    }
  }
`;

export const PUBLISH_EVENT_MUTATION = gql`
  mutation PublishEvent($id: String!) {
    publishEvent(id: $id) {
      id
      status
      isPublic
    }
  }
`;

export const GET_ATTENDEES_BY_EVENT_QUERY = gql`
  query GetAttendeesByEvent($eventId: ID!) {
    registrationsByEvent(eventId: $eventId) {
      id
      status
      ticketCode
      checkedInAt
      guestEmail
      guestName
      user {
        id
        first_name
        last_name
        email
      }
    }
  }
`;

export const GET_EVENT_HISTORY_QUERY = gql`
  query GetEventHistory($eventId: ID!) {
    eventHistory(eventId: $eventId) {
      id
      eventType
      timestamp
      userId
      data
    }
  }
`;
