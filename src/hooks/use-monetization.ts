
import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { logger } from "@/lib/logger";

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";

interface AdContent {
  id: string;
  eventId: string;
  title: string;
  imageUrl: string;
}

interface OfferContent {
    id: string;
    title: string;
    description: string;
    price: number;
}

export const useMonetization = (sessionId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [ads, setAds] = useState<AdContent[]>([]);
  const [upsells, setUpsells] = useState<OfferContent[]>([]);
  const [waitlistStatus, setWaitlistStatus] = useState<string>("");
  const [connected, setConnected] = useState(false);

  // Keep sessionId in a ref so reconnect handler always has the latest value
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL, {
      query: { sessionId },
      withCredentials: true,
    });
    setSocket(newSocket);

    // Connection handlers
    const handleConnect = () => {
      logger.info("Connected to monetization socket");
      setConnected(true);
      // Join room on connect/reconnect with error callback
      newSocket.emit("join_room", `session:${sessionIdRef.current}`, (error: any) => {
        if (error) {
          logger.error("Failed to join monetization room:", error);
        }
      });
    };

    const handleDisconnect = (reason: string) => {
      logger.info("Disconnected from monetization socket", { reason });
      setConnected(false);
    };

    const handleConnectError = (error: Error) => {
      logger.error("Monetization socket connection error", error);
      setConnected(false);
    };

    const handleAdInjected = (data: AdContent) => {
      setAds((prevAds) => [...prevAds, data]);
    };

    const handleUpsellNew = (data: OfferContent) => {
      setUpsells((prevUpsells) => [...prevUpsells, data]);
    };

    const handleSpotAvailable = (data: { message: string }) => {
      setWaitlistStatus(data.message);
    };

    newSocket.on("connect", handleConnect);
    newSocket.on("disconnect", handleDisconnect);
    newSocket.on("connect_error", handleConnectError);
    newSocket.on("monetization.ad.injected", handleAdInjected);
    newSocket.on("monetization.upsell.new", handleUpsellNew);
    newSocket.on("monetization.waitlist.spot_available", handleSpotAvailable);

    return () => {
      // Clean up each specific handler to prevent listener stacking
      newSocket.off("connect", handleConnect);
      newSocket.off("disconnect", handleDisconnect);
      newSocket.off("connect_error", handleConnectError);
      newSocket.off("monetization.ad.injected", handleAdInjected);
      newSocket.off("monetization.upsell.new", handleUpsellNew);
      newSocket.off("monetization.waitlist.spot_available", handleSpotAvailable);
      newSocket.disconnect();
    };
  }, [sessionId]);

    const joinWaitlist = useCallback(() => {
        socket?.emit("monetization.waitlist.join", {
        idempotencyKey: crypto.randomUUID(),
        });
    }, [socket]);

  return { ads, upsells, waitlistStatus, joinWaitlist, connected };
};
