// app/auth/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function AuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { handleTokenCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );

  useEffect(() => {
    const processCallback = async () => {
      try {
        setStatus("processing");

        // Extract parameters from URL
        const code = searchParams.get("code");
        const error = searchParams.get("error");

        // Check for error in the callback
        if (error) {
          throw new Error(`Authentication error: ${error}`);
        }

        // Validate parameters
        if (!code) {
          throw new Error("No authorization code received");
        }

        // Clear the state from storage
        localStorage.removeItem("anychat_auth_state");

        console.log("Authorization code received, exchanging for tokens...");

        // Exchange the authorization code for tokens via our backend
        const response = await fetch("/api/auth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            grant_type: "authorization_code",
            code,
            redirect_uri: "http://localhost:3010/auth/callback",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to exchange code for token"
          );
        }

        // Get the tokens from the response
        const tokenData = await response.json();

        // Process the tokens in our auth context
        await handleTokenCallback(
          tokenData.accessToken,
          tokenData.refreshToken,
          tokenData.expiresAt
        );

        setStatus("success");

        // Check for a saved redirect URL
        const savedRedirect = localStorage.getItem("anychat_login_redirect");

        // Clear the saved redirect
        localStorage.removeItem("anychat_login_redirect");

        // Redirect to the saved URL or home page
        router.push(savedRedirect || "/");
      } catch (err) {
        console.error("Error processing auth callback:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to process authentication"
        );
        setStatus("error");
      }
    };

    processCallback();
  }, [searchParams, router, handleTokenCallback]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="max-w-md w-full p-6 bg-white dark:bg-[#202123] rounded-lg shadow-lg">
          <h1 className="text-xl font-bold mb-4 text-red-600">
            Authentication Error
          </h1>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full p-6 bg-white dark:bg-[#202123] rounded-lg shadow-lg">
        <h1 className="text-xl font-bold mb-4">Completing Login</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <p className="text-sm text-center mt-4 text-gray-600">
          Verifying your credentials and setting up your session...
        </p>
      </div>
    </div>
  );
}
