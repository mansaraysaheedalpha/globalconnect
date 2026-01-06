import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { EngagementData } from '../types';
import styles from './EngagementChart.module.css';

interface EngagementChartProps {
  data: EngagementData[];
  height?: number;
}

export const EngagementChart: React.FC<EngagementChartProps> = ({
  data,
  height = 300,
}) => {
  // Transform data for recharts
  const chartData = useMemo(() => {
    return data.map((point) => {
      const timestamp = new Date(point.timestamp);
      return {
        time: timestamp.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        score: (point.score * 100).toFixed(1),
        rawScore: point.score,
        timestamp: timestamp.getTime(),
      };
    });
  }, [data]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipTime}>{data.time}</p>
          <p className={styles.tooltipScore}>
            Engagement: <strong>{data.score}%</strong>
          </p>
          <div className={styles.tooltipCategory}>
            {getEngagementEmoji(data.rawScore)} {getEngagementCategory(data.rawScore)}
          </div>
        </div>
      );
    }
    return null;
  };

  // Get engagement category
  const getEngagementCategory = (score: number): string => {
    if (score >= 0.7) return 'High';
    if (score >= 0.5) return 'Good';
    if (score >= 0.3) return 'Low';
    return 'Critical';
  };

  // Get engagement emoji
  const getEngagementEmoji = (score: number): string => {
    if (score >= 0.7) return '🔥';
    if (score >= 0.5) return '👍';
    if (score >= 0.3) return '⚠️';
    return '🚨';
  };

  // Get stroke color based on average score
  const getStrokeColor = (): string => {
    if (chartData.length === 0) return '#667eea';

    const avgScore = chartData.reduce((sum, d) => sum + parseFloat(d.score), 0) / chartData.length;

    if (avgScore >= 70) return '#10b981'; // green
    if (avgScore >= 50) return '#667eea'; // purple
    if (avgScore >= 30) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  // Empty state
  if (chartData.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📊</div>
        <p className={styles.emptyTitle}>Waiting for data...</p>
        <p className={styles.emptySubtext}>
          Chart will appear once engagement data starts flowing
        </p>
      </div>
    );
  }

  // Show at least 2 data points for meaningful visualization
  if (chartData.length === 1) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>⏳</div>
        <p className={styles.emptyTitle}>Collecting data...</p>
        <p className={styles.emptySubtext}>
          {chartData.length} data point collected. Need at least 2 for trend visualization.
        </p>
      </div>
    );
  }

  const strokeColor = getStrokeColor();

  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="time"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickLine={false}
            interval="preserveStartEnd"
          />

          <YAxis
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickLine={false}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(value) => `${value}%`}
          />

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="score"
            stroke={strokeColor}
            strokeWidth={3}
            fill="url(#colorScore)"
            animationDuration={300}
          />

          {/* Critical threshold line */}
          <Line
            type="monotone"
            dataKey={() => 30}
            stroke="#ef4444"
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div
            className={styles.legendColor}
            style={{ backgroundColor: strokeColor }}
          />
          <span className={styles.legendLabel}>Engagement Score</span>
        </div>
        <div className={styles.legendItem}>
          <div
            className={styles.legendColor}
            style={{
              backgroundColor: 'transparent',
              border: '1px dashed #ef4444',
            }}
          />
          <span className={styles.legendLabel}>Critical Threshold (30%)</span>
        </div>
      </div>

      {/* Stats summary */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Data Points</span>
          <span className={styles.statValue}>{chartData.length}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Time Range</span>
          <span className={styles.statValue}>
            {Math.floor((chartData.length * 5) / 60)}m {(chartData.length * 5) % 60}s
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Avg Score</span>
          <span className={styles.statValue}>
            {(chartData.reduce((sum, d) => sum + parseFloat(d.score), 0) / chartData.length).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};
