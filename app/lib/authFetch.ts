"use client";

// app/lib/authFetch.ts

// Constants
const TOKEN_STORAGE_KEY = "anychat_access_token";
const REFRESH_TOKEN_STORAGE_KEY = "anychat_refresh_token";

/**
 * Fetch wrapper that automatically includes the authentication token
 * and handles token refresh if needed
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get the current access token
  const accessToken = localStorage.getItem(TOKEN_STORAGE_KEY);

  // If no token is available, redirect to login
  if (!accessToken) {
    window.location.href = "http://localhost:3000/login";
    throw new Error("No authentication token available");
  }

  // Add the Authorization header if it's not already set
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
  };

  // Make the request
  let response = await fetch(url, {
    ...options,
    headers,
  });

  // If we get a 401 (Unauthorized), the token might be expired
  if (response.status === 401) {
    try {
      // Try to refresh the token
      const newToken = await refreshToken();

      // If successful, update the Authorization header and retry the request
      const newHeaders = {
        ...options.headers,
        Authorization: `Bearer ${newToken}`,
      };

      // Retry the request with the new token
      response = await fetch(url, {
        ...options,
        headers: newHeaders,
      });

      // If still unauthorized after token refresh, redirect to login
      if (response.status === 401) {
        console.error("Still unauthorized after token refresh");
        window.location.href = "http://localhost:3000/login";
        throw new Error("Authentication failed even after token refresh");
      }

      return response;
    } catch (error) {
      // If token refresh fails, redirect to login
      console.error("Token refresh failed:", error);
      window.location.href = "http://localhost:3000/login";
      throw new Error("Authentication failed");
    }
  }

  return response;
}

/**
 * Refreshes the access token using the refresh token
 * @returns A new access token
 */
async function refreshToken(): Promise<string> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  // Create FormData to match the backend expectation
  const formData = new URLSearchParams();
  formData.append("grant_type", "refresh_token");
  formData.append("refresh_token", refreshToken);

  const response = await fetch("http://localhost:3000/api/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Failed to refresh token: ${response.status}`
    );
  }

  const data = await response.json();

  // Update the stored tokens
  localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
  if (data.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, data.refresh_token);
  }

  // Also update the token expiration if available
  if (data.expires_in) {
    const expiresAt = Date.now() + data.expires_in * 1000;
    localStorage.setItem("anychat_expires_at", expiresAt.toString());
  }

  // Update the user data if it's provided in the token response
  if (data.user) {
    localStorage.setItem("anychat_user", JSON.stringify(data.user));
  }

  return data.access_token;
}
