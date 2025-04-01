"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

// Define the shape of our user object
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  email_verified?: boolean;
  username?: string;
  full_name?: string;
  disabled?: boolean;
  metadata?: Record<string, unknown>;
}

// Define the auth state
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Define the auth context properties
interface AuthContextType extends AuthState {
  login: () => void;
  logout: () => void;
  handleTokenCallback: (
    accessToken: string,
    refreshToken: string,
    expiresIn: number
  ) => Promise<void>;
  refreshTokenIfNeeded: () => Promise<boolean>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// SSO login URL
const SSO_URL = "http://localhost:3000/login";

// Local storage keys (prefixed for security)
const TOKEN_STORAGE_KEY = "anychat_access_token";
const REFRESH_TOKEN_STORAGE_KEY = "anychat_refresh_token";
const EXPIRES_AT_STORAGE_KEY = "anychat_expires_at";
const USER_STORAGE_KEY = "anychat_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Flag to prevent duplicate refreshes or updates
  const [isInitialized, setIsInitialized] = useState(false);

  // Clear all auth data from storage - stable function reference
  const clearAuthData = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(EXPIRES_AT_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }, []);

  // Fetch user data using token
  const fetchUserData = useCallback(
    async (token: string): Promise<User | null> => {
      try {
        const response = await fetch("http://localhost:3000/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        const userData = await response.json();

        // Convert the API response to our User interface
        const user: User = {
          id: userData.id,
          name: userData.full_name || userData.username || "User",
          email: userData.email || "",
          avatar: userData.picture || null,
          email_verified: userData.email_verified,
          username: userData.username,
          full_name: userData.full_name,
          disabled: userData.disabled,
          metadata: userData.metadata,
        };

        return user;
      } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
      }
    },
    []
  );

  // Refresh token - stable function reference
  const refreshToken = useCallback(
    async (refreshTokenValue: string): Promise<boolean> => {
      try {
        // Create FormData for the request
        const formData = new URLSearchParams();
        formData.append("grant_type", "refresh_token");
        formData.append("refresh_token", refreshTokenValue);

        // Make the request to refresh token
        const response = await fetch("http://localhost:3000/api/auth/refresh", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to refresh token: ${response.status}`);
        }

        const data = await response.json();

        // Calculate expiration time
        const expiresAt = Date.now() + data.expires_in * 1000;

        // Store new tokens
        localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, data.refresh_token);
        localStorage.setItem(EXPIRES_AT_STORAGE_KEY, expiresAt.toString());

        // Fetch user data with the new token
        const userData = await fetchUserData(data.access_token);
        if (userData) {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));

          // Update auth state
          setAuthState({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: expiresAt,
            user: userData,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          });

          return true;
        }

        return false;
      } catch (error) {
        console.error("Token refresh failed:", error);
        return false;
      }
    },
    [fetchUserData]
  );

  // Initialize auth state from local storage
  useEffect(() => {
    // Skip if already initialized
    if (isInitialized) return;

    const loadAuthState = async () => {
      try {
        // Get stored values
        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        const storedRefreshToken = localStorage.getItem(
          REFRESH_TOKEN_STORAGE_KEY
        );
        const storedExpiresAt = localStorage.getItem(EXPIRES_AT_STORAGE_KEY);
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);

        if (storedToken && storedExpiresAt && storedUser) {
          const expiresAt = parseInt(storedExpiresAt, 10);
          const user = JSON.parse(storedUser);

          // Check if token is expired
          if (expiresAt > Date.now()) {
            setAuthState({
              accessToken: storedToken,
              refreshToken: storedRefreshToken,
              expiresAt,
              user,
              isLoading: false,
              isAuthenticated: true,
              error: null,
            });

            // Mark as initialized to prevent loops
            setIsInitialized(true);
          } else if (storedRefreshToken) {
            // Token expired, try to refresh
            try {
              const refreshed = await refreshToken(storedRefreshToken);
              if (refreshed) {
                console.log("Successfully refreshed token on init");
                // Mark as initialized to prevent loops
                setIsInitialized(true);
              } else {
                // Refresh failed, clear storage and state
                clearAuthData();
                setAuthState({
                  user: null,
                  accessToken: null,
                  refreshToken: null,
                  expiresAt: null,
                  isLoading: false,
                  isAuthenticated: false,
                  error: "Session expired. Please log in again.",
                });
                setIsInitialized(true);
              }
            } catch (error) {
              console.error("Error refreshing token on init:", error);
              clearAuthData();
              setAuthState({
                user: null,
                accessToken: null,
                refreshToken: null,
                expiresAt: null,
                isLoading: false,
                isAuthenticated: false,
                error: "Failed to refresh authentication. Please log in again.",
              });
              setIsInitialized(true);
            }
          } else {
            // No refresh token, clear storage and state
            clearAuthData();
            setAuthState({
              user: null,
              accessToken: null,
              refreshToken: null,
              expiresAt: null,
              isLoading: false,
              isAuthenticated: false,
              error: null,
            });
            setIsInitialized(true);
          }
        } else {
          // No stored token
          setAuthState((prev) => ({ ...prev, isLoading: false }));
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Error loading auth state:", error);
        clearAuthData();
        setAuthState({
          user: null,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          isLoading: false,
          isAuthenticated: false,
          error: "Failed to load authentication state.",
        });
        setIsInitialized(true);
      }
    };

    loadAuthState();
  }, [clearAuthData, fetchUserData, refreshToken, isInitialized]);

  // Handle login redirect
  const login = useCallback(() => {
    // Store the current URL to redirect back after login
    const returnUrl = encodeURIComponent(window.location.href);

    // Save the current path to localStorage for later retrieval
    localStorage.setItem("anychat_login_redirect", returnUrl);

    // Generate the callback URL for AnyAuth to redirect back to
    const callbackUrl = `http://localhost:3010/auth/callback`;

    // Redirect to SSO login page with callback URL
    window.location.href = `${SSO_URL}?callbackUrl=${encodeURIComponent(
      callbackUrl
    )}`;
  }, []);

  // Handle the token received from SSO callback
  const handleTokenCallback = useCallback(
    async (accessToken: string, refreshToken: string, expiresAt: number) => {
      try {
        console.log("Processing auth tokens...");

        // Store in localStorage
        localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
        localStorage.setItem(EXPIRES_AT_STORAGE_KEY, expiresAt.toString());

        console.log("Tokens stored in localStorage");

        // Fetch user data with the token
        const userData = await fetchUserData(accessToken);

        if (!userData) {
          throw new Error("Failed to fetch user data after authentication");
        }

        console.log("User data retrieved successfully");

        // Store user data
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));

        // Update auth state
        setAuthState({
          user: userData,
          accessToken,
          refreshToken,
          expiresAt,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });

        // Update initialization status
        setIsInitialized(true);

        console.log("Authentication completed successfully");
      } catch (error) {
        console.error("Error handling token callback:", error);
        clearAuthData();
        throw error; // Re-throw to be handled by the callback page
      }
    },
    [clearAuthData, fetchUserData]
  );

  // Check if token needs refreshing and refresh if needed
  const refreshTokenIfNeeded = useCallback(async (): Promise<boolean> => {
    // If no refresh token or not authenticated, return false
    if (!authState.refreshToken || !authState.isAuthenticated) {
      return false;
    }

    // If token is expiring soon (within 5 minutes), refresh it
    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
    if (authState.expiresAt && authState.expiresAt < fiveMinutesFromNow) {
      return await refreshToken(authState.refreshToken);
    }

    // Token is still valid
    return true;
  }, [
    authState.refreshToken,
    authState.isAuthenticated,
    authState.expiresAt,
    refreshToken,
  ]);

  // Handle logout
  const logout = useCallback(() => {
    clearAuthData();
    setAuthState({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    });
    router.push("/");
  }, [clearAuthData, router]);

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    handleTokenCallback,
    refreshTokenIfNeeded,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
