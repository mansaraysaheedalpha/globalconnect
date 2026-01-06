import React from 'react';
import styles from './AgentStatus.module.css';

export type AgentStatusType =
  | 'MONITORING'
  | 'ANOMALY_DETECTED'
  | 'WAITING_APPROVAL'
  | 'INTERVENING'
  | 'LEARNING'
  | 'IDLE';

interface AgentStatusProps {
  status: AgentStatusType;
  lastActivity?: string; // ISO timestamp
  confidenceScore?: number; // 0-1
}

interface StatusConfig {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  pulseColor?: string;
}

const STATUS_CONFIGS: Record<AgentStatusType, StatusConfig> = {
  MONITORING: {
    label: 'Monitoring',
    icon: '👁️',
    color: '#059669',
    bgColor: '#d1fae5',
    pulseColor: '#10b981'
  },
  ANOMALY_DETECTED: {
    label: 'Anomaly Detected',
    icon: '⚠️',
    color: '#dc2626',
    bgColor: '#fee2e2',
    pulseColor: '#ef4444'
  },
  WAITING_APPROVAL: {
    label: 'Waiting for Approval',
    icon: '⏳',
    color: '#d97706',
    bgColor: '#fef3c7',
    pulseColor: '#f59e0b'
  },
  INTERVENING: {
    label: 'Intervening',
    icon: '🎯',
    color: '#7c3aed',
    bgColor: '#ede9fe',
    pulseColor: '#8b5cf6'
  },
  LEARNING: {
    label: 'Learning',
    icon: '🧠',
    color: '#0891b2',
    bgColor: '#cffafe',
    pulseColor: '#06b6d4'
  },
  IDLE: {
    label: 'Idle',
    icon: '💤',
    color: '#6b7280',
    bgColor: '#f3f4f6'
  }
};

/**
 * AgentStatus - Shows current agent state
 *
 * Displays the agent's current status with appropriate icon, color, and animations.
 * Shows confidence score when available.
 */
export const AgentStatus: React.FC<AgentStatusProps> = ({
  status,
  lastActivity,
  confidenceScore
}) => {
  const config = STATUS_CONFIGS[status];

  const formatLastActivity = (isoTimestamp: string): string => {
    const now = new Date();
    const activityTime = new Date(isoTimestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffSecs = Math.floor(diffMs / 1000);

    if (diffSecs < 60) return `${diffSecs}s ago`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  const shouldPulse = ['MONITORING', 'ANOMALY_DETECTED', 'WAITING_APPROVAL', 'INTERVENING'].includes(
    status
  );

  return (
    <div className={styles.container}>
      <div className={styles.statusBar}>
        <div className={styles.statusMain}>
          <div
            className={`${styles.statusDot} ${shouldPulse ? styles.pulse : ''}`}
            style={{
              backgroundColor: config.color,
              boxShadow: shouldPulse
                ? `0 0 0 0 ${config.pulseColor}`
                : 'none'
            }}
          />
          <span className={styles.statusIcon}>{config.icon}</span>
          <span className={styles.statusLabel} style={{ color: config.color }}>
            {config.label}
          </span>
        </div>

        {lastActivity && (
          <span className={styles.lastActivity}>
            {formatLastActivity(lastActivity)}
          </span>
        )}
      </div>

      {confidenceScore !== undefined && (
        <div className={styles.confidenceBar}>
          <div className={styles.confidenceLabel}>
            <span>Confidence</span>
            <span className={styles.confidenceValue}>
              {Math.round(confidenceScore * 100)}%
            </span>
          </div>
          <div className={styles.confidenceTrack}>
            <div
              className={styles.confidenceFill}
              style={{
                width: `${confidenceScore * 100}%`,
                backgroundColor: config.color
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
