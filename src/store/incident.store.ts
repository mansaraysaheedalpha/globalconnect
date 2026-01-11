// src/store/incident.store.ts
import { create } from "zustand";
import type {
  Incident,
  IncidentStatus,
  IncidentSeverity,
  IncidentType,
} from "@/types/incident.types";

interface IncidentFilters {
  status?: IncidentStatus[];
  severity?: IncidentSeverity[];
  type?: IncidentType[];
  searchQuery?: string;
}

interface IncidentState {
  // Incidents list for admin dashboard
  incidents: Incident[];

  // Loading states
  isLoading: boolean;
  isConnected: boolean;

  // Error state
  error: string | null;

  // Filters for admin dashboard
  filters: IncidentFilters;

  // Selected incident for detail view
  selectedIncidentId: string | null;

  // Reporting state (for attendees)
  isReporting: boolean;
  reportSuccess: boolean;
  reportError: string | null;

  // Actions
  setIncidents: (incidents: Incident[]) => void;
  addIncident: (incident: Incident) => void;
  updateIncident: (incident: Incident) => void;
  removeIncident: (incidentId: string) => void;

  setIsLoading: (isLoading: boolean) => void;
  setIsConnected: (isConnected: boolean) => void;
  setError: (error: string | null) => void;

  setFilters: (filters: Partial<IncidentFilters>) => void;
  clearFilters: () => void;

  setSelectedIncidentId: (id: string | null) => void;

  setIsReporting: (isReporting: boolean) => void;
  setReportSuccess: (success: boolean) => void;
  setReportError: (error: string | null) => void;
  resetReportState: () => void;

  // Computed getters
  getFilteredIncidents: () => Incident[];
  getIncidentById: (id: string) => Incident | undefined;
  getActiveIncidentsCount: () => number;
  getCriticalIncidentsCount: () => number;
}

export const useIncidentStore = create<IncidentState>((set, get) => ({
  // Initial state
  incidents: [],
  isLoading: false,
  isConnected: false,
  error: null,
  filters: {},
  selectedIncidentId: null,
  isReporting: false,
  reportSuccess: false,
  reportError: null,

  // Actions
  setIncidents: (incidents) => set({ incidents }),

  addIncident: (incident) =>
    set((state) => ({
      incidents: [incident, ...state.incidents],
    })),

  updateIncident: (updatedIncident) =>
    set((state) => ({
      incidents: state.incidents.map((incident) =>
        incident.id === updatedIncident.id ? updatedIncident : incident
      ),
    })),

  removeIncident: (incidentId) =>
    set((state) => ({
      incidents: state.incidents.filter((incident) => incident.id !== incidentId),
    })),

  setIsLoading: (isLoading) => set({ isLoading }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setError: (error) => set({ error }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  clearFilters: () => set({ filters: {} }),

  setSelectedIncidentId: (id) => set({ selectedIncidentId: id }),

  setIsReporting: (isReporting) => set({ isReporting }),
  setReportSuccess: (success) => set({ reportSuccess: success }),
  setReportError: (error) => set({ reportError: error }),

  resetReportState: () =>
    set({
      isReporting: false,
      reportSuccess: false,
      reportError: null,
    }),

  // Computed getters
  getFilteredIncidents: () => {
    const { incidents, filters } = get();

    return incidents.filter((incident) => {
      // Filter by status
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(incident.status)) {
          return false;
        }
      }

      // Filter by severity
      if (filters.severity && filters.severity.length > 0) {
        if (!filters.severity.includes(incident.severity)) {
          return false;
        }
      }

      // Filter by type
      if (filters.type && filters.type.length > 0) {
        if (!filters.type.includes(incident.type)) {
          return false;
        }
      }

      // Filter by search query
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesDetails = incident.details.toLowerCase().includes(query);
        const matchesReporter =
          incident.reporter.firstName?.toLowerCase().includes(query) ||
          incident.reporter.lastName?.toLowerCase().includes(query);

        if (!matchesDetails && !matchesReporter) {
          return false;
        }
      }

      return true;
    });
  },

  getIncidentById: (id) => {
    const { incidents } = get();
    return incidents.find((incident) => incident.id === id);
  },

  getActiveIncidentsCount: () => {
    const { incidents } = get();
    return incidents.filter(
      (incident) => incident.status !== "RESOLVED"
    ).length;
  },

  getCriticalIncidentsCount: () => {
    const { incidents } = get();
    return incidents.filter(
      (incident) =>
        incident.severity === "CRITICAL" && incident.status !== "RESOLVED"
    ).length;
  },
}));

// Helper to get state outside of React components
export function getIncidentState() {
  return useIncidentStore.getState();
}
