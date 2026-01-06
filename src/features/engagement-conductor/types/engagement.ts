export interface EngagementSignals {
  chat_msgs_per_min: number;
  poll_participation: number;
  active_users: number;
  reactions_per_min: number;
  user_leave_rate: number;
}

export interface EngagementData {
  timestamp: string;
  score: number;
  signals: EngagementSignals;
  sessionId: string;
  eventId: string;
}

export interface EngagementHistory {
  data: EngagementData[];
  latestScore: number;
  trend: 'up' | 'down' | 'stable';
}
