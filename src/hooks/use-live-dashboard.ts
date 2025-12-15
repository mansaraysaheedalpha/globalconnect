//src/hooks/use-live-dashboard.ts

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";

// Check-in item structure (flexible to handle different backend formats)
interface CheckInItem {
  id?: string;
  name: string;
  timestamp?: string;
}

// Backend data structure (what the server sends)
// Note: Backend may send different field names, so we handle both cases
interface BackendDashboardData {
  totalMessages?: number;
  totalVotes?: number;
  pollVotes?: number;
  totalQuestions?: number;
  questionsAsked?: number;
  totalUpvotes?: number;
  questionUpvotes?: number;
  totalReactions?: number;
  reactions?: number;
  recentCheckIns?: CheckInItem[];
  liveCheckInFeed?: CheckInItem[];
}

// Frontend data structure (what we use in UI)
export interface LiveDashboardData {
  totalMessages: number;
  totalVotes: number;
  totalQuestions: number;
  totalUpvotes: number;
  totalReactions: number;
  liveCheckInFeed: Array<{ id: string; name: string; timestamp?: string }>;
}

// Transform backend data to frontend format (handles multiple field name formats)
const transformDashboardData = (data: BackendDashboardData): LiveDashboardData => {
  // Handle check-ins from either field name
  const checkIns = data.recentCheckIns || data.liveCheckInFeed || [];

  return {
    totalMessages: data.totalMessages ?? 0,
    totalVotes: data.totalVotes ?? data.pollVotes ?? 0,
    totalQuestions: data.totalQuestions ?? data.questionsAsked ?? 0,
    totalUpvotes: data.totalUpvotes ?? data.questionUpvotes ?? 0,
    totalReactions: data.totalReactions ?? data.reactions ?? 0,
    liveCheckInFeed: checkIns.map((checkIn, index) => ({
      id: checkIn.id || `checkin-${index}-${checkIn.timestamp || Date.now()}`,
      name: checkIn.name,
      timestamp: checkIn.timestamp,
    })),
  };
};

export const useLiveDashboard = (eventId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [dashboardData, setDashboardData] = useState<LiveDashboardData | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    if (!eventId || !token) {
      console.log("❌ Missing eventId or token", {
        eventId,
        hasToken: !!token,
      });
      return;
    }

    console.log("🔌 Initializing socket connection for event:", eventId);

    // Connect to the WebSocket server
    const realtimeUrl =
      process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";

    const newSocket = io(realtimeUrl, {
      auth: { token: `Bearer ${token}` },
      query: { eventId },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setIsConnected(true);
    });

    // Handle connection acknowledged (backend confirms user identity)
    // IMPORTANT: Must emit dashboard.join AFTER connectionAcknowledged, not after connect
    newSocket.on("connectionAcknowledged", (data: { userId: string }) => {
      console.log("✅ Connection acknowledged, userId:", data.userId);

      // Now join the dashboard room - this triggers the broadcast loop
      console.log("📤 Emitting dashboard.join for event:", eventId);
      newSocket.emit("dashboard.join", (response: { success: boolean; error?: string }) => {
        if (response?.success) {
          console.log("✅ Successfully joined dashboard room (acknowledged)");
          setIsJoined(true);
        } else if (response?.error) {
          console.error("❌ Failed to join dashboard room:", response.error);
        }
      });

      // Set joined optimistically after a short delay if callback isn't called
      setTimeout(() => {
        setIsJoined((current) => {
          if (!current) {
            console.log("⏱️ Setting isJoined optimistically (no callback received)");
            return true;
          }
          return current;
        });
      }, 1000);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
      setIsConnected(false);
      setIsJoined(false);
    });

    // Listen for dashboard updates
    newSocket.on("dashboard.update", (data: BackendDashboardData) => {
      console.log("📊 Dashboard update received:", data);
      setIsJoined(true);
      setDashboardData(transformDashboardData(data));
    });

    // Listen for capacity updates
    newSocket.on("dashboard.capacity.updated", (data) => {
      console.log("📊 Capacity update received:", data);
    });

    // Listen for system metrics
    newSocket.on("dashboard.metrics.updated", (data) => {
      console.log("📊 Metrics update received:", data);
    });

    // Error handling
    newSocket.on("systemError", (error: { message: string; reason: string }) => {
      console.error("❌ System error:", error.message, error.reason);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error.message);
    });

    // Cleanup on component unmount
    return () => {
      console.log("🧹 Cleaning up socket connection");
      newSocket.off("connectionAcknowledged");
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("dashboard.update");
      newSocket.off("dashboard.capacity.updated");
      newSocket.off("dashboard.metrics.updated");
      newSocket.off("systemError");
      newSocket.off("connect_error");
      newSocket.disconnect();
    };
  }, [eventId, token]);

  return { isConnected, isJoined, dashboardData, socket };
};
