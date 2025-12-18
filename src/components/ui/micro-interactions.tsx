// src/components/ui/micro-interactions.tsx
// Micro-interactions and hover state utilities for world-class UX
"use client";

import React, { forwardRef, useState } from "react";
import { motion, HTMLMotionProps, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

// ============================================
// Animation Variants
// ============================================

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

// ============================================
// Interactive Card
// ============================================

interface InteractiveCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  hoverEffect?: "lift" | "glow" | "border" | "scale" | "none";
  pressEffect?: boolean;
  className?: string;
}

export const InteractiveCard = forwardRef<HTMLDivElement, InteractiveCardProps>(
  (
    {
      children,
      hoverEffect = "lift",
      pressEffect = true,
      className,
      ...props
    },
    ref
  ) => {
    const hoverEffects = {
      lift: "hover:-translate-y-1 hover:shadow-lg",
      glow: "hover:shadow-[0_0_20px_rgba(var(--primary),0.15)]",
      border: "hover:border-primary/50",
      scale: "hover:scale-[1.02]",
      none: "",
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-lg border bg-card transition-all duration-200 ease-out",
          hoverEffects[hoverEffect],
          pressEffect && "active:scale-[0.98]",
          className
        )}
        whileHover={{ transition: { duration: 0.2 } }}
        whileTap={pressEffect ? { scale: 0.98 } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
InteractiveCard.displayName = "InteractiveCard";

// ============================================
// Ripple Button Effect
// ============================================

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  rippleColor?: string;
}

export const RippleButton = forwardRef<HTMLButtonElement, RippleButtonProps>(
  ({ children, rippleColor = "rgba(255,255,255,0.3)", className, onClick, ...props }, ref) => {
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();

      setRipples((prev) => [...prev, { x, y, id }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);

      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        className={cn(
          "relative overflow-hidden",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full animate-ripple pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              backgroundColor: rippleColor,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </button>
    );
  }
);
RippleButton.displayName = "RippleButton";

// ============================================
// Hover Reveal
// ============================================

interface HoverRevealProps {
  children: React.ReactNode;
  revealContent: React.ReactNode;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}

export function HoverReveal({
  children,
  revealContent,
  direction = "up",
  className,
}: HoverRevealProps) {
  const transforms = {
    up: { initial: "translateY(100%)", hover: "translateY(0)" },
    down: { initial: "translateY(-100%)", hover: "translateY(0)" },
    left: { initial: "translateX(100%)", hover: "translateX(0)" },
    right: { initial: "translateX(-100%)", hover: "translateX(0)" },
  };

  return (
    <div className={cn("group relative overflow-hidden", className)}>
      {children}
      <div
        className="absolute inset-0 flex items-center justify-center bg-black/60 transition-transform duration-300 ease-out"
        style={{
          transform: transforms[direction].initial,
        }}
      >
        <style jsx>{`
          .group:hover > div {
            transform: ${transforms[direction].hover} !important;
          }
        `}</style>
        {revealContent}
      </div>
    </div>
  );
}

// ============================================
// Pulse Indicator
// ============================================

interface PulseIndicatorProps {
  color?: "green" | "red" | "yellow" | "blue" | "primary";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PulseIndicator({
  color = "green",
  size = "md",
  className,
}: PulseIndicatorProps) {
  const colors = {
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    blue: "bg-blue-500",
    primary: "bg-primary",
  };

  const sizes = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  return (
    <span className={cn("relative flex", sizes[size], className)}>
      <span
        className={cn(
          "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
          colors[color]
        )}
      />
      <span
        className={cn(
          "relative inline-flex h-full w-full rounded-full",
          colors[color]
        )}
      />
    </span>
  );
}

// ============================================
// Success Checkmark Animation
// ============================================

export function SuccessCheckmark({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn(
        "w-16 h-16 rounded-full bg-green-500 flex items-center justify-center",
        className
      )}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      <motion.svg
        className="w-8 h-8 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <motion.path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M5 13l4 4L19 7"
        />
      </motion.svg>
    </motion.div>
  );
}

// ============================================
// Animated Counter
// ============================================

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1,
  className,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  React.useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const endValue = value;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setDisplayValue(Math.round(startValue + (endValue - startValue) * easeOutQuart));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span className={className}>{displayValue.toLocaleString()}</span>;
}

// ============================================
// Shimmer Text (for loading text)
// ============================================

export function ShimmerText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block bg-gradient-to-r from-foreground via-muted-foreground to-foreground bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer",
        className
      )}
    >
      {children}
    </span>
  );
}

// ============================================
// Floating Action Button
// ============================================

interface FloatingActionButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  icon: React.ReactNode;
  label?: string;
  position?: "bottom-right" | "bottom-left" | "bottom-center";
  showLabel?: boolean;
}

export const FloatingActionButton = forwardRef<
  HTMLButtonElement,
  FloatingActionButtonProps
>(
  (
    {
      icon,
      label,
      position = "bottom-right",
      showLabel = false,
      className,
      ...props
    },
    ref
  ) => {
    const positions = {
      "bottom-right": "bottom-6 right-6",
      "bottom-left": "bottom-6 left-6",
      "bottom-center": "bottom-6 left-1/2 -translate-x-1/2",
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          "fixed z-50 flex items-center gap-2 rounded-full bg-primary text-primary-foreground shadow-lg",
          "h-14 px-4 hover:shadow-xl transition-shadow",
          positions[position],
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        {...props}
      >
        {icon}
        {showLabel && label && (
          <span className="font-medium">{label}</span>
        )}
      </motion.button>
    );
  }
);
FloatingActionButton.displayName = "FloatingActionButton";

// ============================================
// Progress Ring
// ============================================

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

export function ProgressRing({
  progress,
  size = 60,
  strokeWidth = 4,
  className,
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          className="text-muted"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <motion.circle
          className="text-primary"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================
// Tooltip with animation
// ============================================

interface AnimatedTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function AnimatedTooltip({
  content,
  children,
  side = "top",
  className,
}: AnimatedTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <motion.div
          className={cn(
            "absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded whitespace-nowrap",
            positions[side],
            className
          )}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.15 }}
        >
          {content}
        </motion.div>
      )}
    </div>
  );
}

// ============================================
// Skeleton Placeholder with fade
// ============================================

interface FadeContentProps {
  isLoading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function FadeContent({
  isLoading,
  skeleton,
  children,
  className,
}: FadeContentProps) {
  return (
    <div className={cn("relative", className)}>
      {isLoading ? (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {skeleton}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

// ============================================
// Loading Button with Spinner
// ============================================

interface LoadingButtonProps {
  children?: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  successText?: string;
  isSuccess?: boolean;
  variant?: "default" | "primary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      children,
      isLoading = false,
      loadingText = "Loading...",
      successText = "Success!",
      isSuccess = false,
      variant = "primary",
      size = "md",
      className,
      disabled,
      onClick,
      type = "button",
    },
    ref
  ) => {
    const variants = {
      default: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      primary: "bg-primary text-primary-foreground hover:bg-primary/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    };

    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-11 px-8 text-base",
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          isLoading && "cursor-wait",
          isSuccess && "bg-green-500 text-white hover:bg-green-500",
          className
        )}
        disabled={disabled || isLoading}
        onClick={onClick}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" />
            <span>{loadingText}</span>
          </>
        ) : isSuccess ? (
          <>
            <motion.svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </motion.svg>
            <span>{successText}</span>
          </>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);
LoadingButton.displayName = "LoadingButton";

// ============================================
// Loading Spinner
// ============================================

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizes = {
    xs: "h-3 w-3 border",
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-2",
  };

  return (
    <motion.div
      className={cn(
        "rounded-full border-current border-t-transparent",
        sizes[size],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
}

// ============================================
// Form Success State
// ============================================

interface FormSuccessProps {
  title?: string;
  message?: string;
  onClose?: () => void;
  className?: string;
}

export function FormSuccess({
  title = "Success!",
  message,
  onClose,
  className,
}: FormSuccessProps) {
  return (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-center text-center p-6",
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <SuccessCheckmark className="mb-4" />
      <motion.h3
        className="text-xl font-semibold"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h3>
      {message && (
        <motion.p
          className="text-muted-foreground mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {message}
        </motion.p>
      )}
      {onClose && (
        <motion.button
          className="mt-4 text-sm text-primary hover:underline"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Close
        </motion.button>
      )}
    </motion.div>
  );
}

// ============================================
// Form Error State
// ============================================

interface FormErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function FormError({
  title = "Something went wrong",
  message,
  onRetry,
  className,
}: FormErrorProps) {
  return (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-center text-center p-6",
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <svg
          className="w-8 h-8 text-destructive"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </motion.div>
      <motion.h3
        className="text-xl font-semibold"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h3>
      {message && (
        <motion.p
          className="text-muted-foreground mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {message}
        </motion.p>
      )}
      {onRetry && (
        <motion.button
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          onClick={onRetry}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.98 }}
        >
          Try Again
        </motion.button>
      )}
    </motion.div>
  );
}

// ============================================
// Inline Form Feedback
// ============================================

interface InlineFeedbackProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  className?: string;
}

export function InlineFeedback({ type, message, className }: InlineFeedbackProps) {
  const styles = {
    success: "bg-green-500/10 text-green-600 border-green-500/20",
    error: "bg-destructive/10 text-destructive border-destructive/20",
    warning: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    info: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  };

  const icons = {
    success: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <motion.div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm",
        styles[type],
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {icons[type]}
      <span>{message}</span>
    </motion.div>
  );
}

// ============================================
// Shake Animation (for form errors)
// ============================================

interface ShakeContainerProps {
  shake: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ShakeContainer({ shake, children, className }: ShakeContainerProps) {
  return (
    <motion.div
      className={className}
      animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Submit Button with Progress
// ============================================

interface ProgressButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  progress?: number; // 0-100
  isLoading?: boolean;
  variant?: "default" | "primary" | "outline";
}

export const ProgressButton = forwardRef<HTMLButtonElement, ProgressButtonProps>(
  (
    {
      children,
      progress = 0,
      isLoading = false,
      variant = "primary",
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: "bg-secondary text-secondary-foreground",
      primary: "bg-primary text-primary-foreground",
      outline: "border border-input bg-background",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "relative h-10 px-4 rounded-md font-medium overflow-hidden transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Progress background */}
        {isLoading && progress > 0 && (
          <motion.div
            className="absolute inset-0 bg-white/20"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading && <LoadingSpinner size="sm" />}
          {children}
        </span>
      </button>
    );
  }
);
ProgressButton.displayName = "ProgressButton";
