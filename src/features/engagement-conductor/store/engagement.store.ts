// src/features/engagement-conductor/store/engagement.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Engagement data point for charts
 */
export interface EngagementDataPoint {
  timestamp: Date;
  score: number;
  chatActivity: number;
  activeUsers: number;
  pollParticipation: number;
  reactions: number;
}

/**
 * Anomaly event from the agent
 */
export interface AnomalyEvent {
  id: string;
  type: 'SUDDEN_DROP' | 'GRADUAL_DECLINE' | 'LOW_ENGAGEMENT' | 'MASS_EXIT';
  severity: 'WARNING' | 'CRITICAL';
  timestamp: Date;
  currentEngagement: number;
  expectedEngagement: number;
  deviation: number;
}

/**
 * Pending intervention suggestion
 */
export interface InterventionSuggestion {
  id: string;
  type: 'NOTIFICATION' | 'GAMIFICATION' | 'CHAT_PROMPT' | 'POLL_LAUNCH';
  confidence: number;
  reasoning: string;
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  anomalyType?: string;
  content?: {
    title?: string;
    message?: string;
    targetUrl?: string;
  };
}

/**
 * Agent status
 */
export interface AgentStatus {
  state: 'IDLE' | 'MONITORING' | 'ANOMALY_DETECTED' | 'INTERVENING';
  mode: 'MANUAL' | 'SEMI_AUTO' | 'AUTO';
  lastUpdate: Date;
  confidence: number;
}

/**
 * Engagement state for a specific session
 */
export interface SessionEngagementState {
  sessionId: string;
  eventId: string;

  // Real-time data
  currentScore: number;
  dataPoints: EngagementDataPoint[];

  // Agent state
  agentStatus: AgentStatus | null;
  currentAnomaly: AnomalyEvent | null;

  // Interventions
  pendingIntervention: InterventionSuggestion | null;
  interventionHistory: InterventionSuggestion[];

  // Metadata
  lastUpdated: Date;
  totalDataPoints: number;
  sessionDuration: number; // in seconds
}

/**
 * Global engagement store
 */
interface EngagementStore {
  // State per session (keyed by sessionId)
  sessions: Record<string, SessionEngagementState>;

  // Active session being viewed
  activeSessionId: string | null;

  // Actions
  setActiveSession: (sessionId: string | null) => void;

  // Update engagement data
  updateEngagement: (sessionId: string, eventId: string, data: {
    score: number;
    chatActivity: number;
    activeUsers: number;
    pollParticipation: number;
    reactions: number;
  }) => void;

  // Update agent status
  updateAgentStatus: (sessionId: string, status: AgentStatus) => void;

  // Set current anomaly
  setAnomaly: (sessionId: string, anomaly: AnomalyEvent | null) => void;

  // Set pending intervention
  setPendingIntervention: (sessionId: string, intervention: InterventionSuggestion | null) => void;

  // Add intervention to history
  addInterventionToHistory: (sessionId: string, intervention: InterventionSuggestion) => void;

  // Clear session data
  clearSession: (sessionId: string) => void;

  // Clear all sessions
  clearAllSessions: () => void;

  // Get session state
  getSessionState: (sessionId: string) => SessionEngagementState | null;
}

// Maximum data points to keep per session (for memory management)
const MAX_DATA_POINTS = 200; // ~16 minutes at 5s intervals

// Maximum intervention history
const MAX_INTERVENTION_HISTORY = 50;

/**
 * Engagement Zustand store with persistence
 *
 * Persists engagement data to sessionStorage so it survives tab switches
 * and page navigation within the same browser session.
 */
export const useEngagementStore = create<EngagementStore>()(
  persist(
    (set, get) => ({
      sessions: {},
      activeSessionId: null,

      setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),

      updateEngagement: (sessionId, eventId, data) => set((state) => {
        const now = new Date();
        const existingSession = state.sessions[sessionId];

        const newDataPoint: EngagementDataPoint = {
          timestamp: now,
          score: data.score,
          chatActivity: data.chatActivity,
          activeUsers: data.activeUsers,
          pollParticipation: data.pollParticipation,
          reactions: data.reactions,
        };

        // Get existing data points or empty array
        let dataPoints = existingSession?.dataPoints || [];

        // Add new point
        dataPoints = [...dataPoints, newDataPoint];

        // Trim to max size
        if (dataPoints.length > MAX_DATA_POINTS) {
          dataPoints = dataPoints.slice(-MAX_DATA_POINTS);
        }

        // Calculate session duration from first data point
        const firstPoint = dataPoints[0];
        const sessionDuration = firstPoint
          ? Math.floor((now.getTime() - new Date(firstPoint.timestamp).getTime()) / 1000)
          : 0;

        return {
          sessions: {
            ...state.sessions,
            [sessionId]: {
              ...(existingSession || {
                sessionId,
                eventId,
                agentStatus: null,
                currentAnomaly: null,
                pendingIntervention: null,
                interventionHistory: [],
              }),
              sessionId,
              eventId,
              currentScore: data.score,
              dataPoints,
              lastUpdated: now,
              totalDataPoints: (existingSession?.totalDataPoints || 0) + 1,
              sessionDuration,
            },
          },
        };
      }),

      updateAgentStatus: (sessionId, status) => set((state) => {
        const existingSession = state.sessions[sessionId];
        if (!existingSession) return state;

        return {
          sessions: {
            ...state.sessions,
            [sessionId]: {
              ...existingSession,
              agentStatus: status,
              lastUpdated: new Date(),
            },
          },
        };
      }),

      setAnomaly: (sessionId, anomaly) => set((state) => {
        const existingSession = state.sessions[sessionId];
        if (!existingSession) return state;

        return {
          sessions: {
            ...state.sessions,
            [sessionId]: {
              ...existingSession,
              currentAnomaly: anomaly,
              lastUpdated: new Date(),
            },
          },
        };
      }),

      setPendingIntervention: (sessionId, intervention) => set((state) => {
        const existingSession = state.sessions[sessionId];
        if (!existingSession) return state;

        return {
          sessions: {
            ...state.sessions,
            [sessionId]: {
              ...existingSession,
              pendingIntervention: intervention,
              lastUpdated: new Date(),
            },
          },
        };
      }),

      addInterventionToHistory: (sessionId, intervention) => set((state) => {
        const existingSession = state.sessions[sessionId];
        if (!existingSession) return state;

        let history = [...existingSession.interventionHistory, intervention];

        // Trim to max size
        if (history.length > MAX_INTERVENTION_HISTORY) {
          history = history.slice(-MAX_INTERVENTION_HISTORY);
        }

        return {
          sessions: {
            ...state.sessions,
            [sessionId]: {
              ...existingSession,
              interventionHistory: history,
              lastUpdated: new Date(),
            },
          },
        };
      }),

      clearSession: (sessionId) => set((state) => {
        const { [sessionId]: _, ...remainingSessions } = state.sessions;
        return { sessions: remainingSessions };
      }),

      clearAllSessions: () => set({ sessions: {}, activeSessionId: null }),

      getSessionState: (sessionId) => get().sessions[sessionId] || null,
    }),
    {
      name: 'engagement-conductor-storage',
      storage: createJSONStorage(() => localStorage), // Use localStorage to persist across refreshes
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
      }),
      // Handle date serialization
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Rehydrate dates from strings
          Object.values(state.sessions).forEach((session) => {
            session.lastUpdated = new Date(session.lastUpdated);
            session.dataPoints = session.dataPoints.map((dp) => ({
              ...dp,
              timestamp: new Date(dp.timestamp),
            }));
            if (session.currentAnomaly) {
              session.currentAnomaly.timestamp = new Date(session.currentAnomaly.timestamp);
            }
            if (session.pendingIntervention) {
              session.pendingIntervention.timestamp = new Date(session.pendingIntervention.timestamp);
            }
            session.interventionHistory = session.interventionHistory.map((i) => ({
              ...i,
              timestamp: new Date(i.timestamp),
            }));
            if (session.agentStatus) {
              session.agentStatus.lastUpdate = new Date(session.agentStatus.lastUpdate);
            }
          });
        }
      },
    }
  )
);
