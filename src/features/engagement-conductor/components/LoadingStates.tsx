import React from 'react';
import styles from './LoadingStates.module.css';

/**
 * Loading skeleton for engagement chart
 */
export const ChartSkeleton: React.FC = () => {
  return (
    <div className={styles.chartSkeleton}>
      <div className={styles.chartHeader}>
        <div className={`${styles.skeletonBox} ${styles.titleSkeleton}`} />
        <div className={`${styles.skeletonBox} ${styles.statSkeleton}`} />
      </div>
      <div className={styles.chartBody}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className={styles.barSkeleton} style={{ height: `${Math.random() * 60 + 20}%` }} />
        ))}
      </div>
    </div>
  );
};

/**
 * Loading skeleton for intervention card
 */
export const InterventionSkeleton: React.FC = () => {
  return (
    <div className={styles.interventionSkeleton}>
      <div className={styles.skeletonHeader}>
        <div className={`${styles.skeletonBox} ${styles.iconSkeleton}`} />
        <div className={styles.skeletonTextGroup}>
          <div className={`${styles.skeletonBox} ${styles.titleSkeleton}`} />
          <div className={`${styles.skeletonBox} ${styles.subtitleSkeleton}`} />
        </div>
      </div>
      <div className={`${styles.skeletonBox} ${styles.contentSkeleton}`} />
      <div className={styles.skeletonActions}>
        <div className={`${styles.skeletonBox} ${styles.buttonSkeleton}`} />
        <div className={`${styles.skeletonBox} ${styles.buttonSkeleton}`} />
      </div>
    </div>
  );
};

/**
 * Spinner loading indicator
 */
export const Spinner: React.FC<{ size?: 'small' | 'medium' | 'large' }> = ({
  size = 'medium'
}) => {
  return (
    <div className={`${styles.spinner} ${styles[`spinner-${size}`]}`}>
      <div className={styles.spinnerCircle} />
    </div>
  );
};

/**
 * Empty state component
 */
export const EmptyState: React.FC<{
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}> = ({ icon = '📊', title, description, action }) => {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{icon}</div>
      <h3 className={styles.emptyTitle}>{title}</h3>
      {description && <p className={styles.emptyDescription}>{description}</p>}
      {action && (
        <button className={styles.emptyAction} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
};

/**
 * Error state component
 */
export const ErrorState: React.FC<{
  title?: string;
  message: string;
  retry?: () => void;
}> = ({ title = 'Something went wrong', message, retry }) => {
  return (
    <div className={styles.errorState}>
      <div className={styles.errorIcon}>⚠️</div>
      <h3 className={styles.errorTitle}>{title}</h3>
      <p className={styles.errorMessage}>{message}</p>
      {retry && (
        <button className={styles.retryButton} onClick={retry}>
          Try Again
        </button>
      )}
    </div>
  );
};
