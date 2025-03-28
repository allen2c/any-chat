"use client";

import { User, Bot } from "@/app/components/ui/icons";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={`flex gap-4 ${isAssistant ? "items-start" : "items-start"}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isAssistant
            ? "bg-blue-500 text-white"
            : "bg-black/10 dark:bg-white/10 text-foreground"
        }`}
      >
        {isAssistant ? (
          <Bot className="w-5 h-5" />
        ) : (
          <User className="w-5 h-5" />
        )}
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">
          {isAssistant ? "AI Assistant" : "You"}
        </div>
        <div className="mt-1 text-black/90 dark:text-white/90">
          {message.content}
        </div>
        <div className="text-xs text-black/50 dark:text-white/50 mt-1">
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "numeric",
  }).format(date);
}
