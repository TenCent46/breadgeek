"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import {
  Home,
  User,
  CalendarDays,
  Users,
  Wheat,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type NavSection = {
  title: string;
  icon: React.ReactNode;
  items: NavItem[];
  defaultOpen?: boolean;
};

type NavItem = {
  label: string;
  href: string;
};

const navSections: NavSection[] = [
  {
    title: "レッスン管理",
    icon: <CalendarDays size={18} />,
    defaultOpen: true,
    items: [
      { label: "レッスン一覧", href: "/dashboard/services" },
      { label: "予約・スケジュール", href: "/dashboard/bookings" },
      { label: "感想レポート", href: "/dashboard/reviews" },
    ],
  },
  {
    title: "生徒管理",
    icon: <Users size={18} />,
    defaultOpen: true,
    items: [
      { label: "生徒一覧", href: "/dashboard/customers" },
      { label: "コンタクトリスト", href: "/dashboard/customers/contacts" },
      { label: "メッセージ", href: "/dashboard/customers/messages" },
    ],
  },
  {
    title: "レシピ・材料",
    icon: <Wheat size={18} />,
    defaultOpen: true,
    items: [
      { label: "レシピ管理", href: "/dashboard/recipes" },
      { label: "材料・在庫", href: "/dashboard/ingredients" },
    ],
  },
  {
    title: "収益分析",
    icon: <BarChart3 size={18} />,
    defaultOpen: true,
    items: [
      { label: "利益シミュレーション", href: "/dashboard/profit" },
      { label: "稼働率・リピート分析", href: "/dashboard/analytics" },
      { label: "売上履歴", href: "/dashboard/sales" },
    ],
  },
  {
    title: "プロフィール",
    icon: <User size={18} />,
    defaultOpen: false,
    items: [
      { label: "プロフィールリンク", href: "/dashboard/profile/link" },
      { label: "プロフィール編集", href: "/dashboard/profile/edit" },
    ],
  },
];

const bottomItems: NavItem[] = [
  { label: "設定", href: "/dashboard/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(navSections.map((s) => [s.title, s.defaultOpen ?? false]))
  );

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="w-[200px] min-w-[200px] bg-white border-r border-border-light h-screen flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="px-4 py-4 shrink-0">
        <Logo size="small" />
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {/* Home */}
        <Link
          href="/dashboard"
          className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 mb-1 ${
            isActive("/dashboard")
              ? "bg-accent/8 font-medium text-accent"
              : "text-text-secondary hover:bg-bg-secondary/60"
          }`}
        >
          {isActive("/dashboard") && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-accent rounded-full sidebar-indicator" />
          )}
          <Home size={18} />
          ホーム
        </Link>

        {/* Sections */}
        {navSections.map((section) => (
          <div key={section.title} className="mt-1">
            {/* Section header */}
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-text-primary hover:bg-bg-secondary/40 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2.5">
                {section.icon}
                <span className="font-medium">{section.title}</span>
              </div>
              {openSections[section.title] ? (
                <ChevronUp size={14} className="text-text-tertiary" />
              ) : (
                <ChevronDown size={14} className="text-text-tertiary" />
              )}
            </button>

            {/* Section items */}
            {openSections[section.title] && (
              <div className="ml-4 mt-0.5">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      isActive(item.href)
                        ? "bg-accent/8 font-medium text-accent"
                        : "text-text-secondary hover:bg-bg-secondary/60"
                    }`}
                  >
                    {isActive(item.href) && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-accent rounded-full sidebar-indicator" />
                    )}
                    <span className="leading-tight">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Bottom items */}
        <div className="mt-2 border-t border-border-light pt-2">
          {bottomItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(item.href)
                  ? "bg-bg-secondary font-medium text-text-primary"
                  : "text-text-secondary hover:bg-bg-secondary/60"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings size={18} />
                <span>{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}
