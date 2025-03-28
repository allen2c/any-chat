"use client";

import { useSidebar } from "@/app/context/SidebarContext";
import { ChevronLeft, ChevronRight } from "@/app/components/ui/icons";

export function SidebarHeader() {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <div className="flex items-center justify-between p-4 h-16 border-b border-black/10 dark:border-white/10">
      <div className="flex items-center gap-2 overflow-hidden">
        {/* Logo */}
        <div className="flex-shrink-0 w-8 h-8 bg-foreground text-background rounded-md flex items-center justify-center font-bold">
          AI
        </div>

        {/* App name - hidden when collapsed */}
        {!isCollapsed && (
          <span className="font-semibold truncate transition-opacity">
            AnyChat
          </span>
        )}
      </div>

      {/* Collapse trigger button */}
      <button
        onClick={toggleSidebar}
        className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
