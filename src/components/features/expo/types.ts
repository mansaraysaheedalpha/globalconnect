// src/components/features/expo/types.ts

export type ExpoHallLayout = 'GRID' | 'FLOOR_PLAN' | 'LIST';
export type BoothTier = 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' | 'STARTUP';
export type BoothVisitorStatus = 'BROWSING' | 'IN_CHAT' | 'IN_VIDEO';
export type BoothVideoSessionStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'DECLINED'
  | 'CANCELLED'
  | 'EXPIRED';
export type StaffPresenceStatus = 'ONLINE' | 'AWAY' | 'BUSY' | 'OFFLINE';

export interface ExpoHall {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  layout: ExpoHallLayout;
  categories: string[];
  opensAt: string | null;
  closesAt: string | null;
  isActive: boolean;
  bannerUrl: string | null;
  welcomeMessage: string | null;
  booths: ExpoBooth[];
}

export interface BoothResource {
  id: string;
  name: string;
  type: 'PDF' | 'VIDEO' | 'IMAGE' | 'OTHER';
  url: string;
  description?: string;
  thumbnailUrl?: string;
  downloadCount: number;
}

export interface BoothCta {
  id: string;
  label: string;
  url: string;
  style: 'primary' | 'secondary' | 'outline';
  icon?: string;
  order: number;
  clickCount: number;
}

export interface BoothStaffPresence {
  staffId: string;
  staffName: string;
  staffAvatarUrl: string | null;
  status: StaffPresenceStatus;
}

export interface ExpoBooth {
  id: string;
  expoHallId: string;
  sponsorId: string;
  boothNumber: string;
  tier: BoothTier;
  name: string;
  tagline: string | null;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  videoUrl: string | null;
  resources: BoothResource[];
  ctaButtons: BoothCta[];
  staffIds: string[];
  chatEnabled: boolean;
  videoEnabled: boolean;
  category: string | null;
  displayOrder: number;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  staffPresence: BoothStaffPresence[];
  _count: {
    visits: number;
  };
}

export interface BoothVisit {
  id: string;
  boothId: string;
  userId: string;
  eventId: string;
  enteredAt: string;
  exitedAt: string | null;
  status: BoothVisitorStatus;
  durationSeconds: number;
  leadCaptured: boolean;
}

export interface BoothChatMessage {
  id: string;
  boothId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl: string | null;
  isStaff: boolean;
  text: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface BoothVideoSession {
  id: string;
  boothId: string;
  attendeeId: string;
  attendeeName: string;
  staffId: string | null;
  staffName: string | null;
  status: BoothVideoSessionStatus;
  requestedAt: string;
  acceptedAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  durationSeconds: number;
  videoRoomUrl: string | null;
  token?: string;
}

export interface BoothAnalytics {
  currentVisitors: number;
  totalVisitors: number;
  uniqueVisitors: number;
  peakVisitors: number;
  avgVisitDuration: number;
  totalChatMessages: number;
  totalVideoSessions: number;
  completedVideoSessions: number;
  avgVideoDuration: number;
  totalDownloads: number;
  totalCtaClicks: number;
  totalLeads: number;
  resourceDownloads: Record<string, number>;
  ctaClicks: Record<string, number>;
  pendingVideoRequests?: number;
}

// Tier styling configuration
export const BOOTH_TIER_CONFIG: Record<
  BoothTier,
  { color: string; bgColor: string; borderColor: string; label: string; priority: number; features: string[] }
> = {
  PLATINUM: {
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-400',
    label: 'Platinum',
    priority: 1,
    features: [
      'Premium booth placement',
      'Unlimited resources & CTAs',
      'Video calls with attendees',
      'Live chat support',
      'Featured in hall banner',
      'Custom booth branding',
      'Priority lead notifications',
      'Advanced analytics dashboard',
    ],
  },
  GOLD: {
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-400',
    label: 'Gold',
    priority: 2,
    features: [
      'Priority booth placement',
      'Up to 10 resources',
      'Video calls with attendees',
      'Live chat support',
      'Custom booth branding',
      'Analytics dashboard',
    ],
  },
  SILVER: {
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-400',
    label: 'Silver',
    priority: 3,
    features: [
      'Standard booth placement',
      'Up to 5 resources',
      'Live chat support',
      'Basic analytics',
    ],
  },
  BRONZE: {
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-400',
    label: 'Bronze',
    priority: 4,
    features: [
      'Standard booth placement',
      'Up to 3 resources',
      'Live chat support',
    ],
  },
  STARTUP: {
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-400',
    label: 'Startup',
    priority: 5,
    features: [
      'Basic booth placement',
      'Up to 2 resources',
      'Contact form',
    ],
  },
};
