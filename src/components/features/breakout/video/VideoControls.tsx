// src/components/features/breakout/video/VideoControls.tsx
"use client";

import React from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  PhoneOff,
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

function ControlButton({
  icon: Icon,
  label,
  isActive,
  isDanger,
  isWarning,
  onClick,
  tooltipText,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label?: string;
  isActive?: boolean;
  isDanger?: boolean;
  isWarning?: boolean;
  onClick: () => void;
  tooltipText: string;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "group/btn relative flex flex-col items-center gap-1 outline-none",
            className
          )}
        >
          <div
            className={cn(
              "flex items-center justify-center rounded-full transition-all duration-200",
              "w-11 h-11 sm:w-12 sm:h-12",
              isDanger
                ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25"
                : isWarning
                ? "bg-red-500/90 hover:bg-red-600 text-white"
                : isActive
                ? "bg-white/20 hover:bg-white/30 text-white ring-1 ring-white/20"
                : "bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
            )}
          >
            <Icon className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
          </div>
          {label && (
            <span className="hidden sm:block text-[10px] text-white/50 group-hover/btn:text-white/70 transition-colors">
              {label}
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="font-medium">
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function VideoControls({
  isMicOn,
  isCameraOn,
  isScreenSharing,
  isRecording,
  isCaptionsOn,
  cpuLoadState = "normal",
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onToggleRecording,
  onToggleCaptions,
  onLeave,
  onSetVideoQuality,
  className,
}: VideoControlsProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "inline-flex items-end gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3",
          "bg-gray-900/80 backdrop-blur-xl rounded-2xl",
          "border border-white/[0.08] shadow-2xl shadow-black/40",
          className
        )}
      >
        {/* CPU Load Warning */}
        {cpuLoadState !== "normal" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium mr-1 self-center",
                  cpuLoadState === "critical"
                    ? "bg-red-500/20 text-red-400 animate-pulse"
                    : "bg-yellow-500/20 text-yellow-400"
                )}
              >
                <Cpu className="w-3 h-3" />
                <span className="hidden sm:inline">
                  {cpuLoadState === "critical" ? "CPU Critical" : "High CPU"}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                {cpuLoadState === "critical"
                  ? "CPU is overloaded. Your camera was turned off automatically. Consider closing other apps."
                  : "High CPU usage detected. Consider turning off your camera to improve performance."}
              </p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Mic */}
        <ControlButton
          icon={isMicOn ? Mic : MicOff}
          label={isMicOn ? "Mic" : "Muted"}
          isActive={isMicOn}
          isWarning={!isMicOn}
          onClick={onToggleMic}
          tooltipText={isMicOn ? "Mute microphone" : "Unmute microphone"}
        />

        {/* Camera */}
        <ControlButton
          icon={isCameraOn ? Video : VideoOff}
          label={isCameraOn ? "Camera" : "No Cam"}
          isActive={isCameraOn}
          isWarning={!isCameraOn}
          onClick={onToggleCamera}
          tooltipText={isCameraOn ? "Turn off camera" : "Turn on camera"}
        />

        {/* Screen Share */}
        <ControlButton
          icon={isScreenSharing ? MonitorOff : Monitor}
          label={isScreenSharing ? "Sharing" : "Share"}
          isActive={isScreenSharing}
          onClick={onToggleScreenShare}
          tooltipText={isScreenSharing ? "Stop sharing" : "Share screen"}
        />

        {/* Recording */}
        {onToggleRecording && (
          <ControlButton
            icon={Circle}
            label={isRecording ? "Stop Rec" : "Record"}
            isActive={isRecording}
            isWarning={isRecording}
            onClick={onToggleRecording}
            tooltipText={isRecording ? "Stop recording" : "Start recording"}
          />
        )}

        {/* Divider */}
        <div className="w-px h-8 bg-white/10 mx-1 sm:mx-1.5 self-center" />

        {/* Captions */}
        {onToggleCaptions && (
          <ControlButton
            icon={Subtitles}
            label="Captions"
            isActive={isCaptionsOn}
            onClick={onToggleCaptions}
            tooltipText={isCaptionsOn ? "Hide captions" : "Show captions"}
          />
        )}

        {/* Video Quality */}
        {onSetVideoQuality && (
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button className="group/btn flex flex-col items-center gap-1 outline-none">
                    <div className="flex items-center justify-center rounded-full w-11 h-11 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-200">
                      <Gauge className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
                    </div>
                    <span className="hidden sm:block text-[10px] text-white/50 group-hover/btn:text-white/70 transition-colors">
                      Quality
                    </span>
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Video quality</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent
              align="center"
              side="top"
              sideOffset={12}
              className="bg-gray-900/95 backdrop-blur-xl border-white/10 shadow-2xl min-w-[180px]"
            >
              <DropdownMenuLabel className="text-gray-400 text-xs">
                Video Quality
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={() => onSetVideoQuality("high")}
                className="text-gray-200 focus:bg-white/10 focus:text-white cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span>High</span>
                  <span className="text-xs text-gray-500">Best quality</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onSetVideoQuality("medium")}
                className="text-gray-200 focus:bg-white/10 focus:text-white cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span>Medium</span>
                  <span className="text-xs text-gray-500">Balanced</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onSetVideoQuality("low")}
                className="text-gray-200 focus:bg-white/10 focus:text-white cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span>Low</span>
                  <span className="text-xs text-gray-500">Save bandwidth</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Divider before leave */}
        <div className="w-px h-8 bg-white/10 mx-1 sm:mx-1.5 self-center" />

        {/* Leave Call */}
        <ControlButton
          icon={PhoneOff}
          label="Leave"
          isDanger
          onClick={onLeave}
          tooltipText="Leave session"
        />
      </div>
    </TooltipProvider>
  );
}
