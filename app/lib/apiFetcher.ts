"use client";

import { useAuth } from "@/app/context/AuthContext";

/**
 * Custom hook for making authenticated API requests
 */
export function useAuthFetch() {
  const { accessToken, refreshTokenIfNeeded, isAuthenticated, login } =
    useAuth();

  /**
   * Makes an authenticated API request using the JWT token
   * Automatically refreshes the token if needed
   */
  const authFetch = async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    // If not authenticated, throw error
    if (!isAuthenticated) {
      throw new Error("User is not authenticated");
    }

    try {
      // Try to refresh token if needed
      await refreshTokenIfNeeded();

      // Add the Authorization header with the token
      const headers = new Headers(options.headers || {});
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }

      // Make the request with the JWT token
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized - token might be invalid
      if (response.status === 401) {
        // Check if refresh was successful
        const refreshed = await refreshTokenIfNeeded();

        if (refreshed && accessToken) {
          // Update Authorization header and retry request
          headers.set("Authorization", `Bearer ${accessToken}`);
          return fetch(url, {
            ...options,
            headers,
          });
        } else {
          // If refresh failed, user needs to log in again
          console.error("Token refresh failed, redirecting to login");
          login();
          throw new Error("Authentication expired. Please log in again.");
        }
      }

      return response;
    } catch (error) {
      console.error("Error in authFetch:", error);
      throw error;
    }
  };

  return { authFetch };
}

/**
 * Makes a one-time authenticated API request using the stored token
 * Use this in non-hook contexts where useAuthFetch can't be used
 */
export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem("anychat_access_token");

  if (!token) {
    throw new Error("No authentication token available");
  }

  // Add the Authorization header with the token
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

  // Make the request
  return fetch(url, {
    ...options,
    headers,
  });
}
