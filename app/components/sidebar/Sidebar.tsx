"use client";

import { SidebarHeader } from "./SidebarHeader";
import { SidebarFooter } from "./SidebarFooter";
import { useSidebar } from "@/app/context/SidebarContext";

export function Sidebar() {
  const { isCollapsed } = useSidebar();

  return (
    <aside
      className={`flex flex-col h-full bg-[#f8f9fa] dark:bg-[#202123] border-r border-black/10 dark:border-white/10 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <SidebarHeader />

      {/* Middle section - can be filled with content later */}
      <div className="flex-1 overflow-y-auto">
        {/* Content will go here in the future */}
      </div>

      <SidebarFooter />
    </aside>
  );
}
