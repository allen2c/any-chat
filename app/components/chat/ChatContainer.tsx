"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { useAuth } from "@/app/context/AuthContext";
import { LoginButton } from "../auth/LoginButton";
import { apiRequest } from "@/app/lib/apiFetcher";

export function ChatContainer() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      content: string;
      role: "user" | "assistant";
      timestamp: Date;
    }>
  >([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messagesInitialized, setMessagesInitialized] = useState(false);

  // Load initial messages based on authentication status
  // This is a memoized function to avoid recreation on every render
  const loadMessages = useCallback(async () => {
    if (isLoading || messagesInitialized) return; // Skip if loading or already initialized

    setIsLoadingMessages(true);

    if (isAuthenticated && user) {
      try {
        // Set a personalized welcome message
        setMessages([
          {
            id: "1",
            content: `Welcome back, ${user.name}! How can I assist you today?`,
            role: "assistant",
            timestamp: new Date(),
          },
        ]);

        // Mark as initialized to prevent multiple loads
        setMessagesInitialized(true);
      } catch (error) {
        console.error("Error loading messages:", error);
        setMessages([
          {
            id: "1",
            content: `Welcome back! There was an issue loading your messages.`,
            role: "assistant",
            timestamp: new Date(),
          },
        ]);
        setMessagesInitialized(true);
      }
    } else if (!isLoading && !isAuthenticated) {
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
      setMessagesInitialized(true);
    }

    setIsLoadingMessages(false);
  }, [isAuthenticated, user, isLoading, messagesInitialized]);

  // Only run the effect when authentication state changes
  useEffect(() => {
    loadMessages();
  }, [isAuthenticated, user, loadMessages]);

  // This is a memoized function to prevent recreation on each render
  const handleSendMessage = useCallback(
    async (content: string) => {
      // Add user message to UI immediately
      const userMessage = {
        id: Date.now().toString(),
        content,
        role: "user" as const,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Simulate AI response (in a real app, this would call the API)
      setTimeout(() => {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          content: isAuthenticated
            ? `This is a personalized response for ${
                user?.name || "you"
              }. How can I help today?`
            : "This is a response for guest users. Sign in to get personalized responses!",
          role: "assistant" as const,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }, 1000);
    },
    [isAuthenticated, user]
  );

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Display guest banner for non-authenticated users */}
      {!isLoading && !isAuthenticated && (
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 flex items-center justify-between">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            You&apos;re using AnyChat as a guest. Sign in to save your
            conversations.
          </p>
          <LoginButton className="text-xs py-1" />
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {isLoadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <MessageList messages={messages} />
        )}
      </div>

      <div className="border-t border-black/10 dark:border-white/10 p-4">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </main>
  );
}
