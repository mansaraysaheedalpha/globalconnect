import { gql } from "@apollo/client";

export const GET_ORGANIZATION_VENUES_QUERY = gql`
  query GetOrganizationVenues {
    organizationVenues {
      id
      name
      address
    }
  }
`;

export const CREATE_VENUE_MUTATION = gql`
  mutation CreateVenue($venueIn: VenueCreateInput!) {
    createVenue(venueIn: $venueIn) {
      id
      name
      address
    }
  }
`;
