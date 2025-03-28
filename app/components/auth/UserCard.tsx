// app/components/auth/UserCard.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { User } from "@/app/components/ui/icons";
import { LogoutButton } from "@/app/components/auth/LogoutButton";
import { getUserProfile } from "@/app/lib/apiFetcher";

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

interface UserCardProps {
  compact?: boolean;
  showLogout?: boolean;
}

export function UserCard({
  compact = false,
  showLogout = true,
}: UserCardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadUserProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const userProfileData = await getUserProfile();
        setProfile(userProfileData);
      } catch (err) {
        console.error("Failed to load user profile:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load user profile"
        );
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [isAuthenticated]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
        {!compact && (
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
          </div>
        )}
      </div>
    );
  }

  if (!isAuthenticated || error) {
    return null;
  }

  if (!profile) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <User className="w-5 h-5 text-gray-500" />
        </div>
        {!compact && (
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">Guest User</p>
            <p className="text-xs text-gray-500">Not signed in</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center overflow-hidden">
        {profile.picture ? (
          <img
            src={profile.picture}
            alt={profile.full_name || profile.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-5 h-5" />
        )}
      </div>

      {!compact && (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {profile.full_name || profile.username}
          </p>
          <p className="text-xs text-black/60 dark:text-white/60 truncate">
            {profile.email}
            {profile.email_verified && (
              <span className="ml-1 text-green-500 text-xs">✓</span>
            )}
          </p>
        </div>
      )}

      {!compact && showLogout && <LogoutButton />}
    </div>
  );
}
