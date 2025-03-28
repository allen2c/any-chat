"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useAuthFetch } from "@/app/lib/apiFetcher";
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
  const { user, isAuthenticated, isLoading } = useAuth();
  const { authFetch } = useAuthFetch();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // If user is authenticated but we don't have complete info, fetch it
    const fetchUserProfile = async () => {
      if (isAuthenticated && user && !isRefreshing) {
        setIsRefreshing(true);
        try {
          const response = await authFetch("http://localhost:3000/api/me");
          if (response.ok) {
            // User profile is automatically updated in AuthContext
            console.log("User profile refreshed");
          }
        } catch (error) {
          console.error("Error refreshing profile:", error);
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    fetchUserProfile();
  }, [isAuthenticated, user, authFetch]);

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
