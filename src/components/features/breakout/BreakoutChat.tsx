// src/components/features/breakout/BreakoutChat.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSocket } from "@/hooks/use-socket";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  isSystem?: boolean;
}

interface BreakoutChatProps {
  roomId: string;
  userId: string;
  userName: string;
  className?: string;
}

export function BreakoutChat({ roomId, userId, userName, className }: BreakoutChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { socket, isConnected } = useSocket();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Listen for chat messages
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleMessage = (message: ChatMessage) => {
      if (message.roomId === roomId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleMessageHistory = (data: { roomId: string; messages: ChatMessage[] }) => {
      if (data.roomId === roomId) {
        setMessages(data.messages);
      }
    };

    socket.on("breakout.chat.message", handleMessage);
    socket.on("breakout.chat.history", handleMessageHistory);

    // Request chat history
    socket.emit("breakout.chat.getHistory", { roomId });

    return () => {
      socket.off("breakout.chat.message", handleMessage);
      socket.off("breakout.chat.history", handleMessageHistory);
    };
  }, [socket, isConnected, roomId]);

  // Send a message
  const sendMessage = useCallback(() => {
    if (!socket || !inputValue.trim() || isSending) return;

    setIsSending(true);
    socket.emit(
      "breakout.chat.send",
      {
        roomId,
        content: inputValue.trim(),
      },
      (response: { success: boolean; error?: string }) => {
        setIsSending(false);
        if (response.success) {
          setInputValue("");
        } else {
          console.error("Failed to send message:", response.error);
        }
      }
    );
  }, [socket, roomId, inputValue, isSending]);

  // Handle enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={cn("flex flex-col bg-gray-900 rounded-lg border border-gray-800", className)}>
      {/* Header */}
      <div className="p-3 border-b border-gray-800 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-medium text-white">Chat</h3>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-8">
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((message) => {
              const isOwn = message.userId === userId;
              const initials = message.userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              if (message.isSystem) {
                return (
                  <div key={message.id} className="text-center">
                    <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded">
                      {message.content}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    isOwn ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {!isOwn && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn("max-w-[75%]", isOwn && "text-right")}>
                    {!isOwn && (
                      <p className="text-xs text-gray-400 mb-1">{message.userName}</p>
                    )}
                    <div
                      className={cn(
                        "rounded-lg px-3 py-2 inline-block",
                        isOwn
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-gray-100"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {format(new Date(message.timestamp), "HH:mm")}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            disabled={!isConnected || isSending}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || !isConnected || isSending}
            size="icon"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
