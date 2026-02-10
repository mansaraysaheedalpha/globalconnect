import React, { useState, useCallback } from 'react';
import { useEngagementStream } from '../hooks/useEngagementStream';
import { useInterventions } from '../hooks/useInterventions';
import { useAgentState } from '../hooks/useAgentState';
import { EngagementChart } from './EngagementChart';
import { InterventionSuggestion } from './InterventionSuggestion';
import { AgentActivityFeed } from './AgentActivityFeed';
import { AgentModeToggle, AgentMode } from './AgentModeToggle';
import { AgentStatus } from './AgentStatus';
import { DecisionExplainer } from './DecisionExplainer';
import { OnboardingTour, defaultTourSteps, useOnboardingTour } from './OnboardingTour';
import { ChartSkeleton, ErrorState } from './LoadingStates';
import { exportInterventionsAsCSV, exportInterventionsAsJSON } from '../utils/exportReports';
import { useEngagementSocket } from '../context/SocketContext';
import styles from './EngagementDashboard.module.css';

interface EngagementDashboardProps {
  sessionId: string;
  eventId: string;
  enabled?: boolean;
}

export const EngagementDashboard: React.FC<EngagementDashboardProps> = ({
  sessionId,
  eventId,
  enabled = true,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [modeChangeError, setModeChangeError] = useState<string | null>(null);

  const {
    currentEngagement,
    engagementHistory,
    latestAnomaly,
    isConnected,
    error,
    totalDataPoints,
    sessionDuration,
  } = useEngagementStream({ sessionId, eventId, enabled });

  const {
    pendingIntervention,
    interventionHistory,
    isLoading: interventionsLoading,
    approveIntervention,
    dismissIntervention,
  } = useInterventions({ sessionId, eventId, enabled });

  const {
    agentMode,
    agentStatus,
    currentDecision,
    lastActivity,
    confidenceScore,
    setAgentMode,
    isChangingMode,
  } = useAgentState({ sessionId, eventId, enabled });

  const { showTour, completeTour, skipTour } = useOnboardingTour();

  // Get socket connection state from context (provided by EngagementSocketProvider)
  const {
    isConnected: socketConnected,
    connectionState,
    error: socketError,
    reconnectAttempts,
    manualReconnect,
  } = useEngagementSocket();

  // Handle mode change with error handling
  const handleModeChange = useCallback(async (mode: AgentMode) => {
    setModeChangeError(null);
    try {
      await setAgentMode(mode);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change agent mode';
      setModeChangeError(errorMessage);
      // Auto-clear error after 5 seconds
      setTimeout(() => setModeChangeError(null), 5000);
    }
  }, [setAgentMode]);

  // Export handlers
  const handleExportCSV = () => {
    const exportData = interventionHistory.map(i => ({
      timestamp: i.timestamp,
      type: i.type,
      confidence: i.confidence || 0,
      status: i.status,
      reasoning: i.reasoning || '',
      generationMethod: i.params?.generation_method,
      latency: i.params?.latency_ms,
    }));
    exportInterventionsAsCSV(exportData);
    setShowExportMenu(false);
  };

  const handleExportJSON = () => {
    const exportData = interventionHistory.map(i => ({
      timestamp: i.timestamp,
      type: i.type,
      confidence: i.confidence || 0,
      status: i.status,
      reasoning: i.reasoning || '',
      generationMethod: i.params?.generation_method,
      latency: i.params?.latency_ms,
    }));
    exportInterventionsAsJSON(exportData);
    setShowExportMenu(false);
  };

  // Combine connection states: socket context + engagement stream
  const effectiveConnected = socketConnected && isConnected;
  const effectiveError = socketError || error;
  const isReconnecting = connectionState === 'reconnecting';

  // Connection status indicator with reconnecting state
  const renderConnectionStatus = () => {
    const getStatusText = () => {
      if (effectiveConnected) return 'Live';
      if (isReconnecting) return `Reconnecting${reconnectAttempts > 0 ? ` (${reconnectAttempts})` : '...'}`;
      if (connectionState === 'connecting') return 'Connecting...';
      return 'Disconnected';
    };

    const getStatusClass = () => {
      if (effectiveConnected) return styles.connected;
      if (isReconnecting || connectionState === 'connecting') return styles.connecting;
      return styles.disconnected;
    };

    return (
      <div className={styles.statusBar}>
        <div className={styles.statusIndicator}>
          <span className={`${styles.statusDot} ${getStatusClass()}`} />
          <span className={styles.statusText}>{getStatusText()}</span>
        </div>
        {!effectiveConnected && connectionState === 'error' && (
          <button
            onClick={manualReconnect}
            className={styles.reconnectButton}
            style={{
              marginLeft: '8px',
              padding: '4px 8px',
              fontSize: '12px',
              cursor: 'pointer',
              borderRadius: '4px',
              border: '1px solid #ccc',
              background: '#f5f5f5',
            }}
          >
            Retry
          </button>
        )}
        {engagementHistory.length > 0 && (
          <span className={styles.dataPoints}>
            {engagementHistory.length} data points
          </span>
        )}
      </div>
    );
  };

  // Error state (only show if not reconnecting)
  if (effectiveError && connectionState === 'error') {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Engagement Conductor</h2>
          {renderConnectionStatus()}
        </div>
        <ErrorState
          title="Connection Error"
          message={effectiveError}
          retry={manualReconnect}
        />
      </div>
    );
  }

  // Loading/connecting state
  if (!effectiveConnected && !effectiveError && (connectionState === 'connecting' || isReconnecting)) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Engagement Conductor</h2>
          {renderConnectionStatus()}
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  // Main dashboard
  return (
    <div className={styles.container}>
      {/* Onboarding Tour */}
      {showTour && (
        <OnboardingTour
          steps={defaultTourSteps}
          onComplete={completeTour}
          onSkip={skipTour}
        />
      )}

      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>Engagement Conductor</h2>
          <div className={styles.headerActions}>
            <div className={styles.exportDropdown}>
              <button
                className={styles.exportButton}
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                📥 Export
              </button>
              {showExportMenu && (
                <div className={styles.exportMenu}>
                  <button onClick={handleExportCSV}>Export as CSV</button>
                  <button onClick={handleExportJSON}>Export as JSON</button>
                </div>
              )}
            </div>
          </div>
        </div>
        {renderConnectionStatus()}
      </div>

      {/* Agent Controls Section - Phase 5 */}
      <div className={styles.agentControlsSection}>
        <AgentModeToggle
          currentMode={agentMode}
          onModeChange={handleModeChange}
          disabled={isChangingMode}
        />
        <AgentStatus
          status={agentStatus}
          lastActivity={lastActivity || undefined}
          confidenceScore={confidenceScore || undefined}
        />
      </div>

      {/* Mode Change Error Alert */}
      {modeChangeError && (
        <div className={styles.alertCard} style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
          <div className={styles.alertIcon}>❌</div>
          <div className={styles.alertContent}>
            <h4 style={{ color: '#991b1b' }}>Failed to Change Mode</h4>
            <p style={{ color: '#b91c1c' }}>{modeChangeError}</p>
          </div>
          <button
            onClick={() => setModeChangeError(null)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem',
              color: '#991b1b'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Anomaly Alert */}
      {latestAnomaly && (
        <div
          className={`${styles.alertCard} ${
            latestAnomaly.severity === 'CRITICAL'
              ? styles.alertCritical
              : styles.alertWarning
          }`}
        >
          <div className={styles.alertIcon}>
            {latestAnomaly.severity === 'CRITICAL' ? '🚨' : '⚠️'}
          </div>
          <div className={styles.alertContent}>
            <h4>
              {latestAnomaly.severity} - {latestAnomaly.type.replace(/_/g, ' ')}
            </h4>
            <p>
              {latestAnomaly.type === 'MASS_EXIT'
                ? `High user exit rate detected. Current engagement: ${(latestAnomaly.currentEngagement * 100).toFixed(1)}%`
                : `Engagement dropped to ${(latestAnomaly.currentEngagement * 100).toFixed(1)}% (expected: ${(latestAnomaly.expectedEngagement * 100).toFixed(1)}%)`
              }
            </p>
          </div>
        </div>
      )}

      {/* Intervention Suggestion */}
      {pendingIntervention && (
        <InterventionSuggestion
          intervention={pendingIntervention}
          onApprove={approveIntervention}
          onDismiss={dismissIntervention}
        />
      )}

      {/* Decision Explainer - Phase 5 */}
      {currentDecision && (
        <DecisionExplainer
          interventionType={currentDecision.interventionType}
          confidence={currentDecision.confidence}
          reasoning={currentDecision.reasoning}
          context={currentDecision.context}
          historicalPerformance={currentDecision.historicalPerformance}
          autoApproved={currentDecision.autoApproved}
        />
      )}

      {/* Engagement Score Card */}
      <div className={styles.scoreCard}>
        <div className={styles.scoreLabel}>Current Engagement</div>
        <div className={styles.scoreValue}>
          {(currentEngagement * 100).toFixed(1)}%
        </div>
        <div className={styles.scoreSubtext}>
          {currentEngagement >= 0.7
            ? '🔥 High Engagement'
            : currentEngagement >= 0.5
            ? '👍 Good Engagement'
            : currentEngagement >= 0.3
            ? '⚠️ Low Engagement'
            : '🚨 Critical - Attention Needed'}
        </div>
      </div>

      {/* Engagement Chart */}
      <div className={styles.chartCard}>
        <h3 className={styles.cardTitle}>Engagement Trend (Last 5 Minutes)</h3>
        <EngagementChart data={engagementHistory} height={300} />
      </div>

      {/* Signal Cards Grid */}
      <div className={styles.signalsGrid}>
        {/* Chat Activity */}
        <div className={styles.signalCard}>
          <div className={styles.signalHeader}>
            <span className={styles.signalIcon}>💬</span>
            <span className={styles.signalLabel}>Chat Activity</span>
          </div>
          <div className={styles.signalValue}>
            {engagementHistory.length > 0
              ? engagementHistory[engagementHistory.length - 1].signals.chat_msgs_per_min.toFixed(1)
              : '--'}
          </div>
          <div className={styles.signalSubtext}>msgs/min</div>
        </div>

        {/* Active Users */}
        <div className={styles.signalCard}>
          <div className={styles.signalHeader}>
            <span className={styles.signalIcon}>👥</span>
            <span className={styles.signalLabel}>Active Users</span>
          </div>
          <div className={styles.signalValue}>
            {engagementHistory.length > 0
              ? engagementHistory[engagementHistory.length - 1].signals.active_users
              : '--'}
          </div>
          <div className={styles.signalSubtext}>participants</div>
        </div>

        {/* Poll Participation */}
        <div className={styles.signalCard}>
          <div className={styles.signalHeader}>
            <span className={styles.signalIcon}>📊</span>
            <span className={styles.signalLabel}>Poll Participation</span>
          </div>
          <div className={styles.signalValue}>
            {engagementHistory.length > 0
              ? `${(engagementHistory[engagementHistory.length - 1].signals.poll_participation * 100).toFixed(0)}%`
              : '--'}
          </div>
          <div className={styles.signalSubtext}>participation rate</div>
        </div>

        {/* Reactions */}
        <div className={styles.signalCard}>
          <div className={styles.signalHeader}>
            <span className={styles.signalIcon}>❤️</span>
            <span className={styles.signalLabel}>Reactions</span>
          </div>
          <div className={styles.signalValue}>
            {engagementHistory.length > 0
              ? engagementHistory[engagementHistory.length - 1].signals.reactions_per_min.toFixed(1)
              : '--'}
          </div>
          <div className={styles.signalSubtext}>reactions/min</div>
        </div>
      </div>

      {/* Agent Activity Feed */}
      <AgentActivityFeed
        interventions={interventionHistory}
        isLoading={interventionsLoading}
      />

      {/* Info Footer */}
      <div className={styles.infoFooter}>
        <p>
          Session ID: <code>{sessionId}</code>
        </p>
        <p>
          Event ID: <code>{eventId}</code>
        </p>
      </div>
    </div>
  );
};
