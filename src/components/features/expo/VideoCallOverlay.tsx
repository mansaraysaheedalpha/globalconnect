// src/components/features/expo/VideoCallOverlay.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Loader2,
  AlertCircle,
  X,
  Building2,
  Clock,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BoothVideoSession, ExpoBooth } from "./types";

// Daily.co types (simplified)
interface DailyCall {
  join: (config: { url: string; token?: string; userName?: string }) => Promise<void>;
  leave: () => Promise<void>;
  destroy: () => Promise<void>;
  setLocalVideo: (enabled: boolean) => void;
  setLocalAudio: (enabled: boolean) => void;
  participants: () => Record<string, DailyParticipant>;
  on: (event: string, callback: (data?: unknown) => void) => void;
  off: (event: string, callback?: (data?: unknown) => void) => void;
}

interface DailyParticipant {
  session_id: string;
  user_name: string;
  local: boolean;
  video: boolean;
  audio: boolean;
  tracks: {
    video?: {
      track?: MediaStreamTrack;
      state: string;
    };
    audio?: {
      track?: MediaStreamTrack;
      state: string;
    };
  };
}

interface DailyIframeFactory {
  createCallObject: () => DailyCall;
}

declare global {
  interface Window {
    DailyIframe?: DailyIframeFactory;
  }
}

export interface VideoCallOverlayProps {
  session: BoothVideoSession;
  booth: ExpoBooth;
  userName: string;
  isStaff?: boolean;
  onEnd: () => void;
  onCancel: () => void;
}

export function VideoCallOverlay({
  session,
  booth,
  userName,
  isStaff = false,
  onEnd,
  onCancel,
}: VideoCallOverlayProps) {
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const callObjectRef = useRef<DailyCall | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<DailyParticipant[]>([]);
  const [callDuration, setCallDuration] = useState(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load Daily.co script
  useEffect(() => {
    if (typeof window !== "undefined" && !window.DailyIframe) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/@daily-co/daily-js";
      script.async = true;
      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, []);

  // Call duration timer
  useEffect(() => {
    if (isJoined) {
      durationIntervalRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [isJoined]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Join the call when session has video URL
  useEffect(() => {
    if (!session.videoRoomUrl || !session.token || isJoined || callObject) {
      return;
    }

    const joinCall = async () => {
      if (!window.DailyIframe) {
        const checkDaily = setInterval(() => {
          if (window.DailyIframe) {
            clearInterval(checkDaily);
            initializeCall();
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkDaily);
          if (!window.DailyIframe) {
            setError("Failed to load video call library");
          }
        }, 10000);
        return;
      }

      initializeCall();
    };

    const initializeCall = async () => {
      if (!window.DailyIframe || !session.videoRoomUrl || !session.token) return;

      setIsJoining(true);
      setError(null);

      try {
        const call = window.DailyIframe.createCallObject();

        call.on("joined-meeting", () => {
          setIsJoined(true);
          setIsJoining(false);
          updateParticipants(call);
        });

        call.on("left-meeting", () => {
          setIsJoined(false);
          onEnd();
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

        call.on("error", (e) => {
          console.error("[Video] Error:", e);
          setError("Video call error occurred");
        });

        await call.join({
          url: session.videoRoomUrl,
          token: session.token,
          userName,
        });

        callObjectRef.current = call;
        setCallObject(call);
      } catch (err) {
        console.error("[Video] Join error:", err);
        setError(err instanceof Error ? err.message : "Failed to join video call");
        setIsJoining(false);
      }
    };

    joinCall();

    return () => {
      if (callObjectRef.current) {
        callObjectRef.current.leave().catch(console.error);
        callObjectRef.current.destroy().catch(console.error);
        callObjectRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.videoRoomUrl, session.token, userName]);

  const updateParticipants = useCallback((call: DailyCall) => {
    const allParticipants = Object.values(call.participants());
    setParticipants(allParticipants);
  }, []);

  const toggleCamera = useCallback(() => {
    if (callObject) {
      const newState = !isCameraOn;
      callObject.setLocalVideo(newState);
      setIsCameraOn(newState);
    }
  }, [callObject, isCameraOn]);

  const toggleMic = useCallback(() => {
    if (callObject) {
      const newState = !isMicOn;
      callObject.setLocalAudio(newState);
      setIsMicOn(newState);
    }
  }, [callObject, isMicOn]);

  const leaveCall = useCallback(async () => {
    if (callObject) {
      await callObject.leave();
      await callObject.destroy();
      setCallObject(null);
    }
    onEnd();
  }, [callObject, onEnd]);

  // Get remote and local participants
  const localParticipant = participants.find((p) => p.local);
  const remoteParticipants = participants.filter((p) => !p.local);
  const mainParticipant = remoteParticipants[0] || localParticipant;

  // Waiting for call to be accepted
  if (session.status === "REQUESTED") {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-white">{booth.name}</h2>
              <p className="text-sm text-gray-400">Requesting video call...</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Waiting state */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center mb-8 relative">
            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-4xl font-bold text-white">
              {booth.name.charAt(0)}
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
          </div>

          <h3 className="text-xl font-semibold text-white mb-2">Calling {booth.name}...</h3>
          <p className="text-gray-400 text-center max-w-md mb-8">
            Waiting for a staff member to accept your call. Please stay on this screen.
          </p>

          <div className="flex items-center gap-4">
            <Button
              variant="destructive"
              size="lg"
              onClick={onCancel}
              className="rounded-full px-8"
            >
              <PhoneOff className="h-5 w-5 mr-2" />
              Cancel Call
            </Button>
          </div>
        </div>

        {/* Footer hint */}
        <div className="px-6 py-4 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-500">
            Staff members are being notified of your call request
          </p>
        </div>
      </div>
    );
  }

  // Joining state
  if (isJoining || (!isJoined && !error)) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-6" />
        <h3 className="text-xl font-semibold text-white mb-2">
          Connecting to video call...
        </h3>
        <p className="text-gray-400">
          {isStaff
            ? `Connecting with ${session.attendeeName}`
            : `Connecting with ${session.staffName || "booth staff"}`}
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Connection Failed</h3>
        <p className="text-gray-400 text-center max-w-md mb-6">{error}</p>
        <Button variant="outline" onClick={onEnd}>
          Close
        </Button>
      </div>
    );
  }

  // Active call UI
  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            {booth.logoUrl ? (
              <img src={booth.logoUrl} alt={booth.name} className="w-8 h-8 object-contain" />
            ) : (
              <Building2 className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <h2 className="font-semibold text-white">{booth.name}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>
                {isStaff ? `With ${session.attendeeName}` : `With ${session.staffName || "Staff"}`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
            <Clock className="h-3 w-3 mr-1" />
            {formatDuration(callDuration)}
          </Badge>
          <Badge variant="secondary" className="bg-gray-700 text-gray-300">
            <Users className="h-3 w-3 mr-1" />
            {participants.length}
          </Badge>
        </div>
      </div>

      {/* Video area */}
      <div className="flex-1 relative bg-gray-950 overflow-hidden">
        {/* Main video (remote participant or self if alone) */}
        {mainParticipant && (
          <div className="absolute inset-0">
            {mainParticipant.video && mainParticipant.tracks.video?.track ? (
              <VideoElement track={mainParticipant.tracks.video.track} muted={mainParticipant.local} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center text-5xl font-bold text-white">
                  {mainParticipant.user_name?.charAt(0) || "?"}
                </div>
              </div>
            )}

            {/* Main participant name */}
            <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white">
              {mainParticipant.user_name}
              {mainParticipant.local && " (You)"}
              {!mainParticipant.audio && (
                <MicOff className="h-4 w-4 ml-2 inline text-red-400" />
              )}
            </div>
          </div>
        )}

        {/* Self view (picture-in-picture) - only show if there are remote participants */}
        {localParticipant && remoteParticipants.length > 0 && (
          <div className="absolute top-4 right-4 w-48 aspect-video rounded-lg overflow-hidden border-2 border-gray-700 shadow-2xl">
            {localParticipant.video && localParticipant.tracks.video?.track ? (
              <VideoElement track={localParticipant.tracks.video.track} muted />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-xl font-bold text-white">
                  {localParticipant.user_name?.charAt(0) || "?"}
                </div>
              </div>
            )}
            <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/60 rounded text-white text-xs">
              You
              {!localParticipant.audio && (
                <MicOff className="h-3 w-3 ml-1 inline text-red-400" />
              )}
            </div>
          </div>
        )}

        {/* Waiting for remote participant */}
        {participants.length === 1 && localParticipant && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-gray-400 mb-2">Waiting for {isStaff ? "attendee" : "staff"} to join...</p>
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-500" />
            </div>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-800 px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          {/* Mic toggle */}
          <Button
            variant="ghost"
            size="lg"
            onClick={toggleMic}
            className={cn(
              "rounded-full h-14 w-14 transition-colors",
              isMicOn
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            )}
          >
            {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </Button>

          {/* Camera toggle */}
          <Button
            variant="ghost"
            size="lg"
            onClick={toggleCamera}
            className={cn(
              "rounded-full h-14 w-14 transition-colors",
              isCameraOn
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            )}
          >
            {isCameraOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </Button>

          {/* End call button */}
          <Button
            variant="destructive"
            size="lg"
            onClick={leaveCall}
            className="rounded-full h-14 w-14 bg-red-600 hover:bg-red-700"
          >
            <Phone className="h-6 w-6 rotate-[135deg]" />
          </Button>
        </div>

        {/* Control labels */}
        <div className="flex items-center justify-center gap-4 mt-2">
          <span className="text-xs text-gray-500 w-14 text-center">
            {isMicOn ? "Mute" : "Unmute"}
          </span>
          <span className="text-xs text-gray-500 w-14 text-center">
            {isCameraOn ? "Stop Video" : "Start Video"}
          </span>
          <span className="text-xs text-gray-500 w-14 text-center">
            End Call
          </span>
        </div>
      </div>
    </div>
  );
}

// Video element component
function VideoElement({ track, muted = false }: { track: MediaStreamTrack; muted?: boolean }) {
  const videoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      if (node && track) {
        const stream = new MediaStream([track]);
        node.srcObject = stream;
      }
    },
    [track]
  );

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className="w-full h-full object-cover"
    />
  );
}
