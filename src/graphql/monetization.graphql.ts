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