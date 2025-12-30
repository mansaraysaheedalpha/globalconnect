
import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";

export interface TicketSummary {
  eventId: string;
  totalTicketTypes: number;
  totalCapacity: number;
  totalSold: number;
  totalRevenue: {
    amount: number;
    currency: string;
    formatted: string;
  };
  ticketTypeStats: Array<{
    ticketTypeId: string;
    ticketTypeName: string;
    quantitySold: number;
    quantityAvailable: number;
    revenue: {
      amount: number;
      currency: string;
      formatted: string;
    };
    percentageSold: number;
  }>;
  salesToday: number;
  salesThisWeek: number;
  salesThisMonth: number;
  revenueToday: { formatted: string };
  revenueThisWeek: { formatted: string };
  revenueThisMonth: { formatted: string };
}

export const useTicketMetrics = (eventId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [ticketSummary, setTicketSummary] = useState<TicketSummary | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    if (!eventId || !token) {
      return;
    }

    const realtimeUrl =
      process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";

    const newSocket = io(realtimeUrl, {
      auth: { token: `Bearer ${token}` },
      query: { eventId },
      transports: ["websocket"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      newSocket.emit("ticket.metrics.join", (response: { success: boolean }) => {
        if (response.success) {
          setIsJoined(true);
        }
      });
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      setIsJoined(false);
    });

    newSocket.on("ticket.metrics.update", (data: TicketSummary) => {
      setTicketSummary(data);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [eventId, token]);

  return { isConnected, isJoined, ticketSummary };
};