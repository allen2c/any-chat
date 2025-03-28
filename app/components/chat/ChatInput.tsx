"use client";

import { useState, FormEvent, KeyboardEvent } from "react";
import { Send } from "@/app/components/ui/icons";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto w-full">
      <div className="relative">
        <textarea
          className="w-full p-3 pr-12 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#2d2d2d] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 min-h-[56px] max-h-[200px]"
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          type="submit"
          className="absolute right-3 bottom-3 p-1 rounded-md text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
          disabled={!inputValue.trim()}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
