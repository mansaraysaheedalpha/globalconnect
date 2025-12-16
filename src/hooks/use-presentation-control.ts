// src/hooks/use-presentation-control.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";

// Content action types
export type ContentAction =
  | "NEXT_SLIDE"
  | "PREV_SLIDE"
  | "GO_TO_SLIDE"
  | "START"
  | "STOP";

// Drop content types
export type ContentDropType = "LINK" | "FILE" | "RESOURCE";

// Slide state from server
export interface SlideState {
  currentSlide: number;
  totalSlides: number;
  isActive: boolean;
  slideUrls?: string[];
}

// Dropped content from presenter
export interface DroppedContent {
  id: string;
  type: ContentDropType;
  title: string;
  url: string;
  description?: string;
  droppedBy: {
    id: string;
    name: string;
  };
  timestamp: string;
}

// Presentation status
export type PresentationStatus = "processing" | "ready" | "failed";

interface PresentationControlState {
  isConnected: boolean;
  isJoined: boolean;
  slideState: SlideState | null;
  droppedContent: DroppedContent[];
  presentationStatus: PresentationStatus | null;
  error: string | null;
  isControlling: boolean; // For speakers/moderators
}

export const usePresentationControl = (
  sessionId: string,
  eventId: string,
  canControl: boolean = false
) => {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<PresentationControlState>({
    isConnected: false,
    isJoined: false,
    slideState: null,
    droppedContent: [],
    presentationStatus: null,
    error: null,
    isControlling: canControl,
  });
  const { token } = useAuthStore();

  // Socket connection and event handling
  useEffect(() => {
    if (!sessionId || !eventId || !token) {
      return;
    }

    const realtimeUrl =
      process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002/events";

    const newSocket = io(realtimeUrl, {
      auth: { token: `Bearer ${token}` },
      query: { sessionId, eventId },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      setState((prev) => ({ ...prev, isConnected: true, error: null }));
    });

    newSocket.on("connectionAcknowledged", () => {
      // Join the session room
      newSocket.emit(
        "session.join",
        { sessionId, eventId },
        (response: { success: boolean; error?: { message: string } }) => {
          if (response?.success) {
            setState((prev) => ({ ...prev, isJoined: true }));

            // Request current presentation state
            newSocket.emit(
              "content.request_state",
              { sessionId },
              (stateResponse: {
                success: boolean;
                state?: SlideState & { slideUrls?: string[] };
              }) => {
                if (stateResponse?.success && stateResponse.state) {
                  setState((prev) => ({
                    ...prev,
                    slideState: stateResponse.state!,
                  }));
                }
              }
            );
          } else {
            setState((prev) => ({
              ...prev,
              error: response?.error?.message || "Failed to join session",
            }));
          }
        }
      );
    });

    newSocket.on("disconnect", () => {
      setState((prev) => ({ ...prev, isConnected: false, isJoined: false }));
    });

    // Slide update from presenter
    newSocket.on("slide.update", (slideState: SlideState) => {
      setState((prev) => ({
        ...prev,
        slideState,
      }));
    });

    // Content dropped by presenter
    newSocket.on(
      "content.dropped",
      (data: {
        type: ContentDropType;
        title: string;
        url: string;
        description?: string;
        droppedBy: { id: string; name: string };
        timestamp: string;
      }) => {
        const content: DroppedContent = {
          id: `content-${Date.now()}`,
          ...data,
        };

        setState((prev) => ({
          ...prev,
          droppedContent: [...prev.droppedContent, content],
        }));
      }
    );

    // Presentation processing status
    newSocket.on(
      "presentation.status.update",
      (data: { sessionId: string; status: PresentationStatus }) => {
        if (data.sessionId === sessionId) {
          setState((prev) => ({
            ...prev,
            presentationStatus: data.status,
          }));
        }
      }
    );

    // Error handling
    newSocket.on("systemError", (error: { message: string }) => {
      console.error("[Presentation] System error:", error.message);
      setState((prev) => ({ ...prev, error: error.message }));
    });

    newSocket.on("connect_error", (error) => {
      console.error("[Presentation] Connection error:", error.message);
      setState((prev) => ({ ...prev, error: error.message }));
    });

    // Cleanup
    return () => {
      newSocket.emit("session.leave", { sessionId });
      newSocket.off("connect");
      newSocket.off("connectionAcknowledged");
      newSocket.off("disconnect");
      newSocket.off("slide.update");
      newSocket.off("content.dropped");
      newSocket.off("presentation.status.update");
      newSocket.off("systemError");
      newSocket.off("connect_error");
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [sessionId, eventId, token]);

  // Control presentation (for speakers/moderators)
  const controlPresentation = useCallback(
    (
      action: ContentAction,
      targetSlide?: number
    ): Promise<{ success: boolean; newState?: SlideState; error?: string }> => {
      return new Promise((resolve) => {
        if (!socketRef.current || !state.isJoined) {
          resolve({ success: false, error: "Not connected" });
          return;
        }

        if (!state.isControlling) {
          resolve({ success: false, error: "Not authorized to control" });
          return;
        }

        const payload: { sessionId: string; action: ContentAction; targetSlide?: number } = {
          sessionId,
          action,
        };

        if (action === "GO_TO_SLIDE" && targetSlide !== undefined) {
          payload.targetSlide = targetSlide;
        }

        socketRef.current.emit(
          "content.control",
          payload,
          (response: {
            success: boolean;
            newState?: SlideState;
            error?: string;
          }) => {
            if (response.success && response.newState) {
              setState((prev) => ({
                ...prev,
                slideState: response.newState!,
              }));
            }
            resolve(response);
          }
        );
      });
    },
    [sessionId, state.isJoined, state.isControlling]
  );

  // Next slide
  const nextSlide = useCallback(() => {
    return controlPresentation("NEXT_SLIDE");
  }, [controlPresentation]);

  // Previous slide
  const prevSlide = useCallback(() => {
    return controlPresentation("PREV_SLIDE");
  }, [controlPresentation]);

  // Go to specific slide
  const goToSlide = useCallback(
    (slideNumber: number) => {
      return controlPresentation("GO_TO_SLIDE", slideNumber);
    },
    [controlPresentation]
  );

  // Start presentation
  const startPresentation = useCallback(() => {
    return controlPresentation("START");
  }, [controlPresentation]);

  // Stop presentation
  const stopPresentation = useCallback(() => {
    return controlPresentation("STOP");
  }, [controlPresentation]);

  // Drop content to attendees
  const dropContent = useCallback(
    (
      type: ContentDropType,
      title: string,
      url: string,
      description?: string
    ): Promise<{ success: boolean; error?: string }> => {
      return new Promise((resolve) => {
        if (!socketRef.current || !state.isJoined) {
          resolve({ success: false, error: "Not connected" });
          return;
        }

        if (!state.isControlling) {
          resolve({ success: false, error: "Not authorized" });
          return;
        }

        socketRef.current.emit(
          "content.drop",
          { type, title, url, description },
          (response: { success: boolean; error?: string }) => {
            resolve(response);
          }
        );
      });
    },
    [state.isJoined, state.isControlling]
  );

  // Request current state (for syncing)
  const requestState = useCallback(() => {
    if (!socketRef.current || !state.isJoined) return;

    socketRef.current.emit(
      "content.request_state",
      { sessionId },
      (response: {
        success: boolean;
        state?: SlideState & { slideUrls?: string[] };
      }) => {
        if (response?.success && response.state) {
          setState((prev) => ({
            ...prev,
            slideState: response.state!,
          }));
        }
      }
    );
  }, [sessionId, state.isJoined]);

  // Clear dropped content
  const clearDroppedContent = useCallback((contentId?: string) => {
    setState((prev) => ({
      ...prev,
      droppedContent: contentId
        ? prev.droppedContent.filter((c) => c.id !== contentId)
        : [],
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    isConnected: state.isConnected,
    isJoined: state.isJoined,
    slideState: state.slideState,
    droppedContent: state.droppedContent,
    presentationStatus: state.presentationStatus,
    error: state.error,
    isControlling: state.isControlling,

    // Control actions (for speakers/moderators)
    nextSlide,
    prevSlide,
    goToSlide,
    startPresentation,
    stopPresentation,
    dropContent,

    // Utility actions
    requestState,
    clearDroppedContent,
    clearError,
  };
};
