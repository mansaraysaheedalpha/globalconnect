import { EngagementSignals } from './engagement';

export type AnomalyType =
  | 'SUDDEN_DROP'
  | 'GRADUAL_DECLINE'
  | 'LOW_ENGAGEMENT'
  | 'MASS_EXIT'
  | 'INSUFFICIENT_DATA'
  | 'UNKNOWN';

export type AnomalySeverity = 'WARNING' | 'CRITICAL';

export interface Anomaly {
  sessionId: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  anomalyScore: number;
  currentEngagement: number;
  expectedEngagement: number;
  deviation: number;
  signals: EngagementSignals;
  timestamp: string;
}
