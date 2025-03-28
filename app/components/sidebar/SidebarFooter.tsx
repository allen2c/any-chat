"use client";

import { useSidebar } from "@/app/context/SidebarContext";
import { ProjectCard } from "@/app/components/sidebar/ProjectCard";
import { User } from "@/app/components/ui/icons";

export function SidebarFooter() {
  const { isCollapsed } = useSidebar();

  return (
    <div className="border-t border-black/10 dark:border-white/10">
      {/* Project card */}
      <ProjectCard name="Personal Chat" isCollapsed={isCollapsed} />

      {/* User info */}
      <div className="flex items-center gap-3 p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
        <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
          <User className="w-5 h-5" />
        </div>

        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">User Name</p>
            <p className="text-xs text-black/60 dark:text-white/60 truncate">
              user@example.com
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
