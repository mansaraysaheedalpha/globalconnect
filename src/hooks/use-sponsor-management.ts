// src/hooks/use-sponsor-management.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";

const API_BASE_URL = process.env.NEXT_PUBLIC_EVENT_LIFECYCLE_URL || "http://localhost:8000/api/v1";

// Types
export interface SponsorTier {
  id: string;
  name: string;
  displayOrder: number;
  color: string | null;
  benefits: string[];
  boothSize: string | null;
  logoPlacement: string | null;
  maxRepresentatives: number;
  canCaptureLeads: boolean;
  canExportLeads: boolean;
  canSendMessages: boolean;
  priceCents: number | null;
  currency: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Sponsor {
  id: string;
  organizationId: string;
  eventId: string;
  tierId: string | null;
  companyName: string;
  companyDescription: string | null;
  companyWebsite: string | null;
  companyLogoUrl: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  boothNumber: string | null;
  boothDescription: string | null;
  customBoothUrl: string | null;
  socialLinks: Record<string, string>;
  marketingAssets: Array<{ type: string; url: string; name: string }>;
  leadCaptureEnabled: boolean;
  leadNotificationEmail: string | null;
  customFields: Record<string, unknown>;
  isActive: boolean;
  isFeatured: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  tier?: SponsorTier;
}

export interface SponsorUser {
  id: string;
  sponsorId: string;
  userId: string;
  role: string;
  canViewLeads: boolean;
  canExportLeads: boolean;
  canMessageAttendees: boolean;
  canManageBooth: boolean;
  canInviteOthers: boolean;
  isActive: boolean;
  joinedAt: string;
  lastActiveAt: string | null;
}

export interface SponsorInvitation {
  id: string;
  sponsorId: string;
  email: string;
  role: string;
  status: string;
  canViewLeads: boolean;
  canExportLeads: boolean;
  canMessageAttendees: boolean;
  canManageBooth: boolean;
  canInviteOthers: boolean;
  personalMessage: string | null;
  invitedByUserId: string;
  acceptedByUserId: string | null;
  acceptedAt: string | null;
  expiresAt: string;
  createdAt: string;
}

export interface CreateSponsorTierInput {
  name: string;
  displayOrder?: number;
  color?: string;
  benefits?: string[];
  boothSize?: string;
  logoPlacement?: string;
  maxRepresentatives?: number;
  canCaptureLeads?: boolean;
  canExportLeads?: boolean;
  canSendMessages?: boolean;
  priceCents?: number;
  currency?: string;
}

export interface CreateSponsorInput {
  companyName: string;
  tierId?: string;
  companyDescription?: string;
  companyWebsite?: string;
  companyLogoUrl?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  boothNumber?: string;
  boothDescription?: string;
  customBoothUrl?: string;
  socialLinks?: Record<string, string>;
  marketingAssets?: Array<{ type: string; url: string; name: string }>;
  leadCaptureEnabled?: boolean;
  leadNotificationEmail?: string;
  customFields?: Record<string, unknown>;
}

export interface InviteRepresentativeInput {
  email: string;
  role?: string;
  canViewLeads?: boolean;
  canExportLeads?: boolean;
  canMessageAttendees?: boolean;
  canManageBooth?: boolean;
  canInviteOthers?: boolean;
  personalMessage?: string;
}

interface UseSponsorManagementOptions {
  eventId: string;
  organizationId: string;
}

export function useSponsorManagement({ eventId, organizationId }: UseSponsorManagementOptions) {
  const { token } = useAuthStore();
  const [tiers, setTiers] = useState<SponsorTier[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // Fetch sponsor tiers
  const fetchTiers = useCallback(async () => {
    if (!token || !eventId || !organizationId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/sponsors/organizations/${organizationId}/events/${eventId}/sponsor-tiers`,
        { headers }
      );
      if (response.ok) {
        const data = await response.json();
        setTiers(data);
      }
    } catch (err) {
      console.error("Failed to fetch tiers:", err);
    }
  }, [token, eventId, organizationId]);

  // Fetch sponsors
  const fetchSponsors = useCallback(async () => {
    if (!token || !eventId || !organizationId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/sponsors/organizations/${organizationId}/events/${eventId}/sponsors`,
        { headers }
      );
      if (response.ok) {
        const data = await response.json();
        setSponsors(data);
      }
    } catch (err) {
      console.error("Failed to fetch sponsors:", err);
    }
  }, [token, eventId, organizationId]);

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchTiers(), fetchSponsors()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchTiers, fetchSponsors]);

  // Create default tiers
  const createDefaultTiers = useCallback(async (): Promise<SponsorTier[] | null> => {
    if (!token || !eventId || !organizationId) return null;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/sponsors/organizations/${organizationId}/events/${eventId}/sponsor-tiers/defaults`,
        {
          method: "POST",
          headers,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create default tiers");
      }

      const data = await response.json();
      setTiers(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create default tiers";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [token, eventId, organizationId]);

  // Create a single tier
  const createTier = useCallback(async (input: CreateSponsorTierInput): Promise<SponsorTier | null> => {
    if (!token || !eventId || !organizationId) return null;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/sponsors/organizations/${organizationId}/events/${eventId}/sponsor-tiers`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(input),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create tier");
      }

      const data = await response.json();
      setTiers((prev) => [...prev, data]);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create tier";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [token, eventId, organizationId]);

  // Create a sponsor
  const createSponsor = useCallback(async (input: CreateSponsorInput): Promise<Sponsor | null> => {
    if (!token || !eventId || !organizationId) return null;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/sponsors/organizations/${organizationId}/events/${eventId}/sponsors`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(input),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create sponsor");
      }

      const data = await response.json();
      // Fetch sponsors again to get the full data with tier
      await fetchSponsors();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create sponsor";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [token, eventId, organizationId, fetchSponsors]);

  // Update a sponsor
  const updateSponsor = useCallback(async (
    sponsorId: string,
    input: Partial<CreateSponsorInput> & { isActive?: boolean; isFeatured?: boolean }
  ): Promise<Sponsor | null> => {
    if (!token || !organizationId) return null;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/sponsors/organizations/${organizationId}/sponsors/${sponsorId}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify(input),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update sponsor");
      }

      const data = await response.json();
      setSponsors((prev) => prev.map((s) => (s.id === sponsorId ? { ...s, ...data } : s)));
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update sponsor";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [token, organizationId]);

  // Archive a sponsor
  const archiveSponsor = useCallback(async (sponsorId: string): Promise<boolean> => {
    if (!token || !organizationId) return false;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/sponsors/organizations/${organizationId}/sponsors/${sponsorId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to archive sponsor");
      }

      setSponsors((prev) => prev.filter((s) => s.id !== sponsorId));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to archive sponsor";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [token, organizationId]);

  // Invite a representative
  const inviteRepresentative = useCallback(async (
    sponsorId: string,
    input: InviteRepresentativeInput
  ): Promise<SponsorInvitation | null> => {
    if (!token || !organizationId) return null;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/sponsors/organizations/${organizationId}/sponsors/${sponsorId}/invitations`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(input),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to send invitation");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send invitation";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [token, organizationId]);

  // Get invitations for a sponsor
  const getInvitations = useCallback(async (sponsorId: string): Promise<SponsorInvitation[]> => {
    if (!token || !organizationId) return [];

    try {
      const response = await fetch(
        `${API_BASE_URL}/sponsors/organizations/${organizationId}/sponsors/${sponsorId}/invitations`,
        { headers }
      );

      if (!response.ok) return [];
      return await response.json();
    } catch (err) {
      console.error("Failed to fetch invitations:", err);
      return [];
    }
  }, [token, organizationId]);

  // Revoke an invitation
  const revokeInvitation = useCallback(async (invitationId: string): Promise<boolean> => {
    if (!token || !organizationId) return false;

    try {
      const response = await fetch(
        `${API_BASE_URL}/sponsors/organizations/${organizationId}/invitations/${invitationId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      return response.ok;
    } catch (err) {
      console.error("Failed to revoke invitation:", err);
      return false;
    }
  }, [token, organizationId]);

  // Get sponsor users
  const getSponsorUsers = useCallback(async (sponsorId: string): Promise<SponsorUser[]> => {
    if (!token || !organizationId) return [];

    try {
      const response = await fetch(
        `${API_BASE_URL}/sponsors/organizations/${organizationId}/sponsors/${sponsorId}/users`,
        { headers }
      );

      if (!response.ok) return [];
      return await response.json();
    } catch (err) {
      console.error("Failed to fetch sponsor users:", err);
      return [];
    }
  }, [token, organizationId]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh data
  const refresh = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchTiers(), fetchSponsors()]);
    setIsLoading(false);
  }, [fetchTiers, fetchSponsors]);

  return {
    // Data
    tiers,
    sponsors,
    isLoading,
    error,

    // Tier actions
    createDefaultTiers,
    createTier,

    // Sponsor actions
    createSponsor,
    updateSponsor,
    archiveSponsor,

    // Invitation actions
    inviteRepresentative,
    getInvitations,
    revokeInvitation,

    // User actions
    getSponsorUsers,

    // Utility
    clearError,
    refresh,
  };
}
