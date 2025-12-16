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
  console.log("🔄 [LiveDashboard] Transforming backend data...");
  console.log("🔄 [LiveDashboard] Input data:", JSON.stringify(data, null, 2));

  // Handle check-ins from either field name
  const checkIns = data.recentCheckIns || data.liveCheckInFeed || [];
  console.log("🔄 [LiveDashboard] Check-ins found:", checkIns.length);

  const transformed = {
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

  console.log("🔄 [LiveDashboard] Transformed data:", JSON.stringify(transformed, null, 2));
  return transformed;
};

export const useLiveDashboard = (eventId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [dashboardData, setDashboardData] = useState<LiveDashboardData | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    if (!eventId || !token) {
      console.log("🔴 [LiveDashboard] ═══════════════════════════════════════════════════════════");
      console.log("🔴 [LiveDashboard] MISSING REQUIRED PARAMS");
      console.log("🔴 [LiveDashboard] Event ID:", eventId);
      console.log("🔴 [LiveDashboard] Has Token:", !!token);
      console.log("🔴 [LiveDashboard] ═══════════════════════════════════════════════════════════");
      return;
    }

    console.log("🟡 [LiveDashboard] ═══════════════════════════════════════════════════════════");
    console.log("🟡 [LiveDashboard] INITIALIZING SOCKET CONNECTION");
    console.log("🟡 [LiveDashboard] Event ID:", eventId);
    console.log("🟡 [LiveDashboard] Token present:", !!token);
    console.log("🟡 [LiveDashboard] ═══════════════════════════════════════════════════════════");

    // Connect to the WebSocket server
    const realtimeUrl =
      process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";

    console.log("🟡 [LiveDashboard] Connecting to:", realtimeUrl);

    const newSocket = io(realtimeUrl, {
      auth: { token: `Bearer ${token}` },
      query: { eventId },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    // Log ALL incoming events for debugging
    newSocket.onAny((eventName, ...args) => {
      console.log("📨 [LiveDashboard] RECEIVED EVENT:", eventName, JSON.stringify(args, null, 2));
    });

    // Log ALL outgoing events for debugging
    newSocket.onAnyOutgoing((eventName, ...args) => {
      console.log("📤 [LiveDashboard] SENT EVENT:", eventName, JSON.stringify(args, null, 2));
    });

    newSocket.on("connect", () => {
      console.log("🟢 [LiveDashboard] ═══════════════════════════════════════════════════════════");
      console.log("🟢 [LiveDashboard] SOCKET CONNECTED");
      console.log("🟢 [LiveDashboard] Socket ID:", newSocket.id);
      console.log("🟢 [LiveDashboard] Transport:", newSocket.io.engine.transport.name);
      console.log("🟢 [LiveDashboard] ═══════════════════════════════════════════════════════════");
      setIsConnected(true);
    });

    // Handle connection acknowledged (backend confirms user identity)
    // IMPORTANT: Must emit dashboard.join AFTER connectionAcknowledged, not after connect
    newSocket.on("connectionAcknowledged", (data: { userId: string }) => {
      console.log("🟢 [LiveDashboard] ═══════════════════════════════════════════════════════════");
      console.log("🟢 [LiveDashboard] CONNECTION ACKNOWLEDGED BY SERVER");
      console.log("🟢 [LiveDashboard] User ID from server:", data.userId);
      console.log("🟢 [LiveDashboard] ═══════════════════════════════════════════════════════════");

      // Now join the dashboard room - this triggers the broadcast loop
      console.log("🟡 [LiveDashboard] EMITTING dashboard.join for event:", eventId);

      newSocket.emit("dashboard.join", (response: { success: boolean; error?: string }) => {
        console.log("🔵 [LiveDashboard] ═══════════════════════════════════════════════════════════");
        console.log("🔵 [LiveDashboard] dashboard.join CALLBACK RECEIVED");
        console.log("🔵 [LiveDashboard] Response:", JSON.stringify(response, null, 2));
        console.log("🔵 [LiveDashboard] ═══════════════════════════════════════════════════════════");

        if (response?.success) {
          console.log("🟢 [LiveDashboard] SUCCESSFULLY JOINED DASHBOARD ROOM");
          setIsJoined(true);
        } else if (response?.error) {
          console.error("🔴 [LiveDashboard] FAILED TO JOIN DASHBOARD ROOM:", response.error);
        } else {
          console.warn("⚠️ [LiveDashboard] dashboard.join callback received but no success/error field");
          console.warn("⚠️ [LiveDashboard] Full response:", response);
        }
      });

      // Set joined optimistically after a short delay if callback isn't called
      setTimeout(() => {
        setIsJoined((current) => {
          if (!current) {
            console.log("⏱️ [LiveDashboard] Setting isJoined optimistically (no callback received after 1s)");
            return true;
          }
          return current;
        });
      }, 1000);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("🔴 [LiveDashboard] ═══════════════════════════════════════════════════════════");
      console.log("🔴 [LiveDashboard] SOCKET DISCONNECTED");
      console.log("🔴 [LiveDashboard] Reason:", reason);
      console.log("🔴 [LiveDashboard] ═══════════════════════════════════════════════════════════");
      setIsConnected(false);
      setIsJoined(false);
    });

    // Listen for dashboard updates
    newSocket.on("dashboard.update", (data: BackendDashboardData) => {
      console.log("🟣 [LiveDashboard] ═══════════════════════════════════════════════════════════");
      console.log("🟣 [LiveDashboard] ✅ RECEIVED dashboard.update EVENT");
      console.log("🟣 [LiveDashboard] Raw data type:", typeof data);
      console.log("🟣 [LiveDashboard] Raw data:", JSON.stringify(data, null, 2));
      console.log("🟣 [LiveDashboard] ═══════════════════════════════════════════════════════════");

      setIsJoined(true);
      const transformed = transformDashboardData(data);
      console.log("🟣 [LiveDashboard] Setting dashboard data state...");
      setDashboardData(transformed);
      console.log("🟣 [LiveDashboard] Dashboard data state updated!");
    });

    // Listen for capacity updates
    newSocket.on("dashboard.capacity.updated", (data) => {
      console.log("🔵 [LiveDashboard] ═══════════════════════════════════════════════════════════");
      console.log("🔵 [LiveDashboard] CAPACITY UPDATE RECEIVED");
      console.log("🔵 [LiveDashboard] Data:", JSON.stringify(data, null, 2));
      console.log("🔵 [LiveDashboard] ═══════════════════════════════════════════════════════════");
    });

    // Listen for system metrics
    newSocket.on("dashboard.metrics.updated", (data) => {
      console.log("🔵 [LiveDashboard] ═══════════════════════════════════════════════════════════");
      console.log("🔵 [LiveDashboard] METRICS UPDATE RECEIVED");
      console.log("🔵 [LiveDashboard] Data:", JSON.stringify(data, null, 2));
      console.log("🔵 [LiveDashboard] ═══════════════════════════════════════════════════════════");
    });

    // Listen for check-in events
    newSocket.on("dashboard.checkin", (data) => {
      console.log("🟢 [LiveDashboard] ═══════════════════════════════════════════════════════════");
      console.log("🟢 [LiveDashboard] CHECK-IN EVENT RECEIVED");
      console.log("🟢 [LiveDashboard] Data:", JSON.stringify(data, null, 2));
      console.log("🟢 [LiveDashboard] ═══════════════════════════════════════════════════════════");
    });

    // Listen for registration events
    newSocket.on("dashboard.registration", (data) => {
      console.log("🟢 [LiveDashboard] ═══════════════════════════════════════════════════════════");
      console.log("🟢 [LiveDashboard] REGISTRATION EVENT RECEIVED");
      console.log("🟢 [LiveDashboard] Data:", JSON.stringify(data, null, 2));
      console.log("🟢 [LiveDashboard] ═══════════════════════════════════════════════════════════");
    });

    // Error handling
    newSocket.on("systemError", (error: { message: string; reason: string }) => {
      console.error("🔴 [LiveDashboard] ═══════════════════════════════════════════════════════════");
      console.error("🔴 [LiveDashboard] SYSTEM ERROR");
      console.error("🔴 [LiveDashboard] Message:", error.message);
      console.error("🔴 [LiveDashboard] Reason:", error.reason);
      console.error("🔴 [LiveDashboard] ═══════════════════════════════════════════════════════════");
    });

    newSocket.on("connect_error", (error) => {
      console.error("🔴 [LiveDashboard] ═══════════════════════════════════════════════════════════");
      console.error("🔴 [LiveDashboard] CONNECTION ERROR");
      console.error("🔴 [LiveDashboard] Error:", error.message);
      console.error("🔴 [LiveDashboard] ═══════════════════════════════════════════════════════════");
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("🟡 [LiveDashboard] ═══════════════════════════════════════════════════════════");
      console.log("🟡 [LiveDashboard] RECONNECTED");
      console.log("🟡 [LiveDashboard] Attempt number:", attemptNumber);
      console.log("🟡 [LiveDashboard] ═══════════════════════════════════════════════════════════");
    });

    newSocket.on("reconnect_attempt", (attemptNumber) => {
      console.log("🟡 [LiveDashboard] Reconnect attempt:", attemptNumber);
    });

    newSocket.on("reconnect_error", (error) => {
      console.error("🔴 [LiveDashboard] Reconnect error:", error.message);
    });

    newSocket.on("reconnect_failed", () => {
      console.error("🔴 [LiveDashboard] Reconnect failed after all attempts");
    });

    // Cleanup on component unmount
    return () => {
      console.log("🟡 [LiveDashboard] ═══════════════════════════════════════════════════════════");
      console.log("🟡 [LiveDashboard] CLEANING UP - Disconnecting socket");
      console.log("🟡 [LiveDashboard] ═══════════════════════════════════════════════════════════");
      newSocket.offAny();
      newSocket.offAnyOutgoing();
      newSocket.off("connectionAcknowledged");
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("dashboard.update");
      newSocket.off("dashboard.capacity.updated");
      newSocket.off("dashboard.metrics.updated");
      newSocket.off("dashboard.checkin");
      newSocket.off("dashboard.registration");
      newSocket.off("systemError");
      newSocket.off("connect_error");
      newSocket.off("reconnect");
      newSocket.off("reconnect_attempt");
      newSocket.off("reconnect_error");
      newSocket.off("reconnect_failed");
      newSocket.disconnect();
    };
  }, [eventId, token]);

  return { isConnected, isJoined, dashboardData, socket };
};
