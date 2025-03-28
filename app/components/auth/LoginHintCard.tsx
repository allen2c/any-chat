"use client";

import { LoginButton } from "./LoginButton";

interface LoginHintCardProps {
  isCollapsed: boolean;
}

export function LoginHintCard({ isCollapsed }: LoginHintCardProps) {
  // If sidebar is collapsed, just show a simplified version
  if (isCollapsed) {
    return (
      <div className="p-4 flex justify-center">
        <LoginButton className="p-2 w-8 h-8 flex items-center justify-center rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-black/10 dark:border-white/10">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
        <h3 className="font-medium text-sm text-blue-800 dark:text-blue-300 mb-2">
          Sign in to AnyChat
        </h3>
        <p className="text-xs text-blue-700 dark:text-blue-400 mb-3">
          Sign in to save your chat history and sync across devices.
        </p>
        <LoginButton fullWidth className="text-sm" />
      </div>
    </div>
  );
}
