"use client";

import { useState, useEffect } from "react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { useAuth } from "@/app/context/AuthContext";
import { LoginButton } from "../auth/LoginButton";

export function ChatContainer() {
  const { isAuthenticated, user } = useAuth();
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      content: string;
      role: "user" | "assistant";
      timestamp: Date;
    }>
  >([]);

  // Load initial messages based on authentication status
  useEffect(() => {
    if (isAuthenticated) {
      // For authenticated users, we might load their message history here
      // For now, just show a personalized welcome message
      setMessages([
        {
          id: "1",
          content: `Welcome back, ${
            user?.name || "there"
          }! How can I assist you today?`,
          role: "assistant",
          timestamp: new Date(),
        },
      ]);
    } else {
      // For anonymous users, show a general welcome with login prompt
      setMessages([
        {
          id: "1",
          content:
            "Welcome to AnyChat! You're currently using the app as a guest. Your messages won't be saved between sessions.",
          role: "assistant",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isAuthenticated, user]);

  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      content,
      role: "user" as const,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Simulate AI response (in a real app, this would call an API)
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: isAuthenticated
          ? "This is a personalized response for registered users."
          : "This is a response for guest users. Sign in to get personalized responses!",
        role: "assistant" as const,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Display guest banner for non-authenticated users */}
      {!isAuthenticated && (
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 flex items-center justify-between">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            You&apos;re using AnyChat as a guest. Sign in to save your
            conversations.
          </p>
          <LoginButton className="text-xs py-1" />
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} />
      </div>
      <div className="border-t border-black/10 dark:border-white/10 p-4">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </main>
  );
}
