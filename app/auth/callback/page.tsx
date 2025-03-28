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

        // Extract token data from URL parameters
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");
        const expiresIn = searchParams.get("expires_in");

        // Log what we've received for debugging
        console.log("Auth callback received params:", {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          expiresIn,
        });

        // Validate parameters
        if (!accessToken || !refreshToken || !expiresIn) {
          throw new Error("Missing authentication data in the callback URL");
        }

        // Process the tokens in our auth context
        await handleTokenCallback(
          accessToken,
          refreshToken,
          parseInt(expiresIn, 10)
        );
        setStatus("success");

        // Check if we have a saved redirect URL
        const savedRedirect = localStorage.getItem("anychat_login_redirect");
        console.log("Redirecting to:", savedRedirect || "/");

        // Clear the saved redirect
        localStorage.removeItem("anychat_login_redirect");

        // Redirect to the saved URL or home page
        if (savedRedirect) {
          router.push(savedRedirect);
        } else {
          router.push("/");
        }
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
