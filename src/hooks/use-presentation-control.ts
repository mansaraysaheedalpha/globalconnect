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
  currentSlide: number;    // 1-indexed (starts at 1, NOT 0)
  totalSlides: number;     // Total number of slides
  isActive: boolean;       // true = live, false = ended/not started
  slideUrls: string[];     // Array of slide image URLs (always provided by backend)
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
  // Use a ref to track canControl - this ensures callbacks always read the latest value
  // instead of a stale closure value from when the callback was created
  const canControlRef = useRef(canControl);

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

  // Keep the ref in sync with the prop (this runs synchronously on every render)
  canControlRef.current = canControl;

  // Sync isControlling state with canControl prop (for UI reactivity)
  useEffect(() => {
    setState((prev) => {
      if (prev.isControlling !== canControl) {
        return { ...prev, isControlling: canControl };
      }
      return prev;
    });
  }, [canControl]);

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
        (response: {
          success: boolean;
          error?: { message: string };
          session?: {
            chatEnabled?: boolean;
            qaEnabled?: boolean;
            pollsEnabled?: boolean;
            reactionsEnabled?: boolean;
          };
          presentationState?: SlideState;  // Backend includes this in join response
        }) => {
          if (response?.success) {
            setState((prev) => ({
              ...prev,
              isJoined: true,
              // Use presentationState from join response if available
              slideState: response.presentationState || prev.slideState,
            }));

            // Only request state if not provided in join response
            if (!response.presentationState) {
              newSocket.emit(
                "content.request_state",
                { sessionId },
                (stateResponse: {
                  success: boolean;
                  state?: SlideState;
                }) => {
                  if (stateResponse?.success && stateResponse.state) {
                    setState((prev) => ({
                      ...prev,
                      slideState: stateResponse.state!,
                    }));
                  }
                }
              );
            }
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
      setState((prev) => ({ ...prev, error: error.message }));
    });

    newSocket.on("connect_error", (error) => {
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
        // Use ref for canControl to get the latest value (avoids stale closure issue)
        const currentCanControl = canControlRef.current;

        if (!socketRef.current || !state.isJoined) {
          resolve({ success: false, error: "Not connected" });
          return;
        }

        if (!currentCanControl) {
          resolve({ success: false, error: "Not authorized to control" });
          return;
        }

        // Generate unique idempotencyKey for each action (required by backend)
        const idempotencyKey = crypto.randomUUID();

        const payload: {
          sessionId: string;
          action: ContentAction;
          targetSlide?: number;
          idempotencyKey: string;
        } = {
          sessionId,
          action,
          idempotencyKey,
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
    [sessionId, state.isJoined] // Note: canControlRef is a ref, doesn't need to be a dependency
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

        // Use ref to get latest canControl value
        if (!canControlRef.current) {
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
    [state.isJoined]
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
