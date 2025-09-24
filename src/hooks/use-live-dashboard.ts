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
    if (!eventId || !token) return;

    // Connect to the WebSocket server, passing the eventId and auth token
    const newSocket = io("http://localhost:3002/events", {
      query: { eventId },
      auth: { token },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setIsConnected(true);
      // Once connected, tell the server we want to join the dashboard room
      newSocket.emit(
        "dashboard.join",
        (response: { success: boolean; error?: string }) => {
          if (!response.success) {
            console.error("Failed to join dashboard room:", response.error);
          } else {
            console.log(
              "Successfully joined dashboard room for event:",
              eventId
            );
          }
        }
      );
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    // This is the listener for our real-time data updates
    newSocket.on("dashboard.update", (data: LiveDashboardData) => {
      setDashboardData(data);
    });

    // Cleanup on component unmount
    return () => {
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("dashboard.update");
      newSocket.disconnect();
    };
  }, [eventId, token]);

  return { isConnected, dashboardData };
};
