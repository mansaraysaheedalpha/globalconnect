// src/app/(public)/solutions/ai-conductor/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Brain,
  Zap,
  Activity,
  LineChart,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Clock,
  Play,
  Pause,
  RefreshCw,
  Bot,
  Cpu,
  Network,
  ChevronRight,
  Eye,
  Settings,
  MessageSquare,
  BarChart3,
  GitBranch,
  Layers,
  Database,
  Gauge,
} from "lucide-react";
import Link from "next/link";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

// ============================================================================
// INTERACTIVE AI MONITORING DEMO
// ============================================================================

interface EngagementDataPoint {
  time: string;
  engagement: number;
  predicted: number;
  anomaly: boolean;
  intervention?: string;
}

const interventionOptions = [
  { type: "poll", label: "Launch Interactive Poll", icon: BarChart3 },
  { type: "qa", label: "Open Q&A Session", icon: MessageSquare },
  { type: "gamification", label: "Trigger Gamification", icon: Target },
  { type: "breakout", label: "Suggest Breakout Rooms", icon: Users },
];

function LiveAIMonitoringDemo() {
  const [isRunning, setIsRunning] = useState(true);
  const [mode, setMode] = useState<"autonomous" | "supervised" | "manual">(
    "autonomous"
  );
  const [dataPoints, setDataPoints] = useState<EngagementDataPoint[]>([]);
  const [currentEngagement, setCurrentEngagement] = useState(78);
  const [anomalyDetected, setAnomalyDetected] = useState(false);
  const [interventionActive, setInterventionActive] = useState(false);
  const [interventionType, setInterventionType] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const [aiDecision, setAiDecision] = useState("");

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setDataPoints((prev) => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        // Simulate engagement fluctuations
        const baseEngagement = 75;
        const noise = Math.random() * 20 - 10;
        const trend = Math.sin(prev.length * 0.1) * 15;
        let newEngagement = Math.max(
          30,
          Math.min(100, baseEngagement + noise + trend)
        );

        // Occasionally create anomalies
        const isAnomaly = Math.random() < 0.08 && prev.length > 5;
        if (isAnomaly) {
          newEngagement = Math.max(30, newEngagement - 25);
        }

        const predicted = baseEngagement + Math.sin((prev.length + 3) * 0.1) * 15;

        setCurrentEngagement(Math.round(newEngagement));

        // Handle anomaly detection
        if (isAnomaly && mode !== "manual") {
          setAnomalyDetected(true);
          setAiThinking(true);

          setTimeout(() => {
            setAiThinking(false);
            const selectedIntervention =
              interventionOptions[Math.floor(Math.random() * interventionOptions.length)];
            setInterventionType(selectedIntervention.type);
            setAiDecision(
              `Thompson Sampling selected: ${selectedIntervention.label} (UCB: 0.${Math.floor(Math.random() * 30 + 70)})`
            );

            if (mode === "autonomous") {
              setInterventionActive(true);
              setTimeout(() => {
                setInterventionActive(false);
                setAnomalyDetected(false);
                setAiDecision("");
              }, 3000);
            }
          }, 1500);
        }

        const newPoint: EngagementDataPoint = {
          time: timeStr,
          engagement: newEngagement,
          predicted: predicted,
          anomaly: isAnomaly,
          intervention: isAnomaly ? interventionType : undefined,
        };

        const updated = [...prev, newPoint].slice(-20);
        return updated;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isRunning, mode, interventionType]);

  const maxEngagement = Math.max(
    100,
    ...dataPoints.map((d) => Math.max(d.engagement, d.predicted))
  );

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">AI Engagement Monitor</h3>
            <p className="text-cyan-400 text-sm">Real-time anomaly detection</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`p-2 rounded-lg transition-all ${
              isRunning
                ? "bg-green-500/20 text-green-400"
                : "bg-slate-700 text-slate-400"
            }`}
          >
            {isRunning ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setDataPoints([])}
            className="p-2 rounded-lg bg-slate-700 text-slate-400 hover:bg-slate-600 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2 mb-6">
        {(["autonomous", "supervised", "manual"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === m
                ? "bg-cyan-500 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Activity className="w-4 h-4" />
            Current
          </div>
          <div
            className={`text-2xl font-bold ${
              currentEngagement > 70
                ? "text-green-400"
                : currentEngagement > 50
                  ? "text-yellow-400"
                  : "text-red-400"
            }`}
          >
            {currentEngagement}%
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <TrendingUp className="w-4 h-4" />
            Trend
          </div>
          <div className="text-2xl font-bold text-cyan-400">
            {currentEngagement > 70 ? "+5.2%" : "-3.1%"}
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Shield className="w-4 h-4" />
            Interventions
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {dataPoints.filter((d) => d.anomaly).length}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-48 mb-6 bg-slate-800/30 rounded-xl p-4">
        <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={150 - (y / 100) * 150}
              x2="400"
              y2={150 - (y / 100) * 150}
              stroke="rgba(148, 163, 184, 0.1)"
              strokeWidth="1"
            />
          ))}

          {/* Predicted line (dashed) */}
          {dataPoints.length > 1 && (
            <path
              d={dataPoints
                .map((point, i) => {
                  const x = (i / (dataPoints.length - 1)) * 400;
                  const y = 150 - (point.predicted / maxEngagement) * 150;
                  return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                })
                .join(" ")}
              fill="none"
              stroke="rgba(168, 85, 247, 0.5)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}

          {/* Actual engagement line */}
          {dataPoints.length > 1 && (
            <path
              d={dataPoints
                .map((point, i) => {
                  const x = (i / (dataPoints.length - 1)) * 400;
                  const y = 150 - (point.engagement / maxEngagement) * 150;
                  return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                })
                .join(" ")}
              fill="none"
              stroke="url(#engagementGradient)"
              strokeWidth="3"
            />
          )}

          {/* Anomaly markers */}
          {dataPoints.map((point, i) => {
            if (!point.anomaly) return null;
            const x = (i / Math.max(dataPoints.length - 1, 1)) * 400;
            const y = 150 - (point.engagement / maxEngagement) * 150;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="8" fill="rgba(239, 68, 68, 0.3)" />
                <circle cx={x} cy={y} r="4" fill="#ef4444" />
              </g>
            );
          })}

          <defs>
            <linearGradient
              id="engagementGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Legend */}
        <div className="absolute top-2 right-2 flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500" />
            <span className="text-slate-400">Actual</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-purple-500/50 border-dashed" />
            <span className="text-slate-400">Predicted</span>
          </div>
        </div>
      </div>

      {/* AI Decision Panel */}
      <AnimatePresence>
        {(anomalyDetected || aiThinking || interventionActive) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-4 mb-4"
          >
            <div className="flex items-start gap-3">
              {aiThinking ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-yellow-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-yellow-400 font-medium">
                      AI Analyzing...
                    </div>
                    <div className="text-slate-400 text-sm">
                      Evaluating intervention options via Thompson Sampling
                    </div>
                  </div>
                </>
              ) : interventionActive ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <div className="text-green-400 font-medium">
                      Intervention Deployed
                    </div>
                    <div className="text-slate-400 text-sm">{aiDecision}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-red-400 font-medium">
                      Anomaly Detected
                    </div>
                    <div className="text-slate-400 text-sm mb-3">
                      Engagement dropped below threshold
                    </div>
                    {mode === "supervised" && (
                      <div className="flex gap-2 flex-wrap">
                        {interventionOptions.map((int) => (
                          <button
                            key={int.type}
                            onClick={() => {
                              setInterventionActive(true);
                              setAiDecision(`Manual: ${int.label}`);
                              setTimeout(() => {
                                setInterventionActive(false);
                                setAnomalyDetected(false);
                              }, 2000);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-all"
                          >
                            <int.icon className="w-3 h-3" />
                            {int.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode Description */}
      <div className="text-sm text-slate-500 bg-slate-800/30 rounded-lg p-3">
        {mode === "autonomous" && (
          <>
            <span className="text-cyan-400 font-medium">Autonomous Mode:</span>{" "}
            AI automatically detects anomalies and deploys optimal interventions
            without human approval.
          </>
        )}
        {mode === "supervised" && (
          <>
            <span className="text-cyan-400 font-medium">Supervised Mode:</span>{" "}
            AI suggests interventions but requires human approval before
            deployment.
          </>
        )}
        {mode === "manual" && (
          <>
            <span className="text-cyan-400 font-medium">Manual Mode:</span>{" "}
            Monitoring only - all interventions must be manually triggered by
            the operator.
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// THOMPSON SAMPLING VISUALIZATION
// ============================================================================

interface ArmData {
  name: string;
  icon: React.ElementType;
  successes: number;
  failures: number;
  color: string;
}

function ThompsonSamplingDemo() {
  const [arms, setArms] = useState<ArmData[]>([
    { name: "Interactive Poll", icon: BarChart3, successes: 45, failures: 12, color: "cyan" },
    { name: "Q&A Session", icon: MessageSquare, successes: 38, failures: 15, color: "purple" },
    { name: "Gamification", icon: Target, successes: 52, failures: 8, color: "green" },
    { name: "Breakout Rooms", icon: Users, successes: 28, failures: 22, color: "amber" },
  ]);
  const [selectedArm, setSelectedArm] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const calculateUCB = (successes: number, failures: number) => {
    const total = successes + failures;
    const mean = successes / total;
    const bonus = Math.sqrt((2 * Math.log(200)) / total);
    return Math.min(1, mean + bonus);
  };

  const simulateSelection = useCallback(() => {
    setIsSimulating(true);

    // Sample from Beta distributions
    const samples = arms.map((arm) => {
      // Simplified Beta sampling approximation
      const alpha = arm.successes + 1;
      const beta = arm.failures + 1;
      const sample =
        alpha / (alpha + beta) + (Math.random() - 0.5) * 0.3 * (1 / Math.sqrt(alpha + beta));
      return Math.max(0, Math.min(1, sample));
    });

    const maxIdx = samples.indexOf(Math.max(...samples));
    setSelectedArm(maxIdx);

    setTimeout(() => {
      // Simulate outcome
      const success = Math.random() > 0.35;
      setArms((prev) =>
        prev.map((arm, i) =>
          i === maxIdx
            ? {
                ...arm,
                successes: arm.successes + (success ? 1 : 0),
                failures: arm.failures + (success ? 0 : 1),
              }
            : arm
        )
      );
      setIsSimulating(false);
      setTimeout(() => setSelectedArm(null), 1000);
    }, 1500);
  }, [arms]);

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Thompson Sampling</h3>
            <p className="text-purple-400 text-sm">
              Multi-armed bandit optimization
            </p>
          </div>
        </div>
        <button
          onClick={simulateSelection}
          disabled={isSimulating}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isSimulating
              ? "bg-slate-700 text-slate-500 cursor-not-allowed"
              : "bg-purple-500 text-white hover:bg-purple-600"
          }`}
        >
          {isSimulating ? "Sampling..." : "Simulate Selection"}
        </button>
      </div>

      <div className="space-y-4">
        {arms.map((arm, idx) => {
          const ucb = calculateUCB(arm.successes, arm.failures);
          const total = arm.successes + arm.failures;
          const successRate = arm.successes / total;
          const IconComponent = arm.icon;

          return (
            <motion.div
              key={arm.name}
              animate={{
                scale: selectedArm === idx ? 1.02 : 1,
                borderColor:
                  selectedArm === idx
                    ? `rgb(168, 85, 247)`
                    : "rgba(148, 163, 184, 0.2)",
              }}
              className={`bg-slate-800/50 rounded-xl p-4 border-2 transition-all ${
                selectedArm === idx ? "border-purple-500" : "border-slate-700/50"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg bg-${arm.color}-500/20 flex items-center justify-center`}
                  >
                    <IconComponent className={`w-4 h-4 text-${arm.color}-400`} />
                  </div>
                  <span className="text-white font-medium">{arm.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-xs">UCB Score</div>
                  <div className="text-purple-400 font-mono font-bold">
                    {ucb.toFixed(3)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-slate-500 text-xs mb-1">Success Rate</div>
                  <div className="text-green-400 font-medium">
                    {(successRate * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs mb-1">Trials</div>
                  <div className="text-slate-300 font-medium">{total}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs mb-1">Confidence</div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, total / 0.8)}%` }}
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    />
                  </div>
                </div>
              </div>

              {selectedArm === idx && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 pt-3 border-t border-slate-700"
                >
                  <div className="flex items-center gap-2 text-purple-400 text-sm">
                    <Sparkles className="w-4 h-4" />
                    Selected for intervention
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 text-sm text-slate-500 bg-slate-800/30 rounded-lg p-3">
        <span className="text-purple-400 font-medium">How it works:</span>{" "}
        Thompson Sampling balances exploration and exploitation by sampling from
        posterior distributions, naturally favoring interventions with higher
        success rates while still exploring less-tried options.
      </div>
    </div>
  );
}

// ============================================================================
// AI ARCHITECTURE DIAGRAM
// ============================================================================

function AIArchitectureDiagram() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const layers = [
    {
      name: "Signal Collection",
      icon: Eye,
      color: "cyan",
      items: ["WebSocket Events", "User Interactions", "Session Metrics", "Content Signals"],
    },
    {
      name: "Processing Pipeline",
      icon: Cpu,
      color: "purple",
      items: ["Real-time Aggregation", "Feature Extraction", "Pattern Detection", "Anomaly Scoring"],
    },
    {
      name: "Decision Engine",
      icon: Brain,
      color: "pink",
      items: ["Thompson Sampling", "LangGraph Orchestration", "Claude Integration", "Intervention Selection"],
    },
    {
      name: "Execution Layer",
      icon: Zap,
      color: "green",
      items: ["Autonomous Actions", "Content Generation", "User Notifications", "Analytics Updates"],
    },
  ];

  return (
    <div ref={ref} className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {layers.map((layer, idx) => (
          <motion.div
            key={layer.name}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: idx * 0.15, duration: 0.5 }}
            className="relative"
          >
            {/* Connector line */}
            {idx < layers.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-slate-600 to-slate-700 z-0" />
            )}

            <div
              className={`bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-${layer.color}-500/30 p-5 h-full`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br from-${layer.color}-500 to-${layer.color}-600 flex items-center justify-center`}
                >
                  <layer.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-slate-500 text-xs">Layer {idx + 1}</div>
                  <div className="text-white font-semibold">{layer.name}</div>
                </div>
              </div>

              <div className="space-y-2">
                {layer.items.map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: idx * 0.15 + i * 0.05 + 0.3 }}
                    className="flex items-center gap-2 text-sm text-slate-400"
                  >
                    <ChevronRight className={`w-3 h-3 text-${layer.color}-400`} />
                    {item}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Data flow animation */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ delay: 0.8, duration: 1 }}
        className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 via-pink-500 to-green-500 opacity-30 -z-10"
        style={{ transformOrigin: "left" }}
      />
    </div>
  );
}

// ============================================================================
// CONTENT GENERATION DEMO
// ============================================================================

function ContentGenerationDemo() {
  const [generating, setGenerating] = useState(false);
  const [contentType, setContentType] = useState<"summary" | "poll" | "qa">("summary");
  const [generatedContent, setGeneratedContent] = useState("");
  const [model, setModel] = useState<"sonnet" | "haiku">("sonnet");

  const contentTemplates = {
    summary: `**Session Highlights - "AI in Healthcare"**

Key takeaways from the past 15 minutes:

1. **Data Privacy Concerns**: Dr. Smith emphasized HIPAA compliance as non-negotiable for any AI implementation

2. **ROI Metrics**: Early adopters seeing 40% reduction in diagnostic time

3. **Audience Questions**: Most interest around integration with existing EHR systems

_Generated by Claude ${model === "sonnet" ? "Sonnet" : "Haiku"} | Confidence: 94%_`,
    poll: `**Quick Poll: AI Adoption Readiness**

Based on the discussion, here is a relevant poll:

How prepared is your organization for AI integration?

- Already implementing (23%)
- Planning for next year (45%)
- Exploring options (28%)
- Not on our radar (4%)

_Poll generated to re-engage attendees after 12% engagement drop_`,
    qa: `**Suggested Q&A Prompt**

To stimulate discussion, consider asking:

"Given the privacy concerns raised, what would be your organization&apos;s minimum requirements before adopting an AI diagnostic tool?"

This question:
- Addresses the most discussed topic
- Encourages personal reflection
- Should generate 8-12 responses based on audience profile

_Generated to boost Q&A participation_`,
  };

  const handleGenerate = () => {
    setGenerating(true);
    setGeneratedContent("");

    const content = contentTemplates[contentType];
    let index = 0;

    const interval = setInterval(() => {
      if (index < content.length) {
        setGeneratedContent(content.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setGenerating(false);
      }
    }, 15);
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">AI Content Generation</h3>
            <p className="text-green-400 text-sm">Powered by Claude AI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as "sonnet" | "haiku")}
            className="bg-slate-800 text-slate-300 text-sm rounded-lg px-3 py-1.5 border border-slate-700"
          >
            <option value="sonnet">Claude Sonnet</option>
            <option value="haiku">Claude Haiku</option>
          </select>
        </div>
      </div>

      {/* Content Type Selector */}
      <div className="flex gap-2 mb-6">
        {(["summary", "poll", "qa"] as const).map((type) => (
          <button
            key={type}
            onClick={() => {
              setContentType(type);
              setGeneratedContent("");
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              contentType === type
                ? "bg-green-500 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {type === "summary" && "Session Summary"}
            {type === "poll" && "Generate Poll"}
            {type === "qa" && "Q&A Prompt"}
          </button>
        ))}
      </div>

      {/* Generation Area */}
      <div className="bg-slate-800/50 rounded-xl p-4 min-h-[200px] mb-4">
        {generatedContent ? (
          <div className="prose prose-invert prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-slate-300 font-sans text-sm leading-relaxed">
              {generatedContent}
              {generating && (
                <span className="inline-block w-2 h-4 bg-green-400 ml-1 animate-pulse" />
              )}
            </pre>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-slate-500">
            <Bot className="w-12 h-12 mb-3 opacity-50" />
            <p>Click Generate to create AI content</p>
          </div>
        )}
      </div>

      <button
        onClick={handleGenerate}
        disabled={generating}
        className={`w-full py-3 rounded-xl font-medium transition-all ${
          generating
            ? "bg-slate-700 text-slate-500 cursor-not-allowed"
            : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90"
        }`}
      >
        {generating ? (
          <span className="flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Generating with Claude {model === "sonnet" ? "Sonnet" : "Haiku"}...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Generate Content
          </span>
        )}
      </button>
    </div>
  );
}

// ============================================================================
// FEATURES GRID
// ============================================================================

const aiFeatures = [
  {
    icon: Eye,
    title: "Real-Time Signal Collection",
    description:
      "Continuously monitors 50+ engagement signals including reactions, chat activity, poll participation, and session attendance patterns.",
    color: "cyan",
  },
  {
    icon: Activity,
    title: "Anomaly Detection",
    description:
      "ML-powered detection identifies engagement drops, unusual patterns, and potential issues before they impact your event.",
    color: "red",
  },
  {
    icon: GitBranch,
    title: "Thompson Sampling",
    description:
      "Multi-armed bandit algorithm continuously learns which interventions work best for different situations and audiences.",
    color: "purple",
  },
  {
    icon: Bot,
    title: "Claude AI Integration",
    description:
      "Leverages Claude Sonnet for complex analysis and content generation, Haiku for fast real-time decisions.",
    color: "green",
  },
  {
    icon: Network,
    title: "LangGraph Orchestration",
    description:
      "Sophisticated agent workflow system coordinates multiple AI components for intelligent decision making.",
    color: "pink",
  },
  {
    icon: Settings,
    title: "Three Operating Modes",
    description:
      "Choose autonomous, supervised, or manual mode based on your comfort level with AI-driven decisions.",
    color: "amber",
  },
  {
    icon: Layers,
    title: "Intervention Library",
    description:
      "Pre-built intervention types including polls, Q&A prompts, gamification triggers, and content suggestions.",
    color: "blue",
  },
  {
    icon: Database,
    title: "Learning Memory",
    description:
      "System remembers what works, building institutional knowledge that improves with every event.",
    color: "indigo",
  },
];

function FeaturesGrid() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {aiFeatures.map((feature) => (
        <motion.div
          key={feature.title}
          variants={fadeInUp}
          className="group bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-cyan-500/50 transition-all duration-300"
        >
          <div
            className={`w-12 h-12 rounded-xl bg-${feature.color}-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
          >
            <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
          </div>
          <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            {feature.description}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============================================================================
// PERFORMANCE METRICS
// ============================================================================

function PerformanceMetrics() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const metrics = [
    { label: "Faster Anomaly Detection", value: "50ms", icon: Clock },
    { label: "Engagement Improvement", value: "+34%", icon: TrendingUp },
    { label: "Intervention Success Rate", value: "89%", icon: Target },
    { label: "Events Analyzed", value: "10K+", icon: BarChart3 },
  ];

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {metrics.map((metric, idx) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: idx * 0.1, duration: 0.5 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-cyan-500/20 p-6 text-center"
        >
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
            <metric.icon className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
          <div className="text-slate-400 text-sm">{metric.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================================
// TECHNICAL SPECS TABLE
// ============================================================================

function TechnicalSpecsTable() {
  const specs = [
    { category: "AI Models", spec: "Claude Sonnet 3.5 + Haiku 3.5" },
    { category: "Orchestration", spec: "LangGraph with custom workflows" },
    { category: "Learning Algorithm", spec: "Thompson Sampling (Beta-Bernoulli)" },
    { category: "Signal Processing", spec: "Real-time streaming pipeline" },
    { category: "Latency", spec: "<50ms detection, <200ms intervention" },
    { category: "Data Storage", spec: "PostgreSQL + Redis time-series" },
    { category: "API", spec: "GraphQL with real-time subscriptions" },
    { category: "Integrations", spec: "WebSocket, REST, Webhooks" },
  ];

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="p-6 border-b border-slate-700/50">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          Technical Specifications
        </h3>
      </div>
      <div className="divide-y divide-slate-700/50">
        {specs.map((spec) => (
          <div
            key={spec.category}
            className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/50 transition-colors"
          >
            <span className="text-slate-400">{spec.category}</span>
            <span className="text-white font-medium">{spec.spec}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function AIConductorPage() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-30"
          >
            <source
              src="/Futuristic_Network_Visualization_Video.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/80 to-slate-950" />
        </div>

        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-32 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={heroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium mb-8"
            >
              <Brain className="w-4 h-4" />
              AI-Powered Intelligence
              <Sparkles className="w-4 h-4" />
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-white">Engagement</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                Conductor
              </span>
            </h1>

            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Revolutionary AI that monitors engagement patterns, detects anomalies
              in real-time, and intervenes automatically to keep your audience
              captivated throughout every event.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/demo"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-cyan-500/25"
              >
                See AI in Action
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800/50 backdrop-blur border border-slate-700 text-white font-semibold rounded-xl hover:bg-slate-700/50 transition-all"
              >
                Talk to Sales
              </Link>
            </div>
          </motion.div>

          {/* Floating Stats */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
          >
            {[
              { value: "50ms", label: "Detection Speed" },
              { value: "89%", label: "Success Rate" },
              { value: "24/7", label: "Autonomous Monitoring" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-slate-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 rounded-full border-2 border-slate-600 flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ height: ["0%", "30%", "0%"] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1 bg-cyan-400 rounded-full"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Live AI Monitoring Demo Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Experience AI Monitoring{" "}
              <span className="text-cyan-400">Live</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Watch our AI detect engagement anomalies and deploy interventions in
              real-time. Toggle between modes to see how the system adapts.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            <LiveAIMonitoringDemo />
            <ThompsonSamplingDemo />
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-24 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              AI Architecture
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Four-layer intelligent pipeline processes signals, detects patterns,
              makes decisions, and executes interventions in milliseconds.
            </p>
          </motion.div>

          <AIArchitectureDiagram />
        </div>
      </section>

      {/* Content Generation Demo */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              AI Content Generation
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Generate session summaries, engagement polls, and Q&A prompts
              automatically using Claude AI models.
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <ContentGenerationDemo />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Intelligent Features
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              A comprehensive suite of AI capabilities designed to maximize
              engagement and deliver exceptional event experiences.
            </p>
          </motion.div>

          <FeaturesGrid />
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Proven Performance
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Real results from events powered by our AI Engagement Conductor.
            </p>
          </motion.div>

          <PerformanceMetrics />
        </div>
      </section>

      {/* Technical Specs */}
      <section className="py-24 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Built for Scale
              </h2>
              <p className="text-slate-400 mb-8">
                Enterprise-grade AI infrastructure designed to handle events of
                any size with sub-second response times.
              </p>

              <div className="space-y-4">
                {[
                  "Process 100K+ concurrent signals",
                  "Sub-50ms anomaly detection latency",
                  "99.99% uptime SLA",
                  "SOC 2 Type II compliant",
                  "GDPR and CCPA ready",
                ].map((item, idx) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    <span className="text-slate-300">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <TechnicalSpecsTable />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-3xl border border-cyan-500/30 p-12"
          >
            <Brain className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Elevate Your Events with AI?
            </h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
              Join leading organizations using our AI Engagement Conductor to
              deliver unforgettable event experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/demo"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all"
              >
                Request a Demo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800/50 border border-slate-700 text-white font-semibold rounded-xl hover:bg-slate-700/50 transition-all"
              >
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
