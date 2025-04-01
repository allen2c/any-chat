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

      // Generate a random state parameter for CSRF protection
      const state = generateRandomString(32);
      localStorage.setItem("anychat_auth_state", state);

      // Generate the callback URL - this is crucial for the cross-domain auth
      const callbackUrl = `http://localhost:3010/auth/callback`;

      // Construct the login URL with authorization code flow parameters
      const loginUrl = new URL("http://localhost:3000/login");
      loginUrl.searchParams.append("client_id", "anychat_client");
      loginUrl.searchParams.append("redirect_uri", callbackUrl);
      loginUrl.searchParams.append("response_type", "code");
      loginUrl.searchParams.append("state", state);

      // Redirect to AnyAuth login
      window.location.href = loginUrl.toString();
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoggingIn(false);
    }
  };

  // Helper function to generate a random string for state parameter
  function generateRandomString(length: number) {
    const charset =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      result += charset[randomIndex];
    }
    return result;
  }

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
