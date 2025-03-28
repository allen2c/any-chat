// app/components/sidebar/SidebarFooter.tsx
"use client";

import { useState, useEffect } from "react";
import { useSidebar } from "@/app/context/SidebarContext";
import { useAuth } from "@/app/context/AuthContext";
import { ProjectCard } from "@/app/components/sidebar/ProjectCard";
import { User } from "@/app/components/ui/icons";
import { LogoutButton } from "@/app/components/auth/LogoutButton";
import { LoginHintCard } from "@/app/components/auth/LoginHintCard";

interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  email: string;
  email_verified: boolean;
  picture: string | null;
  disabled: boolean;
  metadata: Record<string, unknown>;
}

export function SidebarFooter() {
  const { isCollapsed } = useSidebar();
  const { isAuthenticated, isLoading, accessToken } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Fetch user profile from AnyAuth's /api/me endpoint
  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const fetchUserProfile = async () => {
      setProfileLoading(true);
      setProfileError(null);

      try {
        const response = await fetch("http://localhost:3000/api/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user profile: ${response.status}`);
        }

        const data = await response.json();
        setUserProfile(data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setProfileError(
          error instanceof Error ? error.message : "Failed to load user profile"
        );
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, [isAuthenticated, accessToken]);

  return (
    <div>
      {/* Project card - always visible regardless of auth status */}
      <div className="border-t border-black/10 dark:border-white/10">
        <ProjectCard name="Personal Chat" isCollapsed={isCollapsed} />
      </div>

      {isLoading || profileLoading ? (
        // Loading state
        <div className="flex items-center gap-3 p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-t border-black/10 dark:border-white/10">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0"></div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
            </div>
          )}
        </div>
      ) : isAuthenticated && userProfile ? (
        // User info for authenticated users
        <div className="flex items-center gap-3 p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-t border-black/10 dark:border-white/10">
          <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
            {userProfile.picture ? (
              <img
                src={userProfile.picture}
                alt={userProfile.full_name || userProfile.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {userProfile.full_name || userProfile.username || "User"}
              </p>
              <p className="text-xs text-black/60 dark:text-white/60 truncate">
                {userProfile.email || ""}
                {userProfile.email_verified && (
                  <span className="ml-1 text-green-500 text-xs">✓</span>
                )}
              </p>
            </div>
          )}

          {!isCollapsed && <LogoutButton />}
        </div>
      ) : (
        // Login hint card for unauthenticated users
        <LoginHintCard isCollapsed={isCollapsed} />
      )}

      {/* Error state */}
      {profileError && !isCollapsed && (
        <div className="px-4 py-2 text-xs text-red-500">
          Failed to load profile: {profileError}
        </div>
      )}
    </div>
  );
}
