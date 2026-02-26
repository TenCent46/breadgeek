"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { ChatSupport } from "@/components/dashboard/chat-support";
import { DashboardProvider } from "@/lib/dashboard-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <DashboardProvider>
      <div className="flex h-screen overflow-hidden bg-bg-secondary">
        {/* Sidebar */}
        {sidebarOpen && <Sidebar />}

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>

        {/* Chat support */}
        <ChatSupport />
      </div>
    </DashboardProvider>
  );
}
