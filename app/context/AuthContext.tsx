"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

// Define the shape of our user object
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// Define the auth state
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Define the auth context properties
interface AuthContextType extends AuthState {
  login: () => void;
  logout: () => void;
  handleTokenCallback: (
    accessToken: string,
    refreshToken: string,
    expiresIn: number
  ) => void;
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
  });

  // Initialize auth state from local storage
  useEffect(() => {
    const loadAuthState = () => {
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
            });
          } else {
            // Token expired, clear storage and state
            clearAuthData();
            setAuthState({
              user: null,
              accessToken: null,
              refreshToken: null,
              expiresAt: null,
              isLoading: false,
              isAuthenticated: false,
            });
          }
        } else {
          // No stored token
          setAuthState((prev) => ({ ...prev, isLoading: false }));
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
        });
      }
    };

    loadAuthState();
  }, []);

  // Clear all auth data from storage
  const clearAuthData = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(EXPIRES_AT_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  // Handle login redirect
  const login = () => {
    // Store the current URL to redirect back after login
    const returnUrl = encodeURIComponent(window.location.href);

    // Save the current path to localStorage for later retrieval
    localStorage.setItem("anychat_login_redirect", window.location.href);

    // Redirect to SSO login page with return URL
    window.location.href = `${SSO_URL}?callbackUrl=${returnUrl}`;
  };

  // Handle the token received from SSO callback
  const handleTokenCallback = (
    accessToken: string,
    refreshToken: string,
    expiresIn: number
  ) => {
    try {
      // Decode JWT to get user info
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      const user: User = {
        id: payload.sub,
        name: payload.name || "User",
        email: payload.email || "",
        avatar: payload.picture,
      };

      // Calculate token expiration time
      const expiresAt = Date.now() + expiresIn * 1000;

      // Store in localStorage
      localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
      localStorage.setItem(EXPIRES_AT_STORAGE_KEY, expiresAt.toString());
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

      // Update auth state
      setAuthState({
        user,
        accessToken,
        refreshToken,
        expiresAt,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Error handling token callback:", error);
      clearAuthData();
    }
  };

  // Handle logout
  const logout = () => {
    clearAuthData();
    setAuthState({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isLoading: false,
      isAuthenticated: false,
    });
    router.push("/");
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    handleTokenCallback,
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
