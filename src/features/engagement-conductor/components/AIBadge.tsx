import React from 'react';
import styles from './AIBadge.module.css';

interface AIBadgeProps {
  model?: 'sonnet' | 'haiku' | 'template';
  latency?: number;
  className?: string;
}

export const AIBadge: React.FC<AIBadgeProps> = ({
  model = 'sonnet',
  latency,
  className = '',
}) => {
  const getModelLabel = () => {
    switch (model) {
      case 'sonnet':
        return 'AI Generated (Sonnet 4.5)';
      case 'haiku':
        return 'AI Generated (Haiku)';
      case 'template':
        return 'Template-based';
      default:
        return 'AI Generated';
    }
  };

  const getModelIcon = () => {
    switch (model) {
      case 'sonnet':
        return '🤖';
      case 'haiku':
        return '⚡';
      case 'template':
        return '📚';
      default:
        return '🤖';
    }
  };

  const getBadgeClass = () => {
    switch (model) {
      case 'sonnet':
        return styles.badgeSonnet;
      case 'haiku':
        return styles.badgeHaiku;
      case 'template':
        return styles.badgeTemplate;
      default:
        return styles.badgeSonnet;
    }
  };

  return (
    <span className={`${styles.badge} ${getBadgeClass()} ${className}`}>
      <span className={styles.icon}>{getModelIcon()}</span>
      <span className={styles.label}>{getModelLabel()}</span>
      {latency && (
        <span className={styles.latency}>
          {latency < 1000 ? `${latency.toFixed(0)}ms` : `${(latency / 1000).toFixed(1)}s`}
        </span>
      )}
    </span>
  );
};
