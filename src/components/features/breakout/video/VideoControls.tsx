// src/components/features/breakout/video/VideoControls.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  PhoneOff,
  MessageSquare,
  Cpu,
  Gauge,
  Circle,
  Subtitles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VideoControlsProps {
  isMicOn: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  isChatOpen?: boolean;
  isRecording?: boolean;
  isCaptionsOn?: boolean;
  cpuLoadState?: "normal" | "high" | "critical";
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onToggleChat?: () => void;
  onToggleRecording?: () => void;
  onToggleCaptions?: () => void;
  onLeave: () => void;
  onSetVideoQuality?: (quality: "low" | "medium" | "high") => void;
  className?: string;
}

export function VideoControls({
  isMicOn,
  isCameraOn,
  isScreenSharing,
  isChatOpen,
  isRecording,
  isCaptionsOn,
  cpuLoadState = "normal",
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onToggleChat,
  onToggleRecording,
  onToggleCaptions,
  onLeave,
  onSetVideoQuality,
  className,
}: VideoControlsProps) {
  return (
    <TooltipProvider>
      <div className={cn(
        "flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-900/95 backdrop-blur-sm rounded-xl",
        className
      )}>
        {/* CPU Load Warning */}
        {cpuLoadState !== "normal" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mr-2",
                cpuLoadState === "critical"
                  ? "bg-red-500/20 text-red-400 animate-pulse"
                  : "bg-yellow-500/20 text-yellow-400"
              )}>
                <Cpu className="w-3.5 h-3.5" />
                {cpuLoadState === "critical" ? "CPU Critical" : "High CPU"}
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                {cpuLoadState === "critical"
                  ? "CPU is overloaded. Your camera was turned off automatically. Consider closing other applications."
                  : "High CPU usage detected. Consider turning off your camera to improve performance."}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
        {/* Microphone Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="lg"
              onClick={onToggleMic}
              className={cn(
                "rounded-full w-10 h-10 sm:w-12 sm:h-12",
                isMicOn
                  ? "bg-white/20 hover:bg-white/30 text-white border-2 border-white/40"
                  : "bg-red-600 hover:bg-red-700 text-white"
              )}
            >
              {isMicOn ? <Mic className="w-4 h-4 sm:w-5 sm:h-5" /> : <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isMicOn ? "Mute microphone" : "Unmute microphone"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Camera Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="lg"
              onClick={onToggleCamera}
              className={cn(
                "rounded-full w-10 h-10 sm:w-12 sm:h-12",
                isCameraOn
                  ? "bg-white/20 hover:bg-white/30 text-white border-2 border-white/40"
                  : "bg-red-600 hover:bg-red-700 text-white"
              )}
            >
              {isCameraOn ? <Video className="w-4 h-4 sm:w-5 sm:h-5" /> : <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isCameraOn ? "Turn off camera" : "Turn on camera"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Screen Share Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="lg"
              onClick={onToggleScreenShare}
              className={cn(
                "rounded-full w-10 h-10 sm:w-12 sm:h-12",
                isScreenSharing
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-white/20 hover:bg-white/30 text-white border-2 border-white/40"
              )}
            >
              {isScreenSharing ? <MonitorOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isScreenSharing ? "Stop sharing" : "Share screen"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Recording Toggle */}
        {onToggleRecording && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="lg"
                onClick={onToggleRecording}
                className={cn(
                  "rounded-full w-10 h-10 sm:w-12 sm:h-12",
                  isRecording
                    ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                    : "bg-gray-700 hover:bg-gray-600 text-white"
                )}
              >
                <Circle className={cn("w-5 h-5", isRecording && "fill-current")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isRecording ? "Stop recording" : "Start recording"}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Divider */}
        <div className="w-px h-8 bg-gray-600 mx-2" />

        {/* Chat Toggle */}
        {onToggleChat && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="lg"
                onClick={onToggleChat}
                className={cn(
                  "rounded-full w-10 h-10 sm:w-12 sm:h-12",
                  isChatOpen
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-700 hover:bg-gray-600 text-white"
                )}
              >
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isChatOpen ? "Close chat" : "Open chat"}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Captions Toggle */}
        {onToggleCaptions && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="lg"
                onClick={onToggleCaptions}
                className={cn(
                  "rounded-full w-10 h-10 sm:w-12 sm:h-12",
                  isCaptionsOn
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-700 hover:bg-gray-600 text-white"
                )}
              >
                <Subtitles className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isCaptionsOn ? "Hide captions" : "Show captions"}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Video Quality Settings */}
        {onSetVideoQuality && (
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="rounded-full w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white"
                  >
                    <Gauge className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Video quality</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="center" className="bg-gray-800 border-gray-700">
              <DropdownMenuLabel className="text-gray-300">Video Quality</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem
                onClick={() => onSetVideoQuality("high")}
                className="text-gray-200 focus:bg-gray-700"
              >
                High (Best quality)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onSetVideoQuality("medium")}
                className="text-gray-200 focus:bg-gray-700"
              >
                Medium (Balanced)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onSetVideoQuality("low")}
                className="text-gray-200 focus:bg-gray-700"
              >
                Low (Save bandwidth)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Leave Call */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="lg"
              onClick={onLeave}
              className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700 text-white"
            >
              <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Leave room</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
