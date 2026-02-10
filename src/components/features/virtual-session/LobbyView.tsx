// src/components/features/virtual-session/LobbyView.tsx
"use client";

import { useState, useEffect } from "react";
import { format, differenceInSeconds } from "date-fns";
import { Users, Mic2, Video, Clock } from "lucide-react";
import { useQuery } from "@apollo/client";
import { GET_VIRTUAL_ATTENDANCE_STATS_QUERY } from "@/graphql/attendee.graphql";
import { StreamPlayer } from "@/components/features/video/StreamPlayer";
import { VirtualSession } from "./VirtualSessionView";

interface LobbyViewProps {
  session: VirtualSession;
  lobbyVideoUrl?: string | null;
  onDismiss: () => void;
}

function CountdownUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] flex items-center justify-center">
          <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums tracking-tight">
            {value}
          </span>
        </div>
      </div>
      <span className="text-[10px] sm:text-xs text-white/30 uppercase tracking-widest mt-2 font-medium">
        {label}
      </span>
    </div>
  );
}

function CountdownSeparator() {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 pb-6">
      <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
      <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
    </div>
  );
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
      <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/15 border border-emerald-500/20">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        <span className="text-base sm:text-lg font-semibold text-emerald-400">Starting now...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {hours > 0 && (
        <>
          <CountdownUnit value={pad(hours)} label="Hours" />
          <CountdownSeparator />
        </>
      )}
      <CountdownUnit value={pad(minutes)} label="Minutes" />
      <CountdownSeparator />
      <CountdownUnit value={pad(seconds)} label="Seconds" />
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
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/[0.04] blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-500/[0.04] blur-[120px]" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 text-center text-white px-6 py-8 max-w-lg w-full space-y-8">
        {/* Lobby video (optional pre-session content) */}
        {lobbyVideoUrl && (
          <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/40 mb-8">
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
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/15 text-blue-400 text-xs sm:text-sm font-medium">
            <Video className="h-3.5 w-3.5" />
            Session Lobby
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{session.title}</h2>
          <p className="text-white/40 text-sm sm:text-base flex items-center justify-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {format(startTime, "h:mm a")} &middot; {format(startTime, "MMMM d, yyyy")}
          </p>
        </div>

        {/* Countdown */}
        <div className="flex justify-center py-2">
          <CountdownTimer targetDate={startTime} />
        </div>

        {/* Speakers */}
        {session.speakers.length > 0 && (
          <div className="flex items-center justify-center gap-2 text-sm text-white/40">
            <Mic2 className="h-3.5 w-3.5 flex-shrink-0" />
            <span>
              Featuring: {session.speakers.map((s) => s.name).join(", ")}
            </span>
          </div>
        )}

        {/* Waiting counter */}
        {waitingCount > 0 && (
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/[0.04] border border-white/[0.06] text-sm text-white/50">
            <Users className="h-3.5 w-3.5" />
            <span>
              {waitingCount} {waitingCount === 1 ? "person" : "people"} waiting
            </span>
          </div>
        )}

        {/* Skip lobby button */}
        <div>
          <button
            onClick={onDismiss}
            className="text-sm text-white/30 hover:text-white/50 transition-colors underline underline-offset-4 decoration-white/10 hover:decoration-white/25"
          >
            Dismiss lobby
          </button>
        </div>
      </div>
    </div>
  );
}
