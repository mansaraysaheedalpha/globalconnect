// src/components/ui/empty-states.tsx
// Comprehensive empty state components with illustrations
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Users,
  MessageSquare,
  Bell,
  Search,
  FileText,
  Inbox,
  FolderOpen,
  Image,
  Mail,
  BarChart3,
  Settings,
  Sparkles,
  Plus,
  ArrowRight,
} from "lucide-react";

// ============================================
// Base Empty State Component
// ============================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  children,
  size = "md",
  className,
}: EmptyStateProps) {
  const sizes = {
    sm: {
      icon: "w-12 h-12",
      iconInner: "h-6 w-6",
      title: "text-base",
      description: "text-sm",
      padding: "p-6",
    },
    md: {
      icon: "w-16 h-16",
      iconInner: "h-8 w-8",
      title: "text-lg",
      description: "text-sm",
      padding: "p-8",
    },
    lg: {
      icon: "w-20 h-20",
      iconInner: "h-10 w-10",
      title: "text-xl",
      description: "text-base",
      padding: "p-12",
    },
  };

  const s = sizes[size];

  return (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        s.padding,
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {icon && (
        <motion.div
          className={cn(
            "rounded-full bg-muted flex items-center justify-center mb-4",
            s.icon
          )}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        >
          <div className={cn("text-muted-foreground", s.iconInner)}>
            {icon}
          </div>
        </motion.div>
      )}

      <h3 className={cn("font-semibold text-foreground mb-2", s.title)}>
        {title}
      </h3>

      {description && (
        <p className={cn("text-muted-foreground max-w-sm mb-6", s.description)}>
          {description}
        </p>
      )}

      {children}

      {(action || secondaryAction) && (
        <div className="flex flex-wrap gap-3 justify-center mt-4">
          {action && (
            <Button onClick={action.onClick} className="gap-2">
              {action.icon || <Plus className="h-4 w-4" />}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// Pre-built Empty States
// ============================================

// No Events
export function NoEventsEmpty({
  onCreateEvent,
  className,
}: {
  onCreateEvent?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      icon={<Calendar className="h-full w-full" />}
      title="No events yet"
      description="Create your first event to get started organizing unforgettable experiences."
      action={
        onCreateEvent
          ? { label: "Create Event", onClick: onCreateEvent }
          : undefined
      }
      className={className}
    />
  );
}

// No Attendees
export function NoAttendeesEmpty({
  onInvite,
  className,
}: {
  onInvite?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      icon={<Users className="h-full w-full" />}
      title="No attendees yet"
      description="Share your event to start getting registrations and building your audience."
      action={
        onInvite ? { label: "Invite Attendees", onClick: onInvite } : undefined
      }
      className={className}
    />
  );
}

// No Messages
export function NoMessagesEmpty({
  onStartConversation,
  className,
}: {
  onStartConversation?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      icon={<MessageSquare className="h-full w-full" />}
      title="No messages yet"
      description="Start a conversation to connect with other attendees and speakers."
      action={
        onStartConversation
          ? { label: "Start Conversation", onClick: onStartConversation }
          : undefined
      }
      className={className}
    />
  );
}

// No Notifications
export function NoNotificationsEmpty({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={<Bell className="h-full w-full" />}
      title="All caught up!"
      description="You have no new notifications. We'll let you know when something important happens."
      size="sm"
      className={className}
    />
  );
}

// No Search Results
export function NoSearchResultsEmpty({
  query,
  onClear,
  className,
}: {
  query?: string;
  onClear?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      icon={<Search className="h-full w-full" />}
      title="No results found"
      description={
        query
          ? `We couldn't find anything matching "${query}". Try different keywords or filters.`
          : "Try adjusting your search or filters to find what you're looking for."
      }
      secondaryAction={onClear ? { label: "Clear search", onClick: onClear } : undefined}
      className={className}
    />
  );
}

// No Sessions
export function NoSessionsEmpty({
  onAddSession,
  className,
}: {
  onAddSession?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      icon={<FileText className="h-full w-full" />}
      title="No sessions scheduled"
      description="Add sessions to create an engaging agenda for your attendees."
      action={
        onAddSession
          ? { label: "Add Session", onClick: onAddSession }
          : undefined
      }
      className={className}
    />
  );
}

// Empty Inbox
export function EmptyInboxEmpty({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={<Inbox className="h-full w-full" />}
      title="Inbox zero!"
      description="You've processed all your items. Nice work!"
      size="sm"
      className={className}
    />
  );
}

// No Files
export function NoFilesEmpty({
  onUpload,
  className,
}: {
  onUpload?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      icon={<FolderOpen className="h-full w-full" />}
      title="No files uploaded"
      description="Upload presentations, documents, or images to share with attendees."
      action={
        onUpload ? { label: "Upload Files", onClick: onUpload } : undefined
      }
      className={className}
    />
  );
}

// No Analytics
export function NoAnalyticsEmpty({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={<BarChart3 className="h-full w-full" />}
      title="No data yet"
      description="Analytics will appear here once your event has some activity."
      className={className}
    />
  );
}

// Empty State with Custom Illustration
interface IllustratedEmptyStateProps extends Omit<EmptyStateProps, "icon"> {
  illustration: "events" | "messages" | "search" | "files" | "settings" | "sparkles";
}

export function IllustratedEmptyState({
  illustration,
  ...props
}: IllustratedEmptyStateProps) {
  const illustrations: Record<string, React.ReactNode> = {
    events: <EventsIllustration />,
    messages: <MessagesIllustration />,
    search: <SearchIllustration />,
    files: <FilesIllustration />,
    settings: <SettingsIllustration />,
    sparkles: <SparklesIllustration />,
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6">{illustrations[illustration]}</div>
      <EmptyState {...props} />
    </div>
  );
}

// ============================================
// SVG Illustrations
// ============================================

function EventsIllustration() {
  return (
    <motion.svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Calendar base */}
      <motion.rect
        x="20"
        y="30"
        width="80"
        height="70"
        rx="8"
        className="fill-muted stroke-muted-foreground/30"
        strokeWidth="2"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
      />
      {/* Calendar header */}
      <motion.rect
        x="20"
        y="30"
        width="80"
        height="20"
        rx="8"
        className="fill-primary/20"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      />
      {/* Calendar dots */}
      {[35, 60, 85].map((x, i) => (
        <motion.circle
          key={x}
          cx={x}
          cy="70"
          r="6"
          className="fill-muted-foreground/20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 + i * 0.1 }}
        />
      ))}
      {/* Highlight dot */}
      <motion.circle
        cx="60"
        cy="70"
        r="6"
        className="fill-primary"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      />
      {/* Hanging clips */}
      {[40, 80].map((x, i) => (
        <motion.rect
          key={x}
          x={x - 3}
          y="22"
          width="6"
          height="16"
          rx="3"
          className="fill-muted-foreground/40"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1 + i * 0.1 }}
        />
      ))}
    </motion.svg>
  );
}

function MessagesIllustration() {
  return (
    <motion.svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Message bubble 1 */}
      <motion.path
        d="M20 40 H70 Q80 40 80 50 V70 Q80 80 70 80 H35 L25 90 V80 H30 Q20 80 20 70 V50 Q20 40 30 40 Z"
        className="fill-muted stroke-muted-foreground/30"
        strokeWidth="2"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      />
      {/* Message bubble 2 */}
      <motion.path
        d="M50 55 H100 Q110 55 110 65 V85 Q110 95 100 95 H65 L55 105 V95 H60 Q50 95 50 85 V65 Q50 55 60 55 Z"
        className="fill-primary/20 stroke-primary/30"
        strokeWidth="2"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      />
      {/* Dots in bubble 1 */}
      {[35, 50, 65].map((x, i) => (
        <motion.circle
          key={x}
          cx={x}
          cy="60"
          r="3"
          className="fill-muted-foreground/40"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4 + i * 0.1 }}
        />
      ))}
    </motion.svg>
  );
}

function SearchIllustration() {
  return (
    <motion.svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Magnifying glass circle */}
      <motion.circle
        cx="50"
        cy="50"
        r="30"
        className="fill-muted stroke-muted-foreground/30"
        strokeWidth="3"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      />
      {/* Handle */}
      <motion.line
        x1="72"
        y1="72"
        x2="95"
        y2="95"
        className="stroke-muted-foreground/50"
        strokeWidth="8"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      />
      {/* Question mark */}
      <motion.text
        x="50"
        y="58"
        textAnchor="middle"
        className="fill-muted-foreground/40 text-2xl font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        ?
      </motion.text>
    </motion.svg>
  );
}

function FilesIllustration() {
  return (
    <motion.svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Folder back */}
      <motion.path
        d="M15 35 H45 L55 25 H105 V95 H15 Z"
        className="fill-muted stroke-muted-foreground/30"
        strokeWidth="2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      />
      {/* Folder front */}
      <motion.path
        d="M15 45 H105 V95 Q105 100 100 100 H20 Q15 100 15 95 Z"
        className="fill-background stroke-muted-foreground/30"
        strokeWidth="2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      />
      {/* Upload arrow */}
      <motion.path
        d="M60 55 V80 M50 65 L60 55 L70 65"
        className="stroke-primary"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
      />
    </motion.svg>
  );
}

function SettingsIllustration() {
  return (
    <motion.svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Gear */}
      <motion.circle
        cx="60"
        cy="60"
        r="25"
        className="fill-muted stroke-muted-foreground/30"
        strokeWidth="2"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      {/* Inner circle */}
      <motion.circle
        cx="60"
        cy="60"
        r="10"
        className="fill-background"
      />
      {/* Gear teeth */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <motion.rect
          key={angle}
          x="56"
          y="30"
          width="8"
          height="12"
          rx="2"
          className="fill-muted stroke-muted-foreground/30"
          strokeWidth="1"
          style={{ transformOrigin: "60px 60px", transform: `rotate(${angle}deg)` }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.05 }}
        />
      ))}
    </motion.svg>
  );
}

function SparklesIllustration() {
  return (
    <motion.svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main sparkle */}
      <motion.path
        d="M60 20 L65 50 L95 55 L65 60 L60 90 L55 60 L25 55 L55 50 Z"
        className="fill-primary/30 stroke-primary"
        strokeWidth="2"
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200 }}
      />
      {/* Small sparkles */}
      {[
        { x: 30, y: 30, size: 8 },
        { x: 90, y: 35, size: 6 },
        { x: 85, y: 85, size: 10 },
        { x: 25, y: 80, size: 7 },
      ].map((spark, i) => (
        <motion.circle
          key={i}
          cx={spark.x}
          cy={spark.y}
          r={spark.size / 2}
          className="fill-primary/40"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1, 0.8, 1] }}
          transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
        />
      ))}
    </motion.svg>
  );
}
