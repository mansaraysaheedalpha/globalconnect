// src/providers/expo-staff-provider.tsx
"use client";

import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import { useSponsorStore } from "@/store/sponsor.store";

interface ExpoStaffContextType {
  isLive: boolean;
  boothId: string | null;
  boothName: string | null;
  eventId: string | null;
  goLive: () => Promise<void>;
  goOffline: () => Promise<void>;
  isLoading: boolean;
  isFetchingBooth: boolean;
  boothFetchError: string | null;
  isSocketConnected: boolean;
}

const ExpoStaffContext = createContext<ExpoStaffContextType | null>(null);

export function ExpoStaffProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore();
  const { activeSponsorId } = useSponsorStore();
  const [boothData, setBoothData] = useState<{
    boothId: string;
    boothName: string;
    eventId: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingBooth, setIsFetchingBooth] = useState(false);
  const [boothFetchError, setBoothFetchError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const isLiveRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    isLiveRef.current = isLive;
  }, [isLive]);

  // Fetch booth data when sponsor is selected
  useEffect(() => {
    console.log("[ExpoStaffProvider] Effect running with:", { token: !!token, activeSponsorId });

    if (!token || !activeSponsorId) {
      console.log("[ExpoStaffProvider] Missing token or activeSponsorId, skipping fetch");
      setBoothData(null);
      setBoothFetchError(null);
      setIsLive(false);
      return;
    }

    const fetchBoothData = async () => {
      console.log("[ExpoStaffProvider] Fetching booth data for sponsor:", activeSponsorId);
      setIsFetchingBooth(true);
      setBoothFetchError(null);

      try {
        const REALTIME_SERVICE_URL = process.env.NEXT_PUBLIC_REALTIME_SERVICE_URL || "http://localhost:3002";
        let response = await fetch(
          `${REALTIME_SERVICE_URL}/api/expo/sponsor/${activeSponsorId}/booth`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("[ExpoStaffProvider] Booth API response status:", response.status);

        // Handle 403 - try to sync booth access and retry
        if (response.status === 403) {
          console.log("[ExpoStaffProvider] Got 403, attempting to sync booth access...");
          const API_BASE_URL = process.env.NEXT_PUBLIC_EVENT_LIFECYCLE_URL || "http://localhost:8000/api/v1";
          const syncResponse = await fetch(
            `${API_BASE_URL}/sponsors/sponsors/${activeSponsorId}/sync-my-booth-access`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (syncResponse.ok) {
            console.log("[ExpoStaffProvider] Booth access synced, retrying fetch...");
            // Retry the booth fetch
            response = await fetch(
              `${REALTIME_SERVICE_URL}/api/expo/sponsor/${activeSponsorId}/booth`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            console.log("[ExpoStaffProvider] Retry response status:", response.status);
          }
        }

        if (response.ok) {
          const data = await response.json();
          console.log("[ExpoStaffProvider] Booth API response data:", data);
          const { booth } = data;

          if (booth && booth.id) {
            console.log("[ExpoStaffProvider] Setting booth data:", {
              boothId: booth.id,
              boothName: booth.name,
              eventId: booth.expoHall?.eventId,
            });
            setBoothData({
              boothId: booth.id,
              boothName: booth.name,
              eventId: booth.expoHall?.eventId,
            });
            setBoothFetchError(null);

            // Check if current user is active staff (restore live status)
            if (user && booth.staffPresence) {
              const myPresence = booth.staffPresence.find(
                (staff: any) => staff.staffId === user.id
              );
              const isActive = myPresence && (
                myPresence.status === "ONLINE" ||
                myPresence.status === "BUSY" ||
                myPresence.status === "AWAY"
              );
              if (isActive) {
                console.log("[ExpoStaffProvider] Restoring live status - found active presence for current user");
                setIsLive(true);
              } else {
                console.log("[ExpoStaffProvider] No active presence found for current user");
                setIsLive(false);
              }
            }
          } else {
            console.error("[ExpoStaffProvider] No valid booth in response:", data);
            setBoothFetchError("No booth data found in response");
            setBoothData(null);
          }
        } else {
          // Handle other error statuses
          const errorMessage = response.status === 404
            ? "No expo booth found for this sponsor"
            : `Failed to fetch booth data (${response.status})`;
          console.error("[ExpoStaffProvider] API error:", errorMessage);
          setBoothFetchError(errorMessage);
          setBoothData(null);
        }
      } catch (error) {
        console.error("[ExpoStaffProvider] Failed to fetch booth data:", error);
        setBoothFetchError(error instanceof Error ? error.message : "Network error");
        setBoothData(null);
      } finally {
        setIsFetchingBooth(false);
      }
    };

    fetchBoothData();
  }, [token, activeSponsorId]);

  // Initialize socket connection when booth data is available
  useEffect(() => {
    if (!token || !boothData?.boothId || !boothData?.eventId) {
      setIsSocketConnected(false);
      return;
    }

    const REALTIME_BASE_URL = process.env.NEXT_PUBLIC_REALTIME_SERVICE_URL || "http://localhost:3002";
    const REALTIME_URL = `${REALTIME_BASE_URL}/events`; // Connect to /events namespace

    console.log("[ExpoStaffProvider] Initializing socket connection to:", REALTIME_URL);

    const socket = io(REALTIME_URL, {
      auth: { token: `Bearer ${token}` },
      query: { eventId: boothData.eventId },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", async () => {
      console.log("[ExpoStaffProvider] Socket connected, ID:", socket.id);
      setIsSocketConnected(true);

      // Auto-rejoin as staff if we were previously live
      if (isLiveRef.current && boothData) {
        console.log("[ExpoStaffProvider] Auto-rejoining as staff after reconnect");
        try {
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("Rejoin timeout")), 10000);
            socket.emit(
              "expo.booth.staff.join",
              { boothId: boothData.boothId },
              (response: { success: boolean; error?: string }) => {
                clearTimeout(timeout);
                if (response.success) {
                  console.log("[ExpoStaffProvider] Successfully rejoined as staff");
                  resolve(response);
                } else {
                  console.error("[ExpoStaffProvider] Failed to rejoin:", response.error);
                  reject(new Error(response.error || "Failed to rejoin"));
                }
              }
            );
          });
        } catch (error) {
          console.error("[ExpoStaffProvider] Auto-rejoin failed:", error);
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("[ExpoStaffProvider] Socket disconnected");
      setIsSocketConnected(false);
      // Keep isLive true so we can auto-rejoin on reconnect
    });

    socket.on("connect_error", (error) => {
      console.error("[ExpoStaffProvider] Socket connection error:", error);
      setIsSocketConnected(false);
    });

    return () => {
      console.log("[ExpoStaffProvider] Cleaning up socket connection");
      socket.disconnect();
      socketRef.current = null;
      setIsSocketConnected(false);
    };
  }, [token, boothData?.boothId, boothData?.eventId]);

  const goLive = useCallback(async () => {
    if (!socketRef.current || !boothData) {
      console.error("[ExpoStaffProvider] Socket or booth data not available");
      throw new Error("Socket or booth data not available");
    }

    if (!socketRef.current.connected) {
      console.error("[ExpoStaffProvider] Socket is not connected");
      throw new Error("Connection not ready. Please wait a moment and try again.");
    }

    setIsLoading(true);
    try {
      console.log("[ExpoStaffProvider] Emitting expo.booth.staff.join for booth:", boothData.boothId);

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Request timed out. Please try again."));
        }, 10000); // 10 second timeout

        socketRef.current!.emit(
          "expo.booth.staff.join",
          { boothId: boothData.boothId },
          (response: { success: boolean; error?: string }) => {
            clearTimeout(timeout);
            console.log("[ExpoStaffProvider] Got response from expo.booth.staff.join:", response);

            if (response.success) {
              setIsLive(true);
              resolve(response);
            } else {
              reject(new Error(response.error || "Failed to go live"));
            }
          }
        );
      });

      console.log("[ExpoStaffProvider] Successfully went live");
    } catch (error) {
      console.error("[ExpoStaffProvider] Failed to go live:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [boothData]);

  const goOffline = useCallback(async () => {
    if (!socketRef.current || !boothData) {
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve, reject) => {
        socketRef.current!.emit(
          "expo.booth.staff.status",
          { boothId: boothData.boothId, status: "OFFLINE" },
          (response: { success: boolean; error?: string }) => {
            if (response.success) {
              setIsLive(false);
              resolve(response);
            } else {
              reject(new Error(response.error || "Failed to go offline"));
            }
          }
        );
      });
    } catch (error) {
      console.error("[ExpoStaffProvider] Failed to go offline:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [boothData]);

  return (
    <ExpoStaffContext.Provider
      value={{
        isLive,
        boothId: boothData?.boothId || null,
        boothName: boothData?.boothName || null,
        eventId: boothData?.eventId || null,
        goLive,
        goOffline,
        isLoading,
        isFetchingBooth,
        boothFetchError,
        isSocketConnected,
      }}
    >
      {children}
    </ExpoStaffContext.Provider>
  );
}

export function useExpoStaffContext() {
  const context = useContext(ExpoStaffContext);
  if (!context) {
    throw new Error("useExpoStaffContext must be used within ExpoStaffProvider");
  }
  return context;
}
