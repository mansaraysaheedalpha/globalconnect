// src/components/features/gamification/smart-nudge.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { X, Zap, MessageSquare, HelpCircle, BarChart3, Users, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

type NudgeType = "poll" | "qa" | "team" | "streak" | "chat";

interface Nudge {
  id: string;
  type: NudgeType;
  message: string;
  points: string;
  icon: React.ReactNode;
}

interface SmartNudgeProps {
  /** Whether polls are currently open and user hasn't voted */
  pollsOpen?: boolean;
  /** Whether Q&A is currently open */
  qaOpen?: boolean;
  /** Whether user is NOT in a team but teams exist */
  showTeamNudge?: boolean;
  /** Whether user's streak is about to expire */
  streakExpiring?: boolean;
  /** Whether chat is open but user hasn't sent a message recently */
  chatOpen?: boolean;
  /** Callback when user dismisses a nudge type */
  onDismiss?: (type: NudgeType) => void;
  className?: string;
}

const MIN_NUDGE_INTERVAL_MS = 180_000; // 3 minutes between nudges
const NUDGE_DISPLAY_DURATION_MS = 12_000; // Show each nudge for 12 seconds

/**
 * Context-aware gamification nudges that appear at the right moment.
 * Shows at most one nudge at a time, with cooldowns to avoid spamming.
 */
export const SmartNudge = ({
  pollsOpen = false,
  qaOpen = false,
  showTeamNudge = false,
  streakExpiring = false,
  chatOpen = false,
  onDismiss,
  className,
}: SmartNudgeProps) => {
  const [activeNudge, setActiveNudge] = useState<Nudge | null>(null);
  const dismissedTypesRef = useRef<Set<NudgeType>>(new Set());
  const lastNudgeTimeRef = useRef<number>(0);
  const autoHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissNudge = useCallback((type?: NudgeType) => {
    if (type) {
      dismissedTypesRef.current.add(type);
      onDismiss?.(type);
    }
    setActiveNudge(null);
    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
    }
  }, [onDismiss]);

  const showNudge = useCallback((nudge: Nudge) => {
    const now = Date.now();
    if (now - lastNudgeTimeRef.current < MIN_NUDGE_INTERVAL_MS) return;
    if (dismissedTypesRef.current.has(nudge.type)) return;

    lastNudgeTimeRef.current = now;
    setActiveNudge(nudge);

    // Auto-hide after duration
    if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
    autoHideTimerRef.current = setTimeout(() => {
      setActiveNudge(null);
    }, NUDGE_DISPLAY_DURATION_MS);
  }, []);

  // Evaluate nudge conditions - priority order: streak > poll > qa > team > chat
  useEffect(() => {
    if (activeNudge) return; // Don't interrupt active nudge

    const now = Date.now();
    if (now - lastNudgeTimeRef.current < MIN_NUDGE_INTERVAL_MS) return;

    if (streakExpiring && !dismissedTypesRef.current.has("streak")) {
      showNudge({
        id: `streak-${now}`,
        type: "streak",
        message: "Your streak is about to expire! Stay active to keep your multiplier",
        points: "Keep your bonus",
        icon: <Flame className="h-4 w-4 text-orange-500" />,
      });
    } else if (pollsOpen && !dismissedTypesRef.current.has("poll")) {
      showNudge({
        id: `poll-${now}`,
        type: "poll",
        message: "A poll is live! Vote now to earn points",
        points: "+1 pt",
        icon: <BarChart3 className="h-4 w-4 text-purple-500" />,
      });
    } else if (qaOpen && !dismissedTypesRef.current.has("qa")) {
      showNudge({
        id: `qa-${now}`,
        type: "qa",
        message: "Q&A is open — ask a question to earn points!",
        points: "+5 pts",
        icon: <HelpCircle className="h-4 w-4 text-blue-500" />,
      });
    } else if (showTeamNudge && !dismissedTypesRef.current.has("team")) {
      showNudge({
        id: `team-${now}`,
        type: "team",
        message: "Join a team for bonus points and compete together!",
        points: "+3 pts",
        icon: <Users className="h-4 w-4 text-green-500" />,
      });
    } else if (chatOpen && !dismissedTypesRef.current.has("chat")) {
      showNudge({
        id: `chat-${now}`,
        type: "chat",
        message: "Join the conversation! Send a message to earn points",
        points: "+1 pt",
        icon: <MessageSquare className="h-4 w-4 text-indigo-500" />,
      });
    }
  }, [pollsOpen, qaOpen, showTeamNudge, streakExpiring, chatOpen, activeNudge, showNudge]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {activeNudge && (
        <motion.div
          key={activeNudge.id}
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ duration: 0.3 }}
          className={cn("w-full overflow-hidden", className)}
        >
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {activeNudge.icon}
              <span className="text-sm truncate">{activeNudge.message}</span>
              <span className="flex items-center gap-1 text-xs font-semibold text-primary whitespace-nowrap">
                <Zap className="h-3 w-3" />
                {activeNudge.points}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 shrink-0"
              onClick={() => dismissNudge(activeNudge.type)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
