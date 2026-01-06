import React from 'react';
import { Intervention } from '../types/intervention';
import styles from './AgentActivityFeed.module.css';

interface AgentActivityFeedProps {
  interventions: Intervention[];
  isLoading?: boolean;
}

export const AgentActivityFeed: React.FC<AgentActivityFeedProps> = ({
  interventions,
  isLoading = false,
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
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getStatusBadge = (intervention: Intervention) => {
    if (intervention.outcome?.success) {
      const delta = intervention.outcome.delta;
      const sign = delta >= 0 ? '+' : '';
      return (
        <span className={`${styles.badge} ${styles.badgeSuccess}`}>
          Success {sign}{Math.round(delta * 100)}%
        </span>
      );
    }

    if (intervention.status === 'EXECUTED' || intervention.status === 'COMPLETED') {
      return <span className={`${styles.badge} ${styles.badgeExecuted}`}>Executed</span>;
    }

    if (intervention.status === 'DISMISSED') {
      return <span className={`${styles.badge} ${styles.badgeDismissed}`}>Dismissed</span>;
    }

    return <span className={`${styles.badge} ${styles.badgePending}`}>Pending</span>;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return styles.confidenceHigh;
    if (confidence >= 0.6) return styles.confidenceMedium;
    return styles.confidenceLow;
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h3 className={styles.header}>Agent Activity</h3>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Loading activity...</span>
        </div>
      </div>
    );
  }

  if (interventions.length === 0) {
    return (
      <div className={styles.container}>
        <h3 className={styles.header}>Agent Activity</h3>
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🤖</span>
          <p className={styles.emptyText}>No interventions yet</p>
          <p className={styles.emptySubtext}>
            The agent will automatically intervene when engagement drops
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h3 className={styles.header}>Agent Activity</h3>
        <span className={styles.count}>{interventions.length} actions</span>
      </div>

      <div className={styles.feed}>
        {interventions.map((intervention) => (
          <div key={intervention.id} className={styles.item}>
            <div className={styles.itemHeader}>
              <span className={styles.itemIcon}>{getTypeIcon(intervention.type)}</span>
              <div className={styles.itemMeta}>
                <span className={styles.itemType}>{getTypeLabel(intervention.type)}</span>
                <span className={styles.itemTime}>{formatTimestamp(intervention.timestamp)}</span>
              </div>
              {getStatusBadge(intervention)}
            </div>

            <div className={styles.itemBody}>
              <p className={styles.itemReasoning}>{intervention.reasoning}</p>

              <div className={styles.itemDetails}>
                <span className={`${styles.confidence} ${getConfidenceColor(intervention.confidence)}`}>
                  {Math.round(intervention.confidence * 100)}% confidence
                </span>

                {intervention.params?.question && (
                  <span className={styles.itemPreview}>
                    "{intervention.params.question.substring(0, 50)}
                    {intervention.params.question.length > 50 ? '...' : ''}"
                  </span>
                )}

                {intervention.params?.prompt && (
                  <span className={styles.itemPreview}>
                    "{intervention.params.prompt.substring(0, 50)}
                    {intervention.params.prompt.length > 50 ? '...' : ''}"
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
