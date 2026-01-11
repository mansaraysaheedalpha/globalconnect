// src/components/features/video/VideoControls.tsx
"use client";

import { memo, useState, useCallback, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Captions,
  CaptionsOff,
} from "lucide-react";
import { useSubtitleStore } from "@/store/subtitle.store";
import { SubtitleSettings } from "../subtitles/SubtitleSettings";
import { cn } from "@/lib/utils";

interface VideoControlsProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onFullscreenToggle: () => void;
  className?: string;
}

export const VideoControls = memo(function VideoControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isFullscreen,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onFullscreenToggle,
  className,
}: VideoControlsProps) {
  const { enabled: subtitlesEnabled, toggleEnabled: toggleSubtitles } =
    useSubtitleStore();

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = useCallback((seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds)) return "0:00";

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * duration;
      onSeek(newTime);
    },
    [duration, onSeek]
  );

  const handleVolumeSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      onVolumeChange(newVolume);
    },
    [onVolumeChange]
  );

  const handleVolumeMouseEnter = useCallback(() => {
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }
    setShowVolumeSlider(true);
  }, []);

  const handleVolumeMouseLeave = useCallback(() => {
    volumeTimeoutRef.current = setTimeout(() => {
      setShowVolumeSlider(false);
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current);
      }
    };
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent",
        "px-4 pb-3 pt-8 transition-opacity duration-300",
        className
      )}
    >
      <div
        className="relative h-1 bg-white/30 rounded-full cursor-pointer mb-3 group"
        onClick={handleProgressClick}
      >
        <div
          className="absolute left-0 top-0 h-full bg-blue-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progressPercent}% - 6px)` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onPlayPause}
            className="text-white hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>

          <div
            className="relative flex items-center"
            onMouseEnter={handleVolumeMouseEnter}
            onMouseLeave={handleVolumeMouseLeave}
          >
            <button
              type="button"
              onClick={onMuteToggle}
              className="text-white hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-6 h-6" />
              ) : (
                <Volume2 className="w-6 h-6" />
              )}
            </button>

            <div
              className={cn(
                "absolute left-8 flex items-center transition-all duration-200",
                showVolumeSlider
                  ? "opacity-100 w-20"
                  : "opacity-0 w-0 overflow-hidden"
              )}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeSliderChange}
                className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                aria-label="Volume"
              />
            </div>
          </div>

          <span className="text-white text-sm tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSubtitles}
            className={cn(
              "p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50",
              subtitlesEnabled
                ? "text-blue-400 bg-blue-400/20"
                : "text-white hover:text-blue-400"
            )}
            aria-label={subtitlesEnabled ? "Hide subtitles" : "Show subtitles"}
            aria-pressed={subtitlesEnabled}
          >
            {subtitlesEnabled ? (
              <Captions className="w-5 h-5" />
            ) : (
              <CaptionsOff className="w-5 h-5" />
            )}
          </button>

          <SubtitleSettings />

          <button
            type="button"
            onClick={onFullscreenToggle}
            className="text-white hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded p-2"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
});
