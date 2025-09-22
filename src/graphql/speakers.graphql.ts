import { gql } from "@apollo/client";

export const GET_ORGANIZATION_SPEAKERS_QUERY = gql`
  query GetOrganizationSpeakers {
    organizationSpeakers {
      id
      name
      bio
      expertise
    }
  }
`;

export const CREATE_SPEAKER_MUTATION = gql`
  mutation CreateSpeaker($speakerIn: SpeakerCreateInput!) {
    createSpeaker(speakerIn: $speakerIn) {
      id
      name
      bio
      expertise
    }
  }
`;
