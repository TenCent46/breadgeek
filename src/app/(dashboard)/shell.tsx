"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { ChatSupport } from "@/components/dashboard/chat-support";

export function DashboardShell({
  children,
  schoolSlug,
  userName,
}: {
  children: React.ReactNode;
  schoolSlug: string;
  userName: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-bg-secondary">
      {sidebarOpen && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          schoolSlug={schoolSlug}
          userName={userName}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <ChatSupport />
    </div>
  );
}
