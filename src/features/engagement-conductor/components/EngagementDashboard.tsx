import React, { useState, useEffect } from 'react';
import { useEngagementStream } from '../hooks/useEngagementStream';
import { useInterventions } from '../hooks/useInterventions';
import { useAgentState } from '../hooks/useAgentState';
import { EngagementChart } from './EngagementChart';
import { InterventionSuggestion } from './InterventionSuggestion';
import { AgentActivityFeed } from './AgentActivityFeed';
import { AgentModeToggle } from './AgentModeToggle';
import { AgentStatus } from './AgentStatus';
import { DecisionExplainer } from './DecisionExplainer';
import { OnboardingTour, defaultTourSteps, useOnboardingTour } from './OnboardingTour';
import { ChartSkeleton, ErrorState, EmptyState } from './LoadingStates';
import { exportInterventionsAsCSV, exportInterventionsAsJSON } from '../utils/exportReports';
import { initializeSocket, disconnectSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/auth.store';
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

  const {
    currentEngagement,
    engagementHistory,
    latestAnomaly,
    isConnected,
    error,
  } = useEngagementStream({ sessionId, enabled });

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

  const { showTour, completeTour, skipTour, resetTour } = useOnboardingTour();

  // Get auth token from store
  const authToken = useAuthStore((state) => state.token);

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
    // Initialize socket with auth token from store
    const socket = initializeSocket(authToken || undefined);

    console.log('[EngagementDashboard] WebSocket initialized for session:', sessionId);

    // Cleanup on unmount
    return () => {
      // Don't disconnect socket here as it might be used by other components
      // disconnectSocket();
    };
  }, [sessionId, authToken]);

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

  // Connection status indicator
  const renderConnectionStatus = () => (
    <div className={styles.statusBar}>
      <div className={styles.statusIndicator}>
        <span
          className={`${styles.statusDot} ${
            isConnected ? styles.connected : styles.disconnected
          }`}
        />
        <span className={styles.statusText}>
          {isConnected ? 'Live' : 'Disconnected'}
        </span>
      </div>
      {engagementHistory.length > 0 && (
        <span className={styles.dataPoints}>
          {engagementHistory.length} data points
        </span>
      )}
    </div>
  );

  // Error state
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Engagement Conductor</h2>
          {renderConnectionStatus()}
        </div>
        <ErrorState
          title="Connection Error"
          message={`${error}. Make sure the real-time service is running on port 3002`}
          retry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Loading state
  if (!isConnected && !error) {
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
          onModeChange={setAgentMode}
          disabled={isChangingMode}
        />
        <AgentStatus
          status={agentStatus}
          lastActivity={lastActivity || undefined}
          confidenceScore={confidenceScore || undefined}
        />
      </div>

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
              Engagement dropped to {(latestAnomaly.currentEngagement * 100).toFixed(1)}%
              (expected: {(latestAnomaly.expectedEngagement * 100).toFixed(1)}%)
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
