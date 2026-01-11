// src/components/features/video/LiveVideoPlayer.tsx
"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Socket } from "socket.io-client";
import { useLiveSubtitles } from "@/hooks/use-live-subtitles";
import { SubtitleOverlay } from "../subtitles/SubtitleOverlay";
import { VideoControls } from "./VideoControls";
import { cn } from "@/lib/utils";

export interface LiveVideoPlayerRef {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleFullscreen: () => void;
}

interface LiveVideoPlayerProps {
  src: string;
  poster?: string;
  sessionId: string;
  socket: Socket | null;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onError?: (error: Event) => void;
}

export const LiveVideoPlayer = forwardRef<
  LiveVideoPlayerRef,
  LiveVideoPlayerProps
>(function LiveVideoPlayer(
  {
    src,
    poster,
    sessionId,
    socket,
    autoPlay = false,
    muted = false,
    loop = false,
    className,
    onPlay,
    onPause,
    onEnded,
    onTimeUpdate,
    onError,
  },
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { subtitles, enabled: subtitlesEnabled, pause, resume } = useLiveSubtitles({
    socket,
    sessionId,
    autoTranslate: true,
  });

  useImperativeHandle(ref, () => ({
    play: () => videoRef.current?.play(),
    pause: () => videoRef.current?.pause(),
    seek: (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    },
    setVolume: (vol: number) => {
      if (videoRef.current) {
        videoRef.current.volume = vol;
        setVolume(vol);
      }
    },
    toggleFullscreen: handleFullscreenToggle,
  }));

  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  }, [isPlaying]);

  const handleSeek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  }, []);

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume > 0) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  }, []);

  const handleMuteToggle = useCallback(() => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  }, [isMuted]);

  const handleFullscreenToggle = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      setIsPlaying(true);
      resume();
      onPlay?.();
    };

    const handlePauseEvent = () => {
      setIsPlaying(false);
      pause();
      onPause?.();
    };

    const handleTimeUpdateEvent = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime, video.duration);
    };

    const handleDurationChange = () => {
      setDuration(video.duration);
    };

    const handleLoadedData = () => {
      setIsLoading(false);
      setDuration(video.duration);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
    };

    const handleEndedEvent = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    const handleErrorEvent = (e: Event) => {
      setHasError(true);
      setIsLoading(false);
      onError?.(e);
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePauseEvent);
    video.addEventListener("timeupdate", handleTimeUpdateEvent);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("ended", handleEndedEvent);
    video.addEventListener("error", handleErrorEvent);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePauseEvent);
      video.removeEventListener("timeupdate", handleTimeUpdateEvent);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("ended", handleEndedEvent);
      video.removeEventListener("error", handleErrorEvent);
    };
  }, [onPlay, onPause, onEnded, onTimeUpdate, onError, pause, resume]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        !containerRef.current?.contains(document.activeElement) &&
        !isFullscreen
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          handlePlayPause();
          break;
        case "f":
          e.preventDefault();
          handleFullscreenToggle();
          break;
        case "m":
          e.preventDefault();
          handleMuteToggle();
          break;
        case "arrowleft":
          e.preventDefault();
          handleSeek(Math.max(0, currentTime - 10));
          break;
        case "arrowright":
          e.preventDefault();
          handleSeek(Math.min(duration, currentTime + 10));
          break;
        case "arrowup":
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.1));
          break;
        case "arrowdown":
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.1));
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isFullscreen,
    handlePlayPause,
    handleFullscreenToggle,
    handleMuteToggle,
    handleSeek,
    handleVolumeChange,
    currentTime,
    duration,
    volume,
  ]);

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
    }
  }, [isPlaying]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-black overflow-hidden group",
        isFullscreen ? "w-screen h-screen" : "w-full aspect-video",
        className
      )}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      tabIndex={0}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        className="w-full h-full object-contain"
        onClick={handlePlayPause}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
          <p className="text-lg mb-2">Failed to load video</p>
          <button
            type="button"
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
              videoRef.current?.load();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {subtitlesEnabled && (
        <SubtitleOverlay
          subtitles={subtitles}
          className={cn(
            "transition-opacity duration-300",
            showControls ? "pb-20" : ""
          )}
        />
      )}

      <div
        className={cn(
          "transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <VideoControls
          videoRef={videoRef}
          containerRef={containerRef}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          isFullscreen={isFullscreen}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onMuteToggle={handleMuteToggle}
          onFullscreenToggle={handleFullscreenToggle}
        />
      </div>

      {!isPlaying && !isLoading && !hasError && (
        <button
          type="button"
          onClick={handlePlayPause}
          className="absolute inset-0 flex items-center justify-center group-hover:bg-black/20 transition-colors"
          aria-label="Play video"
        >
          <div className="w-20 h-20 flex items-center justify-center bg-black/50 rounded-full group-hover:bg-black/70 transition-colors">
            <svg
              className="w-10 h-10 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      )}
    </div>
  );
});
