// src/components/features/virtual-session/LobbyView.tsx
"use client";

import { useState, useEffect } from "react";
import { format, differenceInSeconds } from "date-fns";
import { Users, Mic2, Video } from "lucide-react";
import { useQuery } from "@apollo/client";
import { GET_VIRTUAL_ATTENDANCE_STATS_QUERY } from "@/graphql/attendee.graphql";
import { StreamPlayer } from "@/components/features/video/StreamPlayer";
import { Button } from "@/components/ui/button";
import { VirtualSession } from "./VirtualSessionView";

interface LobbyViewProps {
  session: VirtualSession;
  lobbyVideoUrl?: string | null;
  onDismiss: () => void;
}

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, differenceInSeconds(targetDate, new Date())));

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, differenceInSeconds(targetDate, new Date()));
      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, timeLeft]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (timeLeft <= 0) {
    return (
      <div className="text-2xl font-bold text-green-400">Starting now...</div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {hours > 0 && (
        <>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-white tabular-nums">{pad(hours)}</span>
            <span className="text-xs text-gray-400 uppercase mt-1">Hours</span>
          </div>
          <span className="text-3xl text-gray-500 font-light">:</span>
        </>
      )}
      <div className="flex flex-col items-center">
        <span className="text-4xl font-bold text-white tabular-nums">{pad(minutes)}</span>
        <span className="text-xs text-gray-400 uppercase mt-1">Minutes</span>
      </div>
      <span className="text-3xl text-gray-500 font-light">:</span>
      <div className="flex flex-col items-center">
        <span className="text-4xl font-bold text-white tabular-nums">{pad(seconds)}</span>
        <span className="text-xs text-gray-400 uppercase mt-1">Seconds</span>
      </div>
    </div>
  );
}

export function LobbyView({ session, lobbyVideoUrl, onDismiss }: LobbyViewProps) {
  const startTime = new Date(session.startTime);

  // Poll attendance stats to show "X people waiting"
  const { data: statsData } = useQuery(GET_VIRTUAL_ATTENDANCE_STATS_QUERY, {
    variables: { sessionId: session.id },
    pollInterval: 10000,
    fetchPolicy: "network-only",
  });
  const waitingCount = statsData?.virtualAttendanceStats?.currentViewers ?? 0;

  // Auto-dismiss when countdown reaches zero
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    const remaining = differenceInSeconds(startTime, new Date());
    if (remaining <= 0 && !dismissed) {
      setDismissed(true);
      onDismiss();
    }
  }, [startTime, dismissed, onDismiss]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 text-center text-white p-8 max-w-lg w-full space-y-8">
        {/* Lobby video (optional pre-session content) */}
        {lobbyVideoUrl && (
          <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl mb-8">
            <StreamPlayer
              url={lobbyVideoUrl}
              sessionId={session.id}
              autoPlay={true}
              muted={true}
              className="aspect-video"
            />
          </div>
        )}

        {/* Session info */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-sm font-medium mb-4">
            <Video className="h-4 w-4" />
            Session Lobby
          </div>
          <h2 className="text-2xl font-bold mb-2">{session.title}</h2>
          <p className="text-gray-400">
            Starts at {format(startTime, "h:mm a")} on {format(startTime, "MMMM d, yyyy")}
          </p>
        </div>

        {/* Countdown */}
        <div className="flex justify-center">
          <CountdownTimer targetDate={startTime} />
        </div>

        {/* Speakers */}
        {session.speakers.length > 0 && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Mic2 className="h-4 w-4" />
            <span>
              Featuring: {session.speakers.map((s) => s.name).join(", ")}
            </span>
          </div>
        )}

        {/* Waiting counter */}
        {waitingCount > 0 && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Users className="h-4 w-4" />
            <span>{waitingCount} {waitingCount === 1 ? "person" : "people"} waiting</span>
          </div>
        )}

        {/* Skip lobby button */}
        <Button
          variant="outline"
          className="border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
          onClick={onDismiss}
        >
          Dismiss Lobby
        </Button>
      </div>
    </div>
  );
}
