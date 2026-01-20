// src/components/features/breakout/video/DailyProvider.tsx
"use client";

import React, { createContext, useContext, useCallback, useState, useEffect, useRef } from "react";
import DailyIframe, { DailyCall, DailyParticipant } from "@daily-co/daily-js";

// CPU load thresholds for quality adaptation
const CPU_LOAD_HIGH = 0.8;
const CPU_LOAD_CRITICAL = 0.95;

interface DailyContextValue {
  callObject: DailyCall | null;
  participants: DailyParticipant[];
  localParticipant: DailyParticipant | null;
  activeSpeakerId: string | null;
  isJoined: boolean;
  isJoining: boolean;
  isCameraOn: boolean;
  isMicOn: boolean;
  isScreenSharing: boolean;
  cpuLoadState: "normal" | "high" | "critical";
  error: string | null;
  joinCall: (url: string, token: string, userName: string) => Promise<void>;
  leaveCall: () => Promise<void>;
  toggleCamera: () => void;
  toggleMic: () => void;
  toggleScreenShare: () => Promise<void>;
  setReceiveVideoQuality: (quality: "low" | "medium" | "high") => void;
}

const DailyContext = createContext<DailyContextValue | null>(null);

export function useDailyCall() {
  const context = useContext(DailyContext);
  if (!context) {
    throw new Error("useDailyCall must be used within a DailyProvider");
  }
  return context;
}

interface DailyProviderProps {
  children: React.ReactNode;
}

export function DailyProvider({ children }: DailyProviderProps) {
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const [participants, setParticipants] = useState<DailyParticipant[]>([]);
  const [localParticipant, setLocalParticipant] = useState<DailyParticipant | null>(null);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [cpuLoadState, setCpuLoadState] = useState<"normal" | "high" | "critical">("normal");
  const [error, setError] = useState<string | null>(null);

  // Use ref to track call object for cleanup to avoid stale closure issues
  const callObjectRef = useRef<DailyCall | null>(null);
  const cpuMonitorRef = useRef<NodeJS.Timeout | null>(null);

  // Update participants list
  const updateParticipants = useCallback((call: DailyCall) => {
    const allParticipants = call.participants();
    const participantList = Object.values(allParticipants);
    setParticipants(participantList);

    const local = allParticipants.local;
    if (local) {
      setLocalParticipant(local);
      setIsCameraOn(local.video);
      setIsMicOn(local.audio);
      setIsScreenSharing(local.screen);
    }
  }, []);

  // Monitor CPU load and adapt quality
  const startCpuMonitoring = useCallback((call: DailyCall) => {
    if (cpuMonitorRef.current) {
      clearInterval(cpuMonitorRef.current);
    }

    cpuMonitorRef.current = setInterval(async () => {
      try {
        const stats = await call.getNetworkStats();
        const cpuLoad = stats?.stats?.latest?.videoRecvBitsPerSecond
          ? Math.min(1, stats.stats.latest.videoRecvBitsPerSecond / 5000000)
          : 0;

        // Check CPU usage through quality stats
        if (stats?.threshold === "very-low") {
          setCpuLoadState("critical");
          // Auto-reduce quality for all remote participants
          call.updateReceiveSettings({
            "*": { video: { layer: 0 } }, // Lowest quality layer
          });
        } else if (stats?.threshold === "low") {
          setCpuLoadState("high");
          call.updateReceiveSettings({
            "*": { video: { layer: 1 } }, // Medium quality
          });
        } else {
          setCpuLoadState("normal");
        }
      } catch (err) {
        // Stats not available, continue without monitoring
      }
    }, 5000);
  }, []);

  // Set receive video quality for bandwidth optimization
  const setReceiveVideoQuality = useCallback((quality: "low" | "medium" | "high") => {
    if (!callObject) return;

    const layerMap = { low: 0, medium: 1, high: 2 };
    callObject.updateReceiveSettings({
      "*": { video: { layer: layerMap[quality] } },
    });
  }, [callObject]);

  // Join the call
  const joinCall = useCallback(async (url: string, token: string, userName: string) => {
    setIsJoining(true);
    setError(null);

    try {
      // Create a new call object with optimized settings
      const call = DailyIframe.createCallObject({
        subscribeToTracksAutomatically: true,
        // Enable simulcast for adaptive quality
        sendSettings: {
          video: {
            encodings: {
              low: { maxBitrate: 150000, maxFramerate: 10, scaleResolutionDownBy: 4 },
              medium: { maxBitrate: 500000, maxFramerate: 20, scaleResolutionDownBy: 2 },
              high: { maxBitrate: 1200000, maxFramerate: 30, scaleResolutionDownBy: 1 },
            },
          },
        },
      });

      // Set up event handlers
      call.on("joined-meeting", () => {
        setIsJoined(true);
        setIsJoining(false);
        updateParticipants(call);
        startCpuMonitoring(call);
      });

      call.on("left-meeting", () => {
        setIsJoined(false);
        setParticipants([]);
        setLocalParticipant(null);
        setActiveSpeakerId(null);
        if (cpuMonitorRef.current) {
          clearInterval(cpuMonitorRef.current);
        }
      });

      call.on("participant-joined", () => {
        updateParticipants(call);
      });

      call.on("participant-left", () => {
        updateParticipants(call);
      });

      call.on("participant-updated", () => {
        updateParticipants(call);
      });

      // Track active speaker for smart video prioritization
      call.on("active-speaker-change", (event) => {
        if (event?.activeSpeaker?.peerId) {
          setActiveSpeakerId(event.activeSpeaker.peerId);
          // Prioritize active speaker's video quality
          call.updateReceiveSettings({
            [event.activeSpeaker.peerId]: { video: { layer: 2 } }, // Highest quality for speaker
          });
        }
      });

      // Handle CPU load warning from Daily
      call.on("cpu-load-change", (event) => {
        if (event?.cpuLoadState === "high") {
          setCpuLoadState("high");
        } else if (event?.cpuLoadState === "critical") {
          setCpuLoadState("critical");
          // Auto-disable camera on critical CPU load
          call.setLocalVideo(false);
          setIsCameraOn(false);
        } else {
          setCpuLoadState("normal");
        }
      });

      call.on("error", (event) => {
        console.error("Daily error:", event);
        setError(event?.errorMsg || "An error occurred");
        setIsJoining(false);
      });

      call.on("camera-error", (event) => {
        console.error("Camera error:", event);
      });

      setCallObject(call);
      callObjectRef.current = call;

      // Join the call with bandwidth-conscious settings
      await call.join({
        url,
        token,
        userName,
        startVideoOff: false,
        startAudioOff: false,
      });

      // Set initial receive settings for optimal performance
      // Start with medium quality to balance performance and quality
      call.updateReceiveSettings({
        "*": { video: { layer: 1 } },
      });

    } catch (err) {
      console.error("Failed to join call:", err);
      setError(err instanceof Error ? err.message : "Failed to join call");
      setIsJoining(false);
    }
  }, [updateParticipants, startCpuMonitoring]);

  // Leave the call
  const leaveCall = useCallback(async () => {
    if (callObject) {
      try {
        await callObject.leave();
        await callObject.destroy();
      } catch (err) {
        console.error("Error leaving call:", err);
      }
      setCallObject(null);
      callObjectRef.current = null;
      setIsJoined(false);
      setParticipants([]);
      setLocalParticipant(null);
    }
  }, [callObject]);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (callObject) {
      callObject.setLocalVideo(!isCameraOn);
      setIsCameraOn(!isCameraOn);
    }
  }, [callObject, isCameraOn]);

  // Toggle microphone
  const toggleMic = useCallback(() => {
    if (callObject) {
      callObject.setLocalAudio(!isMicOn);
      setIsMicOn(!isMicOn);
    }
  }, [callObject, isMicOn]);

  // Toggle screen share
  const toggleScreenShare = useCallback(async () => {
    if (callObject) {
      if (isScreenSharing) {
        await callObject.stopScreenShare();
      } else {
        await callObject.startScreenShare();
      }
      setIsScreenSharing(!isScreenSharing);
    }
  }, [callObject, isScreenSharing]);

  // Cleanup on unmount - use ref to avoid stale closure
  useEffect(() => {
    return () => {
      const call = callObjectRef.current;
      if (call) {
        call.leave().catch(console.error);
        call.destroy().catch(console.error);
        callObjectRef.current = null;
      }
      if (cpuMonitorRef.current) {
        clearInterval(cpuMonitorRef.current);
      }
    };
  }, []);

  const value: DailyContextValue = {
    callObject,
    participants,
    localParticipant,
    activeSpeakerId,
    isJoined,
    isJoining,
    isCameraOn,
    isMicOn,
    isScreenSharing,
    cpuLoadState,
    error,
    joinCall,
    leaveCall,
    toggleCamera,
    toggleMic,
    toggleScreenShare,
    setReceiveVideoQuality,
  };

  return (
    <DailyContext.Provider value={value}>
      {children}
    </DailyContext.Provider>
  );
}
