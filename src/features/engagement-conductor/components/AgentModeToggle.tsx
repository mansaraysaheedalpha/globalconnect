import React from 'react';
import styles from './AgentModeToggle.module.css';

export type AgentMode = 'MANUAL' | 'SEMI_AUTO' | 'AUTO';

interface AgentModeToggleProps {
  currentMode: AgentMode;
  onModeChange: (mode: AgentMode) => void;
  disabled?: boolean;
}

/**
 * AgentModeToggle - Toggle between agent operating modes
 *
 * Modes:
 * - MANUAL: All interventions require human approval
 * - SEMI_AUTO: High-confidence interventions auto-execute
 * - AUTO: Fully autonomous operation
 */
export const AgentModeToggle: React.FC<AgentModeToggleProps> = ({
  currentMode,
  onModeChange,
  disabled = false
}) => {
  const modes: Array<{ value: AgentMode; label: string; description: string; icon: string }> = [
    {
      value: 'MANUAL',
      label: 'Manual',
      description: 'You approve every intervention',
      icon: '👤'
    },
    {
      value: 'SEMI_AUTO',
      label: 'Semi-Auto',
      description: 'High-confidence interventions auto-execute',
      icon: '🤝'
    },
    {
      value: 'AUTO',
      label: 'Auto',
      description: 'Fully autonomous operation',
      icon: '🤖'
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>Agent Mode</span>
        <span className={styles.currentMode}>
          {modes.find(m => m.value === currentMode)?.icon} {currentMode.replace('_', '-')}
        </span>
      </div>

      <div className={styles.modes}>
        {modes.map(mode => (
          <button
            key={mode.value}
            className={`${styles.modeButton} ${
              currentMode === mode.value ? styles.active : ''
            }`}
            onClick={() => onModeChange(mode.value)}
            disabled={disabled || currentMode === mode.value}
          >
            <div className={styles.modeIcon}>{mode.icon}</div>
            <div className={styles.modeInfo}>
              <div className={styles.modeLabel}>{mode.label}</div>
              <div className={styles.modeDescription}>{mode.description}</div>
            </div>
            {currentMode === mode.value && (
              <div className={styles.activeIndicator}>✓</div>
            )}
          </button>
        ))}
      </div>

      <div className={styles.warning}>
        {currentMode === 'AUTO' && (
          <div className={styles.warningBox}>
            <span className={styles.warningIcon}>⚠️</span>
            <span className={styles.warningText}>
              Agent is running autonomously. Interventions will execute automatically.
            </span>
          </div>
        )}
        {currentMode === 'SEMI_AUTO' && (
          <div className={styles.infoBox}>
            <span className={styles.infoIcon}>ℹ️</span>
            <span className={styles.infoText}>
              Agent will auto-approve interventions with ≥75% confidence.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
