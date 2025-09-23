/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** Date with time (isoformat) */
  DateTime: { input: any; output: any; }
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  token: Scalars['String']['output'];
  user: User;
};

export type ChangePasswordInput = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};

export type CreateInvitationInput = {
  email: Scalars['String']['input'];
  role: Scalars['String']['input'];
};

export type DeleteOrganizationInput = {
  force?: InputMaybe<Scalars['Boolean']['input']>;
  organizationId: Scalars['ID']['input'];
};

export type DeleteOrganizationPayload = {
  __typename?: 'DeleteOrganizationPayload';
  nextOrganizationId?: Maybe<Scalars['ID']['output']>;
  success: Scalars['Boolean']['output'];
};

export type EventCreateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  endDate: Scalars['String']['input'];
  name: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
  venueId?: InputMaybe<Scalars['String']['input']>;
};

export type EventStatsType = {
  __typename?: 'EventStatsType';
  totalEvents: Scalars['Int']['output'];
  upcomingEvents: Scalars['Int']['output'];
  upcomingRegistrations: Scalars['Int']['output'];
};

export type EventType = {
  __typename?: 'EventType';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  endDate: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  isArchived: Scalars['Boolean']['output'];
  isPublic: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  organizationId: Scalars['String']['output'];
  registrationsCount: Scalars['Int']['output'];
  startDate: Scalars['DateTime']['output'];
  status: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  venueId?: Maybe<Scalars['String']['output']>;
  version: Scalars['Int']['output'];
};

export type EventUpdateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  venueId?: InputMaybe<Scalars['String']['input']>;
};

export type EventsPayload = {
  __typename?: 'EventsPayload';
  events: Array<EventType>;
  totalCount: Scalars['Int']['output'];
};

export type Login2FaInput = {
  code: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type LoginPayload = {
  __typename?: 'LoginPayload';
  onboardingToken?: Maybe<Scalars['String']['output']>;
  requires2FA: Scalars['Boolean']['output'];
  token?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
  userIdFor2FA?: Maybe<Scalars['ID']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  archiveEvent: EventType;
  changePassword: Scalars['Boolean']['output'];
  createAdditionalOrganization: AuthPayload;
  createEvent: EventType;
  createInvitation: Scalars['String']['output'];
  createRegistration: RegistrationType;
  createSession: SessionType;
  deleteOrganization: DeleteOrganizationPayload;
  generate2FA: TwoFactorSetupPayload;
  login: LoginPayload;
  login2FA: AuthPayload;
  logout: Scalars['Boolean']['output'];
  onboardingCreateOrganization: AuthPayload;
  performPasswordReset: Scalars['String']['output'];
  refreshToken: AuthPayload;
  registerUser: AuthPayload;
  removeMember: OrganizationMember;
  requestPasswordReset: Scalars['String']['output'];
  restoreOrganization: Organization;
  switchOrganization: AuthPayload;
  turnOff2FA: Scalars['String']['output'];
  turnOn2FA: Scalars['String']['output'];
  updateEvent: EventType;
  updateMemberRole: OrganizationMember;
  updateMyProfile: User;
  updateOrganization: Organization;
};


export type MutationArchiveEventArgs = {
  id: Scalars['String']['input'];
};


export type MutationChangePasswordArgs = {
  input: ChangePasswordInput;
};


export type MutationCreateAdditionalOrganizationArgs = {
  input: OnboardingCreateOrganizationInput;
};


export type MutationCreateEventArgs = {
  eventIn: EventCreateInput;
};


export type MutationCreateInvitationArgs = {
  input: CreateInvitationInput;
};


export type MutationCreateRegistrationArgs = {
  eventId: Scalars['String']['input'];
  registrationIn: RegistrationCreateInput;
};


export type MutationCreateSessionArgs = {
  sessionIn: SessionCreateInput;
};


export type MutationDeleteOrganizationArgs = {
  input: DeleteOrganizationInput;
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationLogin2FaArgs = {
  input: Login2FaInput;
};


export type MutationOnboardingCreateOrganizationArgs = {
  input: OnboardingCreateOrganizationInput;
};


export type MutationPerformPasswordResetArgs = {
  input: PerformResetInput;
};


export type MutationRegisterUserArgs = {
  input: RegisterUserInput;
};


export type MutationRemoveMemberArgs = {
  memberId: Scalars['ID']['input'];
};


export type MutationRequestPasswordResetArgs = {
  input: RequestResetInput;
};


export type MutationRestoreOrganizationArgs = {
  organizationId: Scalars['ID']['input'];
};


export type MutationSwitchOrganizationArgs = {
  organizationId: Scalars['ID']['input'];
};


export type MutationTurnOn2FaArgs = {
  input: TurnOn2FaInput;
};


export type MutationUpdateEventArgs = {
  eventIn: EventUpdateInput;
  id: Scalars['String']['input'];
};


export type MutationUpdateMemberRoleArgs = {
  input: UpdateMemberRoleInput;
};


export type MutationUpdateMyProfileArgs = {
  input: UpdateMyProfileInput;
};


export type MutationUpdateOrganizationArgs = {
  input: UpdateOrganizationInput;
};

export type OnboardingCreateOrganizationInput = {
  name: Scalars['String']['input'];
};

export type Organization = {
  __typename?: 'Organization';
  deletionScheduledAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  status: OrganizationStatus;
};

export type OrganizationMember = {
  __typename?: 'OrganizationMember';
  role: Role;
  user: User;
};

export enum OrganizationStatus {
  Active = 'ACTIVE',
  PendingDeletion = 'PENDING_DELETION'
}

export type PerformResetInput = {
  newPassword: Scalars['String']['input'];
  resetToken: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  event: EventType;
  eventStats: EventStatsType;
  eventsByOrganization: EventsPayload;
  getMyProfile: User;
  listRolesForOrg: Array<Role>;
  myOrganizations: Array<Organization>;
  organization: Organization;
  organizationMembers: Array<OrganizationMember>;
  organizationSpeakers: Array<SpeakerType>;
  registrationsByEvent: Array<RegistrationType>;
  sayHello: Scalars['String']['output'];
  sentiment: SentimentType;
  sessionsByEvent: Array<SessionType>;
  user: User;
};


export type QueryEventArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEventsByOrganizationArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};


export type QueryOrganizationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryRegistrationsByEventArgs = {
  eventId: Scalars['ID']['input'];
};


export type QuerySentimentArgs = {
  text: Scalars['String']['input'];
};


export type QuerySessionsByEventArgs = {
  eventId: Scalars['ID']['input'];
};


export type QueryUserArgs = {
  id: Scalars['String']['input'];
};

export type RegisterUserInput = {
  email: Scalars['String']['input'];
  first_name: Scalars['String']['input'];
  last_name: Scalars['String']['input'];
  organization_name: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type RegistrationCreateInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type RegistrationType = {
  __typename?: 'RegistrationType';
  checkedInAt?: Maybe<Scalars['DateTime']['output']>;
  guestEmail?: Maybe<Scalars['String']['output']>;
  guestName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  status: Scalars['String']['output'];
  ticketCode: Scalars['String']['output'];
  user?: Maybe<User>;
};

export type RequestResetInput = {
  email: Scalars['String']['input'];
};

export type Role = {
  __typename?: 'Role';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type SentimentType = {
  __typename?: 'SentimentType';
  label: Scalars['String']['output'];
  score: Scalars['Float']['output'];
};

export type SessionCreateInput = {
  endTime: Scalars['String']['input'];
  eventId: Scalars['String']['input'];
  speakerIds?: InputMaybe<Array<Scalars['String']['input']>>;
  startTime: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type SessionType = {
  __typename?: 'SessionType';
  endTime: Scalars['DateTime']['output'];
  eventId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isArchived: Scalars['Boolean']['output'];
  speakers: Array<SpeakerType>;
  startTime: Scalars['DateTime']['output'];
  title: Scalars['String']['output'];
};

export type SpeakerType = {
  __typename?: 'SpeakerType';
  bio?: Maybe<Scalars['String']['output']>;
  expertise?: Maybe<Array<Scalars['String']['output']>>;
  id: Scalars['String']['output'];
  isArchived: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  organizationId: Scalars['String']['output'];
};

export type TurnOn2FaInput = {
  code: Scalars['String']['input'];
};

export type TwoFactorSetupPayload = {
  __typename?: 'TwoFactorSetupPayload';
  qrCodeDataUrl: Scalars['String']['output'];
};

export type UpdateMemberRoleInput = {
  memberId: Scalars['ID']['input'];
  roleId: Scalars['ID']['input'];
};

export type UpdateMyProfileInput = {
  first_name?: InputMaybe<Scalars['String']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOrganizationInput = {
  name: Scalars['String']['input'];
  organizationId: Scalars['ID']['input'];
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  first_name: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  isTwoFactorEnabled: Scalars['Boolean']['output'];
  last_name: Scalars['String']['output'];
};

export type GetOrganizationQueryVariables = Exact<{
  organizationId: Scalars['ID']['input'];
}>;


export type GetOrganizationQuery = { __typename?: 'Query', organization: { __typename?: 'Organization', id: string, name: string, status: OrganizationStatus, deletionScheduledAt?: any | null } };

export type UpdateOrganizationMutationVariables = Exact<{
  input: UpdateOrganizationInput;
}>;


export type UpdateOrganizationMutation = { __typename?: 'Mutation', updateOrganization: { __typename?: 'Organization', id: string, name: string } };

export type DeleteOrganizationMutationVariables = Exact<{
  input: DeleteOrganizationInput;
}>;


export type DeleteOrganizationMutation = { __typename?: 'Mutation', deleteOrganization: { __typename?: 'DeleteOrganizationPayload', success: boolean, nextOrganizationId?: string | null } };

export type RestoreOrganizationMutationVariables = Exact<{
  organizationId: Scalars['ID']['input'];
}>;


export type RestoreOrganizationMutation = { __typename?: 'Mutation', restoreOrganization: { __typename?: 'Organization', id: string, status: OrganizationStatus } };

export type RequestPasswordResetMutationVariables = Exact<{
  input: RequestResetInput;
}>;


export type RequestPasswordResetMutation = { __typename?: 'Mutation', requestPasswordReset: string };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'LoginPayload', token?: string | null, requires2FA: boolean, userIdFor2FA?: string | null, user?: { __typename?: 'User', id: string, email: string, first_name: string } | null } };

export type RegisterUserMutationVariables = Exact<{
  input: RegisterUserInput;
}>;


export type RegisterUserMutation = { __typename?: 'Mutation', registerUser: { __typename?: 'AuthPayload', token: string, user: { __typename?: 'User', id: string, email: string, first_name: string } } };

export type Login2FaMutationVariables = Exact<{
  input: Login2FaInput;
}>;


export type Login2FaMutation = { __typename?: 'Mutation', login2FA: { __typename?: 'AuthPayload', token: string, user: { __typename?: 'User', id: string, email: string, first_name: string } } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type CreateInvitationMutationVariables = Exact<{
  input: CreateInvitationInput;
}>;


export type CreateInvitationMutation = { __typename?: 'Mutation', createInvitation: string };

export type GetTeamDataQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTeamDataQuery = { __typename?: 'Query', organizationMembers: Array<{ __typename?: 'OrganizationMember', user: { __typename?: 'User', id: string, first_name: string, last_name: string, email: string }, role: { __typename?: 'Role', id: string, name: string } }>, listRolesForOrg: Array<{ __typename?: 'Role', id: string, name: string }> };

export type UpdateMemberRoleMutationVariables = Exact<{
  input: UpdateMemberRoleInput;
}>;


export type UpdateMemberRoleMutation = { __typename?: 'Mutation', updateMemberRole: { __typename?: 'OrganizationMember', user: { __typename?: 'User', id: string }, role: { __typename?: 'Role', name: string } } };

export type RemoveMemberMutationVariables = Exact<{
  memberId: Scalars['ID']['input'];
}>;


export type RemoveMemberMutation = { __typename?: 'Mutation', removeMember: { __typename?: 'OrganizationMember', user: { __typename?: 'User', id: string } } };

export type Generate2FaMutationVariables = Exact<{ [key: string]: never; }>;


export type Generate2FaMutation = { __typename?: 'Mutation', generate2FA: { __typename?: 'TwoFactorSetupPayload', qrCodeDataUrl: string } };

export type TurnOn2FaMutationVariables = Exact<{
  input: TurnOn2FaInput;
}>;


export type TurnOn2FaMutation = { __typename?: 'Mutation', turnOn2FA: string };

export type PerformPasswordResetMutationVariables = Exact<{
  input: PerformResetInput;
}>;


export type PerformPasswordResetMutation = { __typename?: 'Mutation', performPasswordReset: string };

export type CreateAdditionalOrganizationMutationVariables = Exact<{
  input: OnboardingCreateOrganizationInput;
}>;


export type CreateAdditionalOrganizationMutation = { __typename?: 'Mutation', createAdditionalOrganization: { __typename?: 'AuthPayload', token: string, user: { __typename?: 'User', id: string, first_name: string, last_name: string, email: string } } };

export type GetMyOrgsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyOrgsQuery = { __typename?: 'Query', myOrganizations: Array<{ __typename?: 'Organization', id: string, name: string }> };

export type SwitchOrgMutationVariables = Exact<{
  organizationId: Scalars['ID']['input'];
}>;


export type SwitchOrgMutation = { __typename?: 'Mutation', switchOrganization: { __typename?: 'AuthPayload', token: string, user: { __typename?: 'User', id: string, email: string, first_name: string } } };

export type OnboardingCreateOrganizationMutationVariables = Exact<{
  input: OnboardingCreateOrganizationInput;
}>;


export type OnboardingCreateOrganizationMutation = { __typename?: 'Mutation', onboardingCreateOrganization: { __typename?: 'AuthPayload', token: string, user: { __typename?: 'User', id: string, first_name: string, last_name: string, email: string } } };

export type GetMyProfile2FaQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyProfile2FaQuery = { __typename?: 'Query', getMyProfile: { __typename?: 'User', id: string, isTwoFactorEnabled: boolean } };

export type TurnOff2FaMutationVariables = Exact<{ [key: string]: never; }>;


export type TurnOff2FaMutation = { __typename?: 'Mutation', turnOff2FA: string };

export type GetSpeakersByOrgQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSpeakersByOrgQuery = { __typename?: 'Query', organizationSpeakers: Array<{ __typename?: 'SpeakerType', id: string, name: string }> };

export type GetMyProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyProfileQuery = { __typename?: 'Query', getMyProfile: { __typename?: 'User', id: string, first_name: string, last_name: string, email: string } };

export type UpdateMyProfileMutationVariables = Exact<{
  input: UpdateMyProfileInput;
}>;


export type UpdateMyProfileMutation = { __typename?: 'Mutation', updateMyProfile: { __typename?: 'User', id: string, first_name: string, last_name: string } };

export type ChangePasswordMutationVariables = Exact<{
  input: ChangePasswordInput;
}>;


export type ChangePasswordMutation = { __typename?: 'Mutation', changePassword: boolean };


export const GetOrganizationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOrganization"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organization"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"deletionScheduledAt"}}]}}]}}]} as unknown as DocumentNode<GetOrganizationQuery, GetOrganizationQueryVariables>;
export const UpdateOrganizationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateOrganization"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateOrganizationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOrganization"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<UpdateOrganizationMutation, UpdateOrganizationMutationVariables>;
export const DeleteOrganizationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteOrganization"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteOrganizationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteOrganization"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"nextOrganizationId"}}]}}]}}]} as unknown as DocumentNode<DeleteOrganizationMutation, DeleteOrganizationMutationVariables>;
export const RestoreOrganizationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RestoreOrganization"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"restoreOrganization"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<RestoreOrganizationMutation, RestoreOrganizationMutationVariables>;
export const RequestPasswordResetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RequestPasswordReset"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RequestResetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestPasswordReset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<RequestPasswordResetMutation, RequestPasswordResetMutationVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"requires2FA"}},{"kind":"Field","name":{"kind":"Name","value":"userIdFor2FA"}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const RegisterUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RegisterUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registerUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}}]}}]}}]}}]} as unknown as DocumentNode<RegisterUserMutation, RegisterUserMutationVariables>;
export const Login2FaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login2FA"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Login2FAInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login2FA"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}}]}}]}}]}}]} as unknown as DocumentNode<Login2FaMutation, Login2FaMutationVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"}}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const CreateInvitationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateInvitation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateInvitationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createInvitation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<CreateInvitationMutation, CreateInvitationMutationVariables>;
export const GetTeamDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTeamData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationMembers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"last_name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"listRolesForOrg"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<GetTeamDataQuery, GetTeamDataQueryVariables>;
export const UpdateMemberRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMemberRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMemberRoleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMemberRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateMemberRoleMutation, UpdateMemberRoleMutationVariables>;
export const RemoveMemberDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveMember"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeMember"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"memberId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<RemoveMemberMutation, RemoveMemberMutationVariables>;
export const Generate2FaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Generate2FA"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generate2FA"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"qrCodeDataUrl"}}]}}]}}]} as unknown as DocumentNode<Generate2FaMutation, Generate2FaMutationVariables>;
export const TurnOn2FaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TurnOn2FA"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TurnOn2FAInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"turnOn2FA"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<TurnOn2FaMutation, TurnOn2FaMutationVariables>;
export const PerformPasswordResetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PerformPasswordReset"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PerformResetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"performPasswordReset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<PerformPasswordResetMutation, PerformPasswordResetMutationVariables>;
export const CreateAdditionalOrganizationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateAdditionalOrganization"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OnboardingCreateOrganizationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAdditionalOrganization"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"last_name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<CreateAdditionalOrganizationMutation, CreateAdditionalOrganizationMutationVariables>;
export const GetMyOrgsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMyOrgs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myOrganizations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<GetMyOrgsQuery, GetMyOrgsQueryVariables>;
export const SwitchOrgDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SwitchOrg"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"switchOrganization"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}}]}}]}}]}}]} as unknown as DocumentNode<SwitchOrgMutation, SwitchOrgMutationVariables>;
export const OnboardingCreateOrganizationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"OnboardingCreateOrganization"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OnboardingCreateOrganizationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"onboardingCreateOrganization"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"last_name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<OnboardingCreateOrganizationMutation, OnboardingCreateOrganizationMutationVariables>;
export const GetMyProfile2FaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMyProfile2FA"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getMyProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isTwoFactorEnabled"}}]}}]}}]} as unknown as DocumentNode<GetMyProfile2FaQuery, GetMyProfile2FaQueryVariables>;
export const TurnOff2FaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TurnOff2FA"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"turnOff2FA"}}]}}]} as unknown as DocumentNode<TurnOff2FaMutation, TurnOff2FaMutationVariables>;
export const GetSpeakersByOrgDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSpeakersByOrg"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationSpeakers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<GetSpeakersByOrgQuery, GetSpeakersByOrgQueryVariables>;
export const GetMyProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMyProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getMyProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"last_name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<GetMyProfileQuery, GetMyProfileQueryVariables>;
export const UpdateMyProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMyProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMyProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMyProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"last_name"}}]}}]}}]} as unknown as DocumentNode<UpdateMyProfileMutation, UpdateMyProfileMutationVariables>;
export const ChangePasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangePassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChangePasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changePassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<ChangePasswordMutation, ChangePasswordMutationVariables>;