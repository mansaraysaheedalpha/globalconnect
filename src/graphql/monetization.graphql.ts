import { gql } from "@apollo/client";

export const GET_EVENT_MONETIZATION_QUERY = gql`
  query GetEventMonetization($eventId: ID!) {
    eventAds(eventId: $eventId) {
      id
      name
      contentType
      mediaUrl
      clickUrl
      isArchived
    }
    eventOffers(eventId: $eventId) {
      id
      title
      description
      price
      originalPrice
      currency
      offerType
      imageUrl
      expiresAt
      isArchived
      inventory {
        total
        available
        sold
        reserved
      }
      placement
      targetSessions
      targetTicketTiers
      stripePriceId
      isActive
      startsAt
    }
  }
`;

// Query for attendees to view active offers
export const GET_ACTIVE_OFFERS_QUERY = gql`
  query GetActiveOffers(
    $eventId: ID!
    $sessionId: ID
    $placement: String!
  ) {
    activeOffers(
      eventId: $eventId
      sessionId: $sessionId
      placement: $placement
    ) {
      id
      title
      description
      price
      originalPrice
      currency
      offerType
      imageUrl
      expiresAt
      inventory {
        total
        available
        sold
      }
      stripePriceId
      placement
      isActive
    }
  }
`;

// Query for user's purchased offers
export const GET_MY_PURCHASED_OFFERS_QUERY = gql`
  query GetMyPurchasedOffers($eventId: ID!) {
    myPurchasedOffers(eventId: $eventId) {
      id
      offer {
        id
        title
        description
        offerType
        imageUrl
      }
      quantity
      unitPrice
      totalPrice
      currency
      fulfillmentStatus
      fulfillmentType
      digitalContent {
        downloadUrl
        accessCode
      }
      trackingNumber
      purchasedAt
      fulfilledAt
    }
  }
`;

export const CREATE_AD_MUTATION = gql`
  mutation CreateAd($adIn: AdCreateInput!) {
    createAd(adIn: $adIn) {
      id
      name
    }
  }
`;

export const DELETE_AD_MUTATION = gql`
  mutation DeleteAd($id: String!) {
    deleteAd(id: $id)
  }
`;

export const CREATE_OFFER_MUTATION = gql`
  mutation CreateOffer($offerIn: OfferCreateInput!) {
    createOffer(offerIn: $offerIn) {
      id
      title
    }
  }
`;

export const DELETE_OFFER_MUTATION = gql`
  mutation DeleteOffer($id: String!) {
    deleteOffer(id: $id)
  }
`;

export const UPDATE_OFFER_MUTATION = gql`
  mutation UpdateOffer($id: ID!, $offerIn: OfferUpdateInput!) {
    updateOffer(id: $id, offerIn: $offerIn) {
      id
      title
      description
      price
      originalPrice
      imageUrl
      inventory {
        total
        available
        sold
        reserved
      }
      isActive
      expiresAt
    }
  }
`;

export const PURCHASE_OFFER_MUTATION = gql`
  mutation PurchaseOffer($offerId: ID!, $quantity: Int!) {
    purchaseOffer(offerId: $offerId, quantity: $quantity) {
      checkoutSessionId
      stripeCheckoutUrl
      order {
        id
        orderNumber
        status
        totalAmount {
          amount
          currency
        }
      }
    }
  }
`;

// Ads queries for attendees
export const GET_ADS_FOR_CONTEXT_QUERY = gql`
  query GetAdsForContext(
    $eventId: ID!
    $sessionId: ID
    $placement: String!
    $limit: Int
  ) {
    adsForContext(
      eventId: $eventId
      sessionId: $sessionId
      placement: $placement
      limit: $limit
    ) {
      id
      name
      contentType
      mediaUrl
      clickUrl
      displayDuration
      weight
    }
  }
`;

export const TRACK_AD_IMPRESSIONS_MUTATION = gql`
  mutation TrackAdImpressions($impressions: [ImpressionInput!]!) {
    trackAdImpressions(impressions: $impressions) {
      success
      trackedCount
    }
  }
`;

export const TRACK_AD_CLICK_MUTATION = gql`
  mutation TrackAdClick($adId: ID!, $sessionContext: String) {
    trackAdClick(adId: $adId, sessionContext: $sessionContext) {
      success
      redirectUrl
    }
  }
`;

// Analytics queries
export const GET_MONETIZATION_ANALYTICS_QUERY = gql`
  query GetMonetizationAnalytics(
    $eventId: ID!
    $dateFrom: String
    $dateTo: String
  ) {
    monetizationAnalytics(
      eventId: $eventId
      dateFrom: $dateFrom
      dateTo: $dateTo
    ) {
      revenue {
        total
        fromOffers
        fromAds
        byDay {
          date
          amount
        }
      }
      offers {
        totalViews
        totalPurchases
        conversionRate
        averageOrderValue
        topPerformers {
          offerId
          title
          revenue
          conversions
        }
      }
      ads {
        totalImpressions
        totalClicks
        averageCTR
        topPerformers {
          adId
          name
          impressions
          clicks
          ctr
        }
      }
      waitlist {
        totalJoins
        offersIssued
        acceptanceRate
        averageWaitTimeMinutes
      }
    }
  }
`;

// Waitlist Management Queries (Organizers Only)
// Note: Backend uses snake_case for GraphQL field names
export const GET_SESSION_WAITLIST_QUERY = gql`
  query GetSessionWaitlist($sessionId: ID!) {
    session_waitlist(session_id: $sessionId) {
      id
      position
      user_id
      user {
        id
        email
        first_name
        last_name
        image_url
      }
      session_id
      status
      priority_tier
      joined_at
      offer_sent_at
      offer_expires_at
      offer_responded_at
      left_at
    }
    session_capacity(session_id: $sessionId) {
      session_id
      maximum_capacity
      current_attendance
      available_spots
      is_available
      waitlist_count
    }
  }
`;

export const GET_EVENT_WAITLIST_ANALYTICS_QUERY = gql`
  query GetEventWaitlistAnalytics($eventId: ID!) {
    event_waitlist_analytics(event_id: $eventId) {
      total_waitlist_entries
      active_waitlist_count
      total_offers_issued
      total_offers_accepted
      total_offers_declined
      total_offers_expired
      acceptance_rate
      average_wait_time_minutes
      by_session {
        session_id
        session_title
        waitlist_count
        offers_issued
        acceptance_rate
      }
    }
  }
`;

export const REMOVE_FROM_WAITLIST_MUTATION = gql`
  mutation RemoveFromWaitlist($input: RemoveFromWaitlistInput!) {
    remove_from_waitlist(input: $input) {
      success
      message
    }
  }
`;

export const MANUALLY_ADD_TO_WAITLIST_MUTATION = gql`
  mutation ManuallyAddToWaitlist($input: JoinWaitlistInput!) {
    join_waitlist(input: $input) {
      success
      message
      entry {
        id
        position
        joined_at
      }
    }
  }
`;

export const UPDATE_SESSION_CAPACITY_MUTATION = gql`
  mutation UpdateSessionCapacity($input: UpdateCapacityInput!) {
    update_session_capacity(input: $input) {
      session_id
      maximum_capacity
      current_attendance
      available_spots
      is_available
      offers_automatically_sent
    }
  }
`;

export const SEND_WAITLIST_OFFER_MUTATION = gql`
  mutation SendWaitlistOffer($input: SendOfferInput!) {
    send_waitlist_offer(input: $input) {
      id
      session_id
      user_id
      status
      offer_sent_at
      offer_expires_at
    }
  }
`;

export const BULK_SEND_WAITLIST_OFFERS_MUTATION = gql`
  mutation BulkSendWaitlistOffers($input: BulkSendOffersInput!) {
    bulk_send_waitlist_offers(input: $input) {
      success
      offers_sent
      message
    }
  }
`;