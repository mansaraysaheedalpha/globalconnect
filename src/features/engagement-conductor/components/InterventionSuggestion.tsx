import React from 'react';
import { Intervention } from '../types/intervention';
import { AIBadge } from './AIBadge';
import styles from './InterventionSuggestion.module.css';

interface InterventionSuggestionProps {
  intervention: Intervention;
  onApprove: (interventionId: string) => void;
  onDismiss: (interventionId: string) => void;
}

export const InterventionSuggestion: React.FC<InterventionSuggestionProps> = ({
  intervention,
  onApprove,
  onDismiss,
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'POLL':
        return '📊';
      case 'CHAT_PROMPT':
        return '💬';
      case 'NOTIFICATION':
        return '🔔';
      case 'GAMIFICATION':
        return '🎮';
      default:
        return '🤖';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'POLL':
        return 'Poll Question';
      case 'CHAT_PROMPT':
        return 'Chat Prompt';
      case 'NOTIFICATION':
        return 'Notification';
      case 'GAMIFICATION':
        return 'Gamification';
      default:
        return 'Intervention';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return styles.confidenceHigh;
    if (confidence >= 0.6) return styles.confidenceMedium;
    return styles.confidenceLow;
  };

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.icon}>{getTypeIcon(intervention.type)}</span>
          <h3 className={styles.title}>Agent Recommendation</h3>
          <span className={`${styles.confidence} ${getConfidenceColor(intervention.confidence)}`}>
            {formatConfidence(intervention.confidence)} confidence
          </span>
        </div>
        <div className={styles.subtitleRow}>
          <span className={styles.typeLabel}>{getTypeLabel(intervention.type)}</span>
          {intervention.params.generation_method && (
            <AIBadge
              model={intervention.params.generation_method}
              latency={intervention.params.latency_ms}
            />
          )}
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.reasoning}>
          <span className={styles.reasoningLabel}>Why:</span>
          <p className={styles.reasoningText}>{intervention.reasoning}</p>
        </div>

        {intervention.type === 'POLL' && intervention.params.question && (
          <div className={styles.preview}>
            <span className={styles.previewLabel}>Question Preview:</span>
            <p className={styles.previewQuestion}>{intervention.params.question}</p>
            {intervention.params.options && (
              <ul className={styles.previewOptions}>
                {intervention.params.options.map((option: string, index: number) => (
                  <li key={index}>{option}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {intervention.type === 'CHAT_PROMPT' && intervention.params.prompt && (
          <div className={styles.preview}>
            <span className={styles.previewLabel}>Message Preview:</span>
            <p className={styles.previewPrompt}>{intervention.params.prompt}</p>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.button} ${styles.dismissButton}`}
          onClick={() => onDismiss(intervention.id)}
        >
          Dismiss
        </button>
        <button
          className={`${styles.button} ${styles.approveButton}`}
          onClick={() => onApprove(intervention.id)}
        >
          Approve &amp; Execute
        </button>
      </div>

      <div className={styles.note}>
        <span className={styles.noteIcon}>ℹ️</span>
        <span className={styles.noteText}>
          In autonomous mode, interventions are executed automatically. This is manual approval mode.
        </span>
      </div>
    </div>
  );
};
