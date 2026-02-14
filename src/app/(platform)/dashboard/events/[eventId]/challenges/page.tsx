// src/app/(platform)/dashboard/events/[eventId]/challenges/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_SESSIONS_BY_EVENT_QUERY } from "@/graphql/events.graphql";
import { useAuthStore } from "@/store/auth.store";
import { Badge } from "@/components/ui/badge";
import { Radio, Clock, CheckCircle, Swords, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { ChallengeCreator } from "./_components/challenge-creator";
import { ChallengeMonitor } from "./_components/challenge-monitor";
import { ActiveChallenge } from "./_components/active-challenge";
import { TriviaCreator } from "./_components/trivia-creator";
import { TriviaMonitor } from "./_components/trivia-monitor";
import type { Challenge, ChallengeTemplate, ChallengeProgressUpdate } from "@/hooks/use-challenges";

interface Session {
  id: string;
  title: string;
  status: "UPCOMING" | "LIVE" | "ENDED";
  chatEnabled: boolean;
}

export default function ChallengesPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { token } = useAuthStore();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Challenge state
  const [templates, setTemplates] = useState<ChallengeTemplate[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<ChallengeProgressUpdate | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Trivia state
  const [triviaGames, setTriviaGames] = useState<any[]>([]);

  // Fetch sessions
  const { data, loading } = useQuery(GET_SESSIONS_BY_EVENT_QUERY, {
    variables: { eventId },
    onCompleted: (data) => {
      const sessions: Session[] = data?.sessionsByEvent || [];
      if (!selectedSessionId && sessions.length > 0) {
        const liveSession = sessions.find((s) => s.status === "LIVE");
        const chatSession = sessions.find((s) => s.chatEnabled);
        setSelectedSessionId((liveSession || chatSession || sessions[0])?.id || null);
      }
    },
  });

  const sessions: Session[] = data?.sessionsByEvent || [];

  // Connect socket when session selected
  useEffect(() => {
    if (!selectedSessionId || !token) return;

    const realtimeUrl =
      process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";

    const socket = io(realtimeUrl, {
      auth: { token: `Bearer ${token}` },
      query: { sessionId: selectedSessionId },
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("session.join", { sessionId: selectedSessionId });
      socket.emit("challenge.templates");
      socket.emit("challenge.list", {});
      socket.emit("trivia.list", {});
    });

    socket.on("disconnect", () => setIsConnected(false));

    // Challenge events
    socket.on("challenge.templates.response", (data: any) => {
      if (data?.success) setTemplates(data.templates);
    });

    socket.on("challenge.list.response", (data: any) => {
      if (data?.success) setChallenges(data.challenges);
    });

    socket.on("challenge.created", (challenge: Challenge) => {
      if (!challenge) return;
      setChallenges((prev) => {
        if (prev.some((c) => c.id === challenge.id)) return prev;
        return [challenge, ...prev];
      });
    });

    socket.on("challenge.started", (data: any) => {
      if (!data) return;
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === data.challengeId ? { ...c, status: "ACTIVE", ...data } : c
        )
      );
      socket.emit("challenge.progress", { challengeId: data.challengeId });
    });

    socket.on("challenge.progress.updated", (data: ChallengeProgressUpdate) => {
      if (data) setActiveChallenge(data);
    });

    socket.on("challenge.progress.response", (data: any) => {
      if (data?.success) setActiveChallenge(data);
    });

    socket.on("challenge.completed", (data: any) => {
      if (!data) return;
      setActiveChallenge(null);
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === data.challengeId ? { ...c, status: "COMPLETED" } : c
        )
      );
      toast.success(`Challenge "${data.name}" completed!`);
    });

    socket.on("challenge.cancelled", (data: any) => {
      if (!data) return;
      setActiveChallenge(null);
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === data.challengeId ? { ...c, status: "CANCELLED" } : c
        )
      );
    });

    // Trivia events
    socket.on("trivia.list.response", (data: any) => {
      if (data?.success) setTriviaGames(data.games || []);
    });

    socket.on("trivia.create.response", (data: any) => {
      if (data?.success) {
        socket.emit("trivia.list", {});
      }
    });

    socket.on("trivia.game.started", () => {
      socket.emit("trivia.list", {});
    });

    socket.on("trivia.question.revealed", () => {
      socket.emit("trivia.list", {});
    });

    socket.on("trivia.game.completed", () => {
      socket.emit("trivia.list", {});
      toast.success("Trivia game completed!");
    });

    socket.on("trivia.delete.response", (data: any) => {
      if (data?.success) {
        setTriviaGames((prev) => prev.filter((g) => g.id !== data.gameId));
        toast.success(`Trivia game "${data.name}" deleted.`);
      } else {
        toast.error(data?.error || "Failed to delete trivia game.");
      }
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setTemplates([]);
      setChallenges([]);
      setActiveChallenge(null);
      setTriviaGames([]);
    };
  }, [selectedSessionId, token]);

  // Challenge actions
  const handleCreateChallenge = async (data: any) => {
    if (!socketRef.current?.connected) {
      return { success: false, error: "Not connected" };
    }

    setIsLoading(true);
    return new Promise<{ success: boolean; error?: string }>((resolve) => {
      const timeout = setTimeout(() => {
        socketRef.current?.off("challenge.create.response", handler);
        setIsLoading(false);
        resolve({ success: false, error: "Timed out" });
      }, 15000);

      const handler = (response: any) => {
        clearTimeout(timeout);
        socketRef.current?.off("challenge.create.response", handler);
        setIsLoading(false);
        resolve(response);
      };

      socketRef.current!.on("challenge.create.response", handler);
      socketRef.current!.emit("challenge.create", {
        ...data,
        idempotencyKey: uuidv4(),
      });
    });
  };

  const handleStartChallenge = (challengeId: string) => {
    socketRef.current?.emit("challenge.start", { challengeId });
  };

  const handleCancelChallenge = (challengeId: string) => {
    socketRef.current?.emit("challenge.cancel", { challengeId });
  };

  // Trivia actions
  const handleCreateTrivia = (data: any) => {
    socketRef.current?.emit("trivia.create", data);
  };

  const handleStartTrivia = (gameId: string) => {
    socketRef.current?.emit("trivia.start", { gameId });
  };

  const handleAdvanceTrivia = (gameId: string) => {
    socketRef.current?.emit("trivia.advance", { gameId });
  };

  const handleEndTrivia = (gameId: string) => {
    socketRef.current?.emit("trivia.end", { gameId });
  };

  const handleDeleteTrivia = (gameId: string) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit("trivia.delete", { gameId });
  };

  const getTimeRemaining = () => {
    if (!activeChallenge?.endedAt) return 0;
    const remaining = new Date(activeChallenge.endedAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Swords className="h-6 w-6 text-purple-500" />
          Challenges & Trivia
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Create and manage team challenges and trivia games for your event sessions.
        </p>
      </div>

      {/* Session selector */}
      <div className="flex flex-wrap gap-2">
        {loading ? (
          <Badge variant="outline">Loading sessions...</Badge>
        ) : sessions.length === 0 ? (
          <Badge variant="outline">No sessions found</Badge>
        ) : (
          sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setSelectedSessionId(session.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors",
                selectedSessionId === session.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-accent"
              )}
            >
              {session.status === "LIVE" && <Radio className="h-3 w-3 text-green-500" />}
              {session.status === "UPCOMING" && <Clock className="h-3 w-3" />}
              {session.status === "ENDED" && <CheckCircle className="h-3 w-3" />}
              <span className="truncate max-w-[200px]">{session.title}</span>
            </button>
          ))
        )}
        {isConnected && (
          <Badge variant="secondary" className="text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 inline-block" />
            Connected
          </Badge>
        )}
      </div>

      {selectedSessionId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column: Challenges */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Swords className="h-5 w-5 text-purple-500" />
              Team Challenges
            </h2>

            {/* Active challenge progress */}
            {activeChallenge && (
              <ActiveChallenge
                activeChallenge={activeChallenge}
                getTimeRemaining={getTimeRemaining}
                onCancel={handleCancelChallenge}
              />
            )}

            <ChallengeCreator
              templates={templates}
              onCreateChallenge={handleCreateChallenge}
              isLoading={isLoading}
            />

            <ChallengeMonitor
              challenges={challenges}
              onStart={handleStartChallenge}
              onCancel={handleCancelChallenge}
            />
          </div>

          {/* Right column: Trivia */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-pink-500" />
              Trivia Games
            </h2>

            <TriviaCreator
              onCreateGame={handleCreateTrivia}
              isConnected={isConnected}
            />

            <TriviaMonitor
              games={triviaGames}
              onStart={handleStartTrivia}
              onAdvance={handleAdvanceTrivia}
              onEnd={handleEndTrivia}
              onDelete={handleDeleteTrivia}
            />
          </div>
        </div>
      )}
    </div>
  );
}
