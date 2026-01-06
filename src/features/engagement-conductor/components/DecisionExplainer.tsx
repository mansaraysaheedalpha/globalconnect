import React from 'react';
import styles from './DecisionExplainer.module.css';

export interface DecisionContext {
  anomalyType: string;
  severity: string;
  engagementLevel: string;
  sessionSize: string;
}

export interface HistoricalPerformance {
  successRate: number;
  totalAttempts: number;
  isExploring: boolean;
}

interface DecisionExplainerProps {
  interventionType: string;
  confidence: number; // 0-1
  reasoning: string;
  context: DecisionContext;
  historicalPerformance?: HistoricalPerformance;
  autoApproved?: boolean;
}

/**
 * DecisionExplainer - Explains why the agent made a decision
 *
 * Shows:
 * - Intervention type and confidence
 * - Reasoning (why this intervention was chosen)
 * - Context (anomaly type, engagement level, session size)
 * - Historical performance in similar contexts
 */
export const DecisionExplainer: React.FC<DecisionExplainerProps> = ({
  interventionType,
  confidence,
  reasoning,
  context,
  historicalPerformance,
  autoApproved = false
}) => {
  const confidencePercent = Math.round(confidence * 100);

  const getConfidenceColor = (conf: number): string => {
    if (conf >= 0.75) return '#059669'; // green
    if (conf >= 0.5) return '#d97706'; // orange
    return '#dc2626'; // red
  };

  const getConfidenceLabel = (conf: number): string => {
    if (conf >= 0.75) return 'High';
    if (conf >= 0.5) return 'Medium';
    return 'Low';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.title}>Decision Explanation</span>
          {autoApproved && (
            <span className={styles.autoApprovedBadge}>
              ⚡ Auto-Approved
            </span>
          )}
        </div>
      </div>

      {/* Main Decision */}
      <div className={styles.decision}>
        <div className={styles.interventionType}>
          <span className={styles.typeLabel}>Selected Intervention:</span>
          <span className={styles.typeValue}>{interventionType}</span>
        </div>

        <div className={styles.confidenceRow}>
          <div className={styles.confidenceLabel}>
            <span>Confidence: </span>
            <span
              className={styles.confidenceBadge}
              style={{
                backgroundColor: getConfidenceColor(confidence),
                color: 'white'
              }}
            >
              {getConfidenceLabel(confidence)} ({confidencePercent}%)
            </span>
          </div>
          <div className={styles.confidenceBar}>
            <div
              className={styles.confidenceFill}
              style={{
                width: `${confidencePercent}%`,
                backgroundColor: getConfidenceColor(confidence)
              }}
            />
          </div>
        </div>
      </div>

      {/* Reasoning */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>💭</span>
          <span>Reasoning</span>
        </div>
        <div className={styles.reasoningText}>{reasoning}</div>
      </div>

      {/* Context */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>🎯</span>
          <span>Context</span>
        </div>
        <div className={styles.contextGrid}>
          <div className={styles.contextItem}>
            <span className={styles.contextLabel}>Anomaly Type</span>
            <span className={styles.contextValue}>{context.anomalyType}</span>
          </div>
          <div className={styles.contextItem}>
            <span className={styles.contextLabel}>Severity</span>
            <span className={styles.contextValue}>{context.severity}</span>
          </div>
          <div className={styles.contextItem}>
            <span className={styles.contextLabel}>Engagement</span>
            <span className={styles.contextValue}>{context.engagementLevel}</span>
          </div>
          <div className={styles.contextItem}>
            <span className={styles.contextLabel}>Session Size</span>
            <span className={styles.contextValue}>{context.sessionSize}</span>
          </div>
        </div>
      </div>

      {/* Historical Performance */}
      {historicalPerformance && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📊</span>
            <span>Historical Performance</span>
          </div>
          {historicalPerformance.isExploring ? (
            <div className={styles.exploringNote}>
              <span className={styles.exploringIcon}>🔍</span>
              <span>
                Exploring new strategy - no historical data for this context yet.
              </span>
            </div>
          ) : (
            <div className={styles.performanceGrid}>
              <div className={styles.performanceStat}>
                <span className={styles.statLabel}>Success Rate</span>
                <span
                  className={styles.statValue}
                  style={{
                    color: getConfidenceColor(historicalPerformance.successRate)
                  }}
                >
                  {Math.round(historicalPerformance.successRate * 100)}%
                </span>
              </div>
              <div className={styles.performanceStat}>
                <span className={styles.statLabel}>Total Attempts</span>
                <span className={styles.statValue}>
                  {historicalPerformance.totalAttempts}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Learning Note */}
      <div className={styles.learningNote}>
        <span className={styles.learningIcon}>🧠</span>
        <span className={styles.learningText}>
          The agent will learn from this intervention's outcome and improve future decisions.
        </span>
      </div>
    </div>
  );
};
