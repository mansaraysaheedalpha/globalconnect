// src/components/features/virtual-session/DailySessionView.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { DailyProvider, useDailyCall } from "@/components/features/breakout/video/DailyProvider";
import { VideoGrid } from "@/components/features/breakout/video/VideoGrid";
import { VideoControls } from "@/components/features/breakout/video/VideoControls";
import { useVirtualStage } from "@/hooks/useVirtualStage";
import { useAuthStore } from "@/store/auth.store";
import { useMutation } from "@apollo/client";
import { UPDATE_SESSION_MUTATION } from "@/graphql/events.graphql";
import { Loader2, AlertTriangle, Video, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VirtualSession } from "./VirtualSessionView";
import { CaptionOverlay } from "./CaptionOverlay";

interface DailySessionViewProps {
  session: VirtualSession;
  eventId: string;
  isSpeaker: boolean;
  onLeave: () => void;
}

/**
 * Inner component that uses the DailyProvider context.
 * Handles room creation (lazy provisioning), token generation, and call lifecycle.
 */
function DailySessionInner({ session, eventId, isSpeaker, onLeave }: DailySessionViewProps) {
  const {
    participants,
    isJoined,
    isJoining,
    isCameraOn,
    isMicOn,
    isScreenSharing,
    isRecording,
    isTranscribing,
    captions,
    cpuLoadState,
    error: callError,
    joinCall,
    leaveCall,
    toggleCamera,
    toggleMic,
    toggleScreenShare,
    startRecording,
    stopRecording,
    startTranscription,
    stopTranscription,
    setReceiveVideoQuality,
  } = useDailyCall();

  // Local state for captions visibility (default to session.autoCaptions)
  const [showCaptions, setShowCaptions] = useState(session.autoCaptions ?? false);
  const hasAutoStartedCaptionsRef = useRef(false);

  const { createRoom, getToken, isLoading: stageLoading, error: stageError } = useVirtualStage();
  const [status, setStatus] = useState<"idle" | "provisioning" | "joining" | "joined" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const hasInitiatedRef = useRef(false);

  const [updateSession] = useMutation(UPDATE_SESSION_MUTATION);

  const user = useAuthStore((s) => s.user);
  const userName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email
    : "Participant";

  // Initiate the join flow on mount
  const initJoin = useCallback(async () => {
    if (hasInitiatedRef.current) return;
    hasInitiatedRef.current = true;

    try {
      let roomUrl = session.streamingUrl;
      let roomName = session.virtualRoomId;

      // Lazy provisioning: if no room exists yet, create one (speakers only)
      if (!roomName) {
        if (!isSpeaker) {
          setStatus("error");
          setErrorMessage("The session room hasn't been created yet. Please wait for the speaker to start the session.");
          return;
        }

        setStatus("provisioning");
        const roomResult = await createRoom({
          sessionId: session.id,
          sessionTitle: session.title,
          eventId,
          enableRecording: session.isRecordable !== false,
        });

        if (!roomResult) {
          setStatus("error");
          setErrorMessage("Failed to create the video room. Please try again.");
          return;
        }

        roomName = roomResult.roomName;
        roomUrl = roomResult.roomUrl;

        // Persist the room info on the session so others can join
        await updateSession({
          variables: {
            id: session.id,
            sessionIn: {
              streamingUrl: roomUrl,
              virtualRoomId: roomName,
            },
          },
        });
      }

      // Get a meeting token
      setStatus("joining");
      const token = await getToken({
        sessionId: session.id,
        roomName: roomName!,
        isSpeaker,
        broadcastOnly: session.broadcastOnly ?? false,
      });

      if (!token) {
        setStatus("error");
        setErrorMessage("Failed to get a meeting token. Please try again.");
        return;
      }

      // Join the Daily call
      await joinCall(roomUrl!, token, userName);
      setStatus("joined");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred.");
    }
  }, [session, eventId, isSpeaker, userName, createRoom, getToken, joinCall, updateSession]);

  useEffect(() => {
    initJoin();
  }, [initJoin]);

  // Auto-retry for attendees waiting for speaker to create room (max 20 retries = ~1 minute)
  useEffect(() => {
    if (
      status === "error" &&
      !isSpeaker &&
      errorMessage?.includes("room hasn't been created yet") &&
      retryCount < 20
    ) {
      const retryTimer = setTimeout(() => {
        console.log(`[DailySessionView] Auto-retrying join (attempt ${retryCount + 1}/20)...`);
        hasInitiatedRef.current = false;
        setStatus("idle");
        setErrorMessage(null);
        setRetryCount((prev) => prev + 1);
        initJoin();
      }, 3000); // Retry every 3 seconds

      return () => clearTimeout(retryTimer);
    }
  }, [status, isSpeaker, errorMessage, retryCount, initJoin]);

  // Handle leaving the call
  const handleLeave = useCallback(async () => {
    await leaveCall();
    onLeave();
  }, [leaveCall, onLeave]);

  // Auto-start transcription if session has autoCaptions enabled (speaker initiates)
  useEffect(() => {
    if (isSpeaker && session.autoCaptions && !isTranscribing && !hasAutoStartedCaptionsRef.current) {
      hasAutoStartedCaptionsRef.current = true;
      startTranscription();
    }
  }, [isSpeaker, session.autoCaptions, isTranscribing, startTranscription]);

  // Toggle captions: start transcription if not running, or toggle visibility if running
  const handleToggleCaptions = useCallback(async () => {
    if (!isTranscribing) {
      // Start transcription if not already running
      await startTranscription();
      setShowCaptions(true);
    } else {
      // Just toggle visibility if transcription is already running
      setShowCaptions((prev) => !prev);
    }
  }, [isTranscribing, startTranscription]);

  // Toggle recording handler (only for speakers with recordable sessions)
  const canRecord = isSpeaker && session.isRecordable !== false;
  const handleToggleRecording = useCallback(async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Loading / provisioning state
  if (status === "idle" || status === "provisioning" || status === "joining" || isJoining) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center text-white p-8 max-w-md">
          <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="h-12 w-12 text-blue-400 animate-spin" />
          </div>
          <h2 className="text-xl font-bold mb-2">
            {status === "provisioning" ? "Setting up the room..." : "Joining the session..."}
          </h2>
          <p className="text-gray-400">
            {status === "provisioning"
              ? "Creating a video room for this session"
              : "Connecting you to the video call"}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (status === "error" || callError || stageError) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center text-white p-8 max-w-md">
          <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-12 w-12 text-red-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Unable to Join</h2>
          <p className="text-gray-400 mb-4">
            {errorMessage || callError || stageError || "An error occurred while joining the session."}
          </p>
          {!isSpeaker && errorMessage?.includes("room hasn't been created yet") && retryCount < 20 && (
            <p className="text-sm text-blue-400 mb-6 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Retrying automatically... ({retryCount}/20)
            </p>
          )}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              className="bg-transparent border-white/20 text-white hover:bg-white/10"
              onClick={() => {
                hasInitiatedRef.current = false;
                setStatus("idle");
                setErrorMessage(null);
                initJoin();
              }}
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              className="bg-transparent border-white/20 text-white hover:bg-white/10"
              onClick={onLeave}
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Joined - show video grid + controls
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-900">
      {/* Recording indicator */}
      {isRecording && (
        <div className="flex-shrink-0 flex items-center justify-center gap-2 py-1.5 bg-red-600 text-white text-sm font-medium">
          <Circle className="w-3 h-3 fill-current animate-pulse" />
          Recording in progress
        </div>
      )}

      {/* Video Grid */}
      <div className="flex-1 min-h-0 p-4 relative">
        {participants.length > 0 ? (
          <VideoGrid participants={participants} className="h-full" />
        ) : (
          <div className="flex items-center justify-center h-full text-white/60">
            <div className="text-center">
              <Video className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>Waiting for others to join...</p>
            </div>
          </div>
        )}

        {/* Caption Overlay */}
        {showCaptions && isTranscribing && (
          <CaptionOverlay captions={captions} />
        )}
      </div>

      {/* Call Controls */}
      <div className="flex-shrink-0 flex justify-center pb-4">
        <VideoControls
          isMicOn={isMicOn}
          isCameraOn={isCameraOn}
          isScreenSharing={isScreenSharing}
          isRecording={isRecording}
          isCaptionsOn={isTranscribing && showCaptions}
          cpuLoadState={cpuLoadState}
          onToggleMic={toggleMic}
          onToggleCamera={toggleCamera}
          onToggleScreenShare={toggleScreenShare}
          onToggleRecording={canRecord ? handleToggleRecording : undefined}
          onToggleCaptions={handleToggleCaptions}
          onLeave={handleLeave}
          onSetVideoQuality={setReceiveVideoQuality}
        />
      </div>
    </div>
  );
}

/**
 * DailySessionView - Wraps the video call inner component with DailyProvider context.
 * This is the component used by VirtualSessionView for Daily.co sessions.
 */
export function DailySessionView(props: DailySessionViewProps) {
  return (
    <DailyProvider>
      <DailySessionInner {...props} />
    </DailyProvider>
  );
}
