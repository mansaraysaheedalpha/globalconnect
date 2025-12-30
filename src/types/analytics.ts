// src/types/analytics.ts

/**
 * TypeScript types for analytics data
 *
 * These types match the GraphQL schema and ensure type safety throughout the analytics system.
 */

// Revenue Analytics
export interface DailyRevenue {
  date: string; // YYYY-MM-DD format
  revenue: number; // in cents
}

export interface RevenueBySource {
  source: string; // "offers" | "ads"
  revenue: number; // in cents
  percentage: number; // 0-100
}

export interface RevenueAnalytics {
  total: number; // Total revenue in cents
  fromOffers: number; // Revenue from offers in cents
  fromAds: number; // Revenue from ads in cents
  conversionRate: number; // Overall conversion rate (0-100)
  dailyRevenue?: DailyRevenue[];
  bySource?: RevenueBySource[];
}

// Offer Analytics
export interface OfferPerformance {
  offerId: string;
  name: string;
  views: number;
  purchases: number;
  conversionRate: number; // 0-100
  revenue: number; // in cents
  imageUrl?: string;
}

export interface OfferAnalytics {
  totalViews: number;
  totalPurchases: number;
  conversionRate: number; // 0-100
  averageOrderValue: number; // in cents
  topPerformers: OfferPerformance[];
}

// Ad Analytics
export interface AdPerformance {
  adId: string;
  name: string;
  impressions: number;
  clicks: number;
  ctr: number; // Click-through rate (0-100)
  revenue?: number; // in cents
}

export interface AdAnalytics {
  totalImpressions: number;
  totalClicks: number;
  averageCTR: number; // Average click-through rate (0-100)
  topPerformers: AdPerformance[];
}

// Waitlist Analytics
export interface WaitlistAnalytics {
  totalJoins: number;
  offersIssued: number;
  acceptanceRate: number; // 0-100
  averageWaitTimeMinutes: number;
}

// Main Monetization Analytics
export interface MonetizationAnalytics {
  revenue?: RevenueAnalytics;
  offers?: OfferAnalytics;
  ads?: AdAnalytics;
  waitlist?: WaitlistAnalytics;
}

// Conversion Funnel types
export interface FunnelStep {
  step: string;
  count: number;
  conversionRate: number; // 0-100, percentage of previous step
}

export interface ConversionFunnel {
  steps: FunnelStep[];
  overallConversionRate: number; // 0-100
}

// Export-related types
export interface ExportSection {
  revenue?: RevenueAnalytics;
  offers?: OfferAnalytics;
  ads?: AdAnalytics;
  waitlist?: WaitlistAnalytics;
  funnel?: ConversionFunnel;
  abtests?: ABTest[];
}

export interface ExportData {
  title: string;
  dateRange: DateRange;
  sections: ExportSection;
}

// A/B Testing types
export interface ABTestVariant {
  name: string;
  participants: number;
  conversions: number;
  conversionRate: number; // 0-100
  revenue?: number; // in cents
  lift?: number; // Percentage lift compared to control (-100 to +infinity)
}

export interface ABTest {
  id: string;
  name: string;
  testType: 'OFFER_PRICE' | 'AD_CREATIVE' | 'OFFER_COPY' | 'OTHER';
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  variants: ABTestVariant[];
  confidence: number; // 0-100
  winner?: string; // Variant name
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
}

// Scheduled Report types
export interface ScheduledReport {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  format: 'csv' | 'excel' | 'pdf';
  recipients: string[]; // Email addresses
  sections: string[]; // Section IDs to include
  nextRun: string; // ISO date string
  isActive: boolean;
  createdAt: string;
}

// Date range type (used throughout analytics)
export interface DateRange {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}
