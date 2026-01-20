// src/components/features/breakout/video/DailyProvider.tsx
"use client";

import React, { createContext, useContext, useCallback, useState, useEffect, useRef } from "react";
import DailyIframe, { DailyCall, DailyParticipant } from "@daily-co/daily-js";

interface DailyContextValue {
  callObject: DailyCall | null;
  participants: DailyParticipant[];
  localParticipant: DailyParticipant | null;
  isJoined: boolean;
  isJoining: boolean;
  isCameraOn: boolean;
  isMicOn: boolean;
  isScreenSharing: boolean;
  error: string | null;
  joinCall: (url: string, token: string, userName: string) => Promise<void>;
  leaveCall: () => Promise<void>;
  toggleCamera: () => void;
  toggleMic: () => void;
  toggleScreenShare: () => Promise<void>;
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
  const [isJoined, setIsJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use ref to track call object for cleanup to avoid stale closure issues
  const callObjectRef = useRef<DailyCall | null>(null);

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

  // Join the call
  const joinCall = useCallback(async (url: string, token: string, userName: string) => {
    setIsJoining(true);
    setError(null);

    try {
      // Create a new call object
      const call = DailyIframe.createCallObject({
        subscribeToTracksAutomatically: true,
      });

      // Set up event handlers
      call.on("joined-meeting", () => {
        setIsJoined(true);
        setIsJoining(false);
        updateParticipants(call);
      });

      call.on("left-meeting", () => {
        setIsJoined(false);
        setParticipants([]);
        setLocalParticipant(null);
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

      // Join the call
      await call.join({
        url,
        token,
        userName,
        startVideoOff: false,
        startAudioOff: false,
      });
    } catch (err) {
      console.error("Failed to join call:", err);
      setError(err instanceof Error ? err.message : "Failed to join call");
      setIsJoining(false);
    }
  }, [updateParticipants]);

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
    };
  }, []);

  const value: DailyContextValue = {
    callObject,
    participants,
    localParticipant,
    isJoined,
    isJoining,
    isCameraOn,
    isMicOn,
    isScreenSharing,
    error,
    joinCall,
    leaveCall,
    toggleCamera,
    toggleMic,
    toggleScreenShare,
  };

  return (
    <DailyContext.Provider value={value}>
      {children}
    </DailyContext.Provider>
  );
}
