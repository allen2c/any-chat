// app/lib/apiFetcher.ts
"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useCallback } from "react";

interface UseAuthApiOptions {
  baseUrl?: string;
  requireAuth?: boolean;
  redirectToLogin?: boolean;
}

/**
 * Custom hook for making authenticated API requests to either AnyChat or AnyAuth APIs
 */
export function useAuthApi(options: UseAuthApiOptions = {}) {
  const { accessToken, refreshTokenIfNeeded, isAuthenticated, login } =
    useAuth();

  /**
   * Makes an authenticated API request using the JWT token
   */
  const authFetch = useCallback(
    async (url: string, fetchOptions: RequestInit = {}) => {
      // Default options
      const defaultOptions = {
        baseUrl: "", // Default to relative URLs (same domain)
        requireAuth: true,
        redirectToLogin: true,
        ...options,
      };

      // Check if authentication is required
      if (defaultOptions.requireAuth && !isAuthenticated) {
        if (defaultOptions.redirectToLogin) {
          login();
        }
        throw new Error("Authentication required");
      }

      // Check if token needs refreshing before making the request
      if (isAuthenticated) {
        await refreshTokenIfNeeded();
      }

      // Prepare full URL with base URL if provided
      const fullUrl = url.startsWith("http")
        ? url
        : `${defaultOptions.baseUrl}${url}`;

      // Add the Authorization header if it's not already set
      const headers = new Headers(fetchOptions.headers || {});
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }

      // Make the request
      const response = await fetch(fullUrl, {
        ...fetchOptions,
        headers,
      });

      // Handle response
      if (!response.ok) {
        // If we get a 401 Unauthorized, the token might be invalid or expired
        if (response.status === 401) {
          // Try to refresh token and retry the request
          const refreshed = await refreshTokenIfNeeded();

          if (refreshed && accessToken) {
            // Update Authorization header and retry the request
            headers.set("Authorization", `Bearer ${accessToken}`);
            const retryResponse = await fetch(fullUrl, {
              ...fetchOptions,
              headers,
            });

            if (!retryResponse.ok) {
              throw new Error(
                `Request failed with status: ${retryResponse.status}`
              );
            }

            return retryResponse;
          } else {
            // If refresh failed, redirect to login if option is enabled
            if (defaultOptions.redirectToLogin) {
              login();
            }
            throw new Error("Session expired. Please log in again.");
          }
        }

        throw new Error(`Request failed with status: ${response.status}`);
      }

      return response;
    },
    [accessToken, isAuthenticated, login, refreshTokenIfNeeded, options]
  );

  return {
    authFetch,
    isAuthenticated,
  };
}

/**
 * Makes a one-time authenticated API request to AnyAuth
 * @param url The URL to fetch, can be a relative path on AnyAuth
 * @param options Fetch options
 * @returns Response from the API
 */
export async function fetchFromAnyAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get the stored token from localStorage
  const token = localStorage.getItem("anychat_access_token");

  if (!token) {
    throw new Error("No authentication token available");
  }

  // Construct the full URL if it's a relative path
  const fullUrl = url.startsWith("http") ? url : `http://localhost:3000${url}`;

  // Add the Authorization header
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

  // Make the request
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error(`Error fetching from AnyAuth: ${url}`, error);
    throw error;
  }
}

/**
 * Get user profile from AnyAuth
 * @returns User profile data
 */
export async function getUserProfile() {
  try {
    const response = await fetchFromAnyAuth("/api/me");
    return await response.json();
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}
