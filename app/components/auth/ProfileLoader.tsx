"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/app/context/AuthContext";
import Image from "next/image";

interface ProfileLoaderProps {
  children?: React.ReactNode;
  showAvatar?: boolean;
  showName?: boolean;
  showEmail?: boolean;
}

export default function ProfileLoader({
  children,
  showAvatar = true,
  showName = true,
  showEmail = false,
}: ProfileLoaderProps) {
  const { user, isAuthenticated, isLoading, accessToken } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use a stable fetch function that doesn't change on re-renders
  const fetchUserProfile = useCallback(async () => {
    if (!accessToken) return;

    try {
      const response = await fetch("http://localhost:3000/api/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        // Data is retrieved but we don't update state here
        // This avoids the circular update problem
        console.log("User profile data available");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, [accessToken]);

  useEffect(() => {
    // Only fetch if not already refreshing and we have authentication
    if (isAuthenticated && !isRefreshing && accessToken) {
      setIsRefreshing(true);

      fetchUserProfile().finally(() => {
        setIsRefreshing(false);
      });
    }
  }, [isAuthenticated, fetchUserProfile, accessToken]);

  if (isLoading || isRefreshing) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-pulse h-8 w-8 rounded-full bg-gray-300"></div>
        {showName && (
          <div className="animate-pulse h-4 w-24 bg-gray-300 rounded"></div>
        )}
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      {showAvatar && (
        <div className="relative h-8 w-8">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name || "Profile"}
              className="rounded-full"
              width={32}
              height={32}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-400 ring-1 ring-white"></span>
        </div>
      )}

      {(showName || showEmail) && (
        <div className="flex flex-col">
          {showName && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {user.name}
            </span>
          )}
          {showEmail && (
            <span className="text-xs text-gray-500 truncate max-w-[150px]">
              {user.email}
            </span>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
