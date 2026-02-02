/**
 * Hook for managing agent state (mode, status, decisions)
 */

import { useState, useEffect, useCallback } from 'react';
import { useEngagementSocket } from '../context/SocketContext';
import { getAgentServiceUrl } from '@/lib/env';
import { useAuthStore } from '@/store/auth.store';
import type { AgentMode } from '../components/AgentModeToggle';
import type { AgentStatusType } from '../components/AgentStatus';
import type { DecisionContext } from '../components/DecisionExplainer';

export interface AgentDecision {
  interventionType: string;
  confidence: number;
  reasoning: string;
  context: DecisionContext;
  historicalPerformance?: {
    successRate: number;
    totalAttempts: number;
    isExploring: boolean;
  };
  autoApproved: boolean;
  timestamp: string;
}

interface UseAgentStateProps {
  sessionId: string;
  eventId: string;
  enabled?: boolean;
}

interface UseAgentStateReturn {
  agentMode: AgentMode;
  agentStatus: AgentStatusType;
  currentDecision: AgentDecision | null;
  lastActivity: string | null;
  confidenceScore: number | null;
  setAgentMode: (mode: AgentMode) => Promise<void>;
  isChangingMode: boolean;
}

export function useAgentState({
  sessionId,
  eventId,
  enabled = true,
}: UseAgentStateProps): UseAgentStateReturn {
  const [agentMode, setAgentModeState] = useState<AgentMode>('MANUAL');
  const [agentStatus, setAgentStatus] = useState<AgentStatusType>('IDLE');
  const [currentDecision, setCurrentDecision] = useState<AgentDecision | null>(null);
  const [lastActivity, setLastActivity] = useState<string | null>(null);
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);
  const [isChangingMode, setIsChangingMode] = useState(false);

  // Get socket from EngagementSocketProvider context
  // This must be called unconditionally (React hooks rules)
  let socketContext: ReturnType<typeof useEngagementSocket> | null = null;
  try {
    socketContext = useEngagementSocket();
  } catch {
    // Hook is being used outside of EngagementSocketProvider - will use null socket
  }

  const socket = socketContext?.socket;
  const subscribeToSession = socketContext?.subscribeToSession;

  // Load persisted mode from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem(`agent_mode_${sessionId}`) as AgentMode;
    if (savedMode) {
      setAgentModeState(savedMode);
    }
  }, [sessionId]);

  // Connect to WebSocket for real-time agent state updates
  useEffect(() => {
    if (!enabled || !socket) {
      if (!socket) {
        console.warn('[useAgentState] No socket available - make sure component is wrapped in EngagementSocketProvider');
      }
      return;
    }

    // Subscribe to agent events for this session (uses context's queuing mechanism)
    if (subscribeToSession) {
      subscribeToSession(sessionId);
    }

    // Listen for agent.status events
    const handleStatusUpdate = (data: { status: AgentStatusType }) => {
      setAgentStatus(data.status);
      setLastActivity(new Date().toISOString());
    };

    // Listen for agent.decision events
    const handleDecision = (data: { decision: AgentDecision }) => {
      setCurrentDecision(data.decision);
      setConfidenceScore(data.decision.confidence);
      setAgentStatus('WAITING_APPROVAL');
    };

    // Listen for agent.intervention.executed events
    const handleInterventionExecuted = () => {
      // Clear current decision after execution
      setCurrentDecision(null);
      setConfidenceScore(null);
      setAgentStatus('MONITORING');
      setLastActivity(new Date().toISOString());
    };

    // Register event listeners
    socket.on('agent.status', handleStatusUpdate);
    socket.on('agent.decision', handleDecision);
    socket.on('agent.intervention.executed', handleInterventionExecuted);

    // Cleanup on unmount - only remove local listeners
    // The SocketContext handles unsubscription when provider unmounts
    return () => {
      socket.off('agent.status', handleStatusUpdate);
      socket.off('agent.decision', handleDecision);
      socket.off('agent.intervention.executed', handleInterventionExecuted);
    };
  }, [sessionId, enabled, socket, subscribeToSession]);

  // Update agent status based on intervention state
  useEffect(() => {
    if (currentDecision) {
      if (currentDecision.autoApproved) {
        setAgentStatus('INTERVENING');
      } else {
        setAgentStatus('WAITING_APPROVAL');
      }
    }
  }, [currentDecision]);

  // Change agent mode (calls backend API with retry logic)
  const setAgentMode = useCallback(async (mode: AgentMode, retries = 2) => {
    setIsChangingMode(true);

    const attemptModeChange = async (attemptsLeft: number): Promise<void> => {
      try {
        const agentServiceUrl = getAgentServiceUrl();
        const token = useAuthStore.getState().token;

        const response = await fetch(`${agentServiceUrl}/api/v1/agent/sessions/${sessionId}/mode`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ mode })
        });

        if (!response.ok) {
          // Try to parse error message from response body
          let errorMessage = response.statusText;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.detail || errorMessage;
          } catch {
            // Ignore JSON parse errors
          }

          // Check for specific error types
          if (response.status === 401 || response.status === 403) {
            throw new Error('Authentication required. Please log in again.');
          } else if (response.status === 400) {
            throw new Error(`Invalid request: ${errorMessage}`);
          } else if (response.status >= 500 && attemptsLeft > 0) {
            // Server error - retry with exponential backoff
            const delay = (retries - attemptsLeft + 1) * 1000;
            console.warn(`[useAgentState] Server error, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return attemptModeChange(attemptsLeft - 1);
          }

          throw new Error(`Failed to change agent mode: ${errorMessage}`);
        }

        // Update local state on success
        setAgentModeState(mode);
        localStorage.setItem(`agent_mode_${sessionId}`, mode);

        console.log(`[useAgentState] Agent mode changed to ${mode} for session ${sessionId}`);
      } catch (error) {
        // Network error - retry if attempts left
        if (error instanceof TypeError && error.message.includes('fetch') && attemptsLeft > 0) {
          const delay = (retries - attemptsLeft + 1) * 1000;
          console.warn(`[useAgentState] Network error, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return attemptModeChange(attemptsLeft - 1);
        }
        throw error;
      }
    };

    try {
      await attemptModeChange(retries);
    } catch (error) {
      console.error('[useAgentState] Failed to change agent mode:', error);
      throw error;
    } finally {
      setIsChangingMode(false);
    }
  }, [sessionId]);

  return {
    agentMode,
    agentStatus,
    currentDecision,
    lastActivity,
    confidenceScore,
    setAgentMode,
    isChangingMode,
  };
}
