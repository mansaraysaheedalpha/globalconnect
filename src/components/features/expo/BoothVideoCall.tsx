// src/components/features/expo/BoothVideoCall.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Loader2,
  Maximize,
  Minimize,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BoothVideoSession } from "./types";

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

export interface BoothVideoCallProps {
  session: BoothVideoSession;
  userName: string;
  isStaff?: boolean;
  onEnd: () => void;
  className?: string;
}

export function BoothVideoCall({
  session,
  userName,
  isStaff = false,
  onEnd,
  className,
}: BoothVideoCallProps) {
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<DailyParticipant[]>([]);

  // Load Daily.co script
  useEffect(() => {
    if (typeof window !== "undefined" && !window.DailyIframe) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/@daily-co/daily-js";
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  // Join the call when session has video URL
  useEffect(() => {
    if (!session.videoRoomUrl || !session.token || isJoined || callObject) {
      return;
    }

    const joinCall = async () => {
      if (!window.DailyIframe) {
        // Wait for Daily.co to load
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

        // Set up event handlers
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

        // Join the call
        await call.join({
          url: session.videoRoomUrl,
          token: session.token,
          userName,
        });

        setCallObject(call);
      } catch (err) {
        console.error("[Video] Join error:", err);
        setError(err instanceof Error ? err.message : "Failed to join video call");
        setIsJoining(false);
      }
    };

    joinCall();

    // Cleanup
    return () => {
      if (callObject) {
        callObject.leave().catch(console.error);
        callObject.destroy().catch(console.error);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.videoRoomUrl, session.token, userName]);

  // Update participants list
  const updateParticipants = useCallback((call: DailyCall) => {
    const allParticipants = Object.values(call.participants());
    setParticipants(allParticipants);
  }, []);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (callObject) {
      const newState = !isCameraOn;
      callObject.setLocalVideo(newState);
      setIsCameraOn(newState);
    }
  }, [callObject, isCameraOn]);

  // Toggle microphone
  const toggleMic = useCallback(() => {
    if (callObject) {
      const newState = !isMicOn;
      callObject.setLocalAudio(newState);
      setIsMicOn(newState);
    }
  }, [callObject, isMicOn]);

  // Leave call
  const leaveCall = useCallback(async () => {
    if (callObject) {
      await callObject.leave();
      await callObject.destroy();
      setCallObject(null);
      onEnd();
    }
  }, [callObject, onEnd]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Waiting for call to be accepted
  if (session.status === "REQUESTED") {
    return (
      <div className={cn("p-6 text-center", className)}>
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <h3 className="font-semibold mb-2">Waiting for staff...</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Your video call request has been sent. A staff member will connect with
          you shortly.
        </p>
        <Button variant="outline" onClick={onEnd}>
          <PhoneOff className="h-4 w-4 mr-2" />
          Cancel Request
        </Button>
      </div>
    );
  }

  // Call accepted, joining
  if (isJoining || !isJoined) {
    return (
      <div className={cn("p-6 text-center", className)}>
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <h3 className="font-semibold mb-2">
          {isJoining ? "Connecting to video call..." : "Preparing video call..."}
        </h3>
        <p className="text-sm text-muted-foreground">
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
      <div className={cn("p-6", className)}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={onEnd} className="mt-4 w-full">
          Close
        </Button>
      </div>
    );
  }

  // Video call UI
  const content = (
    <div className="flex flex-col h-full bg-black rounded-lg overflow-hidden">
      {/* Video grid */}
      <div className="flex-1 grid grid-cols-1 gap-2 p-2">
        {participants.map((participant) => (
          <div
            key={participant.session_id}
            className={cn(
              "relative rounded-lg overflow-hidden bg-gray-900",
              participants.length === 1 ? "aspect-video" : "aspect-video"
            )}
          >
            {participant.video && participant.tracks.video?.track ? (
              <VideoElement track={participant.tracks.video.track} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold text-white">
                  {participant.user_name?.charAt(0) || "?"}
                </div>
              </div>
            )}

            {/* Participant name */}
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-white text-sm">
              {participant.user_name}
              {participant.local && " (You)"}
            </div>

            {/* Muted indicator */}
            {!participant.audio && (
              <div className="absolute top-2 right-2 p-1 bg-red-500/80 rounded">
                <MicOff className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 p-4 bg-gray-900">
        <Button
          variant={isCameraOn ? "secondary" : "destructive"}
          size="icon"
          onClick={toggleCamera}
          className="rounded-full h-12 w-12"
        >
          {isCameraOn ? (
            <Video className="h-5 w-5" />
          ) : (
            <VideoOff className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant={isMicOn ? "secondary" : "destructive"}
          size="icon"
          onClick={toggleMic}
          className="rounded-full h-12 w-12"
        >
          {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>

        <Button
          variant="destructive"
          size="icon"
          onClick={leaveCall}
          className="rounded-full h-12 w-12"
        >
          <Phone className="h-5 w-5 rotate-[135deg]" />
        </Button>

        <Button
          variant="secondary"
          size="icon"
          onClick={toggleFullscreen}
          className="rounded-full h-12 w-12"
        >
          {isFullscreen ? (
            <Minimize className="h-5 w-5" />
          ) : (
            <Maximize className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-4xl h-[80vh] p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Video Call</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return <div className={cn("h-[400px]", className)}>{content}</div>;
}

// Video element component
function VideoElement({ track }: { track: MediaStreamTrack }) {
  const videoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node && track) {
      const stream = new MediaStream([track]);
      node.srcObject = stream;
    }
  }, [track]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted // Local video should be muted to avoid echo
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
}
