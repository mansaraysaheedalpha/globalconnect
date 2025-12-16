// src/components/features/notifications/emergency-alert.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  EmergencyNotification,
  NotificationSeverity,
} from "@/hooks/use-notifications";
import { AlertTriangle, X, Volume2, VolumeX } from "lucide-react";

interface EmergencyAlertBannerProps {
  alert: EmergencyNotification | null;
  onDismiss: () => void;
  className?: string;
}

/**
 * Full-width emergency alert banner
 * Appears at the top of the page for critical alerts
 */
export const EmergencyAlertBanner = ({
  alert,
  onDismiss,
  className = "",
}: EmergencyAlertBannerProps) => {
  const [isMuted, setIsMuted] = useState(false);

  // Play alert sound for critical alerts
  useEffect(() => {
    if (alert && alert.severity === "critical" && !isMuted) {
      // Play alert sound (if browser allows)
      try {
        const audio = new Audio("/sounds/alert.mp3");
        audio.volume = 0.5;
        audio.play().catch(() => {
          // Browser may block autoplay
          console.log("Alert sound blocked by browser");
        });
      } catch {
        // Audio not supported
      }
    }
  }, [alert, isMuted]);

  if (!alert) return null;

  const severityStyles = getSeverityStyles(alert.severity);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-[100]",
          severityStyles.bg,
          className
        )}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div
              className={cn(
                "flex-shrink-0 p-2 rounded-full",
                severityStyles.iconBg
              )}
            >
              <AlertTriangle
                className={cn("h-5 w-5", severityStyles.iconColor)}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs font-semibold uppercase px-2 py-0.5 rounded",
                    severityStyles.badge
                  )}
                >
                  {alert.alertType || alert.severity}
                </span>
              </div>
              <p className={cn("text-sm font-medium mt-1", severityStyles.text)}>
                {alert.message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Mute button for critical alerts */}
              {alert.severity === "critical" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                  className={severityStyles.button}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              )}

              {/* Dismiss button (only for non-critical) */}
              {alert.severity !== "critical" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className={severityStyles.button}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Progress bar for auto-dismiss (non-critical) */}
          {alert.severity !== "critical" && (
            <AutoDismissProgress
              duration={15000}
              onComplete={onDismiss}
              className={severityStyles.progress}
            />
          )}
        </div>

        {/* Pulsing animation for critical alerts */}
        {alert.severity === "critical" && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 pointer-events-none border-b-4 border-red-600"
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

interface AutoDismissProgressProps {
  duration: number;
  onComplete: () => void;
  className?: string;
}

const AutoDismissProgress = ({
  duration,
  onComplete,
  className = "",
}: AutoDismissProgressProps) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = 100; // Update every 100ms
    const decrement = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - decrement;
        if (newProgress <= 0) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [duration, onComplete]);

  return (
    <div className="mt-2 h-1 bg-black/10 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: `${progress}%` }}
        className={cn("h-full", className)}
      />
    </div>
  );
};

// Helper function for severity styles
function getSeverityStyles(severity: NotificationSeverity) {
  switch (severity) {
    case "critical":
      return {
        bg: "bg-red-600",
        text: "text-white",
        iconBg: "bg-red-700",
        iconColor: "text-white",
        badge: "bg-red-800 text-white",
        button: "text-white hover:bg-red-700",
        progress: "bg-white",
      };
    case "high":
      return {
        bg: "bg-orange-500",
        text: "text-white",
        iconBg: "bg-orange-600",
        iconColor: "text-white",
        badge: "bg-orange-700 text-white",
        button: "text-white hover:bg-orange-600",
        progress: "bg-white",
      };
    case "medium":
      return {
        bg: "bg-yellow-400",
        text: "text-yellow-900",
        iconBg: "bg-yellow-500",
        iconColor: "text-yellow-900",
        badge: "bg-yellow-600 text-white",
        button: "text-yellow-900 hover:bg-yellow-500",
        progress: "bg-yellow-700",
      };
    default:
      return {
        bg: "bg-blue-500",
        text: "text-white",
        iconBg: "bg-blue-600",
        iconColor: "text-white",
        badge: "bg-blue-700 text-white",
        button: "text-white hover:bg-blue-600",
        progress: "bg-white",
      };
  }
}

/**
 * Toast-style notification for non-critical alerts
 */
interface NotificationToastProps {
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  onDismiss: () => void;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
  className?: string;
}

export const NotificationToast = ({
  title,
  message,
  type = "info",
  onDismiss,
  actionLabel,
  onAction,
  duration = 5000,
  className = "",
}: NotificationToastProps) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  const typeStyles = {
    info: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
    success: "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
    warning: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800",
    error: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={cn(
        "rounded-lg border p-4 shadow-lg",
        typeStyles[type],
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{title}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{message}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-6 w-6 p-0 flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {actionLabel && onAction && (
        <div className="mt-3">
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

/**
 * Container for stacking notification toasts
 */
interface NotificationToastContainerProps {
  children: React.ReactNode;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  className?: string;
}

export const NotificationToastContainer = ({
  children,
  position = "bottom-right",
  className = "",
}: NotificationToastContainerProps) => {
  const positionStyles = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  return (
    <div
      className={cn(
        "fixed z-50 flex flex-col gap-2 w-[380px] max-w-[calc(100vw-2rem)]",
        positionStyles[position],
        className
      )}
    >
      <AnimatePresence mode="popLayout">{children}</AnimatePresence>
    </div>
  );
};
