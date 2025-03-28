import { Sidebar } from "@/app/components/sidebar/Sidebar";
import { ChatContainer } from "@/app/components/chat/ChatContainer";
import { SidebarProvider } from "@/app/context/SidebarContext";

export default function Home() {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar />
        <ChatContainer />
      </div>
    </SidebarProvider>
  );
}
