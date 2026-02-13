// src/hooks/use-trivia.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import { v4 as uuidv4 } from "uuid";

export interface TriviaQuestion {
  id: string;
  questionText: string;
  options: string[];
  orderIndex: number;
  totalQuestions: number;
}

export interface RevealedQuestion {
  questionId: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  orderIndex: number;
  answers: Array<{
    teamId: string;
    teamName: string;
    selectedIndex: number;
    isCorrect: boolean;
    responseTimeMs: number;
  }>;
}

export interface TriviaScore {
  rank: number;
  teamId: string;
  teamName: string;
  totalScore: number;
  correctCount: number;
  speedBonuses: number;
}

export interface TriviaGameInfo {
  id: string;
  name: string;
  timePerQuestion: number;
  pointsCorrect: number;
  pointsSpeedBonus: number;
  totalQuestions: number;
}

export interface TriviaGameCompleted {
  gameId: string;
  gameName: string;
  totalQuestions: number;
  scores: TriviaScore[];
}

interface UseTriviaOptions {
  sessionId: string;
  autoConnect?: boolean;
}

export const useTrivia = ({
  sessionId,
  autoConnect = true,
}: UseTriviaOptions) => {
  const { token, user } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Game state
  const [activeGame, setActiveGame] = useState<TriviaGameInfo | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<TriviaQuestion | null>(null);
  const [lastRevealed, setLastRevealed] = useState<RevealedQuestion | null>(null);
  const [scores, setScores] = useState<TriviaScore[]>([]);
  const [completedGame, setCompletedGame] = useState<TriviaGameCompleted | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);

  // Answer submission
  const submitAnswer = useCallback(
    (gameId: string, questionId: string, teamId: string, selectedIndex: number) => {
      if (!socketRef.current?.connected) return;

      socketRef.current.emit("trivia.answer.submit", {
        gameId,
        questionId,
        teamId,
        selectedIndex,
        idempotencyKey: uuidv4(),
      });

      setHasSubmitted(true);
    },
    []
  );

  const clearCompletedGame = useCallback(() => {
    setCompletedGame(null);
  }, []);

  // ─── Socket Connection ──────────────────────────────────────

  useEffect(() => {
    if (!sessionId || !token || !autoConnect) return;

    const realtimeUrl =
      process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";

    const newSocket = io(realtimeUrl, {
      auth: { token: `Bearer ${token}` },
      query: { sessionId },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      setIsConnected(true);
      newSocket.emit("session.join", { sessionId });
    });

    newSocket.on("disconnect", () => setIsConnected(false));

    // Game started
    newSocket.on("trivia.game.started", (data: { game: TriviaGameInfo; activeQuestion: TriviaQuestion }) => {
      if (!data) return;
      setActiveGame(data.game);
      setActiveQuestion(data.activeQuestion);
      setScores([]);
      setCompletedGame(null);
      setHasSubmitted(false);
      setQuestionStartTime(Date.now());
    });

    // New question active
    newSocket.on("trivia.question.active", (data: { gameId: string; question: TriviaQuestion }) => {
      if (!data?.question) return;
      setActiveQuestion(data.question);
      setHasSubmitted(false);
      setQuestionStartTime(Date.now());
    });

    // Question revealed (with correct answer + team answers)
    newSocket.on("trivia.question.revealed", (data: { revealed: RevealedQuestion; scores: TriviaScore[] }) => {
      if (!data) return;
      setLastRevealed(data.revealed);
      setScores(data.scores);
      setActiveQuestion(null);
      setQuestionStartTime(null);
    });

    // Scores updated
    newSocket.on("trivia.scores.updated", (data: { gameId: string; scores: TriviaScore[] }) => {
      if (data?.scores) setScores(data.scores);
    });

    // Game completed
    newSocket.on("trivia.game.completed", (data: TriviaGameCompleted) => {
      if (!data) return;
      setCompletedGame(data);
      setActiveGame(null);
      setActiveQuestion(null);
      setLastRevealed(null);
      setQuestionStartTime(null);
    });

    // Team submitted answer notification
    newSocket.on("trivia.answer.submitted", (data: { questionId: string; teamId: string }) => {
      // Could show "Your team submitted" indicator
    });

    return () => {
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("trivia.game.started");
      newSocket.off("trivia.question.active");
      newSocket.off("trivia.question.revealed");
      newSocket.off("trivia.scores.updated");
      newSocket.off("trivia.game.completed");
      newSocket.off("trivia.answer.submitted");
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [sessionId, token, autoConnect]);

  return {
    isConnected,
    activeGame,
    activeQuestion,
    lastRevealed,
    scores,
    completedGame,
    hasSubmitted,
    questionStartTime,
    currentUserId: user?.id,

    submitAnswer,
    clearCompletedGame,

    // Derived
    isGameActive: !!activeGame,
    isQuestionActive: !!activeQuestion,
  };
};
