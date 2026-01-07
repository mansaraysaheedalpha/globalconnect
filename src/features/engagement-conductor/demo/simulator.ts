/**
 * Demo Mode Simulator
 *
 * Simulates engagement drops and agent interventions for demonstration purposes.
 * Provides a "wow moment" in ~60 seconds showing the full agent loop.
 *
 * Scenario:
 * 1. Normal engagement (70-80%)
 * 2. Sudden drop to 25% (anomaly detected)
 * 3. Agent suggests intervention
 * 4. User approves or agent auto-executes
 * 5. Engagement recovers to 65-75%
 */

export interface DemoEngagementData {
  timestamp: string;
  score: number;
  activeUsers: number;
  chatRate: number;
  pollParticipation: number;
}

export interface DemoAnomaly {
  type: 'SUDDEN_DROP' | 'GRADUAL_DECLINE' | 'MASS_EXIT';
  severity: 'WARNING' | 'CRITICAL';
  timestamp: string;
  description: string;
}

export interface DemoIntervention {
  id: string;
  type: 'POLL' | 'CHAT_PROMPT' | 'NOTIFICATION';
  confidence: number;
  reasoning: string;
  timestamp: string;
  status: 'PENDING' | 'APPROVED' | 'EXECUTED' | 'SUCCESS';
  poll?: {
    question: string;
    options: string[];
  };
}

export type DemoEventCallback = (event: {
  type: 'engagement' | 'anomaly' | 'intervention' | 'recovery' | 'complete';
  data: any;
}) => void;

export class EngagementDemoSimulator {
  private intervalId: number | null = null;
  private currentStep = 0;
  private isRunning = false;

  // Simulation parameters
  private readonly STEP_INTERVAL_MS = 2000; // 2 seconds per step
  private readonly BASELINE_SCORE = 75;
  private readonly DROP_SCORE = 25;
  private readonly RECOVERY_SCORE = 70;

  constructor(private callback: DemoEventCallback) {}

  start() {
    if (this.isRunning) {
      console.warn('Demo already running');
      return;
    }

    this.isRunning = true;
    this.currentStep = 0;
    this.runSimulation();
  }

  stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.currentStep = 0;
  }

  private runSimulation() {
    this.intervalId = window.setInterval(() => {
      this.executeStep();
      this.currentStep++;

      // Complete after all steps
      if (this.currentStep >= this.getScenario().length) {
        this.callback({
          type: 'complete',
          data: { message: 'Demo completed successfully!' }
        });
        this.stop();
      }
    }, this.STEP_INTERVAL_MS);

    // Execute first step immediately
    this.executeStep();
  }

  private executeStep() {
    const scenario = this.getScenario();
    const step = scenario[this.currentStep];

    if (!step) return;

    step.action();
  }

  private getScenario() {
    return [
      // Step 0-2: Normal engagement
      {
        name: 'Baseline 1',
        action: () => this.emitEngagement(this.BASELINE_SCORE, 45, 12, 0.65)
      },
      {
        name: 'Baseline 2',
        action: () => this.emitEngagement(this.BASELINE_SCORE + 3, 48, 14, 0.68)
      },
      {
        name: 'Baseline 3',
        action: () => this.emitEngagement(this.BASELINE_SCORE - 2, 47, 13, 0.67)
      },

      // Step 3: Start dropping
      {
        name: 'Drop begins',
        action: () => this.emitEngagement(60, 45, 8, 0.55)
      },

      // Step 4: Sudden drop (anomaly)
      {
        name: 'Sudden drop',
        action: () => {
          this.emitEngagement(this.DROP_SCORE, 38, 3, 0.2);
          this.emitAnomaly();
        }
      },

      // Step 5: Anomaly persists
      {
        name: 'Anomaly persists',
        action: () => this.emitEngagement(this.DROP_SCORE - 2, 35, 2, 0.18)
      },

      // Step 6: Agent suggests intervention
      {
        name: 'Intervention suggested',
        action: () => {
          this.emitEngagement(this.DROP_SCORE - 3, 34, 2, 0.15);
          this.emitIntervention();
        }
      },

      // Step 7: Intervention pending
      {
        name: 'Awaiting approval',
        action: () => this.emitEngagement(this.DROP_SCORE - 2, 35, 2, 0.16)
      },

      // Step 8: Intervention executed
      {
        name: 'Intervention executed',
        action: () => {
          this.emitEngagement(this.DROP_SCORE, 36, 3, 0.2);
          this.emitInterventionExecuted();
        }
      },

      // Step 9-11: Recovery begins
      {
        name: 'Recovery 1',
        action: () => this.emitEngagement(35, 40, 5, 0.3)
      },
      {
        name: 'Recovery 2',
        action: () => this.emitEngagement(50, 43, 8, 0.45)
      },
      {
        name: 'Recovery 3',
        action: () => this.emitEngagement(62, 46, 11, 0.58)
      },

      // Step 12-14: Stabilization
      {
        name: 'Stabilize 1',
        action: () => {
          this.emitEngagement(this.RECOVERY_SCORE, 48, 13, 0.65);
          this.emitRecovery();
        }
      },
      {
        name: 'Stabilize 2',
        action: () => this.emitEngagement(this.RECOVERY_SCORE + 2, 49, 14, 0.67)
      },
      {
        name: 'Stabilize 3',
        action: () => this.emitEngagement(this.RECOVERY_SCORE + 3, 50, 15, 0.7)
      }
    ];
  }

  private emitEngagement(
    score: number,
    activeUsers: number,
    chatRate: number,
    pollParticipation: number
  ) {
    const data: DemoEngagementData = {
      timestamp: new Date().toISOString(),
      score: Math.max(0, Math.min(100, score + this.randomJitter(2))),
      activeUsers: Math.max(0, activeUsers + Math.floor(this.randomJitter(3))),
      chatRate: Math.max(0, chatRate + this.randomJitter(1)),
      pollParticipation: Math.max(0, Math.min(1, pollParticipation + this.randomJitter(0.05)))
    };

    this.callback({ type: 'engagement', data });
  }

  private emitAnomaly() {
    const anomaly: DemoAnomaly = {
      type: 'SUDDEN_DROP',
      severity: 'CRITICAL',
      timestamp: new Date().toISOString(),
      description: 'Engagement dropped 65% in 10 seconds. 13 users stopped chatting.'
    };

    this.callback({ type: 'anomaly', data: anomaly });
  }

  private emitIntervention() {
    const intervention: DemoIntervention = {
      id: `demo_${Date.now()}`,
      type: 'POLL',
      confidence: 0.85,
      reasoning:
        'Detected SUDDEN_DROP anomaly with CRITICAL severity. Thompson Sampling selected POLL intervention with 85% confidence. Context: critical engagement, medium session size. Historical success rate in similar contexts: 78% (12 attempts).',
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      poll: {
        question: "Quick check: How's the presentation so far?",
        options: [
          'Great, very clear! 👍',
          'Good, but could use more examples',
          'A bit confusing, need clarification',
          'Not following, please slow down'
        ]
      }
    };

    this.callback({ type: 'intervention', data: intervention });

    // Auto-approve in demo mode after 4 seconds
    setTimeout(() => {
      intervention.status = 'APPROVED';
      this.callback({ type: 'intervention', data: { ...intervention } });
    }, 4000);
  }

  private emitInterventionExecuted() {
    const intervention: Partial<DemoIntervention> = {
      status: 'EXECUTED',
      timestamp: new Date().toISOString()
    };

    this.callback({ type: 'intervention', data: intervention });

    // Mark as success after recovery
    setTimeout(() => {
      this.callback({
        type: 'intervention',
        data: { status: 'SUCCESS', engagementDelta: '+45%' }
      });
    }, 8000);
  }

  private emitRecovery() {
    this.callback({
      type: 'recovery',
      data: {
        message: 'Engagement recovered! Poll received 42 responses.',
        beforeScore: this.DROP_SCORE,
        afterScore: this.RECOVERY_SCORE,
        improvement: this.RECOVERY_SCORE - this.DROP_SCORE
      }
    });
  }

  private randomJitter(magnitude: number): number {
    return (Math.random() - 0.5) * magnitude * 2;
  }
}

/**
 * Create and run a demo simulation
 *
 * Usage:
 *   const simulator = createDemoSimulation((event) => {
 *     console.log('Demo event:', event);
 *   });
 *   simulator.start();
 */
export function createDemoSimulation(callback: DemoEventCallback): EngagementDemoSimulator {
  return new EngagementDemoSimulator(callback);
}
