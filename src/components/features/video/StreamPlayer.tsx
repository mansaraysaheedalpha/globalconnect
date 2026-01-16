// src/components/features/video/StreamPlayer.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { LiveVideoPlayer } from "./LiveVideoPlayer";
import { Socket } from "socket.io-client";
import { AlertCircle, RefreshCw, Video, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

type StreamType = "youtube" | "vimeo" | "hls" | "direct" | "unknown";

interface StreamPlayerProps {
  url: string;
  sessionId: string;
  socket?: Socket | null;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onError?: (error: string) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

/**
 * Detects the type of streaming URL
 */
function getStreamType(url: string): StreamType {
  if (!url) return "unknown";

  const lowerUrl = url.toLowerCase();

  // YouTube
  if (
    lowerUrl.includes("youtube.com/watch") ||
    lowerUrl.includes("youtube.com/embed") ||
    lowerUrl.includes("youtu.be/") ||
    lowerUrl.includes("youtube.com/live")
  ) {
    return "youtube";
  }

  // Vimeo
  if (
    lowerUrl.includes("vimeo.com/") ||
    lowerUrl.includes("player.vimeo.com")
  ) {
    return "vimeo";
  }

  // HLS streams
  if (lowerUrl.includes(".m3u8")) {
    return "hls";
  }

  // Direct video files
  if (
    lowerUrl.endsWith(".mp4") ||
    lowerUrl.endsWith(".webm") ||
    lowerUrl.endsWith(".ogg") ||
    lowerUrl.includes(".mp4?") ||
    lowerUrl.includes(".webm?")
  ) {
    return "direct";
  }

  // Default to direct for unknown URLs (let video element try)
  return "direct";
}

/**
 * Extracts YouTube video ID from various URL formats
 */
function extractYouTubeId(url: string): string | null {
  // Handle youtu.be URLs
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // Handle youtube.com/watch?v= URLs
  const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // Handle youtube.com/embed/ URLs
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  // Handle youtube.com/live/ URLs
  const liveMatch = url.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/);
  if (liveMatch) return liveMatch[1];

  // Handle v= parameter anywhere in URL
  const paramMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (paramMatch) return paramMatch[1];

  return null;
}

/**
 * Extracts Vimeo video ID from various URL formats
 */
function extractVimeoId(url: string): string | null {
  // Handle vimeo.com/123456789 URLs
  const standardMatch = url.match(/vimeo\.com\/(\d+)/);
  if (standardMatch) return standardMatch[1];

  // Handle player.vimeo.com/video/123456789 URLs
  const playerMatch = url.match(/player\.vimeo\.com\/video\/(\d+)/);
  if (playerMatch) return playerMatch[1];

  return null;
}

/**
 * YouTube Embed Component
 */
function YouTubeEmbed({
  videoId,
  autoPlay,
  muted,
  className,
  onPlay,
  onError,
}: {
  videoId: string;
  autoPlay?: boolean;
  muted?: boolean;
  className?: string;
  onPlay?: () => void;
  onError?: (error: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const embedUrl = useMemo(() => {
    const params = new URLSearchParams({
      autoplay: autoPlay ? "1" : "0",
      mute: muted ? "1" : "0",
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
      enablejsapi: "1",
    });
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }, [videoId, autoPlay, muted]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onPlay?.();
  }, [onPlay]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.("Failed to load YouTube video");
  }, [onError]);

  if (hasError) {
    return (
      <div className={cn("relative bg-black flex items-center justify-center", className)}>
        <div className="text-center text-white p-6">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <p className="text-lg mb-2">Failed to load video</p>
          <p className="text-sm text-gray-400 mb-4">The YouTube video could not be loaded</p>
          <Button
            variant="outline"
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
            }}
            className="text-white border-white/30 hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative bg-black", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/70 text-sm">Loading stream...</p>
          </div>
        </div>
      )}
      <iframe
        src={embedUrl}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full"
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

/**
 * Vimeo Embed Component
 */
function VimeoEmbed({
  videoId,
  autoPlay,
  muted,
  className,
  onPlay,
  onError,
}: {
  videoId: string;
  autoPlay?: boolean;
  muted?: boolean;
  className?: string;
  onPlay?: () => void;
  onError?: (error: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const embedUrl = useMemo(() => {
    const params = new URLSearchParams({
      autoplay: autoPlay ? "1" : "0",
      muted: muted ? "1" : "0",
      playsinline: "1",
      title: "0",
      byline: "0",
      portrait: "0",
    });
    return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
  }, [videoId, autoPlay, muted]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onPlay?.();
  }, [onPlay]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.("Failed to load Vimeo video");
  }, [onError]);

  if (hasError) {
    return (
      <div className={cn("relative bg-black flex items-center justify-center", className)}>
        <div className="text-center text-white p-6">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <p className="text-lg mb-2">Failed to load video</p>
          <p className="text-sm text-gray-400 mb-4">The Vimeo video could not be loaded</p>
          <Button
            variant="outline"
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
            }}
            className="text-white border-white/30 hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative bg-black", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/70 text-sm">Loading stream...</p>
          </div>
        </div>
      )}
      <iframe
        src={embedUrl}
        title="Vimeo video player"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

/**
 * No Stream Available Component
 */
function NoStreamAvailable({ className }: { className?: string }) {
  return (
    <div className={cn("relative bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center", className)}>
      <div className="text-center text-white p-6">
        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
          <Video className="h-10 w-10 text-white/50" />
        </div>
        <p className="text-lg font-medium mb-2">No Stream Available</p>
        <p className="text-sm text-gray-400 max-w-sm">
          The live stream for this session hasn't been configured yet.
          Please check back when the session starts.
        </p>
      </div>
    </div>
  );
}

/**
 * StreamPlayer - Smart video player that handles YouTube, Vimeo, HLS, and direct video URLs
 */
export function StreamPlayer({
  url,
  sessionId,
  socket = null,
  poster,
  autoPlay = false,
  muted = false,
  className,
  onPlay,
  onPause,
  onError,
  onTimeUpdate,
}: StreamPlayerProps) {
  const streamType = useMemo(() => getStreamType(url), [url]);

  // Container class for aspect ratio
  const containerClass = cn(
    "w-full aspect-video rounded-lg overflow-hidden",
    className
  );

  // No URL provided
  if (!url) {
    return <NoStreamAvailable className={containerClass} />;
  }

  // YouTube embed
  if (streamType === "youtube") {
    const videoId = extractYouTubeId(url);
    if (!videoId) {
      return <NoStreamAvailable className={containerClass} />;
    }
    return (
      <YouTubeEmbed
        videoId={videoId}
        autoPlay={autoPlay}
        muted={muted}
        className={containerClass}
        onPlay={onPlay}
        onError={onError}
      />
    );
  }

  // Vimeo embed
  if (streamType === "vimeo") {
    const videoId = extractVimeoId(url);
    if (!videoId) {
      return <NoStreamAvailable className={containerClass} />;
    }
    return (
      <VimeoEmbed
        videoId={videoId}
        autoPlay={autoPlay}
        muted={muted}
        className={containerClass}
        onPlay={onPlay}
        onError={onError}
      />
    );
  }

  // HLS or direct video - use LiveVideoPlayer
  return (
    <LiveVideoPlayer
      src={url}
      sessionId={sessionId}
      socket={socket}
      poster={poster}
      autoPlay={autoPlay}
      muted={muted}
      className={containerClass}
      onPlay={onPlay}
      onPause={onPause}
      onError={(e) => onError?.("Failed to load video")}
      onTimeUpdate={onTimeUpdate}
    />
  );
}

export default StreamPlayer;
