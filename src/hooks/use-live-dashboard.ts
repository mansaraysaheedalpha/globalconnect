//src/hooks/use-live-dashboard.ts

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";

// Define the shape of the data we expect from the server
export interface LiveDashboardData {
  totalMessages: number;
  totalVotes: number;
  totalQuestions: number;
  totalUpvotes: number;
  totalReactions: number;
  liveCheckInFeed: { id: string; name: string }[];
}

export const useLiveDashboard = (eventId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [dashboardData, setDashboardData] = useState<LiveDashboardData | null>(
    null
  );
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

    // Connect to the WebSocket server, passing the eventId and auth token
    const realtimeUrl =
      process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";

    const newSocket = io(realtimeUrl, {
      query: { eventId },
      auth: { token },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setIsConnected(true);

      // Once connected, tell the server we want to join the dashboard room
      newSocket.emit(
        "dashboard.join",
        (response: { success: boolean; error?: string }) => {
          if (!response.success) {
            console.error("❌ Failed to join dashboard room:", response.error);
          } else {
            console.log(
              "✅ Successfully joined dashboard room for event:",
              eventId
            );
          }
        }
      );
    });

    newSocket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
      setIsConnected(false);
    });

    // ✅ THIS IS THE CRITICAL LISTENER
    newSocket.on("dashboard.update", (data: LiveDashboardData) => {
      console.log("📊 Dashboard update received:", data);
      setDashboardData(data);
    });

    // ✅ ADD ERROR LISTENER
    newSocket.on("systemError", (error: any) => {
      console.error("❌ System error:", error);
    });

    // ✅ ADD CONNECTION ERROR LISTENER
    newSocket.on("connect_error", (error: any) => {
      console.error("❌ Connection error:", error);
    });

    // Cleanup on component unmount
    return () => {
      console.log("🧹 Cleaning up socket connection");
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("dashboard.update");
      newSocket.off("systemError");
      newSocket.off("connect_error");
      newSocket.disconnect();
    };
  }, [eventId, token]);

  return { isConnected, dashboardData, socket };
};
