export type InterventionType = 'POLL' | 'CHAT_PROMPT' | 'NUDGE' | 'QNA_PROMOTE';

export type InterventionStatus = 'SUGGESTED' | 'APPROVED' | 'EXECUTED' | 'COMPLETED' | 'DISMISSED';

export interface Intervention {
  id: string;
  sessionId: string;
  type: InterventionType;
  status: InterventionStatus;
  confidence: number;
  reasoning: string;
  params: Record<string, any>;
  timestamp: string;
  outcome?: InterventionOutcome;
}

export interface InterventionOutcome {
  success: boolean;
  engagementBefore: number;
  engagementAfter: number;
  delta: number;
  timestamp: string;
}

export interface InterventionSuggestion {
  intervention: Intervention;
  contextKey: string;
  reasoning: string;
}
