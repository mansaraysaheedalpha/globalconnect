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

export const GET_PUBLIC_EVENT_DETAILS_QUERY = gql`
  query GetPublicEventDetails($eventId: ID!) {
    event(id: $eventId) {
      id
      name
      description
      startDate
      endDate
      imageUrl
    }
    publicSessionsByEvent(eventId: $eventId) {
      id
      title
      startTime
      endTime
      presentation
      speakers {
        id
        name
      }
    }
  }
`;
