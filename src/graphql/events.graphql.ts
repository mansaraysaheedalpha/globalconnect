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
      ownerId
      name
      description
      status
      startDate
      endDate
      isPublic
      imageUrl
      registrationsCount
      venueId
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