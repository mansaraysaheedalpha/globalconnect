/**
 * Hook for managing agent state (mode, status, decisions)
 */

import { useState, useEffect, useCallback } from 'react';
import { getSocket } from '@/lib/socket';
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

  // Connect to WebSocket for real-time agent state updates
  useEffect(() => {
    if (!enabled) return;

    // Load persisted mode from localStorage
    const savedMode = localStorage.getItem(`agent_mode_${sessionId}`) as AgentMode;
    if (savedMode) {
      setAgentModeState(savedMode);
    }

    // Get WebSocket instance
    const socket = getSocket();
    if (!socket) {
      console.warn('WebSocket not initialized. Agent state updates will not work.');
      return;
    }

    // Subscribe to agent events for this session
    socket.emit('agent:subscribe', { sessionId });

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
    const handleInterventionExecuted = (data: any) => {
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

    // Cleanup on unmount
    return () => {
      socket.off('agent.status', handleStatusUpdate);
      socket.off('agent.decision', handleDecision);
      socket.off('agent.intervention.executed', handleInterventionExecuted);
      socket.emit('agent:unsubscribe', { sessionId });
    };
  }, [sessionId, enabled]);

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

  // Change agent mode (calls backend API)
  const setAgentMode = useCallback(async (mode: AgentMode) => {
    setIsChangingMode(true);
    try {
      // Call backend API to change mode
      const agentServiceUrl = process.env.NEXT_PUBLIC_AGENT_SERVICE_URL || 'http://localhost:8003';
      const response = await fetch(`${agentServiceUrl}/api/v1/agent/sessions/${sessionId}/mode`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });

      if (!response.ok) {
        throw new Error(`Failed to change agent mode: ${response.statusText}`);
      }

      // Update local state
      setAgentModeState(mode);
      localStorage.setItem(`agent_mode_${sessionId}`, mode);

      console.log(`Agent mode changed to ${mode} for session ${sessionId}`);
    } catch (error) {
      console.error('Failed to change agent mode:', error);
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
