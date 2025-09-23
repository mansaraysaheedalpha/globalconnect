import { gql } from "@apollo/client";

// This query fetches all registrations for a given event.
// It includes a federated 'user' field, which Apollo Gateway will resolve
// by fetching the user's details from the user-and-org-service.
export const GET_REGISTRATIONS_BY_EVENT_QUERY = gql`
  query GetRegistrationsByEvent($eventId: ID!) {
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
