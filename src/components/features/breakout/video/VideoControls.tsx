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
  Gauge
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
  cpuLoadState?: "normal" | "high" | "critical";
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onToggleChat?: () => void;
  onLeave: () => void;
  onSetVideoQuality?: (quality: "low" | "medium" | "high") => void;
  className?: string;
}

export function VideoControls({
  isMicOn,
  isCameraOn,
  isScreenSharing,
  isChatOpen,
  cpuLoadState = "normal",
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onToggleChat,
  onLeave,
  onSetVideoQuality,
  className,
}: VideoControlsProps) {
  return (
    <TooltipProvider>
      <div className={cn(
        "flex items-center justify-center gap-2 p-4 bg-gray-900/95 backdrop-blur-sm rounded-xl",
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
                "rounded-full w-12 h-12",
                isMicOn
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              )}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
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
                "rounded-full w-12 h-12",
                isCameraOn
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              )}
            >
              {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
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
                "rounded-full w-12 h-12",
                isScreenSharing
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-white"
              )}
            >
              {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isScreenSharing ? "Stop sharing" : "Share screen"}</p>
          </TooltipContent>
        </Tooltip>

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
                  "rounded-full w-12 h-12",
                  isChatOpen
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-700 hover:bg-gray-600 text-white"
                )}
              >
                <MessageSquare className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isChatOpen ? "Close chat" : "Open chat"}</p>
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
                    <Gauge className="w-5 h-5" />
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
              <PhoneOff className="w-5 h-5" />
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
