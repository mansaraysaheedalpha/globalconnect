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
import { Loader2, AlertTriangle, Video, Circle, RefreshCw } from "lucide-react";
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
    setReceiveVideoQuality,
  } = useDailyCall();

  // Local state for captions visibility (default to session.autoCaptions)
  const [showCaptions, setShowCaptions] = useState(session.autoCaptions ?? false);
  const hasAutoStartedCaptionsRef = useRef(false);

  const { createRoom, getToken, error: stageError } = useVirtualStage();
  const [status, setStatus] = useState<"idle" | "provisioning" | "joining" | "joined" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const hasInitiatedRef = useRef(false);
  const hasHandledExpiredRoomRef = useRef(false);

  const [updateSession] = useMutation(UPDATE_SESSION_MUTATION, {
    refetchQueries: ["GetSessionsByEvent"],
  });

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
        const tokenError = stageError || "Failed to get a meeting token.";

        // Check if token error is due to expired room
        const isExpiredRoom = tokenError.toLowerCase().includes("room is no longer available") ||
                             tokenError.toLowerCase().includes("room has ended") ||
                             tokenError.toLowerCase().includes("meeting ended");

        // If speaker encounters expired room, clear it and retry
        if (isSpeaker && isExpiredRoom && session.virtualRoomId) {
          try {
            await updateSession({
              variables: {
                id: session.id,
                sessionIn: {
                  streamingUrl: null,
                  virtualRoomId: null,
                },
              },
            });

            setErrorMessage("Previous room expired. Creating new room...");
            setTimeout(() => {
              hasInitiatedRef.current = false;
              setStatus("idle");
              setErrorMessage(null);
              initJoin();
            }, 1000);
            return;
          } catch (resetErr) {
            console.error("[DailySessionView] Failed to reset expired room:", resetErr);
          }
        }

        setStatus("error");
        setErrorMessage(tokenError);
        return;
      }

      // Join the Daily call
      await joinCall(roomUrl!, token, userName);
      setStatus("joined");
    } catch (err: any) {
      const errorMsg = err.message || "An unexpected error occurred.";

      // Check if this is an expired room error
      const isExpiredRoom = errorMsg.toLowerCase().includes("room is no longer available") ||
                           errorMsg.toLowerCase().includes("room has ended") ||
                           errorMsg.toLowerCase().includes("meeting ended");

      // If speaker encounters expired room, clear it and allow creating a new one
      if (isSpeaker && isExpiredRoom && session.virtualRoomId) {
        try {
          await updateSession({
            variables: {
              id: session.id,
              sessionIn: {
                streamingUrl: null,
                virtualRoomId: null,
              },
            },
          });

          setErrorMessage("Previous room expired. Creating new room...");
          setTimeout(() => {
            hasInitiatedRef.current = false;
            setStatus("idle");
            setErrorMessage(null);
            initJoin();
          }, 1000);
          return;
        } catch (resetErr) {
          console.error("[DailySessionView] Failed to reset expired room:", resetErr);
        }
      }

      setStatus("error");
      setErrorMessage(errorMsg);
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
        hasInitiatedRef.current = false;
        setStatus("idle");
        setErrorMessage(null);
        setRetryCount((prev) => prev + 1);
        initJoin();
      }, 3000);

      return () => clearTimeout(retryTimer);
    }
  }, [status, isSpeaker, errorMessage, retryCount, initJoin]);

  // Monitor DailyProvider errors and handle expired room errors
  useEffect(() => {
    if (callError && isSpeaker && session.virtualRoomId && !hasHandledExpiredRoomRef.current) {
      const errorLower = callError.toLowerCase();
      const isExpiredRoom = errorLower.includes("room is no longer available") ||
                           errorLower.includes("room has ended") ||
                           errorLower.includes("meeting ended");

      if (isExpiredRoom) {
        hasHandledExpiredRoomRef.current = true;

        (async () => {
          try {
            await updateSession({
              variables: {
                id: session.id,
                sessionIn: {
                  streamingUrl: null,
                  virtualRoomId: null,
                },
              },
            });

            setStatus("provisioning");
            setErrorMessage("Previous room expired. Creating new room...");

            setTimeout(() => {
              hasInitiatedRef.current = false;
              hasHandledExpiredRoomRef.current = false;
              setErrorMessage(null);
              setStatus("idle");
              initJoin();
            }, 2000);
          } catch (resetErr) {
            console.error("[DailySessionView] Failed to reset expired room:", resetErr);
            hasHandledExpiredRoomRef.current = false;
            setStatus("error");
            setErrorMessage("Failed to reset expired room. Please try again.");
          }
        })();
      }
    }
  }, [callError, isSpeaker, session.virtualRoomId, session.id, updateSession, initJoin]);

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

  // Toggle captions
  const handleToggleCaptions = useCallback(async () => {
    if (!isTranscribing) {
      await startTranscription();
      setShowCaptions(true);
    } else {
      setShowCaptions((prev) => !prev);
    }
  }, [isTranscribing, startTranscription]);

  // Toggle recording handler
  const canRecord = isSpeaker && session.isRecordable !== false;
  const handleToggleRecording = useCallback(async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // ─── Loading / Provisioning State ──────────────────────────────
  if (status === "idle" || status === "provisioning" || status === "joining" || isJoining) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/[0.04] blur-[150px]" />
        </div>

        <div className="relative z-10 text-center text-white px-6 py-10 max-w-sm">
          {/* Animated loader */}
          <div className="relative w-20 h-20 mx-auto mb-8">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
            {/* Spinning ring */}
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-400 animate-spin" />
            {/* Inner icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Video className="h-7 w-7 text-blue-400/80" />
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-semibold mb-2 tracking-tight">
            {status === "provisioning" ? "Setting up the room" : "Joining session"}
          </h2>
          <p className="text-white/40 text-sm leading-relaxed">
            {status === "provisioning"
              ? "Creating a secure video room for this session..."
              : "Connecting you to the video call..."}
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mt-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400/60 animate-pulse" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400/30 animate-pulse" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  // ─── Error State ───────────────────────────────────────────────
  if (status === "error" || callError || stageError) {
    const isWaitingForRoom = !isSpeaker && errorMessage?.includes("room hasn't been created yet") && retryCount < 20;

    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-red-500/[0.03] blur-[120px]" />
        </div>

        <div className="relative z-10 text-center text-white px-6 py-10 max-w-md">
          {isWaitingForRoom ? (
            /* Waiting for speaker - friendly state */
            <>
              <div className="relative w-20 h-20 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-400 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="h-7 w-7 text-blue-400/80" />
                </div>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 tracking-tight">Waiting for the Host</h2>
              <p className="text-white/40 text-sm mb-6 leading-relaxed">
                The session will begin once the speaker starts the room. Hang tight!
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium">
                <Loader2 className="h-3 w-3 animate-spin" />
                Retrying... ({retryCount}/20)
              </div>
            </>
          ) : (
            /* Actual error */
            <>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 text-red-400/80" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 tracking-tight">Unable to Join</h2>
              <p className="text-white/40 text-sm mb-8 leading-relaxed max-w-xs mx-auto">
                {errorMessage || callError || stageError || "An error occurred while joining the session."}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    hasInitiatedRef.current = false;
                    setStatus("idle");
                    setErrorMessage(null);
                    initJoin();
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors ring-1 ring-white/10"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Try Again
                </button>
                <button
                  onClick={onLeave}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white/60 hover:text-white/80 hover:bg-white/5 text-sm font-medium transition-colors"
                >
                  Go Back
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── Joined - Show Video Grid + Controls ───────────────────────
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-950">
      {/* Recording indicator */}
      {isRecording && (
        <div className="flex-shrink-0 flex items-center justify-center gap-2 py-1.5 bg-red-600/90 backdrop-blur-sm text-white text-xs sm:text-sm font-medium">
          <Circle className="w-2.5 h-2.5 fill-current animate-pulse" />
          Recording in progress
        </div>
      )}

      {/* Video Grid */}
      <div className="flex-1 min-h-0 p-2 sm:p-3 md:p-4 relative">
        {participants.length > 0 ? (
          <VideoGrid participants={participants} className="h-full" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/30 animate-spin" style={{ animationDuration: "3s" }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="h-6 w-6 text-white/30" />
                </div>
              </div>
              <p className="text-white/40 text-sm">Waiting for others to join...</p>
            </div>
          </div>
        )}

        {/* Caption Overlay */}
        {showCaptions && isTranscribing && (
          <CaptionOverlay captions={captions} />
        )}
      </div>

      {/* Call Controls */}
      <div className="flex-shrink-0 flex justify-center px-2 pb-3 sm:pb-4">
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
 */
export function DailySessionView(props: DailySessionViewProps) {
  return (
    <DailyProvider>
      <DailySessionInner {...props} />
    </DailyProvider>
  );
}
