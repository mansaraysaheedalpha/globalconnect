// src/components/features/gamification/achievement-toast.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Achievement } from "@/hooks/use-gamification";
import { Trophy, Star, Sparkles, X } from "lucide-react";

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
  autoDismissMs?: number;
  className?: string;
}

/**
 * Full-screen achievement celebration toast
 */
export const AchievementToast = ({
  achievement,
  onDismiss,
  autoDismissMs = 5000,
  className = "",
}: AchievementToastProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 500); // Wait for exit animation
      }, autoDismissMs);

      return () => clearTimeout(timer);
    }
  }, [achievement, autoDismissMs, onDismiss]);

  if (!achievement) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => {
              setIsVisible(false);
              setTimeout(onDismiss, 500);
            }}
          />

          {/* Achievement card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: "spring", damping: 15 }}
            className={cn(
              "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
              "w-[90vw] max-w-md",
              className
            )}
          >
            <div className="relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-1 shadow-2xl">
              <div className="bg-background rounded-xl p-6 text-center">
                {/* Close button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(onDismiss, 500);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Confetti/sparkles animation */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{
                        opacity: 0,
                        x: "50%",
                        y: "50%",
                        scale: 0,
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                        x: `${Math.random() * 100}%`,
                        y: `${Math.random() * 100}%`,
                        scale: [0, 1, 0],
                        rotate: Math.random() * 360,
                      }}
                      transition={{
                        duration: 2,
                        delay: Math.random() * 0.5,
                        ease: "easeOut",
                      }}
                      className="absolute"
                    >
                      <Sparkles
                        className={cn(
                          "h-4 w-4",
                          i % 3 === 0
                            ? "text-yellow-400"
                            : i % 3 === 1
                            ? "text-orange-400"
                            : "text-red-400"
                        )}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Badge icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", damping: 10 }}
                  className="relative mx-auto mb-4"
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                    {achievement.icon ? (
                      <span className="text-4xl">{achievement.icon}</span>
                    ) : (
                      <Trophy className="h-12 w-12 text-white" />
                    )}
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-4 border-dashed border-yellow-400/30"
                  />
                </motion.div>

                {/* Achievement unlocked text */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Achievement Unlocked!</span>
                    <Star className="h-4 w-4 text-yellow-500" />
                  </div>

                  <h2 className="text-2xl font-bold mb-2">
                    {achievement.badgeName}
                  </h2>

                  <p className="text-muted-foreground">
                    {achievement.description}
                  </p>
                </motion.div>

                {/* Dismiss button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6"
                >
                  <Button
                    onClick={() => {
                      setIsVisible(false);
                      setTimeout(onDismiss, 500);
                    }}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
                  >
                    Awesome!
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * Compact achievement badge for display in lists
 */
interface AchievementBadgeProps {
  achievement: Achievement;
  size?: "sm" | "md" | "lg";
  showDescription?: boolean;
  className?: string;
}

export const AchievementBadge = ({
  achievement,
  size = "md",
  showDescription = false,
  className = "",
}: AchievementBadgeProps) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-lg",
    lg: "w-16 h-16 text-2xl",
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-md",
          sizeClasses[size]
        )}
      >
        {achievement.icon ? (
          <span>{achievement.icon}</span>
        ) : (
          <Trophy className="h-1/2 w-1/2 text-white" />
        )}
      </div>

      {showDescription && (
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{achievement.badgeName}</p>
          <p className="text-sm text-muted-foreground truncate">
            {achievement.description}
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Grid display of all achievements
 */
interface AchievementsGridProps {
  achievements: Achievement[];
  emptyMessage?: string;
  className?: string;
}

export const AchievementsGrid = ({
  achievements,
  emptyMessage = "No achievements yet. Keep participating!",
  className = "",
}: AchievementsGridProps) => {
  if (achievements.length === 0) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        <Trophy className="h-12 w-12 mx-auto mb-2 opacity-30" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 gap-4", className)}>
      {achievements.map((achievement) => (
        <motion.div
          key={achievement.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
        >
          <AchievementBadge achievement={achievement} size="lg" />
          <div className="text-center">
            <p className="font-medium text-sm">{achievement.badgeName}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
