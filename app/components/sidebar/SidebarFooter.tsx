"use client";

import { useSidebar } from "@/app/context/SidebarContext";
import { useAuth } from "@/app/context/AuthContext";
import { ProjectCard } from "@/app/components/sidebar/ProjectCard";
import { LogoutButton } from "@/app/components/auth/LogoutButton";
import { LoginHintCard } from "@/app/components/auth/LoginHintCard";
import ProfileLoader from "@/app/components/auth/ProfileLoader";

export function SidebarFooter() {
  const { isCollapsed } = useSidebar();
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div>
      {/* Project card - always visible regardless of auth status */}
      <div className="border-t border-black/10 dark:border-white/10">
        <ProjectCard name="Personal Chat" isCollapsed={isCollapsed} />
      </div>

      {isLoading ? (
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
      ) : isAuthenticated ? (
        // User info for authenticated users
        <div className="flex items-center gap-3 p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-t border-black/10 dark:border-white/10">
          <ProfileLoader showEmail={!isCollapsed}>
            {!isCollapsed && <LogoutButton />}
          </ProfileLoader>
        </div>
      ) : (
        // Login hint card for unauthenticated users
        <LoginHintCard isCollapsed={isCollapsed} />
      )}
    </div>
  );
}
