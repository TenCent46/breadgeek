"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  HelpCircle,
  MessageSquare,
  Bell,
  ExternalLink,
  LogOut,
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
  schoolSlug,
  userName,
}: {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  schoolSlug: string;
  userName: string;
}) {
  const pathname = usePathname();
  const currentPage = BREADCRUMB_MAP[pathname] || "";
  const [showUserMenu, setShowUserMenu] = useState(false);
  const initial = userName.charAt(0).toUpperCase();

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
        <Link
          href={`/p/${schoolSlug}`}
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-accent bg-accent/10 hover:bg-accent/20 transition-colors"
        >
          <ExternalLink size={14} />
          教室ページを見る
        </Link>
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

        {/* User avatar + dropdown */}
        <div className="relative ml-1">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center"
          >
            <span className="text-accent text-sm font-medium">{initial}</span>
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-10 z-50 w-48 bg-white border border-border rounded-lg shadow-lg py-1">
                <div className="px-3 py-2 border-b border-border-light">
                  <p className="text-sm font-medium text-text-primary truncate">{userName}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
                >
                  <LogOut size={16} />
                  ログアウト
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
