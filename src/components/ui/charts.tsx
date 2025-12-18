// src/components/ui/charts.tsx
// Data visualization components for analytics and dashboards
"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ============================================
// Bar Chart
// ============================================

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  height?: number;
  showValues?: boolean;
  showLabels?: boolean;
  animate?: boolean;
  orientation?: "vertical" | "horizontal";
  className?: string;
}

export function BarChart({
  data,
  height = 200,
  showValues = true,
  showLabels = true,
  animate = true,
  orientation = "vertical",
  className,
}: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  if (orientation === "horizontal") {
    return (
      <div className={cn("space-y-3", className)}>
        {data.map((item, index) => (
          <div key={item.label} className="space-y-1">
            {showLabels && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                {showValues && (
                  <span className="font-medium">{item.value}</span>
                )}
              </div>
            )}
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  item.color || "bg-primary"
                )}
                initial={animate ? { width: 0 } : undefined}
                animate={{ width: `${(item.value / maxValue) * 100}%` }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex items-end gap-2", className)} style={{ height }}>
      {data.map((item, index) => (
        <div
          key={item.label}
          className="flex-1 flex flex-col items-center gap-2"
        >
          {showValues && (
            <span className="text-xs font-medium">{item.value}</span>
          )}
          <motion.div
            className={cn(
              "w-full rounded-t-md",
              item.color || "bg-primary"
            )}
            initial={animate ? { height: 0 } : undefined}
            animate={{
              height: `${(item.value / maxValue) * (height - 40)}px`,
            }}
            transition={{
              duration: 0.8,
              delay: index * 0.1,
              ease: "easeOut",
            }}
          />
          {showLabels && (
            <span className="text-xs text-muted-foreground truncate w-full text-center">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================
// Line Sparkline
// ============================================

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  showDots?: boolean;
  animate?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  width = 120,
  height = 40,
  strokeColor = "hsl(var(--primary))",
  fillColor = "hsl(var(--primary) / 0.1)",
  strokeWidth = 2,
  showDots = false,
  animate = true,
  className,
}: SparklineProps) {
  if (data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * width,
    y: height - ((value - min) / range) * height,
  }));

  const pathData = points
    .map((point, index) =>
      index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
    )
    .join(" ");

  const areaPathData = `${pathData} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      className={cn("overflow-visible", className)}
    >
      {/* Fill area */}
      <motion.path
        d={areaPathData}
        fill={fillColor}
        initial={animate ? { opacity: 0 } : undefined}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      {/* Line */}
      <motion.path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animate ? { pathLength: 0 } : undefined}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      {/* Dots */}
      {showDots &&
        points.map((point, index) => (
          <motion.circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={3}
            fill={strokeColor}
            initial={animate ? { scale: 0 } : undefined}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
          />
        ))}
    </svg>
  );
}

// ============================================
// Donut Chart
// ============================================

interface DonutChartData {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  size?: number;
  strokeWidth?: number;
  animate?: boolean;
  showLegend?: boolean;
  centerContent?: React.ReactNode;
  className?: string;
}

export function DonutChart({
  data,
  size = 160,
  strokeWidth = 20,
  animate = true,
  showLegend = true,
  centerContent,
  className,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedOffset = 0;

  return (
    <div className={cn("flex items-center gap-6", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          {/* Data segments */}
          {data.map((item, index) => {
            const segmentLength = (item.value / total) * circumference;
            const offset = accumulatedOffset;
            accumulatedOffset += segmentLength;

            return (
              <motion.circle
                key={item.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeLinecap="round"
                initial={
                  animate
                    ? { strokeDashoffset: circumference }
                    : { strokeDashoffset: circumference - segmentLength }
                }
                animate={{
                  strokeDashoffset: circumference - segmentLength,
                }}
                style={{
                  strokeDashoffset: circumference - offset - segmentLength,
                  transform: `rotate(${(offset / circumference) * 360}deg)`,
                  transformOrigin: "center",
                }}
                transition={{
                  duration: 1,
                  delay: index * 0.2,
                  ease: "easeOut",
                }}
              />
            );
          })}
        </svg>
        {/* Center content */}
        {centerContent && (
          <div className="absolute inset-0 flex items-center justify-center">
            {centerContent}
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="space-y-2">
          {data.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium ml-auto">
                {Math.round((item.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// Progress Stats
// ============================================

interface ProgressStatProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
  className?: string;
}

export function ProgressStat({
  label,
  value,
  max = 100,
  color = "bg-primary",
  showPercentage = true,
  size = "md",
  animate = true,
  className,
}: ProgressStatProps) {
  const percentage = Math.round((value / max) * 100);

  const heights = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        {showPercentage && <span className="font-medium">{percentage}%</span>}
      </div>
      <div className={cn("bg-muted rounded-full overflow-hidden", heights[size])}>
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={animate ? { width: 0 } : undefined}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ============================================
// Mini Stats Grid
// ============================================

interface MiniStatItem {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
}

interface MiniStatsGridProps {
  items: MiniStatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function MiniStatsGrid({
  items,
  columns = 4,
  className,
}: MiniStatsGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 rounded-lg bg-muted/50 border border-border/50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{item.label}</span>
            {item.icon && (
              <span className="text-muted-foreground">{item.icon}</span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{item.value}</span>
            {item.change !== undefined && (
              <span
                className={cn(
                  "text-xs font-medium",
                  item.change > 0 && "text-green-500",
                  item.change < 0 && "text-red-500",
                  item.change === 0 && "text-muted-foreground"
                )}
              >
                {item.change > 0 ? "+" : ""}
                {item.change}%
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================
// Trend Indicator
// ============================================

interface TrendIndicatorProps {
  value: number;
  suffix?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TrendIndicator({
  value,
  suffix = "%",
  size = "md",
  className,
}: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;

  const sizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-medium",
        sizes[size],
        isPositive && "text-green-500",
        isNegative && "text-red-500",
        !isPositive && !isNegative && "text-muted-foreground",
        className
      )}
    >
      {isPositive && (
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 2L10 7H2L6 2Z" />
        </svg>
      )}
      {isNegative && (
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 10L2 5H10L6 10Z" />
        </svg>
      )}
      {isPositive && "+"}
      {value}
      {suffix}
    </span>
  );
}

// ============================================
// Activity Timeline
// ============================================

interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: React.ReactNode;
  color?: string;
}

interface ActivityTimelineProps {
  items: ActivityItem[];
  className?: string;
}

export function ActivityTimeline({ items, className }: ActivityTimelineProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex gap-3"
        >
          {/* Timeline dot and line */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-white",
                item.color || "bg-primary"
              )}
            >
              {item.icon || (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
            {index < items.length - 1 && (
              <div className="w-px h-full bg-border mt-2" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-4">
            <p className="font-medium">{item.title}</p>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {item.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {item.timestamp}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================
// Comparison Bar
// ============================================

interface ComparisonBarProps {
  label1: string;
  value1: number;
  label2: string;
  value2: number;
  color1?: string;
  color2?: string;
  animate?: boolean;
  className?: string;
}

export function ComparisonBar({
  label1,
  value1,
  label2,
  value2,
  color1 = "bg-primary",
  color2 = "bg-muted-foreground/50",
  animate = true,
  className,
}: ComparisonBarProps) {
  const total = value1 + value2;
  const percent1 = (value1 / total) * 100;
  const percent2 = (value2 / total) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm">
        <span>
          <span className="text-muted-foreground">{label1}: </span>
          <span className="font-medium">{value1}</span>
        </span>
        <span>
          <span className="text-muted-foreground">{label2}: </span>
          <span className="font-medium">{value2}</span>
        </span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden flex">
        <motion.div
          className={cn("h-full", color1)}
          initial={animate ? { width: 0 } : undefined}
          animate={{ width: `${percent1}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <motion.div
          className={cn("h-full", color2)}
          initial={animate ? { width: 0 } : undefined}
          animate={{ width: `${percent2}%` }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
