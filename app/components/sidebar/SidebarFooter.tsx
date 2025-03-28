"use client";

import { useSidebar } from "@/app/context/SidebarContext";
import { useAuth } from "@/app/context/AuthContext";
import { ProjectCard } from "@/app/components/sidebar/ProjectCard";
import { User } from "@/app/components/ui/icons";
import { LogoutButton } from "@/app/components/auth/LogoutButton";
import { LoginHintCard } from "@/app/components/auth/LoginHintCard";

export function SidebarFooter() {
  const { isCollapsed } = useSidebar();
  const { user, isAuthenticated } = useAuth();

  return (
    <div>
      {/* Project card - always visible regardless of auth status */}
      <div className="border-t border-black/10 dark:border-white/10">
        <ProjectCard name="Personal Chat" isCollapsed={isCollapsed} />
      </div>

      {isAuthenticated ? (
        // User info for authenticated users
        <div className="flex items-center gap-3 p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-t border-black/10 dark:border-white/10">
          <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-black/60 dark:text-white/60 truncate">
                {user?.email || ""}
              </p>
            </div>
          )}

          {!isCollapsed && <LogoutButton />}
        </div>
      ) : (
        // Login hint card for unauthenticated users
        <LoginHintCard isCollapsed={isCollapsed} />
      )}
    </div>
  );
}
