import { gql } from "@apollo/client";

export const CREATE_EVENT_MUTATION = gql`
  mutation CreateEvent($eventIn: EventCreateInput!) {
    createEvent(eventIn: $eventIn) {
      id
      name
      status
      startDate
      registrationsCount
      imageUrl
      eventType
      virtualSettings {
        streamingProvider
        streamingUrl
        recordingEnabled
        autoCaptions
        lobbyEnabled
      }
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
      eventType
      virtualSettings {
        streamingProvider
        streamingUrl
        recordingEnabled
        autoCaptions
        timezoneDisplay
        lobbyEnabled
        lobbyVideoUrl
        maxConcurrentViewers
        geoRestrictions
      }
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
      eventType
      virtualSettings {
        streamingProvider
        streamingUrl
        recordingEnabled
        autoCaptions
        lobbyEnabled
      }
    }
  }
`;

export const RESTORE_EVENT_MUTATION = gql`
  mutation RestoreEvent($id: String!) {
    restoreEvent(id: $id) {
      id
      isArchived
    }
  }
`;

export const UNPUBLISH_EVENT_MUTATION = gql`
  mutation UnpublishEvent($id: String!) {
    unpublishEvent(id: $id) {
      id
      status
      isPublic
      name
      startDate
      endDate
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
      status
      chatEnabled
      qaEnabled
      pollsEnabled
      breakoutEnabled
      chatOpen
      qaOpen
      pollsOpen
      sessionType
      streamingUrl
      recordingUrl
      broadcastOnly
      streamingProvider
      maxParticipants
      greenRoomEnabled
      greenRoomOpensMinutesBefore
      greenRoomNotes
      greenRoomOpen
      speakers {
        id
        name
        userId
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
      chatEnabled
      qaEnabled
      pollsEnabled
      breakoutEnabled
      sessionType
      streamingUrl
      broadcastOnly
      streamingProvider
      maxParticipants
      greenRoomEnabled
      greenRoomOpensMinutesBefore
      greenRoomNotes
      greenRoomOpen
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
      chatEnabled
      qaEnabled
      pollsEnabled
      breakoutEnabled
      sessionType
      streamingUrl
      recordingUrl
      broadcastOnly
      streamingProvider
      maxParticipants
      greenRoomEnabled
      greenRoomOpensMinutesBefore
      greenRoomNotes
      greenRoomOpen
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

// Toggle session chat open/close (runtime control)
export const TOGGLE_SESSION_CHAT_MUTATION = gql`
  mutation ToggleSessionChat($id: String!, $open: Boolean!) {
    toggleSessionChat(id: $id, open: $open) {
      id
      chatOpen
    }
  }
`;

// Toggle session Q&A open/close (runtime control)
export const TOGGLE_SESSION_QA_MUTATION = gql`
  mutation ToggleSessionQA($id: String!, $open: Boolean!) {
    toggleSessionQA(id: $id, open: $open) {
      id
      qaOpen
    }
  }
`;

// Toggle session Polls open/close (runtime control)
export const TOGGLE_SESSION_POLLS_MUTATION = gql`
  mutation ToggleSessionPolls($id: String!, $open: Boolean!) {
    toggleSessionPolls(id: $id, open: $open) {
      id
      pollsOpen
      pollsEnabled
    }
  }
`;

// Get a single session by ID (for green room, etc.)
export const GET_SESSION_BY_ID_QUERY = gql`
  query GetSessionById($id: ID!) {
    session(id: $id) {
      id
      title
      startTime
      endTime
      chatEnabled
      qaEnabled
      pollsEnabled
      breakoutEnabled
      chatOpen
      qaOpen
      pollsOpen
      sessionType
      streamingUrl
      recordingUrl
      broadcastOnly
      maxParticipants
      requiresCamera
      requiresMicrophone
      greenRoomEnabled
      greenRoomOpensMinutesBefore
      greenRoomNotes
      greenRoomOpen
      speakers {
        id
        name
        userId
      }
    }
  }
`;
