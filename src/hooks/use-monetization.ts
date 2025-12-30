
import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";

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

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL, {
      query: { sessionId },
      withCredentials: true,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to monetization socket");
    });

    newSocket.on("monetization.ad.injected", (data) => {
      setAds((prevAds) => [...prevAds, data]);
    });

    newSocket.on("monetization.upsell.new", (data) => {
        setUpsells((prevUpsells) => [...prevUpsells, data]);
    });

    newSocket.on("monetization.waitlist.spot_available", (data) => {
        setWaitlistStatus(data.message);
    });

    return () => {
      newSocket.off("connect");
      newSocket.off("monetization.ad.injected");
      newSocket.off("monetization.upsell.new");
      newSocket.off("monetization.waitlist.spot_available");
      newSocket.disconnect();
    };
  }, [sessionId]);

    const joinWaitlist = useCallback(() => {
        socket?.emit("monetization.waitlist.join", {
        idempotencyKey: crypto.randomUUID(),
        });
    }, [socket]);

  return { ads, upsells, waitlistStatus, joinWaitlist };
};