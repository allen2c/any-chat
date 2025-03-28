"use client";

import { useAuth } from "@/app/context/AuthContext";

interface LoginButtonProps {
  className?: string;
  fullWidth?: boolean;
}

export function LoginButton({
  className = "",
  fullWidth = false,
}: LoginButtonProps) {
  const { login } = useAuth();

  return (
    <button
      onClick={login}
      className={`flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
        />
      </svg>
      Sign In
    </button>
  );
}
