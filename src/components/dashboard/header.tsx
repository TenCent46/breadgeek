"use client";

import { usePathname } from "next/navigation";
import {
  PanelLeftClose,
  PanelLeftOpen,
  HelpCircle,
  MessageSquare,
  Bell,
} from "lucide-react";
import Link from "next/link";

const BREADCRUMB_MAP: Record<string, string> = {
  "/dashboard": "ホーム",
  "/dashboard/services": "レッスン一覧",
  "/dashboard/services/new": "新規レッスン作成",
  "/dashboard/bookings": "予約・スケジュール",
  "/dashboard/reviews": "感想レポート",
  "/dashboard/customers": "生徒一覧",
  "/dashboard/customers/contacts": "コンタクトリスト",
  "/dashboard/customers/messages": "メッセージ",
  "/dashboard/recipes": "レシピ管理",
  "/dashboard/recipes/new": "新規レシピ作成",
  "/dashboard/ingredients": "材料・在庫",
  "/dashboard/profit": "利益シミュレーション",
  "/dashboard/analytics": "稼働率・リピート分析",
  "/dashboard/sales": "売上履歴",
  "/dashboard/profile/link": "プロフィールリンク",
  "/dashboard/profile/edit": "プロフィール編集",
  "/dashboard/settings": "設定",
};

export function Header({
  sidebarOpen,
  onToggleSidebar,
}: {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}) {
  const pathname = usePathname();
  const currentPage = BREADCRUMB_MAP[pathname] || "";

  return (
    <header className="h-14 bg-white border-b border-border-light flex items-center justify-between px-4 shrink-0">
      {/* Left: sidebar toggle + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg hover:bg-bg-secondary transition-colors text-text-secondary shrink-0"
        >
          {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm whitespace-nowrap">
          <Link href="/dashboard" className="text-accent hover:underline">
            ホーム
          </Link>
          {currentPage && pathname !== "/dashboard" && (
            <>
              <span className="text-text-tertiary">＞</span>
              <span className="text-text-secondary truncate">{currentPage}</span>
            </>
          )}
        </nav>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button className="p-2 rounded-lg hover:bg-bg-secondary transition-colors text-text-secondary">
          <HelpCircle size={20} />
        </button>
        <button className="p-2 rounded-lg hover:bg-bg-secondary transition-colors text-text-secondary">
          <MessageSquare size={20} />
        </button>
        <button className="p-2 rounded-lg hover:bg-bg-secondary transition-colors text-text-secondary relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
        </button>

        {/* User avatar */}
        <button className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center ml-1">
          <span className="text-accent text-sm font-medium">P</span>
        </button>
      </div>
    </header>
  );
}
