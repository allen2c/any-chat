"use client";

import { useState } from "react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

export function ChatContainer() {
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      content: string;
      role: "user" | "assistant";
      timestamp: Date;
    }>
  >([
    {
      id: "1",
      content: "Hello! How can I assist you today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);

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
        content: "This is a simulated response from the AI assistant.",
        role: "assistant" as const,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} />
      </div>
      <div className="border-t border-black/10 dark:border-white/10 p-4">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </main>
  );
}
