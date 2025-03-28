"use client";

import { useAuth } from "@/app/context/AuthContext";

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className = "" }: LogoutButtonProps) {
  const { logout } = useAuth();

  return (
    <button
      onClick={logout}
      className={`text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors ${className}`}
      aria-label="Logout"
    >
      Logout
    </button>
  );
}
