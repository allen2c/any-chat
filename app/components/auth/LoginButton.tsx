// app/components/auth/LoginButton.tsx
"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useState } from "react";

interface LoginButtonProps {
  className?: string;
  fullWidth?: boolean;
}

export function LoginButton({
  className = "",
  fullWidth = false,
}: LoginButtonProps) {
  const { login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);

      // Store the current URL to redirect back after login
      const currentUrl = window.location.href;
      localStorage.setItem("anychat_login_redirect", currentUrl);

      // Set the callback URL - this is the AnyChat authentication callback page
      const callbackUrl = "http://localhost:3010/auth/callback";

      // Redirect the user to the AnyAuth authorization endpoint
      const authorizeUrl = new URL("http://localhost:3000/api/auth/authorize");
      authorizeUrl.searchParams.append("client_id", "anychat_client");
      authorizeUrl.searchParams.append("redirect_uri", callbackUrl);
      authorizeUrl.searchParams.append("response_type", "code");

      window.location.href = authorizeUrl.toString();
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoggingIn(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={isLoggingIn}
      className={`flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors disabled:opacity-70 disabled:hover:bg-blue-500 ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      {isLoggingIn ? (
        <>
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Signing In...
        </>
      ) : (
        <>
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
        </>
      )}
    </button>
  );
}
