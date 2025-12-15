//app/graphql/public.graphql.ts
import { gql } from "@apollo/client";
export const CREATE_REGISTRATION_MUTATION = gql`
  mutation CreateRegistration(
    $registrationIn: RegistrationCreateInput!
    $eventId: String!
  ) {
    createRegistration(registrationIn: $registrationIn, eventId: $eventId) {
      id
      status
      ticketCode
    }
  }
`;

export const GET_PUBLIC_EVENTS_QUERY = gql`
  query GetPublicEvents($limit: Int, $offset: Int, $includePast: Boolean) {
    publicEvents(limit: $limit, offset: $offset, includePast: $includePast) {
      totalCount
      events {
        id
        name
        description
        startDate
        endDate
        imageUrl
        venue {
          id
          name
        }
      }
    }
  }
`;

export const GET_PUBLIC_EVENT_DETAILS_QUERY = gql`
  query GetPublicEventDetails($eventId: ID!) {
    event(id: $eventId) {
      id
      name
      description
      startDate
      endDate
      imageUrl
      venue {
        id
        name
      }
    }
    publicSessionsByEvent(eventId: $eventId) {
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
