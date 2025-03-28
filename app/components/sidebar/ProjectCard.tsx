"use client";

import { Folder, ChevronRight } from "@/app/components/ui/icons";

interface ProjectCardProps {
  name: string;
  isCollapsed: boolean;
}

export function ProjectCard({ name, isCollapsed }: ProjectCardProps) {
  return (
    <button
      className="w-full flex items-center gap-3 p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
      onClick={() => {
        // Placeholder for project selection functionality
        console.log("Change project clicked");
      }}
    >
      <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
        <Folder className="w-5 h-5" />
      </div>

      {!isCollapsed && (
        <>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{name}</p>
            <p className="text-xs text-black/60 dark:text-white/60 truncate">
              Current project
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-black/60 dark:text-white/60" />
        </>
      )}
    </button>
  );
}
